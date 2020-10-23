import AsyncStorage from '@react-native-community/async-storage';
import { isDebugBundleID } from './bundleId';

const ACTIVATE_LOGBOX = false;
const DEBUG = isDebugBundleID();

// This won't survive app's uninstalls
const FIRST_LAUNCH_KEY = 'appFirstLaunch';

let isFirstLaunchCache = false;

if (DEBUG) {
    if (ACTIVATE_LOGBOX) {
        // Use the new LogBox introduced in RN 0.62;
        require('react-native').unstable_enableLogBox();
    } else {
        // Disable yellow boxes on the device
        (console as any).disableYellowBox = true;
    }
}

export default () => {};

async function setAppFirstLaunched (): Promise<boolean> {
    try {
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
        return true;
    } catch (error) {
        if (DEBUG) {
            console.log('setAppFirstLaunched | AsyncStorage error', error);
        }
        return false;
    }
}

export function setIsFirstLaunchCache (isFirstLaunch: boolean): void {
    isFirstLaunchCache = isFirstLaunch;
}

export async function checkFirstLaunch (): Promise<boolean> {
    // This ensures that all calls subsequent calls will return true on first launch
    if (isFirstLaunchCache) {
        return isFirstLaunchCache;
    }

    try {
        const hasLaunched = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (!hasLaunched) {
            const stored = await setAppFirstLaunched();
            setIsFirstLaunchCache(stored);
            return stored;
        }
        return false;
    } catch (error) {
        if (DEBUG) {
            console.log('checkFirstLaunch | AsyncStorage error', error);
        }
        return false;
    }
}
