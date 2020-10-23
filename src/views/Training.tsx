import React, { Component, Fragment } from 'react';
import { View, Animated, Easing } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { IReduxState } from '../store/reducers';
// import { setTrainingVideoSeen } from '../store/modules/tutorials';
import { IProgressionState, setOpenProgressionProgramPopup } from '../store/modules/progression';
import { getRootComponentRef, IScreenProps } from '../index';
import { connect } from 'react-redux';
import { IInfluencer } from '../types/user';
// import { IVideoPlayerProps } from '../components/VideoPlayer';
import delays from '../utils/animDelays';
import i18n from '../utils/i18n';
import { checkSubscriptionStatus, getTrialRemainingDays } from '../utils/payment';
import { getRemoteConfigValue, REMOTE_CONFIG_VARIABLES } from '../utils/remoteConfig';

// import EllipsisSeparator from '../components/EllipsisSeparator';
import FadeInImage, { ERROR_PLACEHOLDER_SOURCE } from '../components/FadeInImage';
import Header from '../components/Header';
import LinearGradient from 'react-native-linear-gradient';
import MyProgram from '../components/Training/MyProgram';
import PostRegistration from '../components/Popups/PostRegistration';
import QuickWorkout from '../components/Training/QuickWorkout';
import Recovery from '../components/Training/Recovery';
import SharedParallaxView from '../components/SharedParallaxView';
import Sidebar from '../components/Sidebar';
import TargetedAreasTraining from '../components/Training/TargetedAreasTraining';
import TrialBanner from '../components/TrialBanner';
import TrialToast from '../components/TrialToast';
import WeeklyChallenge from '../components/Training/WeeklyChallenge';
import ProgramProgression from '../components/Popups/ProgramProgression';

import colors from '../styles/base/colors.style';
import { viewportHeight } from '../styles/base/metrics.style';
import { GRADIENT_COLORS } from '../styles/views/Root.style';
import { POST_REGISTRATION_POPUP_HEIGHT, POST_REGISTRATION_POPUP_WIDTH } from '../styles/components/Popups/PostRegistration.style';
import { SIDEBAR_WIDTH } from '../styles/components/Sidebar.style';
import styles, {
    BACKGROUND_LINE_TOP,
    BACKGROUND_LINE_COVER_HEIGHT,
    BACKGROUND_LINE_HEIGHT,
    BACKGROUND_FIRST_HEIGHT,
    SCROLL_THRESHOLD_RECOVERY
} from '../styles/views/Training.style';

import Blob from '../static/Training/background-first.svg';

interface IProps {
    connected: boolean;
    currentInfluencer: IInfluencer;
    navigation: any;
    progression: IProgressionState;
    setOpenProgressionProgramPopup: (openProgressionProgramPopup: boolean) => void;
    screenProps: IScreenProps;
    purchasedDuringSession: boolean;
    // setTrainingVideoSeen: (seen: boolean) => void;
    // trainingVideoSeen: boolean;
}

interface IState {
    animBackgroundOpacity: Animated.Value;
    animBackgroundTransform: Animated.Value;
    animImageOpacity: Animated.Value;
    animImageTransform: Animated.Value;
    animCircleOpacity: Animated.Value;
    animCircleTransform: Animated.Value;
    animEllipsisOpacity: Animated.Value;
    animEllipsisTransform: Animated.Value;
    remainingTrial?: { days: number; widget: string; }
}

const BACKGROUND_LINE_IMAGE = require('../static/Training/background-line.png');

class Training extends Component<IProps, IState> {

    private focused: boolean = false;
    private isFirstOpening: boolean;
    private recoveryRef: React.RefObject<any>;
    private scrollThresholdReached: boolean = false;
    private SharedParallaxViewRef: React.RefObject<SharedParallaxView>;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animBackgroundOpacity: new Animated.Value(0),
            animBackgroundTransform: new Animated.Value(0),
            animImageOpacity: new Animated.Value(0),
            animImageTransform: new Animated.Value(0),
            animCircleOpacity: new Animated.Value(0),
            animCircleTransform: new Animated.Value(0),
            animEllipsisOpacity: new Animated.Value(0),
            animEllipsisTransform: new Animated.Value(0)
        };
        this.isFirstOpening = props.navigation.getParam('isFirstOpening');
        this.recoveryRef = React.createRef();
        this.SharedParallaxViewRef = React.createRef();
    }

    public componentDidMount (): void {
        const {
            connected,
            navigation,
            progression
        } = this.props;

        this.focused = navigation.isFocused();

        this.animate(() => {
            if (this.focused && progression?.openProgressionProgramPopup) {
                this.openProgressionProgramPopup();
            }
        });

        // Don't do anything critical if the view isn't focused
        // Training is the initial route and it will be mounted even at first launch!
        if (!this.focused) {
            return;
        }

        if (!connected) {
            navigation.replace('Onboarding', { params: { errorMessage: i18n.t('onboarding.error') } });
            return;
        }

        this.checkSubscriptionStatus(() => {
            // Request notification permission here instead of doing it in index.tsx
            // This will prevent the native alert from popping up while the intro video is playing
            // Do it only if the subscription is active to avoid displaying it while users are faced with the paywall
            // Also, avoid doing it the very first time to avoid presenting them with too many popups at once
            // WARNING: this means users won't get asked for push notifications access during the first 6 hours in production
            if (!this.isFirstOpening) {
                const oneSignalManager = getRootComponentRef()?.getOneSignalManager();
                oneSignalManager && oneSignalManager.iOSPermissionPrompt();
            }
        });

        if (this.isFirstOpening) {
            // Open the "start free trial" popup
            this.props.screenProps?.popupManagerRef?.current?.requestPopup({
                backgroundColors: ['white'],
                backgroundType: 'color',
                borderRadius: 36,
                closeButtonBackgroundColor: colors.pink,
                ContentComponent: PostRegistration,
                displayCloseButton: false,
                height: POST_REGISTRATION_POPUP_HEIGHT,
                scrollView: true,
                width: POST_REGISTRATION_POPUP_WIDTH
            });
        }

        // Show video tutorial on first view display (disabled for now)
        // Make sure to use `this.focused` to prevent an ugly error message from being displayed at startup
        // because we would be launching a request while not being logged in yet...
        // if (this.focused && !this.props.trainingVideoSeen) {
        //     const onDidBlur = () => {
        //         this.props.setTrainingVideoSeen(true);
        //         this.props.screenProps.toastManagerRef?.current?.openToast({
        //             message: i18n.t('tutorials.tutorialVideoEndMessage'),
        //             type: 'info'
        //         });
        //     };

        //     try {
        //         const tutorialsResponse = await api.get(ENDPOINTS.tutorials + 'training');
        //         const video = tutorialsResponse?.data?.videos && tutorialsResponse?.data?.videos[0];

        //         if (!!video) {
        //             const player: IVideoPlayerProps = {
        //                 onDidBlur,
        //                 thumbnailSource: video.thumbnailUrl,
        //                 videoSource: video.url
        //             };
        //             this.props.navigation.navigate('Video', { player });
        //         }
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { progression } = this.props;

        if (
            prevProps?.progression?.openProgressionProgramPopup !== progression?.openProgressionProgramPopup &&
            progression?.openProgressionProgramPopup && this.focused
        ) {
            this.openProgressionProgramPopup();
        }
    }

    private async checkSubscriptionStatus (callback?: () => void): Promise<void> {
        const subscription = await checkSubscriptionStatus(() => {
            callback && callback();
        });
        if (!this.props.purchasedDuringSession) {
            // Do not compute remaining days when a purchased has just been made
            const remainingTrialDays = getTrialRemainingDays(subscription);
            if (remainingTrialDays !== null) {
                const trialWidget = getRemoteConfigValue(REMOTE_CONFIG_VARIABLES.trialWidget.key);
                this.setState({ remainingTrial: { days: remainingTrialDays, widget: trialWidget?.value?.toString() } });
            }
        }
    }

    private onDidFocus = (): void => {
        const { progression } = this.props;

        this.focused = true;

        // Display week/program completion popup if need be
        if (progression?.openProgressionProgramPopup === true) {
            this.openProgressionProgramPopup();
        }
    }

    private onWillBlur = (): void => {
        this.focused = false;
    }

    private openProgressionProgramPopup = (): void => {
        const { navigation, screenProps } = this.props;
        this.props.setOpenProgressionProgramPopup(false);
        this.props.screenProps?.popupManagerRef?.current?.requestPopup({
            backgroundColors: ['white'],
            borderRadius: 44,
            ContentComponent: ProgramProgression,
            ContentComponentProps: {
                navigation: navigation,
                screenProps: screenProps
            },
            height: 460,
            overflow: false,
            position: 'center',
            scrollView: true
        });
    }

    private openTrialPaywall = (): void => {
        // WARNING: the paywall is dismissable when the second paramter is set to `true`
        // Never use this function as is if the user has already finished his trial
        getRootComponentRef()?.showPaywall(true, true);
    }

    private getAnimation (
        opacityValue: Animated.Value, transformValue: Animated.Value, delay: number = 0, speed: number = 12, bounciness: number = 6
    ): Animated.CompositeAnimation {
        const opacityParams = {
            toValue: 1,
            duration: 250,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: speed,
            bounciness: bounciness,
            isInteraction: false,
            useNativeDriver: true
        };
        return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacityValue, opacityParams),
                Animated.spring(transformValue, springParams)
            ])
        ]);
    }

    private animate (callback?: () => void): void {
        const {
            animCircleOpacity,
            animCircleTransform,
            animBackgroundOpacity,
            animBackgroundTransform,
            animEllipsisOpacity,
            animEllipsisTransform
        } = this.state;

        Animated.parallel([
            this.getAnimation(animBackgroundOpacity, animBackgroundTransform, delays.views.training.header),
            this.getAnimation(animCircleOpacity, animCircleTransform, delays.views.training.header + 350),
            this.getAnimation(animEllipsisOpacity, animEllipsisTransform, delays.views.training.header + 450, 10, 6)
        ]).start(() => {
            callback && callback();
        });
    }

    private onInfluencerImageLoad = () => {
        const { animImageOpacity, animImageTransform } = this.state;
        this.getAnimation(animImageOpacity, animImageTransform, delays.views.training.header + 150, 20, 10).start();
    }

    private onScrollThresholdReached = (): void => {
        if (!this.scrollThresholdReached && this.recoveryRef?.current) {
            this.recoveryRef?.current.animateScrollHint &&
            this.recoveryRef?.current.animateScrollHint();
            this.scrollThresholdReached = true;
        }
    }

    private get topContent (): JSX.Element {
        const {
            animBackgroundOpacity, animBackgroundTransform,
            animCircleOpacity, animCircleTransform,
            animImageOpacity, animImageTransform,
            animEllipsisOpacity, animEllipsisTransform } = this.state;
        const animatedBackgroundStyle = {
            opacity: animBackgroundOpacity,
            transform: [
                {
                    translateY: animBackgroundTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [BACKGROUND_FIRST_HEIGHT / 2, 0]
                    })
                },
                {
                    scale: animBackgroundTransform
                }
            ]
        };
        const animatedCircleStyle = {
            opacity: animCircleOpacity,
            transform: [
                {
                    translateX: animCircleTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [SIDEBAR_WIDTH, 0]
                    })
                }
            ]
        };
        const animatedEllipsisStyle = {
            opacity: animEllipsisOpacity,
            transform: [
                {
                    translateX: animEllipsisTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-120, 0]
                    })
                }
            ]
        };
        const animatedImageStyle = [
            {
                opacity: animImageOpacity,
                transform: [
                    {
                        scale: animImageTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.25, 1]
                        })
                    }
                ]
            }
        ];

        const influencerPicture = this.props.currentInfluencer?.picture?.url ? (
            <FadeInImage
                containerCustomStyle={styles.influencerImage}
                onLoad={this.onInfluencerImageLoad}
                source={{ uri: this.props.currentInfluencer.picture.url }}
            />
        ) : (
            <FadeInImage
                containerCustomStyle={styles.influencerImage}
                source={ERROR_PLACEHOLDER_SOURCE}
            />
        );

        return (
            <View style={styles.topContentContainer}>
                <Animated.View style={animatedBackgroundStyle}>
                    <Blob style={styles.backgroundBlob} />
                </Animated.View>
                <Animated.View style={[styles.circleContainer, animatedCircleStyle]}>
                    <View style={styles.circleLeft}>
                        <View style={styles.circle} />
                    </View>
                    <View style={styles.circleBottom}>
                        <View style={styles.circle} />
                    </View>
                </Animated.View>
                {/* <Animated.View style={animatedEllipsisStyle}>
                    <EllipsisSeparator
                        containerTextStyle={styles.ellipsisFirstContainer}
                        textStyle={styles.ellipsisTextFirst}
                    />
                </Animated.View> */}
                <Animated.View style={animatedImageStyle}>
                    { influencerPicture }
                </Animated.View>
            </View>
        );
    }

    private getBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return <Sidebar scrollY={animatedValue}/>;
    }

    private getBackgroundLine = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const animatedStyle = {
            transform: [{
                translateY: animatedValue.interpolate({
                    inputRange: [
                        0,
                        Math.max(BACKGROUND_LINE_TOP - viewportHeight + BACKGROUND_LINE_COVER_HEIGHT, 0),
                        Math.max(BACKGROUND_LINE_TOP - viewportHeight + BACKGROUND_LINE_COVER_HEIGHT / 2 + BACKGROUND_LINE_HEIGHT, BACKGROUND_LINE_HEIGHT)
                    ],
                    outputRange: [
                        0,
                        BACKGROUND_LINE_COVER_HEIGHT / 2,
                        BACKGROUND_LINE_HEIGHT + BACKGROUND_LINE_COVER_HEIGHT
                    ]
                })
            }]
        };

        return (
            <Fragment>
                <FadeInImage
                    source={BACKGROUND_LINE_IMAGE}
                    containerCustomStyle={styles.backgroundLineContainer}
                />
                <Animated.View style={[styles.backgroundLineCover, animatedStyle]} />
            </Fragment>
        );
    }

    private getForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <Fragment>
                <Header animatedValue={animatedValue} mode={'menu'} />
                { this.renderRemainingTrialBanner(animatedValue) }
                { this.renderRemainingTrialToast() }
            </Fragment>
        );
    }

    private renderRemainingTrialBanner = (animatedValue: Animated.Value): JSX.Element => {
        const { purchasedDuringSession } = this.props;
        const { remainingTrial } = this.state;
        if (purchasedDuringSession || !remainingTrial || remainingTrial?.widget !== 'banner') {
            return null;
        }
        const { days } = remainingTrial;
        return (
            <TrialBanner
                openPaywall={this.openTrialPaywall}
                remainingDays={days}
                scrollY={animatedValue}
            />
        );
    }

    private renderRemainingTrialToast = (): JSX.Element => {
        const { purchasedDuringSession } = this.props;
        const { remainingTrial } = this.state;
        if (purchasedDuringSession || !remainingTrial || remainingTrial?.widget !== 'toast') {
            return null;
        }
        const { days } = remainingTrial;
        return (
            <TrialToast
                openPaywall={this.openTrialPaywall}
                remainingDays={days}
            />
        );
    }

    public render (): JSX.Element {
        if (!this.props.connected) {
            return (
                <LinearGradient
                    angle={112}
                    colors={GRADIENT_COLORS}
                    style={styles.absoluteFill}
                    useAngle={true}
                />
            );
        }

        return (
            <Fragment>
                <NavigationEvents
                    onDidFocus={this.onDidFocus}
                    onWillBlur={this.onWillBlur}
                />
                <View style={styles.container}>
                    <SharedParallaxView
                        onScrollThresholdReached={this.onScrollThresholdReached}
                        ref={this.SharedParallaxViewRef}
                        renderBackground={this.getBackground}
                        renderForeground={this.getForeground}
                        renderScrollViewBackgroundChild={this.getBackgroundLine}
                        scrollThreshold={SCROLL_THRESHOLD_RECOVERY}
                    >
                        { this.topContent }
                        <MyProgram
                            containerStyle={styles.myProgram}
                            navigation={this.props.navigation}
                            screenProps={this.props.screenProps}
                        />
                        <QuickWorkout
                            containerStyle={styles.quickWorkout}
                            screenProps={this.props.screenProps}
                        />
                        <WeeklyChallenge
                            containerStyle={styles.weeklyChallenge}
                            screenProps={this.props.screenProps}
                        />
                        <Recovery
                            onRef={this.recoveryRef}
                            containerStyle={styles.recovery}
                            screenProps={this.props.screenProps}
                        />
                        <TargetedAreasTraining
                            containerStyle={styles.targetedAreasTraining}
                            popupManagerRef={this.props.screenProps.popupManagerRef}
                            screenProps={this.props.screenProps}
                        />
                    </SharedParallaxView>
                </View>
            </Fragment>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    connected: state.auth.connected,
    currentInfluencer: state.influencers.currentInfluencer,
    progression: state.progression,
    purchasedDuringSession: state.userInterface.purchasedDuringSession
    // trainingVideoSeen: state.tutorials.trainingVideoSeen,
});

export default connect(mapStateToProps, {
    setOpenProgressionProgramPopup
    // setTrainingVideoSeen
}) (Training);
