import React, { PureComponent } from 'react';
import { TouchableOpacity, Animated, View, ViewStyle } from 'react-native';
import colors from '../styles/base/colors.style';
import styles, { THUMB_SIZE, SWITCH_WIDTH, THUMB_PADDING } from '../styles/components/Switch.style';

interface IProps {
    onChange: (value: boolean) => void;
    disabled?: boolean;
    style?: ViewStyle;
    value: boolean;
    borderColor?: {true?: string; false?: string};
    thumbColor?: {true?: string; false?: string};
    trackColor?: {true?: string; false?: string};
}

interface IState {
    animThumbTransform: Animated.Value;
    value: boolean;
}

export default class Switch extends PureComponent<IProps, IState> {
    public static defaultProps: IProps = {
        onChange: null,
        disabled: false,
        style: {},
        value: true,
        borderColor: {true: colors.pink, false: colors.pink},
        thumbColor: {true: colors.white, false: colors.pink},
        trackColor: {true: colors.pink, false: colors.white}
    };

    constructor (props: IProps) {
        super(props);
        this.state = {
            animThumbTransform: new Animated.Value(this.props.value ? 1 : 0),
            value: this.props.value
        };
    }

    private animateSwitch (): void {
        const { value, animThumbTransform } = this.state;
        Animated.timing(animThumbTransform, {
            toValue: value ? 1 : 0,
            duration: 300,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private borderColor (): string {
        const { borderColor } = this.props;
        const { value } = this.state;

        let color;
        if (value) {
            color = colors.pink; // #D57EEA
        } else {
            color = colors.pink; // #D57EEA
        }

        if (borderColor) {
            if (borderColor.true && value) {
                color = borderColor.true;
            } else if (borderColor.false && !value) {
                color = borderColor.false;
            }
        }

        return color;
    }

    private falseBackgroundColor (): string {
        const { trackColor } = this.props;
        let color = '#FFFFFF';
        if (trackColor && trackColor.false) {
            color = trackColor.false;
        }
        return color;
    }

    private thumbColor (): string {
        const { thumbColor } = this.props;
        const { value } = this.state;

        let color;
        if (value) {
            color = '#FFFFFF';
        } else {
            color = colors.pink; // #D57EEA
        }

        if (thumbColor) {
            if (thumbColor.true && value) {
                color = thumbColor.true;
            } else if (thumbColor.false && !value) {
                color = thumbColor.false;
            }
        }

        return color;
    }

    private trueBackgroundColor (): string {
        const { trackColor } = this.props;
        let color = colors.pink; // #D57EEA
        if (trackColor && trackColor.true) {
            color = trackColor.true;
        }
        return color;
    }

    private onPress = (): void => {
        const { onChange } = this.props;
        this.setState( { value: !this.state.value }, () => {
            this.animateSwitch();
            if (onChange) {
                onChange(this.state.value);
            }
        });
    }

    public render (): JSX.Element {
        const { style, disabled } = this.props;
        const { animThumbTransform } = this.state;

        const tranlateOffValue = THUMB_PADDING;
        const tranlateOnValue = SWITCH_WIDTH - THUMB_SIZE - THUMB_PADDING;
        const animatedThumbStyle = {
            transform: [
                {
                    translateX: animThumbTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [tranlateOffValue, tranlateOnValue]
                    })
                }
            ]
        };
        const animatedTrueBackgroundStyle = {
            opacity: animThumbTransform,
            transform: [
                {
                    scale: animThumbTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1]
                    })
                }
            ]
        };

        const containerStyle = [
            styles.container,
            { borderColor: this.borderColor() }
        ];
        const falseBackgroundStyle = [
            styles.background,
            { backgroundColor: this.falseBackgroundColor() }
        ];
        const trueBackgroundStyle = [
            animatedTrueBackgroundStyle,
            styles.background,
            { backgroundColor: this.trueBackgroundColor() }
        ];
        const thumbStyle = [
            animatedThumbStyle,
            styles.thumb,
            { backgroundColor: this.thumbColor() }
        ];

        return (
            <View style={style}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={this.onPress}
                    style={containerStyle}
                    disabled={disabled}
                >
                    <Animated.View style={falseBackgroundStyle} />
                    <Animated.View style={trueBackgroundStyle} />
                    <Animated.View style={thumbStyle} />
                </TouchableOpacity>
            </View>
        );
    }
}
