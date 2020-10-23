// https://github.com/kmagiera/react-native-gesture-handler/issues/783
import 'react-native-gesture-handler';

// Enable the listener that get the JS stacktrace into the Crash Reporting console in Firebase
import '@react-native-firebase/crashlytics';

import React, { Component, Fragment } from 'react';
import { View, AppState, AppStateStatus, StatusBar, EmitterSubscription } from 'react-native';
import configureStore from './store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Store } from 'redux';
import { navigate } from './navigation/services';
import { retryQueue } from './store/modules/apiQueue';
import { setNetworkState, INetworkState } from './store/modules/network';
import { setAppInBackground, setPurchasedDuringSession } from './store/modules/userInterface';
import { setNotificationPermissionRequested, setLocale } from './store/modules/userProfile';
import { IWorkoutProgressionState } from './store/modules/workoutProgression';
import { logEvent } from './utils/analytics';
import api from './utils/api';
import { isDebugBundleID } from './utils/bundleId';
import { initDeeplinkingListener, removeDeeplinkingListener } from './utils/deeplink';
import { ENDPOINTS } from './utils/endpoints';
import { handleJSExceptions } from './utils/errors';
import i18n, { LANGUAGES, callSafeLocale, shouldDefaultToEnglish } from './utils/i18n';
import { refreshInfluencers } from './utils/influencers';
import init, { setIsFirstLaunchCache } from './utils/init';
import {
    scheduleSevenDaysInactivityLocalNotification,
    cancelSevenDaysInactivityLocalNotification
} from './utils/localNotifications';
import OneSignalManager from './utils/oneSignal';
import { isIOS, isAndroid } from './utils/os';
import { DISABLE_PAYMENT_FEATURES, setLastSubscriptionCheck } from './utils/payment';
import { refreshProgression } from './utils/progression';
import { ISubscriptionValidationResponse } from './types/userSubscription';
// import { CODEPUSH_KEY_IOS, CODEPUSH_KEY_ANDROID } from '../env';

import chroma from 'chroma-js';

import codePush from 'react-native-code-push';
import crashlytics from '@react-native-firebase/crashlytics';
import RNIap, { PurchaseError, Purchase } from 'react-native-iap';
import { enableScreens } from 'react-native-screens';
import * as localize from 'react-native-localize';
import PushNotificationIOS, { PushNotificationPermissions } from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

import KeyboardManager from 'react-native-keyboard-manager';
import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker';
import Smartlook from 'smartlook-react-native-wrapper';

import { AppContainer } from './navigation/AppContainer';
import AppDrawer from './components/AppDrawer';
import CustomSplashscreen, { ANIMATION_DELAY, LOGO_ANIMATION_DURATION } from './components/CustomSplashscreen';
import Loader from './components/Loader';
import OngoingWorkout from './components/Popups/OngoingWorkout';
import Paywall from './components/Paywall';
import PopupManager from './components/PopupManager';
import RootLoader from './components/RootLoader';
import ThankYou from './components/Popups/ThankYou';
import ToastManager from './components/ToastManager';

import { handleDynamicLink, updateUserDynamicLinkInDB } from './utils/dynamicLink';
import { initRemoteConfig } from './utils/remoteConfig';
import { resetPinCodeInKeychain } from './utils/pinCode';
import { IReduxState } from './store/reducers';

import colors from './styles/base/colors.style';
import { ONGOING_WORKOUT_POPUP_HEIGHT } from './styles/components/Popups/OngoingWorkout.style';
import { THANK_YOU_POPUP_HEIGHT, THANK_YOU_POPUP_WIDTH } from './styles/components/Popups/ThankYou.style';
import styles, { GRADIENT_COLORS } from './styles/views/Root.style';

export const { store, persistor } = configureStore();

const IS_DEBUG = isDebugBundleID();

// CodePush Options
// Fully silent update which keeps the app in sync with the server
// without ever interrupting the end user
let codePushOptions;
if (IS_DEBUG) {
    codePushOptions = {
        checkFrequency: codePush.CheckFrequency.MANUAL // To avoid error message, desactivate update for Debug (since sync() is not called)
    };
} else {
    codePushOptions = {
        checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
        installMode: codePush.InstallMode.ON_NEXT_RESTART,
        deploymentKey: isAndroid ? CODEPUSH_KEY_ANDROID : CODEPUSH_KEY_IOS
    };
}

// Enable library why-did-you-render if DEBUG mode
if (IS_DEBUG) {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        logOnDifferentValues: true,
        collapseGroups: true
    });
}

// Enable screens in react-navigation
isIOS && enableScreens();

// Better keyboard on iOS
if (isIOS) {
    KeyboardManager.setEnable(true);
    KeyboardManager.setKeyboardDistanceFromTextField(30);
    KeyboardManager.setEnableAutoToolbar(false);
    KeyboardManager.setToolbarPreviousNextButtonEnable(false);
}

export interface IScreenProps {
    handler: () => {};
    popupManagerRef: React.RefObject<PopupManager>;
    rootLoaderRef: React.RefObject<RootLoader>;
    toastManagerRef: React.RefObject<ToastManager>;
}

interface IProps {}

interface IState {
    firstPurchase: boolean;
    paywallCloseButton: boolean;
    renderPaywall: boolean;
    renderSplashscreen: boolean;
}

class Root extends Component<IProps, IState> {

    private appStateStatus: AppStateStatus;
    private initialLink: { url: string };
    private netInfoUnsubscribe: Function;
    private onLinkUnsubscribe: Function;
    private oneSignalManager: OneSignalManager;
    private paywallRef: React.RefObject<any>;
    private popupManagerRef: React.RefObject<PopupManager>;
    private purchaseUpdateListener: EmitterSubscription;
    private purchaseErrorListener: EmitterSubscription;
    private rootLoaderRef: React.RefObject<RootLoader>;
    private safetyTimer: any;
    private screenProps: IScreenProps;
    private store: Store;
    private toastManagerRef: React.RefObject<ToastManager>;
    private workoutProgressionChecked: boolean;

    constructor (props: IProps) {
        super(props);
        initRemoteConfig();
        this.state = {
            firstPurchase: false,
            paywallCloseButton: false,
            renderPaywall: false,
            renderSplashscreen: true
        };
        this.store = store;
        this.appStateStatus = AppState.currentState;
        this.paywallRef = React.createRef();
        this.popupManagerRef = React.createRef();
        this.rootLoaderRef = React.createRef();
        this.toastManagerRef = React.createRef();
        this.screenProps = {
            handler: () => {},
            popupManagerRef: this.popupManagerRef,
            rootLoaderRef: this.rootLoaderRef,
            toastManagerRef: this.toastManagerRef
        };
        this.workoutProgressionChecked = false;

        this.oneSignalManager = new OneSignalManager(this.store);
        this.oneSignalManager.init();

    }

    public getScreenProps(): IScreenProps {
        return this.screenProps;
    }

    public getOneSignalManager(): OneSignalManager {
        return this.oneSignalManager;
    }

    public async componentDidMount (): Promise<void> {
        AppState.addEventListener('change', this.handleAppStateChange);
        initDeeplinkingListener(store);
        this.netInfoUnsubscribe = NetInfo.addEventListener(this.handleNetworkStateChange);

        Orientation.lockToPortrait();

        this.safetyTimer = setTimeout(() => {
            this.setState({ renderSplashscreen: false });
        }, ANIMATION_DELAY + LOGO_ANIMATION_DURATION + 1000);

        // Handle JS errors
        // Done here so we can access the popup manager
        // Set the third parameter to `true` if you want to see the custom handling in debug mode
        // WARNING: no more red alerts for you if you do that!
        handleJSExceptions(this.popupManagerRef, this.rootLoaderRef, false);

        // Get Firebase's dynamic link
        // WARNING: we can only retrieve the short link so it seems
        // https://stackoverflow.com/a/57320094/8412141
        // Make sure to create those links with every piece of required data in the url
        // See: https://github.com/meliorence/app.nuli/wiki/Dynamic-links
        // iOS > Can't get it to work on a release build on first open, which kind of defeats the purpose
        // https://github.com/invertase/react-native-firebase/issues/2661
        // https://github.com/invertase/react-native-firebase/issues/2660
        // https://github.com/invertase/react-native-firebase/issues/1901
        // https://github.com/invertase/react-native-firebase/issues/1311
        // https://github.com/invertase/react-native-firebase/issues/661
        // We're hacking our way to this precious link
        this.onLinkUnsubscribe = dynamicLinks().onLink( (link: { url: string }) => {
            this.initialLink = link;
            handleDynamicLink(store, this.initialLink);
        });

        //Must not use until the IOS issue is fixed
        //https://github.com/smartlook/smartlook-react-native-sdk/issues/18#issuecomment-654690399
        //Smartlook.setup(SMARTLOOK_KEY, 5);
        //startSmartlookRecordOnFirstAppLaunch();
    }

    public componentDidUpdate (): void {
        if (this.popupManagerRef?.current && store && !this.workoutProgressionChecked) {
            this.checkWorkoutProgression();
        }
    }

    public componentWillUnmount (): void {
        AppState.removeEventListener('change', this.handleAppStateChange);
        removeDeeplinkingListener();
        clearTimeout(this.safetyTimer);
        this.netInfoUnsubscribe && this.netInfoUnsubscribe();
        this.onLinkUnsubscribe && this.onLinkUnsubscribe();

        if (this.purchaseUpdateListener) {
            this.purchaseUpdateListener.remove();
            this.purchaseUpdateListener = null;
        }
        if (this.purchaseErrorListener) {
            this.purchaseErrorListener.remove();
            this.purchaseErrorListener = null;
        }

        if (isIOS) {
            PushNotificationIOS.removeEventListener('localNotification', this.handleNotification);
        }
    }

    public hidePaywall = (): void => {
        if (this.state.renderPaywall !== false) {
            if (this.paywallRef?.current?.animateOut) {
                this.paywallRef?.current?.animateOut(() => {
                    this.setState({ renderPaywall: false });
                });
            } else {
                this.setState({ renderPaywall: false });
            }
        }
    }

    public showPaywall = (firstPurchase?: boolean, closeButton?: boolean): void => {
        if (this.state.renderPaywall !== true) {
            this.setState({
                firstPurchase,
                paywallCloseButton: !!closeButton,
                renderPaywall: true
            });
        }
    }

    public isPaywallVisible = (): boolean => {
        return this.state.renderPaywall;
    }

    public isFirstPurchase = (): boolean => {
        return this.state.firstPurchase;
    }

    private handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (this.appStateStatus.match(/inactive|background/) && nextAppState === 'active') {
            // App is coming back to foreground
            store.dispatch(setAppInBackground(false));
            store.dispatch(retryQueue());
        }

        if (this.appStateStatus.match(/active/) && nextAppState === 'inactive' || nextAppState === 'background') {
            // App is going to background
            store.dispatch(setAppInBackground(true));
            // We consider it's not a firsdt laucnh anymore after the app has been put in background
            setIsFirstLaunchCache(false);
        }
        this.appStateStatus = nextAppState;
    }

    private handleNetworkStateChange = (state: NetInfoState) => {
        const newState: INetworkState = {
            type: state.type,
            isInternetReachable: state.isInternetReachable
        };
        store.dispatch(setNetworkState(newState));
    }

    private handleNotification (notification: any): void {}

    private async initPurchase(): Promise<void> {
        this.purchaseUpdateListener = RNIap.purchaseUpdatedListener(this.onPurchaseUpdate);
        this.purchaseErrorListener = RNIap.purchaseErrorListener(this.onPurchaseError);
        try {
            const result = await RNIap.initConnection();
            IS_DEBUG && console.log('initPurchase', result);
        } catch (error) {
            console.warn(error.code, error.message);
            logEvent('subscription_init_purchase_error', { error });
            crashlytics().recordError(error);
        }
    }

    private onPurchaseUpdate = async (purchase: Purchase): Promise<void> => {
        const receipt = purchase?.transactionReceipt;
        if (receipt) {
            try {
                const result = await RNIap.finishTransaction(purchase, false);

                // Avoid opening the thank you popup after an automatic renewal (hacky workaround...)
                const subStatus = await api.get(ENDPOINTS.userSubscriptions + '/status');

                const { data } = await api.post(
                    ENDPOINTS.userSubscriptions + '/validateReceipt',
                    { receipt, platform: isAndroid ? 'android' : 'ios' }
                );
                if (!(data as ISubscriptionValidationResponse).success) {
                    this.handlePurchaseError(new Error(i18n.t('payment.purchaseErrorInvalidReceipt')));
                    return;
                }
                this.onPurchaseSuccess(result, subStatus?.data?.active);
            } catch (err) {
                if (err?.response) {
                    this.handlePurchaseError(new Error(i18n.t('payment.purchaseErrorInvalidReceipt')));
                } else {
                    this.handlePurchaseError(err);
                }
            }

            IS_DEBUG && console.log('Receipt: ' + receipt);
        } else {
            this.handlePurchaseError(new Error(i18n.t('payment.purchaseErrorMissingReceipt')));
        }
    }

    private onPurchaseSuccess = async (result: string | void, alreadyActive: boolean) => {
        const state: IReduxState = store?.getState();
        const influencers = state?.influencers;
        const lastTouchId = influencers?.lastTouchId;
        const lastTouchLink = influencers?.lastTouchLink;
        const popupManager = this.screenProps?.popupManagerRef?.current;
        const productId = typeof result === 'string' ? result : '';

        IS_DEBUG && console.log('Purchase success', productId);
        logEvent('subscription_purchase_success', {
            firstTouchId: influencers?.firstTouchId,
            firstTouchLink: influencers?.firstTouchLink,
            lastTouchId,
            lastTouchLink,
            productId
        });

        // Close root loader
        this.screenProps?.rootLoaderRef?.current?.close();

        // Dismiss confirm payment popup
        if (popupManager?.currentPopup) {
            popupManager.dismissPopup();
        }

        // Make sure to close the paywall
        getRootComponentRef()?.hidePaywall();

        // Reset the last subscription check timestamp
        setLastSubscriptionCheck(null);
        // Update purchased during session flag (this is not persisted)
        store.dispatch(setPurchasedDuringSession(true));

        if (!alreadyActive) {
            const firstPurchase = this.isFirstPurchase();
            const eventName = `subscription_popup_thankyou_${firstPurchase ? 'payment' : 'paywall'}`;
            logEvent(eventName, {
                firstPurchase,
                platform: isAndroid ? 'android' : 'ios',
                productId
            });

            // Open the "thank you" popup
            this.screenProps?.popupManagerRef?.current?.requestPopup({
                backgroundColors: ['white'],
                backgroundType: 'color',
                borderRadius: 36,
                closeButtonBackgroundColor: colors.pink,
                ContentComponent: ThankYou,
                ContentComponentProps: {
                    firstPurchase
                },
                height: THANK_YOU_POPUP_HEIGHT,
                scrollView: true,
                width: THANK_YOU_POPUP_WIDTH
            });
        }

        await updateUserDynamicLinkInDB(state?.userProfile?.id, lastTouchId, lastTouchLink);
    }

    private onPurchaseError = (error: PurchaseError): void => {
        this.handlePurchaseError(error);
    }

    private handlePurchaseError = (error: PurchaseError): void => {
        const influencers = store?.getState()?.influencers;
        const errorMessage = error?.message ? ` (${error?.message})` : '';

        console.warn(error?.code, error?.message);
        logEvent('subscription_purchase_error', {
            errorCode: error?.code,
            errorMessage: error?.message,
            firstTouchId: influencers?.firstTouchId,
            firstTouchLink: influencers?.firstTouchLink,
            lastTouchId: influencers?.lastTouchId,
            lastTouchLink: influencers?.lastTouchLink
        });
        crashlytics().recordError(new Error(errorMessage));

        // Close root loader
        this.screenProps?.rootLoaderRef?.current?.close();

        // Warn the user
        this.screenProps?.toastManagerRef?.current?.openToast({
            duration: 5000,
            message: `${i18n.t('payment.purchaseError')}${errorMessage}`,
            type: 'error'
        });
    }

    private onRehydrated = async () => {
        init();
        this.detectLocale();
        refreshInfluencers();
        handleDynamicLink(store, this.initialLink);

        // Init purchase features
        // Done here in order to access the store
        if (!DISABLE_PAYMENT_FEATURES) {
            this.initPurchase();
        }

        if (store?.getState()?.auth?.connected) {
            refreshProgression();
            store.dispatch(retryQueue());
        } else {
            // Make sure to erase any previous leftover pin code
           await resetPinCodeInKeychain();
        }

        const handleInactivityNotification = (): void => {
            cancelSevenDaysInactivityLocalNotification(); // Cancel previous inactivity notification
            scheduleSevenDaysInactivityLocalNotification(); // Schedule new inactivity notification
        };

        if (isIOS) {
            // Add the event listener first otherwise `PushNotificationIOS.requestPermissions()` will never resolve
            // https://github.com/facebook/react-native/issues/9105#issuecomment-246180895
            PushNotificationIOS.addEventListener('localNotification', this.handleNotification);
            PushNotificationIOS.checkPermissions((permissions: PushNotificationPermissions) => {
                // Permissions granted
                if (permissions?.alert) {
                    handleInactivityNotification();
                }
            });
        } else {
            PushNotification.configure({
                onNotification: (notification: any) => { this.handleNotification(notification); },
                popInitialNotification: true
            });
            handleInactivityNotification();

            if (!store?.getState().userProfile?.notificationPermissionRequested) {
                store.dispatch(setNotificationPermissionRequested(true));
            }
        }
    }

    private detectLocale (): void {
        if (!store) {
            return;
        }

        if (!store.getState().userProfile || !store.getState().userProfile.locale) {
            // No locale has been set yet
            const locales = localize.getLocales();
            if (Array.isArray(locales)) {
                const languageTag = locales[0].languageTag;
                if (languageTag?.startsWith('en') || shouldDefaultToEnglish(languageTag)) {
                    // If we detect an English locale we use enUS
                    store.dispatch(setLocale(LANGUAGES.enUS.locale)); // This will automatically update i18n and moment
                } else {
                    // We default to Chinese otherwise with zhTW
                    store.dispatch(setLocale(LANGUAGES.zhTW.locale)); // This will automatically update i18n and moment
                }
            }
        } else {
            // No need to set the store here since we already have a locale, we just update i18n and moment
            const locale = store.getState().userProfile.locale;
            i18n.locale = locale;
            callSafeLocale(locale);
        }
    }

    private checkWorkoutProgression (): void {
        const workoutProgression: IWorkoutProgressionState = store.getState().workoutProgression;

        if (!workoutProgression || !workoutProgression?.currentWorkout || !workoutProgression?.workoutHistory) {
            this.workoutProgressionChecked = true;
            return;
        }

        if (!!workoutProgression?.currentWorkout) {
            this.workoutProgressionChecked = true;

            // We have an ongoing workout
            this.popupManagerRef?.current?.requestPopup({
                ContentComponent: OngoingWorkout,
                ContentComponentProps: {
                    navigate: navigate,
                    popupManagerRef: this.popupManagerRef,
                    toastManagerRef: this.toastManagerRef
                },
                height: ONGOING_WORKOUT_POPUP_HEIGHT,
                position: 'bottom',
                scrollView: true,
                title: i18n.t('ongoingWorkout.title')
            });
        }
    }

    private get statusBar (): JSX.Element {
        return isAndroid ? (
            <StatusBar
                animated={true}
                translucent={true}
                backgroundColor={chroma(colors.violetDark).alpha(0.5).css()}
            />
        ) : null;
    }

    private get drawerBackground (): JSX.Element {
        return (
            <LinearGradient
                angle={112}
                colors={GRADIENT_COLORS}
                style={styles.drawerBackground}
                useAngle={true}
            />
        );
    }

    private get loader (): JSX.Element {
        return (
            <View style={styles.loaderContainer}>
                { this.drawerBackground }
                <Loader color={colors.white} />
            </View>
        );
    }

    private get customSplashscreen (): JSX.Element {
        const { renderSplashscreen } = this.state;
        const callback = () => {
            this.setState({ renderSplashscreen: false });
            clearTimeout(this.safetyTimer);
        };
        return renderSplashscreen ? <CustomSplashscreen callback={callback} /> : null;
    }

    private get paywall (): JSX.Element {
        const { firstPurchase, paywallCloseButton, renderPaywall } = this.state;
        return renderPaywall ? (
            <Paywall
                closeButton={paywallCloseButton}
                firstPurchase={firstPurchase}
                ref={this.paywallRef}
                screenProps={this.screenProps}
            />
        ) : null;
    }

    public render (): JSX.Element {
        return (
            <Fragment>
                <Provider store={ this.store }>
                    <PersistGate loading={this.loader} persistor={persistor} onBeforeLift={this.onRehydrated}>
                        { this.statusBar }
                        { this.drawerBackground }
                        <AppDrawer
                            AppContainer={AppContainer}
                            screenProps={this.screenProps}
                        />
                        {this.paywall}
                        <PopupManager ref={this.popupManagerRef} />
                        <RootLoader ref={this.rootLoaderRef} />
                        <ToastManager ref={this.toastManagerRef} />
                    </PersistGate>
                </Provider>
                { this.customSplashscreen }
            </Fragment>
        );
    }
}

let rootComponentRef: Root;

// Needed to get a reference accessible from anywhere that can trigger paywall's apparition
export function getRootComponentRef (): Root {
    return (rootComponentRef as any)?.refs?.rootComponent;
}

export default class Index extends Component {

    public render (): JSX.Element {
        const RootComponent = codePush(codePushOptions)(Root);
        return (
            <RootComponent ref={(c: any) => rootComponentRef = c} />
        );
    }
}
