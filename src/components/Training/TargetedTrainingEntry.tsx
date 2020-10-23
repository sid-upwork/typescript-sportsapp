import React, { Component } from 'react';
import { Text, Animated, Easing, TouchableOpacity } from 'react-native';
import { IWorkout } from '../../types/workout';
import delays from '../../utils/animDelays';
import { getLoaderColor } from '../../utils/colors';
import { navigateToWorkoutOverview } from '../../utils/navigation';
import { TTargetedTrainingId } from '../Training/TargetedTrainingItem';

// import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';

import styles from '../../styles/components/Popups/TargetedTraining.style';

interface IProps {
    dismissPopup: () => void;
    targetedTrainingId: TTargetedTrainingId;
    index: number;
    workout: IWorkout;
    navigation: any;
}

interface IState {
    itemAnimationOpacity: Animated.Value;
    itemAnimationTransform: Animated.Value;
}

class TargetedTrainingEntry extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            itemAnimationOpacity: new Animated.Value(0),
            itemAnimationTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateItem();
    }

    private animateItem (): void {
        const { itemAnimationOpacity, itemAnimationTransform } = this.state;
        const { index } = this.props;
        const maxVisibleItems = 8;
        const cappedIndex = Math.abs(index % maxVisibleItems);
        const initialDelay = index < maxVisibleItems ? delays.views.targetedTraining.itemApparition : 0;
        const delay = initialDelay + cappedIndex * 80;

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(itemAnimationOpacity, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(itemAnimationTransform, {
                    toValue: 1,
                    speed: 16,
                    bounciness: 7,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private onPress = (): void => {
        const { navigation, workout, targetedTrainingId } = this.props;
        this.props.dismissPopup();
        navigateToWorkoutOverview(
            navigation?.navigate,
            workout,
            undefined,
            false,
            undefined,
            'targetedTraining',
            targetedTrainingId
        );
    }

    public render (): JSX.Element {
        const { itemAnimationOpacity, itemAnimationTransform } = this.state;
        const { index, workout } = this.props;

        if (!workout) {
            return null;
        }

        const itemImageAnimatedStyle = [
            styles.workoutLeftContainer,
            {
                opacity: itemAnimationOpacity,
                transform: [{
                    translateY: itemAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [80, 0]
                    })
                }]
            }
        ];
        const itemTextAnimatedStyle = [
            styles.workoutRightContainer,
            {
                opacity: itemAnimationOpacity,
                transform: [{
                    translateX: itemAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0]
                    })
                }]
            }
        ];

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                key={`targetedtraining-workout-${workout.id}-${index}`}
                onPress={this.onPress}
                style={styles.workoutContainer}
            >
                <Animated.View style={itemImageAnimatedStyle}>
                    {/* <DiffuseShadow
                        borderRadius={0}
                        horizontalOffset={10}
                        shadowOpacity={0.22}
                        verticalOffset={9}
                    /> */}
                    <FadeInImage
                        source={{ uri: workout && workout.image && workout.image.thumbnailUrl }}
                        containerCustomStyle={styles.workoutImageContainer}
                        initialZoom={1.4}
                        zoomDuration={500}
                        loaderColor={getLoaderColor()}
                    />
                </Animated.View>
                <Animated.View style={itemTextAnimatedStyle}>
                    <Text style={styles.workoutTitle} numberOfLines={3}>{workout && workout.title}</Text>
                    <Text style={styles.workoutDescription} numberOfLines={2}>{workout && workout.shortDescription}</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    }
}

export default TargetedTrainingEntry;
