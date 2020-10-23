// Useful tutorial
// https://levelup.gitconnected.com/a-b-testing-in-react-native-has-never-so-easy-firebase-is-here-67836a35e0d3

import remoteConfig, { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';
import { isDebugBundleID } from './bundleId';

export type TRemoteConfigKeys = 'trial_paywall_content' | 'trial_widget';
export const REMOTE_CONFIG_VARIABLES: Record<string, { key: TRemoteConfigKeys; defaultValue: any }> = {
    paywallContent: {
        key: 'trial_paywall_content',
        defaultValue: 'video_candice' // 'video_candice' || 'video_testimonial' || 'text_you' || 'text_trial'
    },
    trialWidget: {
        key: 'trial_widget',
        defaultValue: 'banner' // 'banner' || 'toast'
    }
};

export async function initRemoteConfig (): Promise<void> {
    await remoteConfig().setDefaults({
        [REMOTE_CONFIG_VARIABLES.paywallContent.key]: REMOTE_CONFIG_VARIABLES.paywallContent.defaultValue,
        [REMOTE_CONFIG_VARIABLES.trialWidget.key]: REMOTE_CONFIG_VARIABLES.trialWidget.defaultValue
    });
    await remoteConfig().setConfigSettings({
        isDeveloperModeEnabled: isDebugBundleID()
    });
    await remoteConfig().fetchAndActivate();
}

export async function fetchRemoteConfig (): Promise<void> {
    await remoteConfig().fetch();
}

export async function refreshConfig (): Promise<void> {
    await remoteConfig().fetchAndActivate();
}

export function getRemoteConfigValue (key: TRemoteConfigKeys): FirebaseRemoteConfigTypes.ConfigValue {
    return remoteConfig().getValue(key);
}
