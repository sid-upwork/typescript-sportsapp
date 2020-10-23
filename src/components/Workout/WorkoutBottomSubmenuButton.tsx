import React, { Component } from 'react';
import { View, Text, Animated, Easing, ImageSourcePropType } from 'react-native';
import { ETooltipIds } from '../../store/modules/tutorials';
import { IScreenProps } from '../../index';

import FadeInImage from '../FadeInImage';
import Tooltip from '../Tooltip';
import TouchableScale from '../TouchableScale';

import colors from '../../styles/base/colors.style';
import styles, { ICON_COLOR } from '../../styles/components/Workout/WorkoutBottomSubmenuButton.style';

interface IProps {
    animate: boolean;
    icon: ImageSourcePropType;
    index: number;
    label: string;
    onPress?: () => void;
    screenProps: IScreenProps;
    tooltipId: ETooltipIds;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
}

class WorkoutBottomSubmenuButton extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(1),
            animTransform: new Animated.Value(1)
        };
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { animate } = this.props;
        if (animate !== prevProps.animate && animate) {
            this.animate(this.props);
        }
    }

    private animate (props: IProps = this.props): void {
        const { animOpacity, animTransform } = this.state;
        const { index } = props;
        const toValue = 1;
        const duration = 200;
        const delay = 150 + index * 60;

        animOpacity.setValue(0);
        animTransform.setValue(0);

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animOpacity, {
                    toValue,
                    duration,
                    easing: Easing.out(Easing.ease),
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animTransform, {
                    toValue,
                    speed: 20,
                    bounciness: 10,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    public render (): JSX.Element {
        const { animOpacity, animTransform } = this.state;
        const { icon, label, onPress, screenProps, tooltipId } = this.props;
        const animatedStyles = {
            opacity: animOpacity,
            transform: [{
                translateY: animTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [60, 0]
                })
            }]
        };
        return (
            <Animated.View style={[{ flex: 1 }, animatedStyles]}>
                <TouchableScale
                    activeOpacity={0.8}
                    style={styles.container}
                    onPress={onPress}
                >
                    <View style={styles.iconContainer}>
                        <FadeInImage
                            resizeMode={'contain'}
                            source={icon}
                            containerCustomStyle={styles.icon}
                            tintColor={ICON_COLOR}
                        />
                    </View>
                    <Text style={styles.label} numberOfLines={1}>{ label }</Text>
                </TouchableScale>
                <Tooltip
                    containerStyle={styles.tooltip}
                    screenProps={screenProps}
                    tooltipId={tooltipId}
                />
            </Animated.View>
        );
    }
}

export default WorkoutBottomSubmenuButton;
