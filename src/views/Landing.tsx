import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';

import LinearGradient from 'react-native-linear-gradient';

import colors from '../styles/base/colors.style';

interface IProps {
    connected: boolean;
    navigation: any;
}

class Landing extends Component<IProps> {

    public render (): JSX.Element {
        return (
            <LinearGradient
                angle={112}
                colors={[colors.orangeDark, colors.pink]}
                style={{ ...StyleSheet.absoluteFillObject }}
                useAngle={true}
            />
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    connected: state.auth.connected
});

export default connect(mapStateToProps, null) (Landing);
