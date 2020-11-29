import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import actions from "../../http/actions";
import {AppThunk} from "../store";
import { createErrorToast, createSuccessToast } from '../toasts/toastsSlice';
import {User} from '../../types';

interface UsersState {
    isLoggingIn: boolean;
    isRegistering: boolean;
    isLoggedIn: boolean;
    error: string|null;
    isLoading: boolean;
    isLoaded: boolean;
    users: User[];
}

const usersInitialState: UsersState = {
    isLoggingIn: false,
    isRegistering: false,
    isLoggedIn: false,
    error: null,
    users: [],
    isLoaded: false,
    isLoading: false
};

function startLoadingUsers(state: UsersState) {
  state.isLoading = true;
  state.isLoaded = false;
}

function loadingUsersFailed(state: UsersState, action: PayloadAction<{error: string}>) {
  state.isLoading = false;
  state.isLoaded = false;
  state.error = action.payload.error;
}

function startLogin(state: UsersState) {
  state.isLoggingIn = true;
}

function startRegistration(state: UsersState) {
  state.isRegistering = true;
}

function loginFailed(state: UsersState, action: PayloadAction<{error: string}>) {
  state.isLoggingIn = false;
  state.error = action.payload.error
}

function registrationFailed(state: UsersState, action: PayloadAction<{error: string}>) {
  state.isRegistering = false;
  state.error = action.payload.error
}

const users = createSlice({
    initialState: usersInitialState,
    name: 'users',
    reducers: {
      loadUsersStart: startLoadingUsers,
      loadUsersFailure: loadingUsersFailed,
      loadUsersSuccess(state: UsersState, action: PayloadAction<{users: User[]}>) {
        state.isLoading = false;
        state.isLoaded = true;
        state.users = action.payload.users;
      },
      loginStart: startLogin,
      loginFailure: loginFailed,
      registrationStart: startRegistration,
      registrationFailure: registrationFailed,
      loginSuccess(state: UsersState) {
        state.error = null;
        state.isLoggingIn = false;
        state.isLoggedIn = true;
      },
      registrationSuccess(state: UsersState) {
        state.error = null;
        state.isRegistering = false;
        state.isLoggedIn = true;
      },
    }
});

export const {
    loginStart,
    loginFailure,
    loginSuccess,
    registrationStart,
    registrationFailure,
    registrationSuccess,
    loadUsersStart,
    loadUsersFailure,
    loadUsersSuccess
} =  users.actions;

export default users.reducer;

export const login = (username: string, password: string): AppThunk => async dispatch => {
  console.log('login');
    try {
        dispatch(loginStart());
        await actions.login(username, password);
        dispatch(createSuccessToast({message: 'Logged in'}));
        return dispatch(loginSuccess());
    } catch (err) {
        dispatch(createErrorToast({
            message: err.toString() || "Could not login"
        }));
        return dispatch(loginFailure({error: err.toString()}))
    }
};

export const register = (username: string, password: string): AppThunk => async dispatch => {
  console.log('register');
    try {
        dispatch(registrationStart());
        await actions.register(username, password);
        dispatch(createSuccessToast({message: 'Logged in'}));
        return dispatch(registrationSuccess());
    } catch (err) {
        dispatch(createErrorToast({
            message: err.toString() || "Could not login"
        }));
        return dispatch(registrationFailure({error: err.toString()}))
    }
};

export const loadUsers = (): AppThunk => async dispatch => {
  console.log('loadUsers');
    try {
        dispatch(loadUsersStart());
        const users = await actions.loadUsers();
        return dispatch(loadUsersSuccess({users}));
    } catch (err) {
        dispatch(createErrorToast({
            message: err.toString() || "Could not load users"
        }));
        return dispatch(loadUsersFailure({error: err.toString()}))
    }
};