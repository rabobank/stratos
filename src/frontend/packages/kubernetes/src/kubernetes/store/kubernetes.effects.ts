import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { ClearPaginationOfEntity, ClearPaginationOfType } from 'frontend/packages/store/src/actions/pagination.actions';
import { ApiRequestTypes } from 'frontend/packages/store/src/reducers/api-request-reducer/request-helpers';
import { connectedEndpointsOfTypesSelector } from 'frontend/packages/store/src/selectors/endpoint.selectors';
import { of } from 'rxjs';
import { catchError, first, flatMap, map, mergeMap, switchMap } from 'rxjs/operators';

import { environment } from '../../../../core/src/environments/environment';
import { isJetstreamError } from '../../../../store/src/jetstream';
import { AppState, entityCatalog, NormalizedResponse, WrapperRequestActionSuccess } from '../../../../store/src/public-api';
import { StartRequestAction, WrapperRequestActionFailed } from '../../../../store/src/types/request.types';
import {
  KUBERNETES_ENDPOINT_TYPE,
  kubernetesDashboardEntityType,
  kubernetesPodsEntityType,
} from '../kubernetes-entity-factory';
import { KubernetesPodExpandedStatusHelper } from '../services/kubernetes-expanded-state';
import {
  DELETE_KUBE_RESOURCE,
  DeleteKubernetesResource,
  GET_KUBE_RESOURCES,
  GET_KUBE_RESOURCES_IN_NAMESPACE,
  GetKubernetesResources,
  GetKubernetesResourcesInNamespace,
} from './kube-resource.actions';
import {
  BasicKubeAPIResource,
  IKubeResourceEntityDefinition,
  KubeAPIResource,
  KubernetesDeployment,
  KubernetesNamespace,
  KubernetesNode,
  KubernetesPod,
  KubernetesStatefulSet,
  KubeService,
} from './kube.types';
import {
  CREATE_NAMESPACE,
  CreateKubernetesNamespace,
  GeKubernetesDeployments,
  GET_KUBE_DASHBOARD,
  GET_KUBE_DEPLOYMENT,
  GET_KUBE_POD,
  GET_KUBE_STATEFULSETS,
  GET_NAMESPACE_INFO,
  GET_NAMESPACES_INFO,
  GET_NODE_INFO,
  GET_NODES_INFO,
  GET_POD_INFO,
  GET_PODS_IN_NAMESPACE_INFO,
  GET_PODS_ON_NODE_INFO,
  GET_SERVICE_INFO,
  GET_SERVICES_IN_NAMESPACE_INFO,
  GetKubernetesDashboard,
  GetKubernetesNamespace,
  GetKubernetesNamespaces,
  GetKubernetesNode,
  GetKubernetesNodes,
  GetKubernetesPod,
  GetKubernetesPods,
  GetKubernetesPodsInNamespace,
  GetKubernetesPodsOnNode,
  GetKubernetesServices,
  GetKubernetesServicesInNamespace,
  GetKubernetesStatefulSets,
  KubeAction,
  KubePaginationAction,
} from './kubernetes.actions';

export interface KubeDashboardContainer {
  name: string;
  image: string;
}

export interface KubeDashboardStatus {
  guid: string;
  kubeGuid: string;
  metadata?: {
    kubeId: string;
  };
  installed: boolean;
  stratosInstalled: boolean;
  running: boolean;
  pod: {
    spec: {
      containers: KubeDashboardContainer[];
    };
  };
  version: string;
  service: {
    namespace: string;
    name: string;
    scheme: string;
  };
  serviceAccount: any;
}

@Injectable()
export class KubernetesEffects {
  proxyAPIVersion = environment.proxyAPIVersion;

  constructor(private http: HttpClient, private actions$: Actions, private store: Store<AppState>) { }

  // @Effect()
  fetchDashboardInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesDashboard>(GET_KUBE_DASHBOARD),
    flatMap(action => {
      this.store.dispatch(new StartRequestAction(action));
      const headers = new HttpHeaders({});
      const requestArgs = {
        headers
      };
      const url = `/pp/${this.proxyAPIVersion}/kubedash/${action.kubeGuid}/status`;
      const dashboardEntityConfig = entityCatalog.getEntity(KUBERNETES_ENDPOINT_TYPE, kubernetesDashboardEntityType);
      return this.http
        .get(url, requestArgs)
        .pipe(mergeMap(response => {
          const result = {
            entities: { [dashboardEntityConfig.entityKey]: {} },
            result: []
          } as NormalizedResponse;
          const status = response as KubeDashboardStatus;
          status.kubeGuid = action.kubeGuid;
          status.metadata = {
            kubeId: action.kubeGuid
          };
          result.entities[dashboardEntityConfig.entityKey][action.guid] = status;
          result.result.push(action.guid);
          return [
            new WrapperRequestActionSuccess(result, action)
          ];
        }), catchError(error => [
          new WrapperRequestActionFailed(error.message, action, 'fetch', {
            endpointIds: [action.kubeGuid],
            url: error.url || url,
            eventCode: error.status ? error.status + '' : '500',
            message: 'Kubernetes Dashboard request error',
            error
          })
        ]));
    })
  ));

  // @Effect()
  fetchNodesInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesNodes>(GET_NODES_INFO),
    flatMap(action => this.processNodeAction(action))
  ));

  // @Effect()
  fetchNodeInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesNode>(GET_NODE_INFO),
    flatMap(action => this.processSingleItemAction<KubernetesNode>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/nodes/${action.nodeName}`
    ))
  ));

  // @Effect()
  fetchNamespaceInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesNamespace>(GET_NAMESPACE_INFO),
    flatMap(action => this.processSingleItemAction<KubernetesNamespace>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/namespaces/${action.namespaceName}`)
    )
  ));

  // @Effect()
  fetchPodsInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesPods>(GET_POD_INFO),
    flatMap(action => this.processListAction<KubernetesPod>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/pods`
    ))
  ));

  // @Effect()
  fetchPodsOnNodeInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesPodsOnNode>(GET_PODS_ON_NODE_INFO),
    flatMap(action =>
      this.processListAction<KubernetesPod>(
        action,
        `/pp/${this.proxyAPIVersion}/proxy/api/v1/pods`,
        // Note - filtering done via param in action
      )
    )
  ));

  // @Effect()
  fetchPodsInNamespaceInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesPodsInNamespace>(GET_PODS_IN_NAMESPACE_INFO),
    flatMap(action => this.processListAction<KubernetesPod>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/namespaces/${action.namespaceName}/pods`,
    ))
  ));

  // @Effect()
  fetchServicesInNamespaceInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesServicesInNamespace>(GET_SERVICES_IN_NAMESPACE_INFO),
    flatMap(action => this.processListAction<KubeService>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/namespaces/${action.namespaceName}/services`,
    ))
  ));

  // @Effect()
  fetchPodInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesPod>(GET_KUBE_POD),
    flatMap(action => this.processSingleItemAction<KubernetesPod>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/namespaces/${action.namespaceName}/pods/${action.podName}`,
    ))
  ));

  // @Effect()
  fetchServicesInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesServices>(GET_SERVICE_INFO),
    flatMap(action => this.processListAction<KubeService>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/services`,
    ))
  ));

  // @Effect()
  fetchNamespacesInfo$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesNamespaces>(GET_NAMESPACES_INFO),
    flatMap(action => this.processListAction<KubernetesNamespace>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/namespaces`,
    ))
  ));


  // @Effect()
  createNamespace$ = createEffect(() => this.actions$.pipe(
    ofType<CreateKubernetesNamespace>(CREATE_NAMESPACE),
    flatMap(action => this.processSingleItemAction<KubernetesNamespace>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/namespaces`,
      {
        kind: 'Namespace',
        apiVersion: 'v1',
        metadata: {
          name: action.namespaceName,
        },
      }
    )
    )
  ));

  // @Effect()
  fetchStatefulSets$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesStatefulSets>(GET_KUBE_STATEFULSETS),
    flatMap(action => this.processListAction<KubernetesStatefulSet>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/apis/apps/v1/statefulsets`,
    ))
  ));

  // @Effect()
  fetchDeployments$ = createEffect(() => this.actions$.pipe(
    ofType<GeKubernetesDeployments>(GET_KUBE_DEPLOYMENT),
    flatMap(action => this.processListAction<KubernetesDeployment>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/apis/apps/v1/deployments`,
    ))
  ));

  // =======================================================================================
  // Generic resource effects
  // =======================================================================================

  // @Effect()
  fetchKubeResources$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesResources>(GET_KUBE_RESOURCES),
    flatMap((action: GetKubernetesResources) => {
      const catalog = entityCatalog.getEntity(action.endpointType, action.entityType);
      if (catalog && catalog.definition) {
        const defn = catalog.definition as IKubeResourceEntityDefinition;
        if (defn.apiVersion && defn.apiName) {
          return this.processListAction<KubeAPIResource>(
            action,
            `/pp/${this.proxyAPIVersion}/proxy/${defn.apiVersion}/${defn.apiName}`
          );
        }
      }

      throw new Error('Kubernetes Resource request - but no API information is available');
    })
  ));

  // @Effect()
  fetchKubeResourcesInNamespace$ = createEffect(() => this.actions$.pipe(
    ofType<GetKubernetesResources>(GET_KUBE_RESOURCES_IN_NAMESPACE),
    flatMap((action: GetKubernetesResourcesInNamespace) => {
      const catalog = entityCatalog.getEntity(action.endpointType, action.entityType);
      if (catalog && catalog.definition) {
        const defn = catalog.definition as IKubeResourceEntityDefinition;
        if (defn.apiVersion && defn.apiName) {
          return this.processListAction<KubeAPIResource>(
            action,
            `/pp/${this.proxyAPIVersion}/proxy/${defn.apiVersion}/namespaces/${action.namespaceName}/${defn.apiName}`
          );
        }
      }

      throw new Error('Kubernetes Resource request - but no API information is available');
    })
  ));

  // =======================================================================================

  // @Effect()
  deleteKubeResource$ = createEffect(() => this.actions$.pipe(
    ofType<DeleteKubernetesResource>(DELETE_KUBE_RESOURCE),
    flatMap(action => {
      const catalog = entityCatalog.getEntity(action.endpointType, action.entityType);
      if (catalog && catalog.definition) {
        const defn = catalog.definition as IKubeResourceEntityDefinition;
        if (defn.apiVersion && defn.apiName) {
          let apiURL;
          if (action.namespace) {
            apiURL = `/pp/${this.proxyAPIVersion}/proxy${defn.apiVersion}/namespaces/${action.namespace}/${defn.apiName}/${action.name}`;
          } else {
            apiURL = `/pp/${this.proxyAPIVersion}/proxy${defn.apiVersion}/${defn.apiName}/${action.name}`;
          }
          return this.processSingleItemDeleteAction<KubeAPIResource>(action, apiURL);
        }
      }
    })
  ));

  // =======================================================================================

  private processNodeAction(action: GetKubernetesNodes) {
    return this.processListAction<KubernetesNode>(
      action,
      `/pp/${this.proxyAPIVersion}/proxy/api/v1/nodes`
    );
  }

  private processListAction<T extends BasicKubeAPIResource>(
    action: KubePaginationAction,
    url: string) {
    this.store.dispatch(new StartRequestAction(action));

    let limit = `${url}?limit=500`;
    if (action.continuationToken) {
      limit = `${limit}&continue=${action.continuationToken}`;
    }

    const getKubeIds = action.kubeGuid ?
      of([action.kubeGuid]) :
      this.store.select(connectedEndpointsOfTypesSelector(KUBERNETES_ENDPOINT_TYPE)).pipe(
        first(),
        map(endpoints => Object.values(endpoints).map(endpoint => endpoint.guid))
      );
    let pKubeIds: string[];

    const entityKey = entityCatalog.getEntityKey(action);
    return getKubeIds.pipe(
      switchMap(kubeIds => {
        pKubeIds = kubeIds;
        const headers = new HttpHeaders({ 'x-cap-cnsi-list': pKubeIds });
        const requestArgs = {
          headers,
          params: null
        };
        const paginationAction = action as KubePaginationAction;
        if (paginationAction.initialParams) {
          requestArgs.params = Object.keys(paginationAction.initialParams).reduce((httpParams, initialKey: string) => {
            return httpParams.set(initialKey, paginationAction.initialParams[initialKey].toString());
          }, new HttpParams());
        }
        return this.http.get(limit, requestArgs);
      }),
      mergeMap(allRes => {
        const base = {
          entities: { [entityKey]: {} },
          result: []
        } as NormalizedResponse;

        const items: Array<T> = Object.entries(allRes).reduce((combinedRes, [kubeId, res]) => {
          if (!res.items) {
            // The request to this endpoint has failed. Note - throwing this hides any other failures,
            // however we follow the same approach elsewhere
            throw res;
          }
          res.items.forEach(item => {
            item.metadata.kubeId = kubeId;
            combinedRes.push(item);
          });
          return combinedRes;
        }, []);
        const processesData = items
          .reduce((res, data) => {
            const id = action.entity[0].getId(data);
            const updatedData = action.entityType === kubernetesPodsEntityType ?
              KubernetesPodExpandedStatusHelper.updatePodWithExpandedStatus(data as unknown as KubernetesPod) :
              data;
            res.entities[entityKey][id] = updatedData;
            res.result.push(id);
            return res;
          }, base);

        // Can we de-paginate like this? (Note: We only really support a single endpoint)
        // Object.entries(allRes).forEach(([kubeId, res]) => {
        //   console.log(res);
        //   if (res.metadata.continue) {
        //     console.log('continue for ' + kubeId);
        //     action.continuationToken = res.metadata.continue;

        //     const nextPageAction = {...action};
        //     nextPageAction.continuationToken = res.metadata.continue;
        //     nextPageAction.pageNumber = action.pageNumber ? action.pageNumber + 1 : 2;
        //     this.store.dispatch(nextPageAction);
        //   }
        // });

        return [
          new WrapperRequestActionSuccess(processesData, action)
        ];
      }),
      catchError(error => {
        const { status, message } = this.createKubeError(error);
        return [
          new WrapperRequestActionFailed(message, action, 'fetch', {
            endpointIds: pKubeIds,
            url: error.url || url,
            eventCode: status,
            message,
            error,
          })
        ];
      })
    );
  }

  private processSingleItemAction<T extends BasicKubeAPIResource>(
    action: KubeAction,
    url: string,
    body?: any) {
    const requestType: ApiRequestTypes = body ? 'create' : 'fetch';
    this.store.dispatch(new StartRequestAction(action, requestType));
    const headers = new HttpHeaders({
      'x-cap-cnsi-list': action.kubeGuid,
      'x-cap-passthrough': 'true'
    },
    );
    const requestArgs = {
      headers
    };
    const request = body ? this.http.post(url, body, requestArgs) : this.http.get(url, requestArgs);
    const entityKey = entityCatalog.getEntityKey(action);
    return request
      .pipe(
        mergeMap((response: T) => {
          const res = {
            entities: { [entityKey]: {} },
            result: []
          } as NormalizedResponse;
          const data = action.entityType === kubernetesPodsEntityType ?
            KubernetesPodExpandedStatusHelper.updatePodWithExpandedStatus(response as unknown as KubernetesPod) :
            response;
          res.entities[entityKey][action.guid] = data;
          res.result.push(action.guid);
          const actions: Action[] = [
            new WrapperRequestActionSuccess(res, action)
          ];
          if (requestType === 'create') {
            actions.push(new ClearPaginationOfType(action));
          }
          return actions;
        }),
        catchError(error => {
          const { status, message } = this.createKubeError(error);
          return [
            new WrapperRequestActionFailed(message, action, requestType, {
              endpointIds: [action.kubeGuid],
              url: error.url || url,
              eventCode: status,
              message,
              error
            })
          ];
        })
      );
  }

  private processSingleItemDeleteAction<T extends BasicKubeAPIResource>(action: KubeAction, url: string) {
    this.store.dispatch(new StartRequestAction(action, 'delete'));
    const headers = new HttpHeaders({
      'x-cap-cnsi-list': action.kubeGuid,
      'x-cap-passthrough': 'true'
    },
    );
    const requestArgs = {
      headers
    };
    const request = this.http.delete(url, requestArgs);
    const entityKey = entityCatalog.getEntityKey(action);
    return request
      .pipe(
        mergeMap((response: T) => {
          const res = {
            entities: { [entityKey]: {} },
            result: []
          } as NormalizedResponse;
          response.metadata.kubeId = action.kubeGuid;
          res.entities[entityKey][action.guid] = response;
          res.result.push(action.guid);
          const actions: Action[] = [
            new WrapperRequestActionSuccess(res, action)
          ];
          // actions.push(new ClearPaginationOfType(action));
          actions.push(new ClearPaginationOfEntity(action, action.guid));
          return actions;
        }),
        catchError(error => {
          const { status, message } = this.createKubeError(error);
          return [
            new WrapperRequestActionFailed(message, action, 'delete', {
              endpointIds: [action.kubeGuid],
              url: error.url || url,
              eventCode: status,
              message,
              error
            })
          ];
        })
      );
  }

  private createKubeErrorMessage(err: any): string {
    if (err) {
      if (err.error && err.error.message) {
        // Kube error
        return err.error.message;
      } else if (err.message) {
        // Http error
        return err.message;
      }
    }
    return 'Kubernetes API request error';
  }

  private createKubeError(err: any): { status: string, message: string, } {
    const jetstreamError = isJetstreamError(err);
    if (jetstreamError) {
      // Wrapped error
      return {
        status: jetstreamError.error.statusCode.toString(),
        message: this.createKubeErrorMessage(jetstreamError.errorResponse)
      };
    }
    return {
      status: err && err.status ? err.status + '' : '500',
      message: this.createKubeErrorMessage(err)
    };
  }
}
