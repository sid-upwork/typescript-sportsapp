import React, { Component } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

import BlurWrapper from '../components/BlurWrapper';
import Loader from './Loader';

import styles, { LOADER_COLOR } from '../styles/components/RootLoader.style';

interface IProps {}

interface IState {
    animOpacity: Animated.Value;
    label: string;
    visible: boolean;
}

class RootLoader extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            label: null,
            visible: false
        };
    }

    private animate (animateIn: boolean, callback?: () => void): void {
        const { animOpacity } = this.state;
        Animated.timing(animOpacity, {
            toValue: animateIn ? 1 : 0,
            duration: 250,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        }).start(() => {
            callback && callback();
        });
    }

    public open = (message?: string): void => {
        this.setState({
            label: message || null,
            visible: true
        }, () => {
            this.animate(true);
        });
    }

    public close = (): void => {
        this.animate(false, () => {
            this.setState({
                label: null,
                visible: false
            });
        });
    }

    private get label (): JSX.Element {
        const { label } = this.state;
        return label ? (
            <Text style={styles.label}>
                { label }
            </Text>
        ) : null;
    }

    public render (): JSX.Element {
        const { animOpacity, label, visible } = this.state;
        return visible ? (
            <Animated.View style={[styles.container, { opacity: animOpacity }]}>
                <BlurWrapper
                    type={'vibrancy'}
                    blurType={'light'}
                    blurAmount={14}
                    style={styles.fullSpace}
                    blurStyle={[styles.blurIOS, !!label ? styles.blurIOSLabel : {}]}
                    fallbackStyle={styles.blurAndroid}
                />
                <View style={styles.loaderContainer}>
                    <Loader
                        color={LOADER_COLOR}
                        fadeIn={true}
                    />
                    { this.label }
                </View>
            </Animated.View>
        ) : null;
    }
}

export default RootLoader;
