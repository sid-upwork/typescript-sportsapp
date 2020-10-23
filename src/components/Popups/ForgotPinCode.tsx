import React, { Component, RefObject } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { login, ILoginPayload } from '../../store/modules/auth';
import { resetPinCodeInKeychain } from '../../utils/pinCode';
import { IReduxState } from '../../store/reducers';
import { ENDPOINTS } from '../../utils/endpoints';
import { IScreenProps } from '../../index';
import { connect } from 'react-redux';
import { TViews } from '../../views';
import i18n from '../../utils/i18n';
import api from '../../utils/api';
import chroma from 'chroma-js';

import ToastManager from '../ToastManager';

import colors from '../../styles/base/colors.style';
import loginStyles from '../../styles/views/Login.style';
import styles from '../../styles/components/Popups/ForgotPinCode.style';

interface IProps {
    dismissPopup: () => void;
    email: string;
    id: string;
    login: (payload: ILoginPayload, toastManagerRef?: RefObject<ToastManager>) => Promise<string>;
    navigation: any;
    protectedRouteName: TViews;
    protectedRouteNavigationParams: any;
    screenProps: IScreenProps;
}

interface IState {
    value: string;
}

class ForgotPinCode extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            value: undefined
        };
    }

    private onChangeText = (value: string): void => {
        this.setState({ value });
    }

    private onPressConfirm = async (): Promise<void> => {
        const {
            dismissPopup,
            email,
            id,
            navigation,
            protectedRouteName,
            protectedRouteNavigationParams,
            screenProps
        } = this.props;

        screenProps.rootLoaderRef?.current?.open();

        try {
            await this.props.login(
                { email, password: this.state.value },
                screenProps.toastManagerRef
            );

            // Disable Pin code
            await api.put(ENDPOINTS.users + '/' + id, { pinCode: null });
            await resetPinCodeInKeychain();

            dismissPopup();
            navigation?.replace(protectedRouteName, protectedRouteNavigationParams);

            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('pinCode.disabledToastMessage'),
                type: 'info'
            });
        } catch (error) {
            // Handled in login() from auth
        } finally {
            screenProps.rootLoaderRef?.current?.close();
        }
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{ i18n.t('pinCode.resetPinCode') }</Text>
                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            clearButtonMode={'while-editing'}
                            onChangeText={this.onChangeText}
                            placeholder={i18n.t('global.password')}
                            placeholderTextColor={chroma(colors.white).alpha(0.45).css()}
                            returnKeyType={'done'}
                            secureTextEntry={true}
                            selectionColor={colors.violetDark}
                            selectTextOnFocus={true}
                            style={styles.input}
                            value={this.state.value}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={this.onPressConfirm}
                        activeOpacity={0.7}
                        style={loginStyles.submitButton}
                    >
                        <Text style={loginStyles.submitText}>{i18n.t('login.go')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    email: state.userProfile.email,
    id: state.userProfile.id
});

export default connect(mapStateToProps, { login }) (ForgotPinCode);
