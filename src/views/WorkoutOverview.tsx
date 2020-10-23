import React, { Component, Fragment, RefObject } from 'react';
import { Text, View, Animated, TouchableOpacity, Easing, Alert, Image } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { logEvent } from '../utils/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { IReduxState } from '../store/reducers';
import { connect } from 'react-redux';
import {
    IWorkoutProgressionState,
    IWorkoutHistoryState,
    setWorkoutHistory,
    setTargetedTrainingId,
    setWorkoutOrigin,
    resetWorkoutHistory,
    setCurrentWorkout,
    ISetHistoryState
} from '../store/modules/workoutProgression';
import { IProgressionState } from '../store/modules/progression';
import { resetWorkoutDuration } from '../store/modules/workoutDuration';
import { setWorkoutOverviewScrollHintSeen, setWorkoutOverviewVideoSeen, ETooltipIds } from '../store/modules/tutorials';
import delays from '../utils/animDelays';
import { getFormattedDate } from '../utils/date';
import I18n, { getLanguageFromLocale } from '../utils/i18n';
import { isAndroid } from '../utils/os';
import { completeWorkoutManually, isExerciseComplete, fetchWorkout, checkOngoingWorkout } from '../utils/progression';
import { getCircuitType } from '../utils/workout';
import { ENDPOINTS } from '../utils/endpoints';
import { IWorkout, ICircuit, TExerciseTypes, ISet, ICircuitExercise } from '../types/workout';
import { TTargetedTrainingId } from '../components/Training/TargetedTrainingItem';
import { TWorkoutOrigin } from '../utils/navigation';
import { IWorkoutHistory } from '../types/progression';
import { get, merge, orderBy, reject, debounce } from 'lodash';
import { confirmPopup } from '../utils/confirmPopup';
import { IScreenProps } from '../index';
import api from '../utils/api';
import chroma from 'chroma-js';

import LinearGradient from 'react-native-linear-gradient';

import BlurWrapper from '../components/BlurWrapper';
import EllipsisSeparator from '../components/EllipsisSeparator';
import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import SharedParallaxView from '../components/SharedParallaxView';
import Sidebar from '../components/Sidebar';
import Tooltip from '../components/Tooltip';
import TouchableScale from '../components/TouchableScale';
import VideoPlayer, { IVideoPlayerProps } from '../components/VideoPlayer';
import WorkoutOverviewExercise from '../components/WorkoutOverviewExercise';
import SharedVerticalTitle from '../components/SharedVerticalTitle';

import colors from '../styles/base/colors.style';
import { viewportWidth, viewportHeight, isAndroidNotch } from '../styles/base/metrics.style';
import { ITEM_HEIGHT } from '../styles/components/WorkoutOverviewExercise.style';
import styles, {
    IMAGE_GRADIENT_COLORS,
    CHECK_TITLE_WIDTH,
    CHECK_TITLE_HEIGHT,
    CHECK_TITLE_HEIGHT_DONE,
    CIRCUIT_LABEL_TITLE_WIDTH,
    DONE_COLOR,
    DONE_OPACITY,
    FADE_EFFECT_COLORS,
    FADE_EFFECT_LOCATIONS
} from '../styles/views/WorkoutOverview.style';

import BackgroundShape from '../static/shared/rounded_background-white.svg';
import ButtonStartImage from '../static/WorkoutOverview/button-start.svg';
import ButtonRestartImage from '../static/WorkoutOverview/button-restart.svg';
import IconPlayColored from '../static/icons/video/play-colored.svg';

interface IProps {
    navigation: any;
    progression: IProgressionState;
    resetWorkoutDuration: () => void;
    resetWorkoutHistory: () => Promise<void>;
    screenProps: IScreenProps;
    setCurrentWorkout: (workout: IWorkout) => void;
    setTargetedTrainingId: (targetedTrainingId: TTargetedTrainingId) => void;
    setWorkoutHistory: (workoutHistory: IWorkoutHistoryState) => void;
    setWorkoutOrigin: (workoutOrigin: TWorkoutOrigin) => void;
    setWorkoutOverviewScrollHintSeen: (seen: boolean) => void;
    // setWorkoutOverviewVideoSeen: (seen: boolean) => void;
    workoutOverviewScrollHintSeen: boolean;
    workoutProgression: IWorkoutProgressionState;
    // workoutOverviewVideoSeen: boolean;
}

interface IState {
    currentExerciseIndex: number;
    pauseBackgroundVideo: boolean;
    workoutCompleted: boolean;
    animTitleOpacity: Animated.Value;
    animTitleTransform: Animated.Value;
    animAlreadyTextOpacity: Animated.Value;
    animAlreadyTextTransform: Animated.Value;
    animButtonsOpacity: Animated.Value;
    animButtonsTransform: Animated.Value;
    animEllipsisOpacity: Animated.Value;
    animEllipsisTransform: Animated.Value;
    animPlayOpacity: Animated.Value;
    animPlayTransform: Animated.Value;
}

const CHECKMARK_ICON = require('../static/icons/checkmark.png');
const REPEAT_ICON = require('../static/icons/repeat.png');

class WorkoutOverview extends Component<IProps, IState> {

    private callbackForTraining: () => void;
    private fromProgram: boolean;
    private isVL: boolean = false;
    private isOngoingWorkout: boolean = false;
    private mounted: boolean = false;
    private parallaxRef: RefObject<SharedParallaxView>;
    private position: number;
    private scrollHintEndTimeout: any;
    private scrollHintStartTimeout: any;
    private workout: IWorkout;
    private workoutHistory: IWorkoutHistory;
    private workoutOrigin: TWorkoutOrigin;
    private targetedTrainingId: TTargetedTrainingId;

    constructor (props: IProps) {
        super(props);
        this.isVL = getLanguageFromLocale(I18n.locale).isVerticalLanguage;
        this.workout = this.initWorkout();
        this.workoutHistory = props.navigation.getParam('workoutHistory');
        this.fromProgram = props.navigation.getParam('fromProgram');
        this.position = props.navigation.getParam('position') || 0; // TODO: allow undefined/null on server side
        this.workoutOrigin = props.navigation.getParam('workoutOrigin');
        this.targetedTrainingId = props.navigation.getParam('targetedTrainingId');
        this.callbackForTraining = props.navigation.getParam('callbackForTraining');
        this.parallaxRef = React.createRef();
        // isOngoingWorkout depends on others properties so we put it at the end
        this.isOngoingWorkout = checkOngoingWorkout(this.workout?.id, this.position, this.workoutOrigin);
        this.state = {
            currentExerciseIndex: props?.workoutProgression?.currentExerciseIndex || 0,
            pauseBackgroundVideo: false,
            workoutCompleted: this.workoutHistory && !this.isOngoingWorkout,
            animTitleOpacity: new Animated.Value(0),
            animTitleTransform: new Animated.Value(0),
            animAlreadyTextOpacity: new Animated.Value(0),
            animAlreadyTextTransform: new Animated.Value(0),
            animButtonsOpacity: new Animated.Value(0),
            animButtonsTransform: new Animated.Value(0),
            animEllipsisOpacity: new Animated.Value(0),
            animEllipsisTransform: new Animated.Value(0),
            animPlayOpacity: new Animated.Value(0),
            animPlayTransform: new Animated.Value(0)
        };
    }

    public async componentDidMount (): Promise<void> {
        this.mounted = true;
        this.animate(() => {
            this.animateScrollHint();
        });
        this.workout = await this.cleanSetsData(this.workout);

        logEvent('workout_overview_display', {
            workoutId: this.workout.id,
            workoutOrigin: this.workoutOrigin,
            workoutTitle: this.workout?.title,
            targetedTrainingId: this.targetedTrainingId
        });

        // Show video tutorial on first view display (disabled for now)
        // if (!this.props.workoutOverviewVideoSeen) {
        //     const onDidBlur = () => {
        //         this.props.setWorkoutOverviewVideoSeen(true);
        //         this.props.screenProps.toastManagerRef?.current?.openToast({
        //             message: I18n.t('tutorials.tutorialVideoEndMessage'),
        //             type: 'info'
        //         });
        //     };

        //     try {
        //         const tutorialsResponse = await api.get(ENDPOINTS.tutorials + 'workout-overview');
        //         const video = tutorialsResponse?.data?.videos[0];

        //         if (!!video) {
        //             const player: IVideoPlayerProps = {
        //                 onDidBlur,
        //                 thumbnailSource: video.thumbnailUrl,
        //                 videoSource: video.url
        //             };
        //             this.props.navigation.navigate('Video', { player });
        //         } else {
        //             // Fallback to scroll hint if need be
        //             this.animateScrollHint();
        //         }
        //     } catch (error) {
        //         console.log(error);
        //         // Fallback to scroll hint if need be
        //         this.animateScrollHint();
        //     }
        // } else {
        //     // Don't hint for scroll if the tutorial video is playing otherwise it won't be seen
        //     this.animateScrollHint();
        // }
    }

    public componentWillUnmount (): void {
        this.mounted = false;
        clearTimeout(this.scrollHintStartTimeout);
        clearTimeout(this.scrollHintEndTimeout);
    }

    private initWorkout = (): IWorkout => {
        let workout = this.cleanWorkoutData(this.props?.navigation?.getParam('workout', {}));
        if (workout.id === this.props?.workoutProgression?.currentWorkout?.id) {
            // If this workout is in workoutProgression, we don't want to take data from the server
            workout = this.props.workoutProgression.currentWorkout;
        }
        return workout;
    }

    private resetWorkout = async (): Promise<void> => {
        try {
            let workout = await fetchWorkout(this.workout?.id);
            if (workout) {
                workout = this.cleanWorkoutData(workout);
                workout = await this.cleanSetsData(workout);
                if (workout) {
                    this.workout = workout;
                }
            }
        } catch (error) {
            crashlytics().recordError(error);
            console.log(error);
        }
    }

    private onDidFocus = (): void => {
        this.setState({ pauseBackgroundVideo: false });
    }

    private onWillBlur = (): void => {
        this.setState({ pauseBackgroundVideo: true });
    }

    private onScrollThresholdReached = (passed: boolean): void => {
        this.setState({ pauseBackgroundVideo: passed });
    }

    private async cleanSetsData (workout: IWorkout): Promise<IWorkout> {
        // TODO: with Promise.all we need to have a double loop, would it be better to process requests 1 by 1 with a single loop ?
        try {
            let summaryRequestArray = [];
            workout?.circuits?.forEach((circuit: ICircuit) => {
                circuit.circuitExercises?.forEach((circuitExercise: ICircuitExercise) => {
                    // Prepare exercise summary request
                    const exerciseId: string = circuitExercise.exercise?.id;
                    const exerciseType: TExerciseTypes = circuitExercise.type;
                    // store in array
                    // TODO: (05/02/20: limit param is not working: https://trello.com/c/6WaheCR8/586-api-history-sets-exerciseid-type-param-limit2-not-working)
                    const endpoint = ENDPOINTS.historySets + '/' + exerciseId + '/' + exerciseType +
                        '?order[createdAt]=desc&limit=' + circuitExercise.sets.length;
                    summaryRequestArray.push(api.get(endpoint));
                });
            });
            // Promise all request array
            // https://stackoverflow.com/a/46024590
            // Values will be in order of the Promises passed, regardless of completion order
            const responses = await Promise.all(summaryRequestArray.map((p: any) => p.catch((e: any) => e)));
            if (responses && Array.isArray(responses)) {
                // Add weight to all sets on workout object
                let globalIndex: number = 0;
                this.workout?.circuits?.forEach((circuit: ICircuit) => {
                    circuit.circuitExercises?.forEach((circuitExercises: ICircuitExercise) => {
                        if (responses[globalIndex]?.data && Array.isArray(responses[globalIndex]?.data)) {
                            let setHistories: ISetHistoryState[] = responses[globalIndex]?.data;
                            if (setHistories.length > 0) {
                                setHistories = orderBy(setHistories, 'position', 'asc');
                                circuitExercises.sets?.forEach((set: ISet, setIndex: number) => {
                                    if (setHistories[setIndex]) {
                                        set.hasHistoryValue = true;
                                        set.repsHistoryValue = setHistories[setIndex].scored;
                                        set.weightHistoryValue = setHistories[setIndex].weight as number;
                                    }
                                });
                            }
                        }
                        globalIndex += 1;
                    });
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            return workout;
        }
    }

    private cleanWorkoutData (workout: IWorkout): IWorkout {
        // Remove circuits that don't contain any exercises
        let sortedCircuits: ICircuit[] = reject(workout?.circuits, (circuit: ICircuit) => {
            return !circuit?.circuitExercises?.length;
        });
        // Then order them as well as their exercises by position...
        sortedCircuits = orderBy(sortedCircuits, 'position', 'asc');
        sortedCircuits.forEach((circuit: ICircuit, circuitIndex: number) => {
            // And add a few new properties at exercises' level
            let sortedCircuitExercises = orderBy(circuit.circuitExercises, 'position', 'asc');
            sortedCircuitExercises.forEach((_: ICircuitExercise, circuitExerciseIndex: number) => {
                sortedCircuitExercises[circuitExerciseIndex].circuitLength = sortedCircuitExercises.length;
                sortedCircuitExercises[circuitExerciseIndex].isFirstOfCircuit = circuitExerciseIndex === 0;
                sortedCircuitExercises[circuitExerciseIndex].isLastOfCircuit = circuitExerciseIndex + 1 === sortedCircuitExercises.length;
            });
            sortedCircuits[circuitIndex].circuitExercises = sortedCircuitExercises;
        });
        workout.circuits = sortedCircuits;
        return workout;
    }

    private hasBackgroundVideo (): boolean {
        const { workoutCompleted } = this.state;
        const backgroundVideo = this.workout?.backgroundVideo;
        return !!backgroundVideo && !workoutCompleted;
    }

    private getCircuitColor (numberOfExercises: number): string {
        if (numberOfExercises === 1) {
            return colors.violetDark;
        }
        const colorScale = chroma.scale([colors.violetDark, colors.pink]);
        const step = 0.2;
        const range = numberOfExercises >= 4 ? 4 * step : (numberOfExercises - 1) * step;
        return colorScale(range);
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
            speed: 12,
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

    private animate (callback: () => void): void {
        const {
            animTitleOpacity,
            animTitleTransform,
            animAlreadyTextOpacity,
            animAlreadyTextTransform,
            animButtonsOpacity,
            animButtonsTransform,
            animEllipsisOpacity,
            animEllipsisTransform,
            animPlayOpacity,
            animPlayTransform
        } = this.state;

        const initialDelay = delays.views.workoutOverview.header;

        Animated.parallel([
            this.getAnimation(animTitleOpacity, animTitleTransform, initialDelay),
            this.getAnimation(animAlreadyTextOpacity, animAlreadyTextTransform, initialDelay + 80),
            this.getAnimation(animEllipsisOpacity, animEllipsisTransform, initialDelay + 160),
            this.getAnimation(animButtonsOpacity, animButtonsTransform, initialDelay + 240),
            this.getAnimation(animPlayOpacity, animPlayTransform, initialDelay + 320)
        ]).start(() => {
            callback && callback();
        });
    }

    private animateScrollHint (): void {
        const { workoutOverviewScrollHintSeen } = this.props;
        const scrollTo = this.parallaxRef?.current?.scrollTo;

        if (!scrollTo || workoutOverviewScrollHintSeen) {
            return;
        }

        // Visually hint user that she can scroll down
        this.scrollHintStartTimeout = setTimeout(() => {
            const currentScrollPosition = this.parallaxRef?.current?.scrollPosition;
            // Make sure that user hasn't scrolled by now
            if (currentScrollPosition === 0) {
                scrollTo({ y: viewportHeight * 0.25 });
                this.scrollHintEndTimeout = setTimeout(() => {
                    scrollTo({ y: 0 });
                    this.props.setWorkoutOverviewScrollHintSeen(true);
                }, isAndroid ? 1000 : 650);
            } else {
                this.props.setWorkoutOverviewScrollHintSeen(true);
            }
        }, delays.views.workoutOverview.scrollHintStart);
    }

    private onAlreadyPress = () => {
        const { screenProps, progression, workoutProgression } = this.props;

        if (!this.workout || !this.workout.id) {
            screenProps?.toastManagerRef?.current?.openToast && screenProps?.toastManagerRef?.current?.openToast({
                close: () => null,
                message: I18n.t('app.fetchError'),
                type: 'error'
            });
        }

        const confirmWorkoutDone = async () => {
            screenProps?.toastManagerRef?.current?.openToast({
                message: I18n.t('app.toastUpdateMessage'),
                type: 'info'
            });

            try {
                await completeWorkoutManually(
                    this.workout?.id,
                    this.position,
                    progression,
                    this.workoutOrigin,
                    workoutProgression,
                    this.workout?.title
                );

                if (this.mounted) {
                    this.setState({ workoutCompleted: true }, () => {
                        screenProps?.toastManagerRef?.current?.openToast({
                            message: I18n.t('app.toastUpdateSuccessMessage'),
                            type: 'info'
                        });
                        this.callbackForTraining && this.callbackForTraining();
                    });
                }
            } catch (error) {
                console.log(error);
                screenProps?.toastManagerRef?.current?.openToast({
                    message: I18n.t('app.fetchError'),
                    type: 'error'
                });
            }
        };

        confirmPopup(confirmWorkoutDone);
    }

    private imageBackground (animatedValue: Animated.Value): JSX.Element {
        const { pauseBackgroundVideo } = this.state;
        const backgroundVideo = this.workout?.backgroundVideo;
        const animatedStyle = [{
            transform: [{
                scale: animatedValue.interpolate({
                    inputRange: [-viewportHeight, 0],
                    outputRange: [1.5, 1],
                    extrapolate: 'clamp'
                })
            }, {
                translateY: animatedValue.interpolate({
                    inputRange: [0, viewportHeight],
                    outputRange: [0, -viewportHeight * 0.6],
                    extrapolate: 'clamp'
                })
            }]
        }];
        const animatedImageBlurStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.35],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            })
        };
        const media = this.hasBackgroundVideo() ? (
            <VideoPlayer
                background={true}
                controls={false}
                hideLoader={true}
                loop={true}
                paused={pauseBackgroundVideo}
                playOnMount={true}
                thumbnailSource={get(this.workout, 'fullscreenImage.url', backgroundVideo?.thumbnailUrl)}
                videoSource={backgroundVideo?.url}
            />
        ) : (
            <FadeInImage
                source={{ uri: get(this.workout, 'fullscreenImage.url') }}
                containerCustomStyle={[styles.fullSpace, styles.imageBackground]}
                loaderColor={'rgba(255, 255, 255, 0.65)'}
                duration={300}
                initialZoom={1.6}
                zoomDuration={1700}
            />
        );
        const blurView = !isAndroid ? (
            <Animated.View style={[styles.fullSpace, animatedImageBlurStyle]}>
                <BlurWrapper
                    type={'vibrancy'}
                    blurType={'light'}
                    blurAmount={10}
                    style={styles.fullSpace}
                />
            </Animated.View>
        ) : null;

        return (
            <View style={styles.fullSpace}>
                <Animated.View style={[styles.fullSpace, animatedStyle]}>
                    { media }
                </Animated.View>
                <LinearGradient
                    colors={IMAGE_GRADIENT_COLORS}
                    style={styles.imageGradient}
                    pointerEvents={'none'}
                />
                { blurView }
            </View>
        );
    }

    private ellipsisBackground (animatedValue: Animated.Value): JSX.Element {
        const { animEllipsisOpacity, animEllipsisTransform } = this.state;
        const animatedStyle = {
            opacity: animEllipsisOpacity,
            transform: [{
                translateX: animEllipsisTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [viewportWidth, 0]
                })
            },
            {
                translateY: animatedValue.interpolate({
                    inputRange: [0, viewportHeight],
                    outputRange: [0, -viewportHeight * 0.75]
                })
            }]
        };
        return (
            <Animated.View style={[styles.ellipsisBackground, animatedStyle]}>
                <EllipsisSeparator textStyle={styles.textEllipsisBackground} />
            </Animated.View>
        );
    }

    private vectorBackground (animatedValue: Animated.Value): JSX.Element {
        const animatedVectorTransform = {
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
                        outputRange: [1, 5],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        return(
            <Animated.View style={[styles.fullSpace, animatedVectorTransform]}>
                <BackgroundShape style={styles.backgroundShape} />
            </Animated.View>
        );
    }

    private animatedSidebar (animatedValue: Animated.Value): JSX.Element {
        const { workoutCompleted } = this.state;
        const animatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [viewportHeight * 0.25, viewportHeight],
                        outputRange: [-viewportHeight, 0],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const sidebarStyle = [
            styles.sidebar,
            workoutCompleted ? styles.sidebarDone : {},
            animatedStyle
        ];
        return (
            <View style={styles.sidebarContainer}>
                <Animated.View style={sidebarStyle} />
            </View>
        );
    }

    private parallaxBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const { workoutCompleted } = this.state;
        const overlayStyle = [
            styles.fullSpace,
            styles.overlayDone
        ];
        const overlay = workoutCompleted ? <Animated.View style={overlayStyle} /> : null;

        return (
            <View style={styles.fullSpace}>
                { this.imageBackground(animatedValue) }
                {/* { this.ellipsisBackground(animatedValue) } */}
                { overlay }
                { this.vectorBackground(animatedValue) }
                { this.animatedSidebar(animatedValue) }
            </View>
        );
    }

    private bottomFadeEffect (animatedValue: Animated.Value): JSX.Element {
        // The height returned for Android devices with a notch is wrong and messes with the display
        // https://github.com/facebook/react-native/issues/23693
        if (isAndroidNotch) {
            return;
        }
        const scrollAnimatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.25],
                outputRange: [1, 0],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [-viewportHeight, 0, viewportHeight],
                        outputRange: [-viewportHeight + viewportHeight * 0.5, 0, viewportHeight],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        return (
            <Animated.View style={[styles.fullSpace, scrollAnimatedStyle]} pointerEvents={'none'}>
                <LinearGradient
                    colors={FADE_EFFECT_COLORS}
                    locations={FADE_EFFECT_LOCATIONS}
                    pointerEvents={'none'}
                    style={styles.bottomFadeEffect}
                />
            </Animated.View>
        );
    }

    private videoLauncher (animatedValue: Animated.Value): JSX.Element {
        const { animPlayOpacity, animPlayTransform } = this.state;
        const video = this.workout && this.workout.video;

        if (!video) {
            return null;
        }

        const onPress = () => {
            const player: IVideoPlayerProps = {
                thumbnailSource: video.thumbnailUrl,
                videoSource: video.url
            };
            this.props.navigation.navigate('Video', { player });
            logEvent('workout_overview_intro_video_display', { videoId: video.fileName || '' });
        };

        const scrollAnimatedContainerStyle = {
            transform: [{
                scale: animatedValue.interpolate({
                    inputRange: [-viewportHeight, 0],
                    outputRange: [0.35, 1],
                    extrapolate: 'clamp'
                })
            }, {
                translateY: animatedValue.interpolate({
                    inputRange: [-viewportHeight, 0, viewportHeight],
                    outputRange: [-viewportHeight + viewportHeight * 0.75, 0, viewportHeight - viewportHeight * 0.8],
                    extrapolate: 'clamp'
                })
            }]
        };
        const animatedStyle = {
            opacity: animPlayOpacity,
            transform: [{
                scale: animPlayTransform
            }]
        };

        return (
            <Animated.View style={[styles.videoViewerContainer, scrollAnimatedContainerStyle]} pointerEvents={'box-none'}>
                <Animated.View style={[styles.videoViewerInnerContainer, animatedStyle]} pointerEvents={'box-none'}>
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
                        />
                        <IconPlayColored style={styles.fullSpace} />
                    </TouchableScale>
                </Animated.View>
            </Animated.View>
        );
    }

    private alreadyCompleted (animatedValue: Animated.Value): JSX.Element {
        const { workoutCompleted } = this.state;
        const { animAlreadyTextOpacity, animAlreadyTextTransform } = this.state;
        const animatedStyle = {
            opacity: animAlreadyTextOpacity,
            transform: [{
                translateX: animAlreadyTextTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [120, 0]
                })
            }]
        };
        const scrollAnimatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.15, viewportHeight * 0.65],
                outputRange: [1, 1, 0],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [-viewportHeight, 0, viewportHeight],
                        outputRange: [-viewportHeight + viewportHeight * 0.75, 0, viewportHeight - viewportHeight * 1.25],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const containerStyle = [
            styles.alreadyCompletedContainer,
            workoutCompleted ? styles.alreadyCompletedContainerDone : {},
            animatedStyle
        ];
        const textStyle = [
            styles.alreadyCompletedText,
            workoutCompleted ? styles.alreadyCompletedTextDone : {},
            workoutCompleted && this.isVL ? styles.alreadyCompletedTextDoneVL : {}
        ];
        const checkIconContainerStyle = [
            styles.checkIconContainer,
            workoutCompleted ? styles.checkIconContainerDone : {}
        ];
        const checkIconContainerInnerStyle = [
            styles.checkIconContainerInner,
            workoutCompleted ? styles.checkIconContainerInnerDone : {}
        ];

        const completedLabel = I18n.t('workoutOverview.completed');
        const date = getFormattedDate(this.workoutHistory?.createdAt, 'll');
        const text = workoutCompleted ? `${completedLabel} ${date}` : I18n.t('workoutOverview.alreadyCompleted');

        const title = workoutCompleted && this.isVL ? (
            <View>
                <Text style={textStyle}>{ completedLabel }</Text>
                <Text style={textStyle}>{ date }</Text>
            </View>
        ) : (
            <SharedVerticalTitle
                height={workoutCompleted ? CHECK_TITLE_HEIGHT_DONE : CHECK_TITLE_HEIGHT}
                numberOfLines={2}
                innerStyle={styles.alreadyCompletedTextContainer}
                innerStyleVertical={styles.alreadyCompletedTextContainerVerticalLanguage}
                textStyle={textStyle}
                title={text}
                width={CHECK_TITLE_WIDTH}
            />
        );

        return (
            <Animated.View style={[styles.fullSpace, scrollAnimatedStyle]} pointerEvents={'box-none'}>
                <Animated.View style={containerStyle}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={this.onAlreadyPress}
                        style={styles.alreadyCompletedInner}
                        disabled={workoutCompleted}
                    >
                        { title }
                        <View style={checkIconContainerStyle}>
                            <View style={checkIconContainerInnerStyle}>
                                <Image source={CHECKMARK_ICON} style={styles.checkIcon} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Tooltip
                        containerStyle={styles.alreadyCompletedTooltip}
                        gradientType={'blue'}
                        screenProps={this.props.screenProps}
                        tooltipId={ETooltipIds.workoutOverviewQuickComplete}
                    />
                </Animated.View>
            </Animated.View>
        );
    }

    private mergeAlternatives (): void {
        if (!this.workout) {
            return;
        }
        const newWorkout = this.workout;
        newWorkout?.circuits?.forEach((circuit: ICircuit, circuitIndex: number) => {
            circuit?.circuitExercises?.forEach((circuitExercise: ICircuitExercise, circuitExerciseIndex: number) => {
                if (circuitExercise?.useAlternative) {
                    // Extract the alternative circuitExercise
                    const alternativeExercise = circuitExercise.exercise?.alternativeExercise;
                    if (alternativeExercise) {
                        // Merge the circuitExercise and the alternativeExercise
                        merge(this.workout.circuits[circuitIndex]?.circuitExercises[circuitExerciseIndex]?.exercise, alternativeExercise);
                    }
                }
                // Remove the alternative circuitExercise from the original object
                delete this.workout.circuits[circuitIndex]?.circuitExercises[circuitExerciseIndex]?.exercise?.alternativeExercise;
            });
        });
    }

    private onSwitchExercise = (circuitIndex: number, circuitExerciseIndex: number) => {
        if (this.workout.circuits[circuitIndex].circuitExercises[circuitExerciseIndex].useAlternative) {
            this.workout.circuits[circuitIndex].circuitExercises[circuitExerciseIndex].useAlternative = false;
        } else {
            this.workout.circuits[circuitIndex].circuitExercises[circuitExerciseIndex].useAlternative = true;
        }
    }

    private scrollViewForegroundChild = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <View style={styles.scrollViewInnerForegroundContainer} pointerEvents={'box-none'}>
                { this.bottomFadeEffect(animatedValue) }
                { this.alreadyCompleted(animatedValue) }
                { this.videoLauncher(animatedValue) }
            </View>
        );
    }

    private updateWorkoutProgression = (): void => {
        const { progression } = this.props;
        if (this.fromProgram && !progression?.week?.id) {
            crashlytics().recordError(new Error('Trying to create a workoutHistory from a program without a weekId'));
        }
        this.mergeAlternatives();
        // Create new workoutHistory
        const workoutHistory: IWorkoutHistoryState = {
            exerciseHistories: [],
            position: this.position ?? 0,
            programWeekId: this.fromProgram ? progression?.week?.id : undefined,
            totalReps: 0,
            workoutId: this.workout.id
        };
        this.props.setTargetedTrainingId(this.targetedTrainingId);
        this.props.setWorkoutHistory(workoutHistory);
        this.props.setWorkoutOrigin(this.workoutOrigin);
        this.props.setCurrentWorkout(this.workout);
    }

    private get buttons (): JSX.Element {
        const { screenProps } = this.props;
        const { workoutCompleted } = this.state;
        const isWorkoutCompleted = workoutCompleted;

        const navigateToWorkout = () => this.props.navigation.replace('Workout', {
            workout: this.workout,
            workoutOrigin: this.workoutOrigin,
            targetedTrainingId: this.targetedTrainingId
        });

        const reset = async (goToWorkout: boolean = false): Promise<void> => {
            try {
                if (goToWorkout) {
                    await this.props.resetWorkoutHistory();
                    this.updateWorkoutProgression();
                    navigateToWorkout();
                    return;
                } else {
                    screenProps?.toastManagerRef?.current?.openToast && screenProps?.toastManagerRef?.current?.openToast({
                        message: I18n.t('app.toastUpdateMessage'),
                        type: 'info'
                    });
                    // We want the latest data so we completely reset the workout
                    // We can not rely on navigation data because the user can come from the ongoing popup
                    // We can not do that on 'do it again' button otherwise th workout data may have change
                    await this.resetWorkout();
                    await this.props.resetWorkoutHistory();
                    this.isOngoingWorkout = false;
                }
                this.setState({ currentExerciseIndex: 0, workoutCompleted: false }, async () => {
                    if (!goToWorkout) {
                        screenProps?.toastManagerRef?.current?.openToast && screenProps?.toastManagerRef?.current?.openToast({
                            message: I18n.t('app.toastUpdateSuccessMessage'),
                            type: 'info'
                        });
                    }
                });
            } catch (error) {
                crashlytics().recordError(error);
                screenProps?.toastManagerRef?.current?.openToast && screenProps?.toastManagerRef?.current?.openToast({
                    message: I18n.t('app.fetchError'),
                    type: 'error'
                });
                console.log(error);
            }
        };

        // Ask for confirmation before restarting the workout over
        const confirmReset = () => {
            Alert.alert(
                I18n.t('workoutOverview.resetConfirm.title'),
                I18n.t('workoutOverview.resetConfirm.message'),
                [
                    {
                        text: I18n.t('global.cancel'),
                        style: 'cancel'
                    },
                    {
                        text: I18n.t('global.confirm'),
                        onPress: () => reset()
                    }
                ],
                { cancelable: false }
            );
        };

        const ongoingWorkout = () => {
            // Ask for confirmation because there is an other workout opened so it will be erased
            Alert.alert(
                I18n.t('workoutOverview.ongoingWorkout.title'),
                I18n.t('workoutOverview.ongoingWorkout.message'),
                [
                    {
                        text: I18n.t('global.cancel'),
                        style: 'cancel'
                    },
                    {
                        text: I18n.t('global.confirm'),
                        onPress: () => {
                            reset(true);
                        }
                    }
                ],
                { cancelable: false }
            );
        };

        let startText = '';
        let startFunction = undefined;

        if (!!this.props.workoutProgression?.currentWorkout) {
            // There is an ongoing workout
            if (this.isOngoingWorkout) {
                // The ongoing workout is the one we are trying to start
                startText = I18n.t('workoutOverview.continue');
                startFunction = () => navigateToWorkout();
            } else {
                // The ongoing workout is a different one
                startFunction = () => ongoingWorkout();

                if (isWorkoutCompleted) {
                    startText = I18n.t('workoutOverview.redo');
                } else {
                    startText = I18n.t('workoutOverview.start');
                }
            }
        } else {
            // There is no ongoing workout
            if (isWorkoutCompleted) {
                startText = I18n.t('workoutOverview.redo');
            } else {
                startText = I18n.t('workoutOverview.start');
            }
            startFunction = () => reset(true);
        }

        const restart = workoutCompleted || this.isOngoingWorkout ?
        <Fragment>
            <ButtonRestartImage style={styles.restartButtonContainer} />
            <TouchableOpacity
                style={styles.restartTextContainer}
                onPress={debounce(confirmReset, 1000, { 'leading': true, 'trailing': false })}
                activeOpacity={0.7}
            >
                <Image source={REPEAT_ICON} style={styles.restartIcon} />
            </TouchableOpacity>
        </Fragment> : null;

        const { animButtonsOpacity, animButtonsTransform } = this.state;
        const animatedStyle = {
            opacity: animButtonsOpacity,
            transform: [{
                translateY: animButtonsTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [viewportHeight, 0]
                })
            }]
        };
        const containerStyle = [
            styles.buttonsContainer,
            animatedStyle
        ];

        return (
            <Animated.View style={containerStyle} pointerEvents={'box-none'}>
                {restart}
                <ButtonStartImage style={styles.startButtonContainer} />
                <TouchableOpacity
                    style={styles.startTextContainer}
                    onPress={debounce(startFunction, 2000, { 'leading': true, 'trailing': false })}
                    activeOpacity={0.7}
                >
                    <Text style={styles.startText}>{startText}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    private parallaxForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const { workoutCompleted } = this.state;

        const gradientColors = workoutCompleted ? [
            chroma(DONE_COLOR).alpha(1).css(),
            chroma(DONE_COLOR).alpha(0).css()
        ] : null;
        return (
            <View style={styles.fullSpace} pointerEvents={'box-none'}>
                <Header
                    animatedValue={animatedValue}
                    gradientAlwaysVisible={true}
                    gradientColors={gradientColors}
                    mode={'backWhite'}
                    title={this.workout.title}
                />
            </View>
        );
    }

    private get title (): JSX.Element {
        const { workoutCompleted } = this.state;
        const containerStyle = [
            styles.titleContainer,
            workoutCompleted ? styles.titleContainerDone : {}
        ];
        const textStyle = [
            styles.title,
            workoutCompleted ? styles.titleDone : {}
        ];

        return (
            <View style={containerStyle}>
                <Text numberOfLines={4} style={textStyle}>
                    { this.workout.title }
                </Text>
            </View>
        );
    }

    private get description (): JSX.Element {
        const { workoutCompleted } = this.state;
        const { description } = this.workout;

        if (!!!description) {
            return null;
        }

        const containerStyle = [
            styles.descriptionContainer,
            workoutCompleted ? styles.descriptionContainerDone : {}
        ];
        const textStyle = [
            styles.description,
            workoutCompleted ? styles.descriptionDone : {}
        ];

        return (
            <View style={containerStyle}>
                <Text style={textStyle}>{ description }</Text>
            </View>
        );
    }

    private get content (): JSX.Element {
        const { animTitleOpacity, animTitleTransform, currentExerciseIndex, workoutCompleted } = this.state;
        const { navigation, workoutProgression, screenProps } = this.props;

        if (!this.workout?.circuits?.length) {
            return null;
        }

        let nbOfExercises = 0;
        let exerciseCount = 0;
        let circuitList = [];
        let index = 0;
        this.workout?.circuits?.forEach((circuit: ICircuit, circuitIndex: number) => {
            if (!circuit.circuitExercises?.length) {
                return;
            }
            const circuitLength = circuit.circuitExercises.length;
            const circuitColor = this.getCircuitColor(circuitLength);
            let exerciceList = [];
            nbOfExercises += circuitLength;
            circuit.circuitExercises?.map((circuitExercise: ICircuitExercise, circuitExerciseIndex: number) => {
                exerciseCount += 1;
                const exerciseDone = isExerciseComplete(circuitExercise, index, workoutProgression);
                const exerciseItem = (
                    <WorkoutOverviewExercise
                        active={index === currentExerciseIndex && !workoutCompleted}
                        circuitColor={circuitColor}
                        data={circuitExercise}
                        done={exerciseDone || workoutCompleted}
                        first={index === 0}
                        index={index}
                        key={`circuit-${circuit.id}-circuitIndex-${circuitIndex}-circuitExercise-${circuitExercise.id}-exerciseIndex-${circuitExerciseIndex}`}
                        last={exerciseCount === nbOfExercises}
                        lastOfCircuit={circuitExerciseIndex === circuitLength - 1}
                        navigation={navigation}
                        onSwitch={() => this.onSwitchExercise(circuitIndex, circuitExerciseIndex)}
                        screenProps={screenProps}
                    />
                );
                index += 1;
                exerciceList.push(exerciseItem);
            });
            const circuitIndicatorStyle = [
                styles.circuitLabelBorder,
                { backgroundColor: workoutCompleted ? chroma(DONE_COLOR).alpha(DONE_OPACITY).css() : circuitColor }
            ];
            const circuitIndicatorAnimatedStyle =  {
                opacity: animTitleOpacity,
                transform: [{
                    translateY: animTitleTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0]
                    })
                }]
            };
            const verticalTitleHeight = ITEM_HEIGHT * circuitLength;
            const fontSize = styles.circuitLabel.fontSize;
            const circuitIndicator = circuitLength > 1 ? (
                <Animated.View style={[styles.circuitIndicatorContainer, circuitIndicatorAnimatedStyle]}>
                    <View style={circuitIndicatorStyle} />
                    <View style={styles.circuitLabelContainer}>
                        <SharedVerticalTitle
                            fontSize={fontSize}
                            height={verticalTitleHeight}
                            rotateDirection={'clockwise'}
                            innerStyleHorizontal={{ alignItems: 'center', paddingTop: Math.round(fontSize * 0.25) }}
                            innerStyleVertical={{ justifyContent: 'center', height: verticalTitleHeight, marginLeft: -Math.round(fontSize * 0.25) }}
                            textStyle={[styles.circuitLabel, { color: workoutCompleted ? DONE_COLOR : circuitColor }]}
                            title={getCircuitType(circuitLength)}
                            width={CIRCUIT_LABEL_TITLE_WIDTH}
                        />
                    </View>
                </Animated.View>
            ) : null;
            circuitList.push((
                <View key={`circuit-${circuit.id}-circuitIndex-${circuitIndex}`}>
                    { circuitIndicator }
                    { exerciceList }
                </View>
            ));
        });

        const titleAnimatedStyle =  {
            opacity: animTitleOpacity,
            transform: [{
                translateY: animTitleTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                })
            }]
        };

        return (
            <View>
                <Animated.View style={titleAnimatedStyle}>
                    { this.title }
                    { this.description }
                </Animated.View>
                <View style={styles.listContainer}>
                    { circuitList }
                </View>
            </View>
        );
    }

    public render (): JSX.Element {
        const scrollView = this.workout ? (
            <SharedParallaxView
                contentContainerStyle={styles.scrollViewContentContainer}
                onScrollThresholdReached={this.hasBackgroundVideo() ? this.onScrollThresholdReached : undefined}
                ref={this.parallaxRef}
                renderBackground={this.parallaxBackground}
                renderScrollViewForegroundChild={this.scrollViewForegroundChild}
                renderForeground={this.parallaxForeground}
                scrollThreshold={viewportHeight / 3}
            >
                { this.content }
            </SharedParallaxView>
        ) : null;
        return (
            <Fragment>
                <NavigationEvents
                  onDidFocus={this.onDidFocus}
                  onWillBlur={this.onWillBlur}
                />
                <View style={[styles.fullSpace, styles.container]}>
                    <Sidebar hideImage={true}/>
                    { scrollView }
                    { this.buttons }
                </View>
                { !scrollView && <Header gradientAlwaysVisible={true} mode={'backWhite'} /> }
            </Fragment>
        );
    }
}

const mapStateToProps = (state: IReduxState) => {
    return {
        progression: state.progression,
        workoutOverviewScrollHintSeen: state.tutorials.workoutOverviewScrollHintSeen,
        workoutProgression: state.workoutProgression
        // workoutOverviewVideoSeen: state.tutorials.workoutOverviewVideoSeen
    };
};

export default connect(mapStateToProps, {
    resetWorkoutDuration,
    resetWorkoutHistory,
    setCurrentWorkout,
    setTargetedTrainingId,
    setWorkoutHistory,
    setWorkoutOrigin,
    setWorkoutOverviewScrollHintSeen
    // setWorkoutOverviewVideoSeen
})(WorkoutOverview);
