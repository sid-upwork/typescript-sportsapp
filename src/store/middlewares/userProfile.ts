import OneSignalManager from '../../utils/oneSignal';
import { IReduxState } from '../reducers';
import { MiddlewareAPI } from 'redux';
import { CONSTANTS, setNotificationPreferences } from '../modules/userProfile';
import I18n, { callSafeLocale } from '../../utils/i18n';

export default () => ({ dispatch, getState }: MiddlewareAPI<any, IReduxState>) => {
    return (next: any) => async (action: any) => {
        // If the locale is changing in the store we also update it in I18n and in moment
        if (action.type === CONSTANTS.SET_LOCALE) {
            I18n.locale = action.payload;
            callSafeLocale(action.payload);
        }
        if (action.type === CONSTANTS.SET_PROFILE) {
            if (action.payload.locale) {
                // Set locale only if it's already present in the user's profile on the backend
                I18n.locale = action.payload.locale;
                callSafeLocale(action.payload.locale);
            }
        }
        if (action.type === CONSTANTS.SET_PROFILE) {
            if (action?.payload?.id &&  action?.payload?.id !== getState().userProfile.id) {
                // Login for the first time or switching user
                const notificationsCategoriesToEnable = await OneSignalManager.getNotificationsCategoriesToEnableFromRemote();
                if (Object.keys(notificationsCategoriesToEnable).length) {
                    dispatch(setNotificationPreferences(notificationsCategoriesToEnable));
                }
            }
        }
        return next(action);
    };
};
