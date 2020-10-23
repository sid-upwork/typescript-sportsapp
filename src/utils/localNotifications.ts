import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import i18n from '../utils/i18n';
import { isAndroid } from './os';

export interface ILocalNotificationDetails {
    body: string;
    group?: string;
    isSilent?: boolean;
    title?: string;
}

export interface IScheduledLocalNotificationDetails {
    body: string;
    group?: string;
    date: Date;
    id: number;
    isSilent?: boolean;
    soundName?: string;
    title?: string;
}

enum ENotificationIds {
    rest = 0,
    sevenDaysInactivity = 1,
    timedSet = 2
}

enum ENotificationGroups {
    workout = 'workout',
    inactivity = 'inactivity'
}

// ----- Helpers -----

export function scheduleRestLocalNotification (seconds: number): void {
    let date = new Date();
    date.setSeconds(date.getSeconds() + seconds);

    scheduleLocalNotification({
        body: i18n.t('notifications.rest.body'),
        date,
        group: ENotificationGroups.workout,
        id: ENotificationIds.rest,
        title: i18n.t('notifications.rest.title')
    });
}

export function cancelRestLocalNotification (): void {
    cancelLocalNotification(ENotificationIds.rest);
}

export function scheduleTimedSetLocalNotification (seconds: number, soundName?: string): void {
    let date = new Date();
    date.setSeconds(date.getSeconds() + seconds);

    scheduleLocalNotification({
        body: i18n.t('notifications.timedSet.body'),
        date,
        group: ENotificationGroups.workout,
        id: ENotificationIds.timedSet,
        soundName,
        title: i18n.t('notifications.timedSet.title')
    });
}

export function cancelTimedSetLocalNotification (): void {
    cancelLocalNotification(ENotificationIds.timedSet);
}

export function scheduleSevenDaysInactivityLocalNotification (): void {
    let date = new Date();
    date.setDate(date.getDate() + 7);

    scheduleLocalNotification({
        body: i18n.t('notifications.sevenDaysInactivity.body'),
        date,
        group: ENotificationGroups.inactivity,
        id: ENotificationIds.sevenDaysInactivity,
        title: i18n.t('notifications.sevenDaysInactivity.title')
    });
}

export function cancelSevenDaysInactivityLocalNotification (): void {
    cancelLocalNotification(ENotificationIds.sevenDaysInactivity);
}

// ----- Native functions -----

/** Displays a local notification instantly */
export function presentLocalNotification (details: ILocalNotificationDetails): void {
    if (isAndroid) {
        // https://github.com/zo0r/react-native-push-notification#local-notifications
        PushNotification.localNotification({
            group: details.group,
            largeIcon: 'ic_launcher',
            message: details.body,
            playSounds: details.isSilent ? false : true,
            smallIcon: 'ic_notification',
            title: details.title,
            vibration: 350
        });
    } else {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
        // https://facebook.github.io/react-native/docs/pushnotificationios#presentlocalnotification
        PushNotificationIOS.presentLocalNotification({
            alertBody: details.body,
            alertTitle: details.title,
            category: details.group,
            isSilent: details.isSilent
        });
    }
}

/**
 * Schedules a local notification to be displayed later
 *
 * You need to provide an id to unically identify the notification
 */
function scheduleLocalNotification (details: IScheduledLocalNotificationDetails): void {
    if (isAndroid) {
        // https://github.com/zo0r/react-native-push-notification#scheduled-notifications
        PushNotification.localNotificationSchedule({
            date: details.date,
            group: details.group,
            largeIcon: 'ic_launcher',
            id: details.id.toString(),
            message: details.body,
            playSounds: details.isSilent ? false : true,
            smallIcon: 'ic_notification',
            soundName: details.soundName || 'default', // Not working for now; see https://github.com/zo0r/react-native-push-notification/pull/1042
            title: details.title,
            vibration: 350
        });
    } else {
        // https://facebook.github.io/react-native/docs/pushnotificationios#schedulelocalnotification
        // https://github.com/react-native-community/push-notification-ios#schedulelocalnotification
        PushNotificationIOS.scheduleLocalNotification({
            alertBody: details.body,
            alertTitle: details.title,
            category: details.group,
            fireDate: details.date.toISOString(),
            isSilent: details.isSilent,
            soundName: details.soundName,
            userInfo: { id: details.id }
        });
    }
}

/** Cancels a scheduled local notifications by id */
function cancelLocalNotification (id: number): void {
    if (isAndroid) {
        // https://github.com/zo0r/react-native-push-notification#1-cancellocalnotifications
        PushNotification.cancelLocalNotifications({ id: id.toString() });
    } else {
        // https://facebook.github.io/react-native/docs/pushnotificationios#cancellocalnotifications
        PushNotificationIOS.cancelLocalNotifications({ id });
    }
}

/** Cancels all scheduled local notifications */
export function cancelAllLocalNotifications (): void {
    if (isAndroid) {
        // https://github.com/zo0r/react-native-push-notification#2-cancelalllocalnotifications
        PushNotification.cancelAllLocalNotifications();
    } else {
        // https://facebook.github.io/react-native/docs/pushnotificationios#cancellocalnotifications
        PushNotificationIOS.cancelLocalNotifications({});
    }
}

// /** Get all local notifications scheduled to be displayed (iOS only) */
// export function getScheduledLocalNotifications (): Promise<ScheduleLocalNotificationDetails[]> {
//     // https://facebook.github.io/react-native/docs/pushnotificationios#getscheduledlocalnotifications
//     // We've turned this one into a promise to make it easier to use

//     return new Promise ((resolve: any) => {
//         PushNotificationIOS.getScheduledLocalNotifications((notifications: ScheduleLocalNotificationDetails[]) => {
//             resolve(notifications);
//         });
//     });
// }
