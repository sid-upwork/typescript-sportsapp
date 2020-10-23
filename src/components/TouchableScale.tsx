import React, { Component } from 'react';
import { Animated, Easing, TouchableOpacity, TouchableOpacityProps, GestureResponderEvent } from 'react-native';

interface IProps extends TouchableOpacityProps {
    activeScale?: number;
    animProps?: any;
    animType?: 'spring' | 'timing';
    containerStyle?: any;
}

interface IState {
    animTransform: Animated.Value;
}

export default class TouchableScale extends Component<IProps, IState> {

    public static defaultProps: IProps = {
        activeScale: 0.92,
        animProps: {},
        animType: 'timing',
        containerStyle: {}
    };

    constructor (props: IProps) {
        super(props);
        this.state = {
            animTransform: new Animated.Value(1)
        };
    }

    private getCommonAnimProps (toValue: number = 1): any {
        const { animProps } = this.props;
        return {
            ...animProps,
            toValue,
            isInteraction: false,
            useNativeDriver: true
        };
    }

    private onPressIn = (event: GestureResponderEvent): void => {
        const { animTransform } = this.state;
        const { activeScale, animType } = this.props;

        if (animType === 'spring') {
            Animated.spring(animTransform, {
                speed: 16,
                bounciness: 7,
                ...this.getCommonAnimProps(activeScale)
            }).start();
        } else {
            Animated.timing(animTransform, {
                duration: 200,
                easing: Easing.out(Easing.poly(3)),
                ...this.getCommonAnimProps(activeScale)
            }).start();
        }

        if (this.props.onPressIn) {
            this.props.onPressIn(event);
        }
    }

    private onPressOut = (event: GestureResponderEvent): void => {
        const { animTransform } = this.state;
        const { animType } = this.props;

        if (animType === 'spring') {
            Animated.spring(animTransform, {
                speed: 18,
                bounciness: 5,
                ...this.getCommonAnimProps(1)
            }).start();
        } else {
            Animated.timing(animTransform, {
                duration: 120,
                easing: Easing.out(Easing.poly(3)),
                ...this.getCommonAnimProps(1)
            }).start();
        }

        if (this.props.onPressOut) {
            this.props.onPressOut(event);
        }
    }

    public render (): JSX.Element {
        const { animTransform } = this.state;
        const { containerStyle, style, children, ...other } = this.props;
        const innerContainerStyle = [
            style,
            { transform: [{ scale: animTransform }]}
        ];

        return (
            <TouchableOpacity
                activeOpacity={1}
                {...other}
                style={containerStyle}
                onPressIn={this.onPressIn}
                onPressOut={this.onPressOut}
            >
                <Animated.View style={[innerContainerStyle]}>
                    { children }
                </Animated.View>
            </TouchableOpacity>
        );
    }
}
