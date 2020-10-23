import React, { PureComponent } from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import { IReduxState } from '../store/reducers';
import { connect } from 'react-redux';

import styles from '../styles/components/OngoingWorkoutBadge.style';
import { IWorkoutProgressionState } from '../store/modules/workoutProgression';

const ICON_RESUME = require('../static/icons/resume.png');

interface IProps {
    containerStyle?: any;
    workoutId?: string;
    workoutProgression: IWorkoutProgressionState;
}

interface IState {
    animContainerTransfrom: Animated.Value;
}

class OngoingWorkoutBadge extends PureComponent<IProps, IState> {

    public static defaultProps: IProps = {
        containerStyle: {},
        workoutProgression: undefined
    };

    constructor (props: IProps) {
        super(props);
        this.state = {
            animContainerTransfrom: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animate(1000);
    }

    private animate (delay: number = 5000): void {
        const { animContainerTransfrom } = this.state;
        Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animContainerTransfrom, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.ease),
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animContainerTransfrom, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.ease),
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animContainerTransfrom, {
                toValue: 1,
                duration: 200,
                easing: Easing.out(Easing.ease),
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animContainerTransfrom, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.ease),
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            this.animate();
        });
    }

    public render (): JSX.Element {
        const { containerStyle, workoutId, workoutProgression } = this.props;
        if (!workoutId || (workoutProgression?.currentWorkout?.id !== workoutId)) {
            return null;
        }
        const { animContainerTransfrom } = this.state;

        const badgeContainerStyle = [
            styles.badgeContainer,
            {
                transform: [
                    {
                        scale: animContainerTransfrom.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.05]
                        })
                    },
                    {
                        translateX: animContainerTransfrom.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 5]
                        })
                    }
                ]
            }
        ];

        return (
            <View style={containerStyle}>
                <Animated.View style={badgeContainerStyle}>
                    <Image source={ICON_RESUME} style={styles.badge} />
                </Animated.View>
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    workoutProgression: state.workoutProgression
});

export default connect(mapStateToProps, { }) (OngoingWorkoutBadge);
