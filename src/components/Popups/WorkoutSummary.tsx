import React, { Component } from 'react';
import { ScrollView, View, Image, Animated, Easing, Text } from 'react-native';
import { connect } from 'react-redux';
import { IScreenProps } from '../../index';
import { IReduxState } from '../../store/reducers';
import { IWorkoutProgressionState } from '../../store/modules/workoutProgression';
import { getSetsDoneCount } from '../../utils/workout';
import { ICircuitExercise } from '../../types/workout';
import i18n from '../../utils/i18n';

import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';

import styles, {
    ACTIVE_GRADIENT_COLORS,
    ACTIVE_GRADIENT_LOCATIONS,
    ITEM_SIZE,
    ITEM_BORDER_RADIUS,
    OVERLAY_COLORS,
    SEPARATOR_CONTAINER_WIDTH
} from '../../styles/components/Popups/WorkoutSummary.style';

const CHECKMARK_ICON = require('../../static/icons/checkmark.png');
const LINK_ICON = require('../../static/Workout/link.png');

interface IProps {
    dismissPopup: () => void;
    circuitExercises: ICircuitExercise[];
    position: number;
    screenProps: IScreenProps;
    workoutProgression: IWorkoutProgressionState;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
}

class WorkoutSummary extends Component<IProps, IState> {

    private scrollViewRef: React.RefObject<ScrollView>;

    constructor (props: IProps) {
        super(props);
        this.scrollViewRef = React.createRef<ScrollView>();
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        const { position } = this.props;
        this.animate(() => {
            if (Number.isInteger(position) && position >= 0) {
                const scrollToNumber = (position * (ITEM_SIZE + SEPARATOR_CONTAINER_WIDTH));
                setTimeout(() => {
                    this.scrollViewRef?.current?.scrollTo && this.scrollViewRef?.current?.scrollTo({x: scrollToNumber});
                }, 250);
            }
        });
    }

    private animate = (callback: () => void): void => {
        const { animOpacity, animTransform } = this.state;
        const opacityParams = {
            toValue: 1,
            duration: 150,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: 18,
            bounciness: 6,
            isInteraction: false,
            useNativeDriver: true
        };
        Animated.sequence([
            Animated.delay(500), // Enough time for the popup to animate up
            Animated.parallel([
                Animated.timing(animOpacity, opacityParams),
                Animated.spring(animTransform, springParams)
            ])
        ]).start(() => {
            callback && callback();
        });
    }

    private get items (): JSX.Element[] {
        const { circuitExercises, position, workoutProgression } = this.props;

        let items = [];
        circuitExercises?.forEach((circuitExercise: ICircuitExercise, circuitExerciseIndex: number) => {
            const setsCount = circuitExercise.sets?.length;
            const setsDoneCount =  getSetsDoneCount(circuitExerciseIndex, workoutProgression);
            const exerciseActive = circuitExerciseIndex === position;
            const exerciseFinished = (setsCount === setsDoneCount);

            let overlay = null;
            if (exerciseFinished) {
                overlay = (
                    <View style={[styles.fullSpace, styles.overlay]}>
                        <Image source={CHECKMARK_ICON} style={styles.overlayDoneIcon} />
                    </View>
                );
            }

            const activeGradient = exerciseActive && !exerciseFinished ? (
                <LinearGradient
                  style={styles.fullSpace}
                  colors={ACTIVE_GRADIENT_COLORS}
                  locations={ACTIVE_GRADIENT_LOCATIONS}
                />
            ) : null;

            const textGradient = !exerciseActive && !exerciseFinished ? (
                <LinearGradient
                    style={styles.fullSpace}
                    colors={OVERLAY_COLORS}
                />
            ) : null;

            let sets = null;
            if (Number.isInteger(setsCount) && setsCount > 0) {
                sets = (
                    <View style={styles.setsContainer}>
                        <Text style={styles.setsText}>
                            { `${i18n.t('workout.set')} ${setsDoneCount}/${setsCount}` }
                        </Text>
                    </View>
                );
            }

            const border = !exerciseFinished ? (
                <View style={[styles.fullSpace, exerciseActive ? styles.borderActive : styles.border]} />
            ) : null;

            const item = (
                <View
                    key={`workout-summary-item-${circuitExerciseIndex}`}
                    style={styles.itemContainer}
                >
                    <DiffuseShadow
                        borderRadius={ITEM_BORDER_RADIUS}
                        horizontalOffset={12}
                        shadowOpacity={0.22}
                        verticalOffset={9}
                    />
                    <View style={styles.itemContainerInner}>
                        <FadeInImage
                            source={{ uri: circuitExercise.exercise?.image?.thumbnailUrl }}
                            containerCustomStyle={[styles.fullSpace, styles.itemImageContainer]}
                        />
                        { activeGradient }
                        { overlay }
                        <View style={styles.titleContainer}>
                            <View style={styles.titleContainerInner}>
                                { textGradient }
                                <Text style={styles.titleText} numberOfLines={3}>{ circuitExercise.exercise?.title }</Text>
                            </View>
                        </View>
                        { sets }
                        { border }
                    </View>
                </View>
            );
            items.push(item);

            const separatorAnchorStyle = [
                styles.anchorIcon,
                exerciseFinished ? styles.anchorIconDone : {}
            ];
            const separatorAnchor = circuitExercise.circuitLength > 1 && !circuitExercise.isLastOfCircuit ? (
                <Image source={LINK_ICON} style={separatorAnchorStyle} />
            ) : null;

            const separator = (
                <View
                    key={`workout-summary-separator-${circuitExerciseIndex}`}
                    style={styles.separatorContainer}
                >
                    { separatorAnchor }
                </View>
            );
            items.push(separator);

        });
        return items;
    }

    public render (): JSX.Element {
        const { animOpacity, animTransform } = this.state;
        const animatedStyle = {
            opacity: animOpacity,
            transform: [
                {
                    translateY: animTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [80, 0]
                    })
                }
            ]
        };
        return (
            <View style={styles.container}>
                <Animated.View style={[styles.contentContainer, animatedStyle]}>
                    <Text style={styles.popupTitle}>{ i18n.t('workout.overview') }</Text>
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContentContainer}
                        decelerationRate={'fast'}
                        horizontal={true}
                        ref={this.scrollViewRef}
                        showsHorizontalScrollIndicator={false}
                        snapToAlignment={'start'}
                        snapToInterval={ITEM_SIZE + SEPARATOR_CONTAINER_WIDTH}
                        style={styles.scrollView}
                    >
                        { this.items }
                    </ScrollView>
                </Animated.View>
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    workoutProgression: state.workoutProgression
});

export default connect(mapStateToProps, {})(WorkoutSummary);
