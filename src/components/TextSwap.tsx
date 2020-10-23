import React, { Component } from 'react';
import { Animated, Easing, View, Text, TextProps } from 'react-native';

interface IProps extends TextProps {
    containerStyle?: any;
    disablePadding?: boolean;
    durationIn?: number;
    durationOut?: number;
    effectDirection?: 'top' | 'bottom' | 'left' | 'right';
    fixedSize?: boolean;
    forceAnimation?: boolean;
    label: string;
    longestValue?: string;
    startDelay?: number;
    swapDelay?: number;
    translateValue?: number;
    verticalAlignment?: 'flex-start' | 'flex-end' | 'center';
}

interface IState {
    prevAnimOpacity: Animated.Value;
    prevAnimTransform: Animated.Value;
    prevLabel: string;
    newAnimOpacity: Animated.Value;
    newAnimTransform: Animated.Value;
    newLabel: string;
}

export default class TextSwap extends Component<IProps, IState> {

    private lastUpdate: number;

    constructor (props: IProps) {
        super(props);
        this.state = {
            prevAnimOpacity: new Animated.Value(0),
            prevAnimTransform: new Animated.Value(0),
            prevLabel: '',
            newAnimOpacity: new Animated.Value(1),
            newAnimTransform: new Animated.Value(1),
            newLabel: props.label
        };
        this.lastUpdate = Date.now();
    }

    public static defaultProps: IProps = {
        disablePadding: false,
        durationIn: 150,
        durationOut: 150,
        effectDirection: 'top',
        fixedSize: false,
        label: '',
        startDelay: 0,
        swapDelay: 100,
        translateValue: 20,
        verticalAlignment: 'flex-start'
    };

    public componentDidUpdate (prevProps: IProps): void {
        const { label: prevLabel } = prevProps;
        const { label: newLabel, forceAnimation, startDelay, swapDelay, durationIn, durationOut } = this.props;
        const elapsedTime = Date.now() - this.lastUpdate;
        const forceUpdate = forceAnimation && (elapsedTime > (startDelay + swapDelay + durationIn + durationOut));

        if (newLabel !== prevLabel || forceUpdate) {
            this.lastUpdate = Date.now();
            this.setState({ prevLabel, newLabel }, () => {
                this.setAnimationStartValues();
                this.animate();
            });
        }
    }

    private setAnimationStartValues (): void {
        const { prevAnimOpacity, prevAnimTransform, newAnimOpacity, newAnimTransform } = this.state;
        prevAnimOpacity.setValue(1);
        prevAnimTransform.setValue(1);
        newAnimOpacity.setValue(0);
        newAnimTransform.setValue(0);
    }

    private animate (): void {
        const { prevAnimOpacity, prevAnimTransform, newAnimOpacity, newAnimTransform } = this.state;
        const { durationIn, durationOut, startDelay, swapDelay } = this.props;

        Animated.sequence([
            Animated.delay(startDelay),
            Animated.parallel([
                Animated.parallel([
                    Animated.timing(prevAnimOpacity, {
                        toValue: 0,
                        duration: durationIn,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.timing(prevAnimTransform, {
                        toValue: 0,
                        duration: durationIn,
                        easing: Easing.out(Easing.poly(4)),
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ]),
                Animated.parallel([
                    Animated.delay(swapDelay),
                    Animated.timing(newAnimOpacity, {
                        toValue: 1,
                        duration: durationOut,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(newAnimTransform, {
                        toValue: 1,
                        speed: 14,
                        bounciness: 10,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ])
        ]).start();
    }

    private getPadding (type: 'top' | 'bottom' | 'left' | 'right'): number {
        const { containerStyle, disablePadding, translateValue } = this.props;

        if (disablePadding) {
            return 0;
        }

        if (!containerStyle) {
            return translateValue;
        }

        const { paddingTop, paddingBottom, paddingVertical, paddingLeft, paddingRight, paddingHorizontal } = containerStyle;

        // The goal is to make sure that the replacement animation can be seen
        if (type === 'top' && (paddingTop || paddingVertical)) {
            return Math.max(paddingTop || paddingVertical, translateValue);
        } else if (type === 'bottom' && (paddingBottom || paddingVertical)) {
            return Math.max(paddingBottom || paddingVertical, translateValue);
        } else if (type === 'left' && (paddingLeft || paddingHorizontal)) {
            return Math.max(paddingLeft || paddingHorizontal, translateValue);
        } else if (type === 'right' && (paddingRight || paddingHorizontal)) {
            return Math.max(paddingRight || paddingHorizontal, translateValue);
        } else {
            return translateValue;
        }
    }

    private generateSizeHolderLabel (uppercase?: boolean, length: number = 1): string {
        // Use a mix of large and thin letters to prevent issues
        // WARNING: this triggers a rerender every time we swipe
        const characters = 'mnote';
        const charactersLength = characters.length;

        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return uppercase ? result.toUpperCase() : result;
    }

    private get sizeHolder (): JSX.Element {
        const { style, longestValue } = this.props;
        const regexRule = '[a-hj-kp-z\u00C0-\u024F]'; // https://stackoverflow.com/a/39134560/8412141

        let label = longestValue;
        label = label.replace(/\d/g, '0'); // Use the largest digit to prevent issues
        label = label.replace(new RegExp(regexRule, 'g'), 'n'); // Use a large lowercase letter to prevent issues
        label = label.replace(new RegExp(regexRule.toUpperCase(), 'g'), 'N'); // Use a large uppercase letter to prevent issues
        // label = label.replace(/[a-hj-z]/g, () => this.generateSizeHolderLabel(false));
        // label = label.replace(/[A-HJ-Z]/g, () => this.generateSizeHolderLabel(true));

        return (
            <Text {...this.props} style={[style || {}, { opacity: 0 }]}>{ label }</Text>
        );
    }

    public render (): JSX.Element {
        const { prevLabel, newLabel, prevAnimOpacity, prevAnimTransform, newAnimOpacity, newAnimTransform } = this.state;
        const { label, style, containerStyle, translateValue, verticalAlignment, fixedSize, longestValue, effectDirection } = this.props;

        const horizontalEffect = effectDirection === 'left' || effectDirection === 'right';
        const translateProp = horizontalEffect ? 'translateX' : 'translateY';
        const prevOutputMultiplier = effectDirection === 'bottom' || effectDirection === 'right' ? 1 : -1;
        const prevOutputValue = translateValue * prevOutputMultiplier;
        const prevAnimatedStyle = {
            opacity: prevAnimOpacity,
            transform: [{
                [translateProp]: prevAnimTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [prevOutputValue, 0]
                })
            }]
        };
        const newAnimatedStyle = {
            opacity: newAnimOpacity,
            transform: [{
                [translateProp]: newAnimTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-prevOutputValue, 0]
                })
            }]
        };

        const renderSizeHolder = fixedSize && longestValue && longestValue.length;
        const sizeHolder = renderSizeHolder ? this.sizeHolder : null;
        const absolutePositioning = { position: 'absolute', left: 0, right: 0, alignSelf: verticalAlignment };
        const prevStyle = [style || {}, prevAnimatedStyle, absolutePositioning];
        const newStyle = [style || {}, newAnimatedStyle, renderSizeHolder ? absolutePositioning : {}];
        const mainContainerStyle = [
            containerStyle || {},
            horizontalEffect ? {
                paddingLeft: this.getPadding('left'),
                paddingRight: this.getPadding('right')
            } : {
                paddingTop: this.getPadding('top'),
                paddingBottom: this.getPadding('bottom')
            }
        ];

        return label ? (
            <View style={mainContainerStyle}>
                <View style={{ flexDirection: 'row' }}>
                    { sizeHolder }
                    <Animated.Text {...this.props} style={prevStyle}>{ prevLabel }</Animated.Text>
                    <Animated.Text {...this.props} style={newStyle}>{ newLabel }</Animated.Text>
                </View>
            </View>
        ) : null;
    }
}
