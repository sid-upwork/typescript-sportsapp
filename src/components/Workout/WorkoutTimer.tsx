import React, { PureComponent } from 'react';
import { View, Animated, Easing } from 'react-native';
import { IReduxState } from '../../store/reducers';
import { setWorkoutPaused } from '../../store/modules/workoutProgression';
import { updateWorkoutDuration } from '../../store/modules/workoutDuration';
import { ETooltipIds } from '../../store/modules/tutorials';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { IScreenProps } from '../../index';
import delays from '../../utils/animDelays';

import BlurWrapper from '../../components/BlurWrapper';
import DiffuseShadow from '../../components/DiffuseShadow';
import Timer from '../../components/Timer';
import Tooltip from '../Tooltip';
import TouchableScale from '../../components/TouchableScale';

import { hasNotch } from '../../styles/base/metrics.style';
import styles, {
    BUTTON_COLOR,
    BUTTON_BORDER_RADIUS_PAUSE,
    BUTTON_BORDER_RADIUS_PLAY,
    CONTAINER_HEIGHT,
    TOP_GRADIENT_COLORS
} from '../../styles/components/Workout/WorkoutTimer.style';

import LinearGradient from 'react-native-linear-gradient';

import PauseIcon from '../../static/Workout/pause.svg';
import PlayIcon from '../../static/Workout/play.svg';

const TIMER_UPDATE_INTERVAL = 5; // Time in seconds between each duration update in the store

interface IProps {
    appInBackground: boolean;
    hide?: boolean;
    lastWorkoutDurationUpdate: number;
    onTimerComplete?: () => void;
    onTimerTick?: (seconds: number) => void;
    screenProps: IScreenProps;
    setWorkoutPaused: (workoutPaused: boolean) => void;
    timeTrial?: boolean;
    timeTrialDuration?: number;
    updateWorkoutDuration: ({ newDuration, durationToAdd }: { newDuration?: number, durationToAdd?: number }) => Promise<void>;
    workoutDuration: number;
    workoutPaused: boolean;
}

interface IState {
    animContainerOpacity: Animated.Value;
    animContainerTransform: Animated.Value;
    animButtonBorderRadius: Animated.Value;
    animButtonRotate: Animated.Value;
    complete: boolean;
    paused: boolean;
    pauseIcon: boolean;
}

class WorkoutTimer extends PureComponent<IProps, IState> {

    private buttonAnimationTimer: any;
    private pauseInBackground: boolean;
    private startTime: number;
    private timerRef: React.RefObject<Timer>;

    constructor (props: IProps) {
        super(props);
        this.startTime = props.timeTrial ? props.timeTrialDuration - props.workoutDuration : props.workoutDuration;
        this.timerRef = React.createRef();
        this.state = {
            animContainerOpacity: new Animated.Value(1),
            animContainerTransform: new Animated.Value(1),
            animButtonBorderRadius: new Animated.Value(0),
            animButtonRotate: new Animated.Value(0),
            complete: false,
            paused: props.workoutPaused,
            pauseIcon: props.workoutPaused
        };
    }

    public componentDidMount (): void {
        const { paused } = this.state;
        this.animateButton(paused);
    }

    public componentDidUpdate (prevProps: IProps): void {
        const {
            appInBackground,
            hide,
            lastWorkoutDurationUpdate,
            timeTrial,
            timeTrialDuration,
            workoutDuration,
            workoutPaused
        } = this.props;

        // App is going to background
        if (prevProps.appInBackground === false && appInBackground === true) {
            if (!workoutPaused) {
                this.pauseInBackground = true;
                this.pause(false);
            } else {
                this.pauseInBackground = false;
            }
        }

        // App is coming back to foreground
        if (prevProps.appInBackground === true && appInBackground === false) {
            if (this.state.complete) {
                return;
            }
            if (this.pauseInBackground) {
                // User was away while the timer was still going so we need to update it
                const workoutDurationBeforeUpdate = workoutDuration;
                const secondsAwayFromApp = Math.round((new Date().getTime() - lastWorkoutDurationUpdate) / 1000);

                if (timeTrial) {
                    const newCurrentTime = timeTrialDuration - (workoutDurationBeforeUpdate + secondsAwayFromApp);
                    this.timerRef?.current?.setCurrentTime(newCurrentTime);
                } else {
                    const newCurrentTime = workoutDurationBeforeUpdate + secondsAwayFromApp;
                    this.timerRef?.current?.setCurrentTime(newCurrentTime);
                }

                if (timeTrial && workoutDuration + secondsAwayFromApp >= timeTrialDuration) {
                    // User ran out of time while away
                    this.props.updateWorkoutDuration({ newDuration: timeTrialDuration });
                    this.onTimerComplete();
                } else {
                    this.props.updateWorkoutDuration({ durationToAdd: secondsAwayFromApp });
                    this.play(false);
                }
            }
        }

        if (workoutPaused !== prevProps.workoutPaused && typeof workoutPaused !== 'undefined') {
            if (workoutPaused) {
                this.pause();
            } else {
                this.play();
            }
        }

        if (hide !== prevProps.hide) {
            this.animate(!hide);
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.buttonAnimationTimer);
    }

    private onTick = (seconds: number): void => {
        const { onTimerTick, timeTrial, timeTrialDuration } = this.props;

        // Rely solely on timer's interval; avoid creating yet another unsynced one
        // All other timers will be updated through this function
        onTimerTick && onTimerTick(seconds);

        // Update workout duration every 5 seconds (i.e. timer ticks)
        if (seconds % TIMER_UPDATE_INTERVAL === 0) {
            // this.props.updateWorkoutDuration({ durationToAdd: TIMER_UPDATE_INTERVAL });
            this.props.updateWorkoutDuration({ newDuration: timeTrial ? timeTrialDuration - seconds : seconds });
        }
    }

    private onTimerComplete = (): void => {
        const { complete } = this.state;
        const { onTimerComplete } = this.props;
        this.animateButton(true);
        if (!complete) {
            this.setState({ complete: true }, () => {
                onTimerComplete && onTimerComplete();
            });
        }
    }

    private animate (animateIn?: boolean): void {
        const { animContainerOpacity, animContainerTransform } = this.state;
        const toValue = animateIn ? 1 : 0;
        const delay = animateIn ? delays.views.workout.videoStopUIDelay + 160 : delays.views.workout.videoLaunchUIDelay;
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animContainerOpacity, {
                    toValue,
                    duration: 50,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animContainerTransform, {
                    toValue,
                    speed: 12,
                    bounciness: 4,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateButton (paused: boolean): void {
        const { animButtonBorderRadius, animButtonRotate } = this.state;
        const duration = 300;
        const toValue = paused ? 0 : 1;

        // Update the icon in the middle of the rotate animation
        this.buttonAnimationTimer = setTimeout(() => {
            this.setState({ pauseIcon: !paused });
        }, duration / 2);

        Animated.parallel([
            Animated.timing(animButtonBorderRadius, {
                toValue,
                duration,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animButtonRotate, {
                toValue,
                duration,
                easing: Easing.inOut(Easing.poly(4)),
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private play = (animate: boolean = true): void => {
        const { paused } = this.state;
        const { workoutPaused } = this.props;
        if (!paused) {
            return;
        }
        this.setState({ paused: false }, () => {
            if (workoutPaused) {
                this.props.setWorkoutPaused(false);
            }
            if (animate) {
                this.animateButton(false);
            }
        });
    }

    private pause = (animate: boolean = true): void => {
        const { paused } = this.state;
        const { timeTrial, timeTrialDuration, workoutPaused } = this.props;
        if (paused) {
            return;
        }
        this.setState({ paused: true }, () => {
            if (!workoutPaused) {
                this.props.setWorkoutPaused(true);
                const currentTime = this.timerRef?.current?.getTimeInSeconds();
                this.props.updateWorkoutDuration({ newDuration: timeTrial ? timeTrialDuration - currentTime : currentTime });
            }
            if (animate) {
                this.animateButton(true);
            }
        });
    }

    private togglePause = (): void => {
        const { paused } = this.state;
        if (paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    private get button (): JSX.Element {
        const { animButtonBorderRadius, animButtonRotate, complete, pauseIcon } = this.state;
        const Icon = pauseIcon ? PauseIcon : PlayIcon;
        const buttonAnimatedStyle = {
            borderRadius: animButtonBorderRadius.interpolate({
                inputRange: [0, 1],
                outputRange: [BUTTON_BORDER_RADIUS_PAUSE, BUTTON_BORDER_RADIUS_PLAY],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    rotate: animButtonRotate.interpolate({
                        inputRange: [0, 0.99, 1],
                        outputRange: ['0deg', '179deg', '180deg'],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const onPress = !complete ?
            debounce(this.togglePause, 500, { 'leading': true, 'trailing': false }) :
            undefined;

        return (
            <TouchableScale
                containerStyle={styles.buttonContainer}
                disabled={complete}
                onPress={onPress}
                style={styles.buttonContainerInner}
            >
                <DiffuseShadow
                    style={styles.fullSpace}
                    horizontalOffset={5}
                    verticalOffset={10}
                    borderRadius={BUTTON_BORDER_RADIUS_PAUSE - 5}
                    shadowOpacity={0.55}
                    color={BUTTON_COLOR}
                />
                <Animated.View style={[styles.button, buttonAnimatedStyle]}>
                    <Icon
                        style={styles.buttonIcon}
                        height={styles.buttonIcon.height}
                        width={styles.buttonIcon.width}
                    />
                </Animated.View>
            </TouchableScale>
        );
    }

    public render (): JSX.Element {
        const { animContainerOpacity, animContainerTransform, paused } = this.state;
        const { hide, timeTrial, timeTrialDuration } = this.props;
        const pointerEvents = hide ? 'none' : 'auto';
        const notchGradient = hasNotch ? (
            <LinearGradient
                colors={TOP_GRADIENT_COLORS}
                style={styles.gradient}
            />
        ) : null;
        const animatedStyle = {
            opacity: animContainerOpacity,
            transform: [
                {
                    translateY: animContainerTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-CONTAINER_HEIGHT, 1]
                    })
                }
            ]
        };

        return (
            <Animated.View style={[styles.container, animatedStyle]} pointerEvents={pointerEvents}>
                <View style={styles.innerContainer}>
                    <BlurWrapper
                        type={'vibrancy'}
                        blurType={'light'}
                        blurAmount={16}
                        style={styles.blur}
                        blurStyle={styles.blurIOS}
                        fallbackStyle={styles.blurAndroid}
                    />
                    { notchGradient }
                    <View style={styles.containerBorder} />
                    <Timer
                        countdown={timeTrial && !!timeTrialDuration}
                        onComplete={this.onTimerComplete}
                        onTick={this.onTick}
                        paused={paused}
                        ref={this.timerRef}
                        textStyle={styles.clockLabel}
                        timeStart={this.startTime}
                    />
                </View>
                { this.button }
                <Tooltip
                    containerStyle={styles.tooltip}
                    screenProps={this.props.screenProps}
                    tooltipId={ETooltipIds.workoutMainTimer}
                />
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => {
    return {
        appInBackground: state.userInterface?.appInBackground,
        lastWorkoutDurationUpdate: state.workoutDuration?.lastWorkoutDurationUpdate,
        workoutDuration: state.workoutDuration?.duration,
        workoutPaused: state.workoutProgression?.workoutPaused
    };
};

export default connect(mapStateToProps, { updateWorkoutDuration, setWorkoutPaused })(WorkoutTimer);
