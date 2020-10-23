import React, { PureComponent, Fragment } from 'react';
import { Animated, Easing, Image, View, Text, TouchableOpacity } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { getFormattedDuration } from '../utils/workout';
import { ETooltipIds } from '../store/modules/tutorials';
import { ICircuitExercise } from '../types/workout';
import { IVideoPlayerProps } from './VideoPlayer';
import { logEvent } from '../utils/analytics';
import { IScreenProps } from '../index';
import delays from '../utils/animDelays';
import i18n from '../utils/i18n';

import CardFlip from './CardFlip';
import DiffuseShadow from './DiffuseShadow';
import FadeInImage from './FadeInImage';
import Tooltip from './Tooltip';
import TouchableScale from './TouchableScale';

import colors from '../styles/base/colors.style';
import { viewportHeight } from '../styles/base/metrics.style';
import { HEADER_MAX_HEIGHT } from '../styles/views/WorkoutOverview.style';
import styles, {
    ITEM_DONE_OPACITY,
    ALTERNATIVE_COLOR
} from '../styles/components/WorkoutOverviewExercise.style';

import IconPlay from '../static/icons/video/play.svg';

const ICON_REPS_TODO = require('../static/icons/dumbbell-full.png');
const ICON_REPS_DONE = require('../static/icons/dumbbell-stroke.png');
const ICON_SHUFFLE = require('../static/icons/shuffle.png');
const ICON_ANCHOR = require('../static/icons/anchor.png');
const STOPWATCH_ICON = require('../static/icons/stopwatch.png');

interface IProps {
    active?: boolean;
    circuitColor?: string;
    containerStyle?: any;
    data: ICircuitExercise;
    done?: boolean;
    first?: boolean;
    index: number;
    last?: boolean;
    lastOfCircuit?: boolean;
    navigation: NavigationScreenProp<{}>;
    onSwitch: () => void;
    screenProps: IScreenProps;
}

interface IState {
    animSlideUp: Animated.Value;
    animSlideLeft: Animated.Value;
    animTitleOpacity: Animated.Value;
    animTitleTransform: Animated.Value;
    animMusclesOpacity: Animated.Value;
    animMusclesTransform: Animated.Value;
    animRepsOpacity: Animated.Value;
    animRepsTransform: Animated.Value;
    animBackgroundBorderOpacity: Animated.Value;
    animSwitchTransform: Animated.Value;
    animSwitchBackgroundColor: Animated.Value;
    switched: boolean;
}

const CARD_FLIP_DURATION = 350;

class WorkoutOverviewExercise extends PureComponent<IProps, IState> {
    private cardFlipRef: React.RefObject<CardFlip>;

    constructor (props: IProps) {
        super(props);
        this.cardFlipRef = React.createRef<CardFlip>();
        this.state = {
            animSlideUp: new Animated.Value(0),
            animSlideLeft: new Animated.Value(0),
            animTitleOpacity: new Animated.Value(0),
            animTitleTransform: new Animated.Value(0),
            animMusclesOpacity: new Animated.Value(0),
            animMusclesTransform: new Animated.Value(0),
            animRepsOpacity: new Animated.Value(0),
            animRepsTransform: new Animated.Value(0),
            animBackgroundBorderOpacity: new Animated.Value(0),
            animSwitchTransform: new Animated.Value(0),
            animSwitchBackgroundColor: new Animated.Value(0),
            switched: false
        };
    }

    public componentDidMount (): void {
        this.animate();
    }

    public componentDidUpdate (): void {
        // Replay animations for item opacity
        this.animate();
    }

    private animate (): void {
        const {
            animSlideUp,
            animSlideLeft,
            animTitleOpacity,
            animTitleTransform,
            animMusclesOpacity,
            animMusclesTransform,
            animRepsOpacity,
            animRepsTransform,
            animBackgroundBorderOpacity
        } = this.state;
        const { index } = this.props;
        const initialDelay = delays.views.workoutOverview.items + index * 80;
        const pauseForSlideLeft = 400;
        const pauseForBackgroundBorder = 150;
        const labelOpacityParams = {
            toValue: 1,
            duration: 150,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const labelTransformParams = {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.poly(4)),
            isInteraction: false,
            useNativeDriver: true
        };

        Animated.sequence([
            Animated.delay(initialDelay),
            Animated.spring(animSlideUp, {
                toValue: 1,
                speed: 4,
                bounciness: 4,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.delay(pauseForSlideLeft),
            Animated.parallel([
                Animated.timing(animSlideLeft, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.poly(4)),
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.delay(120),
                Animated.parallel([
                    Animated.timing(animTitleOpacity, labelOpacityParams),
                    Animated.timing(animTitleTransform, labelTransformParams)
                ]),
                Animated.delay(120),
                Animated.parallel([
                    Animated.timing(animMusclesOpacity, labelOpacityParams),
                    Animated.timing(animMusclesTransform, labelTransformParams)
                ]),
                Animated.delay(120),
                Animated.parallel([
                    Animated.timing(animRepsOpacity, labelOpacityParams),
                    Animated.timing(animRepsTransform, labelTransformParams)
                ])
            ]),
            Animated.delay(pauseForBackgroundBorder),
            Animated.timing(animBackgroundBorderOpacity, {
                toValue: 1,
                duration: 250,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private changeExercise = (ref: CardFlip): void => {
        const { animSwitchTransform, animSwitchBackgroundColor, switched } = this.state;
        Animated.parallel([
            Animated.timing(animSwitchTransform, {
                toValue: switched ? 0 : 1,
                duration: CARD_FLIP_DURATION,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animSwitchBackgroundColor, {
                toValue: switched ? 0 : 1,
                duration: CARD_FLIP_DURATION,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: false // Not supported yet
            })
        ]).start();
        this.setState({ switched: !switched }, () => {
            this.props?.onSwitch && this.props?.onSwitch();
        });
        ref.onPress();
    }

    private videoPlayer (alternative: boolean): JSX.Element {
        const source = alternative ? this.props.data?.exercise?.alternativeExercise : this.props.data?.exercise;
        const video = source?.video;

        if (!video) {
            return null;
        }

        const onPress = () => {
            const player: IVideoPlayerProps = {
                // loop: true,
                thumbnailSource: video.thumbnailUrl,
                videoSource: video.url
            };
            this.props.navigation.navigate('Video', { player });
            logEvent('workout_overview_exercise_video_display', { videoId: video.fileName });
        };

        return (
            <TouchableScale
                activeOpacity={0.7}
                containerStyle={styles.fullSpace}
                onPress={onPress}
                style={styles.videoPlayerContainer}
            >
                <View style={styles.videoPlayerIconContainer}>
                    <IconPlay style={styles.videoPlayerIcon } />
                </View>
            </TouchableScale>
        );
    }

    private image (alternative: boolean): JSX.Element {
        const source = alternative ? this.props.data?.exercise?.alternativeExercise : this.props.data?.exercise;
        const image = source?.image;
        return (
            <View style={styles.imageWrapper}>
                <View style={styles.imageContainer}>
                    <DiffuseShadow
                        borderRadius={styles.imageContainer.borderRadius}
                        horizontalOffset={18}
                        shadowOpacity={0.22}
                        verticalOffset={9}
                    />
                    <FadeInImage
                        source={{uri: image && image.thumbnailUrl}}
                        containerCustomStyle={styles.image}
                        imageStyle={styles.image}
                        duration={300}
                        loader={'none'}
                    />
                    { this.videoPlayer(alternative) }
                </View>
            </View>
        );
    }

    private title (alternative: boolean): JSX.Element {
        const { animTitleOpacity, animTitleTransform } = this.state;
        const { done, circuitColor } = this.props;
        const source = alternative ? this.props.data?.exercise?.alternativeExercise : this.props.data?.exercise;
        const title = source?.title;

        if (!title) {
            return null;
        }

        const animatedStyle = {
            opacity: animTitleOpacity,
            transform: [{
                translateX: animTitleTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [90, 0]
                })
            }]
        };
        const textStyle = [
            styles.title,
            { color: circuitColor },
            alternative ? styles.titleAlternative : {},
            done ? styles.titleDone : {},
            animatedStyle
        ];

        return (
            <Animated.Text style={textStyle} numberOfLines={2}>
                { title }
            </Animated.Text>
        );
    }

    private muscles (alternative: boolean): JSX.Element {
        const { animMusclesOpacity, animMusclesTransform } = this.state;
        const { data, done, circuitColor } = this.props;
        const source = alternative ? data?.exercise?.alternativeExercise : data?.exercise;
        const mainMuscleGroup = source?.mainMuscleGroup;
        const secondaryMuscleGroup = source?.secondaryMuscleGroup;

        if (!mainMuscleGroup && !secondaryMuscleGroup) {
            return null;
        }

        let muscles = null;
        if (mainMuscleGroup && mainMuscleGroup.name) {
            muscles = mainMuscleGroup.name;
        }
        if (secondaryMuscleGroup && secondaryMuscleGroup.name) {
            muscles = (muscles !== null) ? muscles + ', ' + secondaryMuscleGroup.name : secondaryMuscleGroup.name;
        }

        if (!muscles) {
            return null;
        }

        const animatedStyle = {
            opacity: animMusclesOpacity,
            transform: [{
                translateX: animMusclesTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [90, 0]
                })
            }]
        };

        const textStyle = [
            styles.muscles,
            { color: circuitColor },
            alternative ? styles.musclesAlternative : {},
            done ? styles.musclesDone : {},
            animatedStyle
        ];

        return (
            <Animated.Text style={textStyle} numberOfLines={1}>
                { muscles }
            </Animated.Text>
        );
    }

    private repsOrSecs (alternative: boolean): JSX.Element {
        const { animRepsOpacity, animRepsTransform } = this.state;
        const { data: { sets, type }, done, circuitColor, index } = this.props;
        const isTime = type === 'time';

        if (!sets || !sets.length) {
            return null;
        }

        const tooltip = index === 0 ? (
            <Tooltip
                containerStyle={styles.setTooltip}
                screenProps={this.props.screenProps}
                tooltipId={ETooltipIds.workoutOverviewSets}
            />
        ) : null;

        let target = '';
        for (let i = 0; i < sets.length; i++) {
            const setTarget = sets[i].reps;
            if (setTarget) {
                const toFailure = sets[i].toFailure;
                const repsLabel = toFailure ?
                    i18n.t('workout.tf') :
                    (isTime ? getFormattedDuration(setTarget) : setTarget);
                const comma = i < sets.length - 1 ? ', ' : '';
                target += `${repsLabel}${comma}`;
            }
        }

        const repsStyle = [
            styles.repsIcon,
            done ? styles.repsIconDone : {}
        ];

        let icon;
        if (isTime) {
            icon = (
                <Image
                    source={STOPWATCH_ICON}
                    style={[styles.secsIcon, { tintColor: done ? colors.violetDark : colors.white }]}
                />
            );
        } else {
            icon = (
                <Image
                    source={done ? ICON_REPS_DONE : ICON_REPS_TODO}
                    style={repsStyle}
                />
            );
        }

        const animatedStyle = {
            opacity: animRepsOpacity,
            transform: [{
                translateX: animRepsTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [90, 0]
                })
            }]
        };
        const containerStyle = [
            styles.repsOrSecsContainer,
            { backgroundColor: circuitColor },
            alternative ? styles.repsOrSecsContainerAlternative : {},
            done ? styles.repsOrSecsContainerDone : {}
        ];

        const textStyle = [
            styles.repsOrSecsLabel,
            alternative ? styles.repsOrSecsLabelAlternative : {},
            done ? styles.repsOrSecsLabelDone : {}
        ];

        return target.length ? (
            <Animated.View style={animatedStyle}>
                <View style={containerStyle}>
                    { icon }
                    <Text style={textStyle}>{ target }</Text>
                </View>
                { tooltip }
            </Animated.View>
        ) : null;
    }

    private infos (alternative: boolean): JSX.Element {
        return (
            <Animated.View style={styles.infos}>
                <View style={styles.leftContent}>
                    { this.title(alternative) }
                    { this.muscles(alternative) }
                    { this.repsOrSecs(alternative) }
                </View>
                <View style={styles.rightContent}>
                    { this.image(alternative) }
                </View>
            </Animated.View>
        );
    }

    private backgroundBorder (alternative: boolean): JSX.Element {
        const { animBackgroundBorderOpacity } = this.state;
        const { done, circuitColor } = this.props;

        const containerStyle = [
            styles.backgroundBorder,
            done ? {
                opacity: animBackgroundBorderOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, ITEM_DONE_OPACITY]
                })
            } : {}
        ];

        const backgroundBorderBackgroundStyle = [
            styles.backgroundBorderBackground,
            { borderColor: circuitColor },
            alternative ? styles.backgroundBorderBackgroundAlternative : {},
            done ? styles.backgroundBorderBackgroundDone : {}
        ];

        return (
            <Animated.View style={containerStyle}>
                <View style={backgroundBorderBackgroundStyle} />
                {/* hide borders behind image when there is opacity */}
                <View style={styles.backgroundBorderBackgroundHideTop} />
            </Animated.View>
        );
    }

    private get switch (): JSX.Element {
        const { data: { exercise }, done, circuitColor } = this.props;

        if (!exercise?.alternativeExercise || done) {
            return null;
        }

        const { animSwitchTransform, animSwitchBackgroundColor } = this.state;

        const switchCircleTransformStyle = {
            transform: [{
                translateX: animSwitchTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 25]
                })
            }]
        };

        const switchContainerStyle = [
            styles.switchContainer,
            {
                backgroundColor: animSwitchBackgroundColor.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ALTERNATIVE_COLOR, circuitColor]
                })
            }
        ];

        return (
            <Fragment>
                <TouchableOpacity
                    onPress={() => this.changeExercise(this.cardFlipRef.current)}
                    style={styles.switchWrapper}
                    activeOpacity={1}
                >
                    <Animated.View style={switchContainerStyle}>
                        <View style={styles.switchImageContainer}>
                            <Image source={ICON_SHUFFLE} style={styles.switchIconReversed} />
                            <Image source={ICON_SHUFFLE} style={styles.switchIcon} />
                            <Animated.View style={[styles.switchCircle, switchCircleTransformStyle]} />
                        </View>
                    </Animated.View>
                </TouchableOpacity>
                <Tooltip
                    containerStyle={styles.alternativeTooltip}
                    screenProps={this.props.screenProps}
                    tooltipId={ETooltipIds.workoutOverviewAlternative}
                />
            </Fragment>
        );
    }

    private separator (alternative: boolean): JSX.Element {
        const { lastOfCircuit, done, circuitColor } = this.props;
        const tintColor = done ? colors.orangeLight : (alternative ? ALTERNATIVE_COLOR : circuitColor);
        const separatorLineStyle = done ?
            styles.separatorLineDone :
            (alternative ? styles.separatorLineAlternative : { backgroundColor: circuitColor });

        return !lastOfCircuit ? (
            <View style={styles.separatorWrapper}>
                <View style={styles.separatorContainer}>
                    <View style={[styles.separatorTopLine, separatorLineStyle]} />
                    <FadeInImage
                        containerCustomStyle={styles.separatorImageContainer}
                        source={ICON_ANCHOR}
                        tintColor={tintColor}
                    />
                    <View style={[styles.separatorBottomLine, separatorLineStyle]} />
                </View>
            </View>
        ) : null;
    }

    private content (alternative: boolean = false): JSX.Element {
        const { animSlideUp, animSlideLeft } = this.state;
        const { containerStyle, done } = this.props;

        const firstAnimationStyle = {
            transform: [{
                translateY: animSlideUp.interpolate({
                    inputRange: [0, 1],
                    outputRange: [viewportHeight - HEADER_MAX_HEIGHT, 0]
                })
            }]
        };
        const secondAnimationStyle = {
            transform: [{
                translateX: animSlideLeft.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                })
            }]
        };
        const itemStyle = [
            styles.container,
            containerStyle,
            secondAnimationStyle,
            done ? { opacity: ITEM_DONE_OPACITY } : {}
        ];
        return (
            <Animated.View style={firstAnimationStyle}>
                <Animated.View style={itemStyle}>
                    <Animated.View style={styles.contentContainer}>
                        { this.infos(alternative) }
                        { this.backgroundBorder(alternative) }
                        { this.switch }
                    </Animated.View>
                    { this.separator(alternative) }
                </Animated.View>
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        const { data } = this.props;
        if (!data) {
            return null;
        }

        const { exercise } = data;
        return !!exercise?.alternativeExercise ? (
            <CardFlip
                containerStyle={styles.container}
                flipDirection={'horizontal'}
                flipDuration={CARD_FLIP_DURATION}
                ref={this.cardFlipRef}
            >
                { this.content(false) }
                { this.content(true) }
            </CardFlip>
        ) : (
            <View style={styles.container}>
                { this.content(false) }
            </View>
        );
    }
}

export default WorkoutOverviewExercise;
