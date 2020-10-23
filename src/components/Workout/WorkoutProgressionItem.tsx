import React, { PureComponent } from 'react';
import { Animated, Easing } from 'react-native';

import styles, { PROGRESSION_DONE_HEIGHT } from '../../styles/components/Workout/WorkoutProgressionItem.style';

interface IProps {
    firstOfCircuit: boolean;
    firstOfWorkout: boolean;
    hide: boolean;
    index: number;
    lastOfCircuit: boolean;
    lastOfWorkout: boolean;
    visible: boolean;
}

interface IState {
    animContainerTransform: Animated.Value;
    animVisibleOpacity: Animated.Value;
}

class WorkoutProgressionItem extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animContainerTransform: new Animated.Value(1),
            animVisibleOpacity: new Animated.Value(props.visible ? 1 : 0)
        };
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { visible } = this.props;
        if (visible !== prevProps.visible) {
            this.animateVisible(visible);
        }
    }

    private animateVisible (visible?: boolean): void {
        const { animVisibleOpacity } = this.state;
        const toValue = visible ? 1 : 0;

        Animated.timing(animVisibleOpacity, {
            toValue,
            duration: 120,
            easing: Easing.ease,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private get visibleColor (): JSX.Element {
        const { animVisibleOpacity } = this.state;
        const animatedStyle = { opacity: animVisibleOpacity };
        return <Animated.View style={[styles.fullSpace, styles.visible, animatedStyle]} />;
    }

    public render (): JSX.Element {
        const { animContainerTransform } = this.state;
        const { firstOfCircuit, firstOfWorkout, lastOfCircuit, lastOfWorkout } = this.props;
        const containerAnimatedStyle = {
            transform: [{
                translateY: animContainerTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [PROGRESSION_DONE_HEIGHT, 0]
                })
            }]
        };
        const containerStyle = [
            styles.container,
            firstOfCircuit ? styles.containerFirst : {},
            lastOfCircuit ? styles.containerLast : {},
            firstOfCircuit && !firstOfWorkout ? styles.containerMarginLeft : {},
            lastOfCircuit && !lastOfWorkout ? styles.containerMarginRight : {},
            containerAnimatedStyle
        ];
        return (
            <Animated.View style={containerStyle}>
                { this.visibleColor }
            </Animated.View>
        );
    }
}

export default WorkoutProgressionItem;
