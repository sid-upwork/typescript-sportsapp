// Initial code from https://github.com/RobertFOConnor/react-native-number-ticker

import React, { PureComponent } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TextTicker from './TextTicker';

export const generateRandomId = (index: string): string => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        (index || '');
};

const styles = StyleSheet.create({
    measure: {
        position: 'absolute',
        opacity: 0
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    }
});

interface IProps {
    disableAnimation?: boolean;
    duration: number;
    style?: any;
    text: string;
    textStyle: any;
    wait?: number;
}

interface IState {
    height: number;
    measured: boolean;
}

class NumberTicker extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            height: 0,
            measured: false
        };
    }

    private handleLayout = (e: any): void => {
        const { textStyle } = this.props;
        this.setState({
            measured: true,
            height: e?.nativeEvent?.layout?.height || textStyle?.fontSize
        });
    }

    private mapToDigits = () => {
        const { height, measured } = this.state;
        const { disableAnimation, text, textStyle, duration, wait } = this.props;

        return text.split('').map((value: string, index: number) => {
            const key = generateRandomId(value);
            if (isNaN(parseFloat(value)) || !measured || disableAnimation) {
                return (
                    <Text
                        key={`numberTicker-text-${key}-${index}`}
                        style={textStyle}
                    >
                        {value}
                    </Text>
                );
            }
            return (
                <TextTicker
                    duration={duration}
                    key={`numberTicker-ticker-${key}-${index}`}
                    targetNumber={parseFloat(value)}
                    textHeight={height}
                    textStyle={textStyle}
                    wait={wait}
                />
            );
        });
    }

    private get dummyTextForMeasure (): JSX.Element {
        const { measured } = this.state;
        const { textStyle } = this.props;
        return !measured ? (
            <Text style={[textStyle, styles.measure]} onLayout={this.handleLayout}>
                0
            </Text>
        ) : null;
    }

    public render (): JSX.Element {
        const { height, measured } = this.state;
        const { style } = this.props;
        const wrapStyle = measured ? { height } : { opacity: 0 };
        return (
            <View style={style}>
                <View style={[styles.row, wrapStyle]}>
                    { this.mapToDigits() }
                </View>
                { this.dummyTextForMeasure }
            </View>
        );
    }
}

export default NumberTicker;
