import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  publishReplay,
  refCount,
  startWith,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { CFAppState } from '../../../../cloud-foundry/src/cf-app-state';
import { organizationEntityType, spaceEntityType } from '../../../../cloud-foundry/src/cf-entity-types';
import { createEntityRelationKey } from '../../../../cloud-foundry/src/entity-relations/entity-relations.types';
import { safeUnsubscribe } from '../../../../core/src/core/utils.service';
import {
  ListPaginationMultiFilterChange,
} from '../../../../core/src/shared/components/list/data-sources-controllers/list-data-source-types';
import {
  valueOrCommonFalsy,
} from '../../../../core/src/shared/components/list/data-sources-controllers/list-pagination-controller';
import { ResetPagination, SetParams } from '../../../../store/src/actions/pagination.actions';
import { PaginationMonitorFactory } from '../../../../store/src/monitors/pagination-monitor.factory';
import { getPaginationObservables } from '../../../../store/src/reducers/pagination-reducer/pagination-reducer.helper';
import { getCurrentPageRequestInfo } from '../../../../store/src/reducers/pagination-reducer/pagination-reducer.types';
import { connectedEndpointsOfTypesSelector } from '../../../../store/src/selectors/endpoint.selectors';
import { APIResource } from '../../../../store/src/types/api.types';
import { EndpointModel } from '../../../../store/src/types/endpoint.types';
import { PaginatedAction, PaginationEntityState, PaginationParam } from '../../../../store/src/types/pagination.types';
import { IOrganization, ISpace } from '../../cf-api.types';
import { cfEntityCatalog } from '../../cf-entity-catalog';
import { cfEntityFactory } from '../../cf-entity-factory';
import { CF_ENDPOINT_TYPE } from '../../cf-types';
import { QParam, QParamJoiners } from '../q-param';

export function spreadPaginationParams(params: PaginationParam): PaginationParam {
  return {
    ...params
  };
}


export function createCfOrgSpaceFilterConfig(key: string, label: string, cfOrgSpaceItem: CfOrgSpaceItem) {
  return {
    key,
    label,
    ...cfOrgSpaceItem,
    list$: cfOrgSpaceItem.list$.pipe(map((entities: any[]) => {
      return entities.map(entity => ({
        label: entity.name,
        item: entity,
        value: entity.guid
      }));
    })),
  };
}

export interface CfOrgSpaceItem<T = any> {
  list$: Observable<T[]>;
  loading$: Observable<boolean>;
  // A lot of problems are caused by these being BehaviourSubject's (specifically auto select process in CfOrgSpaceDataService and sticky
  // values). Ideally this would change to Subject... but some usages <behaviour subject>.value
  select: BehaviorSubject<string>;
}

export const enum CfOrgSpaceSelectMode {
  /**
   * When a parent selection changes and it contains only one child automatically select it, otherwise clear child selection
   */
  FIRST_ONLY = 1,
  /**
   * When a parent selection changes and it contains any children automatically select the first one, otherwise clear child selection
   */
  ANY = 2
}

export const createCfOrSpaceMultipleFilterFn = (
  store: Store<CFAppState>,
  action: PaginatedAction,
  setQParam: (setQ: QParam, qs: QParam[]) => boolean,
  preResetUpdate?: () => void
) => {
  return (changes: ListPaginationMultiFilterChange[], params: PaginationParam) => {
    if (!changes.length) {
      return;
    }
    const qParamStrings = (params.q || []) as string[];
    const qParamObject = QParam.fromStrings(qParamStrings);

    const startingCfGuid = valueOrCommonFalsy(action.endpointGuid);
    const startingOrgGuid = valueOrCommonFalsy(qParamObject.find((q: QParam) => q.key === 'organization_guid'), {}).value;
    const startingSpaceGuid = valueOrCommonFalsy(qParamObject.find((q: QParam) => q.key === 'space_guid'), {}).value;

    const qChanges = changes.reduce((qs: QParam[], change) => {
      switch (change.key) {
        case 'cf':
          action.endpointGuid = change.value;
          setQParam(new QParam('organization_guid', '', QParamJoiners.in), qs);
          setQParam(new QParam('space_guid', '', QParamJoiners.in), qs);
          break;
        case 'org':
          setQParam(new QParam('organization_guid', change.value, QParamJoiners.in), qs);
          break;
        case 'space':
          setQParam(new QParam('space_guid', change.value, QParamJoiners.in), qs);
          break;
      }
      return qs;
    }, qParamObject);

    const cfGuidChanged = startingCfGuid !== valueOrCommonFalsy(action.endpointGuid);
    const orgChanged = startingOrgGuid !== valueOrCommonFalsy(qChanges.find((q: QParam) => q.key === 'organization_guid'), {}).value;
    const spaceChanged = startingSpaceGuid !== valueOrCommonFalsy(qChanges.find((q: QParam) => q.key === 'space_guid'), {}).value;

    if (preResetUpdate) {
      preResetUpdate();
    }

    // Changes of org or space will reset pagination and start a new request. Changes of only cf require a punt
    if (cfGuidChanged && !orgChanged && !spaceChanged) {
      store.dispatch(new ResetPagination(action, action.paginationKey));
    } else if (orgChanged || spaceChanged) {
      const newParams = spreadPaginationParams(params);
      newParams.q = qChanges.map(qChange => qChange.toString());
      store.dispatch(new SetParams(action, action.paginationKey, newParams, true, true));
    }
  };
};

interface InitialValues { cf: string; org: string; space: string; }

/**
 * This service relies on OnDestroy, so must be `provided` by a component
 */
@Injectable()
export class CfOrgSpaceDataService implements OnDestroy {

  private static CfOrgSpaceServicePaginationKey = 'endpointOrgSpaceService';

  public cf: CfOrgSpaceItem<EndpointModel>;
  public org: CfOrgSpaceItem<IOrganization>;
  public space: CfOrgSpaceItem<ISpace>;
  public isLoading$: Observable<boolean>;

  public paginationAction = this.createOrgPaginationAction();

  /**
   * This will contain all org and space data
   */
  private allOrgs = this.getAllOrgsObservable();

  private allOrgsLoading$ = this.allOrgs.pagination$.pipe(map(
    pag => getCurrentPageRequestInfo(pag).busy
  ));

  private selectMode = CfOrgSpaceSelectMode.FIRST_ONLY;
  private subs: Subscription[] = [];

  /*
   * Observable that provides initial values for drop downs, output will be parsed through initialValuesMap before emitted on first
   */
  public initialValues$: Observable<any>;
  /**
   * Map values from `initialValues$` to supply initial values for drop downs
   */
  public initialValuesMap: (param: any) => InitialValues;

  constructor(
    private store: Store<CFAppState>,
    public paginationMonitorFactory: PaginationMonitorFactory,
  ) {
    this.createCf();
    this.createOrg();
    this.createSpace();

    this.isLoading$ = combineLatest(
      this.cf.loading$,
      this.org.loading$,
      this.space.loading$
    ).pipe(
      map(([cfLoading, orgLoading, spaceLoading]) => cfLoading || orgLoading || spaceLoading)
    );

  }

  private getAllOrgsObservable() {
    return getPaginationObservables<APIResource<IOrganization>>({
      store: this.store,
      action: this.paginationAction,
      paginationMonitor: this.paginationMonitorFactory.create(
        this.paginationAction.paginationKey,
        cfEntityFactory(this.paginationAction.entityType),
        this.paginationAction.flattenPagination
      )
    }, this.paginationAction.flattenPagination);
  }

  private createCf() {
    const list$ = this.store.select(connectedEndpointsOfTypesSelector(CF_ENDPOINT_TYPE)).pipe(
      // Ensure we have endpoints
      filter(endpoints => endpoints && !!Object.keys(endpoints).length),
      publishReplay(1),
      refCount(),
    );
    this.cf = {
      list$: list$.pipe(
        // Filter out non-cf endpoints
        map(endpoints => Object.values(endpoints).filter(e => e.cnsi_type === 'cf')),
        // Ensure we have at least one connected cf
        filter(cfs => {
          for (const cf of cfs) {
            if (cf.connectionStatus === 'connected') {
              return true;
            }
          }
          return false;
        }),
        first(),
        map((endpoints: EndpointModel[]) => {
          return Object.values(endpoints).sort((a: EndpointModel, b: EndpointModel) => a.name.localeCompare(b.name));
        }),
      ),
      loading$: list$.pipe(
        map(cfs => !cfs)
      ),
      select: new BehaviorSubject(null) // Should be different to undefined (sticky values & reset list)
    };
  }

  private createOrg() {
    const orgList$ = combineLatest(
      this.cf.select.asObservable(),
      this.allOrgs.entities$
    ).pipe(map(([selectedCF, entities]) => {
      if (selectedCF && entities) {
        return entities
          .map(org => org.entity)
          .filter(org => org.cfGuid === selectedCF)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
      return [];
    }));

    this.org = {
      list$: orgList$,
      loading$: this.allOrgsLoading$,
      select: new BehaviorSubject(null) // Should be different to undefined (sticky values & reset list)
    };
  }

  private createSpace() {
    const spaceList$ = combineLatest(
      this.org.select.asObservable(),
      this.allOrgs.entities$
    ).pipe(
      map(([selectedOrgGuid, orgs]) => {
        const selectedOrg = orgs.find(org => {
          return org.metadata.guid === selectedOrgGuid;
        });
        if (selectedOrg && selectedOrg.entity && selectedOrg.entity.spaces) {
          return selectedOrg.entity.spaces.map(space => {
            const entity = { ...space.entity };
            entity.guid = space.metadata.guid;
            return entity;
          }).sort((a, b) => a.name.localeCompare(b.name));
        }
        return [];
      })
    );

    this.space = {
      list$: spaceList$,
      loading$: this.org.loading$,
      select: new BehaviorSubject(null) // Should be different to undefined (sticky values & reset list)
    };
  }

  private createOrgPaginationAction() {
    // @ts-ignore
    return cfEntityCatalog.org.actions.getMultiple(null, CfOrgSpaceDataService.CfOrgSpaceServicePaginationKey, {
      includeRelations: [
        createEntityRelationKey(organizationEntityType, spaceEntityType),
      ],
      populateMissing: true
    });
  }

  public getEndpointOrgs(endpointGuid: string) {
    return this.allOrgs.entities$.pipe(
      map(orgs => {
        return orgs.filter(o => o.entity.cfGuid === endpointGuid);
      })
    );
  }

  public setInitialValuesFromAction(
    paginatedAction: PaginatedAction,
    cfKey: string,
    orgKey: string,
    spaceKey: string,
  ) {
    this.initialValuesMap = (p: PaginationEntityState) => ({
      cf: p.clientPagination?.filter?.items[cfKey],
      org: p.clientPagination?.filter?.items[orgKey],
      space: p.clientPagination?.filter?.items[spaceKey]
    });
    this.initialValues$ = this.paginationMonitorFactory.create(
      paginatedAction.paginationKey,
      cfEntityFactory(paginatedAction.entityType),
      paginatedAction.flattenPagination
    ).pagination$.pipe(
      filter(p => !!p?.clientPagination?.filter),
    );
  }

  private getInitialValues(): Observable<InitialValues> {
    const initialValues$ = this.initialValues$ || of({ cf: undefined, org: undefined, space: undefined });
    const defaultMap = (a: any) => a;
    const initialValuesMap = this.initialValuesMap || defaultMap;
    return initialValues$.pipe(
      first(),
      map(initialValuesMap) // Map needs to happen at the point the auto selectors are enabled
    );
  }

  public enableAutoSelectors() {
    combineLatest(
      // Start watching the cf/org/space plus automatically setting values only when we actually have values to auto select
      this.org.list$,
      // Get initial values only after we've given a prod... so first values emitted are the one's we want
      this.getInitialValues(),
    ).pipe(first()).subscribe(([, initialValues]) => {
      this.setupAutoSelectors(initialValues.cf, initialValues.org);
    });
  }

  private setupAutoSelectors(initialCf: string, initialOrg: string) {
    // Clear or automatically select org + space given cf
    let cfTapped = false;
    const orgResetSub = this.cf.select.asObservable().pipe(
      startWith(initialCf),
      distinctUntilChanged(),
      filter(cf => cfTapped || cf !== initialCf),
      withLatestFrom(this.org.list$),
      tap(([selectedCF, orgs]) => {
        cfTapped = true;
        if (
          !!orgs.length &&
          ((this.selectMode === CfOrgSpaceSelectMode.FIRST_ONLY && orgs.length === 1) ||
            (this.selectMode === CfOrgSpaceSelectMode.ANY))
        ) {
          this.selectSet(this.org.select, orgs[0].guid);
        } else {
          this.selectSet(this.org.select, undefined);
          this.selectSet(this.space.select, undefined);
        }
      }),
    ).subscribe();
    this.subs.push(orgResetSub);

    // Clear or automatically select space given org
    let orgTapped = false;
    const spaceResetSub = this.org.select.asObservable().pipe(
      startWith(initialOrg),
      distinctUntilChanged(),
      filter(org => orgTapped || org !== initialOrg),
      withLatestFrom(this.space.list$),
      tap(([selectedOrg, spaces]) => {
        orgTapped = true;
        if (
          !!spaces.length &&
          ((this.selectMode === CfOrgSpaceSelectMode.FIRST_ONLY && spaces.length === 1) ||
            (this.selectMode === CfOrgSpaceSelectMode.ANY))
        ) {
          this.selectSet(this.space.select, spaces[0].guid);
        } else {
          this.selectSet(this.space.select, undefined);
        }
      })
    ).subscribe();
    this.subs.push(spaceResetSub);
  }

  private selectSet(select: BehaviorSubject<string>, newValue: string) {
    if (select.getValue() !== newValue) {
      select.next(newValue);
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy() {
    // OnDestroy will be called when the component the service is provided at is destroyed. In theory this should not need to be called
    // separately, if you see error's first ensure the service is provided at a component that will be destroyed
    // Should be called in the OnDestroy of the component where it's provided
    safeUnsubscribe(...this.subs);
  }
}
