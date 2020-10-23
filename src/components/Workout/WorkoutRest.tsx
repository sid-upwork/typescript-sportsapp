import React, { PureComponent, Fragment } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity, Vibration } from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../../store/reducers';
import { setWorkoutPaused } from '../../store/modules/workoutProgression';
import { scheduleRestLocalNotification, cancelRestLocalNotification } from '../../utils/localNotifications';
import { getFormattedDuration, getTargetLabel } from '../../utils/workout';
import { INextExerciseData } from '../../views/Workout';
import { IScreenProps } from '../../index';
import { ETooltipIds } from '../../store/modules/tutorials';
import { getFileReference } from '../../utils/file';
import i18n from '../../utils/i18n';

import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';
import SharedVerticalTitle from '../SharedVerticalTitle';
import Timer from '../Timer';
import Tooltip from '../Tooltip';
import WorkoutRestPopup from './WorkoutRestPopup';

import { viewportWidth } from '../../styles/base/metrics.style';
import { REST_POPUP_HEIGHT } from '../../styles/components/Workout/WorkoutRestPopup.style';
import styles, {
    BUTTON_NEXT_HEIGHT,
    NEXT_IMAGE_HEIGHT,
    NEXT_CIRCUIT_WIDTH,
    TOP_GRADIENT_COLORS,
    TIMER_CONTAINER_MINIMIZED_SCALE,
    TIMER_CONTAINER_TRANSLATE_X,
    TIMER_CONTAINER_TRANSLATE_Y
} from '../../styles/components/Workout/WorkoutRest.style';

import BackgroundShape from '../../static/Workout/rest-background_shape.svg';
import Blob from '../../static/Workout/rest-blob.svg';
import ButtonMinimizeShape from '../../static/Workout/rest-minimize.svg';
import ButtonNextShape from '../../static/Workout/rest-next.svg';

const TIME_UPDATE_SECONDS = 10;

interface IProps {
    appInBackground: boolean;
    lastWorkoutDurationUpdate: number;
    nextExerciseData: INextExerciseData;
    paused?: boolean;
    onClose?: () => void;
    onMinimize?: () => void;
    onOpen?: () => void;
    postRestPopup: boolean;
    restDuration: number;
    restNotifications: boolean;
    screenProps: IScreenProps;
    setWorkoutPaused: (workoutPaused: boolean) => void;
    workoutPaused: boolean;
    workoutSounds: boolean;
}

interface IState {
    animBackgroundShapeOpacity: Animated.Value;
    animBackgroundShapeTransform: Animated.Value;
    animButtonMinimizeOpacity: Animated.Value;
    animButtonMinimizeTransform: Animated.Value;
    animButtonNextOpacity: Animated.Value;
    animButtonNextTransform: Animated.Value;
    animCircle1Opacity: Animated.Value;
    animCircle1Transform: Animated.Value;
    animCircle2Opacity: Animated.Value;
    animCircle2Transform: Animated.Value;
    animNextImageOpacity: Animated.Value;
    animNextImageTransform: Animated.Value;
    animNextTextOpacity: Animated.Value;
    animNextTextTransform: Animated.Value;
    animTopGradientOpacity: Animated.Value;
    animTimerOpacity: Animated.Value;
    animTimerTransform: Animated.Value;
    animTimerBackgroundOpacity: Animated.Value;
    animTimerPositionTransform: Animated.Value;
    animTimerButtonMinusOpacity: Animated.Value;
    animTimerButtonMinusTransform: Animated.Value;
    animTimerButtonPlusOpacity: Animated.Value;
    animTimerButtonPlusTransform: Animated.Value;
    animTitleLeftOpacity: Animated.Value;
    animTitleLeftTransform: Animated.Value;
    animTitleRightOpacity: Animated.Value;
    animTitleRightTransform: Animated.Value;
    animTitleShapeOpacity: Animated.Value;
    animTitleShapeTransform: Animated.Value;
    hideElements: boolean;
    minimized: boolean;
    openAnimationsComplete: boolean;
    playSound3: boolean;
    playSound2: boolean;
    playSound1: boolean;
    playSoundGo: boolean;
}

class WorkoutRest extends PureComponent<IProps, IState> {

    private pauseInBackground: boolean;
    private playLastSound: boolean;
    private timerRef: React.RefObject<Timer>;

    constructor (props: IProps) {
        super(props);
        this.playLastSound = true;
        this.timerRef = React.createRef();
        this.state = {
            animBackgroundShapeOpacity: new Animated.Value(0),
            animBackgroundShapeTransform: new Animated.Value(0),
            animButtonMinimizeOpacity: new Animated.Value(0),
            animButtonMinimizeTransform: new Animated.Value(0),
            animButtonNextOpacity: new Animated.Value(0),
            animButtonNextTransform: new Animated.Value(0),
            animCircle1Opacity: new Animated.Value(0),
            animCircle1Transform: new Animated.Value(0),
            animCircle2Opacity: new Animated.Value(0),
            animCircle2Transform: new Animated.Value(0),
            animNextImageOpacity: new Animated.Value(0),
            animNextImageTransform: new Animated.Value(0),
            animNextTextOpacity: new Animated.Value(0),
            animNextTextTransform: new Animated.Value(0),
            animTopGradientOpacity: new Animated.Value(0),
            animTimerOpacity: new Animated.Value(0),
            animTimerTransform: new Animated.Value(0),
            animTimerBackgroundOpacity: new Animated.Value(0),
            animTimerPositionTransform: new Animated.Value(0),
            animTimerButtonMinusOpacity: new Animated.Value(0),
            animTimerButtonMinusTransform: new Animated.Value(0),
            animTimerButtonPlusOpacity: new Animated.Value(0),
            animTimerButtonPlusTransform: new Animated.Value(0),
            animTitleLeftOpacity: new Animated.Value(0),
            animTitleLeftTransform: new Animated.Value(0),
            animTitleRightOpacity: new Animated.Value(0),
            animTitleRightTransform: new Animated.Value(0),
            animTitleShapeOpacity: new Animated.Value(0),
            animTitleShapeTransform: new Animated.Value(0),
            hideElements: false,
            minimized: false,
            openAnimationsComplete: false,
            playSound3: false,
            playSound2: false,
            playSound1: false,
            playSoundGo: false
        };
    }

    public componentDidMount (): void {
        const { restDuration } = this.props;
        if (restDuration) {
            this.props.setWorkoutPaused(false);
            this.open();
        }
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { appInBackground, lastWorkoutDurationUpdate, restNotifications, workoutPaused } = this.props;

        // App is going to background
        if (prevProps.appInBackground === false && appInBackground === true) {
            // Timer will be automatically paused by WorkoutTimer since it'll call setWorkoutPaused
            // But we need to keep track of whether the workout was paused or not
            // We may have a timing issue since the pause is handled by WorkoutTimer
            if (!workoutPaused) {
                this.pauseInBackground = true;
                restNotifications && scheduleRestLocalNotification(this.timerRef?.current?.getTimeInSeconds());
            } else {
                this.pauseInBackground = false;
            }
        }

        // App is coming back to foreground
        if (prevProps.appInBackground === true && appInBackground === false) {
            if (this.pauseInBackground) {
                restNotifications && cancelRestLocalNotification();

                // User was away while the timer was still going so we need to update it
                const secondsAwayFromApp = Math.round((new Date().getTime() - lastWorkoutDurationUpdate) / 1000);
                const initialTime = this.timerRef?.current?.getTimeInSeconds();
                const updatedTime = initialTime - secondsAwayFromApp;
                this.timerRef?.current?.setCurrentTime(updatedTime);
                // Timer will be automatically resumed by WorkoutTimer since it'll call setWorkoutPaused

                if (updatedTime <= 0) {
                    this.playLastSound = false;
                }
            }
        }
    }

    private onTick = (seconds: number): void => {
        const { workoutSounds } = this.props;

        // Animate title shape
        // WARNING: unfortunately, this great animation apparently gets the iOS devices hot pretty quickly :'(
        // if (!this.state.minimized) {
        //     this.playTickAnimation();
        // }

        // Play the relevant countdown sound
        if (seconds === 3) {
            workoutSounds && this.setState({ playSound3: true });
        } else if (seconds === 2) {
            workoutSounds && this.setState({ playSound2: true });
        } else if (seconds === 1) {
            workoutSounds && this.setState({ playSound1: true });
        } else if (seconds === 0) {
            this.playTickAnimation();
            if (workoutSounds && this.playLastSound) {
                this.setState({ playSoundGo: true }, () => {
                    Vibration.vibrate(400);
                });
            }
        }
    }

    private open = (): void => {
        this.animate(true, null, true);
    }

    private close = (): void => {
        this.animate(false);
    }

    private closeDirectly = (): void => {
        this.animate(false, null, null, true);
    }

    private minimize = (): void => {
        this.setState({ minimized: true }, () => {
            this.animate(false, true);
            this.animateTimerPosition(true);
        });
    }

    private maximize = (): void => {
        this.setState({ minimized: false }, () => {
            this.animate(true);
            this.animateTimerPosition(false);
            if (this.props.workoutPaused) {
                this.props.setWorkoutPaused(false);
            }
        });
    }

    private decreaseTimerDuration = (): void => {
        this.timerRef?.current?.updateCurrentTime && this.timerRef?.current?.updateCurrentTime(-TIME_UPDATE_SECONDS);
    }

    private increaseTimerDuration = (): void => {
        this.timerRef?.current?.updateCurrentTime && this.timerRef?.current?.updateCurrentTime(TIME_UPDATE_SECONDS);
    }

    private playTickAnimation = (): void => {
        const { animTitleShapeTransform } = this.state;
        animTitleShapeTransform.setValue(0);
        Animated.spring(animTitleShapeTransform, {
            toValue: 1,
            speed: 3,
            bounciness: 2,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private animate (
        animateIn?: boolean, showTimer?: boolean, firstOpening?: boolean, disablePopup?: boolean
    ): void {
        const {
            animCircle1Opacity, animCircle1Transform,
            animCircle2Opacity, animCircle2Transform,
            animBackgroundShapeOpacity, animBackgroundShapeTransform,
            animButtonMinimizeOpacity, animButtonMinimizeTransform,
            animButtonNextOpacity, animButtonNextTransform,
            animNextImageOpacity, animNextImageTransform,
            animNextTextOpacity, animNextTextTransform,
            animTimerOpacity, animTimerTransform,
            animTimerButtonMinusOpacity, animTimerButtonMinusTransform,
            animTimerButtonPlusOpacity, animTimerButtonPlusTransform,
            animTitleLeftOpacity, animTitleLeftTransform,
            animTitleRightOpacity, animTitleRightTransform,
            animTitleShapeOpacity,
            animTopGradientOpacity,
            hideElements,
            minimized
        } = this.state;
        const { onClose, onMinimize, onOpen } = this.props;

        const toValue = animateIn ? 1 : 0;
        const duration = animateIn ? 350 : 250;
        const staggerDelay = animateIn ? 40 : 30;
        const commonParams = {
            toValue,
            isInteraction: false,
            useNativeDriver: true
        };
        const opacityParams = {
            ...commonParams,
            duration: 150,
            easing: Easing.linear
        };
        const timingParams = {
            ...commonParams,
            duration,
            easing: Easing.out(Easing.ease)
        };
        const springParams = {
            ...commonParams,
            speed: 30,
            bounciness: 6
        };

        // Timer needs to stay visible when minimizing it
        const timerAnimation = !animateIn && showTimer ? Animated.parallel([]) : Animated.parallel([
            Animated.timing(animTimerOpacity, opacityParams),
            Animated.spring(animTimerTransform, springParams)
        ]);

        if (!minimized && hideElements) {
            this.setState({ hideElements: false });
        }

        Animated.parallel([
            Animated.sequence([
                Animated.delay(animateIn ? 0 : 250 + 30),
                Animated.parallel([
                    Animated.timing(animCircle1Opacity, opacityParams),
                    Animated.timing(animCircle1Transform, timingParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(animateIn ? duration / 2 : 250 + 0),
                Animated.parallel([
                    Animated.timing(animCircle2Opacity, opacityParams),
                    Animated.timing(animCircle2Transform, timingParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(animateIn ? duration - 100 : duration / 2),
                Animated.parallel([
                    Animated.timing(animTopGradientOpacity, opacityParams),
                    Animated.timing(animBackgroundShapeOpacity, opacityParams),
                    Animated.spring(animBackgroundShapeTransform, {
                        ...commonParams,
                        bounciness: 3
                    })
                ])
            ]),
            Animated.sequence([
                Animated.delay(animateIn ? duration : 0),
                Animated.parallel([
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 0 : staggerDelay * 9),
                        Animated.timing(animTitleShapeOpacity, {
                            ...opacityParams,
                            duration: animateIn ? 250 : 150
                        })
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 1 : staggerDelay * 8),
                        Animated.parallel([
                            Animated.timing(animTitleLeftOpacity, opacityParams),
                            Animated.spring(animTitleLeftTransform, springParams)
                        ])
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 2 : staggerDelay * 7),
                        Animated.parallel([
                            Animated.timing(animTitleRightOpacity, opacityParams),
                            Animated.spring(animTitleRightTransform, springParams)
                        ])
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 3 : staggerDelay * 6),
                        Animated.parallel([
                            Animated.timing(animTimerButtonMinusOpacity, opacityParams),
                            Animated.spring(animTimerButtonMinusTransform, springParams)
                        ])
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 4 : staggerDelay * 5),
                        timerAnimation
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 5 : staggerDelay * 4),
                        Animated.parallel([
                            Animated.timing(animTimerButtonPlusOpacity, opacityParams),
                            Animated.spring(animTimerButtonPlusTransform, springParams)
                        ])
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 6 : staggerDelay * 3),
                        Animated.parallel([
                            Animated.timing(animNextTextOpacity, opacityParams),
                            Animated.spring(animNextTextTransform, springParams)
                        ])
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 7 : staggerDelay * 2),
                        Animated.parallel([
                            Animated.timing(animNextImageOpacity, opacityParams),
                            Animated.spring(animNextImageTransform, springParams)
                        ])
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 8 : staggerDelay * 1),
                        Animated.parallel([
                            Animated.timing(animButtonNextOpacity, opacityParams),
                            Animated.spring(animButtonNextTransform, springParams)
                        ])
                    ]),
                    Animated.sequence([
                        Animated.delay(animateIn ? staggerDelay * 9 : staggerDelay * 0),
                        Animated.parallel([
                            Animated.timing(animButtonMinimizeOpacity, opacityParams),
                            Animated.spring(animButtonMinimizeTransform, springParams)
                        ])
                    ])
                ])
            ])
        ]).start(() => {
            if (animateIn) {
                onOpen && onOpen();
                if (firstOpening) {
                    this.setState({ openAnimationsComplete: true });
                }
            } else {
                if (showTimer) {
                    onMinimize && onMinimize();
                    if (minimized && !hideElements) {
                        this.setState({ hideElements: true });
                    }
                } else {
                    if (!disablePopup) {
                        this.openRestPopup();
                    }
                    onClose && onClose();
                    // if (minimized) {
                    //     this.openRestPopup();
                    // }
                }
            }
        });
    }

    private animateTimerPosition (minimize?: boolean): void {
        const { animTimerBackgroundOpacity, animTimerPositionTransform } = this.state;
        const toValue = minimize ? 1 : 0;
        const opacityDuration = minimize ? 250 : 200;
        const opacityDelay = minimize ? 100 : 50;
        const positionDelay = minimize ? 250 : 0;
        const speed = minimize ? 18 : 10;
        const bounciness = minimize ? 3 : 8;

        Animated.parallel([
            Animated.sequence([
                Animated.delay(opacityDelay),
                Animated.timing(animTimerBackgroundOpacity, {
                    toValue,
                    duration: opacityDuration,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ]),
            Animated.sequence([
                Animated.delay(positionDelay),
                Animated.spring(animTimerPositionTransform, {
                    toValue,
                    speed,
                    bounciness,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private openRestPopup = (): void => {
        const { postRestPopup, screenProps } = this.props;

        if (postRestPopup === false) {
            // Check if user has disabled feature in settings
            return;
        }

        screenProps?.popupManagerRef?.current?.requestPopup({
            backgroundColors: ['white'],
            backgroundType: 'color',
            borderRadius: 44,
            ContentComponent: WorkoutRestPopup,
            displayCloseButton: false,
            height: REST_POPUP_HEIGHT,
            scrollView: false,
            width: Math.min(Math.round(viewportWidth * 0.75), 300)
        });
    }

    private get sounds (): JSX.Element {
        const { playSound3, playSound2, playSound1, playSoundGo } = this.state;
        const { workoutSounds } = this.props;
        return workoutSounds ? (
            <Fragment>
                { <Video paused={!playSound3} source={{ uri: getFileReference('3', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSound2} source={{ uri: getFileReference('2', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSound1} source={{ uri: getFileReference('1', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSoundGo} source={{ uri: getFileReference('go', 'mp3') }} ignoreSilentSwitch={'obey'} /> }
            </Fragment>
        ) : null;
    }

    private get circles (): JSX.Element {
        const {
            animCircle1Opacity, animCircle1Transform,
            animCircle2Opacity, animCircle2Transform
        } = this.state;
        const circle1AnimatedStyles = {
            opacity: animCircle1Opacity.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 1]
            }),
            transform: [{
                scale: animCircle1Transform
            }]
        };
        const circle2AnimatedStyles = {
            opacity: animCircle2Opacity.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 1]
            }),
            transform: [{
                scale: animCircle2Transform
            }]
        };

        return (
            <View style={styles.circleContainer}>
                <View style={[styles.fullSpace, styles.circleContainerInner]}>
                    <Animated.View style={[styles.circle, styles.circleColored, circle1AnimatedStyles]} />
                </View>
                <View style={[styles.fullSpace, styles.circleContainerInner]}>
                    <Animated.View style={[styles.circle, circle2AnimatedStyles]} />
                </View>
            </View>
        );
    }

    private get topGradient (): JSX.Element {
        const { animTopGradientOpacity } = this.state;
        const animatedStyle = { opacity: animTopGradientOpacity };
        return (
            <Animated.View style={[styles.topGradientContainer, animatedStyle]}>
                <LinearGradient
                    colors={TOP_GRADIENT_COLORS}
                    style={styles.topGradient}
                />
            </Animated.View>
        );
    }

    private get backgroundShape (): JSX.Element {
        const { animBackgroundShapeOpacity, animBackgroundShapeTransform } = this.state;
        const animatedStyle = {
            opacity: animBackgroundShapeOpacity.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 1]
            }),
            transform: [{
                translateX: animBackgroundShapeTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0]
                })
            }]
        };
        return (
            <Animated.View style={animatedStyle}>
                <BackgroundShape width={styles.backgroundShape.width} height={styles.backgroundShape.height} />
            </Animated.View>
        );
    }

    private get title (): JSX.Element {
        const {
            animTitleLeftOpacity, animTitleLeftTransform,
            animTitleRightOpacity, animTitleRightTransform,
            animTitleShapeOpacity, animTitleShapeTransform
        } = this.state;
        const titleLeftAnimatedStyles = {
            opacity: animTitleLeftOpacity,
            transform: [{
                translateX: animTitleLeftTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0]
                })
            }]
        };
        const titleRightAnimatedStyles = {
            opacity: animTitleRightOpacity,
            transform: [{
                translateX: animTitleRightTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                })
            }]
        };
        const shapeAnimatedStyle = {
            opacity: animTitleShapeOpacity,
            transform: [{
                rotate: animTitleShapeTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                })
            }]
        };
        return (
            <View style={styles.titleContainer}>
                <Animated.Text style={[styles.title, titleRightAnimatedStyles]}>
                    { i18n.t('workout.rest2') }
                </Animated.Text>
                <Animated.View style={[styles.titleShapeContainer, shapeAnimatedStyle]}>
                    <Blob width={styles.titleShape.width} height={styles.titleShape.height} />
                </Animated.View>
                <Animated.Text style={[styles.title, titleLeftAnimatedStyles]}>
                    { i18n.t('workout.rest1') }
                </Animated.Text>
            </View>
        );
    }

    private timerButton (type: 'plus' | 'minus'): JSX.Element {
        const {
            animTimerButtonMinusOpacity, animTimerButtonMinusTransform,
            animTimerButtonPlusOpacity, animTimerButtonPlusTransform
        } = this.state;
        const isPlus = type === 'plus';
        const symbol = isPlus ? '+' : '-';
        const onPress = isPlus ? this.increaseTimerDuration : this.decreaseTimerDuration;
        const animatedStyle = isPlus ? {
            opacity: animTimerButtonMinusOpacity,
            transform: [{
                translateX: animTimerButtonMinusTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0]
                })
            }]
        } :  {
            opacity: animTimerButtonPlusOpacity,
            transform: [{
                translateX: animTimerButtonPlusTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0]
                })
            }]
        };
        return (
            <Animated.View style={[styles.flexContainer, animatedStyle]}>
                <TouchableOpacity
                    activeOpacity={0.4}
                    onPress={onPress}
                    style={styles.flexContainer}
                >
                        <View style={styles.timerButtonTopPart}>
                            <Text style={styles.timerButtonPlusMinus}>{ symbol }</Text>
                        </View>
                        <Text style={styles.timerButtonDuration}>
                            { getFormattedDuration(TIME_UPDATE_SECONDS) }
                        </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    private get timerButtons (): JSX.Element {
        return (
            <View style={styles.timerButtonsContainer}>
                { this.timerButton(('minus')) }
                <View style={styles.timerPlaceholder} />
                { this.timerButton('plus') }
            </View>
        );
    }

    private get nextExercise (): JSX.Element {
        const {
            animNextImageOpacity, animNextImageTransform,
            animNextTextOpacity, animNextTextTransform
        } = this.state;
        const { nextExerciseData } = this.props;

        if (!nextExerciseData) {
            return null;
        }

        const targetLabel = getTargetLabel(nextExerciseData.target, nextExerciseData.type);
        const setLabel = `${i18n.t('workout.set')} ${nextExerciseData.nextSetIndex + 1}/${nextExerciseData.totalSets}`;

        const textAnimatedStyles = {
            opacity: animNextTextOpacity,
            transform: [{
                translateY: animNextTextTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                })
            }]
        };
        const imageAnimatedStyles = {
            opacity: animNextImageOpacity,
            transform: [{
                translateY: animNextImageTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [70, 0]
                })
            }]
        };

        return (
            <View style={styles.nextExerciseContainer}>
                <Animated.View style={[styles.nextExerciseTextContainer, textAnimatedStyles]}>
                    <Text style={styles.nextExerciseTitle} numberOfLines={2}>
                        { nextExerciseData.title }
                    </Text>
                    <Text style={styles.nextExerciseTarget} numberOfLines={1}>
                        { `${setLabel} - ${targetLabel}` }
                    </Text>
                </Animated.View>
                <Animated.View style={[styles.nextExerciseImageWrapper, imageAnimatedStyles]}>
                    <SharedVerticalTitle
                        height={NEXT_IMAGE_HEIGHT}
                        innerStyle={{ alignItems: 'center' }}
                        innerStyleVertical={{ height: NEXT_IMAGE_HEIGHT }}
                        textStyle={styles.nextExerciseCircuitType}
                        title={i18n.t('workout.comingUp')}
                        width={NEXT_CIRCUIT_WIDTH}
                    />
                    <View style={styles.nextExerciseImageContainer}>
                        <DiffuseShadow
                            borderRadius={styles.nextExerciseImage.borderRadius}
                            horizontalOffset={30}
                            shadowOpacity={0.22}
                            verticalOffset={20}
                        />
                        <FadeInImage
                            source={{uri: nextExerciseData && nextExerciseData.thumbnail}}
                            containerCustomStyle={styles.nextExerciseImage}
                            imageStyle={styles.nextExerciseImage}
                            duration={300}
                            loader={'none'}
                        />
                        <View style={[styles.nextExerciseImage, styles.nextExerciseImageOverlay]} />
                    </View>
                </Animated.View>
            </View>
        );
    }

    private get minimizeButton (): JSX.Element {
        const { animButtonMinimizeOpacity, animButtonMinimizeTransform, openAnimationsComplete } = this.state;
        const animatedStyle = {
            opacity: animButtonMinimizeOpacity.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 1]
            }),
            transform: [{
                translateY: animButtonMinimizeTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [BUTTON_NEXT_HEIGHT, 0]
                })
            }]
        };
        return (
            <Animated.View style={[styles.buttonNextContainer, styles.buttonMinimizeContainer, animatedStyle]}>
                <ButtonMinimizeShape
                    style={styles.buttonNextShape}
                    width={styles.buttonNextShape.width}
                    height={styles.buttonNextShape.height}
                />
                <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={!openAnimationsComplete}
                    onPress={this.minimize}
                    style={styles.buttonNext}
                >
                    <Text style={styles.buttonNextLabel}>{ i18n.t('workout.minimize') }</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    private get nextButton (): JSX.Element {
        const { animButtonNextOpacity, animButtonNextTransform, openAnimationsComplete } = this.state;
        const animatedStyle = {
            opacity: animButtonNextOpacity.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 1]
            }),
            transform: [{
                translateY: animButtonNextTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [BUTTON_NEXT_HEIGHT, 0]
                })
            }]
        };
        return (
            <Animated.View style={[styles.buttonNextContainer, animatedStyle]}>
                <ButtonNextShape
                    style={styles.buttonNextShape}
                    width={styles.buttonNextShape.width}
                    height={styles.buttonNextShape.height}
                />
                <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={!openAnimationsComplete}
                    onPress={this.closeDirectly}
                    style={styles.buttonNext}
                >
                    <Text style={styles.buttonNextLabel}>{ i18n.t('workout.skip') }</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    private get rest (): JSX.Element {
        const { minimized, hideElements } = this.state;
        const pointerEvents = minimized ? 'none' : 'auto';
        return !hideElements ? (
            <View style={styles.fullSpace} pointerEvents={pointerEvents}>
                { this.circles }
                { this.backgroundShape }
                { this.topGradient }
                <View style={[styles.fullSpace, styles.contentContainer]}>
                    { this.title }
                    { this.timerButtons }
                    { this.nextExercise }
                </View>
                { this.minimizeButton }
                { this.nextButton }
            </View>
        ) : null;
    }

    private get timer (): JSX.Element {
        const {
            animTimerOpacity, animTimerTransform, animTimerBackgroundOpacity,
            animTimerPositionTransform, minimized
        } = this.state;
        const { restDuration, workoutPaused } = this.props;
        const onPress = minimized ? this.maximize : undefined;
        const apparitionAnimatedStyle = {
            opacity: animTimerOpacity,
            transform: [{
                translateY: animTimerTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                })
            }]
        };
        const positionAnimatedStyle = {
            transform: [
                {
                    translateX: animTimerPositionTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, TIMER_CONTAINER_TRANSLATE_X]
                    })
                },
                {
                    translateY: animTimerPositionTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, TIMER_CONTAINER_TRANSLATE_Y]
                    })
                },
                {
                    scale: animTimerPositionTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, TIMER_CONTAINER_MINIMIZED_SCALE]
                    })
                }
            ]
        };
        const containerStyle = [
            styles.timerContainer,
            apparitionAnimatedStyle,
            positionAnimatedStyle
        ];
        const backgroundAnimatedStyle = { opacity: animTimerBackgroundOpacity };
        const pointerEvents = minimized ? 'box-none' : 'none';

        return (
            <Animated.View style={containerStyle} pointerEvents={pointerEvents}>
                <TouchableOpacity
                    activeOpacity={minimized ? 0.8 : 1}
                    onPress={onPress}
                    style={styles.timerContainerInner}
                >
                    <Animated.View style={[styles.fullSpace, styles.timerBackground, backgroundAnimatedStyle]}>
                        <View style={styles.timerBackgroundBorder} />
                    </Animated.View>
                    <Timer
                        countdown={true}
                        dotStyle={styles.timerDots}
                        hideHours={true}
                        onComplete={this.close}
                        onTick={this.onTick}
                        paused={workoutPaused}
                        ref={this.timerRef}
                        textStyle={styles.timerLabel}
                        timeStart={restDuration}
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        const { restDuration, screenProps } = this.props;
        const { animTimerButtonPlusOpacity, animTimerButtonPlusTransform } = this.state;

        const tooltipAnimatedStyles = {
            opacity: animTimerButtonPlusOpacity,
            transform: [{
                translateY: animTimerButtonPlusTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0]
                })
            }]
        };

        return restDuration ? (
            <Fragment>
                { this.sounds }
                { this.rest }
                { this.timer }
                <Animated.View style={[styles.tooltipContainer, tooltipAnimatedStyles]}>
                    <Tooltip
                        gradientType={'blue'}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.workoutRestTimer}
                    />
                </Animated.View>
            </Fragment>
        ) : null;
    }
}

const mapStateToProps = (state: IReduxState) => {
    return {
        appInBackground: state.userInterface?.appInBackground,
        lastWorkoutDurationUpdate: state.workoutDuration?.lastWorkoutDurationUpdate,
        postRestPopup: state.userProfile?.postRestPopup,
        restNotifications: state.userProfile.restNotifications,
        workoutPaused: state.workoutProgression?.workoutPaused,
        workoutSounds: state.userProfile.workoutSounds
    };
};

export default connect(mapStateToProps, { setWorkoutPaused })(WorkoutRest);
