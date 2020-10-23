import React, { Component, RefObject } from 'react';
import { Text, Animated, Easing, View } from 'react-native';
import i18n from '../utils/i18n';

import BlurWrapper from './BlurWrapper';
import ToastManager from './ToastManager';
import TouchableScale from './TouchableScale';

import styles from '../styles/components/ErrorMessage.style';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';

const REPEAT_ICON = require('../static/icons/repeat-thin.png');

interface IProps {
    containerStyle?: any;
    containerInnerStyle?: any;
    isInternetReachable: boolean;
    message?: string;
    retry?: () => void;
    textStyle?: any;
    toastManagerRef?: RefObject<ToastManager>;
}

interface IState {
    opacityAnimation: Animated.Value;
    repeatAnimation: Animated.Value;
    transformAnimation: Animated.Value;
}

class ErrorMessage extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            opacityAnimation: new Animated.Value(0),
            repeatAnimation: new Animated.Value(0),
            transformAnimation: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animate();
    }

    private animate (): void {
        const { opacityAnimation, transformAnimation } = this.state;
        Animated.parallel([
            Animated.timing(opacityAnimation, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.spring(transformAnimation, {
                toValue: 1,
                speed: 15,
                bounciness: 7,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private retry = (): void => {
        const { retry, isInternetReachable, toastManagerRef } = this.props;
        const { repeatAnimation } = this.state;

        if (!isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        if (retry) {
            Animated.loop(
                Animated.timing(
                    repeatAnimation,
                    {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }
                ),
                {
                    resetBeforeIteration: false
                }
            ).start();
            retry();
        }
    }

    public render (): JSX.Element {
        const { opacityAnimation, repeatAnimation, transformAnimation } = this.state;
        const { message, retry, textStyle } = this.props;

        const text = message || (retry ? i18n.t('app.fetchErrorRetry') : i18n.t('app.fetchError'));
        const containerStyle = [
            styles.container,
            this.props.containerStyle,
            {
                opacity: opacityAnimation,
                transform: [{
                    scale: transformAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1]
                    })
                }, {
                    translateY: transformAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [35, 0]
                    })
                }]
            }
        ];

        const containerInnerStyle = [
            styles.containerInner,
            this.props.containerInnerStyle
        ];

        const iconStyle = [
            styles.icon,
            {
                transform: [{
                    rotate: repeatAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                    })
                }]
            }
        ];
        const icon = retry ? (
            <View style={styles.iconContainer}>
                <Animated.Image
                    source={REPEAT_ICON}
                    style={iconStyle}
                />
            </View>
        ) : null;

        const messageStyle = [
            styles.message,
            retry ? styles.messageRetry : {},
            textStyle || {}
        ];

        const content = (
            <View style={containerInnerStyle}>
                <BlurWrapper
                    blurAmount={8}
                    blurType={'light'}
                    blurStyle={styles.blurIOS}
                    fallbackStyle={styles.blurAndroid}
                    style={styles.blur}
                    type={'vibrancy'}
                />
                <View style={styles.containerInnerContent}>
                    { icon }
                    <Text style={messageStyle}>{ text }</Text>
                </View>
            </View>
        );

        return (
            <Animated.View style={containerStyle}>
                {
                    retry ? (
                        <TouchableScale
                            activeOpacity={0.7}
                            onPress={this.retry}
                        >
                            { content }
                        </TouchableScale>
                    ) : (
                        <View>
                            { content }
                        </View>
                    )
                }
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    isInternetReachable: state.network.isInternetReachable
});

export default connect(mapStateToProps, null)(ErrorMessage);
