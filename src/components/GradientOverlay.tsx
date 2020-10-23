import React, { Component } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import chroma from 'chroma-js';
import LinearGradient from 'react-native-linear-gradient';

interface IProps {
    colors?: string[];
    end?: { x: number , y: number };
    locations?: number[];
    start?: { x: number , y: number };
    style?: ViewStyle;
}

interface IState {}

const OVERLAY_COLORS: string[] = [
    chroma('black').alpha(0).css(),
    chroma('black').alpha(0.2).css(),
    chroma('black').alpha(0.4).css()
];
const OVERLAY_LOCATIONS: number[] = [0, 0.7, 1];
const OVERLAY_START: { x: number , y: number } = { x: 0, y: 0 };
const OVERLAY_END: { x: number , y: number } = { x: 0, y: 1 };

class GradientOverlay extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
    }

    public render (): JSX.Element {
        const { style, colors, locations, start, end } = this.props;

        const containerStyles: ViewStyle[] = [{ ...StyleSheet.absoluteFillObject }, style];
        const overlayColors: string[] = colors ? colors : OVERLAY_COLORS;
        const overlayLocations: number[] = locations ? locations : OVERLAY_LOCATIONS;
        const overlayStart: { x: number , y: number } = start ? start : OVERLAY_START;
        const overlayEnd: { x: number , y: number } = end ? end : OVERLAY_END;

        return (
            <LinearGradient
                colors={overlayColors}
                end={overlayEnd}
                locations={overlayLocations}
                pointerEvents={'none'}
                start={overlayStart}
                style={containerStyles}
            />
        );
    }
}

export default GradientOverlay;
