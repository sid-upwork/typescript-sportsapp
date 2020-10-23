import React, { PureComponent } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { generateRandomId } from './NumberTicker';

interface IProps {
    targetNumber: number;
    duration?: number;
    textHeight: number;
    textStyle: any;
    wait?: number;
}

interface IState {
    animatedValue: Animated.Value;
}

export default class TextTicker extends PureComponent<IProps, IState> {
    private numberList: any[] = [];

    constructor (props: IProps) {
        super(props);
        this.state = {
            animatedValue: new Animated.Value(0)
        };

        const { targetNumber } = this.props;
        if (this.props.targetNumber > 5) {
            for (let i = 0; i <= targetNumber; i++) {
                this.numberList.push({ id: i });
            }
        } else {
            for (let i = 9; i >= targetNumber; i--) {
                this.numberList.push({ id: i });
            }
        }
    }

    public componentDidMount (): void {
        this.startAnimation();
    }

    private startAnimation = (): void => {
        const { animatedValue } = this.state;
        const { duration, wait } = this.props;
        Animated.sequence([
            Animated.delay(wait || 0),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: duration || 350,
                easing: Easing.out(Easing.cubic),
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private getInterpolatedVal = (val: Animated.Value): any => {
        const { textHeight } = this.props;
        return val.interpolate({
            inputRange: [0, 1],
            outputRange: [textHeight * this.numberList.length, 0],
            extrapolate: 'clamp'
        });
    }

    private renderNumbers = (): JSX.Element[] => {
        const { textHeight, textStyle } = this.props;
        const digitStyle = [
            textStyle,
            {
                height: textHeight,
                lineHeight: textHeight
            }
        ];
        return this.numberList.map((data: any) => {
            return (
                <Text key={generateRandomId(data.id)} style={digitStyle}>
                    { data.id }
                </Text>
            );
        });
    }

    public render (): JSX.Element {
        const { animatedValue } = this.state;
        const { textHeight } = this.props;
        const containerStyle: any = {
            height: textHeight,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'flex-end'
        };
        return (
            <View style={containerStyle}>
                <Animated.View style={{
                    transform: [{
                        translateY: this.getInterpolatedVal(animatedValue)
                    }]
                }}>
                    { this.renderNumbers() }
                </Animated.View>
            </View>
        );
    }
}
