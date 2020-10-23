import React, { Component, Fragment } from 'react';
import { View, Text, Animated, Image, TouchableOpacity, Easing, Linking, Appearance } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { connect } from 'react-redux';
import { snakeCase } from 'lodash';
import { IReduxState } from '../store/reducers';
import { logout } from '../store/modules/auth';
import {
    INotificationsPreferences,
    INotificationsPreferencesInfos,
    setAutoTimer,
    setLocale,
    setPostRestPopup,
    setPreventSleepMode,
    setNotificationPreferences,
    setUnitSystem,
    setWorkoutSounds,
    getNotificationsPreferences
} from '../store/modules/userProfile';
import { resetOnboarding } from '../store/modules/onboarding';
import { IProgressionState } from '../store/modules/progression';
import { setAllTooltipStatus } from '../store/modules/tutorials';
import { IInfluencersState } from '../store/modules/influencers';
import { TViews } from '../views/index';
import { refreshProgression } from '../utils/progression';
import i18n, { LANGUAGES, getLanguageFromLocale } from '../utils/i18n';
// import { IVideoPlayerProps } from '../components/VideoPlayer';
import { logEvent } from '../utils/analytics';
import { ENDPOINTS } from '../utils/endpoints';
import { hasAdminAccess } from '../utils/roles';
import { IMedia } from '../types/media';
import { IScreenProps, getRootComponentRef } from '../index';
import { TUnitsSystems } from '../types/user';
import { isAndroid, isIOS } from '../utils/os';
import { ENV_NAME, API_DOMAIN } from '../../env';
import { debounce } from 'lodash';
import delays from '../utils/animDelays';
import api from '../utils/api';
import {
    CSLFIT_URL,
    FAQ_URL,
    FEEDBACK_EMAIL,
    MELIORENCE_URL,
    PRIVACY_POLICY_URL,
    STORE_URL,
    SUPPORT_EMAIL,
    TERMS_URL,
    UNSUBSCRIBE_URL
} from '../utils/staticLinks';
import { confirmPopup } from '../utils/confirmPopup';
import { isDebugBundleID } from '../utils/bundleId';
import chroma from 'chroma-js';

import Clipboard from '@react-native-community/clipboard';
import codePush from 'react-native-code-push';
import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import { hasUserSetPinCode } from '@haskkor/react-native-pincode';

import BackgroundBottom from '../static/Settings/background-bottom.svg';
import BackgroundTop from '../static/Settings/background-top.svg';
import FadeInImage, { ERROR_PLACEHOLDER_SOURCE } from '../components/FadeInImage';
import Header from '../components/Header';
import NativePicker from '../components/Popups/NativePicker';
import SharedButton from '../components/SharedButton';
import DiffuseShadow from '../components/DiffuseShadow';
// import EllipsisSeparator from '../components/EllipsisSeparator';
import SharedParallaxView from '../components/SharedParallaxView';
import SharedVerticalTitle from '../components/SharedVerticalTitle';
import Switch from '../components/Switch';
import TouchableScale from '../components/TouchableScale';
import ProgramManagement from '../components/Popups/ProgramManagement';

import { viewportHeight, viewportWidth, isLWidth } from '../styles/base/metrics.style';
import colors from '../styles/base/colors.style';
import programManagementStyles, { MANAGE_POPUP_HEIGHT } from '../styles/components/Popups/ProgramManagement.style';
import styles, {
    BACKGROUND_BOTTOM_WIDTH,
    BACKGROUND_BOTTOM_HEIGHT,
    BACKGROUND_TOP_WIDTH,
    BACKGROUND_TOP_HEIGHT,
    COLOR_GRADIENT
} from '../styles/views/Settings.style';
import OneSignal, {PermissionSubscriptionState} from 'react-native-onesignal';

const CLIPBOARD_ICON = require('../static/icons/copy.png');
const DOUBLE_DUMBBELL_ICON = require('../static/icons/double-dumbbell.png');
const DOUBLE_STAR_ICON = require('../static/icons/double-star.png');
const DOWN_ARROW_ICON = require('../static/icons/down-arrow.png');
const GALLERY_ICON = require('../static/icons/gallery.png');
const GEAR_ICON = require('../static/icons/gear.png');
const LOGOUT_ICON = require('../static/icons/logout.png');
const LOCK_ICON = require('../static/icons/lock.png');
const UNLOCK_ICON = require('../static/icons/unlock.png');
// const DOUBLE_PEOPLE_ICON = require('../static/icons/double-people.png');
// const NEXT_ICON = require('../static/icons/next.png');

interface IProps extends INotificationsPreferences {
    autoTimer: boolean;
    email: string;
    firstTouchId: string;
    firstTouchLink: string;
    id: string;
    setAllTooltipStatus: (hide: boolean) => void;
    hideTooltips: boolean;
    lastTouchId: string;
    lastTouchLink: string;
    locale: string;
    logout: (callback?: () => void) => void;
    navigation: any;
    oneSignalPlayerId?: string;
    picture: IMedia;
    postRestPopup: boolean;
    progression: IProgressionState;
    resetOnboarding: (callback: () => void) => void;
    screenProps: IScreenProps;
    setAutoTimer: (enabled: boolean) => void;
    setLocale: (locale: string) => void;
    setNotificationPreferences: (preferences: INotificationsPreferences) => void;
    setPostRestPopup: (enabled: boolean) => void;
    setPreventSleepMode: (enabled: boolean) => void;
    setUnitSystem: (unitSystem: string) => void;
    setWorkoutSounds: (enabled: boolean) => void;
    preventSleepMode: boolean;
    unitSystem: TUnitsSystems;
    workoutSounds: boolean;
    influencersState: IInfluencersState
}

interface IState extends INotificationsPreferences {
    autoTimer: boolean;
    backgroundGearAnimationOpacity: Animated.Value;
    backgroundGearAnimationTransform: Animated.Value;
    backgroundTopAnimationOpacity: Animated.Value;
    backgroundTopAnimationTransform: Animated.Value;
    codepushUpdateInfo: string;
    debugArrowAnimationTransform: Animated.Value;
    debugCollapsed: boolean;
    deviceMemoryInfo: string;
    editButtonAnimationOpacity: Animated.Value;
    editButtonAnimationTransform: Animated.Value;
    hideTooltips: boolean;
    language: string;
    logoutButtonAnimationOpacity: Animated.Value;
    logoutButtonAnimationTransform: Animated.Value;
    pinCodeSet: boolean;
    optionsAnimationOpacity: Animated.Value;
    optionsAnimationTransform: Animated.Value;
    portraitImageAnimationOpacity: Animated.Value;
    portraitImageAnimationTransform: Animated.Value;
    postRestPopup: boolean;
    programButtonAnimationOpacity: Animated.Value;
    programButtonAnimationTransform: Animated.Value;
    preventSleepMode: boolean;
    titleAnimationOpacity: Animated.Value;
    titleAnimationTransform: Animated.Value;
    unitSystem: boolean;
    workoutSounds: boolean;
}

class Settings extends Component<IProps, IState> {

    private isDarkMode: boolean;

    constructor (props: IProps) {
        super(props);
        this.isDarkMode = Appearance.getColorScheme() === 'dark';
        this.state = {
            autoTimer: props.autoTimer,
            backgroundGearAnimationOpacity: new Animated.Value(0),
            backgroundGearAnimationTransform: new Animated.Value(1),
            backgroundTopAnimationOpacity: new Animated.Value(0),
            backgroundTopAnimationTransform: new Animated.Value(1),
            codepushUpdateInfo: '-',
            debugArrowAnimationTransform: new Animated.Value(0),
            debugCollapsed: true,
            deviceMemoryInfo: '-',
            editButtonAnimationOpacity: new Animated.Value(0),
            editButtonAnimationTransform: new Animated.Value(1),
            hideTooltips: props.hideTooltips,
            language: props.locale,
            logoutButtonAnimationOpacity: new Animated.Value(0),
            logoutButtonAnimationTransform: new Animated.Value(1),
            optionsAnimationOpacity: new Animated.Value(0),
            optionsAnimationTransform: new Animated.Value(1),
            pinCodeSet: undefined,
            portraitImageAnimationOpacity: new Animated.Value(0),
            portraitImageAnimationTransform: new Animated.Value(1),
            postRestPopup: props.postRestPopup,
            programButtonAnimationOpacity: new Animated.Value(0),
            programButtonAnimationTransform: new Animated.Value(0),
            restNotifications: props.restNotifications,
            trainingNotifications: props.trainingNotifications,
            nutritionNotifications: props.nutritionNotifications,
            blogNotifications: props.blogNotifications,
            generalNotifications: props.generalNotifications,
            preventSleepMode: props.preventSleepMode,
            titleAnimationOpacity: new Animated.Value(0),
            titleAnimationTransform: new Animated.Value(1),
            unitSystem: props.unitSystem === 'imperial',
            workoutSounds: props.workoutSounds
        };
    }

    public async componentDidMount (): Promise<void> {
        this.animateBackground();
        this.animatePortrait();
        this.animatePortraitButton();
        this.animatedProgramButton();
        this.animateTitle();
        this.animateOptions();
        this.getCodePushUpdateInfo();
        this.getDeviceMemory();

        // There's currently a bug on Android with the latest version
        // Every time we call `hasUserSetPinCode()` this asks for touch id
        // See https://github.com/jarden-digital/react-native-pincode/issues/133
        // https://github.com/jarden-digital/react-native-pincode/issues/137
        // The current fallback is to use react-native-pincode v1.2.0 and react-native-keychain v4.0.5
        const pinCodeSet = await hasUserSetPinCode();
        this.setState({ pinCodeSet });
    }

    private onChangeProgram = (): void => {
        this.props.screenProps.popupManagerRef.current.requestPopup({
            backgroundColors: ['white'],
            borderRadius: 44,
            closeButtonIconColor: colors.gray,
            ContentComponent: ProgramManagement,
            ContentComponentProps: {
                navigation: this.props.navigation,
                progression: this.props.progression,
                screenProps: this.props.screenProps
            },
            height: MANAGE_POPUP_HEIGHT,
            overflow: false,
            position: 'bottom',
            scrollView: true,
            title: i18n.t('programManagement.currentProgram'),
            titleStyle: programManagementStyles.popupTitle
        });
    }

    private async onChangeUnitSystem (value: boolean): Promise<void> {
        try {
            if (value) {
                // Imperial
                await api.put(ENDPOINTS.users + '/' + this.props.id, { unitSystem: 'imperial' });
                this.props.setUnitSystem('imperial');
            } else {
                // Metric
                await api.put(ENDPOINTS.users + '/' + this.props.id, { unitSystem: 'metric' });
                this.props.setUnitSystem('metric');
            }
            this.setState({ unitSystem: value });
            logEvent('settings_units', { units: value });
        } catch (error) {
            console.log(error);
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private async onChangeLanguage (value: string): Promise<void> {
        try {
            await api.put(ENDPOINTS.users + '/' + this.props.id, { locale: value });

            this.props.setLocale(value);
            this.setState({ language: value });

            // We need to update the progression to get the right language in the program title
            await refreshProgression();

            logEvent('settings_language', { languageCode: value });
        } catch (error) {
            console.log(error);
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private async onChangeNotificationPreference (key: keyof INotificationsPreferences, value: boolean): Promise<void> {
        try {
            if (value === true) {
                OneSignal.getPermissionSubscriptionState((status: PermissionSubscriptionState) => {
                    if (isIOS && !status.notificationsEnabled) {
                        confirmPopup(
                            () => { Linking.openURL('app-settings://'); },
                            null,
                            i18n.t('settings.notifications.iosActivationTitle'),
                            i18n.t('settings.notifications.iosActivationMessage'),
                            i18n.t('global.go')
                        );
                    }
                });
            }
            if (key === 'restNotifications') {
                await api.put(ENDPOINTS.users + '/' + this.props.id, { restNotifications: value });
            }

            this.props.setNotificationPreferences({ [key]: value });
            // @ts-ignore
            this.setState({ [key]: value });

            OneSignal.sendTag(key, value.toString());
            logEvent(`settings_${snakeCase(key)}`, { enabled: value });
        } catch (error) {
            console.log(error);
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private async onChangeSleepMode (value: boolean): Promise<void> {
        try {
            await api.put(ENDPOINTS.users + '/' + this.props.id, { preventSleepMode: value });

            this.props.setPreventSleepMode(value);
            this.setState({ preventSleepMode: value });

            logEvent('settings_sleep_mode', { enabled: value });
        } catch (error) {
            console.log(error);
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private async onChangeWorkoutSounds (value: boolean): Promise<void> {
        try {
            await api.put(ENDPOINTS.users + '/' + this.props.id, { workoutSounds: value });

            this.props.setWorkoutSounds(value);
            this.setState({ workoutSounds: value });

            logEvent('settings_workout_sounds', { enabled: value });
        } catch (error) {
            console.log(error);
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private async onChangeHideTooltips (value: boolean): Promise<void> {
        this.props.setAllTooltipStatus(value);
        this.setState({ hideTooltips: value }, () => {
            const message = value === true ?
                i18n.t('settings.tooltipsHiddenToast') :
                i18n.t('settings.tooltipsVisibleToast');

            this.props.screenProps.toastManagerRef?.current?.openToast({
                message,
                type: 'info'
            });
        });

        logEvent('settings_hide_tooltips', { enabled: value });
    }

    private async onChangeAutoTimer (value: boolean): Promise<void> {
        try {
            await api.put(ENDPOINTS.users + '/' + this.props.id, { autoTimer: value });

            this.props.setAutoTimer(value);
            this.setState({ autoTimer: value });

            logEvent('settings_auto_timer', { enabled: value });
        } catch (error) {
            console.log(error);
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private async onChangePostRestPopup (value: boolean): Promise<void> {
        try {
            await api.put(ENDPOINTS.users + '/' + this.props.id, { postRestPopup: value });

            this.props.setPostRestPopup(value);
            this.setState({ postRestPopup: value });

            logEvent('settings_post_rest_popup', { enabled: value });
        } catch (error) {
            console.log(error);
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private adminReplayOnboarding = (): void => {
        const routeName: TViews = 'Onboarding';
        confirmPopup(() => {
            this.props.logout(() => {
                this.props.resetOnboarding(this.props.navigation.replace(routeName));
            });
        });
    }

    private adminOpenPaywallFirstPurchase = (): void => {
        getRootComponentRef()?.showPaywall(true, true);
    }

    private adminOpenPaywall = (): void => {
        getRootComponentRef()?.showPaywall(false, true);
    }

    private adminTriggerCrash = (): void => {
        // @ts-ignore
        triggerError();
    }

    private onPressCredits = (): void => {
        const routeName: TViews = 'Credits';
        this.props.navigation.navigate(routeName);
    }

    private onPressLanguageSelect = (): void => {
        let items = [];
        Object.keys(LANGUAGES).forEach((language: string) => {
            items.push({
                label: getLanguageFromLocale(language).longName,
                value: getLanguageFromLocale(language).locale
            });
        });

        this.props.screenProps.popupManagerRef.current.requestPopup({
            backgroundColors: this.isDarkMode ? null : ['#FFFADE', '#FFCFF7'],
            backgroundType: 'gradient',
            closeButtonIconColor: this.isDarkMode ? 'white' : colors.violetDark,
            ContentComponent: NativePicker,
            ContentComponentProps: {
                items,
                onValueChange: (itemValue: string) => this.onChangeLanguage(itemValue),
                selectedValue: getLanguageFromLocale(this.state.language).locale
            },
            height: 350,
            position: 'bottom',
            scrollView: false,
            title: i18n.t(`settings.chooseYourLanguage`),
            titleStyle: { color: this.isDarkMode ? 'white' : colors.violetDark, paddingBottom: 0 }
        });
    }

    private onPressRate = (): void => {
        // https://developer.apple.com/documentation/storekit/skstorereviewcontroller/requesting_app_store_reviews
        const url = `${STORE_URL}${isAndroid ? '' : '?action=write-review'}`;
        logEvent('rate_app', { os: isAndroid ? 'android' : 'ios' });
        Linking.openURL(url);
    }

    private onPressContact = (): void => {
        logEvent('settings_contact_us', { os: isAndroid ? 'android' : 'ios' });
        Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    }

    private onPressFeedback = (): void => {
        logEvent('settings_provide_feedback', { os: isAndroid ? 'android' : 'ios' });
        Linking.openURL(`mailto:${FEEDBACK_EMAIL}`);
    }

    private onPressChangePlan = (): void => {
        logEvent('settings_change_subscription_plan', { os: isAndroid ? 'android' : 'ios' });
        Linking.openURL(`${FAQ_URL}#manage`);
    }

    private onPressUnsubscribe = (): void => {
        // TODO: direct link to unsubscription
        // This requires us to store product's id for Android
        // const url = isAndroid ?
        //    UNSUBSCRIBE_URL.replace('PACKAGE_NAME', DeviceInfo.getBundleId()).replace('PRODUCT_ID', xxxxxx) :
        //    UNSUBSCRIBE_URL
        const url = isAndroid ? `${FAQ_URL}#manage` : UNSUBSCRIBE_URL;
        logEvent('settings_unsubscribe', { os: isAndroid ? 'android' : 'ios' });
        Linking.openURL(url);
    }

    private onPressTerms = (): void => {
        logEvent('settings_terms', { os: isAndroid ? 'android' : 'ios' });
        Linking.openURL(TERMS_URL);
    }

    private onPressPrivacyPolicy = (): void => {
        logEvent('settings_privacy', { os: isAndroid ? 'android' : 'ios' });
        Linking.openURL(PRIVACY_POLICY_URL);
    }

    private openCSLFITWebsite = (): void => {
        logEvent('credits_open', { company: 'cslfit' });
        Linking.openURL(CSLFIT_URL);
    }

    private openMeliorenceWebsite = (): void => {
        logEvent('credits_open', { company: 'meliorence' });
        Linking.openURL(MELIORENCE_URL);
    }

    // private onPressWorkoutOverviewVideo = async (): Promise<void> => {
    //     try {
    //         const tutorialsResponse = await api.get(ENDPOINTS.tutorials + 'workout-overview');
    //         const video = tutorialsResponse?.data?.videos[0];

    //         if (!!video) {
    //             const routeName: TViews = 'Video';
    //             const player: IVideoPlayerProps = {
    //                 thumbnailSource: video.thumbnailUrl,
    //                 videoSource: video.url
    //             };
    //             this.props.navigation.navigate(routeName, { player });
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         this.props.screenProps.toastManagerRef?.current?.openToast({
    //             message: i18n.t('app.fetchError'),
    //             type: 'error'
    //         });
    //     }
    // }

    // private onPressTrainingVideo = async (): Promise<void> => {
    //     try {
    //         const tutorialsResponse = await api.get(ENDPOINTS.tutorials + 'training');
    //         const video = tutorialsResponse?.data?.videos[0];

    //         if (!!video) {
    //             const routeName: TViews = 'Video';
    //             const player: IVideoPlayerProps = {
    //                 thumbnailSource: video.thumbnailUrl,
    //                 videoSource: video.url
    //             };
    //             this.props.navigation.navigate(routeName, { player });
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         this.props.screenProps.toastManagerRef?.current?.openToast({
    //             message: i18n.t('app.fetchError'),
    //             type: 'error'
    //         });
    //     }
    // }

    private updatePinCodeSection = async (): Promise<void> => {
        // There's currently a bug on Android with the latest version
        // Every time we call `hasUserSetPinCode()` this asks for touch id
        // See https://github.com/jarden-digital/react-native-pincode/issues/133
        // https://github.com/jarden-digital/react-native-pincode/issues/137
        // The current fallback is to use react-native-pincode v1.2.0 and react-native-keychain v4.0.5
        const pinCodeSet = await hasUserSetPinCode();
        if (pinCodeSet !== this.state.pinCodeSet) {
            this.setState({ pinCodeSet });
        }
    }

    private enablePinCode = (): void => {
        this.props.navigation.navigate('PinCode', {
            headerMode: 'backWhite',
            mode: 'enable',
            onFinishProcessCallback: this.updatePinCodeSection
        });
    }

    private changePinCode = (): void => {
        this.props.navigation.navigate('PinCode', {
            headerMode: 'backWhite',
            mode: 'change'
        });
    }

    private disablePinCode = (): void => {
        this.props.navigation.navigate('PinCode', {
            headerMode: 'backWhite',
            mode: 'disable',
            onFinishProcessCallback: this.updatePinCodeSection
        });
    }

    private editPicture = (): void => {
        logEvent('settings_edit_profile_picture');
        alert(i18n.t('global.wip'));
    }

    private logout = (): void => {
        confirmPopup(() => {
            this.props.logout && this.props.logout();
        });
    }

    private copyToClipboard = (value: string): void => {
        if (typeof value === 'undefined') {
            return;
        }
        Clipboard.setString(value);
        this.props.screenProps?.toastManagerRef?.current?.openToast({
            message: i18n.t('settings.clipboard'),
            type: 'info'
        });
    }

    private toggleDebug = (): void => {
        this.setState({ debugCollapsed: !this.state.debugCollapsed }, () => {
            this.animateDebugArrow(this.state.debugCollapsed);
        });
    }

    private getCodePushUpdateInfo (): void {
        codePush.getUpdateMetadata().then((update: any) => {
            if (update) {
                const bundleSize = update.packageSize;
                const bundleSizeString = (bundleSize || bundleSize === 0) && this.formatNumber(bundleSize / 1000000);
                this.setState({ codepushUpdateInfo: `${update.label} (${update.appVersion} | ${bundleSizeString}MB)` });
            }
        });
    }

    private async getDeviceMemory (): Promise<void> {
        const usedMemory = await DeviceInfo.getUsedMemory();
        const totalMemory = await DeviceInfo.getTotalMemory();
        const usedMemoryString = (usedMemory || usedMemory === 0) && this.formatNumber(usedMemory / 1000000000);
        const totalMemoryString = (totalMemory || totalMemory === 0) && this.formatNumber(totalMemory / 1000000000);
        this.setState({ deviceMemoryInfo: `${usedMemoryString}GB / ${totalMemoryString}GB` });
    }

    private formatNumber (value: number): string {
        if (!value && value !== 0) {
            return '';
        }
        if (Number.isInteger(value)) {
            return value.toString();
        } else {
            return value.toFixed(1);
        }
    }

    private animateBackground (): void {
        const {
            backgroundGearAnimationOpacity,
            backgroundGearAnimationTransform,
            backgroundTopAnimationOpacity,
            backgroundTopAnimationTransform
        } = this.state;

        Animated.parallel([
            // Top
            Animated.sequence([
                Animated.delay(delays.views.settings.backgroundTopApparition),
                Animated.parallel([
                    Animated.timing(backgroundTopAnimationOpacity, {
                        toValue: 1,
                        duration: 200,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(backgroundTopAnimationTransform, {
                        toValue: 0,
                        speed: 10,
                        bounciness: 4,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ]),
            // Gear
            Animated.sequence([
                Animated.delay(delays.views.settings.backgroundGearApparition),
                Animated.parallel([
                    Animated.timing(backgroundGearAnimationOpacity, {
                        toValue: 1,
                        duration: 200,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(backgroundGearAnimationTransform, {
                        toValue: 0,
                        speed: 5,
                        bounciness: 4,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ])
        ]).start();
    }

    private getSettingsItemInterpolation (index: number): {} {
        const { titleAnimationOpacity, titleAnimationTransform } = this.state;
        const endRange = 20 + index * 10;
        const outputRange = [0, -endRange];
        return {
            opacity: titleAnimationOpacity,
            transform: [
                {
                    translateX: titleAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange
                    })
                }
            ]
        };
    }

    private animateDebugArrow (animateOut: boolean = false): void {
        const { debugArrowAnimationTransform } = this.state;
        const toValue = animateOut ? 0 : 1;
        Animated.spring(debugArrowAnimationTransform, {
            toValue: toValue,
            isInteraction: false,
            useNativeDriver: true,
            speed: 12,
            bounciness: 4
        }).start();
    }

    private animatePortrait (): void {
        const { portraitImageAnimationOpacity, portraitImageAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.settings.backgroundTopApparition),
            Animated.parallel([
                Animated.timing(portraitImageAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(portraitImageAnimationTransform, {
                    toValue: 0,
                    speed: 10,
                    bounciness: 4,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animatePortraitButton (): void {
        const {
            editButtonAnimationOpacity,
            editButtonAnimationTransform,
            logoutButtonAnimationOpacity,
            logoutButtonAnimationTransform
        } = this.state;

        Animated.parallel([
            Animated.sequence([
                Animated.delay(delays.views.settings.editButtonApparition),
                Animated.parallel([
                    Animated.timing(editButtonAnimationOpacity, {
                        toValue: 1,
                        duration: 100,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(editButtonAnimationTransform, {
                        toValue: 0,
                        speed: 10,
                        bounciness: 5,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ]),
            Animated.sequence([
                Animated.delay(delays.views.settings.logoutButtonApparition),
                Animated.parallel([
                    Animated.timing(logoutButtonAnimationOpacity, {
                        toValue: 1,
                        duration: 100,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(logoutButtonAnimationTransform, {
                        toValue: 0,
                        speed: 10,
                        bounciness: 5,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ])
        ]).start();
    }

    private animatedProgramButton (): void {
        const { programButtonAnimationOpacity, programButtonAnimationTransform } = this.state;
        Animated.sequence([
            Animated.delay(delays.views.registration.facebook),
            Animated.parallel([
                Animated.timing(programButtonAnimationOpacity, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(programButtonAnimationTransform, {
                    toValue: 1,
                    speed: 8,
                    bounciness: 10,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateTitle (): void {
        const { titleAnimationOpacity, titleAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.settings.titleApparition),
            Animated.parallel([
                Animated.timing(titleAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(titleAnimationTransform, {
                    toValue: 0,
                    speed: 10,
                    bounciness: 4,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateOptions (): void {
        const { optionsAnimationOpacity, optionsAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.settings.optionsApparition),
            Animated.parallel([
                Animated.timing(optionsAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(optionsAnimationTransform, {
                    toValue: 0,
                    speed: 10,
                    bounciness: 4,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private getBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const {
            backgroundGearAnimationOpacity,
            backgroundGearAnimationTransform,
            backgroundTopAnimationOpacity,
            backgroundTopAnimationTransform
        } = this.state;

        const backgroundTopAnimatedStyle = [
            styles.backgroundTop,
            {
                opacity: backgroundTopAnimationOpacity,
                transform: [
                    {
                        translateX: backgroundTopAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 100]
                        })
                    }
                ]
            }
        ];

        const backgroundTopScrollAnimatedStyle = {
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, 200],
                        outputRange: [0, -60]
                    })
                }
            ]
        };

        const backgroundGearAnimatedStyle = {
            opacity: backgroundGearAnimationOpacity,
            transform: [
                {
                    translateX: backgroundGearAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 100]
                    })
                }
            ]
        };

        const backgroundGearScrollAnimatedStyle = [
            styles.backgroundGearImage,
            {
                transform: [
                    {
                        rotateZ: animatedValue.interpolate({
                            inputRange: [0, viewportHeight],
                            outputRange: ['0deg', '180deg']
                        })
                    }
                ]
            }
        ];

        return (
            <View>
                <Animated.View style={backgroundTopAnimatedStyle}>
                    <Animated.View style={backgroundTopScrollAnimatedStyle}>
                        <BackgroundTop width={BACKGROUND_TOP_WIDTH} height={BACKGROUND_TOP_HEIGHT} />
                    </Animated.View>
                </Animated.View>
                <Animated.View style={backgroundGearAnimatedStyle}>
                    <Animated.Image source={GEAR_ICON} style={backgroundGearScrollAnimatedStyle} />
                </Animated.View>
            </View>
        );
    }

    private getForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <Header animatedValue={animatedValue} mode={'menu'} />
        );
    }

    private getSwitch (label: string, onChange: (value: boolean) => void, value: boolean, key?: string, description?: string): JSX.Element {
        return (
            <View key={key} style={styles.entryContainer}>
                <View style={styles.entryContainerInner}>
                    <Text numberOfLines={2} style={styles.entryLabel}>{ label }</Text>
                    { description && <Text style={styles.entryDescription}>{ description }</Text> }
                </View>
                <Switch onChange={onChange} style={styles.entrySwitch} value={value} />
            </View>
        );
    }

    private getFooterEntry (label: string, onPress: () => void, first?: boolean): JSX.Element {
        return (
            <View style={styles.footerEntry}>
                { !first && <View style={styles.footerEntryDivider} /> }
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onPress}
                    style={styles.footerEntryInner}
                >
                    <Image source={DOWN_ARROW_ICON} style={styles.footerEntryIcon} />
                    <Text style={styles.footerEntryLabel}>{ label }</Text>
                </TouchableOpacity>
            </View>
        );
    }

    private getDebugEntry (label: string, value: string, last?: boolean, clipboard?: boolean): JSX.Element {
        const clipboardButton = clipboard ? (
            <TouchableScale
                activeOpacity={0.6}
                onPress={() => this.copyToClipboard(value)}
                style={styles.clipboardButton}
            >
                <DiffuseShadow
                    borderRadius={20}
                    horizontalOffset={8}
                    shadowOpacity={0.15}
                    verticalOffset={4}
                />
                <View style={styles.clipboardButtonInner}>
                    <Image source={CLIPBOARD_ICON} style={styles.clipboardButtonIcon} />
                </View>
            </TouchableScale>
        ) : null;

        return (
            <View style={styles.debugEntry}>
                <View style={styles.debugEntryInfo}>
                    <View style={styles.debugEntryInfoInner}>
                        <Text style={styles.debugEntryLabel}>{ label }</Text>
                        <Text style={styles.debugEntryValue}>{ value || '-' }</Text>
                    </View>
                    { clipboardButton }
                </View>
                { !last && <View style={styles.debugEntryDivider} /> }
            </View>
        );
    }

    private get portrait (): JSX.Element {
        const { portraitImageAnimationOpacity, portraitImageAnimationTransform } = this.state;
        const { picture } = this.props;
        // The error placeholder is not showing up on Android...
        const source = picture?.thumbnailUrl ? { uri: picture?.thumbnailUrl } : ERROR_PLACEHOLDER_SOURCE;

        const animatedStyle = {
            opacity: portraitImageAnimationOpacity,
            transform: [
                {
                    translateY: portraitImageAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 50]
                    })
                }
            ]
        };

        return (
            <View style={styles.portrait}>
                <Animated.View style={animatedStyle}>
                    <FadeInImage
                        containerCustomStyle={styles.portraitImageContainer}
                        imageStyle={styles.portraitImage}
                        source={source}
                    />
                </Animated.View>
                <View style={styles.portraitButtons}>
                    { this.editButton }
                    { this.logoutButton }
                </View>
            </View>
        );
    }

    private get editButton (): JSX.Element {
        const { editButtonAnimationOpacity, editButtonAnimationTransform } = this.state;

        return (
            <View style={[styles.portraitButtonPlaceholder, { marginRight: 25 }]} />
        );

        const containerAnimatedStyle = [
            styles.portraitButtonContainer,
            { marginRight: 35 },
            {
                opacity: editButtonAnimationOpacity,
                transform: [
                    {
                        translateY: editButtonAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 25]
                        })
                    }
                ]
            }
        ];

        return (
            <Animated.View style={containerAnimatedStyle}>
                <TouchableScale
                    style={styles.portraitButton}
                    onPress={debounce(this.editPicture, 500, { 'leading': true, 'trailing': false })}
                >
                    <DiffuseShadow
                        borderRadius={styles.portraitButtonShadow.borderRadius}
                        color={chroma(colors.pink).darken(2).css()}
                        style={styles.portraitButtonShadow}
                        horizontalOffset={12}
                        shadowOpacity={0.25}
                        verticalOffset={10}
                    />
                    <LinearGradient
                        angle={150}
                        colors={COLOR_GRADIENT}
                        style={styles.portraitButtonGradient}
                        useAngle={true}
                    />
                    <Image source={GALLERY_ICON} style={styles.portraitButtonIcon} />
                </TouchableScale>
                <Text style={styles.portraitButtonLabel}>{ i18n.t('settings.edit') }</Text>
            </Animated.View>
        );
    }

    private get logoutButton (): JSX.Element {
        const { logoutButtonAnimationOpacity, logoutButtonAnimationTransform } = this.state;

        const containerAnimatedStyle = [
            styles.portraitButtonContainer,
            {
                opacity: logoutButtonAnimationOpacity,
                transform: [
                    {
                        translateY: logoutButtonAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 25]
                        })
                    }
                ]
            }
        ];

        return (
            <Animated.View style={containerAnimatedStyle}>
                <TouchableScale
                    style={styles.portraitButton}
                    onPress={debounce(this.logout, 500, { 'leading': true, 'trailing': false })}
                >
                    <DiffuseShadow
                        borderRadius={styles.portraitButtonShadow.borderRadius}
                        color={chroma(colors.pink).darken(2).css()}
                        style={styles.portraitButtonShadow}
                        horizontalOffset={12}
                        shadowOpacity={0.25}
                        verticalOffset={10}
                    />
                    <LinearGradient
                        angle={150}
                        colors={COLOR_GRADIENT}
                        style={styles.portraitButtonGradient}
                        useAngle={true}
                    />
                    <Image source={LOGOUT_ICON} style={[styles.portraitButtonIcon, styles.portraitButtonIconLogout]} />
                </TouchableScale>
                <Text style={styles.portraitButtonLabel}>{ i18n.t('settings.logout') }</Text>
            </Animated.View>
        );
    }

    private get adminButtons (): JSX.Element {
        const isDebug = isDebugBundleID();
        const adminAccess = hasAdminAccess() || isDebug;
        const adminAccessRelease = hasAdminAccess(true) || isDebug;

        if (!adminAccess && !adminAccessRelease) {
            return;
        }

        const onboardingButton = adminAccess ? (
            <SharedButton
                color={'pink'}
                containerStyle={styles.button}
                onPress={this.adminReplayOnboarding}
                shadowProps={{
                    color: chroma(colors.pink).darken(2.5).css(),
                    horizontalOffset: 40
                }}
                text={i18n.t('settings.adminReplayOnboarding')}
                textStyle={styles.buttonLabel}
                withShadow={true}
            />
        ) : null;
        const paymentButton = adminAccess ? (
            <SharedButton
                color={'pink'}
                containerStyle={styles.button}
                onPress={this.adminOpenPaywallFirstPurchase}
                shadowProps={{
                    color: chroma(colors.pink).darken(2.5).css(),
                    horizontalOffset: 40
                }}
                text={i18n.t('settings.adminNavigateToPayment')}
                textStyle={styles.buttonLabel}
                withShadow={true}
            />
        ) : null;
        const paywallButton = adminAccess ? (
            <SharedButton
                color={'pink'}
                containerStyle={styles.button}
                onPress={this.adminOpenPaywall}
                shadowProps={{
                    color: chroma(colors.pink).darken(2.5).css(),
                    horizontalOffset: 40
                }}
                text={i18n.t('settings.adminOpenPaywall')}
                textStyle={styles.buttonLabel}
                withShadow={true}
            />
        ) : null;
        const crashButton = adminAccessRelease ? (
            <SharedButton
                color={'pink'}
                containerStyle={styles.button}
                onPress={this.adminTriggerCrash}
                shadowProps={{
                    color: chroma(colors.pink).darken(2.5).css(),
                    horizontalOffset: 40
                }}
                text={i18n.t('settings.adminTriggerCrash')}
                textStyle={styles.buttonLabel}
                withShadow={true}
            />
        ) : null;

        return (
            <Fragment>
                { onboardingButton }
                { paymentButton }
                { paywallButton }
                { crashButton }
            </Fragment>
        );
    }

    private get unitsSwitch (): JSX.Element {
        return (
            <View style={styles.entryContainer}>
                <View style={styles.entryContainerInner}>
                    <Text numberOfLines={1} style={styles.entryLabel}>{ i18n.t('settings.units') }</Text>
                </View>
                <View style={styles.unitsSwitchContainer}>
                    <Text style={styles.unitsSwitchLabelLeft}>
                        { i18n.t('settings.kgCm') }
                    </Text>
                    <Switch
                        borderColor={{ true: colors.pink, false: colors.orange }}
                        onChange={(value: boolean) => this.onChangeUnitSystem(value)}
                        thumbColor={{ true: 'white', false: 'white' }}
                        trackColor={{ true: colors.pink, false: colors.orange }}
                        style={styles.unitsSwitch}
                        value={this.state.unitSystem}
                    />
                    <Text style={[styles.unitsSwitchLabelLeft, styles.unitsSwitchLabelRight]}>
                        { i18n.t('settings.lbsIn') }
                    </Text>
                </View>
            </View>
        );
    }

    private get languageSelect (): JSX.Element {
        if (!this.state.language) {
            return;
        }

        if (isAndroid) {
            let items = [];
            Object.keys(LANGUAGES).forEach((language: string) => {
                items.push({
                    label: getLanguageFromLocale(language).longName,
                    value: getLanguageFromLocale(language).locale
                });
            });

            return (
                <View style={styles.entryContainer}>
                    <View style={styles.entryContainerInner}>
                        <Text numberOfLines={1} style={styles.entryLabel}>{i18n.t('settings.language')}</Text>
                    </View>
                    <View style={styles.languageSelectContainer}>
                        <LinearGradient
                            angle={150}
                            colors={COLOR_GRADIENT}
                            style={styles.fullSpace}
                            useAngle={true}
                        />
                        <NativePicker
                            items={items}
                            onValueChange={(itemValue: string) => this.onChangeLanguage(itemValue)}
                            selectedValue={getLanguageFromLocale(this.state.language).locale}
                            style={styles.languageSelectValueLabel}
                        />
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.entryContainer}>
                    <View style={styles.entryContainerInner}>
                        <Text numberOfLines={1} style={styles.entryLabel}>{i18n.t('settings.language')}</Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={this.onPressLanguageSelect}
                        style={styles.languageSelectContainer}
                    >
                        <LinearGradient
                            angle={150}
                            colors={COLOR_GRADIENT}
                            style={styles.fullSpace}
                            useAngle={true}
                        />
                        <View style={styles.languageSelect}>
                            <View style={styles.languageSelectValue}>
                                <Text numberOfLines={1} style={styles.languageSelectValueLabel}>
                                    { getLanguageFromLocale(this.state.language).longName }
                                </Text>
                            </View>
                            <View style={styles.languageSelectButton}>
                                <Image
                                    source={DOWN_ARROW_ICON}
                                    style={styles.languageSelectButtonIcon}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    private get footer (): JSX.Element {
        const verticalTitleHeight = 300;
        return (
            <View style={styles.footer}>
                <View pointerEvents={'none'} style={styles.footerBackgroundContainer}>
                    <BackgroundBottom
                        height={BACKGROUND_BOTTOM_HEIGHT}
                        style={styles.footerBackground}
                        width={BACKGROUND_BOTTOM_WIDTH}
                    />
                </View>
                <View style={styles.footerInner}>
                    <SharedVerticalTitle
                        height={verticalTitleHeight}
                        innerStyleHorizontal={{ alignItems: 'center' }}
                        innerStyleVertical={{ height: verticalTitleHeight }}
                        textStyle={styles.footerVerticalTitle}
                        title={i18n.t('settings.getInTouch')}
                        width={isLWidth ? 75 : 60}
                    />
                    <View style={styles.footerEntries}>
                        { this.getFooterEntry(i18n.t('settings.contact'), this.onPressContact, true) }
                        { this.getFooterEntry(i18n.t('settings.feedback'), this.onPressFeedback) }
                        { this.getFooterEntry(i18n.t('settings.subscription'), this.onPressChangePlan) }
                        { this.getFooterEntry(i18n.t('settings.unsubscribe'), this.onPressUnsubscribe) }
                        { this.getFooterEntry(i18n.t('settings.terms'), this.onPressTerms) }
                        { this.getFooterEntry(i18n.t('settings.privacyPolicy'), this.onPressPrivacyPolicy) }
                        { this.getFooterEntry(i18n.t('settings.credits'), this.onPressCredits, false) }
                    </View>
                </View>
            </View>
        );
    }

    private get debug (): JSX.Element {
        const { email, firstTouchId, firstTouchLink, lastTouchId, lastTouchLink, oneSignalPlayerId, influencersState } = this.props;
        const { codepushUpdateInfo, debugArrowAnimationTransform, debugCollapsed, deviceMemoryInfo } = this.state;
        const adminAccessRelease = hasAdminAccess(true);
        const verticalTitleHeight = 150;
        const bundleId = DeviceInfo.getBundleId();
        const appVersion = DeviceInfo.getVersion();
        const apiEnv = API_DOMAIN.includes('staging') ? 'Staging' : 'Production'; // TODO: better way to retrieve this?
        const apiVersion = API_DOMAIN.match(/\/v(.*)\//)[0].replace(/\//g, '');
        const deviceInfo = `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()} (${DeviceInfo.getDeviceId()})`;
        const systemInfo = `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`;
        const uiDimensions = `${this.formatNumber(viewportWidth)} x ${this.formatNumber(viewportHeight)}`;
        const iconAnimatedStyle = {
            transform: [
                {
                    rotate: debugArrowAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '-540deg']
                    })
                }
            ]
        };
        return (
            <View style={styles.debugWrapper}>
                <DiffuseShadow
                    borderRadius={styles.debugContainer.borderRadius}
                    horizontalOffset={30}
                    shadowOpacity={0.12}
                    verticalOffset={20}
                />
                <View style={styles.debugContainer}>
                    <TouchableScale
                        onPress={this.toggleDebug}
                        style={styles.debugButton}
                    >
                        <Text style={styles.debugButtonText}>Debug</Text>
                        <Animated.View style={iconAnimatedStyle}>
                            <Image source={DOWN_ARROW_ICON} style={styles.debugButtonIcon} />
                        </Animated.View>
                    </TouchableScale>
                    <Collapsible collapsed={debugCollapsed} align='center'>
                        <View style={styles.debugContainerInner}>
                            <SharedVerticalTitle
                                height={verticalTitleHeight}
                                innerStyleHorizontal={{ alignItems: 'center' }}
                                innerStyleVertical={{ height: verticalTitleHeight }}
                                textStyle={styles.debugVerticalTitle}
                                title={i18n.t('settings.debug.title')}
                                width={60}
                            />
                            <View style={styles.debugEntries}>
                                { this.getDebugEntry(i18n.t('settings.debug.userEmail'), email) }
                                { this.getDebugEntry(i18n.t('settings.debug.bundleID'), bundleId) }
                                { this.getDebugEntry(i18n.t('settings.debug.appVersion'), appVersion) }
                                { this.getDebugEntry(i18n.t('settings.debug.bundleVersion'), codepushUpdateInfo) }
                                { this.getDebugEntry(i18n.t('settings.debug.binaryEnv'), ENV_NAME) }
                                { this.getDebugEntry(i18n.t('settings.debug.apiEnv'), apiEnv) }
                                { this.getDebugEntry(i18n.t('settings.debug.apiVersion'), apiVersion) }
                                { this.getDebugEntry(i18n.t('settings.debug.systemInfo'), systemInfo) }
                                { this.getDebugEntry(i18n.t('settings.debug.deviceInfo'), deviceInfo) }
                                { this.getDebugEntry(i18n.t('settings.debug.deviceMemory'), deviceMemoryInfo) }
                                { oneSignalPlayerId && this.getDebugEntry(i18n.t('settings.debug.oneSignalPlayerId'), oneSignalPlayerId, false, true) }
                                { this.getDebugEntry(i18n.t('settings.debug.uiDimensions'), uiDimensions, !adminAccessRelease) }
                                { adminAccessRelease && this.getDebugEntry(i18n.t('settings.debug.influencerIdFirst'), firstTouchId) }
                                { adminAccessRelease && this.getDebugEntry(i18n.t('settings.debug.influencerIdLast'), lastTouchId) }
                                { adminAccessRelease && this.getDebugEntry(i18n.t('settings.debug.influencerIdLastLocal'), influencersState?.lastTouchId) }
                                { adminAccessRelease && this.getDebugEntry(i18n.t('settings.debug.influencerLinkFirst'), firstTouchLink) }
                                { adminAccessRelease && this.getDebugEntry(i18n.t('settings.debug.influencerLinkLast'), lastTouchLink) }
                                { adminAccessRelease && this.getDebugEntry(i18n.t('settings.debug.influencerLinkLastLocal'), influencersState?.lastTouchLink, true) }
                            </View>
                        </View>
                    </Collapsible>
                </View>
            </View>
        );
    }

    private get copyright (): JSX.Element {
        return (
            <View style={styles.copyrightContainer}>
                <LinearGradient
                    angle={160}
                    colors={COLOR_GRADIENT}
                    style={styles.copyrightGradient}
                    useAngle={true}
                />
                <Text style={styles.copyright}>
                    <Text>{ i18n.t('settings.madeByPrefix') }</Text>
                    <Text
                        onPress={this.openCSLFITWebsite}
                        style={styles.copyrightLink}
                    >
                        { i18n.t('settings.companyNameCSL') }
                    </Text>
                    <Text>{ i18n.t('settings.madeByMiddle') }</Text>
                    <Text
                        onPress={this.openMeliorenceWebsite}
                        style={styles.copyrightLink}
                    >
                        { i18n.t('settings.companyNameMeliorence') }
                    </Text>
                    <Text>{ i18n.t('settings.madeBySuffix') }</Text>
                </Text>
            </View>
        );
    }

    public render (): JSX.Element {
        const { pinCodeSet, programButtonAnimationOpacity, programButtonAnimationTransform } = this.state;
        const horizontalOffset = 40;
        const programButtonAnimatedStyle = {
            opacity: programButtonAnimationOpacity,
            transform: [{
                scale: programButtonAnimationTransform
            }]
        };

        return (
            <View style={styles.container}>
                <SharedParallaxView
                    contentContainerStyle={styles.scrollView}
                    ListFooterComponent={this.footer}
                    renderBackground={this.getBackground}
                    renderForeground={this.getForeground}
                    showsVerticalScrollIndicator={false}
                >
                    { this.portrait }
                    <Animated.View style={programButtonAnimatedStyle}>
                        <SharedButton
                            buttonContentStyle={styles.buttonContent}
                            color={'blue'}
                            containerStyle={styles.button}
                            icon={DOUBLE_DUMBBELL_ICON}
                            iconStyle={styles.buttonIcon}
                            onPress={this.onChangeProgram}
                            shadowProps={{ horizontalOffset }}
                            text={i18n.t('settings.changeProgram')}
                            textStyle={[styles.buttonLabel, isAndroid ? { flex: 1 } : {}]}
                            withShadow={true}
                        />
                        {/* <EllipsisSeparator containerTextStyle={styles.bottomEllipsis} /> */}
                        { this.adminButtons }
                    </Animated.View>
                    <View style={styles.options}>
                        <Animated.Text style={[styles.title, this.getSettingsItemInterpolation(0)]}>{ i18n.t('settings.settings') }</Animated.Text>
                        <Animated.View style={this.getSettingsItemInterpolation(1)}>
                            { this.unitsSwitch }
                            { this.languageSelect }
                            {
                                this.getSwitch(
                                    i18n.t('settings.hideAllTooltips'),
                                    (value: boolean) => this.onChangeHideTooltips(value),
                                    this.state.hideTooltips
                                )
                            }
                        </Animated.View>
                        <Animated.Text style={[styles.title, this.getSettingsItemInterpolation(2)]}>{ i18n.t('settings.workout') }</Animated.Text>
                        <Animated.View style={this.getSettingsItemInterpolation(3)}>
                            {
                                this.getSwitch(
                                    i18n.t('settings.sleepMode'),
                                    (value: boolean) => this.onChangeSleepMode(value),
                                    this.state.preventSleepMode
                                )
                            }
                            {
                                this.getSwitch(
                                    i18n.t('settings.workoutSounds'),
                                    (value: boolean) => this.onChangeWorkoutSounds(value),
                                    this.state.workoutSounds
                                )
                            }
                            {
                                this.getSwitch(
                                    i18n.t('settings.autoTimer'),
                                    (value: boolean) => this.onChangeAutoTimer(value),
                                    this.state.autoTimer
                                )
                            }
                            {
                                this.getSwitch(
                                    i18n.t('settings.postRestPopup'),
                                    (value: boolean) => this.onChangePostRestPopup(value),
                                    this.state.postRestPopup
                                )
                            }
                        </Animated.View>
                        <Animated.Text style={[styles.title, this.getSettingsItemInterpolation(4)]}>{ i18n.t('settings.notifications.title') }</Animated.Text>
                        <Animated.View style={this.getSettingsItemInterpolation(5)}>
                            {getNotificationsPreferences().map((pref: INotificationsPreferencesInfos) => (
                                this.getSwitch(
                                    pref?.title,
                                    (value: boolean) => this.onChangeNotificationPreference(pref?.key, value),
                                    this.state[pref?.key] || false,
                                    pref?.key,
                                    pref?.description
                                )
                            ))}
                        </Animated.View>
                        {/* <Animated.Text style={[styles.title, this.getSettingsItemInterpolation(6)]}>{ i18n.t('settings.tutorialsTitle') }</Animated.Text>
                        <View>
                            <SharedButton
                                buttonContentStyle={styles.buttonContent}
                                color={'blue'}
                                containerStyle={styles.button}
                                icon={NEXT_ICON}
                                iconStyle={styles.buttonIcon}
                                onPress={this.onPressWorkoutOverviewVideo}
                                shadowProps={{
                                    color: chroma(colors.pink).darken(2.5).css(),
                                    horizontalOffset
                                }}
                                text={i18n.t('settings.tutorialIntro')}
                                textStyle={styles.buttonLabel}
                                withShadow={true}
                            />
                            <SharedButton
                                buttonContentStyle={styles.buttonContent}
                                color={'blue'}
                                containerStyle={styles.button}
                                icon={NEXT_ICON}
                                iconStyle={styles.buttonIcon}
                                onPress={this.onPressTrainingVideo}
                                shadowProps={{
                                    color: chroma(colors.pink).darken(2.5).css(),
                                    horizontalOffset
                                }}
                                text={i18n.t('settings.tutorialWorkout')}
                                textStyle={styles.buttonLabel}
                                withShadow={true}
                            />
                        </View> */}
                        <Animated.Text style={[styles.title, this.getSettingsItemInterpolation(7)]}>{ i18n.t('settings.pinCode') }</Animated.Text>
                        {
                            pinCodeSet ? (
                                <Animated.View style={this.getSettingsItemInterpolation(8)}>
                                    <SharedButton
                                        buttonContentStyle={styles.buttonContent}
                                        color={'white'}
                                        containerStyle={styles.button}
                                        icon={LOCK_ICON}
                                        iconStyle={styles.buttonIcon}
                                        onPress={this.changePinCode}
                                        text={i18n.t('settings.changePinCode')}
                                        textStyle={styles.buttonLabel}
                                        withShadow={true}
                                    />
                                    <SharedButton
                                        buttonContentStyle={styles.buttonContent}
                                        color={'pink'}
                                        containerStyle={styles.button}
                                        icon={UNLOCK_ICON}
                                        iconStyle={styles.buttonIcon}
                                        onPress={this.disablePinCode}
                                        shadowProps={{
                                            color: chroma(colors.pink).darken(2.5).css(),
                                            horizontalOffset
                                        }}
                                        text={i18n.t('settings.disablePinCode')}
                                        textStyle={styles.buttonLabel}
                                        withShadow={true}
                                    />
                                </Animated.View>
                            ) : (
                                <Animated.View style={this.getSettingsItemInterpolation(9)}>
                                    <SharedButton
                                        buttonContentStyle={styles.buttonContent}
                                        color={'blue'}
                                        containerStyle={styles.button}
                                        icon={LOCK_ICON}
                                        iconStyle={styles.buttonIcon}
                                        onPress={this.enablePinCode}
                                        text={i18n.t('settings.enablePinCode')}
                                        textStyle={styles.buttonLabel}
                                        withShadow={true}
                                    />
                                </Animated.View>
                            )
                        }
                        <Animated.Text style={[styles.title, this.getSettingsItemInterpolation(10)]}>{ i18n.t('global.more') }</Animated.Text>
                        <View>
                            {/* <EllipsisSeparator containerTextStyle={styles.topEllipsis} /> */}
                            {/* <SharedButton
                                buttonContentStyle={styles.buttonContent}
                                color={'pink'}
                                containerStyle={styles.button}
                                icon={DOUBLE_PEOPLE_ICON}
                                iconStyle={styles.buttonIcon}
                                onPress={() => alert(i18n.t('global.wip'))}
                                shadowProps={{ horizontalOffset }}
                                text={i18n.t('settings.shareWithFriends')}
                                textStyle={styles.buttonLabel}
                                withShadow={true}
                            /> */}
                            <SharedButton
                                buttonContentStyle={styles.buttonContent}
                                color={'blue'}
                                containerStyle={styles.button}
                                icon={DOUBLE_STAR_ICON}
                                iconStyle={styles.buttonIcon}
                                onPress={this.onPressRate}
                                text={i18n.t('settings.rate')}
                                textStyle={styles.buttonLabel}
                                withShadow={true}
                            />
                        </View>
                    </View>
                    { this.footer }
                    { this.debug }
                    { this.copyright }
                </SharedParallaxView>
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    autoTimer: state.userProfile?.autoTimer,
    email: state.userProfile?.email,
    firstTouchId: state.userProfile?.firstTouchId,
    firstTouchLink: state.userProfile?.firstTouchLink,
    id: state.userProfile?.id,
    hideTooltips: state.tutorials?.hideTooltips,
    lastTouchId: state.userProfile?.lastTouchId,
    lastTouchLink: state.userProfile?.lastTouchLink,
    locale: state.userProfile?.locale,
    oneSignalPlayerId: state.userProfile?.oneSignalPlayerId,
    picture: state.userProfile?.picture,
    postRestPopup: state.userProfile?.postRestPopup,
    progression: state.progression,
    restNotifications: state.userProfile?.restNotifications,
    trainingNotifications: state.userProfile?.trainingNotifications,
    nutritionNotifications: state.userProfile?.nutritionNotifications,
    blogNotifications: state.userProfile?.blogNotifications,
    generalNotifications: state.userProfile?.generalNotifications,
    preventSleepMode: state.userProfile?.preventSleepMode,
    unitSystem: state.userProfile?.unitSystem,
    workoutSounds: state.userProfile?.workoutSounds,
    influencersState: state.influencers
});

export default connect(mapStateToProps, {
    logout,
    resetOnboarding,
    setAllTooltipStatus,
    setAutoTimer,
    setLocale,
    setNotificationPreferences,
    setPostRestPopup,
    setPreventSleepMode,
    setUnitSystem,
    setWorkoutSounds
})(Settings);
