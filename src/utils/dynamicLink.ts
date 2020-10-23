import dynamicLinks from '@react-native-firebase/dynamic-links';
import { Store } from 'redux';
import { AxiosResponse } from 'axios';
import api from './api';
import { checkFirstLaunch } from './init';
import { getTouchIdFromTouchLink } from './influencers';
import { logEvent } from './analytics';
import {
    setFirstTouchId ,
    setFirstTouchLink,
    setLastTouchId,
    setLastTouchLink
} from '../store/modules/influencers';
import { ENDPOINTS } from './endpoints';

// Once this delay has passed, ditch the previously stored touchId and set it to 'none'
const KEEP_TOUCH_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function handleDynamicLink(store: Store, initialLink: { url: string }): Promise<void> {
    // This method is called both in onLink() and onRehydrated()
    const isFirstLaunch = await checkFirstLaunch();

    if (!store) {
        return;
    }

    let url;
    if (initialLink) {
        url = initialLink?.url;
    } else {
        const initialLink = await dynamicLinks().getInitialLink();
        url = initialLink?.url;
    }

    // WARNING: everything related to the very first launch is critical
    // This is where we'll determine if the user comes from a specific influencer link
    // and this will in turn determine how the revenue will be splitted between influencers!
    const currentFirstTouchLink = store?.getState()?.influencers?.firstTouchLink;
    const currentFirstTouchId = store?.getState()?.influencers?.firstTouchId;

    if (isFirstLaunch) {
        const firstTouchLink = url || 'none';
        const firstTouchId = getTouchIdFromTouchLink(url) || 'none';

        logEvent('app_first_launch', {
            firstTouchId,
            firstTouchLink,
            lastTouchId: firstTouchId,
            lastTouchLink: firstTouchLink
        });
        logEvent('app_launch_from_link', {
            firstTouchId,
            firstTouchLink,
            lastTouchId: firstTouchId,
            lastTouchLink: firstTouchLink
        });

        if (url && firstTouchId && firstTouchLink) {
            if (!currentFirstTouchLink && !currentFirstTouchId) {
                // Make sure this can only be updated once since if the app isn't killed, firstLaunch
                // will be true when bringing it on the foreground
                store.dispatch(setFirstTouchId(firstTouchId || 'none'));
                store.dispatch(setFirstTouchLink(firstTouchLink || 'none'));
            }
            // We also set lastTouchId and lastTouchLink with the same value
            store.dispatch(setLastTouchId(firstTouchId));
            store.dispatch(setLastTouchLink(firstTouchLink));
        } else {
            store.dispatch(setFirstTouchId('none'));
            store.dispatch(setFirstTouchLink('none'));
            store.dispatch(setLastTouchId('none'));
            store.dispatch(setLastTouchLink('none'));
        }
    } else {
        const lastTouchLink = url || 'none';
        const lastTouchId = url ? getTouchIdFromTouchLink(url) : 'none';
        const currentLastTouchLink = store?.getState()?.influencers?.lastTouchLink;
        const currentLastTouchId = store?.getState()?.influencers?.lastTouchId;
        const lastTouchUpdateTimestamp = store?.getState()?.influencers?.lastTouchUpdateTimestamp;

        logEvent('app_launch_from_link', {
            firstTouchId: currentFirstTouchId,
            firstTouchLink: currentFirstTouchLink,
            lastTouchId,
            lastTouchLink
        });

        if (Date.now() - lastTouchUpdateTimestamp >= KEEP_TOUCH_DURATION) {
            // Remove the previously stored touch id once some time has passed
            store.dispatch(setLastTouchId('none'));
            store.dispatch(setLastTouchLink('none'));
            return;
        }

        // No need to update lastTouchLink and lastTouchId if they haven't changed
        if (lastTouchLink === currentLastTouchLink && lastTouchId === currentLastTouchId) {
            return;
        }

        const currentLastTouchIsNone = currentLastTouchLink === 'none' && currentLastTouchId === 'none';

        // Update lastTouchLink and lastTouchId if needed
        if (lastTouchId && !currentLastTouchIsNone) {
            store.dispatch(setLastTouchId(lastTouchId));
            store.dispatch(setLastTouchLink(lastTouchLink));
        }
    }
}

export async function updateUserDynamicLinkInDB (userId: string, lastTouchId: string, lastTouchLink: string,): Promise<AxiosResponse<any>> {
    if (lastTouchId && lastTouchLink) {
        return api.put(ENDPOINTS.users + '/' + userId, { lastTouchId, lastTouchLink });
    }
}
