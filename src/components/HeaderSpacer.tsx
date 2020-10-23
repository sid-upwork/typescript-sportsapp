import React, { Component } from 'react';
import { View } from 'react-native';
import { headerHeight } from '../styles/base/metrics.style';

export default class HeaderSpacer extends Component {
    public render (): JSX.Element {
        return (
            <View style={{ height: headerHeight }} />
        );
    }
}
