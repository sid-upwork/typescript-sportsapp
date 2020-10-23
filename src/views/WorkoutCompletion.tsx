import React, { Component } from 'react';
import { View, Animated, Easing, Text, Image } from 'react-native';
import { IProgressionState } from '../store/modules/progression';
import { IWorkoutProgressionState, IExerciseHistoryState, ISetHistoryState, IWorkoutHistoryPost } from '../store/modules/workoutProgression';
import { convertSecondsToTimeLabel } from '../utils/date';
import { getFormattedDuration } from '../utils/workout';
import {fetchProgressionProgramPercentage, getTotalReps} from '../utils/progression';
import { getFormatedSetWeight } from '../utils/units';
import { IMedia } from '../types/media';
import { ICircuit, ICircuitExercise } from '../types/workout';
import { ETooltipIds } from '../store/modules/tutorials';
import { IScreenProps } from '../index';
import I18n from '../utils/i18n';
import chroma from 'chroma-js';

import { AnimatedCircularProgress } from 'react-native-circular-progress';
import Confetti from 'react-native-confetti';
import LinearGradient from 'react-native-linear-gradient';

import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import SharedButton from '../components/SharedButton';
import SharedParallaxView from '../components/SharedParallaxView';
import SharedVerticalTitle from '../components/SharedVerticalTitle';
import Tooltip from '../components/Tooltip';

import colors from '../styles/base/colors.style';
import { viewportHeight } from '../styles/base/metrics.style';
import styles, {
    BACKGROUND_SHAPE_TOP,
    COMPLETION_SIZE,
    GRADIENT_COLORS,
    STARS_IMAGE_HEIGHT
} from '../styles/views/WorkoutCompletion.style';

import BackgroundShape from '../static/WorkoutCompletion/completion-background_shape.svg';

interface IProps {
    navigation: any;
    screenProps: IScreenProps;
}

interface IState {
    animBottomContentOpacity: Animated.Value;
    animBottomContentTransform: Animated.Value;
    animLogoTransform: Animated.Value;
    animStarsContentOpacity: Animated.Value;
    animStarsContentTransform: Animated.Value;
    animTopContentOpacity: Animated.Value;
    animTopContentTransform: Animated.Value;
    progressionPercentage: number;
}

const REPS_ICON = require('../static/icons/dumbbell-full.png');
const STOPWATCH_ICON = require('../static/icons/stopwatch.png');
const STARS_IMAGE = require('../static/WorkoutCompletion/stars.png');
const NULI_IMAGE = require('../static/shared/logo-nuli.png');

class WorkoutCompletion extends Component<IProps, IState> {

    private confettiRef: React.RefObject<Confetti>;
    private confettiTimer: any;
    private data: {
        progression: IProgressionState,
        workoutHistoryPost: IWorkoutHistoryPost,
        workoutProgression: IWorkoutProgressionState,
        influencerPicture: IMedia
    };

    constructor (props: IProps) {
        super(props);
        this.state = {
            animBottomContentOpacity: new Animated.Value(0),
            animBottomContentTransform: new Animated.Value(0),
            animLogoTransform: new Animated.Value(0),
            animStarsContentOpacity: new Animated.Value(0),
            animStarsContentTransform: new Animated.Value(0),
            animTopContentOpacity: new Animated.Value(0),
            animTopContentTransform: new Animated.Value(0),
            progressionPercentage: 0
        };
        this.data = props.navigation.getParam('data');
        this.confettiRef = React.createRef();
    }

    public componentDidMount (): void {
        this.fetch();
        this.animate();
        this.confettiTimer = setTimeout(() => {
            this.confettiRef?.current?.startConfetti();
        }, 600);
    }

    public componentWillUnmount (): void {
        clearTimeout(this.confettiTimer);
    }

    public async fetch (): Promise<void> {
        const programId = this.data?.progression?.program?.id;
        const percentageResponse = await fetchProgressionProgramPercentage(programId);
        this.setState({ progressionPercentage: percentageResponse.percentage });
    }

    private getAnimation (opacityValue: Animated.Value, transformValue: Animated.Value, delay: number = 0): Animated.CompositeAnimation {
        const opacityParams = {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: 16,
            bounciness: 6,
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
            animBottomContentOpacity,
            animBottomContentTransform,
            animStarsContentOpacity,
            animStarsContentTransform,
            animTopContentOpacity,
            animTopContentTransform
        } = this.state;

        const initialDelay = 350;

        Animated.parallel([
            this.getAnimation(animTopContentOpacity, animTopContentTransform, initialDelay),
            this.getAnimation(animBottomContentOpacity, animBottomContentTransform, initialDelay + 120),
            this.getAnimation(animStarsContentOpacity, animStarsContentTransform, initialDelay + 320)
        ]).start();
    }

    private onClose = (): void => {
        this.props.navigation.goBack();
    }

    private isWorkoutFromProgram (): boolean {
        return !!this.data?.workoutProgression?.workoutHistory?.programWeekId;
    }

    private imageBackground (animatedValue: Animated.Value): JSX.Element {
        const animatedStyle = [
            {
                transform: [
                    {
                        scale: animatedValue.interpolate({
                            inputRange: [-viewportHeight, 0, viewportHeight],
                            outputRange: [1.5, 1, 1.2]
                        })
                    }
                ]
            }
        ];
        const logoScrollAnimatedStyle = [
            {
                transform: [
                    {
                        scale: animatedValue.interpolate({
                            inputRange: [-viewportHeight, 0, viewportHeight],
                            outputRange: [0.8, 1, 0.6]
                        })
                    }
                ]
            }
        ];
        return (
            <View style={styles.fullSpace}>
                <Animated.View style={[styles.fullSpace, animatedStyle]}>
                    <FadeInImage
                        source={{ uri: this.data.workoutProgression.currentWorkout.fullscreenImage.url }}
                        containerCustomStyle={[styles.fullSpace, styles.imageBackground]}
                        duration={300}
                        initialZoom={1.6}
                        zoomDuration={1700}
                    />
                </Animated.View>
                <Animated.View style={logoScrollAnimatedStyle}>
                    <FadeInImage source={NULI_IMAGE} resizeMode={'contain'} style={styles.nuliImage} />
                </Animated.View>
                <LinearGradient
                    angle={160}
                    colors={GRADIENT_COLORS}
                    pointerEvents={'none'}
                    style={styles.fullSpace}
                    useAngle={true}
                />
            </View>
        );
    }

    private vectorBackground (animatedValue: Animated.Value): JSX.Element {
        const { animStarsContentOpacity, animStarsContentTransform } = this.state;
        const vectorAnimatedStyle = {
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [-viewportHeight, 0, viewportHeight],
                        outputRange: [viewportHeight * 0.75, 0, -viewportHeight * 1.25],
                        extrapolate: 'clamp'
                    })
                },
                {
                    scale: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [1, 1.5],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const starsAnimatedStyle = {
            opacity: animStarsContentOpacity,
            transform: [
                {
                    translateY: animStarsContentTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                    })
                }
            ]
        };
        const starsScrollAnimatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight / 3],
                outputRange: [1, 0],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [-viewportHeight, 0, viewportHeight],
                        outputRange: [viewportHeight, 0, -viewportHeight],
                        extrapolate: 'clamp'
                    })
                },
                {
                    translateX: animatedValue.interpolate({
                        inputRange: [-viewportHeight, 0, viewportHeight],
                        outputRange: [0, 0, -20],
                        extrapolate: 'clamp'
                    })
                },
                {
                    scale: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [1, 1.5],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const starsTop = this.isWorkoutFromProgram() ?
            BACKGROUND_SHAPE_TOP - STARS_IMAGE_HEIGHT - 20 :
            BACKGROUND_SHAPE_TOP - STARS_IMAGE_HEIGHT + 30;

        return (
            <View style={styles.fullSpace}>
                <Animated.View style={[styles.fullSpace, starsAnimatedStyle]}>
                    <Animated.View style={starsScrollAnimatedStyle}>
                        <FadeInImage
                            resizeMode={'contain'}
                            style={[styles.stars, { top: starsTop }]}
                            source={STARS_IMAGE}
                        />
                    </Animated.View>
                </Animated.View>
                <Animated.View style={[styles.fullSpace, vectorAnimatedStyle]}>
                    <BackgroundShape
                        style={styles.backgroundShape}
                        width={styles.backgroundShape.width}
                        height={styles.backgroundShape.height}
                    />
                </Animated.View>
            </View>
        );
    }

    private parallaxBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <View style={styles.fullSpace}>
                { this.imageBackground(animatedValue) }
                { this.vectorBackground(animatedValue) }
            </View>
        );
    }

    private get topContent (): JSX.Element {
        const { animTopContentOpacity, animTopContentTransform } = this.state;

        const duration = convertSecondsToTimeLabel(this.data?.workoutHistoryPost?.duration);
        const totalReps = getTotalReps(this.data?.workoutProgression?.workoutHistory);
        const topContainerHeight = this.isWorkoutFromProgram() ?
            BACKGROUND_SHAPE_TOP - 50 : BACKGROUND_SHAPE_TOP + 85;

        const animatedStyle = [
            {
                opacity: animTopContentOpacity,
                transform: [
                    {
                        translateX: animTopContentTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 0]
                        })
                    }
                ]
            }
        ];

        return (
            <Animated.View style={animatedStyle}>
                <View style={[styles.topContainer, { height: topContainerHeight }]}>
                    <Text style={styles.title}>{I18n.t('workoutCompletion.title')}</Text>
                    <Text style={styles.subtitle}>{I18n.t('workoutCompletion.subtitle')}</Text>
                    <View>
                        <View style={styles.statContainer}>
                            <View style={styles.statIconContainer}>
                                <Image
                                    source={STOPWATCH_ICON}
                                    style={styles.statIcon}
                                />
                            </View>
                            <View style={styles.statContainerInner}>
                                <Text style={styles.statLabel}>{ I18n.t('workoutCompletion.totalDuration') }</Text>
                                <Text style={styles.statValue}>{ duration }</Text>
                            </View>
                        </View>
                        <View style={styles.statContainer}>
                            <View style={styles.statIconContainer}>
                                <Image
                                    source={REPS_ICON}
                                    style={styles.statIcon}
                                />
                            </View>
                            <View style={styles.statContainerInner}>
                                <Text style={styles.statLabel}>{ I18n.t('workoutCompletion.totalReps') }</Text>
                                <Text style={styles.statValue}>{ totalReps }</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>
        );
    }

    private get bottomContent (): JSX.Element {
        const { animBottomContentOpacity, animBottomContentTransform } = this.state;
        const workoutTitle = this.data?.workoutProgression?.currentWorkout?.title;
        const animatedStyle = [
            {
                opacity: animBottomContentOpacity,
                transform: [
                    {
                        translateY: animBottomContentTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [100, 0]
                        })
                    }
                ]
            }
        ];
        const titleStyle = [
            styles.workoutTitle,
            this.isWorkoutFromProgram() ? styles.workoutTitleLong : {}
        ];

        return (
            <Animated.View style={animatedStyle}>
                { this.programInfo }
                <View style={styles.bottomContent}>
                    <Text style={titleStyle}>{ workoutTitle }</Text>
                    { this.summary }
                    <SharedButton
                        onPress={this.onClose}
                        style={styles.closeButton}
                        text={I18n.t('global.close')}
                    />
                </View>
            </Animated.View>
        );
    }

    private get programInfo (): JSX.Element {
        const { progressionPercentage } = this.state;

        if (!this.isWorkoutFromProgram()) {
            return null;
        }

        const weekPosition = this.data?.progression?.week?.position + 1;
        const programName = this.data?.progression?.program?.title;
        const influencerPicture = this.data?.influencerPicture?.thumbnailUrl;
        const verticalTitleHeight = 80;

        return (
            <View style={styles.programInfo}>
                <View style={styles.programInfoInner}>
                    <View style={styles.programInfoInnerTop}>
                        <View style={styles.completionContainer}>
                            <Text style={styles.completion}>{progressionPercentage}%</Text>
                        </View>
                        <AnimatedCircularProgress
                            backgroundColor={colors.pinkLight}
                            duration={0}
                            fill={progressionPercentage}
                            lineCap={'round'}
                            rotation={0}
                            size={COMPLETION_SIZE}
                            style={styles.completionCircle}
                            tintColor={colors.violetDark}
                            width={10}
                        />
                        <Tooltip
                            containerStyle={styles.tooltip}
                            gradientType={'blue'}
                            screenProps={this.props.screenProps}
                            tooltipId={ETooltipIds.workoutCompletionPercentage}
                        />
                    </View>
                    <View style={styles.programInfoInnerBottom}>
                        <View style={styles.verticalTitleContainer}>
                            <SharedVerticalTitle
                                height={verticalTitleHeight}
                                textStyle={styles.weekPosition}
                                innerStyleHorizontal={{ alignItems: 'center' }}
                                innerStyleVertical={{ height: verticalTitleHeight }}
                                title={I18n.t('myProgram.week', { number: weekPosition })}
                                width={30}
                            />
                        </View>
                        <View style={styles.programNameContainer}>
                            <Text style={styles.programName}>{ programName }</Text>
                        </View>
                    </View>
                </View>
                <FadeInImage source={{ uri: influencerPicture }} style={styles.influencerPicture} />
            </View>
        );
    }

    private get summary (): JSX.Element {
        if (!this.data || !this.data.progression || !this.data.workoutProgression) {
            return null;
        }

        const exerciseTitles: JSX.Element[] = [];
        this.data.workoutProgression?.currentWorkout?.circuits?.forEach((circuit: ICircuit, circuitIndex: number) => {
            circuit.circuitExercises?.forEach((circuitExercise: ICircuitExercise, circuitExerciseIndex: number) => {
                let numberOfSets: number = 1;

                const exerciseHistory = this.data.workoutProgression?.workoutHistory?.exerciseHistories.find(
                    (element: IExerciseHistoryState) => element.exerciseId === circuitExercise.exercise.id
                );

                if (exerciseHistory) {
                    numberOfSets = exerciseHistory.setHistories.length;
                }

                exerciseTitles.push(
                    <View key={`workout-completion-circuitExercise-tite-${circuitIndex}-${circuitExerciseIndex}`} style={styles.summaryRow}>
                        <Text numberOfLines={1} style={styles.exerciseTitle}>
                            { numberOfSets } x { circuitExercise.exercise.title }
                        </Text>
                    </View>
                );
            });
        });

        const bestSets: JSX.Element[] = [];
        const exerciseColors = chroma.scale([colors.orange, colors.pink]).colors(exerciseTitles.length);

        for (let circuitExerciseIndex = 0; circuitExerciseIndex < exerciseTitles.length; circuitExerciseIndex++) {
            const exerciseHistory = this.data.workoutProgression?.workoutHistory?.exerciseHistories?.find(
                (element: IExerciseHistoryState) => element.position === circuitExerciseIndex
            );

            let bestSetValue: string = '-';

            // Get value to display
            if (!!exerciseHistory && exerciseHistory.setHistories?.length > 0) {
                let bestSet: ISetHistoryState;

                // Get set with highest weight
                exerciseHistory.setHistories?.forEach((set: ISetHistoryState, setIndex: number) => {
                    if (setIndex === 0) {
                        bestSet = set;
                    } else if (set?.weight > bestSet?.weight) {
                        bestSet = set;
                    } else if (set?.weight === bestSet?.weight && set?.scored > bestSet?.scored) {
                        bestSet = set;
                    }
                });

                if (exerciseHistory.type === 'reps') {
                    if (!bestSet?.weight) {
                        // Bodyweight
                        bestSetValue = bestSet?.scored + ' ' + I18n.t('workout.reps');
                    } else {
                        bestSetValue = getFormatedSetWeight(bestSet?.weight as number) + ' x ' + bestSet?.scored;
                    }
                } else {
                    const duration = getFormattedDuration(bestSet?.scored);
                    if (!bestSet?.weight) {
                        // Bodyweight
                        bestSetValue = duration;
                    } else {
                        bestSetValue = getFormatedSetWeight(bestSet?.weight as number) + ' x ' + duration;
                    }
                }
            }

            // Create element to render
            const containerStyle = [styles.summaryRow, styles.exerciseBestSet, { backgroundColor: exerciseColors[circuitExerciseIndex] }];

            bestSets.push(
                <View key={`workout-completion-best-set-value-${circuitExerciseIndex}`} style={containerStyle}>
                    <Text style={styles.exerciseBestSetValue}>{ bestSetValue }</Text>
                </View>
            );
        }

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryBorder} />
                <View style={styles.summaryColumnContainer}>
                    <View style={[styles.summaryColumn, styles.summaryColumnLeft]}>
                        <Text style={styles.summaryColumnTitle}>{ I18n.t('workoutCompletion.exercise') }</Text>
                        { exerciseTitles }
                    </View>
                    <View style={styles.summaryColumn}>
                        <Text style={styles.summaryColumnTitle}>{ I18n.t('workoutCompletion.bestSet') }</Text>
                        { bestSets }
                    </View>
                </View>
            </View>
        );
    }

    public render (): JSX.Element {
        const confettiColors = [colors.pink, colors.orange, '#FFCD57', colors.violetDark];
        return (
            <View style={[styles.fullSpace, styles.container]}>
                <SharedParallaxView
                    contentContainerStyle={styles.scrollViewContentContainer}
                    renderBackground={this.parallaxBackground}
                >
                    { this.topContent }
                    { this.bottomContent }
                </SharedParallaxView>
                <Confetti
                    bsize={1.5}
                    colors={confettiColors}
                    confettiCount={50}
                    duration={1100}
                    ref={this.confettiRef}
                    size={1.25}
                    timeout={5}
                />
                <Header
                    gradientAlwaysVisible={true}
                    mode={'closeWhite'}
                />
            </View>
        );
    }
}

export default WorkoutCompletion;
