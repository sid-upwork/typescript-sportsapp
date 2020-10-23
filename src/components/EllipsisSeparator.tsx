import React, { Component, Fragment } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/components/EllipsisSeparator.style';

interface IProps {
    containerTextStyle?: any;
    textStyle?: any;
    reverseLines?: boolean;
}

export default class EllipsisSeparator extends Component<IProps> {
    constructor (props: IProps) {
        super(props);
    }

    public render (): JSX.Element {
        const { containerTextStyle, textStyle, reverseLines } = this.props;
        return (
            <View style={containerTextStyle}>
                <View style={[styles.containerText]}>
                    <Text
                    style={[
                        styles.text,
                        reverseLines ? styles.secondLine : styles.firstLine,
                        textStyle
                    ]}>
                        ••••
                    </Text>
                    <Text
                    style={[
                        styles.text,
                        reverseLines ? styles.firstLine : styles.secondLine,
                        textStyle
                    ]}>
                        ••••
                    </Text>
                </View>
            </View>
        );
    }
}
