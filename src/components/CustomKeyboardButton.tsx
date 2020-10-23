import React, { PureComponent } from 'react';
import { Animated, Easing, Keyboard, View , ImageSourcePropType} from 'react-native';
import { isIOS } from '../utils/os';

import { debounce } from 'lodash';

import LinearGradient from 'react-native-linear-gradient';

import FadeInImage from './FadeInImage';
import TouchableScale from './TouchableScale';

import styles, { GRADIENT_COLORS } from '../styles/components/CustomKeyboardButton.style';

const ICON = require('../static/icons/checkmark-thin.png');

export interface IProps {
    icon?: ImageSourcePropType;
    onPress: () => void;
    visible: boolean;
}

interface IState {
    animOpacity: Animated.Value;
    animTransfrom: Animated.Value;
    keyboardHeight: number;
}

class CustomKeyboardButton extends PureComponent<IProps, IState> {

    private keyboardDidShowListener: any;
    private keyboardWillShowListener: any;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransfrom: new Animated.Value(0),
            keyboardHeight: 0
        };
    }

    public componentDidMount (): void {
        // On Android, the view is resized when using `android:windowSoftInputMode="adjustResize"``
        // Therefore the absolute bottom position of the buttons should be `0``
        // On iOS, the keyboard moves on top of the view
        // Therefore the bottom position of the buttons needs to be keyboard's height
        if (isIOS) {
            this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.retrieveKeyboardHeight);
        }
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { visible } = this.props;
        if (visible !== prevProps.visible) {
            this.animate(visible);
        }
    }

    public componentWillUnmount (): void {
        this.keyboardDidShowListener?.remove && this.keyboardDidShowListener?.remove();
        this.keyboardWillShowListener?.remove && this.keyboardWillShowListener?.remove();
    }

    private retrieveKeyboardHeight = (e: any): void => {
        const { keyboardHeight } = this.state;
        const height = e?.endCoordinates?.height;
        if (!height || height === keyboardHeight) {
            return;
        }
        this.setState({ keyboardHeight: height });
    }

    private onPress = (): void => {
        const { onPress } = this.props;
        onPress && onPress();
    }

    private animate (animateIn?: boolean): void {
        const { animOpacity, animTransfrom } = this.state;
        const toValue = animateIn ? 1 : 0;
        const duration = animateIn ? 150 : 400;
        const delay = animateIn ? 120 : 0;
        const transformAnimation = animateIn ? Animated.spring(animTransfrom, {
            toValue,
            speed: 12,
            bounciness: 4,
            isInteraction: false,
            useNativeDriver: true
        }) : Animated.timing(animTransfrom, {
            toValue,
            duration,
            easing: Easing.out(Easing.ease),
            isInteraction: false,
            useNativeDriver: true
        });
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animOpacity, {
                    toValue,
                    duration,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                transformAnimation
            ])
        ]).start();
    }

    public render (): JSX.Element {
        const { animOpacity, animTransfrom, keyboardHeight } = this.state;
        const { icon, visible } = this.props;
        const pointerEvents = visible ? 'auto' : 'none';
        const animatedStyle = [
            {
                opacity: animOpacity,
                transform: [{
                    translateY: animTransfrom.interpolate({
                        inputRange: [0, 1],
                        outputRange: [keyboardHeight, 0]
                    })
                }]
            }
        ];
        const containerStyle = [
            styles.container,
            animatedStyle,
            { bottom: styles.container.bottom + keyboardHeight }
        ];

        return (
            <Animated.View style={containerStyle} pointerEvents={pointerEvents}>
                <TouchableScale onPress={debounce(this.onPress, 500, { 'leading': true, 'trailing': false })}>
                    <View style={styles.button}>
                        <LinearGradient
                            angle={160}
                            colors={GRADIENT_COLORS}
                            style={[styles.fullSpace, styles.gradient]}
                            useAngle={true}
                        />
                        <FadeInImage
                            resizeMode={'contain'}
                            source={icon || ICON}
                            containerCustomStyle={styles.icon}
                            tintColor={styles.icon.color}
                        />
                    </View>
                </TouchableScale>
            </Animated.View>
        );
    }
}

export default CustomKeyboardButton;
