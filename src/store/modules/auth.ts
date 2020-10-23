import { replace } from '../../navigation/services';
import { handleActions, createAction } from 'redux-actions';
import appleAuth, { AppleAuthRequestResponse, AppleAuthRequestOperation } from '@invertase/react-native-apple-authentication';
import { AxiosInstance, AxiosResponse } from 'axios';
import { LoginManager } from 'react-native-fbsdk';
import { GoogleSignin } from '@react-native-community/google-signin';
import { IReduxState } from '../reducers';
import { AnyAction } from 'redux';
import { ENDPOINTS } from '../../utils/endpoints';
import { setEmail, fetchProfile, resetProfile } from './userProfile';
import { resetPinCodeInKeychain } from '../../utils/pinCode';
import { reset as resetProgression } from './progression';
import { reset as resetInfluencers } from './influencers';
import { reset as resetApiQueue } from './apiQueue';
import { reset as resetTutorials } from './tutorials';
import { resetWorkoutHistory } from './workoutProgression';
import { refreshInfluencers } from '../../utils/influencers';
import { logEvent } from '../../utils/analytics';
import { RefObject } from 'react';
import crashlytics from '@react-native-firebase/crashlytics';
import i18n from '../../utils/i18n';

import ToastManager from '../../components/ToastManager';
import {isIOS} from "../../utils/os";

// We can't use an enum here because they can't contain computed values
const LoginMethods = {
    email: (i18n.t('global.email') as String).toLowerCase(),
    facebook: 'Facebook',
    google: 'Google'
};

export interface IAuthState {
    loading: boolean;
    error: boolean;
    connected: boolean;
    accessToken?: string;
    refreshToken?: string;
    appleSigninCredentials?: typeof AppleAuthRequestResponse;
}

export interface ILoginPayload {
    password?: string;
    refreshToken?: string;
    email: string;
}

interface IDynamicLinksPayload {
    firstTouchId?: string;
    firstTouchLink?: string;
    lastTouchId?: string;
    lastTouchLink?: string;
}

export interface IEmailRegisterPayload extends IDynamicLinksPayload {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface IGoogleLoginPayload {
    idToken: string;
}

export interface IFacebookLoginPayload {
    accessToken: string;
}

export interface IAppleLoginPayload {
    id: string;
    email?: string;
}

export interface IFacebookRegisterPayload extends IFacebookLoginPayload, IDynamicLinksPayload {}

export interface IGoogleRegisterPayload extends IGoogleLoginPayload, IDynamicLinksPayload {}

export interface IAppleRegisterPayload extends IAppleLoginPayload, IDynamicLinksPayload {
    email: string;
    familyName: string;
    givenName: string;
}

export const CONSTANTS = {
    REQUEST: 'auth/REQUEST',
    SUCCESS: 'auth/SUCCESS',
    FAILURE: 'auth/FAILURE',
    RESET: 'auth/RESET',
    SET_APPLE_SIGNIN_CREDENTIALS: 'auth/SET_APPLE_SIGNIN_CREDENTIALS',
    REMOVE_APPLE_SIGNIN_CREDENTIALS: 'auth/REMOVE_APPLE_SIGNIN_CREDENTIALS'
};

const request = createAction(CONSTANTS.REQUEST);
const failure = createAction(CONSTANTS.FAILURE, (payload: any) => payload);
const success = createAction(CONSTANTS.SUCCESS);
const reset = createAction(CONSTANTS.RESET);
export const setAppleSigninCredentials = createAction(CONSTANTS.SET_APPLE_SIGNIN_CREDENTIALS, (credentials: typeof AppleAuthRequestResponse) => credentials);
export const removeAppleSigninCredentials = createAction(CONSTANTS.SET_APPLE_SIGNIN_CREDENTIALS);

const initialState: IAuthState = {
    loading: false,
    error: false,
    connected: false,
    appleSigninCredentials: null
};

function handleLoginError (error: any, toastManagerRef: RefObject<ToastManager>): void {
    console.log(error.response); // Do not remove

    if (!toastManagerRef) {
        return;
    }

    if (!error.response) {
        // API didn't respond
        toastManagerRef?.current?.openToast({
            message: i18n.t('app.fetchError'),
            type: 'error'
        });
    }

    if (error.response?.status === 409) {
        // User tried to login with the wrong method
        const expectedMethod = error.response?.data?.data?.expected;

        toastManagerRef?.current?.openToast({
            message: i18n.t('app.wrongLoginMethodError', { method: LoginMethods[expectedMethod] || '---' }),
            type: 'error'
        });
    } else {
        // Default login error
        toastManagerRef?.current?.openToast({
            message: i18n.t('app.credentialsError'),
            type: 'error'
        });
    }
}

function handleRegisterError (error: any, toastManagerRef: RefObject<ToastManager>): void {
    console.log(error.response); // Do not remove

    if (!toastManagerRef) {
        return;
    }

    if (!error.response) {
        // API didn't respond
        toastManagerRef?.current?.openToast({
            message: i18n.t('app.fetchError'),
            type: 'error'
        });
    }

    if (error.response?.status === 409) {
        // Email address is already used
        toastManagerRef?.current?.openToast({
            message: i18n.t('app.userAlreadyRegisteredError'),
            type: 'error'
        });
    } else {
        // Default register error
        toastManagerRef?.current?.openToast({
            message: i18n.t('app.authError'),
            type: 'error'
        });
    }
}

export function login (payload?: ILoginPayload, toastManagerRef?: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('login_attempt', { method: 'email' });
        let response: AxiosResponse;

        if (getState().network?.isInternetReachable === false) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());
        let email;

        try {
            if (payload) {
                if (payload.refreshToken) {
                    email = payload.email;
                    response = await authInstance.post(ENDPOINTS.login, { email, refreshToken: payload.refreshToken });
                } else {
                    const { password } = payload;
                    email = payload.email;
                    response = await authInstance.post(ENDPOINTS.login, { email, password });
                }
            } else {
                email = getState().userProfile.email;
                response = await authInstance.post(ENDPOINTS.login, { email, refreshToken: getState().auth.refreshToken });
            }

            const { accessToken, refreshToken } = response.data;
            await dispatch(success({ accessToken, refreshToken }));
            await dispatch(setEmail(email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('login_success', { method: 'email' });
            return accessToken;
        } catch (error) {
            console.log('Login with email error', error);
            dispatch(failure(error));
            handleLoginError(error, toastManagerRef);
            logEvent('login_error', { method: 'email' });
            throw error;
        }
    };
}

export function loginWithGoogle (payload?: IGoogleLoginPayload, toastManagerRef?: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('login_attempt', { method: 'google' });
        let response: AxiosResponse;

        if (!getState().network?.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());

        try {
            const { idToken } = payload;
            response = await authInstance.post(ENDPOINTS.googleLogin, { idToken });

            const { accessToken, refreshToken, email } = response.data;
            await dispatch(success({ accessToken, refreshToken }));
            await dispatch(setEmail(email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('login_success', { method: 'google' });
            return accessToken;
        } catch (error) {
            console.log('Login with google error', error);
            dispatch(failure(error));
            handleLoginError(error, toastManagerRef);
            logEvent('login_error', { method: 'google' });
            throw error;
        }
    };
}

export function loginWithFacebook (payload?: IFacebookLoginPayload, toastManagerRef?: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('login_attempt', { method: 'facebook' });
        let response: AxiosResponse;

        if (!getState().network?.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());

        try {
            response = await authInstance.post(ENDPOINTS.facebookLogin, { accessToken: payload.accessToken });

            const { accessToken, refreshToken, email } = response.data;
            await dispatch(success({ accessToken, refreshToken }));
            await dispatch(setEmail(email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('login_success', { method: 'facebook' });
            return accessToken;
        } catch (error) {
            console.log('Login with facebook error', error);
            dispatch(failure(error));
            handleLoginError(error, toastManagerRef);
            logEvent('login_error', { method: 'facebook' });
            throw error;
        }
    };
}

export function loginWithApple (payload?: IAppleLoginPayload, toastManagerRef?: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('login_attempt', { method: 'apple' });
        let response: AxiosResponse;

        if (!getState().network?.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());

        try {
            response = await authInstance.post(ENDPOINTS.appleLogin, { id: payload.id, email: payload.email });

            const { accessToken, refreshToken, email } = response.data;
            await dispatch(success({ accessToken, refreshToken }));
            await dispatch(setEmail(email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('login_success', { method: 'apple' });
            return accessToken;
        } catch (error) {
            dispatch(failure(error));
            handleLoginError(error, toastManagerRef);
            logEvent('login_error', { method: 'apple' });
            throw error;
        }
    };
}

export function registerWithEmail (payload: IEmailRegisterPayload, toastManagerRef: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('register_attempt', { method: 'email' });

        if (!getState().network?.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());

        try {
            const { userProfile } = getState();
            const response = await authInstance.post(
                ENDPOINTS.users,
                payload,
                { headers: { 'X-Locale': userProfile?.locale } }
            );

            await dispatch(success({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
            }));
            await dispatch(setEmail(payload?.email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('register_success', { method: 'email' });
            return response.data.accessToken;
        } catch (error) {
            console.log('Register with email error', error);
            dispatch(failure(error));
            handleRegisterError(error, toastManagerRef);
            logEvent('register_error', { method: 'email', error: error });
            crashlytics().recordError(error);
            throw error;
        }
    };
}

export function registerWithGoogle (payload: IGoogleRegisterPayload, toastManagerRef: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('register_attempt', { method: 'google' });

        if (!getState().network?.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());

        try {
            const { userProfile } = getState();
            const { idToken, firstTouchId, firstTouchLink, lastTouchId, lastTouchLink } = payload;
            const response = await authInstance.post(
                `${ENDPOINTS.users}/google`,
                {
                    firstTouchId,
                    firstTouchLink,
                    idToken,
                    lastTouchId,
                    lastTouchLink
                },
                { headers: { 'X-Locale': userProfile?.locale } }
             );

            await dispatch(success({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
            }));
            await dispatch(setEmail(response.data.email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('register_success', { method: 'google' });
            return response.data.accessToken;
        } catch (error) {
            console.log('Register with google error', error);
            dispatch(failure(error));
            handleRegisterError(error, toastManagerRef);
            logEvent('register_error', { method: 'google', error: error });
            crashlytics().recordError(error);
            throw error;
        }
    };
}

export function registerWithFacebook (payload: IFacebookRegisterPayload, toastManagerRef: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('register_attempt', { method: 'facebook' });

        if (!getState().network?.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());

        try {
            const { userProfile } = getState();
            const { accessToken, firstTouchId, firstTouchLink, lastTouchId, lastTouchLink } = payload;
            const response = await authInstance.post(
                `${ENDPOINTS.users}/facebook`,
                {
                    accessToken,
                    firstTouchId,
                    firstTouchLink,
                    lastTouchId,
                    lastTouchLink
                },
                { headers: { 'X-Locale': userProfile?.locale } }
            );

            await dispatch(success({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
            }));
            await dispatch(setEmail(response.data.email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('register_success', { method: 'facebook' });
            return response.data.accessToken;
        } catch (error) {
            console.log('Register with facebook error', error);
            dispatch(failure(error));
            handleRegisterError(error, toastManagerRef);
            logEvent('register_error', { method: 'facebook', error: error });
            crashlytics().recordError(error);
            throw error;
        }
    };
}

export function registerWithApple (payload: IAppleRegisterPayload, toastManagerRef: RefObject<ToastManager>): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, { authInstance }: { authInstance: AxiosInstance }) => {
        logEvent('register_attempt', { method: 'apple' });

        if (!getState().network?.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        dispatch(request());

        try {
            const { userProfile } = getState();
            const { id, email, familyName, givenName, firstTouchId, firstTouchLink, lastTouchId, lastTouchLink } = payload;
            const response = await authInstance.post(
                `${ENDPOINTS.users}/apple`,
                {
                    id,
                    email,
                    familyName,
                    givenName,
                    firstTouchId,
                    firstTouchLink,
                    lastTouchId,
                    lastTouchLink
                },
                { headers: { 'X-Locale': userProfile?.locale } }
            );

            await dispatch(success({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken
            }));
            await dispatch(setEmail(response.data.email));
            await dispatch(fetchProfile());
            await refreshInfluencers();

            logEvent('register_success', { method: 'apple' });
            return response.data.accessToken;
        } catch (error) {
            dispatch(failure(error));
            handleRegisterError(error, toastManagerRef);
            logEvent('register_error', { method: 'apple', error: error });
            crashlytics().recordError(error);
            throw error;
        }
    };
}

export function logout (callback?: () => void): any {
    return (dispatch: (action: AnyAction) => void) => {
        LoginManager.logOut();
        GoogleSignin.isSignedIn().then((signedIn: boolean) => {
            if (signedIn) {
                GoogleSignin.signOut();
            }
        });
        if (isIOS) {
            dispatch(removeAppleSigninCredentials());
        }

        resetPinCodeInKeychain(); // No need to await here, we don't want to slow down the process

        dispatch(reset());
        dispatch(resetProfile());
        dispatch(resetProgression());
        dispatch(resetWorkoutHistory());
        dispatch(resetInfluencers());
        dispatch(resetApiQueue());
        dispatch(resetTutorials());

        logEvent('logout');

        if (callback) {
            callback();
        } else {
            replace({ routeName: 'Onboarding', params: {} });
        }
    };
}

export default handleActions<IAuthState, any>(
    {
        [CONSTANTS.REQUEST]: (state: IAuthState) => ({
            ...state,
            loading: true,
            error: false
        }),
        [CONSTANTS.FAILURE]: (state: IAuthState) => ({
            ...state,
            loading: false,
            error: true
        }),
        [CONSTANTS.SUCCESS]: (state: IAuthState, { payload }: { payload: { accessToken: string; refreshToken: string; } }) => ({
            ...state,
            loading: false,
            error: false,
            connected: true,
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken
        }),
        [CONSTANTS.RESET]: (state: IAuthState) => ({
            ...initialState,
            // Apple credentials should never be erased since they can only be fetched once (!!)
            appleSigninCredentials: state.appleSigninCredentials
        }),
        [CONSTANTS.SET_APPLE_SIGNIN_CREDENTIALS]: (state: IAuthState, { payload }: { payload: typeof AppleAuthRequestResponse }) => ({
            ...state,
            appleSigninCredentials: payload
        }),
        [CONSTANTS.REMOVE_APPLE_SIGNIN_CREDENTIALS]: (state: IAuthState) => ({
            ...state,
            appleSigninCredentials: null
        }),
    },
    initialState
);
