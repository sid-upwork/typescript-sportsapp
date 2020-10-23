import { Platform } from 'react-native';
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { Store } from 'redux';
import { IReduxState } from '../store/reducers';
import { login, logout } from '../store/modules/auth';
import { isAndroid } from './os';
import { isDebugBundleID } from '../utils/bundleId';
import { API_DOMAIN } from '../../env';
import { replace } from '../navigation/services';
import DeviceInfo from 'react-native-device-info';
import I18n from './i18n';

const DEBUG = false;

let store: Store;
let baseURL: string = API_DOMAIN;

if (isDebugBundleID()) {
    console.log('API Domain ' + baseURL);

    if (isAndroid) {
        // Fix network requests on android emulators
        baseURL = baseURL.replace('localhost', '10.0.2.2');
    }
}

const instance = axios.create({ baseURL });
export const authInstance = axios.create({ baseURL });
instance.defaults.timeout = 15000;
authInstance.defaults.timeout = 15000;

instance.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        DEBUG && console.log(config);

        if (!store) {
            return config;
        }

        const { auth } = store.getState() as IReduxState;
        const { userProfile } = store.getState() as IReduxState;
        const { network } = store.getState() as IReduxState;

        config.headers['Content-Type'] = 'application/json';
        if (auth.accessToken) {
            config.headers.authorization = auth.accessToken;
        }
        if (userProfile.locale) {
            config.headers['X-Locale'] = userProfile.locale;
        }
        if (userProfile.id) {
            config.headers['X-User-ID'] = userProfile.id;
        }
        if (userProfile.role) {
            config.headers['X-User-Role'] = userProfile.role;
        }
        if (network.type) {
            config.headers['X-Network-Type'] = network.type;
        }

        const bundleId = DeviceInfo.getBundleId();
        if (bundleId) {
            config.headers['X-Bundle-ID'] = bundleId;
        }
        const appVersion = DeviceInfo.getVersion();
        if (appVersion) {
            config.headers['X-App-Version'] = appVersion;
        }
        const operatingSystem = Platform.OS + ' ' + DeviceInfo.getSystemVersion();
        if (operatingSystem) {
            config.headers['X-Operating-System'] = operatingSystem;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let subscribers = [];

instance.interceptors.response.use(
    (response: AxiosResponse) => {
        DEBUG && console.log(response);
        if (!store) {
            return;
        }
        return response;
    },
    (error: AxiosError) => {
        DEBUG && console.log(error);
        const { config, response } = error;
        const originalRequest = config;

        if (response && response.status === 401) {
            if (!isRefreshing) {
                // If no previous request has already requested a token refresh
                isRefreshing = true;
                store.dispatch(login()).then((newAccessToken: string) => {
                    console.log('newAccessToken', newAccessToken);
                    // Dispatch the login thunk with the current JWT in order to get a new one
                    isRefreshing = false;
                    // Fire the callback of each subscriber, updating their respective authorization
                    // headers and resuming the request w/ the new token
                    onRrefreshed(newAccessToken);
                    subscribers = [];
                }).catch((refreshError: Error) => {
                    isRefreshing = false;
                    store.dispatch(logout(() => {
                        // We are logging out the user so we want to tell him why
                        replace({ routeName: 'Onboarding', params: { errorMessage: I18n.t('onboarding.error') } });
                    }));
                    return Promise.reject(refreshError);
                });
            }
            // Return a promise that's going to halt the original request, and push it into
            // an array of subscribers that need an updated token
            const requestSubscribers = new Promise((resolve: (value?: any) => void) => {
                subscribeTokenRefresh((token: string) => {
                    // Alter the orignal request headers w/ the refreshed token
                    originalRequest.headers.Authorization = token;
                    // Fire it once again
                    resolve(axios(originalRequest));
                });
            });
            return requestSubscribers;
        } else {
            const url = error.request && error.request._url;
            DEBUG && console.log(url || 'unknown', error);
        }
        return Promise.reject(error);
    }
);

function subscribeTokenRefresh (cb: (token: string) => any): void {
    subscribers.push(cb);
}

function onRrefreshed (token: string): void {
    subscribers.map((cb: (token: string) => any) => cb(token));
}

export function setStoreInstance (storeInstance: Store): void {
    store = storeInstance;
}

export default instance;
