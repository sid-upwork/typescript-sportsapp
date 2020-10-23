import React, { Component } from 'react';
import { View, Animated, Easing } from 'react-native';
import FadeInImage from './FadeInImage';
import styles from '../styles/components/Sidebar.style';
import { viewportHeight } from '../styles/base/metrics.style';

interface IProps {
    scrollY?: Animated.Value;
    hideImage?: boolean;
}

interface IState {
    animBarTransform: Animated.Value;
}

const LOGO_NULI = require('../static/shared/logo-nuli.png');

export default class Sidebar extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animBarTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateBar();
    }

    private animateBar (): void {
        const { animBarTransform } = this.state;

        Animated.sequence([
            // Animated.delay(50),
            Animated.timing(animBarTransform, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.poly(4)),
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private get image (): JSX.Element {
        if (this.props.hideImage) {
            return null;
        }

        const { scrollY } = this.props;
        const inputRange = [0, viewportHeight * 0.3];
        const animatedStyle = scrollY ? {
            opacity: scrollY.interpolate({
                inputRange,
                outputRange: [1, 0],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateY: scrollY.interpolate({
                        inputRange,
                        outputRange: [0, -viewportHeight * 0.15]
                    })
                }
            ]
        } : {};

        return (
            <Animated.View style={animatedStyle}>
                <FadeInImage
                    source={LOGO_NULI}
                    containerCustomStyle={styles.imageContainer}
                    duration={200}
                    // initialZoom={1.2}
                    // zoomDuration={600}
                />
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        const { animBarTransform } = this.state;
        const animatedStyle = {
            transform: [
                {
                    translateY: animBarTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-viewportHeight, 0]
                    })
                }
            ]
        };

        return (
            <View style={styles.container}>
                <Animated.View style={[styles.bar, animatedStyle]} />
                {this.image}
            </View>
        );
    }
}
