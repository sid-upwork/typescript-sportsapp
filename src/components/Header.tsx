import React, { Component } from 'react';
import { View, Animated, Text, Easing, ImageSourcePropType, Alert } from 'react-native';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { setDrawerOpened } from '../store/modules/userInterface';
import i18n from '../utils/i18n';
import { isAndroid } from '../utils/os';

import FadeInImage from './FadeInImage';
import LinearGradient from 'react-native-linear-gradient';
import TouchableScale from './TouchableScale';

import colors from '../styles/base/colors.style';
import { viewportHeight } from '../styles/base/metrics.style';
import styles, { GRADIENT_COLORS_BLACK, GRADIENT_COLORS_PURPLE } from '../styles/components/Header.style';

export type THeaderMode = 'placeholder' | 'menu' | 'menuWhite' | 'backPink' | 'backWhite' | 'closePink' | 'closeWhite';

interface IProps {
    animatedValue?: Animated.Value;
    confirm?: boolean;
    confirmProps?: {
        message?: string;
        title?: string;
    };
    gradientAlwaysVisible?: boolean;
    gradientColors?: string[] | 'black' | 'purple';
    landscape?: boolean;
    mode: THeaderMode;
    navigation: any;
    noGradient?: boolean;
    onPressClose?: () => void;
    style?: any;
    title?: string;
    titlePreventTouchThrough?: boolean;
    titleStyle?: any;
    setDrawerOpened: (opened: boolean) => void;
}

interface IState {
    iconAnimationOpacity: Animated.Value;
    iconAnimationTransform: Animated.Value;
}

const MENU_ICON = require('../static/Header/menu.png');
const CLOSE_ICON = require('../static/Header/close.png');
const BACK_ICON = require('../static/Header/back.png');

const ACTIVE_OPACITY: number = 0.7;

class Header extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            iconAnimationOpacity: new Animated.Value(0),
            iconAnimationTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateIcon();
    }

    private animateIcon (): void {
        const { iconAnimationOpacity, iconAnimationTransform } = this.state;

        Animated.sequence([
            Animated.parallel([
                Animated.timing(iconAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(iconAnimationTransform, {
                    toValue: 1,
                    speed: 10,
                    bounciness: 4,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private get headerMode (): string {
        const { mode, navigation } = this.props;

        if (mode === 'menu' || !navigation) {
            return mode;
        }

        // How to retrieve the navigation options passed to the StackNavigator in `routes.ts`?
        const isModal = navigation.getParam('modal') === true;
        const color = mode && !!mode.match(/pink/i) ? 'Pink' : 'White';

        return `${isModal ? 'close' : 'back'}${color}`;
    }

    private openMenu = (): void => {
        const { setDrawerOpened: openMenu } = this.props;
        openMenu && openMenu(true);
    }

    private navigateBack = (): void => {
        const { confirm, confirmProps, navigation } = this.props;
        const navigate = () => {
            // Security in case something bad happens: if there's no more view in the navigation stack, go to Training
            // TODO: make sure there's no side effects of any kind!
            if (navigation?.isFirstRouteInParent && navigation?.isFirstRouteInParent()) {
                navigation && navigation.replace({ routeName: 'Training' });
            } else {
                navigation && navigation.goBack();
            }
        };
        if (confirm) {
            Alert.alert(
                confirmProps && confirmProps.title || i18n.t('global.defaultConfirmTitle'),
                confirmProps && confirmProps.message || i18n.t('global.defaultConfirmMessage'),
                [
                    {
                        text: i18n.t('global.cancel'),
                        style: 'cancel'
                    },
                    {
                        text: i18n.t('global.confirm'),
                        onPress: navigate
                    }
                ],
                { cancelable: false }
            );
        } else {
            navigate();
        }
    }

    private getIconAnimatedDuplicate (source: ImageSourcePropType | string, iconStyle: any): JSX.Element | null {
        const { animatedValue } = this.props;
        if (!animatedValue) {
            return null;
        }
        const effectStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.38],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            })
        };
        return (
            <View style={styles.effectContainer}>
                <Animated.Image source={source} style={[iconStyle, { tintColor: 'white' }, effectStyle]} />
            </View>
        );
    }

    private get placeholder (): JSX.Element {
        const { landscape } = this.props;
        return (
            <View style={[styles.button, landscape ? styles.buttonLandscape : {}]} />
        );
    }

    private get menu (): JSX.Element {
        const { landscape } = this.props;
        return (
            <TouchableScale
                activeOpacity={ACTIVE_OPACITY}
                onPress={this.openMenu}
                style={[styles.button, landscape ? styles.buttonLandscape : {}]}
            >
                <FadeInImage source={MENU_ICON} containerCustomStyle={styles.menu} />
                { this.getIconAnimatedDuplicate(MENU_ICON, styles.menu) }
            </TouchableScale>
        );
    }

    private get menuWhite (): JSX.Element {
        const { landscape } = this.props;
        return (
            <TouchableScale
                activeOpacity={ACTIVE_OPACITY}
                onPress={this.openMenu}
                style={[styles.button, landscape ? styles.buttonLandscape : {}]}
            >
                <FadeInImage source={MENU_ICON} containerCustomStyle={styles.menu} tintColor={'white'} />
            </TouchableScale>
        );
    }

    private get closePink (): JSX.Element {
        const { landscape, onPressClose } = this.props;
        return (
            <TouchableScale
                activeOpacity={ACTIVE_OPACITY}
                onPress={onPressClose || this.navigateBack}
                style={[styles.button, landscape ? styles.buttonLandscape : {}]}
            >
                <FadeInImage source={CLOSE_ICON} containerCustomStyle={styles.close} tintColor={colors.pink} />
                { this.getIconAnimatedDuplicate(CLOSE_ICON, styles.close) }
            </TouchableScale>
        );
    }

    private get closeWhite (): JSX.Element {
        const { landscape, onPressClose } = this.props;
        return (
            <TouchableScale
                activeOpacity={ACTIVE_OPACITY}
                onPress={onPressClose || this.navigateBack}
                style={[styles.button, landscape ? styles.buttonLandscape : {}]}
            >
                <FadeInImage source={CLOSE_ICON} containerCustomStyle={styles.close} tintColor={'white'} />
            </TouchableScale>
        );
    }

    private get backPink (): JSX.Element {
        const { landscape } = this.props;
        const icon = isAndroid ? CLOSE_ICON : BACK_ICON;
        return (
            <TouchableScale
                activeOpacity={ACTIVE_OPACITY}
                onPress={this.navigateBack}
                style={[styles.button, landscape ? styles.buttonLandscape : {}]}
            >
                <FadeInImage source={icon} containerCustomStyle={styles.back} tintColor={colors.pink} />
                { this.getIconAnimatedDuplicate(icon, styles.back) }
            </TouchableScale>
        );
    }

    private get backWhite (): JSX.Element {
        const { landscape } = this.props;
        const icon = isAndroid ? CLOSE_ICON : BACK_ICON;
        return (
            <TouchableScale
                activeOpacity={ACTIVE_OPACITY}
                onPress={this.navigateBack}
                style={[styles.button, landscape ? styles.buttonLandscape : {}]}
            >
                <FadeInImage source={icon} containerCustomStyle={styles.back} tintColor={'white'} />
            </TouchableScale>
        );
    }

    private get title (): JSX.Element {
        const { animatedValue, title, titlePreventTouchThrough, titleStyle } = this.props;
        if (!title) {
            return;
        }
        const inputRange = [viewportHeight * 0.3, viewportHeight * 0.45];
        const animatedStyle: any = animatedValue ? {
            opacity: animatedValue.interpolate({
                inputRange,
                outputRange: [0, 1],
                extrapolate: 'clamp'
            }),
            transform: [{
                translateY: animatedValue.interpolate({
                    inputRange,
                    outputRange: [14, 0],
                    extrapolate: 'clamp'
                })
            }]
        } : {
            opacity: 1
        };
        return (
            <Animated.View
                style={[styles.titleContainer, animatedStyle]}
                pointerEvents={titlePreventTouchThrough === false ? 'none' : 'auto'}
            >
                <Text
                    numberOfLines={2}
                    style={[styles.title, titleStyle]}
                >
                    { title }
                </Text>
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        const { animatedValue, gradientAlwaysVisible, gradientColors, landscape, mode, noGradient, style } = this.props;
        const { iconAnimationOpacity, iconAnimationTransform } = this.state;

        let gradient = null;
        if (!noGradient) {
            let gColors: any = GRADIENT_COLORS_PURPLE;
            if (gradientColors === 'black') {
                gColors = GRADIENT_COLORS_BLACK;
            } else if (gradientColors) {
                gColors = gradientColors;
            }

            gradient = (
                <LinearGradient
                    colors={gColors}
                    style={styles.gradient}
                />
            );
        }

        const animatedStyle: any = animatedValue && !gradientAlwaysVisible ? {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.25, viewportHeight * 0.55],
                outputRange: [0, 0, 1],
                extrapolate: 'clamp'
            })
        } : {
            opacity: gradientAlwaysVisible ? 1 : 0
        };

        const iconAnimatedStyle = {
            opacity: iconAnimationOpacity,
            transform: [
                {
                    scale: iconAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1]
                    })
                }
            ]
        };

        return (
            <View pointerEvents={'box-none'} style={[styles.container, style]}>
                <Animated.View pointerEvents={'none'} style={[styles.gradientContainer, animatedStyle]}>
                    { gradient }
                </Animated.View>
                <View pointerEvents={'none'} style={[styles.offset, landscape ? styles.offsetLandscape : {}]} />
                <View pointerEvents={'box-none'} style={styles.containerInner}>
                    <Animated.View style={iconAnimatedStyle}>
                        { mode && this[mode] }
                    </Animated.View>
                    { this.title }
                </View>
            </View>
        );
    }
}

export default connect(null, { setDrawerOpened })(withNavigation(Header));
