import analytics from '@react-native-firebase/analytics';

/** Set current screen on Firebase Analytics */
export function setCurrentScreen (routeName: string): void {
    analytics().setCurrentScreen(routeName, routeName);
}

/**
 * Log event to Firebase Analytics
 *
 * All your params must contain strings, numbers or booleans. Otherwise an empty string will be sent instead
 */
export function logEvent (name: string, params?: { [key: string]: string | number | boolean }): void {
    // We can only send strings or numbers in params so we need to make sure that we don't send anything else
    params && Object.keys(params).forEach((key: string) => {
        if (typeof params[key] === 'boolean') {
            params[key] = params[key].toString();
        } else if (typeof params[key] !== 'string' && typeof params[key] !== 'number') {
            params[key] = '';
        }
    });

    analytics().logEvent(name, params);
}

