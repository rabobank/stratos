import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, first, map, pairwise, tap } from 'rxjs/operators';

import { ApiKey } from '../../../../../store/src/apiKey.types';
import { entityCatalog } from '../../../../../store/src/entity-catalog/entity-catalog';
import { RequestInfoState } from '../../../../../store/src/reducers/api-request-reducer/types';
import { stratosEntityCatalog } from '../../../../../store/src/stratos-entity-catalog';
import { NormalizedResponse } from '../../../../../store/src/types/api.types';
import { safeUnsubscribe } from '../../../core/utils.service';

@Component({
  selector: 'app-add-api-key-dialog',
  templateUrl: './add-api-key-dialog.component.html',
  styleUrls: ['./add-api-key-dialog.component.scss']
})
export class AddApiKeyDialogComponent implements OnDestroy {

  private hasErrored = new BehaviorSubject(null);
  public hasErrored$ = this.hasErrored.asObservable();
  private isBusy = new BehaviorSubject(false);
  public isBusy$ = this.isBusy.asObservable();

  private sub: Subscription;

  public formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ApiKey>,
  ) {
    this.formGroup = this.fb.group({
      comment: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    safeUnsubscribe(this.sub);
  }

  submit() {
    // @ts-ignore
    this.sub = stratosEntityCatalog.apiKey.api.create<RequestInfoState>(this.formGroup.controls.comment.value).pipe(
      tap(() => {
        this.isBusy.next(true);
        this.hasErrored.next(null);
      }),
      pairwise(),
      filter(([oldR, newR]) => oldR.creating && !newR.creating),
      map(([, newR]) => newR),
      tap(state => {
        // @ts-ignore
        if (state.error) {
          // @ts-ignore
          this.hasErrored.next(`Failed to create key: ${state.message}`);
          this.isBusy.next(false);
        } else {
          // @ts-ignore
          const response: NormalizedResponse<ApiKey> = state.response;
          // @ts-ignore
          const entityKey = entityCatalog.getEntityKey(stratosEntityCatalog.apiKey.actions.create(''));
          this.dialogRef.close(response.entities[entityKey][response.result[0]]);
        }
      }),
      first()
    ).subscribe();
  }

}
