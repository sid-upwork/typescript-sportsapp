import React, { PureComponent, RefObject, Fragment } from 'react';
import { View, Animated, TextInput, TouchableOpacity } from 'react-native';
import { ICircuitExercise, ISet } from '../../types/workout';
import { IScreenProps } from '../../index';
import { isAndroid } from '../../utils/os';
import { get } from 'lodash';

import LinearGradient from 'react-native-linear-gradient';

import SharedParallaxView from '../SharedParallaxView';
import WorkoutExercise from './WorkoutExercise';
import WorkoutExerciseImage from './WorkoutExerciseImage';

import styles, {
    DARK_GRADIENT_COLORS,
    DARK_GRADIENT_LOCATIONS,
    ITEM_WIDTH
} from '../../styles/components/Workout/WorkoutExercisesCarousel.style';

interface IProps {
    circuitExercises: ICircuitExercise[];
    hide?: boolean;
    hideInfos?: boolean;
    initialExerciseIndex: number;
    progression: any;
    onCheckboxPress?: (exerciseIndex: number) => void;
    onBlur?: (exerciseIndex: number, setIndex: number) => Promise<void>;
    onIndexChanged?: (index: number) => void;
    onSetFocus?: (
        exerciseSetIndex: number,
        columnIndex: number,
        inputWeightRef: RefObject<TextInput>,
        inputTargetRef: RefObject<TextInput>,
        inputTimeRef: RefObject<TouchableOpacity>
    ) => void;
    onSetSubmitEditing?: (exerciseIndex: number) => void;
    onVideoLaunch?: (videoId: string, exerciseTitle: string) => void;
    screenProps: IScreenProps;
    sets: [ISet[]];
    updateSetState: (exerciseIndex: number, exerciseSetIndex: number, set: ISet) => void;
    workoutExerciseSetTimerRefs: any[];
}

interface IState {
    activeIndex: number;
}

class WorkoutExercisesCarousel extends PureComponent<IProps, IState> {

    private dummyMountTimer: any;
    private scrollViewRef: RefObject<any>;
    private visibleExerciseIndex: number;

    constructor (props: IProps) {
        super(props);
        this.scrollViewRef = React.createRef();
        this.visibleExerciseIndex = props.initialExerciseIndex;
        this.state = {
            activeIndex: props.initialExerciseIndex
        };
    }

    public componentDidMount (): void {
        const { initialExerciseIndex } = this.props;
        // Why on earth is the following not working without a timer?
        // Everything is properly defined in SharedParallaxView's scrollTo and yet...
        this.dummyMountTimer = setTimeout(() => {
            this.scrollToIndex(initialExerciseIndex, false);
        }, 1);
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { hide, progression } = this.props;
        if (hide !== prevProps.hide || progression !== prevProps.progression) {
            this.scrollViewRef?.current?.triggerForceUpdate && this.scrollViewRef?.current?.triggerForceUpdate();
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.dummyMountTimer);
    }

    public scrollToIndex = (index: number, animated: boolean = true): void => {
        const scrollTo = get(this.scrollViewRef, 'current.scrollTo');
        if (!Number.isInteger(index) || index < 0 || !scrollTo) {
            return;
        }
        scrollTo({ x: index * ITEM_WIDTH, animated });
    }

    private onScroll = (event: any): void  => {
        const { onIndexChanged } = this.props;
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / ITEM_WIDTH);
        if (index !== this.visibleExerciseIndex) {
            this.visibleExerciseIndex = index;
            onIndexChanged && onIndexChanged(index);

            // Needed to trigger image rerenders
            this.setState({ activeIndex: this.visibleExerciseIndex });
        }
    }

    private get imageEffects (): JSX.Element {
        return (
            <View style={styles.fullSpace}>
                <LinearGradient
                    colors={DARK_GRADIENT_COLORS}
                    locations={DARK_GRADIENT_LOCATIONS}
                    style={[styles.fullSpace, styles.overlayGradient]}
                />
            </View>
        );
    }

    private images = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const { activeIndex } = this.state;
        const { circuitExercises } = this.props;
        const images = circuitExercises ? circuitExercises.map((circuitExercise: ICircuitExercise, index: number) => {
            const inputRange = [ITEM_WIDTH * (index - 1), ITEM_WIDTH * index, ITEM_WIDTH * (index + 1)];
            const source = circuitExercise.exercise?.fullscreenImage?.url;

            // This fixes poor performances on Android by only rendering 3 images at any given time
            // TODO/WARNING: make sure that images are properly cached by react-native-fast-image
            // and that no new requests are triggered on subsequent renders
            const visibleSiblings = isAndroid ? 1 : 2;
            const shouldHideImage = index < activeIndex - visibleSiblings || index > activeIndex + visibleSiblings;
            const hide = isAndroid ? shouldHideImage : false;

            return (
                <View style={styles.fullSpace} key={`workout-circuitExercises-carousel-image-${index}`}>
                    <WorkoutExerciseImage
                        hide={hide}
                        hScrollInputRange={inputRange}
                        hScrollValue={animatedValue}
                        last={index === circuitExercises.length - 1}
                        source={source}
                    />
                </View>
            );
        }) : null;

        return (
            <View style={styles.fullSpace}>
                { images }
                { this.imageEffects }
            </View>
        );
    }

    private circuitExercises = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const {
            circuitExercises, hide, hideInfos, progression, sets, updateSetState, initialExerciseIndex,
            onBlur, onCheckboxPress, onSetFocus, onSetSubmitEditing, onVideoLaunch, screenProps
        } = this.props;
        const items = circuitExercises.map((circuitExercise: ICircuitExercise, index: number) => {
            const inputRange = [ITEM_WIDTH * (index - 1), ITEM_WIDTH * index, ITEM_WIDTH * (index + 1)];
            const exerciseProgression = progression && progression[index];
            const lastDoneSetIndex = exerciseProgression && exerciseProgression.lastDoneSetIndex;
            return (
                <View style={styles.exerciseContainer} key={`workout-exercise-carousel-exercise-${index}`}>
                    <WorkoutExercise
                        data={circuitExercise}
                        index={index}
                        hide={hide && index === this.visibleExerciseIndex}
                        hideInfos={hideInfos}
                        hScrollInputRange={inputRange}
                        hScrollValue={animatedValue}
                        lastDoneSetIndex={lastDoneSetIndex}
                        onBlur={onBlur}
                        onCheckboxPress={onCheckboxPress}
                        onSetFocus={onSetFocus}
                        onSetSubmitEditing={onSetSubmitEditing}
                        onVideoLaunch={onVideoLaunch}
                        renderTooltips={index === initialExerciseIndex}
                        screenProps={screenProps}
                        sets={sets[index]}
                        updateSetState={updateSetState}
                        workoutExerciseSetTimerRefs={this.props.workoutExerciseSetTimerRefs}
                    />
                </View>
            );
        });
        return (
            <Fragment>
                { items }
            </Fragment>
        );
    }

    public render (): JSX.Element {
        const { circuitExercises, hide } = this.props;

        const pointerEvents = hide ? 'none' : 'auto';
        return circuitExercises ? (
            <View style={styles.viewContainer} pointerEvents={pointerEvents}>
                <SharedParallaxView
                    decelerationRate={'fast'}
                    disableIntervalMomentum={true}
                    horizontal={true}
                    onScroll={this.onScroll}
                    overScrollMode={'auto'}
                    ref={this.scrollViewRef}
                    renderBackground={this.images}
                    renderScrollViewForegroundChild={this.circuitExercises}
                    snapToAlignment={'center'}
                    snapToInterval={ITEM_WIDTH}
                    style={styles.fullSpace}
                />
            </View>
        ) : null;
    }
}

export default WorkoutExercisesCarousel;
