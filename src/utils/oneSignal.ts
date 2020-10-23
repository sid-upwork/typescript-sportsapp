import OneSignal, { Device, ReceivedNotification } from 'react-native-onesignal';
import { Store } from 'redux';
import { ONESIGNAL_APP_ID } from '../../env';
import { ENDPOINTS } from './endpoints';
import { IReduxState } from '../store/reducers';
import {
    IUserProfileState,
    getNotificationsPreferences,
    INotificationsPreferencesInfos,
    setNotificationPreferences,
    setNotificationPermissionRequested
} from '../store/modules/userProfile';
// import GenericPopup from '../components/Popups/Generic';
import api from './api';
import { isDebugBundleID } from './bundleId';
import { isIOS } from './os';

export default class OneSignalManager {

    private storeRef: Store;
    // private getScreenPropsRef: () => IScreenProps;

    constructor (store: Store, /*getScreenProps: () => IScreenProps*/) {
        this.storeRef = store;
        // this.getScreenPropsRef = getScreenProps;
    }

    /**
     * Returns a payload of tags that are enabled on OneSignal's end so we can dispatch it to our redux store
     * in order to sync it. This should be called after the first login or when switching users in order to
     * sync our store. On subsequent app launches, we'll sync the other way round : from redux to OneSignal.
     */
    static getNotificationsCategoriesToEnableFromRemote (): Promise<Record<string, true>> {
        return new Promise((resolve) => {
            const notificationCategoriesToEnable: Record<string, true> = {};
            OneSignal.getTags((tags: Record<string, string>) => {
                if (!tags) {
                    return {};
                }
                Object.keys(tags)
                    .filter((tagKey: string) => tags[tagKey] === 'true')
                    .forEach((tagKey: string) => {
                        notificationCategoriesToEnable[tagKey] = true;
                    })
                return resolve(notificationCategoriesToEnable);
            });
        });
    }

    /**
     * Initialize OneSignal and register event listeners.
     * This should be called at the root-level of the application.
     */
    public init (): void {
        if (isDebugBundleID()) {
            //Remove this method to stop OneSignal Debugging
            OneSignal.setLogLevel(6, 0);
        }

        OneSignal.init(
            ONESIGNAL_APP_ID,
            {
                kOSSettingsKeyAutoPrompt : false,
                kOSSettingsKeyInAppLaunchURL: false,
                kOSSettingsKeyInFocusDisplayOption: 2
            }
        );
        // Controls what should happen if a notification is received while the app is open.
        // 0 = None, 1 = InAppAlert, 2 = Notification
        OneSignal.inFocusDisplaying(2);

        OneSignal.addEventListener('received', this.onReceived);
        OneSignal.addEventListener('opened', this.onOpened);
        OneSignal.addEventListener('ids', this.onIds);
    }

    /**
     * Terminate OneSignal and remove event listeners.
     * This should be called when the app is unmounting.
     */
    public terminate (): void {
        OneSignal.removeEventListener('received', this.onReceived);
        OneSignal.removeEventListener('opened', this.onOpened);
        OneSignal.removeEventListener('ids', this.onIds);
    }

    public iOSPermissionPrompt (): Promise<void> {
        if (!isIOS) {
            return;
        }
        const notificationPermissionRequested = (this.storeRef?.getState() as IReduxState)?.userProfile?.notificationPermissionRequested;
        if (!notificationPermissionRequested) {
            OneSignal.promptForPushNotificationsWithUserResponse((accepted: any) => {
                this.storeRef?.dispatch(setNotificationPermissionRequested(true));
                if (accepted) {
                    this.onIOSPermissionAccepted();
                }
            });
        }
    }

    /**
     * Callback fired when a notification has been received, but not yet opened.
     * @param notification
     */
    private onReceived = (notification: ReceivedNotification): void => {
        console.log('Notification received', notification);
    }

    /**
     * Callback fired when a notification has been opened by the user.
     * @param openResult
     */
    private onOpened = (/*openResult: OpenResult*/): void => {
        // Don't show anything to the user for the time being
        // A better option would be to present a confirm to ask her if she actually wants to navigate
        // setTimeout(() => {
        //     this.getScreenPropsRef()?.popupManagerRef?.current?.requestPopup({
        //         title: openResult?.notification?.payload?.title,
        //         ContentComponent: GenericPopup,
        //         ContentComponentProps: {
        //             message: openResult?.notification?.payload?.body
        //         },
        //     });
        // }, 0);
    }

    /**
     * Callback fired when the device has been successfuly registered to OneSignal's audience.
     * This should be called on every app startup. Player infos are available in the first argument.
     * @param device
     */
    private onIds = (device: Device): void => {
        // Device is properly added to OneSignal audience
        if (this.storeRef) {
            // Check the playerID in store that's fetched from our backend
            const { userProfile } = (this.storeRef.getState() as IReduxState);
            if (userProfile.id && userProfile.oneSignalPlayerId !== device.userId) {
                // If it doesn't match the one from the callback, update the user profile on the API
                api.put(ENDPOINTS.users + '/' + userProfile.id, { oneSignalPlayerId: device.userId });
            }
            this.syncTags(userProfile);
        }
    }

    private async syncTags (userProfile: IUserProfileState): void {
        const notificationsKeys = getNotificationsPreferences().map((notification) => notification.key);
        const storeState = (this.storeRef?.getState() as IReduxState);
        if (!storeState) {
            return;
        }
        const isSyncedLocally = notificationsKeys.filter((key: string) => typeof storeState.userProfile[key] !== 'undefined').length > 0;

        if (!isSyncedLocally) {
            // Sync from remote to device
            const notificationsCategoriesToEnable = await OneSignalManager.getNotificationsCategoriesToEnableFromRemote();
            this.storeRef?.dispatch(setNotificationPreferences(notificationsCategoriesToEnable));
        } else {
            // Sync from device to remote
            this.syncTagsFromDeviceToRemote(userProfile);
        }

    }

    /**
     * Sync OneSignal's user tags from the redux store. This should be called once the device has been properly
     * signed up the OneSignal's audience.
     * @param userProfile
     */
    private syncTagsFromDeviceToRemote (userProfile: IUserProfileState): void {
        OneSignal.sendTags(this.constructOneSignalTags(userProfile));
    }

    /**
     * When an user has accepted the native notification prompt, let's enable each notification category by default.
     */
    private onIOSPermissionAccepted = (): void => {
        if (!this.storeRef) {
            return;
        }
        const notificationsKeys = getNotificationsPreferences().map((notification) => notification.key);
        const storeState = (this.storeRef?.getState() as IReduxState);
        if (!storeState) {
            return;
        }
        const notificationCategoriesToEnable: Record<string, true> = {};
        notificationsKeys
            .filter((key: string) => typeof storeState.userProfile[key] === 'undefined')
            .forEach((key: string) => {
                notificationCategoriesToEnable[key] = true;
            });
        this.storeRef?.dispatch(setNotificationPreferences(notificationCategoriesToEnable));
    }

    /**
     * Returns an object containing all the player tags that need to be set from the app side.
     * @param userProfile
     */
    private constructOneSignalTags (userProfile: IUserProfileState): Record<string, string> {
        // Construct tags and keep player up to date regarding its notification preferences
        let tags = {};
        Object.keys(userProfile).filter((key: keyof IUserProfileState) => {
            const notificationsPreferencesKeys = getNotificationsPreferences().map((pref: INotificationsPreferencesInfos) => {
                return pref?.key;
            });
            // @ts-ignore
            return notificationsPreferencesKeys.includes(key) && typeof userProfile[key] !== 'undefined';
        }).forEach((key: keyof IUserProfileState) => {
            tags[key] = userProfile[key].toString();
        });
        return tags;
    }
}
