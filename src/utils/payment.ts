import { BundleIdsEnum, isDebugBundleID, isStagingBundleID, isReleaseBundleID } from './bundleId';
import { ENDPOINTS } from './endpoints';
import { getRootComponentRef, store } from '../index';
import { IReduxState } from '../store/reducers';
import { IInfluencersState } from '../store/modules/influencers';
import { ISubscriptionState } from '../types/userSubscription';
import { logEvent } from './analytics';
import { isAndroid, isIOS } from './os';
import crashlytics from '@react-native-firebase/crashlytics';
import api from './api';

import { sortBy } from 'lodash';

import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import { Subscription } from 'react-native-iap';
import moment from 'moment';

// Info on how to test auto-renewable subscriptions:
// - iOS: https://medium.com/swift-india/auto-renewable-subscriptions-for-ios-3a4068f11acd
// - iOS: https://developer.apple.com/apple-pay/sandbox-testing/
// - Android: https://docs.revenuecat.com/docs/google-play-store
// - Andoird: https://developer.android.com/google/play/billing/billing_testing#solo

// WARNING: Don't take any risk with this and change ONLY `SHOULD_DEBUG_PAYMENT`
// Make sure you have a sandbox user handy or you won't be able to do anything
// (and might even end up paying real money!)
const SHOULD_DEBUG_PAYMENT = false; // WARNING: never commit this set to `true`!

export const SUBSCRIPTION_CHECK_INTERVAL = isDebugBundleID() || isStagingBundleID() ?
    1 * 60 * 1000 : // 1 minute
    6 * 3600 * 1000; // 6 hours

export const FREE_TRIAL_DAYS = 7;
const FREE_TRIAL_MINUTES_STAGING = 15;

const userLocale = RNLocalize.getLocales()[0]?.languageTag;

export enum PlanEnum {
    Monthly = 'monthly',
    Quarterly = 'quarterly',
    Annually = 'annually'
}

export interface ISubscriptionExtended extends Subscription {
    priceNumber: number;
    subscriptionLengthInDays: number;
}

export interface IPlanInfos {
    label: string;
    type: PlanEnum.Monthly | PlanEnum.Quarterly | PlanEnum.Annually;
    typeCheck: string;
}

export interface IPlansInfos {
    [PlanEnum.Monthly]: IPlanInfos;
    [PlanEnum.Quarterly]: IPlanInfos;
    [PlanEnum.Annually]: IPlanInfos;
}

// Handled as a separate function for clarity purposes
function isFirstPurchase (data: ISubscriptionState): boolean {
    return data?.subscription === null;
}

let lastSubscriptionCheck: number;
export async function checkSubscriptionStatus (activeSubCallback?: () => void): Promise<ISubscriptionState> {
    if (DISABLE_PAYMENT_FEATURES) {
        // Execute the callback here or it might never get called in dev and staging
        activeSubCallback && activeSubCallback();
        return;
    }
    if (lastSubscriptionCheck && Date.now() < lastSubscriptionCheck + SUBSCRIPTION_CHECK_INTERVAL) {
        SHOULD_DEBUG_PAYMENT && console.log('Check subscription: Too early to check subscription again...');
        return;
    }
    try {
        const { auth } = (store.getState() as IReduxState);
        if (!auth?.connected) {
            throw(new Error('Check subscription: User not connected'));
        }
        SHOULD_DEBUG_PAYMENT && console.log('Checking subscription...');
        const { data } = await api.get(ENDPOINTS.userSubscriptions + '/status');
        const { subscription, active } = (data as ISubscriptionState);
        // if (subscription === null || active === false) {
        if (!subscription || !active) {
            const firstPurchase = isFirstPurchase(data);
            getRootComponentRef()?.showPaywall(firstPurchase);
            SHOULD_DEBUG_PAYMENT && console.log('Check subscription: Inactive or missing subscription', { subscription, active });
            return;
        }
        setLastSubscriptionCheck(Date.now());
        activeSubCallback && activeSubCallback();
        SHOULD_DEBUG_PAYMENT && console.log('Check subscription: Subscription is active', subscription);
        return data;
    } catch (error) {
        const influencers: IInfluencersState = store?.getState().influencers;
        // TODO: determine if this happens on a regular basis
        // If yes, what can we do about it?
        // If `error.response` is defined, then it's an issue with our server (Axios response)
        SHOULD_DEBUG_PAYMENT && console.log('Check subscription: Error while checking subscription status', error);
        logEvent('subscription_check_error', {
            error,
            firstTouchId: influencers?.firstTouchId,
            firstTouchLink: influencers?.firstTouchLink,
            lastTouchId: influencers?.lastTouchId,
            lastTouchLink: influencers?.lastTouchLink
        });
        crashlytics().recordError(error);
    }
}

export function setLastSubscriptionCheck (date: number): void {
    lastSubscriptionCheck = date;
}

export function getPlansInfos (i18n: any): IPlansInfos {
    return {
        [PlanEnum.Monthly]: {
            label: i18n.t('confirmPayment.monthly'),
            type: PlanEnum.Monthly,
            typeCheck: 'month' // WARNING: this needs to be part of the relevant SUBSCRIPTION_IDS[x] to retrieve the proper style
        },
        [PlanEnum.Quarterly]: {
            label: i18n.t('confirmPayment.quarterly'),
            type: PlanEnum.Quarterly,
            typeCheck: 'quarter' // WARNING: this needs to be part of the relevant SUBSCRIPTION_IDS[x] to retrieve the proper style
        },
        [PlanEnum.Annually]: {
            label: i18n.t('confirmPayment.annually'),
            type: PlanEnum.Annually,
            typeCheck: 'annual' // WARNING: this needs to be part of the relevant SUBSCRIPTION_IDS[x] to retrieve the proper style
        }
    };
}

export function formatPrice (price: string | number, currency: string): string {
    if (!price) {
        return '';
    }
    const priceNumber = typeof price !== 'number' ? parseFloat(price) : price;
    const roundedPrice = parseFloat(priceNumber.toFixed(2));
    return new Intl.NumberFormat(userLocale, { style: 'currency', currency }).format(roundedPrice);
}

export function addInfoToSubscription (subscription: Subscription): ISubscriptionExtended {
    // Convert all subscription lengths to a specific number of days to sort them in the right order
    // (they are sent in a random order)
    // iOS returns a period number and a period unit (all strings)
    // Android returns the period in ISO 8601 format
    // For example, P1W equates to one week, P1M equates to one month, P3M equates to three months,
    // P6M equates to six months, and P1Y equates to one year.
    // More info: https://github.com/dooboolab/react-native-iap#typeof-product
    const days = {
        D: 1,
        M: 30,
        W: 7,
        Y: 365
    };

    let periodNumber: number;
    let periodUnit: string; // Will be 'D' | 'W' | 'M' | 'Y' (Day | Month | Week | Year)
    if (isIOS) {
        periodNumber = parseInt(subscription?.subscriptionPeriodNumberIOS, 10);
        periodUnit = subscription?.subscriptionPeriodUnitIOS?.substring(0, 1);
    } else {
        const periodString = subscription?.subscriptionPeriodAndroid;
        periodNumber = parseInt(periodString?.replace(/[^0-9]/g, ''), 10);
        periodUnit = periodString?.slice(-1);
    }

    const periodDays = days[periodUnit] || 1;
    const subscriptionLengthInDays = periodNumber * periodDays;
    const priceNumber = typeof subscription?.price !== 'number' ? parseFloat(subscription?.price) : subscription?.price;

    return {
        ...subscription,
        priceNumber,
        subscriptionLengthInDays
    };
}

export function getMonthlyCostPerDay (subscriptions: ISubscriptionExtended[]): number {
    if (!subscriptions || !subscriptions.length) {
        return 0;
    }
    let monthlyCostPerDay = 0;
    for (let i = 0; i < subscriptions.length; i++) {
        const subscription = subscriptions[i];
        if (subscription?.subscriptionLengthInDays === 30) {
            monthlyCostPerDay = subscription?.priceNumber / subscription?.subscriptionLengthInDays;
            break;
        }
    }
    return monthlyCostPerDay;
}

let cachedRemainingDays: number;
export function getTrialRemainingDays (subState?: ISubscriptionState): number {
    if (!subState && typeof cachedRemainingDays !== 'undefined') {
        // Use previously cached value if possible when parameter is omitted
        return cachedRemainingDays;
    }

    if (!subState || !subState.active || !subState.subscription || subState.subscription.trialPeriod === false) {
        return null;
    }
    const { subscription } = subState;
    // Make sure it's actually a trial and not a subscription that has been renewed and for which
    // the trialPeriod boolean hasn't been updated yet
    const IS_PROD = isReleaseBundleID();
    const timeUnit = IS_PROD ? 'days' : 'minutes';
    const diff = moment(subscription.endDate).diff(moment(subscription.startDate), timeUnit);
    // // 7-day limit in production and 15-minute limit in debug and staging
    if ((IS_PROD && diff > FREE_TRIAL_DAYS) || (!IS_PROD && diff > FREE_TRIAL_MINUTES_STAGING)) {
        return null;
    }
    const timeLeft = moment(subscription.endDate).diff(moment(), timeUnit);
    // The following will mimic the number of days left for debug/staging (15/2 ≈ 7)
    const remainingDays = timeLeft < 0 ? 0 : (IS_PROD ? timeLeft : Math.round(timeLeft / 2));
    cachedRemainingDays = remainingDays;
    return remainingDays;
}

// WARNING: you're not supposed to change any of those, so just don't!
const SUBSCRIPTION_IDS_LISTING = {
    android: {
        [BundleIdsEnum.debug]: [
            // 'com.nuli.app.wip.monthly.20200224',
            // 'com.nuli.app.wip.quarterly.20200224',
            // 'com.nuli.app.wip.annually.20200224'
            'com.nuli.app.wip.monthly.notrial',
            'com.nuli.app.wip.quarterly.notrial',
            'com.nuli.app.wip.annually.notrial'
        ],
        [BundleIdsEnum.staging]: [
            // 'nuli.subscription.monthly.test.20200207',
            // 'nuli.subscription.quarterly.test.20200208',
            // 'nuli.subscription.annual.test.20200207'
            'com.nuli.app.staging.monthly.notrial',
            'com.nuli.app.staging.quarterly.notrial',
            'com.nuli.app.staging.annually.notrial'
        ],
        [BundleIdsEnum.release]: [
            // 'com.nuli.app.release.monthly',
            // 'com.nuli.app.release.quarterly',
            // 'com.nuli.app.release.annually'
            'com.nuli.app.release.monthly.notrial',
            'com.nuli.app.release.quarterly.notrial',
            'com.nuli.app.release.annually.notrial'
        ]
    },
    ios: {
        [BundleIdsEnum.debug]: [
            // 'com.nuli.app.wip.monthly',
            // 'com.nuli.app.wip.quarterly',
            // 'com.nuli.app.wip.annually'
            'com.nuli.app.wip.monthly.notrial',
            'com.nuli.app.wip.quarterly.notrial',
            'com.nuli.app.wip.annually.notrial'
        ],
        [BundleIdsEnum.staging]: [
            // 'com.nuli.app.staging.monthly',
            // 'com.nuli.app.staging.quarterly',
            // 'com.nuli.app.staging.annually'
            'com.nuli.app.staging.monthly.notrial',
            'com.nuli.app.staging.quarterly.notrial',
            'com.nuli.app.staging.annually.notrial'
        ],
        [BundleIdsEnum.release]: [
            // 'com.nuli.app.release.monthly',
            // 'com.nuli.app.release.quarterly',
            // 'com.nuli.app.release.annually'
            'com.nuli.app.release.monthly.notrial',
            'com.nuli.app.release.quarterly.notrial',
            'com.nuli.app.release.annually.notrial'
        ]

    }
};

export function getSubscriptionsSkus (): string[] {
    const bundleId = DeviceInfo.getBundleId();
    return SUBSCRIPTION_IDS_LISTING[isAndroid ? 'android' : 'ios'][bundleId || BundleIdsEnum.release];
}

export function sortSubscriptions (subscriptions: Subscription[]): ISubscriptionExtended[] {
    // Add useful info
    const expendedSubscriptions = subscriptions.map((subscription: Subscription) => {
        return addInfoToSubscription(subscription);
    });
    // Subscriptions are returned in a random order while we want them as: monthly, quarterly, annually
    return sortBy(expendedSubscriptions, [(s: ISubscriptionExtended) => s.subscriptionLengthInDays]);
}

// Move this precious variable away from sight
// We disable payment feature for beta testers or they would either get stuck or have to pay real money
// unless the build was downloaded from TestFlight (no such luck for Android users)
// The following will (and should!) always default to `false` for release builds
// WARNING: don't mess that up or users either:
// - won't be taken to the payment page and will only see the paywall afterwards
// - will get stuck on the payment page
// The reason we're doing that is because sandbox testers are the only ones who can go through the payment flow without actually paying
// The other options would be:
// 1. Activate payment for everyone -> Beta testers will have to pay
// 2. Not being able to test the payment without playing around with custom variables in different files -> Way too dangerous
// 3. Creating sandbox users for each and every tester -> They shouldn't be able to use those credentials
// in the release version (since iOS make them unsuable), but that's still a risk we don't want to take
// On top of that, sandbox users can only be created with emails that have never been associated
// with an Apple account before, which makes it particularly cumbersome
export const DISABLE_PAYMENT_FEATURES = isReleaseBundleID() ?
    false : // Never ever change this!
    (isStagingBundleID() || isDebugBundleID()) && !SHOULD_DEBUG_PAYMENT;

if (DISABLE_PAYMENT_FEATURES) {
    console.warn('Payment features disabled');
    if (isReleaseBundleID()) {
        alert('WARNING: payment features are disabled in a release build!');
    }
} else {
    console.log('Payment features enabled');
}
