import React, { Component } from 'react';
import { ActivityIndicator, Animated, Easing, View } from 'react-native';
import { isIOS } from '../utils/os';

import chroma from 'chroma-js';

import BlurWrapper, { IBlurWrapperProps } from '../components/BlurWrapper';
import Spinner from 'react-native-spinkit';

import colors from '../styles/base/colors.style';
import { headerHeight } from '../styles/base/metrics.style';
import styles from '../styles/components/Loader.style';

interface IProps {
    color?: string;
    containerBlur?: boolean;
    containerBlurProps?: IBlurWrapperProps;
    containerStyle?: any;
    containerType?: 'flex' | 'absolute' | 'absoluteWithHeader';
    fadeIn?: boolean;
    pointerEvents?: string;
    size?: number | 'small' | 'large';
    type?: string;
    withContainer?: boolean;
}

interface IState {
    animOpacity: Animated.Value;
}

export default class Loader extends Component<IProps, IState> {

    public static defaultProps: IProps = {
        color: chroma(colors.violetDark).alpha(0.85).css(),
        containerBlur: false,
        containerStyle: {},
        containerType: 'absolute',
        fadeIn: false,
        pointerEvents: 'auto',
        size: 'large',
        type: isIOS ? 'Arc' : 'FadingCircleAlt',
        withContainer: false
    };

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        const { fadeIn } = this.props;
        if (fadeIn) {
            this.animate();
        }
    }

    private animate (): void {
        const { animOpacity } = this.state;
        Animated.timing(animOpacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private getSpinnerSize (needsNumber: boolean = false): number | 'small' | 'large' {
        const { size } = this.props;
        const smallSize = 16;
        const largeSize = 38;

        if (needsNumber) {
            if (size && typeof size === 'string') {
                return size === 'small' ? smallSize : largeSize;
            } else {
                return size || largeSize;
            }
        } else {
            if (size && typeof size === 'number') {
                return size < largeSize ? 'small' : 'large';
            } else {
                return size || 'large';
            }
        }
    }

    private get spinner (): JSX.Element {
        const {
            color,
            containerBlur,
            containerBlurProps,
            containerStyle,
            containerType,
            size,
            type,
            withContainer,
            ...other
        } = this.props;

        if (type) {
            return <Spinner {...other} size={this.getSpinnerSize(true)} color={color} type={type} />;
        } else {
            return <ActivityIndicator {...other} size={this.getSpinnerSize(false)} color={color} animating={true} />;
        }
    }

    public render (): JSX.Element {
        const { animOpacity } = this.state;
        const {
            containerBlur,
            containerBlurProps,
            containerType,
            containerStyle,
            fadeIn,
            pointerEvents,
            withContainer
        } = this.props;
        const animatedStyle = { opacity: animOpacity };

        if (!withContainer) {
            return fadeIn ? (
                <Animated.View style={animatedStyle}>
                    { this.spinner }
                </Animated.View>
            ) : this.spinner;
        }

        const ContainerComponent = fadeIn ? Animated.View : View;
        const style = [
            styles.container,
            containerType === 'flex' ? styles.flexContainer : styles.fullSpace,
            containerType === 'absoluteWithHeader' ? { top: headerHeight } : {},
            containerStyle || {},
            fadeIn ? animatedStyle : {}
        ];

        const blur = containerBlur ? (
            <BlurWrapper
                type={'vibrancy'}
                blurType={'xlight'}
                blurAmount={12}
                style={styles.fullSpace}
                blurStyle={styles.blurIOS}
                fallbackStyle={styles.blurAndroid}
                { ...containerBlurProps }
            />
        ) : null;

        return (
            <ContainerComponent style={style} pointerEvents={pointerEvents}>
                { blur }
                { this.spinner }
            </ContainerComponent>
        );
    }
}
