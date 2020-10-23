import React, { Component } from 'react';
import {
    Animated, Easing, View, Text, ScrollView, Linking, TouchableOpacity,
    NativeEventSubscription, BackHandler, ToastAndroid
} from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';
import { logout } from '../store/modules/auth';
import { isDebugBundleID, isReleaseBundleID } from '../utils/bundleId';
import { confirmPopup } from '../utils/confirmPopup';
import i18n, { getLanguageShortName } from '../utils/i18n';
import { isAndroid, isIOS } from '../utils/os';
import {
    ISubscriptionExtended,
    getMonthlyCostPerDay,
    getSubscriptionsSkus,
    sortSubscriptions
} from '../utils/payment';
import { SUPPORT_EMAIL, PRIVACY_POLICY_URL, TERMS_URL } from '../utils/staticLinks';
import { getRemoteConfigValue, REMOTE_CONFIG_VARIABLES } from '../utils/remoteConfig';
import { CDN_VIDEOS_URL, CDN_VIDEOS_THUMBS_URL } from '../utils/video';
import { IScreenProps, getRootComponentRef } from '../index';

import crashlytics from '@react-native-firebase/crashlytics';
import { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';
import LinearGradient from 'react-native-linear-gradient';
import RNIap, { Subscription } from 'react-native-iap';
import MusicControl from 'react-native-music-control';
import SystemSetting from 'react-native-system-setting';
import TypeWriter from 'react-native-typewriter';

import DiffuseShadow from '../components/DiffuseShadow';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import Loader from '../components/Loader';
import PlanButton from '../components/Payment/PlanButton';
import RestoreButton from '../components/Payment/RestoreButton';
import VideoPlayer from './VideoPlayer';

import colors from '../styles/base/colors.style';
import { viewportHeight } from '../styles/base/metrics.style';
import restoreStyles from '../styles/components/Payment/RestoreButton.style';
import styles, { HEADER_GRADIENT_COLORS, VIDEO_FADE_GRADIENT_COLORS } from '../styles/components/Paywall.style';

import LockIcon from '../static/Payment/lock.svg';

interface IProps {
    closeButton: boolean;
    email: string;
    firstName: string;
    firstPurchase: boolean;
    logout: (callback?: () => void) => void;
    screenProps: IScreenProps;
}

interface IState {
    animTransfrom: Animated.Value;
    fetchError: boolean;
    loading: boolean;
    subscriptions: ISubscriptionExtended[];
}

class Paywall extends Component<IProps, IState> {

    private backButtonPressedOnce: boolean;
    private backButtomTimeout: any;
    private backHandler: NativeEventSubscription;
    private dynamicConfigValue: string;
    private inTrial: boolean;
    private modalOpened: boolean;
    private monthlyCostPerDay: number;
    private subscriptionsSkus: string[];
    private videoPlayerRef: React.RefObject<VideoPlayer>;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animTransfrom: new Animated.Value(0),
            fetchError: false,
            loading: false,
            subscriptions: undefined
        };
        this.backButtonPressedOnce = false;
        this.dynamicConfigValue = this.getDynamicConfigValue();
        this.inTrial = props.firstPurchase;
        this.subscriptionsSkus = getSubscriptionsSkus();
        this.videoPlayerRef = React.createRef<VideoPlayer>();
    }

    public componentDidMount (): void {
        // Manage hardware back button (this will overload the listener in AppDrawer)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.animate(true);
        this.fetchSubscriptions();

        if (isIOS && this.shouldDisplayVideo()) {
            // Register to pause event triggered when headphones are unplugged
            // or a bluetooth audio peripheral disconnects from the device
            // Since it automatically pauses the video at system's level, we need to get it resuming manually
            // @ts-ignore
            MusicControl.on('pause', () => {
                if (!this.modalOpened) {
                    this.videoPlayerRef?.current?.togglePause(true, () => {
                        this.videoPlayerRef?.current?.togglePause(false, () => {
                            SystemSetting.setVolume(0, { showUI: true });
                        });
                    });
                }
            });
        }
    }

    public componentWillUnmount (): void {
        this.backHandler.remove();
        clearTimeout(this.backButtomTimeout);
    }

    private handleBackPress = (): boolean => {
        const popupManager = this.props.screenProps?.popupManagerRef?.current;

        // If there is a popup opened we dismiss it
        if (popupManager && popupManager.currentPopup && !popupManager.currentPopup?.preventOverlayDismissal) {
            popupManager.dismissPopup();
            return true;
        }

        // Prevent users from closing the modal
        // If no listener returns `true`, it will invoke the default back button functionality to exit the app
        if (this.backButtonPressedOnce) {
            // If the back button has been pressed once already, we close the app
            return false;
        } else {
            // Otherwise we ask for confirmation before closing the app
            const duration = 3500;

            ToastAndroid.show(i18n.t('app.closeAppConfirmation'), duration);
            this.backButtonPressedOnce = true;

            // After a few seconds we cancel the first press, otherwise if later the user presses the back button again
            // no warning would show and the app would close right away
            this.backButtomTimeout = setTimeout(() => {
                this.backButtonPressedOnce = false;
            }, duration + 500);

            return true;
        }
    }

    private async fetchSubscriptions (): Promise<void> {
        this.setState({ loading: true });
        try {
            const subscriptions: Subscription[] = await RNIap.getSubscriptions(this.subscriptionsSkus);
            const sortedSubscriptions = sortSubscriptions(subscriptions);
            this.monthlyCostPerDay = getMonthlyCostPerDay(sortedSubscriptions);
            this.setState({
                loading: false,
                subscriptions: sortedSubscriptions
            });
        } catch (error) {
            console.log(error?.code, error?.message);
            crashlytics().recordError(error);
            this.setState({
                loading: false,
                fetchError: true
            });
        }
    }

    private retryFetchSubscriptions = () => {
        this.setState({ fetchError: false }, () => {
            this.fetchSubscriptions();
        });
    }

    private onPressClose = (): void => {
        getRootComponentRef()?.hidePaywall();
    }

    private onPressTerms = (): void => {
        Linking.openURL(TERMS_URL);
    }

    private onPressPrivacyPolicy = (): void => {
        Linking.openURL(PRIVACY_POLICY_URL);
    }

    private onPressSupport = (): void => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    }

    private onPressLogout = (): void => {
        confirmPopup(() => {
            this.props.logout && this.props.logout();
            getRootComponentRef()?.hidePaywall();
        });
    }

    private onModalOpen = (): void => {
        this.modalOpened = true;
        this.videoPlayerRef?.current?.togglePause(true);
    }

    private onModalClose = (): void => {
        this.modalOpened = false;
        this.videoPlayerRef?.current?.togglePause(false);
    }

    private animate (animateIn?: boolean, callback?: () => void): void {
        const { animTransfrom } = this.state;
        const toValue = animateIn ? 1 : 0;
        const duration = animateIn ? 400 : 300;

        Animated.timing(animTransfrom, {
            toValue,
            duration,
            easing: Easing.out(Easing.poly(3)),
            isInteraction: false,
            useNativeDriver: true
        }).start(() => {
            callback && callback();
        });
    }

    public animateOut (callback?: () => void): void {
        this.animate(false, callback);
    }

    private getDynamicConfigValue (): string {
        const remoteConfigValue: FirebaseRemoteConfigTypes.ConfigValue = getRemoteConfigValue(REMOTE_CONFIG_VARIABLES.paywallContent.key);
        return remoteConfigValue?.value?.toString();
    }

    private shouldDisplayVideo (): boolean {
        // We are split testing different options, including 2 without video
        return this.inTrial && this.dynamicConfigValue?.startsWith('video');
    }

    private getVideoSource (version: string, languageCode: string): string {
        return `${CDN_VIDEOS_URL}paywall_${version}_${languageCode}.mp4`;
    }

    private getVideoThumbnailSource (version: string): string {
        return `${CDN_VIDEOS_THUMBS_URL}paywall_${version}.jpg`;
    }

    private get loader (): JSX.Element {
        return (
            <View style={styles.loaderContainer}>
                <Loader color={colors.violetDark} withContainer={true} containerType={'flex'} />
            </View>
        );
    }

    private getError (retry?: boolean): JSX.Element {
        return (
            <View style={styles.loaderContainer}>
                <ErrorMessage
                    retry={retry ? this.retryFetchSubscriptions : undefined}
                    toastManagerRef={this.props.screenProps?.toastManagerRef}
                />
            </View>
        );
    }

    private get video (): JSX.Element {
        if (!this.shouldDisplayVideo()) {
            return null;
        }
        const videoValue = this.dynamicConfigValue;
        const videoVersion = videoValue === 'video_testimonial' ? 'testimonial' : 'candice';
        const videoLanguageCode = getLanguageShortName();
        const videoSource = this.getVideoSource(videoVersion, videoLanguageCode);
        const videoThumbnailSource = this.getVideoThumbnailSource(videoVersion);

        const gradient = isAndroid ? (
            <LinearGradient
                colors={VIDEO_FADE_GRADIENT_COLORS}
                pointerEvents={'none'}
                style={styles.videoFadeEffect}
            />
        ) : null;

        return (
            <View style={styles.videoContainer}>
                { gradient }
                <DiffuseShadow
                    borderRadius={styles.video.borderRadius}
                    horizontalOffset={50}
                    shadowOpacity={0.25}
                    verticalOffset={20}
                />
                <View style={[styles.fullSpace, styles.video]}>
                    <VideoPlayer
                        playOnMount={true}
                        ref={this.videoPlayerRef}
                        smallUI={true}
                        tapToPause={true}
                        thumbnailSource={videoThumbnailSource}
                        videoSource={{ uri: videoSource }}
                    />
                </View>
            </View>
        );
    }

    private get lockIcon (): JSX.Element {
        return !this.inTrial ? (
            <LockIcon
                style={styles.lockIcon}
                height={styles.lockIcon.height}
                width={styles.lockIcon.width}
            />
        ) : null;
    }

    private get userName (): JSX.Element {
        const { firstName } = this.props;
        return (
            <TypeWriter
                style={styles.title}
                typing={1}
            >
                { i18n.t('payment.hi', { name: firstName || '' }) }
            </TypeWriter>
        );
    }

    private get message (): JSX.Element {
        let message: string;
        if (this.inTrial) {
            const variant = this.dynamicConfigValue;
            switch (variant) {
                case 'text_trial':
                    message = i18n.t('payment.paywallMessages.textTrial');
                    break;
                case 'text_you':
                    message = i18n.t('payment.paywallMessages.textYou');
                    break;
                case 'video_candice':
                    message = i18n.t('payment.paywallMessages.videoCandice');
                    break;
                case 'video_testimonial':
                    message = i18n.t('payment.paywallMessages.videoTestimonial');
                    break;
                default:
                    message = i18n.t('payment.paywallMessages.videoCandice');
            }
        } else {
            message = i18n.t('payment.subscriptionEnded');
        }
        return (
            <Text style={styles.chooseText}>{ message }</Text>
        );
    }

    private get buttons (): JSX.Element | JSX.Element[] {
        const { fetchError, loading, subscriptions } = this.state;
        const { screenProps } = this.props;

        if (fetchError || loading) {
            return fetchError ? this.getError(true) : this.loader;
        }
        const emptySubscriptions = !fetchError && !loading && subscriptions && !subscriptions?.length;
        if (!subscriptions || emptySubscriptions) {
            if (emptySubscriptions && isDebugBundleID()) {
                console.warn('Paywall: Have you made sure to rebuild your dev app to keep the `ENV_NAME` up to date?');
            }
            return this.getError();
        }
        const buttons = subscriptions.map((subscription: ISubscriptionExtended, index: number) => {
            return (
                <PlanButton
                    firstPurchase={this.inTrial}
                    key={`payment-button-${index}`}
                    index={index}
                    monthlyCostPerDay={this.monthlyCostPerDay}
                    onClose={this.onModalClose}
                    onOpen={this.onModalOpen}
                    screenProps={screenProps}
                    subscription={subscription}
                />
            );
        });
        return (
            <View style={styles.buttonsContainer}>
                { buttons }
            </View>
        );
    }

    private get termsAndConditions (): JSX.Element {
        const text = isAndroid ? i18n.t('payment.paywallTermsAndroid') : i18n.t('payment.paywallTermsIOS');
        return (
            <Text style={styles.terms}>{ text }</Text>
        );
    }

    private get restoreButton (): JSX.Element {
        const { screenProps } = this.props;
        return (
            <RestoreButton screenProps={screenProps} />
        );
    }

    private get helpLink (): JSX.Element {
        return (
            <View style={styles.linksContainer}>
                <Text style={styles.help}>{ i18n.t('payment.help1') }</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.onPressSupport}
                    style={[styles.link, styles.linkLast]}
                >
                    <Text style={styles.linkLabel}>{ i18n.t('payment.help2') }</Text>
                </TouchableOpacity>
            </View>
        );
    }

    private get links (): JSX.Element {
        return (
            <View style={styles.linksContainer}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.onPressTerms}
                    style={styles.link}
                >
                    <Text style={styles.linkLabel}>{ i18n.t('settings.terms') }</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.onPressPrivacyPolicy}
                    style={[styles.link, styles.linkLast]}
                >
                    <Text style={styles.linkLabel}>{ i18n.t('settings.privacyPolicy') }</Text>
                </TouchableOpacity>
            </View>
        );
    }

    private get logout (): JSX.Element {
        const { email } = this.props;
        const userEmail = email ? (
            <Text style={styles.email}>
                { i18n.t('settings.debug.userEmail') + ': ' }
                <Text style={styles.emailColored}>{ email }</Text>
            </Text>
        ) : null;
        return (
            <View style={styles.linksContainer}>
                { userEmail }
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.onPressLogout}
                    style={[restoreStyles.restoreLink, styles.logoutButton]}
                >
                    <Text style={restoreStyles.restoreLinkLabel}>{ i18n.t('settings.logout') }</Text>
                </TouchableOpacity>
            </View>
        );
    }

    private get divider (): JSX.Element {
        return (
            <View style={styles.divider} />
        );
    }

    private get content (): JSX.Element {
        return (
            <View style={styles.contentContainer}>
                { this.lockIcon }
                { this.userName }
                { this.message }
                { this.buttons }
                { this.restoreButton }
                { this.helpLink }
                { this.divider }
                { this.termsAndConditions }
                { this.links }
                { this.divider }
                { this.logout }
            </View>
        );
    }

    private get headerGradient (): JSX.Element {
        return (
            <LinearGradient
                colors={HEADER_GRADIENT_COLORS}
                pointerEvents={'none'}
                style={styles.gradient}
            />
        );
    }

    private get closeButton (): JSX.Element {
        const { closeButton } = this.props;
        // WARNING: never ever remove the following or people might never pay again!
        if (!this.inTrial && isReleaseBundleID()) {
            return null;
        }
        // WARNING: this component is supposed to be used in a view that has access to the global navigation object
        // It's working here only because we're using the `onPressClose` prop
        return closeButton ? (
            <Header
                mode={'closeWhite'}
                // @ts-ignore
                navigation={{}}
                noGradient={true}
                onPressClose={this.onPressClose}
            />
        ) : null;
    }

    public render (): JSX.Element {
        const { animTransfrom } = this.state;
        const hasVideo = this.shouldDisplayVideo();
        const animatedStyle = {
            transform: [{
                translateY: animTransfrom.interpolate({
                    inputRange: [0, 1],
                    outputRange: [viewportHeight, 0]
                })
            }]
        };
        const scrollViewContentContainerStyle = [
            styles.scrollViewContentContainer,
            hasVideo ? styles.scrollViewContentContainerVideo : {}
        ];
        return (
            <Animated.View style={[styles.fullSpace, styles.container, animatedStyle]}>
                <View style={styles.flexZIndexHack}>
                    <ScrollView
                        contentContainerStyle={scrollViewContentContainerStyle}
                        decelerationRate={'fast'}
                        overScrollMode={'never'}
                        pinchGestureEnabled={false}
                        showsVerticalScrollIndicator={false}
                        >
                        { this.content }
                    </ScrollView>
                    { this.video }
                </View>
                { this.headerGradient }
                { this.closeButton }
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    email: state.userProfile?.email,
    firstName: state.userProfile?.firstName
});

export default connect(mapStateToProps, { logout }, null, { forwardRef: true })(Paywall);
