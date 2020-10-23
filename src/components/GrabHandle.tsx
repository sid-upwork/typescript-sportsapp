import React, { Component } from 'react';
import { View } from 'react-native';
import chroma from 'chroma-js';

import colors from '../styles/base/colors.style';
import styles from '../styles/components/GrabHandle.style';

interface IProps {
    color?: string;
    height?: number;
    width?: number;
}

interface IState {}

class GrabHandle extends Component<IProps, IState> {

    public static defaultProps: IProps = {
        color: chroma(colors.violetDark).alpha(0.65).css(),
        height: 35,
        width: 38
    };

    public render (): JSX.Element {
        const { color, height, width } = this.props;
        const containerStyle = [
            styles.handleContainer,
            { height }
        ]
        const handleStyle = [
            styles.handleIcon,
            {
                width,
                backgroundColor: color
            }
        ];
        return (
            <View style={containerStyle} pointerEvents={'none'}>
                <View style={handleStyle} />
            </View>
        );
    }
}

export default GrabHandle;
