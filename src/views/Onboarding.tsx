import React, { PureComponent, Fragment } from 'react';
import { Text, View, Animated } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';
import { skipOnboardingVideo, updateOnboardingStep, OnboardingSteps } from '../store/modules/onboarding';
import { logEvent } from '../utils/analytics';
import delays from '../utils/animDelays';
import i18n, { getLanguageShortName } from '../utils/i18n';
import { isIOS } from '../utils/os';
import { LOGIN_IMAGE_URL } from '../utils/staticLinks';
import { getLocalVideoFileName, CDN_VIDEOS_URL, CDN_VIDEOS_THUMBS_URL } from '../utils/video';
import { IScreenProps } from '../index';

import MusicControl from 'react-native-music-control';
import SystemSetting from 'react-native-system-setting';

import FadeInImage from '../components/FadeInImage';
import SharedButton from '../components/SharedButton';
import TouchableScale from '../components/TouchableScale';
import VideoPlayer from '../components/VideoPlayer';

import colors from '../styles/base/colors.style';
import { viewportHeight } from '../styles/base/metrics.style';
import styles from '../styles/views/Onboarding.style';

import BackgroundLineVector from '../static/Onboarding/background-line.svg';

interface IProps {
    currentStep: OnboardingSteps;
    navigation: any;
    screenProps: IScreenProps;
    skipVideo: boolean;
    skipOnboardingVideo: (skipVideo: boolean) => void;
    updateOnboardingStep: (step: OnboardingSteps) => void;
}

interface IState {
    animRegisterButtonTransform: Animated.Value;
    animLoginButtonTransform: Animated.Value;
    animWelcomeVideoOpacity: Animated.Value;
    animSkipButtonOpacity: Animated.Value;
    pauseBackgroundVideo: boolean;
    pauseWelcomeVideo: boolean;
    shouldLoadBackgroundContent: boolean;
    welcomeVideoFinished: boolean;
    welcomeVideoProgressPercentage: number;
}

const LOGO_NULI = require('../static/shared/logo-nuli.png');

class Onboarding extends PureComponent<IProps, IState> {

    private errorMessage: string;
    private welcomeVideoDuration: number;
    private welcomeVideoThresholdReached25: boolean;
    private welcomeVideoThresholdReached50: boolean;
    private welcomeVideoThresholdReached75: boolean;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animRegisterButtonTransform: new Animated.Value(0),
            animLoginButtonTransform: new Animated.Value(0),
            animWelcomeVideoOpacity: new Animated.Value(1),
            animSkipButtonOpacity: new Animated.Value(1),
            pauseBackgroundVideo: true,
            pauseWelcomeVideo: false,
            shouldLoadBackgroundContent: false,
            welcomeVideoFinished: false,
            welcomeVideoProgressPercentage: 0
        };
        this.errorMessage = this.props.navigation.getParam('errorMessage');
        this.welcomeVideoDuration = 0;
        this.welcomeVideoThresholdReached25 = false;
        this.welcomeVideoThresholdReached50 = false;
        this.welcomeVideoThresholdReached75 = false;
    }

    public componentDidMount (): void {
        const { currentStep, skipVideo } = this.props;

        if (!currentStep) {
            this.props.updateOnboardingStep(OnboardingSteps.Onboarding);
        }

        if (skipVideo) {
            this.setState({ shouldLoadBackgroundContent: true });
            this.removeWelcomeVideo();
        }

        if (this.errorMessage) {
            this.props.screenProps.toastManagerRef?.current?.openToast({
                duration: 5000,
                message: this.errorMessage,
                type: 'error'
            });
        }

        if (isIOS) {
            // Register to pause event triggered when headphones are unplugged
            // or a bluetooth audio peripheral disconnects from the device
            // Since it automatically pauses the video at system's level, we need to get it resuming manually
            // @ts-ignore
            MusicControl.on('pause', () => {
                if (!this.state.welcomeVideoFinished) {
                    this.setState({ pauseWelcomeVideo: true }, () => {
                        this.setState({ pauseWelcomeVideo: false }, () => {
                            SystemSetting.setVolume(0, { showUI: true });
                        });
                    });
                } else {
                    this.setState({ pauseBackgroundVideo: true }, () => {
                        this.setState({ pauseBackgroundVideo: false }, () => {
                            SystemSetting.setVolume(0, { showUI: true });
                        });
                    });
                }
            });
        }
    }

    private onDidFocus = (): void => {
        this.setState({ pauseBackgroundVideo: false });
    }

    private onWillBlur = (): void => {
        this.setState({ pauseBackgroundVideo: true });
    }

    private animateButtons (): void {
        const { animRegisterButtonTransform, animLoginButtonTransform } = this.state;
        Animated.parallel([
            Animated.spring(animRegisterButtonTransform, {
                toValue: 1,
                speed: 5,
                bounciness: 7,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.sequence([
                Animated.delay(delays.views.onboarding.loginButton),
                Animated.spring(animLoginButtonTransform, {
                    toValue: 1,
                    speed: 5,
                    bounciness: 7,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private getLoginVideoSource (): string {
        return getLocalVideoFileName('login');
    }

    private getWelcomeVideoSource (): string {
        const languageCode = getLanguageShortName();
        return `${CDN_VIDEOS_URL}welcome_v2_${languageCode}.mp4`;
    }

    private getWelcomeVideoThumbnailSource (): string {
        return `${CDN_VIDEOS_THUMBS_URL}welcome_v2.jpg`;
    }

    private onPressRegister = (): void => {
        this.props.navigation.navigate('Registration');
    }

    private onPressLogin = (): void => {
        this.props.navigation.navigate('Login', { openedFrom: 'Onboarding' });
    }

    private onWelcomeVideoLoad = (_: any, duration: number): void => {
        this.welcomeVideoDuration = duration;
    }

    private onWelcomeVideoProgress = (payload: any): void => {
        const currentTime = payload?.currentTime;

        if (!currentTime || !this.welcomeVideoDuration) {
            return;
        }

        const { welcomeVideoProgressPercentage } = this.state;
        const percentage = Math.round(currentTime / this.welcomeVideoDuration * 100);

        // Prevent values from being called multiple times because of the rounding
        if (percentage === 25 && !this.welcomeVideoThresholdReached25) {
            this.welcomeVideoThresholdReached25 = true;
            logEvent('onboarding_video_progress', { progress: `${percentage}%` });
        } else if (percentage === 50 && !this.welcomeVideoThresholdReached50) {
            this.welcomeVideoThresholdReached50 = true;
            logEvent('onboarding_video_progress', { progress: `${percentage}%` });
        } else if (percentage === 75 && !this.welcomeVideoThresholdReached75) {
            this.welcomeVideoThresholdReached75 = true;
            logEvent('onboarding_video_progress', { progress: `${percentage}%` });
        }

        if (percentage !== welcomeVideoProgressPercentage) {
            this.setState({ welcomeVideoProgressPercentage: percentage });
        }
    }

    private onWelcomeVideoEnd = (): void => {
        logEvent('onboarding_video_progress', { progress: '100%' });
        this.hideWelcomeVideo();
    }

    private hideWelcomeVideo (): void {
        const { animWelcomeVideoOpacity, animSkipButtonOpacity } = this.state;
        const duration = 250;

        Animated.parallel([
            Animated.timing(animWelcomeVideoOpacity, {
                toValue: 0,
                duration,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animSkipButtonOpacity, {
                toValue: 0,
                duration,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => this.removeWelcomeVideo());
    }

    private removeWelcomeVideo (): void {
        this.props.skipOnboardingVideo(true);
        this.setState({
            shouldLoadBackgroundContent: true,
            welcomeVideoFinished: true
        }, () => {
            this.animateButtons();
        });
    }

    private get loginImagePreloader (): JSX.Element {
        // Preload login/register image here to avoid the fetch delay later on
        return (
            <View
                pointerEvents={'none'}
                style={{ position: 'absolute', opacity: 0 }}
            >
                <FadeInImage
                    source={{ uri: LOGIN_IMAGE_URL }}
                    disableAnimation={true}
                />
            </View>
        );
    }

    private get background (): JSX.Element {
        const { pauseBackgroundVideo, welcomeVideoFinished, shouldLoadBackgroundContent } = this.state;
        const videoPaused = pauseBackgroundVideo || !welcomeVideoFinished;
        // WARNING: `paused={true}` won't work on mount if `playOnMount={true}`
        // I.e., the background video will play as soon as it's rendered (potentially 2 videos playing at the same time)
        const video = shouldLoadBackgroundContent ? (
            <VideoPlayer
                loop={true}
                paused={videoPaused}
                playOnMount={true}
                videoProps={{ muted: true }}
                videoSource={{ uri: this.getLoginVideoSource() }}
            />
        ) : null;
        return (
            <Fragment>
                { video }
                <FadeInImage
                    source={LOGO_NULI}
                    containerCustomStyle={styles.logoImageContainer}
                    tintColor={colors.violetDark}
                    resizeMode={'contain'}
                />
                <BackgroundLineVector
                    style={styles.backgroundLineContainer}
                    height={styles.backgroundLineContainer.height}
                    width={styles.backgroundLineContainer.width}
                />
            </Fragment>
        );
    }

    private get buttons (): JSX.Element {
        const { animRegisterButtonTransform, animLoginButtonTransform } = this.state;
        const animatedRegisterStyle = {
            transform: [
                {
                    translateY: animRegisterButtonTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [viewportHeight / 2, 0]
                    })
                }
            ]
        };
        const animatedLoginStyle = {
            transform: [
                {
                    translateY: animLoginButtonTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [viewportHeight / 2, 0]
                    })
                }
            ]
        };
        return (
            <View style={styles.buttonsContainer}>
                <Animated.View style={[styles.buttonWrapper, animatedRegisterStyle]}>
                    <SharedButton
                        borderRadius={20}
                        color={'blue'}
                        isTouchableScale={true}
                        onPress={this.onPressRegister}
                        text={i18n.t('onboarding.joinNow')}
                        withBackgroundBorders={true}
                    />
                </Animated.View>
                <Animated.View style={[styles.buttonWrapper, styles.rightButtonWrapper, animatedLoginStyle]}>
                    <SharedButton
                        borderRadius={20}
                        color={'pink'}
                        isTouchableScale={true}
                        onPress={this.onPressLogin}
                        text={i18n.t('onboarding.login')}
                        withBackgroundBorders={true}
                    />
                </Animated.View>
            </View>
        );
    }

    private get welcomeVideo (): JSX.Element {
        const { animWelcomeVideoOpacity, pauseWelcomeVideo } = this.state;
        return(
            <Animated.View style={[styles.fullscreen, { opacity: animWelcomeVideoOpacity }]}>
                <VideoPlayer
                    controls={true}
                    paused={pauseWelcomeVideo}
                    playOnMount={true}
                    thumbnailSource={this.getWelcomeVideoThumbnailSource()}
                    videoProps={{
                        onEnd: this.onWelcomeVideoEnd,
                        onLoad: this.onWelcomeVideoLoad,
                        onProgress: this.onWelcomeVideoProgress
                    }}
                    videoSource={{ uri: this.getWelcomeVideoSource() }}
                />
            </Animated.View>
        );
    }

    private get skipButton (): JSX.Element {
        const { animSkipButtonOpacity, welcomeVideoProgressPercentage } = this.state;
        return(
            <Animated.View style={[styles.fullscreen, { opacity: animSkipButtonOpacity }]} pointerEvents={'box-none'}>
                <TouchableScale
                    containerStyle={styles.skipButtonContainer}
                    style={styles.skipButton}
                    onPress={() => {
                        this.hideWelcomeVideo();
                        logEvent('onboarding_video_skip', { progress: `${welcomeVideoProgressPercentage}%` });
                    }}
                >
                    <Text style={styles.skipbuttonLabel}>{i18n.t('onboarding.skip')}</Text>
                </TouchableScale>
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <NavigationEvents
                  onDidFocus={this.onDidFocus}
                  onWillBlur={this.onWillBlur}
                />
                { this.loginImagePreloader}
                { this.background }
                { this.buttons }
                { !this.state.welcomeVideoFinished && this.welcomeVideo }
                { !this.state.welcomeVideoFinished && this.skipButton }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    currentStep: state.onboarding.currentStep,
    skipVideo: state.onboarding.skipVideo
});

export default connect(mapStateToProps, {
    updateOnboardingStep,
    skipOnboardingVideo
})(Onboarding);
