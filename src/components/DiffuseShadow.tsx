import React, { Component } from 'react';
import { View } from 'react-native';
import { isIOS } from '../utils/os';
import chroma from 'chroma-js';

import colors from '../styles/base/colors.style';
import styles from '../styles/components/DiffuseShadow.style';

export interface IDiffuseShadowProps {
    borderRadius?: number;
    color?: string;
    horizontalOffset?: number;
    shadowOpacity?: number;
    style?: any;
    verticalOffset?: number;
}

export default class DiffuseShadow extends Component<IDiffuseShadowProps> {

    public static defaultProps: IDiffuseShadowProps = {
        borderRadius: 12,
        color: chroma(colors.blueDark).darken(2).css(),
        shadowOpacity: 0.35,
        style: {},
        horizontalOffset: 20,
        verticalOffset: 18
    };

    public render (): JSX.Element {
        const { style, horizontalOffset, borderRadius, verticalOffset, color, shadowOpacity } = this.props;
        const containerStyles = [
            styles.shadowContainer,
            style,
            { borderRadius }
        ];
        const commonStyleProps = {
            left: horizontalOffset,
            right: horizontalOffset,
            backgroundColor: color,
            shadowColor: color,
            borderRadius
        };
        const spreadStyle = [
            styles.fullSpace,
            {
                ...commonStyleProps,
                shadowOffset: { width: 0, height: verticalOffset },
                shadowRadius: verticalOffset,
                shadowOpacity
            }
        ];
        const colorStyle = [
            styles.fullSpace,
            {
                ...commonStyleProps,
                shadowOffset: { width: 0, height: Math.round(verticalOffset / 2)},
                shadowRadius: Math.round(verticalOffset / 2),
                shadowOpacity: shadowOpacity / 3
            }
        ];

        // No advanced shadows on Android :-(
        return isIOS ? (
            <View style={containerStyles}>
                <View style={spreadStyle} />
                <View style={colorStyle} />
            </View>
        ) : null;
    }
}
