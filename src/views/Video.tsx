import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { logEvent } from '../utils/analytics';

import Header from '../components/Header';
import VideoPlayer, { IVideoPlayerProps } from '../components/VideoPlayer';

export interface IVideoLog {
    eventName: string;
    videoTitle: string;
}

interface IProps {
    navigation: any;
}

interface IState {}

class Video extends PureComponent<IProps, IState> {

    private isLandscape: boolean;
    private playerProps: IVideoPlayerProps;
    private shouldLogEvent: boolean;
    private videoDuration: number;
    private videoLog: IVideoLog;
    private videoProgressPercentage: number;
    private videoThresholdReached25: boolean;
    private videoThresholdReached50: boolean;
    private videoThresholdReached75: boolean;

    constructor (props: IProps) {
        super(props);
        this.isLandscape = props.navigation?.getParam('landscape', false);
        this.playerProps = props.navigation?.getParam('player', {});
        this.videoDuration = undefined;
        this.videoLog = props.navigation?.getParam('videoLog', {});
        this.videoProgressPercentage = 0;
        this.videoThresholdReached25 = false;
        this.videoThresholdReached50 = false;
        this.videoThresholdReached75 = false;
        this.shouldLogEvent = !!this.videoLog?.eventName;
    }

    componentWillUnmount() {
        if (this.playerProps.onWillUnmount) {
            this.playerProps.onWillUnmount();
        }
    }

    private onDidFocus = (): void => {
        if (this.playerProps.onDidFocus) {
            this.playerProps.onDidFocus();
        }
    }

    private onWillBlur = (): void => {
        if (this.playerProps.onWillBlur) {
            this.playerProps.onWillBlur();
        }
    }

    private onDidBlur = (): void => {
        if (this.playerProps.onDidBlur) {
            this.playerProps.onDidBlur();
        }
    }

    private onVideoEnd = (): void => {
        if (!this.shouldLogEvent) {
            return;
        }

        logEvent(this.videoLog?.eventName, {
            progress: '100%',
            videoName: this.videoLog?.videoTitle
        });
    }

    private onVideoLoad = (payload: any, duration: number): void => {
        this.videoDuration = duration;
    }

    private onVideoProgress = (payload: any): void => {
        if (!this.shouldLogEvent) {
            return;
        }

        const currentTime = payload?.currentTime;

        if (!currentTime || !this.videoDuration) {
            return;
        }

        const percentage = Math.round(currentTime / this.videoDuration * 100);

        // Prevent values from being called multiple times because of the rounding
        if (percentage === 25 && !this.videoThresholdReached25) {
            this.videoThresholdReached25 = true;
            logEvent(this.videoLog?.eventName, {
                progress: `${percentage}%`,
                videoName: this.videoLog?.videoTitle
            });
        } else if (percentage === 50 && !this.videoThresholdReached50) {
            this.videoThresholdReached50 = true;
            logEvent(this.videoLog?.eventName, {
                progress: `${percentage}%`,
                videoName: this.videoLog?.videoTitle
            });
        } else if (percentage === 75 && !this.videoThresholdReached75) {
            this.videoThresholdReached75 = true;
            logEvent(this.videoLog?.eventName, {
                progress: `${percentage}%`,
                videoName: this.videoLog?.videoTitle
            });
        }

        if (percentage !== this.videoProgressPercentage) {
            this.videoProgressPercentage = percentage;
        }
    }

    private get header (): JSX.Element {
        return <Header mode={'closeWhite'} landscape={this.isLandscape} />;
    }

    public render (): JSX.Element {
        return (
            <Fragment>
                <NavigationEvents
                    onDidFocus={this.onDidFocus}
                    onWillBlur={this.onWillBlur}
                    onDidBlur={this.onDidBlur}
                />
                <View style={{ flex: 1, backgroundColor: 'black' }}>
                    <VideoPlayer
                        controls={true}
                        landscape={this.isLandscape}
                        playOnMount={true}
                        resizeButton={true}
                        videoProps={{
                            onEnd: this.shouldLogEvent ? this.onVideoEnd : undefined,
                            onLoad: this.onVideoLoad,
                            onProgress: this.shouldLogEvent ? this.onVideoProgress : undefined
                        }}
                        { ...this.playerProps }
                    />
                    { this.header }
                </View>
            </Fragment>
        );
    }
}

export default Video;
