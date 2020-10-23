import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import chroma from 'chroma-js';
import DiffuseShadow, { IDiffuseShadowProps } from './DiffuseShadow';
import TouchableScale from './TouchableScale';
import colors from '../styles/base/colors.style';
import styles, { PINK_GRADIENT_COLORS, BLUE_GRADIENT_COLORS } from '../styles/components/SharedButton.style';

interface IProps {
    activeOpacity?: number;
    backgroundBorderColor?: string;
    borderRadius?: number;
    buttonContentStyle?: any;
    color?: 'blue' | 'pink' | 'white';
    containerStyle?: any;
    icon?: any;
    iconStyle?: any;
    isTouchableScale?: boolean;
    onPress?: any;
    shadowProps?: IDiffuseShadowProps;
    style?: any;
    text?: string;
    textStyle?: any;
    withBackgroundBorders?: boolean;
    withShadow?: boolean;
}

export default class SharedButton extends Component<IProps> {
    public static defaultProps: IProps = {
        activeOpacity: 1,
        borderRadius: 14,
        color: 'blue',
        isTouchableScale: true,
        withBackgroundBorders: false,
        withShadow: false
    };

    constructor (props: IProps) {
        super(props);
    }

    private get content (): JSX.Element {
        const { buttonContentStyle, color, icon, text, textStyle } = this.props;
        const buttonStyle = [
            styles.buttonContent,
            icon && text ? styles.buttonContentWithIcon : {},
            buttonContentStyle || {}
        ];
        const buttonTextStyle = [
            styles.buttonText,
            {
                color: color === 'white' ? colors.violetDark : colors.white,
                marginLeft: icon ? 15 : 0
            },
            {
                textAlign: icon ? 'left' : 'center'
            },
            textStyle
        ];

        return (
            <View style={buttonStyle}>
                { this.icon }
                { text &&
                    <Text style={buttonTextStyle}>{ text }</Text>
                }
            </View>
        );
    }

    private get icon (): JSX.Element {
        const { color, icon, iconStyle } = this.props;
        if (!icon) {
            return;
        }
        const iconStyles = [
            styles.buttonIcon,
            iconStyle,
            {
                tintColor: color === 'white' ? colors.violetDark : colors.white
            }
        ];
        return (
            <Image source={icon} style={iconStyles} />
        );
    }

    private get gradient (): JSX.Element {
        const { borderRadius, color } = this.props;
        if (color === 'white') {
            return;
        }
        const gradientColors = color === 'blue' ? BLUE_GRADIENT_COLORS : PINK_GRADIENT_COLORS;
        const style = [
            styles.buttonGradient,
            {
                borderRadius: borderRadius ? borderRadius : 0
            }
        ];
        return (
            <LinearGradient
                angle={176}
                colors={gradientColors}
                style={style}
                useAngle={true}
            />
        );
    }

    private get shadow (): JSX.Element {
        const { shadowProps, withShadow } = this.props;
        if (!withShadow) {
            return;
        }
        return (
            <DiffuseShadow
                color={chroma(colors.blueDark).darken(2.5).css()}
                style={styles.diffuseShadow}
                horizontalOffset={25}
                shadowOpacity={0.35}
                verticalOffset={18}
                { ...shadowProps }
            />
        );
    }

    public render (): JSX.Element {
        const {
            activeOpacity, backgroundBorderColor, borderRadius: br, color, containerStyle,
            isTouchableScale, onPress, style, withBackgroundBorders
        } = this.props;
        const ButtonType = isTouchableScale ? TouchableScale : TouchableOpacity;
        const borderRadius = br || 0;
        const buttonContainerStyle = [
            styles.buttonContainer,
            color === 'white' ? styles.buttonContainerWhiteBackground : {},
            withBackgroundBorders ? styles.buttonContainerWithBackgroundBorders : {},
            { borderRadius },
            containerStyle
        ];
        const buttonBackgroundStyle = [
            styles.buttonBackground,
            {
                borderRadius,
                borderColor: backgroundBorderColor ? backgroundBorderColor : styles.buttonBackground.borderColor
            }
        ];
        const buttonContentContainerStyle = [
            styles.buttonContentContainer,
            color === 'white' ? styles.buttonContentContainerWhite : {},
            { borderRadius },
            style
        ];

        let buttonBackground;
        if (withBackgroundBorders) {
            buttonBackground = <View style={buttonBackgroundStyle} />;
        }

        return (
            <ButtonType
                onPress={onPress}
                activeOpacity={activeOpacity}
                style={buttonContainerStyle}
            >
                { this.shadow }
                { buttonBackground }
                <View style={buttonContentContainerStyle}>
                    { this.gradient }
                    { this.content }
                </View>
            </ButtonType>
        );
    }
}
