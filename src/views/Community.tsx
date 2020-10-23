import React, { Component } from 'react';
import { Text, View } from 'react-native';
import HeaderSpacer from '../components/HeaderSpacer';

interface IProps {}

interface IState {}

class Community extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }

    public render(): JSX.Element {
        return (
            <View>
                <HeaderSpacer />
                <Text>Community</Text>
            </View>
        );
    }
}

export default Community;
