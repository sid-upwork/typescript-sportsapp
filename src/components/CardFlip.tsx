import React, { Component } from 'react';
import { Animated } from 'react-native';
import styles from '../styles/components/CardFlip.style';

interface IProps {
    containerStyle?: any;
    flipDirection?: 'horizontal' | 'vertical';
    flipDuration?: number;
}

interface IState {
    currentSide: number;
    progress: Animated.Value;
    rotation: Animated.Value;
    zoom: Animated.Value;
}

const DEFAULT_DURATION = 500;
const PERSPECTIVE = 900;

export default class CardFlip extends Component<IProps, IState> {
    constructor (props: IProps) {
        super(props);
        this.state = {
            currentSide: 0,
            progress: new Animated.Value(0),
            rotation: new Animated.Value(50),
            zoom: new Animated.Value(0)
        };
    }

    public onPress (): void {
        const { currentSide, rotation, zoom, progress } = this.state;
        const { flipDuration } = this.props;
        const duration = flipDuration || DEFAULT_DURATION;
        const flipTo = currentSide === 0 ? 100 : 50;

        this.setState({ currentSide: (currentSide === 0) ? 1 : 0 });

        Animated.parallel([
            Animated.timing(progress, {
                toValue: (currentSide === 0) ? 100 : 0,
                duration,
                isInteraction: false,
                useNativeDriver: true
            }),
            // Animated.sequence([
            //     Animated.timing(zoom, {
            //         toValue: 1,
            //         duration: duration / 2,
            //         isInteraction: false,
            //         useNativeDriver: true
            //     }),
            //     Animated.timing(zoom, {
            //         toValue: 0,
            //         duration: duration / 2,
            //         isInteraction: false,
            //         useNativeDriver: true
            //     })
            // ]),
            Animated.timing(rotation, {
                toValue: flipTo,
                duration,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private getCardTransformation (side: 'A' | 'B'): {} {
        const { progress, rotation, currentSide } = this.state;
        const { flipDirection } = this.props;
        const isSideA = side === 'A';
        const zIndex = isSideA ?
            ((currentSide === 0) ? 1 : 0) :
            ((currentSide === 0) ? 0 : 1);
        const opacity = progress.interpolate({
            inputRange: [50, 51],
            outputRange: isSideA ? [100, 0] : [0, 100],
            extrapolate: 'clamp'
        });
        const rotate = rotation.interpolate({
            inputRange: [0, 50, 100],
            outputRange: isSideA ? ['-180deg', '0deg', '180deg'] : ['0deg', '-180deg', '-360deg'],
            extrapolate: 'clamp'
        });

        return {
            opacity,
            zIndex,
            transform: [
                { perspective: PERSPECTIVE },
                flipDirection === 'vertical' ? { rotateX: rotate } : { rotateY: rotate }
            ]
        };
    }

    public render (): JSX.Element {
        const { zoom } = this.state;
        const { containerStyle } = this.props;
        const cardATransform = this.getCardTransformation('A');
        const cardBTransform = this.getCardTransformation('B');
        const scaling = {
            transform: [
                {
                    scale: zoom.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, (1 + 0.09)],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };

        return (
            <Animated.View style={[containerStyle, scaling]}>
                <Animated.View style={[styles.cardContainer, cardATransform]}>{this.props.children[0]}</Animated.View>
                <Animated.View style={[styles.cardContainer, cardBTransform]}>{this.props.children[1]}</Animated.View>
            </Animated.View>
        );
    }
}
