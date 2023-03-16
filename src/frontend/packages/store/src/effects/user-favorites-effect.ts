import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, first, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';

import { EntityDeleteCompleteAction } from '../actions/entity.delete.actions';
import { ClearPaginationOfEntity } from '../actions/pagination.actions';
import {
  GetUserFavoritesAction,
  GetUserFavoritesFailedAction,
  GetUserFavoritesSuccessAction,
  RemoveUserFavoriteAction,
  RemoveUserFavoriteSuccessAction,
  SaveUserFavoriteAction,
  SaveUserFavoriteSuccessAction,
  ToggleUserFavoriteAction,
  UpdateUserFavoriteMetadataAction,
  UpdateUserFavoriteMetadataSuccessAction,
} from '../actions/user-favourites.actions';
import { InternalAppState } from '../app-state';
import { entityCatalog } from '../entity-catalog/entity-catalog';
import { proxyAPIVersion } from '../jetstream';
import { NormalizedResponse } from '../types/api.types';
import { StartRequestAction, WrapperRequestActionFailed, WrapperRequestActionSuccess } from '../types/request.types';
import { IFavoriteMetadata, UserFavorite, userFavoritesPaginationKey } from '../types/user-favorites.types';
import { UserFavoriteManager } from '../user-favorite-manager';
import { STRATOS_ENDPOINT_TYPE, userFavouritesEntityType } from './../helpers/stratos-entity-factory';

const favoriteUrlPath = `/pp/${proxyAPIVersion}/favorites`;

@Injectable()
export class UserFavoritesEffect {

  constructor(
    private http: HttpClient,
    private actions$: Actions,
    private store: Store<InternalAppState>,
    private userFavoriteManager: UserFavoriteManager
  ) {
  }

  // @Effect() saveFavorite = this.actions$.pipe(
  saveFavorite = createEffect( () => this.actions$.pipe(
    ofType<SaveUserFavoriteAction>(SaveUserFavoriteAction.ACTION_TYPE),
    mergeMap(action => {
      const actionType = 'update';
      this.store.dispatch(new StartRequestAction(action, actionType));
      return this.http.post<UserFavorite<IFavoriteMetadata>>(favoriteUrlPath, action.favorite.getPayload()).pipe(
        switchMap(newFavorite => {
          this.store.dispatch(new WrapperRequestActionSuccess(null, action, actionType));
          this.store.dispatch(new SaveUserFavoriteSuccessAction(newFavorite));
          return [];
        }),
        catchError(() => {
          this.store.dispatch(new WrapperRequestActionFailed('Failed to update user favorite', action, actionType));
          return [];
        })
      );
    })
  ));

  // @Effect({ dispatch: false }) getFavorite$ = this.actions$.pipe(
 getFavorite$ = createEffect(() => this.actions$.pipe(
    ofType<GetUserFavoritesAction>(GetUserFavoritesAction.ACTION_TYPE),
    switchMap((action: GetUserFavoritesAction) => {
      const favEntityKey = entityCatalog.getEntityKey(action);
      const actionType = 'fetch';
      this.store.dispatch(new StartRequestAction(action, actionType));
      return this.http.get<UserFavorite<IFavoriteMetadata>[]>(favoriteUrlPath).pipe(
        switchMap(favorites => {
          const mappedData = favorites.reduce<NormalizedResponse<UserFavorite<IFavoriteMetadata>>>((data, favorite) => {
            const { guid } = favorite;
            if (guid) {
              data.entities[favEntityKey][guid] = favorite;
              data.result.push(guid);
            }
            return data;
          }, { entities: { [favEntityKey]: {} }, result: [] });
          this.store.dispatch(new WrapperRequestActionSuccess(mappedData, action, actionType, mappedData.result.length, 1));
          this.store.dispatch(new GetUserFavoritesSuccessAction(favorites));
          return [];
        }),
        catchError(() => {
          this.store.dispatch(new GetUserFavoritesFailedAction());
          this.store.dispatch(new WrapperRequestActionFailed('Failed to fetch user favorites', action, actionType));
          return [];
        })
      );
    })
  ));

  // @Effect() toggleFavorite = this.actions$.pipe(
  toggleFavorite = createEffect( () => this.actions$.pipe(
    ofType<ToggleUserFavoriteAction>(ToggleUserFavoriteAction.ACTION_TYPE),
    mergeMap(action =>
      this.userFavoriteManager.getIsFavoriteObservable(action.favorite).pipe(
        first(),
        switchMap(isFav => {
          if (isFav) {
            return [new RemoveUserFavoriteAction(action.favorite)];
          } else {
            return [new SaveUserFavoriteAction(action.favorite)];
          }
        })
      )
    )
  ));

  // @Effect({ dispatch: false }) removeFavorite$ = this.actions$.pipe(
  removeFavorite$ = createEffect( () => this.actions$.pipe(
    ofType<RemoveUserFavoriteAction>(RemoveUserFavoriteAction.ACTION_TYPE),
    mergeMap((action: RemoveUserFavoriteAction) => {
      const actionType = 'update';
      this.store.dispatch(new StartRequestAction(action, actionType));
      return this.http.delete<UserFavorite<IFavoriteMetadata>>(`${favoriteUrlPath}/${action.guid}`).pipe(
        switchMap(() => {
          this.store.dispatch(new WrapperRequestActionSuccess(null, action));
          this.store.dispatch(new RemoveUserFavoriteSuccessAction(action.favorite));
          this.store.dispatch(new ClearPaginationOfEntity(action.entity[0], action.guid, userFavoritesPaginationKey));
          return [];
        }),
        catchError(() => {
          this.store.dispatch(new WrapperRequestActionFailed('Failed to remove user favorite', action, actionType));
          return [];
        })
      );
    })
  ));

  // @Effect() updateMetadata$ = this.actions$.pipe(
  updateMetadata$ = createEffect( () => this.actions$.pipe(
    ofType<UpdateUserFavoriteMetadataAction>(UpdateUserFavoriteMetadataAction.ACTION_TYPE),
    mergeMap((action: UpdateUserFavoriteMetadataAction) => {
      const actionType = 'update';
      this.store.dispatch(new StartRequestAction(action, actionType));
      return this.http.post<UserFavorite<IFavoriteMetadata>>(
        `${favoriteUrlPath}/${action.favorite.guid}/metadata`,
        action.favorite.metadata
      ).pipe(
        switchMap(() => {
          this.store.dispatch(new WrapperRequestActionSuccess(null, action));
          this.store.dispatch(new UpdateUserFavoriteMetadataSuccessAction(action.favorite));
          return [];
        }),
        catchError(() => {
          this.store.dispatch(new WrapperRequestActionFailed('Failed to update user favorite', action, actionType));
          return [];
        })
      );
    })
  ));

  // @Effect()
  entityDeleteRequest$ = createEffect( () => this.actions$.pipe(
    ofType<EntityDeleteCompleteAction>(EntityDeleteCompleteAction.ACTION_TYPE),
    withLatestFrom(this.store),
    mergeMap(([action, appState]) => {
      // If there is a favorite, delete it
      const fav = action.asFavorite();
      const entityKey = entityCatalog.getEntityKey(STRATOS_ENDPOINT_TYPE, userFavouritesEntityType);
      if (appState.requestData && appState.requestData[entityKey] && appState.requestData[entityKey][fav.guid]) {
        this.store.dispatch(new RemoveUserFavoriteAction(fav));
      }
      return [];
    })
  ));

}
