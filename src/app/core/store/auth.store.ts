import {
  signalStore,
  withComputed,
  withMethods,
  withState,
  WritableStateSource,
} from '@ngrx/signals';
import {updateState, withDevtools} from '@angular-architects/ngrx-toolkit';
import {computed} from '@angular/core';
import {ILoginData, ILoginUser} from '../../shared/models/auth.model';

interface AuthStateSignal {
  session: ILoginData | null;
}

const authStoreInitialState: AuthStateSignal = {session: null};

export const AuthStore = signalStore(
  {providedIn: 'root'},
  withDevtools('AuthStore'),
  withState(authStoreInitialState),
  withComputed(({session}) => ({
    getSession: computed(() => {
      return session();
    }),
  })),
  withMethods((store) => ({
    setSessionMethod: (session: ILoginData): void =>
      _setSession(store, session),
    resetSessionMethod: (): void => _resetSession(store),
    updateUserMethod: (user: ILoginUser): void => _updateUser(store, user),
  }))
);

function _setSession(
  store: WritableStateSource<AuthStateSignal>,
  session: ILoginData
): void {
  session = {
    ...session,
  };
  updateState(store, '[Auth] Update Session', (state) => ({
    session: {...state.session, ...session},
  }));
}

function _resetSession(store: WritableStateSource<AuthStateSignal>): void {
  updateState(store, '[Auth] Reset Session', () => ({
    session: null,
  }));
}

function _updateUser(
  store: WritableStateSource<AuthStateSignal>,
  user: ILoginUser
): void {
  updateState(store, '[Auth] Update User', (state) => {
    return {
      session: {
        ...(state.session as ILoginData),
        user: user,
      },
    };
  });
}
