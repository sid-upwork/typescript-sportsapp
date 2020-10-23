import React, { Component } from 'react';
import { View, Text, Animated } from 'react-native';
import { debounce } from 'lodash';
import { isIOS } from '../utils/os';
import chroma from 'chroma-js';

import BlurWrapper from './BlurWrapper';
import TouchableScale from './TouchableScale';

import colors from '../styles/base/colors.style';
import styles from '../styles/components/Toast.style';

type TToastType = 'info' | 'warning' | 'error';

export interface IProps {
    close?: () => void;
    duration?: number;
    message: string;
    type: TToastType;
    onPress?: () => void;
}

interface IState {
    animationOpacity: Animated.Value;
    animationTransfrom: Animated.Value;
}

const CLOSE_DELAY = 3000;
const OPACITY_ANIMATION_DURATION = 250;

class Toast extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animationOpacity: new Animated.Value(0),
            animationTransfrom: new Animated.Value(1)
        };
    }

    public componentDidMount (): void {
        this.animate();
    }

    private onPress = (): void => {
        const { animationOpacity, animationTransfrom } = this.state;
        animationOpacity.stopAnimation();
        animationTransfrom.stopAnimation();
        this.animate(true);
        this.props.onPress && this.props.onPress();
    }

    private animate (out?: boolean, delay?: number): void {
        const { animationOpacity, animationTransfrom } = this.state;

        Animated.sequence([
            Animated.delay(delay || 0),
            Animated.parallel([
                Animated.timing(animationOpacity, {
                    toValue: out ? 0 : 1,
                    duration: OPACITY_ANIMATION_DURATION,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animationTransfrom, {
                    toValue: out ? 1 : 0,
                    bounciness: 5,
                    speed: 12,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start(() => {
            if (out) {
                this.props.close();
            } else {
                this.animate(true, this.props.duration || CLOSE_DELAY);
            }
        });
    }

    public render (): JSX.Element {
        const { message, type } = this.props;
        const { animationOpacity, animationTransfrom } = this.state;

        const animatedContainerStyle = [
            styles.container,
            {
                opacity: animationOpacity,
                transform: [{
                    translateY: animationTransfrom.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 150]
                    })
                }]
            }
        ];

        const colorScale = chroma.scale([colors.blue, colors.blueDark]);
        const color = type === 'error' ? colors.error : (type === 'warning' ? colors.orangeLight : colorScale(0.65).darken(0.5));

        const toastStyle = [styles.toast, { borderColor: color }];
        const blurIOS = { backgroundColor: chroma(color).alpha(0.25).css() };
        const blurAndroid = { backgroundColor: chroma(color).alpha(0.85).css() };
        const messageStyle = [styles.message, { color: isIOS ? color : 'white' }];

        return (
            <Animated.View style={animatedContainerStyle} pointerEvents={'box-none'}>
                <TouchableScale onPress={debounce(this.onPress, 300, { 'leading': true, 'trailing': false })}>
                    <View style={toastStyle}>
                        <BlurWrapper
                            blurAmount={14}
                            blurType={'xlight'}
                            blurStyle={blurIOS}
                            fallbackStyle={blurAndroid}
                            style={styles.blur}
                            type={'vibrancy'}
                        />
                        <View style={styles.messageContainer}>
                            <Text style={messageStyle}>{ message }</Text>
                        </View>
                    </View>
                </TouchableScale>
            </Animated.View>
        );
    }
}

export default Toast;
