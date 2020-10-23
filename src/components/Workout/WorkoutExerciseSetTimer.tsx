import React, { PureComponent, Fragment } from 'react';
import { Animated, Easing, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../../store/reducers';
import { setWorkoutPaused } from '../../store/modules/workoutProgression';
import { scheduleTimedSetLocalNotification, cancelTimedSetLocalNotification } from '../../utils/localNotifications';
import { isAndroid } from '../../utils/os';

import { debounce } from 'lodash';

import Video from 'react-native-video';

import FadeInImage from '../FadeInImage';
import Timer from '../Timer';

import styles from '../../styles/components/Workout/WorkoutExerciseSetTimer.style';

const BEEP_SOURCE = isAndroid ? 'countdown_beep' : 'countdown_beep.mp3';
const BEEP_END_SOURCE = isAndroid ? 'countdown_beep_end' : 'countdown_beep_end.mp3';
const BEEP_END_SOURCE_FULL_PATH = 'countdown_beep_end.mp3';

const ICON_PAUSE = require('../../static/icons/pause.png');
const ICON_PLAY = require('../../static/icons/play.png');

export interface IProps {
    appInBackground: boolean;
    lastWorkoutDurationUpdate: number;
    countdown: boolean;
    duration: number;
    onComplete: () => void;
    restNotifications: boolean;
    setWorkoutPaused: (workoutPaused: boolean) => void;
    workoutPaused: boolean;
    workoutSounds: boolean;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
    playSound3: boolean;
    playSound2: boolean;
    playSound1: boolean;
    playSoundGo: boolean;
    paused: boolean;
}

class WorkoutExerciseSetTimer extends PureComponent<IProps, IState> {

    private lastSoundTimer: any;
    private pauseInBackground: boolean;
    private playLastSound: boolean;
    private timerRef: React.RefObject<Timer>;

    constructor (props: IProps) {
        super(props);
        this.playLastSound = true;
        this.timerRef = React.createRef();
        this.state = {
            animOpacity: new Animated.Value(1),
            animTransform: new Animated.Value(1),
            playSound3: false,
            playSound2: false,
            playSound1: false,
            playSoundGo: false,
            paused: true
        };
    }

    public componentDidMount (): void {
        // this.animate(true);
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { paused } = this.state;
        const { appInBackground, lastWorkoutDurationUpdate, restNotifications } = this.props;

        // WARNING: we aren't using the same logic as with the WorkoutRest timer, meaning we don't rely on `workoutPaused``
        // The reason is we need a user action to launch the timer, otherwise it will just keep playing on its own
        // as soon as we pause and play the global timer

        // App is going to background
        if (prevProps.appInBackground === false && appInBackground === true) {
            if (!paused) {
                this.pauseInBackground = true;
                restNotifications && scheduleTimedSetLocalNotification(
                    this.timerRef?.current?.getTimeInSeconds(),
                    isAndroid ? undefined : BEEP_END_SOURCE_FULL_PATH // Not working on Android...
                );
                this.pause();
            } else {
                this.pauseInBackground = false;
            }
        }

        // App is coming back to foreground
        if (prevProps.appInBackground === true && appInBackground === false) {
            if (this.pauseInBackground) {
                restNotifications && cancelTimedSetLocalNotification();

                const secondsAwayFromApp = Math.round((new Date().getTime() - lastWorkoutDurationUpdate) / 1000);
                const initialTime = this.timerRef?.current?.getTimeInSeconds();
                const updatedTime = initialTime - secondsAwayFromApp;
                this.timerRef?.current?.setCurrentTime(updatedTime);
                this.play(updatedTime >= 1);
            }
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.lastSoundTimer);
    }

    public play = (playLastSound: boolean = true): void => {
        const { paused } = this.state;
        const { workoutPaused } = this.props;
        if (!paused) {
            return;
        }
        this.playLastSound = playLastSound;
        this.setState({ paused: false }, () => {
            if (workoutPaused) {
                this.props.setWorkoutPaused(false);
            }
        });
    }

    public reset = (): void => {
        this.pause();
        this.timerRef?.current?.resetTimer();
    }

    private animate (animateIn?: boolean): void {
        const { animOpacity, animTransform } = this.state;
        const toValue = animateIn ? 1 : 0;
        Animated.parallel([
            Animated.timing(animOpacity, {
                toValue,
                duration: 200,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.spring(animTransform, {
                toValue,
                speed: 16,
                bounciness: 5,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private onTick = (seconds: number): void => {
        const { workoutSounds } = this.props;

        // Play the relevant countdown sound
        if (seconds === 3) {
            workoutSounds && this.setState({ playSound3: true });
        } else if (seconds === 2) {
            workoutSounds && this.setState({ playSound2: true });
        } else if (seconds === 1) {
            workoutSounds && this.setState({ playSound1: true });
        }
    }

    private onTimerComplete = (): void => {
        const { onComplete, workoutSounds } = this.props;
        // We play the final sound here otherwise there's too much going on, which result in a delay
        // or, worse, in the sound not being played at all
        if (workoutSounds && this.playLastSound) {
            this.setState({ playSoundGo: true }, () => {
                // Without this timer, the sound is never played on Android...
                this.lastSoundTimer = setTimeout(() => {
                    onComplete && onComplete();
                }, 1);
            });
        } else {
            onComplete && onComplete();
        }
    }

    private pause = (): void => {
        const { paused } = this.state;
        if (paused) {
            return;
        }
        this.setState({ paused: true });
    }

    private togglePause = (): void => {
        const { paused } = this.state;
        if (paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    private get sounds (): JSX.Element {
        const { playSound3, playSound2, playSound1, playSoundGo } = this.state;
        const { workoutSounds } = this.props;
        return workoutSounds ? (
            <Fragment>
                { <Video paused={!playSound3} source={{ uri: BEEP_SOURCE }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSound2} source={{ uri: BEEP_SOURCE }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSound1} source={{ uri: BEEP_SOURCE }} ignoreSilentSwitch={'obey'} /> }
                { <Video paused={!playSoundGo} source={{ uri: BEEP_END_SOURCE }} ignoreSilentSwitch={'obey'} /> }
            </Fragment>
        ) : null;
    }

    public render (): JSX.Element {
        const { animOpacity, animTransform, paused } = this.state;
        const { countdown, duration } = this.props;
        const icon = paused ? ICON_PLAY : ICON_PAUSE;
        const animatedStyle = {
            opacity: animOpacity.interpolate({
                inputRange: [0, 0.25, 1],
                outputRange: [0, 0, 1]
            }),
            transform: [{
                rotate: animTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['90deg', '0deg']
                })
            }]
        };

        return (
            <View style={styles.overflowContainer}>
                { this.sounds }
                <Animated.View style={[styles.innerContainer, animatedStyle]}>
                    <View style={styles.backgroundContainer}>
                        <View style={styles.background}>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                style={styles.content}
                                onPress={debounce(this.togglePause, 500, { 'leading': true, 'trailing': false })}
                            >
                                <Timer
                                    countdown={countdown}
                                    dotStyle={styles.clockDots}
                                    hideHours={true}
                                    onComplete={this.onTimerComplete}
                                    onTick={this.onTick}
                                    paused={paused}
                                    ref={this.timerRef}
                                    textStyle={styles.clockLabel}
                                    timeStart={duration}
                                />
                                <View style={styles.button}>
                                    <FadeInImage
                                        resizeMode={'contain'}
                                        source={icon}
                                        containerCustomStyle={styles.icon}
                                        tintColor={styles.icon.color}
                                        />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => {
    return {
        appInBackground: state.userInterface?.appInBackground,
        lastWorkoutDurationUpdate: state.workoutDuration?.lastWorkoutDurationUpdate,
        restNotifications: state.userProfile.restNotifications,
        workoutPaused: state.workoutProgression?.workoutPaused,
        workoutSounds: state.userProfile?.workoutSounds
    };
};

export default connect(mapStateToProps, { setWorkoutPaused }, null, { forwardRef: true })(WorkoutExerciseSetTimer);
