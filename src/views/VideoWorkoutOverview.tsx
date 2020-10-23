import React, { Component, Fragment } from 'react';
import { Text, View, Animated, Easing, Image } from 'react-native';
import { NavigationEvents, NavigationScreenProp } from 'react-navigation';
import delays from '../utils/animDelays';
import i18n from '../utils/i18n';
import { getFormattedDuration } from '../utils/workout';
import { IVideoWorkout } from '../types/workout';
import { IVideoLog } from './Video';
import { logEvent } from '../utils/analytics';
import { isAndroid } from '../utils/os';
import { get } from 'lodash';

import LinearGradient from 'react-native-linear-gradient';
import Orientation from 'react-native-orientation-locker';

import BlurWrapper from '../components/BlurWrapper';
import EllipsisSeparator from '../components/EllipsisSeparator';
import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import TouchableScale from '../components/TouchableScale';
import VideoPlayer, { IVideoPlayerProps } from '../components/VideoPlayer';

import { viewportHeight, isLHeight, isMWidth } from '../styles/base/metrics.style';
import workoutOverviewStyles from '../styles/views/WorkoutOverview.style';
import styles, { GRADIENT_COLORS } from '../styles/views/VideoWorkoutOverview.style';

import IconPlayColored from '../static/icons/video/play-colored.svg';

interface IProps {
    navigation: NavigationScreenProp<{}>;
}

interface IState {
    pauseBackgroundVideo: boolean;
    animContentOpacity: Animated.Value;
    animContentTransform: Animated.Value;
    animEllipsisOpacity: Animated.Value;
    animEllipsisTransform: Animated.Value;
    animPlayOpacity: Animated.Value;
    animPlayTransform: Animated.Value;
}

const DUMBBELL_ICON = require('../static/icons/dumbbell-full-white.png');

export default class VideoWorkoutOverview extends Component<IProps, IState> {

    private workout: IVideoWorkout;

    constructor (props: IProps) {
        super(props);
        this.workout = props.navigation.getParam('workout', {});
        this.state = {
            pauseBackgroundVideo: false,
            animContentOpacity: new Animated.Value(0),
            animContentTransform: new Animated.Value(0),
            animEllipsisOpacity: new Animated.Value(0),
            animEllipsisTransform: new Animated.Value(0),
            animPlayOpacity: new Animated.Value(0),
            animPlayTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animate();
        logEvent('workout_recovery_display', {
            workoutId: this.workout?.id,
            workoutTitle: this.workout?.title
        });
    }

    private onDidFocus = (): void => {
        this.setState({ pauseBackgroundVideo: false });
    }

    private onWillBlur = (): void => {
        this.setState({ pauseBackgroundVideo: true });
    }

    private getAnimation (opacityValue: Animated.Value, transformValue: Animated.Value, delay: number = 0, springProps?: {}): Animated.CompositeAnimation {
        const opacityParams = {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: 15,
            bounciness: 7,
            ...springProps,
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

    private animate (): void {
        const {
            animContentOpacity,
            animContentTransform,
            animEllipsisOpacity,
            animEllipsisTransform,
            animPlayOpacity,
            animPlayTransform,
        } = this.state;

        const initialDelay = delays.views.workoutOverview.header;

        Animated.parallel([
            this.getAnimation(animContentOpacity, animContentTransform, initialDelay),
            this.getAnimation(animEllipsisOpacity, animEllipsisTransform, initialDelay + 150),
            this.getAnimation(animPlayOpacity, animPlayTransform, initialDelay + 240, { speed: 13, bounciness: 12 })
        ]).start();
    }

    private get image (): JSX.Element {
        const { pauseBackgroundVideo } = this.state;
        const backgroundVideo = this.workout && this.workout.backgroundVideo;
        const media = !!backgroundVideo ? (
            <VideoPlayer
                background={true}
                controls={false}
                hideLoader={true}
                loop={true}
                paused={pauseBackgroundVideo}
                playOnMount={true}
                thumbnailSource={get(this.workout, 'fullscreenImage.url', backgroundVideo.thumbnailUrl)}
                videoSource={backgroundVideo.url}
            />
        ) : (
            <FadeInImage
                source={{ uri: get(this.workout, 'fullscreenImage.url') }}
                containerCustomStyle={[styles.fullSpace, workoutOverviewStyles.imageBackground]}
                duration={300}
                loaderColor={'rgba(255, 255, 255, 0.65)'}
                initialZoom={1.6}
                zoomDuration={1700}
            />
        );

        return (
            <View style={styles.fullSpace}>
                { media }
            </View>
        );
    }

    private get ellipsis (): JSX.Element {
        const { animEllipsisOpacity, animEllipsisTransform } = this.state;
        const animatedStyle = {
            opacity: animEllipsisOpacity,
            transform: [{
                translateX: animEllipsisTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0]
                })
            }]
        };
        return (
            <Animated.View style={[styles.ellipsisBackground, animatedStyle]}>
                <EllipsisSeparator textStyle={styles.textEllipsisBackground} />
            </Animated.View>
        );
    }

    private getBlurElement (style?: any, blurAmount: number = 40): JSX.Element {
        return (
            <BlurWrapper
                type={'vibrancy'}
                blurType={'dark'}
                blurAmount={blurAmount}
                style={[styles.fullSpace, style]}
                blurStyle={styles.blurIOS}
                fallbackStyle={styles.blurAndroid}
            />
        );
    }

    private get videoLauncher (): JSX.Element {
        const { animPlayOpacity, animPlayTransform } = this.state;
        const video = this.workout && this.workout.video;

        if (!video) {
            return null;
        }

        const animatedStyle = {
            opacity: animPlayOpacity,
            transform: [{
                scale: animPlayTransform
            }]
        };

        const onPress = () => {
            const player: IVideoPlayerProps = {
                thumbnailSource: video.thumbnailUrl,
                videoSource: video.url,
                onDidFocus: () => { Orientation.lockToLandscape(); },
                onWillBlur: () => { Orientation.lockToPortrait(); },
                onWillUnmount: () => { Orientation.lockToPortrait(); }
            };
            const videoLog: IVideoLog = {
                eventName: 'workout_recovery_video_progress',
                videoTitle: video?.fileName
            };
            this.props.navigation.navigate('Video', { player, landscape: true, videoLog });
            logEvent('workout_recovery_video_display', { videoId: video?.id });
        };

        return (
            <View style={styles.videoViewerContainer}>
                {/* { this.ellipsis } */}
                <Animated.View style={animatedStyle}>
                    <TouchableScale
                        style={styles.playIcon}
                        onPress={onPress}
                        activeOpacity={0.9}
                    >
                        { this.getBlurElement(styles.playIconBlur, 12) }
                        <IconPlayColored style={styles.fullSpace} />
                    </TouchableScale>
                </Animated.View>
            </View>
        );
    }

    private get infos (): JSX.Element {
        const { bodyFocus, duration, level } = this.workout;
        const titleNumberOfLines = isMWidth ? 2 : 1;
        let levelIcons = [];
        if (level) {
            for (let i = 0; i < level; i++) {
                levelIcons.push(
                    <Image
                        key={`recovery-workout-level-image${i}`}
                        source={DUMBBELL_ICON}
                        style={styles.infoIcon}
                    />
                );
            }
        }
        return (
            <View style={styles.infosWrapper}>
                <View style={[styles.infosContainer, styles.infosContainerFirst]}>
                    { this.getBlurElement() }
                    <Text style={styles.infoTitle} numberOfLines={titleNumberOfLines}>{i18n.t('videoWorkoutOverview.duration')}</Text>
                    <Text style={styles.infoContent} numberOfLines={2}>{getFormattedDuration(duration)}</Text>
                </View>
                <View style={styles.infosContainer}>
                    { this.getBlurElement() }
                    <Text style={styles.infoTitle} numberOfLines={titleNumberOfLines}>{i18n.t('videoWorkoutOverview.level')}</Text>
                    <View style={styles.infosIconsContainer}>
                        { levelIcons }
                    </View>
                </View>
                <View style={[styles.infosContainer, styles.infosContainerLast]}>
                    { this.getBlurElement() }
                    <Text style={styles.infoTitle} numberOfLines={titleNumberOfLines}>{i18n.t('videoWorkoutOverview.bodyFocus')}</Text>
                    <Text style={styles.infoContent} numberOfLines={2}>{bodyFocus}</Text>
                </View>
            </View>
        );
    }

    private get infoBackground (): JSX.Element {
        return isAndroid ? (
            <LinearGradient
                angle={160}
                colors={GRADIENT_COLORS}
                style={[styles.fullSpace, styles.contentBlur]}
                useAngle={true}
            />
        ) : (
            this.getBlurElement(styles.contentBlur)
        );
    }

    private get content (): JSX.Element {
        const { animContentOpacity, animContentTransform } = this.state;
        const { description } = this.workout;
        const animatedStyle = {
            opacity: animContentOpacity,
            transform: [{
                translateY: animContentTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [viewportHeight / 2, 0]
                })
            }]
        };
        const titleStyle = [
            workoutOverviewStyles.title,
            styles.title
        ];
        const workoutDescription = description && description.length > 1 ? (
            <Text numberOfLines={isLHeight ? 5 : 4} style={styles.description}>{ description }</Text>
        ) : null;

        return (
            <View style={[styles.fullSpace, styles.contentContainer]}>
                { this.videoLauncher }
                <Animated.View style={[styles.contentInnerContainer, animatedStyle]}>
                    <View style={styles.contentBlurContainer}>
                        { this.infoBackground }
                    </View>
                    <Text numberOfLines={3} style={titleStyle}>
                        { this.workout.title }
                    </Text>
                    { workoutDescription }
                    { this.infos }
                </Animated.View>
            </View>
        );
    }

    public render (): JSX.Element {
        const content = this.workout ? (
            <Fragment>
                <Sidebar hideImage={true}/>
                { this.image }
                { this.content }
            </Fragment>
        ) : null;
        return (
            <Fragment>
                <NavigationEvents
                  onDidFocus={this.onDidFocus}
                  onWillBlur={this.onWillBlur}
                />
                <View style={[styles.fullSpace, workoutOverviewStyles.container]}>
                    { content }
                </View>
                <Header
                    gradientAlwaysVisible={true}
                    gradientColors={'black'}
                    mode={'backWhite'}
                />
            </Fragment>
        );
    }
}
