import React, { PureComponent } from 'react';
import { Animated, Easing } from 'react-native';
import delays from '../../utils/animDelays';
import { ICircuitExercise } from '../../types/workout';

import WorkoutProgressionItem from './WorkoutProgressionItem';

import { PROGRESSION_DONE_HEIGHT } from '../../styles/components/Workout/WorkoutProgressionItem.style';
import styles from '../../styles/components/Workout/WorkoutProgression.style';

interface IProps {
    circuitExercises: ICircuitExercise[];
    hide?: boolean;
    visibleExercise: number;
}

interface IState {
    animContainerTransform: Animated.Value;
}

class WorkoutProgression extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animContainerTransform: new Animated.Value(1)
        };
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { hide } = this.props;
        if (hide !== prevProps.hide) {
            this.animate(!hide);
        }
    }

    private animate (animateIn?: boolean): void {
        const { animContainerTransform } = this.state;
        const toValue = animateIn ? 1 : 0;
        const delay = animateIn ? delays.views.workout.videoStopUIDelay + 100 : 50;
        const transformAnimation = animateIn ? Animated.spring(animContainerTransform, {
            toValue,
            speed: 18,
            bounciness: 9,
            isInteraction: false,
            useNativeDriver: true
        }) : Animated.timing(animContainerTransform, {
            toValue,
            duration: 200,
            easing: Easing.out(Easing.ease),
            isInteraction: false,
            useNativeDriver: true
        });

        Animated.sequence([
            Animated.delay(delay),
            transformAnimation
        ]).start();
    }

    private get items (): any {
        const { circuitExercises, hide, visibleExercise } = this.props;
        const items = circuitExercises?.map((circuitExercise: ICircuitExercise, index: number) => {
            return (
                <WorkoutProgressionItem
                    key={`workout-progression-item-${index}`}
                    firstOfCircuit={circuitExercise.isFirstOfCircuit}
                    firstOfWorkout={index === 0}
                    hide={hide}
                    index={index}
                    lastOfCircuit={circuitExercise.isLastOfCircuit}
                    lastOfWorkout={index === circuitExercises.length - 1}
                    visible={index === visibleExercise}
                />
            );
        });
        return items;
    }

    public render (): JSX.Element {
        const { animContainerTransform } = this.state;
        const { circuitExercises, hide } = this.props;
        const pointerEvents = hide ? 'none' : 'auto';
        const containerAnimatedStyle = {
            transform: [{
                translateY: animContainerTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [PROGRESSION_DONE_HEIGHT, 0]
                })
            }]
        };

        return circuitExercises ? (
            <Animated.View style={[styles.container, containerAnimatedStyle]} pointerEvents={pointerEvents}>
                { this.items }
            </Animated.View>
        ) : null;
    }
}

export default WorkoutProgression;
