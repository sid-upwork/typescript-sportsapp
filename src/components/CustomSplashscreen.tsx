import React, { PureComponent } from 'react';
import { Animated, Easing, View } from 'react-native';
import { isAndroid } from '../utils/os';
import SplashScreen from 'react-native-splash-screen';
import styles, { LOGO_SIZE_INITIAL, LOGO_SIZE_FINAL } from '../styles/components/CustomSplashscreen.style';

interface IProps {
    callback?: () => void;
}

interface IState {
    animBackgroundOpacity: Animated.Value;
    animLogoOpacity: Animated.Value;
    animLogoTransform: Animated.Value;
}

const ANDROID_DELAY = 500; // Android's a mess, there's no denying that. Let's give it some space...

const SPLASHSCREEN_GRADIENT = require('../static/shared/splashscreen-gradient.jpg');
const SPLASHSCREEN_LOGO = require('../static/shared/splashscreen-logo.png');
export const ANIMATION_DELAY = 500;
export const LOGO_ANIMATION_DURATION = 500;
const BACKGROUND_ANIMATION_DURATION = 300;
const IMAGE_SCALE = LOGO_SIZE_INITIAL / LOGO_SIZE_FINAL;

export default class CustomSplashscreen extends PureComponent<IProps, IState> {

    private androidInitTimer: any;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animBackgroundOpacity: new Animated.Value(1),
            animLogoOpacity: new Animated.Value(1),
            animLogoTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        // No need for the plugin on iOS with our custom splashscreen
        if (isAndroid) {
            this.androidInitTimer = setTimeout(() => {
                SplashScreen.hide();
                this.animate();
            }, ANDROID_DELAY);
        } else {
            this.animate();
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.androidInitTimer);
    }

    private animate (): void {
        const { animBackgroundOpacity, animLogoOpacity, animLogoTransform } = this.state;
        const { callback } = this.props;

        Animated.sequence([
            Animated.delay(ANIMATION_DELAY),
            Animated.parallel([
                Animated.timing(animLogoOpacity, {
                    toValue: 0,
                    duration: LOGO_ANIMATION_DURATION,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.timing(animLogoTransform, {
                    toValue: 1,
                    duration: LOGO_ANIMATION_DURATION,
                    easing: Easing.in(Easing.poly(4)),
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.sequence([
                    Animated.delay(LOGO_ANIMATION_DURATION - BACKGROUND_ANIMATION_DURATION),
                    Animated.timing(animBackgroundOpacity, {
                        toValue: 0,
                        duration: BACKGROUND_ANIMATION_DURATION,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ])
        ]).start(() => {
            callback && callback();
        });
    }

    public render (): JSX.Element {
        const { animBackgroundOpacity, animLogoOpacity, animLogoTransform } = this.state;
        const backgroundAnimatedStyle = {
            opacity: animBackgroundOpacity
        };
        const logoAnimatedStyle = {
            opacity: animLogoOpacity.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 1]
            }),
            transform: [
                {
                    scale: animLogoTransform.interpolate({
                        inputRange: [0, 0.1, 1],
                        outputRange: [IMAGE_SCALE, IMAGE_SCALE * 0.75, 1]
                    })
                }
            ]
        };

        return (
            <View style={styles.splashscreenContainer}>
                <Animated.Image
                    source={SPLASHSCREEN_GRADIENT}
                    style={[styles.splashscreenBackground, backgroundAnimatedStyle]}
                />
                <Animated.Image
                    source={SPLASHSCREEN_LOGO}
                    style={[styles.splashscreenLogo, logoAnimatedStyle]}
                />
            </View>
        );
    }
}
