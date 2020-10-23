import React, { Component } from 'react';
import { View } from 'react-native';
import { BlurView, VibrancyView } from '@react-native-community/blur';
import { isIOS } from '../utils/os';

const blurComponent = { Component: BlurView };
const vibrancyComponent = { Component: VibrancyView };

// Provide either style for both platforms or blurStyle & fallbackStyle
export interface IBlurWrapperProps {
    blurType: 'dark' | 'light' | 'xlight' | 'regular' | 'prominent';
    blurAmount: number;
    children?: any;
    type?: 'blur' | 'vibrancy';
    style?: any;
    blurStyle?: any;
    fallbackStyle?: any;
    viewRef?: number;
}

export default class BlurWrapper extends Component<IBlurWrapperProps> {

    public static defaultProps: IBlurWrapperProps = {
        blurType: 'light',
        blurAmount: 10
    };

    public render (): JSX.Element {
        const { type, blurType, blurAmount, style, blurStyle, children, fallbackStyle } = this.props;

        if (isIOS) {
            const component: any = type === 'vibrancy' ? vibrancyComponent : blurComponent;
            return (
                <component.Component blurType={blurType} blurAmount={blurAmount} style={[style, blurStyle]}>
                    { children }
                </component.Component>
            );
        } else {
            return (
                <View style={[style, fallbackStyle]}>
                    { children }
                </View>
            );
        }
    }
}

