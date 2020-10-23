import React, { PureComponent, Fragment } from 'react';
import { Animated, Easing, View, TouchableOpacity, TouchableWithoutFeedback, Text, ImageSourcePropType } from 'react-native';
import { convertSecondsToTimeLabel } from '../utils/date';
import i18n from '../utils/i18n';
import { isAndroid } from '../utils/os';

import LinearGradient from 'react-native-linear-gradient';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
// import MusicControl from 'react-native-music-control';
import Slider from '@react-native-community/slider';
// import SystemSetting from 'react-native-system-setting';
import Video from 'react-native-video';

import BlurWrapper from './BlurWrapper';
import FadeInImage from './FadeInImage';
import Loader from './Loader';
import TouchableScale from './TouchableScale';

import colors from '../styles/base/colors.style';
import { viewportHeight, viewportWidth, isMWidth } from '../styles/base/metrics.style';
import headerStyles from '../styles/components/Header.style';
import styles, {
    OVERLAY_COLORS,
    OVERLAY_LOCATIONS,
    SCREEN_RATIO,
    VIDEO_RATIO,
    VIDEO_DIMENSIONS
} from '../styles/components/VideoPlayer.style';

import IconFastForward from '../static/icons/video/fast_forward.svg';
import IconPause from '../static/icons/video/pause.svg';
import IconPlay from '../static/icons/video/play.svg';
import IconPlayColored from '../static/icons/video/play-colored.svg';
import IconReplayColored from '../static/icons/video/replay-colored.svg';
import IconRewind from '../static/icons/video/rewind.svg';
import IconStop from '../static/icons/video/stop.svg';

const CONTROLS_VISIBILITY_DURATION = 8 * 1000;
const SEEK_DURATION = 10 * 1000;

const CLOSE_ICON = require('../static/Header/close.png');
const EXPAND_ICON = require('../static/icons/expand.png');
const MINIMIZE_ICON = require('../static/icons/minimize.png');

export interface IVideoPlayerProps {
    videoSource: ImageSourcePropType | string;
    background?: boolean;
    closeButton?: boolean;
    controls?: boolean;
    hideLoader?: boolean;
    hideLoaderBlur?: boolean;
    landscape?: boolean;
    loop?: boolean;
    onClose?: () => void;
    onDidBlur?: () => void;
    onDidFocus?: () => void;
    onStop?: () => void;
    onWillBlur?: () => void;
    onWillUnmount?: () => void;
    paused?: boolean;
    resizeButton?: boolean;
    resumeOnOSPause?: boolean;
    smallUI?: boolean;
    stopButton?: boolean;
    stopped?: boolean;
    playOnMount?: boolean;
    showControlsOnPause?: boolean;
    tapToPause?: boolean;
    thumbnailSource?: ImageSourcePropType | string;
    videoProps?: any;
}

interface IState {
    animCloseButtonOpacity: Animated.Value;
    animCloseButtonTransform: Animated.Value;
    animControlsContainerOpacity: Animated.Value;
    animFFButonOpacity: Animated.Value;
    animFFButonTransform: Animated.Value;
    animPauseButonOpacity: Animated.Value;
    animPauseButonTransform: Animated.Value;
    animPauseLayerOpacity: Animated.Value;
    animResizeButonOpacity: Animated.Value;
    animResizeButonTransform: Animated.Value;
    animRWButonOpacity: Animated.Value;
    animRWButonTransform: Animated.Value;
    animSliderOpacity: Animated.Value;
    animSliderTransform: Animated.Value;
    animStopButtonOpacity: Animated.Value;
    animStopButtonTransform: Animated.Value;
    animImageOpacity: Animated.Value;
    animVideoOpacity: Animated.Value;
    animVideoScale: Animated.Value;
    playbackSpeed: number;
    renderLaunchButton: boolean;
    showControls: boolean;
    videoCurrentTime: number;
    videoDuration: number;
    videoLoaded: boolean;
    videoMinimized: boolean;
    videoState: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
}

export default class VideoPlayer extends PureComponent<IVideoPlayerProps, IState> {

    private controlsTimer: any;
    private mounted: boolean;

    public playbackMenuRef: React.RefObject<Menu>;
    public videoRef: React.RefObject<Video>;

    constructor (props: IVideoPlayerProps) {
        super(props);
        this.playbackMenuRef = React.createRef();
        this.videoRef = React.createRef();
        this.state = {
            animSliderOpacity: new Animated.Value(0),
            animSliderTransform: new Animated.Value(0),
            animCloseButtonOpacity: new Animated.Value(0),
            animCloseButtonTransform: new Animated.Value(0),
            animControlsContainerOpacity: new Animated.Value(0),
            animFFButonOpacity: new Animated.Value(0),
            animFFButonTransform: new Animated.Value(0),
            animPauseButonOpacity: new Animated.Value(0),
            animPauseButonTransform: new Animated.Value(0),
            animPauseLayerOpacity: new Animated.Value(0),
            animResizeButonOpacity: new Animated.Value(0),
            animResizeButonTransform: new Animated.Value(0),
            animRWButonOpacity: new Animated.Value(0),
            animRWButonTransform: new Animated.Value(0),
            animStopButtonOpacity: new Animated.Value(0),
            animStopButtonTransform: new Animated.Value(0),
            animImageOpacity: new Animated.Value(1),
            animVideoOpacity: new Animated.Value(0),
            animVideoScale: new Animated.Value(1),
            playbackSpeed: 1,
            renderLaunchButton: true,
            showControls: false,
            videoCurrentTime: 0,
            videoDuration: 0,
            videoLoaded: false,
            videoMinimized: false,
            videoState: 'idle'
        };
    }


    public componentDidMount (): void {
        const { closeButton, controls, playOnMount, resumeOnOSPause } = this.props;

        this.mounted = true;

        if (playOnMount) {
            this.launchVideo();
        }

        if (closeButton) {
            this.animateCloseButton();
        }

        // Register to pause event triggered when headphones are unplugged
        // or a bluetooth audio peripheral disconnects from the device
        // Since it automatically pauses the video at system's level, we need to get it resuming manually

        // Shall we just do what we do on didUpdate?

        // WARNING: the JS doesn't seem to be reliably executed
        // if (isIOS && resumeOnOSPause) {
        //     MusicControl.on('pause', () => {
        //         this.setState({ videoState: 'paused' }, () => {
        //             if (controls) {
        //                 this.showControls();
        //             } else {
        //                 this.setState({ videoState: 'playing' }, () => {
        //                     SystemSetting.setVolume(0, { showUI: true });
        //                 });
        //             }
        //         });
        //     });
        // }
    }

    public componentDidUpdate (prevProps: IVideoPlayerProps): void {
        const { videoState } = this.state;
        const { controls, paused, showControlsOnPause, stopped } = this.props;

        if (paused !== prevProps.paused && videoState !== 'idle' && videoState !== 'ended') {
            if (controls && showControlsOnPause) {
                if (paused) {
                    this.showControls(() => { this.setState({ videoState: 'paused' }); });
                } else {
                    this.hideControls(() => { this.setState({ videoState: 'playing' }); });
                }
            } else {
                this.setState({ videoState: paused ? 'paused' : 'playing' });
            }
        }

        if (stopped !== prevProps.stopped && stopped) {
            if (videoState !== 'idle') {
                this.onEnd();
            }
        }
    }

    public componentWillUnmount (): void {
        this.mounted = false;
        this.clearControlsTimeout();
    }

    public stop (): void {
        this.onEnd();
    }

    public stopCompletely (duration?: number): void {
        const { animImageOpacity, animVideoOpacity, showControls } = this.state;

        if (showControls) {
            this.hideControls();
            this.clearControlsTimeout();
        }

        Animated.parallel([
            Animated.timing(animImageOpacity, {
                toValue: 1,
                duration: duration || 300,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animVideoOpacity, {
                toValue: 0,
                duration: duration || 300,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            this.setState({
                renderLaunchButton: false,
                videoState: 'ended'
            });
        });
    }

    public togglePause = (toPause?: boolean, callback?: () => void): void => {
        const { videoState } = this.state;
        const { tapToPause } = this.props;
        const toggle = (pause: boolean) => {
            this.setState({ videoState: pause ? 'paused' : 'playing'}, () => {
                tapToPause && this.animatePauseLayer(pause);
                callback && callback();
            });
        };
        if (toPause === true) {
            toggle(true);
        } else if (toPause === false || videoState === 'paused') {
            toggle(false);
        } else {
            toggle(true);
        }
    }

    private onEnd = (): void => {
        const { animImageOpacity, showControls } = this.state;
        const { loop, stopped, videoProps } = this.props;

        // this.videoRef?.current?.dismissFullscreenPlayer();
        this.videoRef?.current?.seek(0);

        if (showControls) {
            this.hideControls();
            this.clearControlsTimeout();
        }

        if (!loop || stopped) {
            Animated.timing(animImageOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }).start(() => {
                this.setState({
                    animVideoOpacity: new Animated.Value(0),
                    videoState: 'ended'
                });
            });
        }

        if (videoProps && videoProps.onEnd) {
            videoProps.onEnd();
        }
    }

    private onLoad = (payload: any): void => {
        const { videoProps } = this.props;

        this.setState({ videoLoaded: true });

        if (payload) {
            this.setState({
                videoCurrentTime: payload?.currentTime,
                videoDuration: payload?.duration
            });
        }

        if (videoProps && videoProps.onLoad) {
            videoProps.onLoad(payload, payload?.duration);
        }
    }

    private onProgress = (payload: any): void => {
        const { videoProps } = this.props;

        if (payload && payload.currentTime) {
            this.setState({ videoCurrentTime: payload.currentTime });
        }

        if (videoProps && videoProps.onProgress) {
            videoProps.onProgress(payload);
        }
    }

    private onReadyForDisplay = (): void => {
        const { animImageOpacity, animVideoOpacity } = this.state;
        const { videoProps } = this.props;

        this.setState({ videoState: 'playing' }, () => {
            Animated.sequence([
                Animated.delay(200),
                Animated.timing(animVideoOpacity, {
                    toValue: 1,
                    duration: 100,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.timing(animImageOpacity, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ]).start();
        });

        if (videoProps && videoProps.onReadyForDisplay) {
            videoProps.onReadyForDisplay();
        }
    }

    private onLoadVideo = (payload: any): void => {
        this.onLoad(payload);
        // The `readyForDisplay` event doesn't seem to be called on Android...
        if (isAndroid) {
            this.onReadyForDisplay();
        }
    }

    private animateCloseButton (): void {
        const { animCloseButtonOpacity, animCloseButtonTransform } = this.state;
        Animated.parallel([
            Animated.timing(animCloseButtonOpacity, {
                toValue: 1,
                duration: 150,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.spring(animCloseButtonTransform, {
                toValue: 1,
                speed: 15,
                bounciness: 5,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private animatePauseLayer (animateIn?: boolean): void {
        const { animPauseLayerOpacity } = this.state;
        Animated.timing(animPauseLayerOpacity, {
            toValue: animateIn ? 1 : 0,
            duration: 180,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private showControls = (callback?: () => void): void => {
        const {
            animSliderOpacity, animSliderTransform,
            animControlsContainerOpacity,
            animFFButonOpacity, animFFButonTransform,
            animPauseButonOpacity, animPauseButonTransform,
            animRWButonOpacity, animRWButonTransform,
            animResizeButonOpacity, animResizeButonTransform,
            animStopButtonOpacity, animStopButtonTransform
        } = this.state;
        const staggeredDelay = 80;
        const timingParams = {
            toValue: 1,
            duration: 150,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: 15,
            bounciness: 7,
            isInteraction: false,
            useNativeDriver: true
        };

        animSliderOpacity.setValue(0);
        animSliderTransform.setValue(0);
        animFFButonOpacity.setValue(0);
        animFFButonTransform.setValue(0);
        animPauseButonOpacity.setValue(0);
        animPauseButonTransform.setValue(0);
        animRWButonOpacity.setValue(0);
        animRWButonTransform.setValue(0);
        animResizeButonOpacity.setValue(0);
        animResizeButonTransform.setValue(0);
        animStopButtonOpacity.setValue(0);
        animStopButtonTransform.setValue(0);

        this.setState({ showControls: true }, () => {
            Animated.parallel([
                Animated.timing(animControlsContainerOpacity, timingParams),
                Animated.sequence([
                    Animated.delay(staggeredDelay * 1),
                    Animated.parallel([
                        Animated.timing(animRWButonOpacity, timingParams),
                        Animated.spring(animRWButonTransform, springParams)
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(staggeredDelay * 2),
                    Animated.parallel([
                        Animated.timing(animPauseButonOpacity, timingParams),
                        Animated.spring(animPauseButonTransform, springParams)
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(staggeredDelay * 3),
                    Animated.parallel([
                        Animated.timing(animFFButonOpacity, timingParams),
                        Animated.spring(animFFButonTransform, springParams)
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(staggeredDelay * 4),
                    Animated.parallel([
                        Animated.timing(animSliderOpacity, timingParams),
                        Animated.spring(animSliderTransform, springParams)
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(staggeredDelay * 3),
                    Animated.parallel([
                        Animated.timing(animResizeButonOpacity, timingParams),
                        Animated.spring(animResizeButonTransform, springParams)
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(staggeredDelay * 3),
                    Animated.parallel([
                        Animated.timing(animStopButtonOpacity, timingParams),
                        Animated.spring(animStopButtonTransform, springParams)
                    ])
                ])
            ]).start(() => {
                callback && callback();
            });
        });
    }

    private hideControls = (callback?: () => void): void => {
        const { animControlsContainerOpacity, animResizeButonOpacity, animStopButtonOpacity } = this.state;
        const duration = 350;

        if (!this.mounted) {
            return;
        }

        const params = {
            toValue: 0,
            duration,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };

        this.setState({ showControls: false }, () => {
            this.hidePlaybackSpeedMenu();
            Animated.parallel([
                Animated.timing(animControlsContainerOpacity, params),
                Animated.timing(animStopButtonOpacity, params),
                Animated.timing(animResizeButonOpacity, params)
            ]).start(() => {
                callback && callback();
            });
        });
    }

    private setControlsTimeout = (): void => {
        this.clearControlsTimeout();
        this.controlsTimer = setTimeout(() => {
            this.hideControls();
        }, CONTROLS_VISIBILITY_DURATION);
    }

    private clearControlsTimeout = (): void => {
        clearTimeout(this.controlsTimer);
    }

    private resetControlsTimeout = (): void => {
        this.clearControlsTimeout();
        this.setControlsTimeout();
    }

    private toggleControls = (): void => {
        const { showControls } = this.state;
        const { controls } = this.props;

        if (!controls) {
            return;
        }

        if (!showControls) {
            this.showControls();
            this.setControlsTimeout();
        } else {
            this.hideControls();
            this.clearControlsTimeout();
        }
    }

    private onPressPauseLayer = (): void  => {
        const { tapToPause } = this.props;
        if (!tapToPause) {
            return;
        }
        this.togglePause();
    }

    private launchVideo = (): void  => {
        this.setState({ videoState: 'loading' });
    }

    private seekVideo = (direction: 'rewind' | 'forward'): void => {
        const { videoCurrentTime, videoLoaded } = this.state;

        if (!videoLoaded) {
            return;
        }

        let time = videoCurrentTime + (SEEK_DURATION / 1000 * (direction === 'rewind' ? -1 : 1));
        if (time < 0) {
            time = 0;
        }
        this.videoRef?.current?.seek(time);
    }

    private seekVideoToSeconds = (value: number): void => {
        const { videoLoaded } = this.state;
        if (!videoLoaded) {
            return;
        }
        this.videoRef?.current?.seek(value);
    }

    private onSlidingComplete = (value: number): void => {
        this.resetControlsTimeout();
        this.seekVideoToSeconds(value);
    }

    private getResizeScale (): number {
        const { resizeButton } = this.props;

        if (!resizeButton) {
            return 1;
        }

        // If the screen is "thinner" than video, we need to scale according to width
        const resizeWidth = SCREEN_RATIO <= VIDEO_RATIO;

        let resizeScale;
        if (resizeWidth) {
            resizeScale = viewportWidth / VIDEO_DIMENSIONS.width;
        } else {
            resizeScale = viewportHeight / VIDEO_DIMENSIONS.height;
        }

        return resizeScale;
    }

    private animateVideoScale (minimize?: boolean): void {
        const { animVideoScale } = this.state;
        const toValue = minimize ? 0 : 1;

        Animated.timing(animVideoScale, {
            toValue,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private toggleVideoScale = (): void => {
        const { videoMinimized } = this.state;

        if (!videoMinimized) {
            this.setState({ videoMinimized: true }, () => {
                this.animateVideoScale(true);
            });
        } else {
            this.setState({ videoMinimized: false }, () => {
                this.animateVideoScale(false);
            });
        }
    }

    private showPlaybackSpeedMenu = (): void => {
        this.resetControlsTimeout();
        this.playbackMenuRef?.current?.show();
    }

    private hidePlaybackSpeedMenu = (): void => {
        this.resetControlsTimeout();
        this.playbackMenuRef?.current?.hide();
    }

    private setPlaybackSpeedMenu = (speed: number = 1): void => {
        this.setState({ playbackSpeed: speed }, () => {
            this.hidePlaybackSpeedMenu();
        });
    }

    private get backgroundVideoProps (): {} {
        return {
            disableFocus: true,
            ignoreSilentSwitch: 'obey',
            muted: true
        };
    }

    private get foregroundVideoProps (): {} {
        return {
            disableFocus: false,
            ignoreSilentSwitch: 'obey', // 'inherit' / 'ignore'
            muted: false
        };
    }

    private get launchButton (): JSX.Element {
        const { renderLaunchButton, videoState } = this.state;
        const { loop } = this.props;
        const Icon = videoState === 'ended' && !loop ? IconReplayColored : IconPlayColored;

        if (!renderLaunchButton) {
            return null;
        }

        return videoState === 'idle' || videoState === 'ended' ? (
            <View style={[styles.fullSpace, styles.centerChild]}>
                <TouchableScale activeOpacity={0.9} onPress={this.launchVideo}>
                    <Icon style={styles.launchIcon} />
                </TouchableScale>
            </View>
        ) : null;
    }

    private getControlButton = (Content: JSX.Element, callback: () => void, opacity: Animated.Value, transform: Animated.Value): JSX.Element => {
        const onPress = () => {
            this.resetControlsTimeout();
            callback && callback();
        };
        const animatedStyle = {
            opacity: opacity,
            transform: [{
                translateY: transform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                })
            }]
        };
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                <Animated.View style={[styles.control, animatedStyle]}>
                    { Content }
                </Animated.View>
            </TouchableOpacity>
        );
    }

    private get pauseButton (): JSX.Element {
        const { animPauseButonOpacity, animPauseButonTransform, videoState } = this.state;
        const Icon = videoState === 'paused' ? IconPlay : IconPause;
        const content = <Icon style={styles.control} />;
        return this.getControlButton(content, this.togglePause, animPauseButonOpacity, animPauseButonTransform);
    }

    private get rwButton (): JSX.Element {
        const { animRWButonOpacity, animRWButonTransform } = this.state;
        const callback = () => { this.seekVideo('rewind'); };
        const content = (
            <Fragment>
                <IconRewind style={styles.controlIcon} />
                <Text style={styles.controlLabel}>{ SEEK_DURATION / 1000 }</Text>
            </Fragment>
        );
        return this.getControlButton(content, callback, animRWButonOpacity, animRWButonTransform);
    }

    private get ffButton (): JSX.Element {
        const { animFFButonOpacity, animFFButonTransform } = this.state;
        const callback = () => { this.seekVideo('forward'); };
        const content = (
            <Fragment>
                <IconFastForward style={styles.controlIcon} />
                <Text style={styles.controlLabel}>{ SEEK_DURATION / 1000 }</Text>
            </Fragment>
        );
        return this.getControlButton(content, callback, animFFButonOpacity, animFFButonTransform);
    }

    private getPlaybackSpeedMenuItem (speed: number, last?: boolean): JSX.Element {
        const label = speed === 1 ? i18n.t('videoPlayer.normalPlaybackSpeed') : `${speed}x`;
        return (
            <Fragment>
                <MenuItem
                    onPress={() => this.setPlaybackSpeedMenu(speed)}
                    style={styles.playbackSpeedMenuItem}
                    textStyle={styles.playbackSpeedMenuItemText}
                    underlayColor={colors.violetUltraLight}
                >
                    { label }
                </MenuItem>
                { !last && <MenuDivider /> }
            </Fragment>
        );
    }

    private get playbackSpeedButton (): JSX.Element {
        const { playbackSpeed, showControls } = this.state;
        const pointerEvents = showControls ? 'auto' : 'none';
        const button = (
            <TouchableOpacity
                activeOpacity={0.6}
                onPress={this.showPlaybackSpeedMenu}
                style={styles.playbackSpeedButton}
            >
                <Text
                    numberOfLines={1}
                    style={styles.playbackSpeedButtonText}
                >
                    { `${playbackSpeed}x` }
                </Text>
            </TouchableOpacity>
        );
        return (
            <View pointerEvents={pointerEvents}>
                <Menu
                    animationDuration={200}
                    button={button}
                    style={styles.playbackSpeedMenu}
                    ref={this.playbackMenuRef}
                >
                    { this.getPlaybackSpeedMenuItem(0.25) }
                    { this.getPlaybackSpeedMenuItem(0.5) }
                    { this.getPlaybackSpeedMenuItem(0.75) }
                    { this.getPlaybackSpeedMenuItem(1) }
                    { this.getPlaybackSpeedMenuItem(1.25) }
                    { this.getPlaybackSpeedMenuItem(1.5) }
                    { this.getPlaybackSpeedMenuItem(1.75) }
                    { this.getPlaybackSpeedMenuItem(2, true) }
                </Menu>
            </View>
        );
    }

    private get seekBar (): JSX.Element {
        const { animSliderOpacity, animSliderTransform, videoCurrentTime, videoDuration } = this.state;
        const animatedStyle = {
            opacity: animSliderOpacity,
            transform: [{
                translateY: animSliderTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                })
            }]
        };

        return (
            <Animated.View style={[styles.sliderContainer, animatedStyle]}>
                <Text style={[styles.sliderLabel, styles.sliderLabelLeft]}>
                    { convertSecondsToTimeLabel(videoCurrentTime) }
                </Text>
                <Slider
                    maximumTrackTintColor={colors.white}
                    maximumValue={videoDuration}
                    minimumTrackTintColor={colors.pink}
                    minimumValue={0}
                    onSlidingComplete={this.onSlidingComplete}
                    onSlidingStart={this.resetControlsTimeout}
                    step={0.1}
                    style={styles.slider}
                    thumbTintColor={colors.pink}
                    value={videoCurrentTime}
                />
                <Text style={[styles.sliderLabel, styles.sliderLabelRight]}>
                    { convertSecondsToTimeLabel(videoDuration) }
                </Text>
                { this.playbackSpeedButton }
            </Animated.View>
        );
    }

    private get controlsGradientOverlay (): JSX.Element {
        // Probably not a good idea from a performance standpoint -> Not rendered for now
        const blur = !isAndroid ? (
            <BlurWrapper
                type={'vibrancy'}
                blurType={'dark'}
                blurAmount={12}
                style={[styles.fullSpace, { opacity: 0.7 }]}
            />
        ) : null;
        return (
            <Fragment>
                {/* { blur } */}
                <LinearGradient
                    colors={OVERLAY_COLORS}
                    end={{ x: 0, y: 1 }}
                    locations={OVERLAY_LOCATIONS}
                    pointerEvents={'none'}
                    start={{ x: 0, y: 0 }}
                    style={styles.fullSpace}
                />
            </Fragment>
        );
    }

    private get pauseLayer (): JSX.Element {
        const { animPauseLayerOpacity } = this.state;
        const { controls, tapToPause } = this.props;

        if (!tapToPause || controls) {
            return null;
        }

        return (
            <Animated.View style={[styles.fullSpace, { opacity: animPauseLayerOpacity }]}>
                <TouchableWithoutFeedback
                    style={[styles.fullSpace, styles.centerChild]}
                    onPress={this.onPressPauseLayer}
                >
                    <View style={[styles.fullSpace, styles.centerChild]}>
                        { this.controlsGradientOverlay }
                        <IconPlay style={styles.control} />
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>
        );
    }

    private get controls (): JSX.Element {
        const { animControlsContainerOpacity, showControls } = this.state;
        const { controls } = this.props;

        if (!controls) {
            return null;
        }

        return (
            <Animated.View style={[styles.fullSpace, { opacity: animControlsContainerOpacity }]}>
                <TouchableWithoutFeedback
                    style={styles.fullSpace}
                    onPress={this.toggleControls}
                >
                    <View style={[styles.fullSpace, styles.centerChild]}>
                        { this.controlsGradientOverlay }
                        <View
                            style={styles.controlsContainer}
                            pointerEvents={showControls ? 'auto' : 'box-only'}
                        >
                            { this.rwButton }
                            { this.pauseButton }
                            { this.ffButton }
                        </View>
                        { this.seekBar }
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>
        );
    }

    private get imagePlaceholder (): JSX.Element {
        const { animImageOpacity } = this.state;
        const { thumbnailSource } = this.props;
        const source = typeof thumbnailSource === 'string' ? { uri: thumbnailSource } : thumbnailSource;
        return (
            <Animated.View style={[styles.fullSpace, { opacity: animImageOpacity }]}>
                <FadeInImage
                    source={source}
                    containerCustomStyle={styles.fullSpace}
                />
            </Animated.View>
        );
    }

    private get video (): JSX.Element {
        const { animVideoOpacity, animVideoScale, playbackSpeed, videoState } = this.state;
        const { background, landscape, loop, resizeButton, thumbnailSource, videoSource, videoProps } = this.props;
        const renderVideo = videoState !== 'idle' && videoState !== 'ended';

        if (!renderVideo) {
            return null;
        }

        const source = typeof videoSource === 'string' ? { uri: videoSource } : videoSource;
        const specificProps = background ? this.backgroundVideoProps : this.foregroundVideoProps;

        // Poster doesn't accept local images (i.e. `require()`)
        // Since we have our own thumbnail handling, disabling it might help from a performance standpoint
        const posterProps = {
            // poster: typeof thumbnailSource === 'string' ? thumbnailSource : undefined,
            poster: undefined,
            posterResizeMode: 'cover'
        };

        const animatedStyle = {
            opacity: animVideoOpacity,
            transform: [{
                scale: animVideoScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [this.getResizeScale(), 1]
                })
            }]
        };

        const videoStyle = resizeButton ? (landscape ? styles.videoLandscape : styles.video) : styles.fullSpace;

        return (
            <Animated.View
              style={[styles.fullSpace, styles.centerChild, animatedStyle]}
            >
                <Video
                    { ...posterProps }
                    { ...specificProps }
                    automaticallyWaitsToMinimizeStalling={false}
                    // Don't use `bufferConfig` or Android ExoPlayer will ignore the `playInBackground` property
                    // https://github.com/react-native-community/react-native-video/issues/1561#issuecomment-528543794
                    // bufferConfig={{
                    //     minBufferMs: 2000,
                    //     maxBufferMs: 2 * SEEK_DURATION,
                    //     bufferForPlaybackMs: 2000,
                    //     bufferForPlaybackAfterRebufferMs: 2000
                    // }}
                    playInBackground={false}
                    playWhenInactive={true}
                    { ...videoProps }
                    controls={false}
                    fullscreen={false}
                    fullscreenAutorotate={false}
                    onEnd={this.onEnd}
                    onLoad={this.onLoadVideo}
                    onProgress={this.onProgress}
                    onReadyForDisplay={this.onReadyForDisplay}
                    paused={videoState !== 'playing'}
                    rate={playbackSpeed}
                    ref={this.videoRef}
                    repeat={loop}
                    resizeMode={'cover'}
                    source={source}
                    style={videoStyle}
                />
            </Animated.View>
        );
    }

    private get loader (): JSX.Element {
        const { videoState } = this.state;
        const { hideLoader, hideLoaderBlur, smallUI } = this.props;
        const size = smallUI ? 30 : (isMWidth ? 42 : 36);
        return !hideLoader && videoState === 'loading' ? (
            <Loader
                size={size}
                color={colors.violetLight}
                withContainer={true}
                containerBlur={!hideLoaderBlur}
                containerBlurProps={{
                    blurAmount: 12,
                    blurStyle: styles.loaderBlurContainer,
                    blurType: 'dark'
                }}
            />
        ) : null;
    }

    private get resizeButton (): JSX.Element {
        const { animResizeButonOpacity, animResizeButonTransform, videoMinimized, showControls } = this.state;
        const { resizeButton } = this.props;
        const resizeScale = this.getResizeScale();

        // The button is only needed for screens that have different ratio than the videos themselves
        if (!resizeButton || resizeScale === 1 || (resizeScale > 0.975 && resizeScale < 1.025)) {
            return null;
        }

        const pointerEvents = showControls ? 'auto' : 'none';
        const icon = videoMinimized ? EXPAND_ICON : MINIMIZE_ICON;
        const onPress = () => {
            this.toggleVideoScale();
            this.hideControls();
        };
        const animatedStyle = {
            opacity: animResizeButonOpacity,
            transform: [{
                translateY: animResizeButonTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0]
                })
            }]
        };
        return (
            <Animated.View style={[styles.resizeButtonContainer, animatedStyle]} pointerEvents={pointerEvents}>
                <TouchableOpacity style={[styles.fullSpace, styles.resizeButton]} activeOpacity={0.7} onPress={onPress}>
                    <FadeInImage
                        source={icon}
                        containerCustomStyle={styles.resizeIcon}
                        tintColor={colors.white}
                    />
                </TouchableOpacity>
            </Animated.View>
        );
    }

    private get stopButton (): JSX.Element {
        const { animStopButtonOpacity, animStopButtonTransform, showControls } = this.state;
        const { onStop, stopButton } = this.props;

        if (!stopButton) {
            return null;
        }

        const pointerEvents = showControls ? 'auto' : 'none';
        const onPress = () => {
            this.hideControls();
            onStop && onStop();
        };
        const animatedStyle = {
            opacity: animStopButtonOpacity,
            transform: [{
                translateY: animStopButtonTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0]
                })
            }]
        };
        return (
            <Animated.View style={[styles.stopButtonContainer, animatedStyle]} pointerEvents={pointerEvents}>
                <TouchableOpacity style={[styles.fullSpace, styles.stopButton]} activeOpacity={0.7} onPress={onPress}>
                    <IconStop style={styles.stopIcon} />
                </TouchableOpacity>
            </Animated.View>
        );
    }

    private get closeButton (): JSX.Element {
        const { animCloseButtonOpacity, animCloseButtonTransform } = this.state;
        const { onClose, closeButton } = this.props;

        if (!closeButton) {
            return null;
        }

        const onPress = () => {
            this.hideControls();
            onClose && onClose();
        };
        const animatedStyle = {
            opacity: animCloseButtonOpacity,
            transform: [{
                translateY: animCloseButtonTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-60, 0]
                })
            }]
        };
        return (
            <Animated.View style={[styles.closeButtonContainer, animatedStyle]}>
                <TouchableOpacity style={[styles.fullSpace, styles.closeButton]} activeOpacity={0.7} onPress={onPress}>
                    <FadeInImage source={CLOSE_ICON} containerCustomStyle={headerStyles.close} tintColor={colors.white} />
                </TouchableOpacity>
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={[styles.fullSpace, styles.container]}>
                <View style={styles.fullSpace}>
                    { this.video }
                    { this.imagePlaceholder }
                    { this.pauseLayer }
                    { this.controls }
                    { this.loader }
                    { this.launchButton }
                    { this.resizeButton }
                    { this.stopButton }
                    { this.closeButton }
                </View>
            </View>
        );
    }
}
