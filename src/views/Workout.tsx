import React, { Component, Fragment, RefObject } from 'react';
import {
    Alert,
    Animated,
    Easing,
    Keyboard,
    TextInput,
    View,
    ImageSourcePropType,
    NativeEventSubscription,
    BackHandler,
    TouchableOpacity
} from 'react-native';
import { withNavigation, NavigationEvents, StackActions, NavigationActions } from 'react-navigation';
import { logEvent } from '../utils/analytics';
import { connect } from 'react-redux';
import crashlytics from '@react-native-firebase/crashlytics';
import {
    IExerciseHistoryState,
    ISetHistoryState,
    addExerciseHistory,
    IWorkoutProgressionState,
    addSetsHistory,
    updateSetHistory,
    removeSetsHistory,
    resetWorkoutHistory,
    setCurrentExerciseIndex,
    setTotalReps,
    setWorkoutPaused,
    IWorkoutHistoryPost
} from '../store/modules/workoutProgression';
import { IProgressionState } from '../store/modules/progression';
import { IMedia } from '../types/media';
import { IReduxState } from '../store/reducers';
import { TTargetedTrainingId } from '../components/Training/TargetedTrainingItem';
import { TUnitsSystems } from '../types/user';
import { IWorkout, TExerciseTypes, ISet, ICircuit, ICircuitExercise } from '../types/workout';
import { TWorkoutOrigin } from '../utils/navigation';
import { IScreenProps } from '../index';
import { confirmPopup } from '../utils/confirmPopup';
import i18n from '../utils/i18n';
import { isIOS, isAndroid } from '../utils/os';
import { createHistoryWorkout, getTotalReps, getWorkoutCompletionPercentage } from '../utils/progression';
import { getSetWeightUnitSystem, PoundsToKilos } from '../utils/units';
import { setKeepAwake } from '../utils/keepAwake';
import { get } from 'lodash';

import CustomKeyboardButton from '../components/CustomKeyboardButton';
import ExerciseHistory from '../components/Popups/ExerciseHistory';
import HideKeyboardButton from '../components/HideKeyboardButton';
import VideoPlayer from '../components/VideoPlayer';
import WorkoutBottomButtons from '../components/Workout/WorkoutBottomButtons';
import WorkoutExercisesCarousel from '../components/Workout/WorkoutExercisesCarousel';
import WorkoutExerciseSetTimer from '../components/Workout/WorkoutExerciseSetTimer';
import WorkoutProgression from '../components/Workout/WorkoutProgression';
import WorkoutRest from '../components/Workout/WorkoutRest';
import WorkoutStartCountdown from '../components/Workout/WorkoutStartCountdown';
import WorkoutSummary from '../components/Popups/WorkoutSummary';
import WorkoutTimer from '../components/Workout/WorkoutTimer';

import { viewportHeight } from '../styles/base/metrics.style';
import { SUMMARY_POPUP_HEIGHT } from '../styles/components/Popups/WorkoutSummary.style';
import hideKeyboardButtonStyles from '../styles/components/HideKeyboardButton.style';
import styles from '../styles/views/Workout.style';
import { startSmartlookRecordRandomly } from '../utils/smartlook';

const DELAYED_RENDERING = 2000;
const VIDEO_OUT_DURATION = 450;

const CHECK_ICON = require('../static/icons/checkmark-thin.png');
const NEXT_ICON = require('../static/icons/next.png');

export interface INextExerciseData {
    circuitLength: number;
    nextExerciseIndex: number;
    nextSetIndex: number;
    restDuration: number;
    target: number;
    thumbnail: string;
    title: string;
    totalSets: number;
    type: TExerciseTypes;
}

interface IProps {
    addExerciseHistory: (newExerciseHistory: IExerciseHistoryState) => Promise<void>;
    addSetsHistory: (setsHistory: ISetHistoryState[], exercisePosition: number) => Promise<void>;
    autoTimer: boolean;
    influencerPicture: IMedia;
    navigation: any;
    preventSleepMode: boolean;
    progression: IProgressionState;
    removeSetsHistory: (setPositions: number[], exercisePosition: number) => Promise<void>;
    resetWorkoutHistory: () => Promise<void>;
    screenProps: IScreenProps;
    setCurrentExerciseIndex: (exerciseIndex: number) => void;
    setTotalReps: (totalReps: number) => void;
    setWorkoutPaused: (workoutPaused: boolean) => void;
    updateSetHistory: (setHistory: ISetHistoryState, index: number) => Promise<void>;
    workoutPaused: boolean;
    workoutProgression: IWorkoutProgressionState;
}

interface IState {
    animDelayedOpacity: Animated.Value;
    animVideoOpacity: Animated.Value;
    currentVisibleExerciseIndex: number;
    hideInfos: boolean;
    hideUI: boolean;
    keyboardButtonIcon: ImageSourcePropType;
    nextExerciseData: INextExerciseData;
    playExerciseVideo: boolean;
    renderCountdown: boolean;
    renderDelayedElements: boolean;
    renderRest: boolean;
    restParams: { duration: number, onOpen: () => void, onClose: () => void };
    showKeyboardButtons: boolean;
    sets: [ISet[]];
    upcomingExerciseData: INextExerciseData;
}

export class Workout extends Component<IProps, IState> {

    private backHandler: NativeEventSubscription;
    private delayedRenderingTimer: any;
    private circuitExercises: ICircuitExercise[];
    private initialExerciseIndex: number;
    private keyboardDidHideListener: any;
    private keyboardDidShowListener: any;
    private keyboardWillHideListener: any;
    private keyboardWillShowListener: any;
    private nextExerciseInitialized: boolean;
    private selectedColumnIndex: number;
    private selectedInputTargetRef: RefObject<TextInput>;
    private selectedInputTimeRef: RefObject<TouchableOpacity>;
    private selectedInputWeightRef: RefObject<TextInput>;
    private selectedSetIndex: number;
    private shouldOpenRest: boolean;
    private targetedTrainingId: TTargetedTrainingId;
    private videoPlayerRef: RefObject<VideoPlayer>;
    private workout: IWorkout;
    private workoutOrigin: TWorkoutOrigin;
    private workoutExercisesCarouselRef: RefObject<WorkoutExercisesCarousel>;
    private workoutExerciseSetTimerRefs: any[]; // Old style of reference required here to store in an array (no current)

    constructor (props: IProps) {
        super(props);
        // init class prop here because it can bu used in state initialization
        this.workout = props.navigation.getParam('workout', {});
        this.circuitExercises = this.flattenExercises();
        this.initialExerciseIndex = props?.workoutProgression?.currentExerciseIndex || 0;
        this.selectedColumnIndex = null;
        this.selectedInputTargetRef = null;
        this.selectedInputTimeRef = null;
        this.selectedInputWeightRef = null;
        this.selectedSetIndex = null;
        this.shouldOpenRest = true;
        this.nextExerciseInitialized = false;
        this.targetedTrainingId = props.navigation.getParam('targetedTrainingId');
        this.videoPlayerRef = React.createRef<VideoPlayer>();
        this.workoutOrigin = props.navigation.getParam('workoutOrigin');
        this.workoutExercisesCarouselRef = React.createRef<WorkoutExercisesCarousel>();
        this.workoutExerciseSetTimerRefs = new Array(this.circuitExercises.length);
        this.state = {
            animDelayedOpacity: new Animated.Value(0),
            animVideoOpacity: new Animated.Value(0),
            currentVisibleExerciseIndex: this.initialExerciseIndex,
            hideInfos: false,
            hideUI: false,
            keyboardButtonIcon: CHECK_ICON,
            playExerciseVideo: false,
            renderCountdown: true,
            renderDelayedElements: false,
            renderRest: false,
            restParams: {
                duration: undefined,
                onClose: undefined,
                onOpen: undefined
            },
            nextExerciseData: undefined,
            showKeyboardButtons: false,
            sets: [[]],
            upcomingExerciseData: undefined
        };

        props.setWorkoutPaused(true);
    }

    public componentDidMount (): void {
        // Manage hardware back button (this will overload the listener in AppDrawer)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        // Show custom button to hide keyboard at will
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow);
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.onKeyboardWillHide);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide);

        this.initSets(() => this.endCurrentSet(false));
        this.delayedRenderingTimer = setTimeout(() => {
            this.setState({ renderDelayedElements: true }, () => {
                this.animateDelayedElementsIn();
            });
        }, DELAYED_RENDERING);

        if (this.props.preventSleepMode) {
            setKeepAwake(true);
        }

        logEvent('workout_display', {
            targetedTrainingId: this.targetedTrainingId,
            programTitle: this.props.progression?.program?.title,
            workoutId: this.workout?.id,
            workoutOrigin: this.workoutOrigin,
            workoutTitle: this.workout?.title
        });

        //Should not use until the IOS issue is fixed
        //https://github.com/smartlook/smartlook-react-native-sdk/issues/18#issuecomment-654690399
        //startSmartlookRecordRandomly();
    }

    public componentWillUnmount (): void {
        Keyboard.dismiss();
        this.removeKeyboardEventListeners();
        clearTimeout(this.delayedRenderingTimer);

        if (this.props.preventSleepMode) {
            setKeepAwake(false);
        }

        this.backHandler.remove();
    }

    private handleBackPress = (): boolean => {
        const popupManager = this.props.screenProps.popupManagerRef?.current;

        // If there is a popup opened we dismiss it
        if (popupManager && popupManager.currentPopup && !popupManager.currentPopup?.preventOverlayDismissal) {
            popupManager.dismissPopup();
            return true;
        }

        // If a video is playing we close it, otherwise we ask for confirmation to leave the workout
        if (this.state.playExerciseVideo) {
            this.stopVideo();
        } else {
            Alert.alert(
                i18n.t('workout.quitTitle'),
                i18n.t('workout.quitMessage'),
                [
                    {
                        text: i18n.t('global.cancel'),
                        style: 'cancel'
                    },
                    {
                        text: i18n.t('global.confirm'),
                        onPress: () => this.props.navigation.goBack()
                    }
                ],
                { cancelable: false }
            );
        }

        return true;
    }

    private removeKeyboardEventListeners (): void {
        this.keyboardWillShowListener?.remove && this.keyboardWillShowListener?.remove();
        this.keyboardWillHideListener?.remove && this.keyboardWillHideListener?.remove();
        this.keyboardDidShowListener?.remove && this.keyboardDidShowListener?.remove();
        this.keyboardDidHideListener?.remove && this.keyboardDidHideListener?.remove();
    }

    private initSets (callback: any = undefined): void {
        const { workoutProgression } = this.props;
        if (!this.circuitExercises) {
            return;
        }
        let sets: [ISet[]] = [[]];
        this.circuitExercises.forEach((circuitExercise: ICircuitExercise, exerciseIndex: number) => {
            if (!circuitExercise.sets) {
                return;
            }
            sets[exerciseIndex] = [];
            const exerciseHistoryIndex = workoutProgression?.workoutHistory?.exerciseHistories?.findIndex((exerciseHistory: IExerciseHistoryState) =>
                exerciseHistory.position === exerciseIndex
            );
            circuitExercise.sets?.forEach((exerciseSet: ISet, exerciseSetIndex: number) => {
                // clone exerciseSet Object otherwise it's the reference which is passed
                sets[exerciseIndex][exerciseSetIndex] = { ...exerciseSet };

                if (exerciseHistoryIndex !== -1) {
                    const exerciseHistory = workoutProgression?.workoutHistory?.exerciseHistories[exerciseHistoryIndex];
                    const setHistoryIndex = exerciseHistory?.setHistories?.findIndex((setHistory: ISetHistoryState) =>
                        setHistory.position === exerciseSetIndex
                    );
                    if (setHistoryIndex !== -1) {
                        const setHistory = exerciseHistory?.setHistories[setHistoryIndex];
                        sets[exerciseIndex][exerciseSetIndex].reps = setHistory?.scored;
                        sets[exerciseIndex][exerciseSetIndex].weight = setHistory?.weight;
                    }
                }
            });
        });
        this.setState({ sets: sets }, () => {
            callback && callback();
        });
    }

    private updateSetState = (exerciseIndex: number, exerciseSetIndex: number, set: ISet): void => {
        let newSets = this.state.sets;
        const unitSystem: TUnitsSystems = getSetWeightUnitSystem();
        const weightCleaned = parseFloat(set?.weight?.toString().replace(',', '.'));
        if (!Number.isNaN(weightCleaned) && weightCleaned > 0) {
            set.weight = unitSystem === 'imperial' ? PoundsToKilos(weightCleaned as number) : weightCleaned;
        }
        const reps = parseInt(set?.reps.toString(), null);
        // reps minimum value must be an integer
        if (Number.isNaN(reps) || !Number.isInteger(reps) || set?.reps < 0) {
            // reps minimum value can not be 0
            set.reps = 1;
        }
        newSets[exerciseIndex][exerciseSetIndex] = set;
        this.setState({ sets: newSets });
    }

    private onDidFocus = (): void => {
    }

    private onWillBlur = (): void => {
        Keyboard.dismiss();
    }

    private onKeyboardWillShow = (): void => {
        this.setState({ showKeyboardButtons: true });
    }

    private onKeyboardWillHide = (): void => {
        this.setState({ showKeyboardButtons: false });
    }

    private onKeyboardDidShow = (): void => {
        // Android keyboard moves the entire view around, so it's a good idea to hide some misplaced elements
        // Also, the `keyboardWillShow`/`keyboardWillHide` events aren't called on Android
        if (isAndroid) {
            this.setState({ hideInfos: true, showKeyboardButtons: true });
        }
    }

    private onKeyboardDidHide = (): void => {
        this.selectedColumnIndex = null;
        this.selectedInputWeightRef = null;
        this.selectedInputTargetRef = null;
        this.selectedInputTimeRef = null;
        this.selectedSetIndex = null;
        if (isAndroid) {
            this.setState({ hideInfos: false, showKeyboardButtons: false });
        }
    }

    private onIndexChanged = (index: number): void => {
        // Reset set timer if needed
        this.workoutExerciseSetTimerRefs[this.state.currentVisibleExerciseIndex]?.reset();
        this.setState({ currentVisibleExerciseIndex: index });
    }

    private onTimerComplete = (): void => {
        confirmPopup(
            this.completeWorkout,
            null,
            i18n.t('workout.timeTrialFinishedTitle'),
            i18n.t('workout.timeTrialFinishedMessage')
        );
    }

    private launchVideo = (videoId: string, exerciseTitle: string): void => {
        Keyboard.dismiss();
        this.setState({ hideUI: true, playExerciseVideo: true }, () => {
            this.animateVideo(true);
            logEvent('workout_exercise_video_display', {
                videoId,
                exerciseTitle
            });
        });
    }

    private stopVideo = (): void => {
        this.setState({ hideUI: false }, () => {
            // On Android, the video player can't be animated (a black background will remain underneath it)
            // To smooth things out, we stop the video first and make sure it's no longer rendered
            if (isAndroid) {
                this.videoPlayerRef && this.videoPlayerRef?.current?.stopCompletely(VIDEO_OUT_DURATION);
            }
            this.animateVideo(false, () => {
                this.setState({ playExerciseVideo: false });
            });
        });
    }

    private openRest = (duration?: number, onOpen?: () => void, onClose?: () => void): void => {
        if (!duration || !Number.isInteger(duration) || duration <= 0) {
            return;
        }
        this.setState({
            renderRest: true,
            restParams: { duration, onOpen, onClose }
        });
    }

    private closeRest = (callback?: () => void): void => {
        this.setState({ renderRest: false }, () => {
            callback && callback();
        });
    }

    private startSetTimer = (exerciseIndex: number): void => {
        // Check if user has disabled feature in settings
        if (this.props.autoTimer === false) {
            return;
        }

        if (this.circuitExercises[exerciseIndex].type === 'time') {
            this.workoutExerciseSetTimerRefs[exerciseIndex]?.play();
        }
    }

    private animateDelayedElementsIn (): void {
        const { animDelayedOpacity } = this.state;
        Animated.sequence([
            Animated.delay(100), // Without a slight delay, everything is rendered immediately
            Animated.timing(animDelayedOpacity, {
                toValue: 1,
                duration: 350,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private animateVideo (animateIn?: boolean, callback?: () => void): void {
        const { animVideoOpacity } = this.state;
        Animated.sequence([
            // Animated.delay(animateIn ? 0 : 50),
            Animated.timing(animVideoOpacity, {
                toValue: animateIn ? 1 : 0,
                duration: animateIn ? 750 : VIDEO_OUT_DURATION,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            callback && callback();
        });
    }

    private async exerciseHistory (position: number): Promise<IExerciseHistoryState> {
        const currentExerciseHistory = this.getExerciseHistory(position);

        if (!currentExerciseHistory) {
            // Create exercise if it does not exist
            try {
                const currentCircuitExercise: ICircuitExercise = this.circuitExercises[position];
                const newExerciseHistory: IExerciseHistoryState = {
                    exerciseId: currentCircuitExercise.exercise.id,
                    circuitExercisesId: currentCircuitExercise.id,
                    position: position,
                    type: currentCircuitExercise.type,
                    setHistories: [],
                    setsType: currentCircuitExercise?.sets[0]?.toFailure ? 'failure' : 'regular'
                };
                await this.props.addExerciseHistory(newExerciseHistory);
                return newExerciseHistory;
            } catch (error) {
                console.log(error);
                return null;
            }
        } else {
            return currentExerciseHistory;
        }
    }

    private flattenExercises (): ICircuitExercise[] {
        const circuits = this.workout && this.workout.circuits;
        if (!circuits) {
            return [];
        }
        let circuitExercises = [];
        circuits.forEach((circuit: ICircuit) => {
            circuit.circuitExercises?.forEach((circuitExercise: ICircuitExercise) => {
                circuitExercises.push(circuitExercise);
            });
        });
        return circuitExercises;
    }

    private lastDoneSetIndex (exercisePosition: number): number {
        const exerciseHistory = this.getExerciseHistory(exercisePosition);
        const setHistories = exerciseHistory?.setHistories;

        if (!setHistories || setHistories.length === 0) {
            return undefined;
        } else {
            return setHistories.length - 1;
        }
    }

    private getExerciseHistory (exercisePosition: number): IExerciseHistoryState {
        const { workoutProgression } = this.props;
        const exerciseHistories = workoutProgression?.workoutHistory?.exerciseHistories;

        if (!exerciseHistories || exerciseHistories.length === 0 || exercisePosition < 0) {
            return null;
        }

        let currentExerciseIndex: number = -1;
        currentExerciseIndex = exerciseHistories.findIndex(
            (exercise: IExerciseHistoryState) => exercise.position === exercisePosition
        );

        if (currentExerciseIndex !== -1) {
            return exerciseHistories[currentExerciseIndex];
        } else {
            return null;
        }
    }

    private scrollToExercise (exerciseIndex: number): void {
        if (this.workoutExercisesCarouselRef?.current?.scrollToIndex) {
            this.workoutExercisesCarouselRef?.current?.scrollToIndex(exerciseIndex);
        }
    }

    private getNextExerciseData (exerciseIndex: number, currentCircuitExercise: ICircuitExercise, upcoming: boolean = false, recursiveCounter: number = 1):
    INextExerciseData {
        const exerciseHistory: IExerciseHistoryState = this.getExerciseHistory(exerciseIndex);
        let nextExerciseIndex: number = exerciseIndex;
        let nextSetIndex: number = undefined;
        let restDuration: number = 0;
        let setHistoriesLength: number = exerciseHistory?.setHistories && exerciseHistory.setHistories.length || 0;
        setHistoriesLength = upcoming ? setHistoriesLength + 1 : setHistoriesLength;
        const currentExerciseSetsLength: number = currentCircuitExercise?.sets && currentCircuitExercise.sets.length || 0;
        // If there is only 1 exercise in the circuit with all sets done, go to next exercise
        if (currentCircuitExercise?.circuitLength === 1 && setHistoriesLength === currentExerciseSetsLength) {
            nextExerciseIndex = exerciseIndex + 1;
            const lastDoneSetIndex = this.lastDoneSetIndex(nextExerciseIndex);
            nextSetIndex = lastDoneSetIndex >= 0 ? lastDoneSetIndex + 1 : 0;
            restDuration = currentCircuitExercise?.restAfterLastSet;
        } else if (currentCircuitExercise?.circuitLength === 1 && setHistoriesLength !== currentExerciseSetsLength) {
            const lastDoneSetIndex = this.lastDoneSetIndex(nextExerciseIndex);
            nextSetIndex = lastDoneSetIndex >= 0 ? lastDoneSetIndex + 1 : 0;
            restDuration = currentCircuitExercise?.restBetweenSets;
            if (upcoming) {
                nextSetIndex = nextSetIndex + 1;
            }
        } else if (currentCircuitExercise?.circuitLength > 1) {
            // if it's not the last circuit exercise or if all sets of the last circuit exercise are done, go to next exercise
            if (!currentCircuitExercise?.isLastOfCircuit ||
                currentCircuitExercise?.isLastOfCircuit && setHistoriesLength === currentExerciseSetsLength) {
                nextExerciseIndex = exerciseIndex + 1;
                const lastDoneSetIndex = this.lastDoneSetIndex(nextExerciseIndex);
                nextSetIndex = lastDoneSetIndex >= 0 ? lastDoneSetIndex + 1 : 0;
                if (!currentCircuitExercise?.isLastOfCircuit) {
                    restDuration = currentCircuitExercise?.restBetweenSets;
                } else {
                    restDuration = currentCircuitExercise?.restAfterLastSet;
                }
            } else {
                // It's the last circuit exercise and we need to go back to the first exercise
                nextExerciseIndex = exerciseIndex - (currentCircuitExercise?.circuitLength - 1);
                const lastDoneSetIndex = this.lastDoneSetIndex(nextExerciseIndex);
                nextSetIndex = lastDoneSetIndex >= 0 ? lastDoneSetIndex + 1 : 0;
                restDuration = currentCircuitExercise?.restBetweenSets;
            }
        }

        const nextExercise = this.circuitExercises[nextExerciseIndex];
        const nextExerciseLastDoneSetIndex = this.lastDoneSetIndex(nextExerciseIndex);

        // if all sets of the next exercise are done
        if (recursiveCounter && nextExerciseLastDoneSetIndex === (nextExercise?.sets?.length - 1)) {
            // if (exerciseCount === this.circuitExercises.length)
            if (recursiveCounter === this.circuitExercises.length) {
                return null;
            } else {
                recursiveCounter += 1;
                return this.getNextExerciseData(nextExerciseIndex, nextExercise, upcoming, recursiveCounter);
            }
        } else {
            return {
                nextExerciseIndex,
                nextSetIndex,
                restDuration,
                circuitLength: nextExercise?.circuitLength,
                target: nextExercise?.sets && nextExercise?.sets[nextSetIndex]?.reps || 0,
                thumbnail: nextExercise?.exercise?.image?.thumbnailUrl,
                title: nextExercise?.exercise?.title,
                totalSets: nextExercise?.sets?.length,
                type: nextExercise?.type
            };
        }
    }

    private endCurrentSet = (openRest: boolean = true, scrollTo: boolean = true): void => {
        const { currentVisibleExerciseIndex, renderRest } = this.state;
        const currentExercise = this.circuitExercises[currentVisibleExerciseIndex];

        // nextExerciseData
        const nextExerciseData = this.getNextExerciseData(currentVisibleExerciseIndex, currentExercise);
        const nextExercise = this.circuitExercises[nextExerciseData?.nextExerciseIndex];
        if (!nextExerciseData || !nextExercise) {
            return;
        }

        // upcomingExerciseData
        let upcomingExerciseData: INextExerciseData = this.state.upcomingExerciseData;

        // The function is called for initialization
        // there is a special condition for this
        if (!this.nextExerciseInitialized) {
            this.nextExerciseInitialized = true;
            if (currentExercise.sets.length === 1 || currentExercise.circuitLength > 1) {
                upcomingExerciseData = nextExerciseData;
                this.setState({ nextExerciseData, upcomingExerciseData });
                return;
            }
        }

        /**
         * If we want to scroll (we just validated an active set in a circuit)
         * OR If the circuit contains 1 exercise
         * -- we update the upcoming exercise
         * Otherwise we are out of the normal flow and the current visible exercise
         * will not be the good one.
         */
        if (scrollTo || nextExercise.circuitLength === 1) {
            upcomingExerciseData = this.getNextExerciseData(nextExerciseData.nextExerciseIndex, nextExercise, true);
        }

        const scrollToNext = (currentVisibleExerciseIndex !== nextExerciseData.nextExerciseIndex) && scrollTo ?
            () => {
                if (this.nextExerciseInitialized) {
                    this.props.setCurrentExerciseIndex(nextExerciseData.nextExerciseIndex);
                }
                this.scrollToExercise(nextExerciseData.nextExerciseIndex);
            } :
            undefined;

        const launchRestTimer = () => {
            this.openRest(nextExerciseData.restDuration, scrollToNext, () => this.startSetTimer(nextExerciseData.nextExerciseIndex));
        };

        this.setState({ nextExerciseData, upcomingExerciseData }, () => {
            if (nextExerciseData.restDuration && openRest && this.shouldOpenRest) {
                Keyboard.dismiss();
                if (renderRest) {
                    // If rest was minimized it might still be running
                    this.closeRest(launchRestTimer);
                } else {
                    launchRestTimer();
                }
            } else {
                // TODO: if no `openRest` focus next weight field (for kg exercises)/target (for bodyweight exercises) immediately
                // TODO: if we focus the next set, let's not hide the keyboard
                Keyboard.dismiss();
                scrollToNext && scrollToNext();
                this.startSetTimer(nextExerciseData.nextExerciseIndex);
            }
        });
    }

    private onSetFocus = (
        setIndex: number,
        columnIndex: number,
        inputWeightRef: RefObject<TextInput>,
        inputTargetRef: RefObject<TextInput>,
        inputTimeRef: RefObject<TouchableOpacity>
    ): void => {
        this.selectedSetIndex = setIndex;
        this.selectedColumnIndex = columnIndex;
        this.selectedInputWeightRef = inputWeightRef;
        this.selectedInputTargetRef = inputTargetRef;
        this.selectedInputTimeRef = inputTimeRef;

        // Update button icon (iOS only)
        if (isIOS) {
            if (this.selectedColumnIndex === 2) {
                this.setState({ keyboardButtonIcon: CHECK_ICON });
            } else {
                this.setState({ keyboardButtonIcon: NEXT_ICON });
            }
        }
    }

    private onBlur = async (exerciseIndex: number, setIndex: number): Promise<void> => {
        const { sets } = this.state;
        let exerciseHistory: IExerciseHistoryState = await this.exerciseHistory(exerciseIndex);
        if (exerciseHistory) {
            const setHistoryIndex = exerciseHistory.setHistories?.findIndex(
                (existingSetHistory: ISetHistoryState) => existingSetHistory.position === setIndex);

            if (setHistoryIndex !== -1) {
                let setHistory: ISetHistoryState = {
                    weight: sets[exerciseIndex][setHistoryIndex].weight,
                    scored: sets[exerciseIndex][setHistoryIndex].reps,
                    position: sets[exerciseIndex][setHistoryIndex].position
                };
                await this.props.updateSetHistory(setHistory, exerciseIndex);
            }
        }
    }

    private onSetSubmitEditing = (exerciseIndex: number, fromButton?: boolean, fromTimer?: boolean): void => {
        // This function is called when keyboard's done button is pressed
        // On Android we want it to be managed through the numeric keyboard's check button
        // (which is nothing but the 'done' button with a relevant style)
        // On iOS, the 'done' button on numeric keyboard is poorly positioned so we make it close the keyboard
        // and handle the logic but from a custom button
        // We want the following flow:
        // If the weight column is selected (index 0), go to the next field on press.
        // If the target column is selected (index 1)
        //   - If rest duration: complete set -> continue the regular flow
        //   - Else: focus next exercise/set relevant field (need to tap into onSetUpdate flow)

        if (isAndroid || (isIOS && fromButton)) {
            if (this.selectedColumnIndex === 1) {
                // Weight input is currently focused
                this.selectedInputTargetRef?.current?.focus(); // Reps input
                (this.selectedInputTimeRef?.current?.props as any)?.onPress(); // Time input
            } else if (this.selectedColumnIndex === 2) {
                // Target input is currently focused
                this.onSetUpdate(exerciseIndex);
            } else {
                Keyboard.dismiss();
            }
        } else if (fromTimer) {
            this.onSetUpdate(exerciseIndex);
        } else {
            Keyboard.dismiss();
        }
    }

    private onCheckboxPress = (exerciseIndex: number): void => {
        this.onSetUpdate(exerciseIndex, true);
    }

    private onSetUpdate = async (exercisePosition: number, fromCheckbox?: boolean): Promise<void> => {
        const { sets } = this.state;

        if (!Number.isInteger(this.selectedSetIndex) || this.selectedSetIndex < 0) {
            return;
        }

        try {
            const lastDoneSetIndex = this.lastDoneSetIndex(exercisePosition);

            // 1/ The user unchecks the first set - Need to do this at first for simplify logic after that
            if (fromCheckbox && this.selectedSetIndex === 0 && lastDoneSetIndex === 0) {
                await this.props.removeSetsHistory([this.selectedSetIndex], exercisePosition);
                return;
            }

            // 2/ The user completes one or several sets by clicking on the checkbox or on "done" button
            if (!lastDoneSetIndex || this.selectedSetIndex > lastDoneSetIndex) {
                if (this.selectedSetIndex === 0 || (this.selectedSetIndex - lastDoneSetIndex) === 1) {
                    // We complete only 1 set, we play animations if needed (rest modal or scrollTo)
                    await this.completeSets(exercisePosition, [this.selectedSetIndex]);
                    this.endCurrentSet();
                    return;
                } else {
                    // We complete more than 1 set, we do not play animations (rest modal or scrollTo)
                    let setPositions: number[] = [];
                    for (let i = 0; i < this.selectedSetIndex + 1; i++) {
                        setPositions.push(i);
                    }
                    await this.completeSets(exercisePosition, setPositions);
                    this.endCurrentSet(false, false);
                }
                return;
            } else if (fromCheckbox) {
                // 3/ The user clicked on a checkbox checked, it means we have to remove set(s) from progression
                const setsCount = sets[exercisePosition]?.length || 0;
                let setPositions: number[] = [];
                if (setsCount > 0 && this.selectedSetIndex <= lastDoneSetIndex) {
                    for (let i = this.selectedSetIndex; i < setsCount; i++) {
                        setPositions.push(i);
                    }
                    await this.props.removeSetsHistory(setPositions, exercisePosition);
                    return;
                }
            } else {
                await this.updateSet(exercisePosition, this.selectedSetIndex);
            }

            // We probably want to close the keyboard if we're not in any of the previous cases
            Keyboard.dismiss();
        } catch (error) {
            console.log(error);
        }
    }

    private cleanSets = (exerciseIndex: number, setPositions: number[]): ISetHistoryState[] => {
        const { sets } = this.state;
        let newSets = sets;
        let setHistories: ISetHistoryState[] = [];

        setPositions.forEach((setPosition: number) => {
            if (exerciseIndex < 0 || setPosition < 0 ||
                !sets || !sets[exerciseIndex] || !sets[exerciseIndex][setPosition]) {
                return;
            }

            if (!this.circuitExercises || !this.circuitExercises[exerciseIndex]?.sets?.length) {
                return;
            }

            const currentCircuitExercise: ICircuitExercise = this.circuitExercises[exerciseIndex];
            const currentSet: ISet = sets[exerciseIndex][setPosition];

            // weight can be a string so we only check if there is a value
            // reps must be a integer so we add extra conditions
            if (!currentSet.weight || !currentSet.reps || !Number.isInteger(currentSet.reps) || currentSet.reps <= 0) {
                // The user did not enter a value for the weight
                if (!currentSet.weight) {
                    // First we get the value from the history
                    newSets[exerciseIndex][setPosition].weight = currentSet.weight ?
                        currentSet.weight :
                        (currentSet.weightHistoryValue ? currentSet.weightHistoryValue : 0);
                    // If it is a bodyweight exercise we want to display '-' instead of 0
                    newSets[exerciseIndex][setPosition].weight =
                        (currentSet.weight === 0 && currentCircuitExercise?.exercise?.bodyweight) ? '-' : currentSet.weight;
                }
                // The user did not enter a value for the reps
                // If the set is validated we want to set the minimum value at 1
                if (!currentSet.reps || !Number.isInteger(currentSet.reps) || currentSet.reps <= 0) {
                    newSets[exerciseIndex][setPosition].reps = 1;
                }
            }
            const setHistory: ISetHistoryState = {
                weight: currentSet.weight,
                scored: currentSet.reps,
                position: currentSet.position
            };
            setHistories.push(setHistory);
        });
        this.setState({ sets: newSets });
        return setHistories;
    }

    private completeSets = async (exerciseIndex: number, setPositions: number[]): Promise<void> => {
        let exerciseHistory: IExerciseHistoryState = await this.exerciseHistory(exerciseIndex);
        if (!exerciseHistory || setPositions.length < 1) {
            return;
        }

        try {
            const setHistories: ISetHistoryState[] = this.cleanSets(exerciseIndex, setPositions);
            await this.props.addSetsHistory(setHistories, exerciseIndex);
        } catch (error) {
            crashlytics().recordError(error);
            console.log(error);
            return;
        }

        const currentCircuitExercise: ICircuitExercise = this.circuitExercises[exerciseIndex];
        // All sets of an exercise are finished
        if (exerciseHistory.setHistories.length === currentCircuitExercise.sets.length) {
            // We are looking for a missing set in an other exercise
            const exerciseIndexWithSetUncomplete = this.getFirstExerciseIndexWithSetsUncomplete();
            if (exerciseIndexWithSetUncomplete === -1) {
                // No missing set, workout is over
                this.confirmWorkoutCompletion();
                return;
            }
        }

        // If it's the last exercise with all sets done, the workout is over
        if (exerciseIndex === (this.circuitExercises.length - 1) &&
        exerciseHistory.setHistories.length === currentCircuitExercise.sets.length) {
            // We are looking for a missing set
            const exerciseIndexWithSetUncomplete = this.getFirstExerciseIndexWithSetsUncomplete();
            if (exerciseIndexWithSetUncomplete === -1) {
                this.confirmWorkoutCompletion();
            } else {
                if (this.workoutExercisesCarouselRef?.current?.scrollToIndex) {
                    this.workoutExercisesCarouselRef?.current?.scrollToIndex(exerciseIndexWithSetUncomplete);
                }
                this.confirmUnfinishedWorkoutCompletion();
            }
            return;
        }
    }

    private updateSet = async (exerciseIndex: number, setPosition: number): Promise<void> => {
        const setHistory = this.cleanSets(exerciseIndex, [setPosition])[0];
        if (setHistory) {
            try {
                await this.props.updateSetHistory(setHistory, exerciseIndex);
                // await this.props.removeSetsHistory([setHistory.position], exerciseIndex);
                // await this.props.addSetsHistory([setHistory], exerciseIndex);
                return;
            } catch (error) {
                crashlytics().recordError(error);
                console.log(error);
            }
        }
    }

    private alertMenuComplete = (): void => {
        Alert.alert(
            null,
            i18n.t('workout.alertMenuCompleteMessage'),
            null,
            // [{
            //     text: 'OK'
            // }],
            { cancelable: true }
        );
    }

    private confirmWorkoutCompletion = (): void => {
        confirmPopup(
            this.completeWorkout,
            null, // this.alertMenuComplete
            i18n.t('workout.confirmWorkoutCompletionTitle'),
            i18n.t('workout.confirmWorkoutCompletionText'),
            i18n.t('workout.complete')
        );
    }

    private confirmUnfinishedWorkoutCompletion = (): void => {
        confirmPopup(
            this.completeWorkout,
            null,
            i18n.t('workout.confirmUnfinishedWorkoutCompletionTitle'),
            i18n.t('workout.confirmUnfinishedWorkoutCompletionText'),
            i18n.t('workout.complete')
        );
    }

    private manuallyCompleteWorkout = (): void => {
        confirmPopup(() => this.completeWorkout(true));
    }

    private openWorkoutSummary = (): void => {
        const { currentVisibleExerciseIndex } = this.state;

        logEvent('workout_summary', {
            workoutId: this.workout?.id,
            workoutTitle: this.workout?.title
        });

        this.props.screenProps.popupManagerRef.current.requestPopup({
            backgroundColors: ['white'],
            ContentComponent: WorkoutSummary,
            ContentComponentProps: {
                circuitExercises: this.circuitExercises,
                position: currentVisibleExerciseIndex
            },
            height: SUMMARY_POPUP_HEIGHT,
            overflow: false,
            position: 'center',
            scrollView: false
        });
    }

    private completeWorkout = async (manual?: boolean): Promise<void> => {
        const { workoutProgression, screenProps, progression, influencerPicture } = this.props;

        this.props.setWorkoutPaused(true);

        if (workoutProgression?.workoutHistory) {
            let workoutHistoryPost: IWorkoutHistoryPost;
            try {
                screenProps?.rootLoaderRef?.current?.open && screenProps?.rootLoaderRef?.current?.open();
                workoutHistoryPost = await createHistoryWorkout(workoutProgression.workoutHistory, true);
            } catch (error) {
                // What should we do ?
                console.log(error);
            } finally {
                const percentage = getWorkoutCompletionPercentage(
                    workoutProgression?.currentWorkout,
                    workoutProgression?.workoutHistory
                );
                logEvent(
                    manual ? 'workout_manual_complete' : 'workout_complete',
                    {
                        workoutId: this.workout?.id,
                        workoutTitle: this.workout?.title,
                        completionPercentage: `${percentage}%`
                    }
                );
                this.props.resetWorkoutHistory();

                // Go to WorkoutCompletion
                const resetAction = StackActions.reset({
                    index: 1,
                    actions: [
                        NavigationActions.navigate({
                            routeName: 'Training'
                        }),
                        NavigationActions.navigate({
                            routeName: 'WorkoutCompletion',
                            params: {
                                data: {
                                    influencerPicture,
                                    progression,
                                    workoutHistoryPost,
                                    workoutProgression
                                }
                            }
                        })
                    ]
                });

                screenProps?.rootLoaderRef?.current?.open && screenProps?.rootLoaderRef?.current?.close();
                this.props.navigation.dispatch(resetAction);
            }
        }
    }

    private getFirstExerciseIndexWithSetsUncomplete (): number {
        const { workoutProgression } = this.props;
        const { sets } = this.state;
        if (workoutProgression?.workoutHistory?.exerciseHistories) {
            for (let index = 0; index < sets.length; index++) {
                if (sets[index]) {
                    const exerciseHistoryIndex = workoutProgression.workoutHistory.exerciseHistories.findIndex(
                        (exercise: IExerciseHistoryState) => exercise.position === index
                    );
                    const setsCount = sets[index].length;
                    const historySetsCount = workoutProgression.workoutHistory.exerciseHistories[exerciseHistoryIndex]?.setHistories?.length;
                    if (!historySetsCount || setsCount > historySetsCount) {
                        return index;
                    }
                }
            }
        }
        return -1;
    }

    private quitWorkout = (): void => {
        const { navigation, workoutProgression } = this.props;
        Alert.alert(
            i18n.t('workout.quitTitle'),
            i18n.t('workout.quitMessage'),
            [
                {
                    text: i18n.t('global.cancel'),
                    style: 'cancel'
                },
                {
                    text: i18n.t('global.confirm'),
                    onPress: () => {
                        this.props.setTotalReps(getTotalReps(workoutProgression?.workoutHistory));
                        this.props.setWorkoutPaused(true);
                        navigation && navigation.goBack();
                        logEvent('workout_quit', {
                            workoutId: this.workout?.id,
                            workoutTitle: this.workout?.title
                        });
                    }
                }
            ],
            { cancelable: false }
        );
    }

    private openExerciseHistoryPopup = (): void => {
        const { currentVisibleExerciseIndex } = this.state;
        this.props.screenProps?.popupManagerRef?.current?.requestPopup &&
        this.props.screenProps?.popupManagerRef?.current?.requestPopup({
            backgroundType: 'gradient',
            ContentComponent: ExerciseHistory,
            ContentComponentProps: {
                circuitExercise: this.circuitExercises && this.circuitExercises[currentVisibleExerciseIndex]
            },
            height: Math.round(viewportHeight * 0.7),
            scrollView: true
        });
        logEvent('workout_history', {
            exerciseId:  this.circuitExercises[currentVisibleExerciseIndex]?.exercise?.id,
            exerciseTitle:  this.circuitExercises[currentVisibleExerciseIndex]?.exercise?.title
        });
    }

    private get countdown (): JSX.Element {
        const { renderCountdown } = this.state;
        const callback = () => {
            this.setState({ renderCountdown: false }, () => {
                this.props.setWorkoutPaused(false);
            });
        };
        return renderCountdown ? (
            <WorkoutStartCountdown callback={callback}/>
        ) : null;
    }

    private get exercisesCarousel (): JSX.Element {
        const { hideInfos, hideUI, sets } = this.state;

        let exerciseProgression = [];
        for (let i = 0; i < this.circuitExercises.length; i++) {
            const lastDoneSetIndex = this.lastDoneSetIndex(i);
            exerciseProgression.push({
                lastDoneSetIndex
            });
        }

        return this.workout ? (
            <WorkoutExercisesCarousel
                circuitExercises={this.circuitExercises}
                hide={hideUI}
                hideInfos={hideInfos}
                initialExerciseIndex={this.initialExerciseIndex}
                onCheckboxPress={this.onCheckboxPress}
                onBlur={this.onBlur}
                onIndexChanged={this.onIndexChanged}
                onSetFocus={this.onSetFocus}
                onSetSubmitEditing={this.onSetSubmitEditing}
                onVideoLaunch={this.launchVideo}
                progression={exerciseProgression}
                ref={this.workoutExercisesCarouselRef}
                screenProps={this.props.screenProps}
                sets={sets}
                updateSetState={this.updateSetState}
                workoutExerciseSetTimerRefs={this.workoutExerciseSetTimerRefs}
            />
        ) : null;
    }

    private get delayedElements (): JSX.Element {
        const { animDelayedOpacity, renderDelayedElements } = this.state;
        const animatedStyle = { opacity: animDelayedOpacity };

        return renderDelayedElements ? (
            <Animated.View style={[styles.fullSpace, animatedStyle]}>
                { this.exercisesCarousel }
            </Animated.View>
        ) : null;
    }

    private get video (): JSX.Element {
        const { animVideoOpacity, playExerciseVideo, currentVisibleExerciseIndex } = this.state;
        if (!playExerciseVideo) {
            return null;
        }
        const thumbnail = get(this.circuitExercises && this.circuitExercises[currentVisibleExerciseIndex], 'exercise.fullscreenImage.url');
        const video = get(this.circuitExercises && this.circuitExercises[currentVisibleExerciseIndex], 'exercise.video.url');
        const animatedStyle = { opacity: animVideoOpacity };

        return video && video.length ? (
            <Animated.View style={[styles.fullSpace, animatedStyle]}>
                <VideoPlayer
                    closeButton={true}
                    controls={true}
                    hideLoaderBlur={true}
                    onClose={this.stopVideo}
                    playOnMount={true}
                    ref={this.videoPlayerRef}
                    resizeButton={true}
                    thumbnailSource={thumbnail}
                    videoSource={video}
                />
            </Animated.View>
        ) : null;
    }

    private get iOSButtonComplete (): JSX.Element {
        const { currentVisibleExerciseIndex, keyboardButtonIcon, showKeyboardButtons } = this.state;
        // Not displayed on Android because the `keyboardWillBlur` event is not triggered on Android
        // We need this event to animate button's disapparition properly
        // On top of that, we're going to use the "done" button from the numeric keyboard on Android
        return isIOS ? (
            <CustomKeyboardButton
                icon={keyboardButtonIcon}
                onPress={() => this.onSetSubmitEditing(currentVisibleExerciseIndex, true)}
                visible={showKeyboardButtons}
            />
        ) : null;
    }

    private get hideKeyboardButton (): JSX.Element {
        const { showKeyboardButtons } = this.state;
        const containerStyle = isAndroid ? { bottom: hideKeyboardButtonStyles.container.bottom + 12 } : {};
        return (
            <HideKeyboardButton
                containerStyle={containerStyle}
                visible={showKeyboardButtons}
            />
        );
    }

    private get rest (): JSX.Element {
        const { nextExerciseData, renderRest, restParams } = this.state;
        const { screenProps, workoutPaused } = this.props;
        return renderRest ? (
            <WorkoutRest
                nextExerciseData={nextExerciseData}
                onClose={() => {
                    this.closeRest();
                    restParams?.onClose();
                }}
                onOpen={restParams?.onOpen}
                paused={workoutPaused}
                restDuration={restParams?.duration}
                screenProps={screenProps}
            />
        ) : null;
    }

    public render (): JSX.Element {
        const { currentVisibleExerciseIndex, hideUI, upcomingExerciseData } = this.state;
        const { timeTrial, timeTrialDuration } = this.workout;
        return (
            <Fragment>
                <NavigationEvents
                    onDidFocus={this.onDidFocus}
                    onWillBlur={this.onWillBlur}
                />
                <View style={styles.fullSpace}>
                    { this.delayedElements }
                    { this.video }
                    <WorkoutProgression
                        circuitExercises={this.circuitExercises}
                        hide={hideUI}
                        visibleExercise={currentVisibleExerciseIndex}
                    />
                    <WorkoutBottomButtons
                        nextExerciseData={upcomingExerciseData}
                        hide={hideUI}
                        onPressCompleteWorkout={this.manuallyCompleteWorkout}
                        onPressHistory={this.openExerciseHistoryPopup}
                        onPressOverview={this.openWorkoutSummary}
                        onPressQuit={this.quitWorkout}
                        screenProps={this.props.screenProps}
                    />
                    <WorkoutTimer
                        hide={hideUI}
                        onTimerComplete={timeTrial ? this.onTimerComplete : undefined}
                        screenProps={this.props.screenProps}
                        timeTrial={timeTrial}
                        timeTrialDuration={timeTrialDuration}
                    />
                    { this.hideKeyboardButton }
                    { this.iOSButtonComplete }
                    { this.rest }
                </View>
                { this.countdown }
            </Fragment>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    autoTimer: state.userProfile?.autoTimer,
    influencerPicture: state.influencers?.currentInfluencer?.picture,
    preventSleepMode: state.userProfile?.preventSleepMode,
    progression: state.progression,
    workoutPaused: state.workoutProgression?.workoutPaused,
    workoutProgression: state.workoutProgression
});

export default connect(
    mapStateToProps,
    {
        addExerciseHistory,
        addSetsHistory,
        removeSetsHistory,
        resetWorkoutHistory,
        setCurrentExerciseIndex,
        setTotalReps,
        setWorkoutPaused,
        updateSetHistory
    },
    null,
    { forwardRef: true }
)(withNavigation(Workout));
