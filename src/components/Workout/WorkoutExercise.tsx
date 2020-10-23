import React, { PureComponent, Fragment, RefObject } from 'react';
import { Animated, Easing, TextInput, View, TouchableOpacity, Text } from 'react-native';
import { ETooltipIds } from '../../store/modules/tutorials';
import { ICircuitExercise, ISet } from '../../types/workout';
import delays from '../../utils/animDelays';
import { isIOS } from '../../utils/os';
import { getCircuitType } from '../../utils/workout';
import { IScreenProps } from '../../index';

import BlurWrapper from '../../components/BlurWrapper';
import EllipsisSeparator from '../../components/EllipsisSeparator';
import FadeInImage from '../../components/FadeInImage';
import Tooltip from '../Tooltip';
import TouchableScale from '../../components/TouchableScale';
import WorkoutExerciseTable from './WorkoutExerciseTable';
import WorkoutExerciseSetTimer from './WorkoutExerciseSetTimer';

import { viewportWidth } from '../../styles/base/metrics.style';
import { SETS_CONTAINER_HEIGHT } from '../../styles/components/Workout/WorkoutExerciseTable.style';
import styles, {
    HIGHLIGHT_COLOR
} from '../../styles/components/Workout/WorkoutExercise.style';

import BackgroundLineVector from '../../static/Workout/background-line.svg';
import IconPlayColored from '../../static/icons/video/play-colored.svg';

const LINK_ICON = require('../../static/Workout/link-empty.png');

interface IProps {
    data: ICircuitExercise;
    hide?: boolean;
    hideInfos?: boolean;
    index: number;
    hScrollInputRange: number[];
    hScrollValue: Animated.Value;
    lastDoneSetIndex: number;
    onBlur?: (exerciseIndex: number, setIndex: number) => Promise<void>;
    onCheckboxPress?: (exerciseIndex: number) => void;
    onSetFocus?: (
        exerciseSetIndex: number,
        columnIndex: number,
        inputWeightRef: RefObject<TextInput>,
        inputTargetRef: RefObject<TextInput>,
        inputTimeRef: RefObject<TouchableOpacity>
    ) => void;
    onSetSubmitEditing?: (exerciseIndex: number, fromButton?: boolean, fromTimer?: boolean) => void;
    onVideoLaunch?: (videoId: string, exerciseTitle: string) => void;
    renderTooltips: boolean;
    screenProps: IScreenProps;
    sets: ISet[];
    updateSetState: (exerciseIndex: number, exerciseSetIndex: number, set: ISet) => void;
    workoutExerciseSetTimerRefs: any[];
}

interface IState {
    animContainerOpacity: Animated.Value;
    animContainerTransform: Animated.Value;
    animInfosOpacity: Animated.Value;
}

class WorkoutExercise extends PureComponent<IProps, IState> {

    private isTime: boolean;

    constructor (props: IProps) {
        super(props);
        this.isTime = props.data?.type === 'time';
        this.state = {
            animContainerOpacity: new Animated.Value(1),
            animContainerTransform: new Animated.Value(1),
            animInfosOpacity: new Animated.Value(1)
        };
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { hide, hideInfos } = this.props;
        if (hide !== prevProps.hide) {
            this.animate(!hide);
        }
        if (hideInfos !== prevProps.hideInfos) {
            this.animateInfos(!hideInfos);
        }
    }

    private animate (animateIn?: boolean): void {
        const { animContainerOpacity, animContainerTransform } = this.state;
        const toValue = animateIn ? 1 : 0;
        const duration = 250;
        const delay = animateIn ? delays.views.workout.videoStopUIDelay - 150 : 250;
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animContainerOpacity, {
                    toValue,
                    duration,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animContainerTransform, {
                    toValue,
                    speed: 14,
                    bounciness: 7,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateInfos (animateIn?: boolean): void {
        const { animInfosOpacity } = this.state;
        const toValue = animateIn ? 1 : 0;
        const duration = animateIn ? 200 : 50;
        Animated.timing(animInfosOpacity, {
            toValue,
            duration,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private onTimerComplete (setIndex: number): void {
        const { index, onSetFocus, onSetSubmitEditing } = this.props;
        onSetFocus && onSetFocus(setIndex, 2, null, null, null);
        onSetSubmitEditing && onSetSubmitEditing(index, false, true);
    }

    private get line (): JSX.Element {
        const { hScrollInputRange, hScrollValue } = this.props;
        const hScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            transform: [
                {
                    translateX: hScrollValue.interpolate({
                        inputRange: hScrollInputRange,
                        outputRange: [viewportWidth * 0.5, 0, -viewportWidth * 0.35],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};
        return (
            <Animated.View style={[styles.fullSpace, hScrollAnimatedStyle]} pointerEvents={'none'}>
                <BackgroundLineVector
                    style={styles.backgroundLineContainer}
                    height={styles.backgroundLineContainer.height}
                    width={styles.backgroundLineContainer.width}
                />
            </Animated.View>
        );
    }

    private get ellipsis (): JSX.Element {
        const { hScrollInputRange, hScrollValue } = this.props;
        const hScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            transform: [
                {
                    translateX: hScrollValue.interpolate({
                        inputRange: hScrollInputRange,
                        outputRange: [viewportWidth * 0.5, 0, -viewportWidth * 0.35],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};
        return (
            <Animated.View style={[styles.fullSpace, hScrollAnimatedStyle]} pointerEvents={'none'}>
                <EllipsisSeparator
                    containerTextStyle={styles.ellipsisContainer}
                    textStyle={styles.ellipsisText}
                />
            </Animated.View>
        );
    }

    private get linkIcons (): JSX.Element {
        const { data } = this.props;
        const image = (
            <FadeInImage
                containerCustomStyle={styles.halfLinkIcon}
                disableAnimation={true}
                source={LINK_ICON}
                tintColor={HIGHLIGHT_COLOR}
            />
        );
        const circuitType = getCircuitType(data?.circuitLength);
        const circuitLabel = circuitType ? (
            <View style={styles.linkCircuitLabelContainer}>
                <Text style={styles.linkCircuitLabel} numberOfLines={1}>{ circuitType }</Text>
            </View>
        ) : null;
        const leftIcon = !data?.isFirstOfCircuit ? (
            <View style={[styles.halfLinkIconContainer, styles.halfLinkIconContainerLeft]}>
                { image }
            </View>
        ) : null;
        const rightIcon = !data?.isLastOfCircuit ? (
            <View style={[styles.halfLinkIconContainer, styles.halfLinkIconContaineRight]}>
                { image }
                { circuitLabel }
            </View>
        ) : null;
        return leftIcon || rightIcon ? (
            <View style={styles.fullSpace} pointerEvents={'none'}>
                { leftIcon }
                { rightIcon }
            </View>
        ) : null;
    }

    private get videoLauncher (): JSX.Element {
        const { animInfosOpacity } = this.state;
        const { data: { exercise }, hScrollInputRange, hScrollValue, onVideoLaunch, renderTooltips, screenProps } = this.props;

        if (!exercise?.video) {
            return null;
        }

        const onPress = () => {
            onVideoLaunch && onVideoLaunch(exercise?.video?.fileName || '', exercise?.title || '');
        };

        const hScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            transform: [
                {
                    translateX: hScrollValue.interpolate({
                        inputRange: hScrollInputRange,
                        outputRange: [viewportWidth * 0.8, 0, -viewportWidth * 0.8],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};
        const animatedStyle = { opacity: animInfosOpacity };

        const tooltip = renderTooltips ? (
            <Tooltip
                containerStyle={styles.tooltip}
                gradientType={'blue'}
                screenProps={screenProps}
                tooltipId={ETooltipIds.workoutExerciseVideo}
            />
        ) : null;

        return (
            <Animated.View style={[styles.videoLauncherContainer, hScrollAnimatedStyle, animatedStyle]}>
                <TouchableScale
                    style={styles.playIcon}
                    onPress={onPress}
                    activeOpacity={0.9}
                >
                    <BlurWrapper
                        type={'vibrancy'}
                        blurType={'light'}
                        blurAmount={12}
                        style={[styles.fullSpace, styles.playIconBlur]}
                        blurStyle={styles.playIconBlurIOS}
                        fallbackStyle={styles.playIconBlurAndroid}
                    />
                    <IconPlayColored style={styles.fullSpace} />
                    { tooltip }
                </TouchableScale>
            </Animated.View>
        );
    }

    private get title (): JSX.Element {
        const { animInfosOpacity } = this.state;
        const { data, hScrollInputRange, hScrollValue } = this.props;
        const nameHScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            transform: [
                {
                    translateX: hScrollValue.interpolate({
                        inputRange: hScrollInputRange,
                        outputRange: [viewportWidth * 0.35, 0, -viewportWidth * 0.4],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};
        const infoHScrollAnimatedStyle = hScrollInputRange && hScrollValue ? {
            transform: [
                {
                    translateX: hScrollValue.interpolate({
                        inputRange: hScrollInputRange,
                        outputRange: [viewportWidth * 0.35, 0, -viewportWidth * 0.35],
                        extrapolate: 'clamp'
                    })
                }
            ]
        } : {};
        const animatedStyle = { opacity: animInfosOpacity };

        const info = data?.exercise?.info;
        const exerciseInfo = info ? (
            <Animated.Text style={[styles.exerciseInfo, infoHScrollAnimatedStyle]}>{ info }</Animated.Text>
        ) : null;

        return (
            <Animated.View style={[styles.titleContainer, animatedStyle]}>
                <Animated.Text style={[styles.exerciseName, nameHScrollAnimatedStyle]} numberOfLines={4}>{ data?.exercise?.title }</Animated.Text>
                { exerciseInfo }
            </Animated.View>
        );
    }

    private get timer (): JSX.Element {
        const { data, lastDoneSetIndex, sets, index, workoutExerciseSetTimerRefs } = this.props;
        if (!this.isTime) {
            return;
        }
        const setIndex = lastDoneSetIndex >= 0 ? lastDoneSetIndex + 1 : 0;
        const currentSetData = sets && sets[setIndex];
        if (!currentSetData) {
            return;
        }

        const countdown = !currentSetData?.toFailure;

        return (
            <WorkoutExerciseSetTimer
                key={`workour-exercise-${data.id}-set-timer-${lastDoneSetIndex}`}
                countdown={countdown}
                duration={countdown ? currentSetData?.reps : 0}
                onComplete={() => this.onTimerComplete(setIndex)}
                ref={(ref: any) => { workoutExerciseSetTimerRefs[index] = ref; }}
            />
        );
    }

    private get content (): JSX.Element {
        const { animContainerOpacity, animContainerTransform } = this.state;
        const {
            data, index, lastDoneSetIndex, sets, updateSetState, renderTooltips,
            onBlur, onCheckboxPress, onSetFocus, onSetSubmitEditing, screenProps
        } = this.props;

        if (!data) {
            return null;
        }

        // Animating the transform prop can apparently mess with touch events on Android...
        // https://github.com/software-mansion/react-native-gesture-handler/issues/1000
        // Opacity animation only for that buggy platform then!
        const animatedStyle = {
            opacity: animContainerOpacity.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 1]
            }),
            transform: isIOS ? [
                {
                    translateY: animContainerTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [SETS_CONTAINER_HEIGHT, 1]
                    })
                }
            ] : []
        };

        return (
            <Fragment>
                <View style={styles.fullSpace}>
                    {/* { this.line } */}
                    {/* { this.ellipsis } */}
                    { this.linkIcons }
                </View>
                <View style={styles.flexContentContainer}>
                    { this.videoLauncher }
                    <Animated.View style={animatedStyle}>
                        { this.title }
                        { this.timer }
                        <WorkoutExerciseTable
                            data={data}
                            exerciseIndex={index}
                            lastDoneSetIndex={lastDoneSetIndex}
                            onBlur={onBlur}
                            onCheckboxPress={onCheckboxPress}
                            onSetFocus={onSetFocus}
                            onSetSubmitEditing={onSetSubmitEditing}
                            renderTooltips={renderTooltips}
                            screenProps={screenProps}
                            sets={sets}
                            updateSetState={updateSetState}
                        />
                    </Animated.View>
                </View>
            </Fragment>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={[styles.fullSpace, styles.container]}>
                { this.content }
            </View>
        );
    }
}

export default WorkoutExercise;
