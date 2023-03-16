import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { safeUnsubscribe } from '../../../../../../core/src/core/utils.service';
import { AppState } from '../../../../../../store/src/app-state';
import { selectDashboardState } from '../../../../../../store/src/selectors/dashboard.selectors';
import { cfEntityCatalog } from '../../../../cf-entity-catalog';
import { ApplicationService } from '../../application.service';

@Injectable()
export class ApplicationPollingService {

  private pollingSub: Subscription;
  private autoRefreshString = 'auto-refresh';

  public isPolling$ = this.applicationService.entityService.updatingSection$.pipe(map(
    update => update[this.autoRefreshString] && update[this.autoRefreshString].busy
  ));

  public isEnabled$: Observable<boolean>;

  constructor(
    public applicationService: ApplicationService,
    private store: Store<AppState>,
    private ngZone: NgZone,
  ) {
    this.isEnabled$ = this.store.select(selectDashboardState).pipe(
      map(dashboardState => dashboardState.pollingEnabled)
    );

    // Update initial started/stopped state
    this.isEnabled$.pipe(first()).subscribe(enabled => this.updateEnabled(enabled));
  }

  public updateEnabled(enable: boolean) {
    if (enable) {
      this.start();
    } else {
      this.stop();
    }
  }

  public start() {
    if (this.pollingSub && !this.pollingSub.closed) {
      return;
    }

    // Auto refresh
    this.ngZone.runOutsideAngular(() => {
      this.pollingSub = this.applicationService.entityService
        .poll(10000, this.autoRefreshString).pipe(
          tap(() => this.ngZone.run(() => this.poll(false))))
        .subscribe();
    });
  }

  public stop() {
    safeUnsubscribe(this.pollingSub);
  }

  public poll(withApp = false) {
    const { cfGuid, appGuid } = this.applicationService;
    if (withApp) {
      const updatingApp = {
        ...this.applicationService.entityService.action,
        updatingKey: this.autoRefreshString
      };
      this.store.dispatch(updatingApp);
    }
    this.applicationService.entityService.entityObs$.pipe(
      first(),
    ).subscribe(resource => {
      // @ts-ignore
      cfEntityCatalog.appSummary.api.get(appGuid, cfGuid);
      if (resource && resource.entity && resource.entity.entity && resource.entity.entity.state === 'STARTED') {
        // @ts-ignore
        cfEntityCatalog.appStats.api.getMultiple(appGuid, cfGuid);
      }
    });
  }
}
