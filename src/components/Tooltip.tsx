import React, { Component } from 'react';
import { Animated, Easing, View } from 'react-native';
import { ETooltipIds, IHiddenTooltipsState } from '../store/modules/tutorials';
import { IReduxState } from '../store/reducers';
import { IScreenProps } from '../index';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import i18n from '../utils/i18n';

import LinearGradient from 'react-native-linear-gradient';

import FadeInImage from './FadeInImage';
import TouchableScale from './TouchableScale';
import TooltipPopup from './Popups/Tooltip';

import colors from '../styles/base/colors.style';
import { viewportHeight, viewportWidth } from '../styles/base/metrics.style';
import styles, {
    BORDER_SCALE,
    GRADIENT_BLUE_COLORS,
    GRADIENT_ORANGE_COLORS
} from '../styles/components/Tooltip.style';

const ICON = require('../static/icons/question.png');

export interface IProps {
    apparitionDelay?: number;
    buttonStyle?: any;
    color?: string;
    containerStyle?: any;
    gradientType?: 'blue' | 'orange';
    hideTooltips: boolean;
    hiddenTooltips: IHiddenTooltipsState;
    iconColor?: string;
    tooltipId: ETooltipIds;
    screenProps: IScreenProps;
}

interface IState {
    animBorderOpacity: Animated.Value;
    animBorderTransfrom: Animated.Value;
    animContainerOpacity: Animated.Value;
    animContainerTransfrom: Animated.Value;
}

class Tooltip extends Component<IProps, IState> {

    private borderAnimationIsRunning: boolean;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animBorderOpacity: new Animated.Value(0),
            animBorderTransfrom: new Animated.Value(0),
            animContainerOpacity: new Animated.Value(0),
            animContainerTransfrom: new Animated.Value(0)
        };
        this.borderAnimationIsRunning = false;
    }

    public componentDidMount (): void {
        this.animate(true, true);
    }

    public componentDidUpdate (prevProps: IProps): void {
        if (!this.props.hiddenTooltips[this.props.tooltipId] && prevProps.hiddenTooltips[prevProps.tooltipId]) {
            this.state.animContainerOpacity.setValue(0);
            this.state.animContainerTransfrom.setValue(0);
            this.animate(true, true);
        }
    }

    private onPress = (): void => {
        // const title = this.getTooltipTitle();
        const message = this.getTooltipMessage();
        this.props.screenProps?.popupManagerRef?.current?.requestPopup({
            borderRadius: 38,
            closeButtonBackgroundColor: colors.pink,
            ContentComponent: TooltipPopup,
            ContentComponentProps: {
                message,
                tooltipId: this.props.tooltipId
            },
            height: Math.min(Math.round(viewportHeight * 0.55), 300),
            scrollView: false,
            width: Math.min(Math.round(viewportWidth * 0.75), 320)
            // title
        });
    }

    private animate (animateIn?: boolean, launchLoopedAnimation?: boolean): void {
        const { animContainerOpacity, animContainerTransfrom } = this.state;
        const { apparitionDelay } = this.props;
        const toValue = animateIn ? 1 : 0;
        const duration = animateIn ? 150 : 400;
        const delay = animateIn ? apparitionDelay || 0 : 0;
        const transformAnimation = animateIn ? Animated.spring(animContainerTransfrom, {
            toValue,
            speed: 12,
            bounciness: 4,
            isInteraction: false,
            useNativeDriver: true
        }) : Animated.timing(animContainerTransfrom, {
            toValue,
            duration,
            easing: Easing.out(Easing.ease),
            isInteraction: false,
            useNativeDriver: true
        });
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animContainerOpacity, {
                    toValue,
                    duration,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                transformAnimation
            ])
        ]).start(() => {
            if (launchLoopedAnimation && !this.borderAnimationIsRunning) {
                this.animateBorder();
            }
        });
    }

    private animateBorder (): void {
        const { animBorderOpacity, animBorderTransfrom } = this.state;
        const { apparitionDelay } = this.props;
        const toValue = 1;
        const duration = 450;
        const delay = 2500 + (apparitionDelay || 0);

        if (!this.borderAnimationIsRunning) {
            this.borderAnimationIsRunning = true;
        }

        animBorderOpacity.setValue(0);
        animBorderTransfrom.setValue(0);

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animBorderOpacity, {
                    toValue,
                    duration,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.timing(animBorderTransfrom, {
                    toValue,
                    duration,
                    easing: Easing.out(Easing.ease),
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start(() => {
            this.animateBorder();
        });
    }

    private getTooltipTitle (): string {
        const { tooltipId } = this.props;
        const title = i18n.t(`tooltips.content.${tooltipId}.title`);
        // i18n will return the last key if the previous ones are defined
        // or `undefined` if more than one key is missing
        return title !== 'title' ? title : undefined;
    }

    private getTooltipMessage (): string {
        const { tooltipId } = this.props;
        const message = i18n.t(`tooltips.content.${tooltipId}.message`);
        // i18n will return the last key if the previous ones are defined
        // or `undefined` if more than one key is missing
        return message !== 'message' ? message : undefined;
    }

    public render (): JSX.Element {
        const {
            animBorderOpacity, animBorderTransfrom,
            animContainerOpacity, animContainerTransfrom
        } = this.state;
        const {
            buttonStyle, containerStyle, gradientType, hideTooltips,
            hiddenTooltips, tooltipId, color, iconColor
        } = this.props;

        // Don't render anything if the user has requested not to see this tooltip again or if we don't have a message
        if (hideTooltips || hiddenTooltips[tooltipId] || !this.getTooltipMessage()) {
            return null;
        }

        const gradientColors = gradientType === 'blue' ? GRADIENT_BLUE_COLORS : GRADIENT_ORANGE_COLORS;
        const mainColor = color || gradientColors[0];
        const borderAnimatedStyle = {
            opacity: animBorderOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0]
            }),
            transform: [{
                scale: animBorderTransfrom.interpolate({
                    inputRange: [0, 1],
                    outputRange: [BORDER_SCALE, 1]
                })
            }],
            borderColor: mainColor
        };
        const animatedStyle = {
            opacity: animContainerOpacity,
            transform: [{ scale: animContainerTransfrom }]
        };
        const style = [
            styles.container,
            containerStyle || {},
            animatedStyle
        ];
        const btnStyle = [
            styles.button,
            buttonStyle,
            { backgroundColor: mainColor }
        ];
        const iconStyle = [
            styles.icon,
            { color: iconColor ? iconColor : colors.white }
        ];

        const gradient = !color ? (
            <LinearGradient
                angle={160}
                colors={gradientColors}
                style={[styles.fullSpace, styles.gradient]}
                useAngle={true}
            />
        ) : null;

        return (
            <Animated.View style={style}>
                <TouchableScale
                    onPress={debounce(this.onPress, 500, { 'leading': true, 'trailing': false })}
                    containerStyle={styles.fullSpace}
                    style={styles.container}
                >
                    <Animated.View style={[styles.fullSpace, styles.border, borderAnimatedStyle]} />
                    <View style={btnStyle}>
                        { gradient }
                        <FadeInImage
                            resizeMode={'contain'}
                            source={ICON}
                            containerCustomStyle={iconStyle}
                            tintColor={iconColor ? iconColor : colors.white}
                        />
                    </View>
                </TouchableScale>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    hideTooltips: state.tutorials.hideTooltips,
    hiddenTooltips: state.tutorials.hiddenTooltips
});

export default connect(mapStateToProps, null)(Tooltip);
