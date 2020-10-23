// Inspiration for the timer and countdown logic comes from: https://github.com/yassinedoghri/react-timer-machine/

import React, { PureComponent, Fragment } from 'react';
import { Text, View } from 'react-native';
import { convertMsToTime, ITime } from '../utils/date';

import styles from '../styles/components/Timer.style';

interface IProps {
    containerStyle?: any;
    countdown?: boolean;
    dotStyle?: any;
    hideHours?: boolean;
    paused?: boolean;
    textStyle?: any;
    timeEnd?: number; // In seconds
    timeStart?: number; // In seconds
    onComplete?: (seconds: number) => void;
    onPause?: (seconds: number) => void;
    onResume?: (seconds: number) => void;
    onStart?: (seconds: number) => void;
    onStop?: (seconds: number) => void;
    onTick?: (seconds: number) => void;
}

interface IState {
    milliseconds: number;
    time: ITime;
}

const INTERVAL = 1000;

class Timer extends PureComponent<IProps, IState> {

    public static defaultProps: IProps = {
        countdown: false,
        paused: false,
        timeStart: 0,
        timeEnd: 0
    };

    private internalState: 0 | 1 | 2 | 3; //  0 = idle, 1 = running, 2 = paused, 3 = resumed
    private tickInterval: number;
    private timer: any;
    private timerResume: any;

    constructor (props: IProps) {
        super(props);
        this.state = {
            milliseconds: props.timeStart * 1000,
            time: convertMsToTime(props.timeStart * 1000)
        };
        this.internalState = 0;
        this.tickInterval = props.countdown ? -INTERVAL : INTERVAL;
        this.timer = 0;
    }

    public componentDidMount (): void {
        const { paused } = this.props;
        if (!paused) {
            this.startTimer();
        }
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { countdown, paused, timeStart } = this.props;

        if (countdown !== prevProps.countdown) {
            this.tickInterval = countdown ? -INTERVAL : INTERVAL;
        }

        if (paused !== prevProps.paused) {
            if (paused) {
                this.pauseTimer();
            } else {
                if (this.internalState !== 1) {
                    this.startTimer();
                }
                this.resumeTimer();
            }
        }

        if (timeStart !== prevProps.timeStart) {
            this.resetTimer();
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.timerResume);
        this.stopTimer();
    }

    public getTimeInSeconds (): number {
        const { time } = this.state;
        return time.s + time.m * 60 + time.h * 3600;
    }

    public setCurrentTime (seconds: number): number {
        if (typeof seconds !== 'number') {
            return;
        }
        const updateMs = this.capMs(seconds * 1000);
        this.setState({
            milliseconds: updateMs,
            time: convertMsToTime(updateMs)
        });
    }

    public updateCurrentTime (seconds: number): void {
        const { milliseconds } = this.state;
        if (typeof seconds !== 'number') {
            return;
        }
        const updateMs = this.capMs(milliseconds + seconds * 1000);
        this.setState({
            milliseconds: updateMs,
            time: convertMsToTime(updateMs)
        });
    }

    public resetTimer = (): void => {
        const { timeStart } = this.props;
        this.setState({
            milliseconds: timeStart * 1000,
            time: convertMsToTime(timeStart * 1000)
        });
    }

    public pauseTimer = (): void => {
        const { milliseconds } = this.state;
        const { onPause } = this.props;

        if (this.internalState !== 1) {
            return;
        }

        this.internalState = 2;

        clearInterval(this.timer);
        onPause && onPause(milliseconds / 1000);
    }

    public resumeTimer = (): void => {
        const { milliseconds } = this.state;
        const { countdown, onResume, timeEnd } = this.props;

        if (this.internalState !== 2) {
            return;
        }

        this.internalState = 3;

        onResume && onResume(milliseconds / 1000);
        this.tick();

        // Avoid calling onComplete twice when the timer is paused during the last second
        if (
            (countdown && (milliseconds - timeEnd * 1000 <= INTERVAL)) ||
            (!countdown && (timeEnd && (timeEnd * 1000 - milliseconds <= INTERVAL)))
        ) {
            return;
        }

        clearInterval(this.timer);
        this.timer = setInterval(this.tick, INTERVAL);
    }

    private capMs (ms: number): number {
        const { countdown, timeEnd } = this.props;
        if (countdown) {
            return ms <= 0 ? 0 : ms;
        } else {
            return timeEnd && ms >= timeEnd * 1000 ? timeEnd * 1000 : ms;
        }
    }

    private startTimer = (): void => {
        const { milliseconds } = this.state;
        const { onStart } = this.props;

        this.internalState = 1;

        clearInterval(this.timer);
        this.timer = setInterval(this.tick, INTERVAL);
        onStart && onStart(milliseconds / 1000);
    }

    private stopTimer = (): void => {
        const { milliseconds } = this.state;
        const { onStop } = this.props;

        this.internalState = 0;

        clearInterval(this.timer);
        this.timer = 0;
        onStop && onStop(milliseconds / 1000);
    }

    private tick = (): void => {
        const { countdown, onComplete, onTick, timeEnd } = this.props;
        const { milliseconds } = this.state;
        const msRemaining = this.capMs(milliseconds + this.tickInterval);
        const timeRemaining = convertMsToTime(msRemaining);

        this.setState({
            milliseconds: msRemaining,
            time: timeRemaining
        });
        onTick && onTick(msRemaining / 1000);

        if (
            (countdown && ((msRemaining <= timeEnd * 1000) || (msRemaining <= 0))) ||
            (!countdown && (timeEnd && (msRemaining >= timeEnd * 1000)))
        ) {
            this.stopTimer();
            onComplete && onComplete(msRemaining / 1000);
        }
    }

    private digits (type: 'h' | 'm' | 's', digitIndexFromEnd: number = 0): string {
        const { time } = this.state;
        const pad = (n: number, c: number) => {
            const timeString = `00${n}`;
            return timeString.charAt(timeString.length - 1 - c);
        };
        return pad(time[type], digitIndexFromEnd);
        // const pad = (n: number, c: number = 2) => `00${n}`.slice(-c);
        // return `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`;
    }

    private get dots (): JSX.Element {
        const { dotStyle } = this.props;
        const dot = <View style={[styles.dot, dotStyle || {}]} />;
        return (
            <View style={styles.dotsContainer}>
                { dot }
                { dot }
            </View>
        );
    }

    public render (): JSX.Element {
        const { containerStyle, hideHours, textStyle } = this.props;
        const hours = !hideHours ? (
            <Fragment>
                <Text style={textStyle}>{ this.digits('h', 1) }</Text>
                <Text style={textStyle}>{ this.digits('h', 0) }</Text>
                { this.dots }
            </Fragment>
        ) : null;
        return (
            <View style={[styles.container, containerStyle || {}]}>
                { hours }
                <Text style={textStyle}>{ this.digits('m', 1) }</Text>
                <Text style={textStyle}>{ this.digits('m', 0) }</Text>
                { this.dots }
                <Text style={textStyle}>{ this.digits('s', 1) }</Text>
                <Text style={textStyle}>{ this.digits('s', 0) }</Text>
            </View>
        );
    }
}

export default Timer;
