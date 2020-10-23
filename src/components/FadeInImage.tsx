import React, { Component } from 'react';
import { Animated, Easing, View, Image } from 'react-native';
import { viewportWidth } from '../styles/base/metrics.style';
import FastImage from 'react-native-fast-image';
import Loader from './Loader';
import staticColors from '../styles/base/colors.style';
import styles from '../styles/components/FadeInImage.style';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
export const ERROR_PLACEHOLDER_SOURCE = require('../static/shared/error.jpg');

interface IProps {
    source: any;
    containerCustomStyle?: any;
    curtain?: {
        width?: number;
        delay1?: number;
        delay2?: number;
        color1?: string;
        color2?: string;
        overlay?: any;
    };
    disableAnimation?: boolean;
    duration?: number;
    finalOpacity?: number;
    imageStyle?: any;
    initialZoom?: number;
    loaderColor?: string;
    placeholderSource?: any;
    resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
    style?: any;
    tintColor?: number | string;
    zoomDuration?: number;
    onAnimationFinished?: () => void;
    onError?: () => void;
    onLayout?: (event: any) => void;
    onLoad?: () => void;
}

// Status meaning:
// 1: Default
// 2: Loading
// 3: Animation completed
// 4: Error

interface IState {
    status: 1 | 2 | 3 | 4;
    animOpacity: Animated.Value;
    animZoom: Animated.Value;
    animCurtain1: Animated.Value;
    animCurtain2: Animated.Value;
}

export default class FadeInImage extends Component<IProps, IState> {
    public static defaultProps: any = {
        disableAnimation: false,
        duration: 300,
        finalOpacity: 1,
        initialZoom: 1
    };

    private mounted?: boolean;
    private imageNode?: any;

    constructor (props: IProps) {
        super(props);
        this.state = {
            status: 1,
            animOpacity: new Animated.Value(0),
            animZoom: new Animated.Value(0),
            animCurtain1: new Animated.Value(0),
            animCurtain2: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.mounted = true;
    }

    public shouldComponentUpdate (nextProps: any, nextState: any): boolean {
        return nextState.status !== 1 || this.props.source !== nextProps.source;
    }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private onLoad = () => {
        const { animOpacity, animZoom, animCurtain1, animCurtain2 } = this.state;
        const { disableAnimation, finalOpacity, duration, initialZoom, zoomDuration, onLoad, onAnimationFinished, curtain } = this.props;

        if (!this.mounted) {
            return;
        }

        const beforeAnimationCallback = () => {
            if (this.state.status !== 4) {
                this.setState({ status: 2 });
            }

            if (onLoad) {
                onLoad();
            }
        };

        const afterAnimationCallback = () => {
            if (this.mounted && this.state.status !== 4) {
                this.setState({ status: 3 });
            }
            if (onAnimationFinished) {
                onAnimationFinished();
            }
        };

        if (disableAnimation) {
            beforeAnimationCallback();
            animOpacity.setValue(finalOpacity);
            afterAnimationCallback();
        } else {
            const animations = [];

            if (curtain) {
                const delay1 = curtain.delay1 || 0;
                const delay2 = delay1 + (curtain.delay2 || Math.round(duration / 4));

                animations.push(
                    Animated.sequence([
                        Animated.delay(delay1),
                        Animated.timing(animCurtain1, {
                            toValue: 1,
                            duration: duration,
                            easing: Easing.in(Easing.quad),
                            isInteraction: false,
                            useNativeDriver: true
                        })
                    ]),
                    Animated.sequence([
                        Animated.delay(delay2),
                        Animated.timing(animCurtain2, {
                            toValue: 1,
                            duration: duration,
                            easing: Easing.in(Easing.quad),
                            isInteraction: false,
                            useNativeDriver: true
                        })
                    ])
                );
            } else {
                animations.push(
                    Animated.timing(animOpacity, {
                        toValue: finalOpacity,
                        duration: duration,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                );
            }

            if (initialZoom !== 1) {
                animations.push(
                    Animated.timing(animZoom, {
                        toValue: 1,
                        duration: zoomDuration || duration,
                        easing: Easing.out(Easing.poly(4)),
                        isInteraction: false,
                        useNativeDriver: true
                    })
                );
            }

            beforeAnimationCallback();

            Animated.parallel(animations).start(() => {
                afterAnimationCallback();
            });
        }
    }

    private onError = () => {
        // if this arg is missing from method signature it won't be called
        const { onError } = this.props;
        if (this.mounted) {
            this.setState({ status: 4 });
        }
        if (onError) {
            onError();
        }
    }

    private get placeholder (): JSX.Element {
        const { status } = this.state;
        const { placeholderSource, imageStyle } = this.props;

        return placeholderSource && status !== 3 ? <Image source={placeholderSource} style={[styles.image, imageStyle || {}]} /> : null;
    }

    private get image (): JSX.Element {
        const { status, animOpacity, animZoom } = this.state;
        const { source, imageStyle, onLayout, resizeMode, tintColor, curtain, initialZoom } = this.props;

        // Prevent crash with `null` image sources on Android?
        // https://github.com/facebook/react-native/issues/24261#issuecomment-525443006
        if (!source?.uri && !source) {
            return null;
        }

        const style = [
            styles.image,
            imageStyle || {},
            !curtain ? { opacity: animOpacity } : {},
            initialZoom !== 1 ? { transform: [{ scale: animZoom.interpolate({ inputRange: [0, 1], outputRange: [initialZoom, 1] }) }] } : {}
        ];

        return (
            <AnimatedFastImage
                style={style}
                resizeMode={FastImage.resizeMode[resizeMode || 'cover']}
                tintColor={tintColor}
                source={status === 4 ? ERROR_PLACEHOLDER_SOURCE : source}
                onError={status !== 3 ? this.onError : undefined} // hack : remove callback to prevent infinite-loop bug
                onLoad={this.onLoad}
                onLayout={onLayout || undefined}
                ref={(c: any) => (this.imageNode = c)}
            />
        );
    }

    private get curtain (): JSX.Element {
        const { animCurtain1, animCurtain2, status } = this.state;
        const { curtain } = this.props;

        if (!curtain || status === 3) {
            return null;
        }

        const curtain1Style = [
            {
                backgroundColor: curtain.color1 || staticColors.background,
                transform: [
                    {
                        translateX: animCurtain1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, curtain.width || viewportWidth]
                        })
                    }
                ]
            }
        ];
        const curtain2Style = [
            {
                backgroundColor: curtain.color2 || staticColors.grayLight,
                transform: [
                    {
                        translateX: animCurtain2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, curtain.width || viewportWidth]
                        })
                    }
                ]
            }
        ];

        return (
            <View style={styles.curtain}>
                {curtain.overlay || false}
                <Animated.View style={[styles.curtain, curtain1Style]} />
                <Animated.View style={[styles.curtain, curtain2Style]} />
            </View>
        );
    }

    private get loader (): JSX.Element {
        const { status } = this.state;
        const { loaderColor } = this.props;

        return status === 1 && loaderColor && loaderColor !== 'none' ? (
            <Loader withContainer={true} color={loaderColor} size={22} />
        ) : null;
    }

    public render (): JSX.Element {
        const { containerCustomStyle, initialZoom, curtain, style } = this.props;

        const containerStyle = [
            styles.container,
            initialZoom !== 1 || curtain ? styles.noOverflowContainer : {},
            style || {},
            containerCustomStyle || {}
        ];

        return (
            <View style={containerStyle}>
                {this.placeholder}
                {this.image}
                {this.curtain}
                {this.loader}
            </View>
        );
    }
}
