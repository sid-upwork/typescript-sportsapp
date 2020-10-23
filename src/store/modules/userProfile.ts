import { handleActions, createAction } from 'redux-actions';
import { AxiosInstance, AxiosResponse } from 'axios';
import { logout } from './auth';
import { AnyAction } from 'redux';
import { ENDPOINTS } from '../../utils/endpoints';
import { IMedia } from '../../types/media';
import { IUser, TRoles, TUnitsSystems } from '../../types/user';
import { IReduxState } from '../reducers';
import { store } from '../../index';
import i18n from '../../utils/i18n';
import { isAndroid } from '../../utils/os';
import { setPinCodeInKeychain } from '../../utils/pinCode';

import analytics from '@react-native-firebase/analytics';
import Smartlook from 'smartlook-react-native-wrapper';

export interface INotificationsPreferences {
    restNotifications?: boolean;
    trainingNotifications?: boolean;
    nutritionNotifications?: boolean;
    blogNotifications?: boolean;
    generalNotifications?: boolean;
}

export interface IUserProfileState extends INotificationsPreferences {
    autoTimer?: boolean;
    email?: string;
    firstName?: string;
    firstTouchId?: string;
    firstTouchLink?: string;
    id?: string;
    lastName?: string;
    lastTouchId?: string;
    lastTouchLink?: string;
    lastTrialReminderDate?: number;
    locale?: string;
    notificationPermissionRequested: boolean;
    oneSignalPlayerId?: string;
    picture?: IMedia;
    pinCode?: string;
    pinCodeEnabled?: boolean;
    postRestPopup?: boolean;
    role?: TRoles;
    preventSleepMode?: boolean;
    unitSystem?: TUnitsSystems;
    workoutSounds?: boolean;
}

export interface INotificationsPreferencesInfos {
    description: string;
    key: keyof INotificationsPreferences;
    title: string;
}

export function getNotificationsPreferences (): INotificationsPreferencesInfos[] {
    return [
        {
            key: 'restNotifications',
            title: i18n.t('settings.notifications.restNotifications'),
            description: i18n.t('settings.notifications.restNotificationsDescription')
        },
        {
            key: 'trainingNotifications',
            title: i18n.t('settings.notifications.trainingNotifications'),
            description: i18n.t('settings.notifications.trainingNotificationsDescription')
        },
        {
            key: 'nutritionNotifications',
            title: i18n.t('settings.notifications.nutritionNotifications'),
            description: i18n.t('settings.notifications.nutritionNotificationsDescription')
        },
        {
            key: 'blogNotifications',
            title: i18n.t('settings.notifications.blogNotifications'),
            description: i18n.t('settings.notifications.blogNotificationsDescription')
        },
        {
            key: 'generalNotifications',
            title: i18n.t('settings.notifications.generalNotifications'),
            description: i18n.t('settings.notifications.generalNotificationsDescription')
        }
    ];
}

export const CONSTANTS = {
    RESET_PROFILE: 'userProfile/RESET_PROFILE',
    SET_AUTO_TIMER: 'userProfile/SET_AUTO_TIMER',
    SET_EMAIL: 'userProfile/SET_EMAIL',
    SET_LAST_TRIAL_REMINDER_DATE: 'userProfile/SET_LAST_TRIAL_REMINDER_DATE',
    SET_LOCALE: 'userProfile/SET_LOCALE',
    SET_NOTIFICATION_PERMISSION_REQUESTED: 'userProfile/SET_NOTIFICATION_PERMISSION_REQUESTED',
    SET_NOTIFICATION_PREFERENCES: 'userProfile/SET_NOTIFICATION_PREFERENCES',
    SET_PIN_CODE: 'userProfile/SET_PIN_CODE',
    SET_PIN_CODE_ENABLED: 'userProfile/SET_PIN_CODE_ENABLED',
    SET_POST_REST_POPUP: 'userProfile/SET_POST_REST_POPUP',
    SET_PROFILE: 'userProfile/SET_PROFILE',
    SET_PREVENT_SLEEP_MODE: 'userProfile/SET_PREVENT_SLEEP_MODE',
    SET_UNIT_SYSTEM: 'userProfile/SET_UNIT_SYSTEM',
    SET_WORKOUT_SOUNDS: 'userProfile/SET_WORKOUT_SOUNDS'
};

export const resetProfile = createAction(CONSTANTS.RESET_PROFILE);
export const setAutoTimer = createAction(CONSTANTS.SET_AUTO_TIMER, (enabled: boolean) => enabled);
export const setEmail = createAction(CONSTANTS.SET_EMAIL, (email: string) => email);
export const setLastTrialReminderDate = createAction(CONSTANTS.SET_LAST_TRIAL_REMINDER_DATE, (date: number) => date);
export const setLocale = createAction(CONSTANTS.SET_LOCALE, (locale: string) => locale);
export const setNotificationPermissionRequested = createAction(CONSTANTS.SET_NOTIFICATION_PERMISSION_REQUESTED, (requested: boolean) => requested);
export const setNotificationPreferences = createAction(CONSTANTS.SET_NOTIFICATION_PREFERENCES, (preferences: INotificationsPreferences) => preferences);
export const setPinCode = createAction(CONSTANTS.SET_PIN_CODE, (payload: string) => payload);
export const setPinCodeEnabled = createAction(CONSTANTS.SET_PIN_CODE_ENABLED, (payload: boolean) => payload);
export const setPostRestPopup = createAction(CONSTANTS.SET_POST_REST_POPUP, (enabled: boolean) => enabled);
export const setProfile = createAction(CONSTANTS.SET_PROFILE, (payload: any) => payload);
export const setPreventSleepMode = createAction(CONSTANTS.SET_PREVENT_SLEEP_MODE, (payload: boolean) => payload);
export const setUnitSystem = createAction(CONSTANTS.SET_UNIT_SYSTEM, (payload: TUnitsSystems) => payload);
export const setWorkoutSounds = createAction(CONSTANTS.SET_WORKOUT_SOUNDS, (payload: boolean) => payload);

const initialState: IUserProfileState = {
    autoTimer: true,
    email: undefined,
    firstName: undefined,
    firstTouchId: undefined,
    firstTouchLink: undefined,
    id: undefined,
    lastName: undefined,
    lastTouchId: undefined,
    lastTouchLink: undefined,
    lastTrialReminderDate: undefined,
    locale: undefined,
    notificationPermissionRequested: false,
    oneSignalPlayerId: undefined,
    picture: undefined,
    pinCode: undefined,
    pinCodeEnabled: undefined,
    postRestPopup: true,
    preventSleepMode: true,
    restNotifications: isAndroid ? true : undefined,
    trainingNotifications: isAndroid ? true : undefined,
    nutritionNotifications: isAndroid ? true : undefined,
    blogNotifications: isAndroid ? true : undefined,
    generalNotifications: isAndroid ? true : undefined,
    role: undefined,
    unitSystem: 'metric',
    workoutSounds: true
};

export function fetchProfile (): any {
    return async (dispatch: (action: AnyAction) => void, _: () => IReduxState, { defaultInstance }: { defaultInstance: AxiosInstance }) => {
        try {
            // First we fetch the profile
            const response: AxiosResponse = await defaultInstance.get(ENDPOINTS.self);
            const userProfile: IUser = response?.data;
            const userID = userProfile?.id;

            // Update the locale on the backend if it's missing
            if (!userProfile?.locale) {
                await defaultInstance.put(
                    ENDPOINTS.users + '/' + userID,
                    { locale: store.getState().userProfile.locale }
                );
            }

            // We also set the user properties for analytics
            // Analytics will throw an error if the value is not a string!
            // As a result, the logout in the catch below would always be called...
            if (typeof userID === 'string') {
                analytics().setUserId(userID);
                Smartlook.setUserIdentifier(userID);
            }

            if (userProfile?.firstTouchId && typeof userProfile?.firstTouchId === 'string') {
                analytics().setUserProperty('firstTouchId', userProfile.firstTouchId);
            }
            if (userProfile?.lastTouchId && typeof userProfile?.lastTouchId === 'string') {
                analytics().setUserProperty('lastTouchId', userProfile.lastTouchId);
            }

            // We set the pinCode if we have one
            if (userProfile.pinCode) {
                setPinCodeInKeychain(userProfile.pinCode);
                setPinCodeEnabled(true);
            }

            // Finally we update the store with the profile
            dispatch(setProfile(userProfile));
        } catch (error) {
            console.log('login error', error);
            dispatch(logout());
        }
    };
}

export default handleActions<IUserProfileState, any>(
    {
        [CONSTANTS.RESET_PROFILE]: (state: IUserProfileState) => ({
            ...state,
            firstName: initialState.firstName,
            firstTouchId: initialState.firstTouchId,
            firstTouchLink: initialState.firstTouchLink,
            id: initialState.id,
            lastName: initialState.lastName,
            lastTouchId: initialState.lastTouchId,
            lastTouchLink: initialState.lastTouchLink,
            picture: initialState.picture,
            pinCode: initialState.pinCode,
            pinCodeEnabled: initialState.pinCodeEnabled,
            postRestPopup: initialState.postRestPopup,
            restNotifications: initialState.restNotifications,
            trainingNotifications: initialState.trainingNotifications,
            nutritionNotifications: initialState.nutritionNotifications,
            blogNotifications: initialState.blogNotifications,
            generalNotifications: initialState.generalNotifications,
            role: initialState.role,
            preventSleepMode: initialState.preventSleepMode,
            unitSystem: initialState.unitSystem,
            workoutSounds: initialState.workoutSounds
        }),
        [CONSTANTS.SET_AUTO_TIMER]: (state: IUserProfileState, { payload }: { payload: boolean }) => ({
            ...state,
            autoTimer: payload
        }),
        [CONSTANTS.SET_EMAIL]: (state: IUserProfileState, { payload }: { payload: string }) => ({
            ...state,
            email: payload
        }),
        [CONSTANTS.SET_LAST_TRIAL_REMINDER_DATE]: (state: IUserProfileState, { payload }: { payload: number }) => ({
            ...state,
            lastTrialReminderDate: payload
        }),
        [CONSTANTS.SET_LOCALE]: (state: IUserProfileState, { payload }: { payload: string }) => ({
            ...state,
            locale: payload
        }),
        [CONSTANTS.SET_NOTIFICATION_PERMISSION_REQUESTED]: (state: IUserProfileState, { payload }: { payload: boolean }) => ({
            ...state,
            notificationPermissionRequested: payload
        }),
        [CONSTANTS.SET_NOTIFICATION_PREFERENCES]: (state: IUserProfileState, { payload }: { payload: INotificationsPreferences }) => ({
            ...state,
            ...payload
        }),
        [CONSTANTS.SET_PIN_CODE]: (state: IUserProfileState, { payload }: { payload: string }) => ({
            ...state,
            pinCode: payload
        }),
        [CONSTANTS.SET_PIN_CODE_ENABLED]: (state: IUserProfileState, { payload }: { payload: boolean }) => ({
            ...state,
            pinCodeEnabled: payload
        }),
        [CONSTANTS.SET_POST_REST_POPUP]: (state: IUserProfileState, { payload }: { payload: boolean }) => ({
            ...state,
            postRestPopup: payload
        }),
        [CONSTANTS.SET_PREVENT_SLEEP_MODE]: (state: IUserProfileState, { payload }: { payload: boolean }) => ({
            ...state,
            preventSleepMode: payload
        }),
        [CONSTANTS.SET_PROFILE]: (state: IUserProfileState, { payload }: { payload: IUser }) => ({
            ...state,
            autoTimer: payload.autoTimer,
            firstName: payload.firstName,
            firstTouchId: payload.firstTouchId,
            firstTouchLink: payload.firstTouchLink,
            id: payload.id,
            lastName: payload.lastName,
            lastTouchId: payload.lastTouchId,
            lastTouchLink: payload.lastTouchLink,
            locale: payload.locale,
            oneSignalPlayerId: payload.oneSignalPlayerId,
            picture: payload.picture,
            pinCode: payload.pinCode,
            postRestPopup: payload.postRestPopup,
            role: payload.role,
            unitSystem: payload.unitSystem
        }),
        [CONSTANTS.SET_PREVENT_SLEEP_MODE]: (state: IUserProfileState, { payload }: { payload: boolean }) => ({
            ...state,
            preventSleepMode: payload
        }),
        [CONSTANTS.SET_UNIT_SYSTEM]: (state: IUserProfileState, { payload }: { payload: TUnitsSystems }) => ({
            ...state,
            unitSystem: payload
        }),
        [CONSTANTS.SET_WORKOUT_SOUNDS]: (state: IUserProfileState, { payload }: { payload: boolean }) => ({
            ...state,
            workoutSounds: payload
        })
    },
    initialState
);
