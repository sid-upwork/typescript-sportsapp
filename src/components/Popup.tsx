import React, { Component } from 'react';
import { TouchableOpacity, Image, View, Animated, ScrollView, ScrollViewProps, Text, ImageSourcePropType } from 'react-native';
import { get } from 'lodash';
import i18n from '../utils/i18n';
import { isIOS, isAndroid } from '../utils/os';
import chroma from 'chroma-js';

import LinearGradient from 'react-native-linear-gradient';

import BlurWrapper from './BlurWrapper';
import DiffuseShadow from './DiffuseShadow';
import TouchableScale from './TouchableScale';

import { viewportHeight, viewportWidth } from '../styles/base/metrics.style';
import colors from '../styles/base/colors.style';
import styles, { CLOSE_BUTTON_BOTTOM_HEIGHT, POPUP_WIDTH_ON_POSITION_CENTER } from '../styles/components/Popup.style';

const CLOSE_ICON = require('../static/icons/close-white-thick.png');
const OVERLAY_ANIMATION_DURATION = 250;
const POPUP_ANIMATION_DURATION = 250;
const SCROLLVIEW_FADE_EFFET_DEFAULT_HEIGHT = 30;
const DEFAULT_BORDER_RADIUS = 30;
const DEFAULT_GRADIENT_COLORS = [colors.orangeDark, colors.pink];

interface IScrollViewParams {
    fadeEffectTop?: boolean;
    fadeEffectBottom?: boolean;
    fadeEffectColorTop?: string;
    fadeEffectColorBottom?: string;
    fadeEffectHeight?: number;
}

interface IActionButtonParams {
    ButtonComponent?: JSX.Element;
    label?: string;
    onPress?: Function;
    style?: any;
    touchableScale?: boolean;
}

export interface IPopupParams {
    actionButton?: boolean;
    actionButtonParams?: IActionButtonParams;
    backgroundColors?: string[];
    backgroundType?: 'color' | 'gradient';
    BackgroundComponent?: JSX.Element;
    borderRadius?: number;
    ContentComponent: any;
    ContentComponentProps?: any;
    closeButtonBackgroundColor?: string;
    closeButtonIcon?: ImageSourcePropType | string;
    closeButtonIconColor?: string;
    closeButtonIconSize?: number;
    displayCloseButton?: boolean;
    height?: number;
    onOpen?: () => void;
    onClose?: () => void;
    overflow?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
    position?: 'bottom' | 'center';
    preventOverlayDismissal?: boolean;
    scrollView?: boolean;
    scrollViewParams?: IScrollViewParams;
    scrollViewProps?: ScrollViewProps;
    style?: any;
    title?: string;
    titleStyle?: any;
    width?: number;
}

interface IProps {
    onPopupDismissed: () => void;
    params: IPopupParams;
}

interface IState {
    visible: boolean;
    overlayAnimationOpacity: Animated.Value;
    popupAnimationTransform: Animated.Value;
}

class Popup extends Component<IProps, IState> {

    private animating: boolean = false;

    constructor (props: IProps) {
        super(props);
        this.state = {
            visible: false,
            overlayAnimationOpacity: new Animated.Value(0),
            popupAnimationTransform: new Animated.Value(1)
        };
    }

    public componentDidMount (): void {
        const { params } = this.props;
        this.animate(false, () => {
            params && params.onOpen && params.onOpen();
        });
    }

    public componentDidUpdate (): void {
        this.animate();
    }

    public dismiss = (): void => {
        const { onPopupDismissed, params } = this.props;
        if (!this.animating) {
            // We animate the popup out and when it's done we notify PopupManager that our popup was dismissed
            this.animate(true, () => {
                onPopupDismissed();
                params && params.onClose && params.onClose();
            });
        }
    }

    private animate (out?: boolean, callback?: () => void): void {
        const { overlayAnimationOpacity, popupAnimationTransform } = this.state;
        this.animating = true;

        if (out) {
            Animated.parallel([
                Animated.timing(overlayAnimationOpacity, {
                    toValue: 0,
                    duration: OVERLAY_ANIMATION_DURATION,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.timing(popupAnimationTransform, {
                    toValue: 1,
                    duration: POPUP_ANIMATION_DURATION,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ]).start(() => {
                this.animating = false;
                callback && callback();
            });
        } else {
            Animated.parallel([
                Animated.timing(overlayAnimationOpacity, {
                    toValue: 1,
                    duration: OVERLAY_ANIMATION_DURATION,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(popupAnimationTransform, {
                    toValue: 0,
                    bounciness: 5,
                    speed: 12,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ]).start(() => {
                this.animating = false;
                callback && callback();
            });
        }
    }

    private get overflowRule (): {} {
        const { overflow } = this.props.params;
        return { overflow: overflow ? 'visible' : 'hidden' };
    }

    private getScrollViewFade (position: 'top' | 'bottom'): JSX.Element {
        const { backgroundColors, backgroundType } = this.props.params;
        const isTop = position === 'top';
        const height = get(this.props, 'params.scrollViewParams.fadeEffectHeight') || SCROLLVIEW_FADE_EFFET_DEFAULT_HEIGHT;
        const fadeEffectColorTop = get(this.props, 'params.scrollViewParams.fadeEffectColorTop');
        const fadeEffectColorBottom = get(this.props, 'params.scrollViewParams.fadeEffectColorBottom');

        let topColor: string;
        let bottomColor: string;
        if (fadeEffectColorTop || fadeEffectColorBottom) {
            topColor = fadeEffectColorTop || 'white';
            bottomColor = fadeEffectColorTop || 'white';
        } else {
            if (backgroundType === 'gradient') {
                topColor = backgroundColors ? backgroundColors[0] : DEFAULT_GRADIENT_COLORS[0];
                bottomColor = backgroundColors ? backgroundColors[1] : DEFAULT_GRADIENT_COLORS[1];
            } else {
                topColor = backgroundColors ? backgroundColors[0] : 'white';
                bottomColor = backgroundColors ? backgroundColors[0] : 'white';
            }
        }

        const overlayColors: string[] = [
            chroma(isTop ? topColor : bottomColor).alpha(isTop ? 1 : 0).css(),
            chroma(isTop ? topColor : bottomColor).alpha(isTop ? 0 : 1).css()
        ];

        const gradientStyles = [
            styles.scrollViewGradientInner,
            {
                height,
                top: isTop ? 0 : null,
                bottom: !isTop ? 0 : null
            }
        ];

        return (
            <View
                pointerEvents={'none'}
                style={[styles.scrollViewGradient, this.borderRadiusStyle]}
            >
                <LinearGradient
                    colors={overlayColors}
                    locations={[0, 1]}
                    pointerEvents={'none'}
                    style={gradientStyles}
                />
            </View>
        );
    }

    private get backgroundGradient (): JSX.Element {
        const { backgroundColors, backgroundType, position } = this.props.params;
        const gradientColors = backgroundColors && backgroundColors.length > 1 ?
            backgroundColors : DEFAULT_GRADIENT_COLORS;
        const bottom = position === 'bottom' && backgroundType === 'gradient' ? CLOSE_BUTTON_BOTTOM_HEIGHT : 0;

        if (backgroundType === 'gradient') {
            return (
                <LinearGradient
                    colors={gradientColors}
                    style={[styles.gradient, this.borderRadiusStyle, { bottom }]}
                />
            );
        } else {
            return null;
        }
    }

    private get borderRadiusStyle (): any {
        const { borderRadius, position } = this.props.params;

        const style = position === 'bottom' ? {
            borderTopLeftRadius: borderRadius ? borderRadius : DEFAULT_BORDER_RADIUS,
            borderTopRightRadius: borderRadius ? borderRadius : DEFAULT_BORDER_RADIUS
        } : {
            borderRadius: borderRadius ? borderRadius : DEFAULT_BORDER_RADIUS
        };

        return style;
    }

    private get overlay (): JSX.Element {
        const { overlayColor, overlayOpacity, preventOverlayDismissal } = this.props.params;
        const maxOpacity = overlayOpacity || (isAndroid ? 0.65 : 0.45);
        const color = overlayColor ? overlayColor : chroma(colors.violetDark).desaturate(2).darken(2.5).css();

        const overlayAnimatedStyles = [
            styles.fullSpace,
            {
                opacity: this.state.overlayAnimationOpacity,
                backgroundColor: chroma(color).alpha(maxOpacity).css()
            }
        ];

        const blur = isIOS ? (
            <BlurWrapper
                type={'vibrancy'}
                blurType={'light'}
                blurAmount={12}
                style={[styles.fullSpace, styles.overlayBlur]}
            />
        ) : null;

        const overlayInner = !preventOverlayDismissal ? (
            <TouchableOpacity activeOpacity={1} onPress={this.dismiss} style={styles.overlayInner} />
        ) : (
            <View style={styles.overlayInner} />
        );

        return (
            <Animated.View style={overlayAnimatedStyles}>
                { blur }
                { overlayInner }
            </Animated.View>
        );
    }

    private get title (): JSX.Element {
        const { backgroundType, scrollViewParams, title, titleStyle, scrollView } = this.props.params;
        const color = backgroundType === 'gradient' ? 'white' : colors.violetDark;
        let paddingTop = SCROLLVIEW_FADE_EFFET_DEFAULT_HEIGHT;

        if (scrollView !== false && scrollViewParams?.fadeEffectTop !== false) {
            paddingTop = 0;
        }

        return title ? (
            <Text style={[styles.title, { color, paddingTop }, titleStyle]}>{ title }</Text>
        ) : null;
    }

    private get actionButton (): JSX.Element {
        const { actionButton, actionButtonParams } = this.props.params;

        if (!actionButton) {
            return;
        }

        const label = actionButtonParams && actionButtonParams.label || i18n.t('popup.defaultActionButtonLabel');
        const onPress = () => {
            actionButtonParams && actionButtonParams.onPress && actionButtonParams.onPress();
            this.dismiss();
        };
        const ButtonComponent = actionButtonParams && actionButtonParams.ButtonComponent || (
            <View style={[styles.actionButton, actionButtonParams && actionButtonParams.style]}>
                <Text numberOfLines={1} style={styles.actionButtonLabel}>{ label }</Text>
            </View>
        );

        return actionButtonParams && actionButtonParams.touchableScale ? (
            <TouchableScale activeScale={1.05} onPress={onPress}>
                { ButtonComponent }
            </TouchableScale>
        ) : (
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                { ButtonComponent }
            </TouchableOpacity>
        );
    }

    private get content (): JSX.Element {
        const {
            ContentComponent,
            ContentComponentProps,
            scrollView,
            scrollViewProps,
            scrollViewParams
        } = this.props.params;
        const topFade = scrollViewParams && scrollViewParams.fadeEffectTop === false ? false : true;
        const bottomFade = scrollViewParams && scrollViewParams.fadeEffectBottom === false ? false : true;
        const paddingVertical = scrollViewParams && scrollViewParams.fadeEffectHeight || SCROLLVIEW_FADE_EFFET_DEFAULT_HEIGHT;

        return scrollView === false ? (
            <View style={[{ flex: 1 }, this.overflowRule]}>
                { this.title }
                <ContentComponent dismissPopup={this.dismiss} {...ContentComponentProps} />
                { this.actionButton }
            </View>
        ) : (
            <View style={[{ flex: 1 }, this.overflowRule]}>
                <ScrollView
                    contentContainerStyle={{ paddingVertical }}
                    showsVerticalScrollIndicator={false}
                    {...scrollViewProps}
                >
                    { this.title }
                    <ContentComponent dismissPopup={this.dismiss} {...ContentComponentProps} />
                    { this.actionButton }
                </ScrollView>
                { topFade && this.getScrollViewFade('top') }
                { bottomFade && this.getScrollViewFade('bottom') }
            </View>
        );
    }

    private get closeButton (): JSX.Element {
        const {
            closeButtonBackgroundColor,
            closeButtonIcon,
            closeButtonIconColor,
            closeButtonIconSize,
            displayCloseButton,
            position
        } = this.props.params;

        const buttonContainerStyles = [
            position === 'bottom' ? styles.closeButtonContainerBottom : styles.closeButtonContainerTop
        ];

        const buttonStyles = [
            position === 'bottom' ? styles.closeButtonBottom : styles.closeButtonTop,
            {
                backgroundColor: closeButtonBackgroundColor ?
                    closeButtonBackgroundColor :
                    (position === 'bottom' ? 'transparent' : colors.violetDark)
            }
        ];

        const iconStyles = [
            styles.closeButtonIcon,
            closeButtonIconSize ? {
                width: closeButtonIconSize,
                height: closeButtonIconSize
            } : {},
            {
                tintColor: closeButtonIconColor ?
                    closeButtonIconColor :
                    (position === 'bottom' ? colors.violetDark : 'white')
            }
        ];

        return displayCloseButton === false ? null : (
            <View style={buttonContainerStyles}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={this.dismiss}
                    style={buttonStyles}
                >
                    <Image source={closeButtonIcon || CLOSE_ICON} style={iconStyles} />
                </TouchableOpacity>
            </View>
        );
    }

    public render (): JSX.Element {
        const {
            backgroundColors,
            BackgroundComponent,
            backgroundType,
            borderRadius,
            height,
            position,
            style,
            width
        } = this.props.params;

        const popupWidth = width ? width : (position === 'bottom' ? viewportWidth : POPUP_WIDTH_ON_POSITION_CENTER);
        const popupHeight = height ? height : Math.round(viewportHeight * 0.5);

        let popupBackgroundColor;
        if (backgroundType === 'gradient') {
            if (position === 'bottom') {
                popupBackgroundColor = backgroundColors ? backgroundColors[1] : DEFAULT_GRADIENT_COLORS[1];
            } else {
                popupBackgroundColor = backgroundColors ? backgroundColors[0] : 'white';
            }
        } else {
            popupBackgroundColor = backgroundColors ? backgroundColors[0] : 'white';
        }

        const containerStyles: any = [
            styles.container,
            { justifyContent: position === 'bottom' ? 'flex-end' : 'center' }
        ];

        const animatedPopupStyles = [
            styles.popup,
            {
                transform: [{
                    translateY: this.state.popupAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, viewportHeight]
                    })
                }],
                width: popupWidth,
                height: popupHeight
            }
        ];

        const popupInnerStyle = [
            styles.popupInner,
            position === 'bottom' ? styles.popupInnerBottom : {},
            {
                backgroundColor: popupBackgroundColor
            },
            this.borderRadiusStyle,
            this.overflowRule,
            style
        ];

        return (
            <View style={containerStyles}>
                { this.overlay }
                <Animated.View style={animatedPopupStyles}>
                    { position !== 'bottom' ? <DiffuseShadow borderRadius={borderRadius ? borderRadius : DEFAULT_BORDER_RADIUS} /> : null }
                    <View style={popupInnerStyle}>
                        { this.backgroundGradient }
                        <View style={styles.popupBackground}>
                            { BackgroundComponent }
                        </View>
                        { this.content }
                        { position === 'bottom' ? this.closeButton : null }
                    </View>
                    { position !== 'bottom' ? this.closeButton : null }
                </Animated.View>
            </View>
        );
    }
}

export default Popup;
