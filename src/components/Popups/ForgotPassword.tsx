import React, { Component } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { connect } from 'react-redux';
import chroma from 'chroma-js';
import * as Yup from 'yup';
import i18n from '../../utils/i18n';
import { ENDPOINTS } from '../../utils/endpoints';
import api from '../../utils/api';

import { IReduxState } from '../../store/reducers';
import { IUserProfileState } from '../../store/modules/userProfile';
import { IScreenProps } from '../../index';

import colors from '../../styles/base/colors.style';
import loginStyles from '../../styles/views/Login.style';
import styles from '../../styles/components/Popups/ForgotPassword.style';

interface IProps {
    isInternetReachable: boolean;
    screenProps: IScreenProps;
    userProfile: IUserProfileState;
}

interface IState {}

interface IForgotPasswordForm {
    email: undefined;
}

const AT_ICON = require('../../static/icons/at.png');

class ForgotPassword extends Component<IProps, IState> {
    private isSubmitting: boolean;

    constructor (props: IProps) {
        super(props);
        this.isSubmitting = false;
    }

    private submit = async (values: IForgotPasswordForm, actions: FormikProps<IForgotPasswordForm>) => {
        const { isInternetReachable, screenProps } = this.props;
        if (!isInternetReachable) {
            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        try {
            screenProps?.rootLoaderRef?.current?.open();
            await api.post(ENDPOINTS.users + '/reset_password',
            {
                email: values.email
            });
            screenProps?.popupManagerRef?.current?.dismissPopup();
            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('forgotPassword.emailSent'),
                type: 'info'
            });
        } catch (error) {
            console.log(error);
            actions.setFieldError('email', i18n.t('app.credentialsError'));
        } finally {
            this.isSubmitting = false;
            screenProps?.rootLoaderRef?.current?.close();
        }
    }

    private get form (): JSX.Element {
        const { userProfile } = this.props;

        const initialValues = {
            email: userProfile.email || ''
        } as IForgotPasswordForm;

        const validationSchema = Yup.object().shape({
            email: Yup
            .string()
            .required(i18n.t('global.fieldRequired'))
        });

        const commonInputProps: any = {
            autoCapitalize: 'none',
            autoCorrect: false,
            clearButtonMode: 'while-editing',
            returnKeyType: 'done',
            placeholderTextColor: chroma(colors.white).alpha(0.45).css(),
            selectionColor: colors.violetDark,
            style: loginStyles.input
        };

        return (
            <Formik
                initialValues={initialValues}
                onSubmit={(values: IForgotPasswordForm, actions: FormikProps<IForgotPasswordForm>) => this.submit(values, actions)}
                validationSchema={validationSchema}
            >
                {({ handleChange, setFieldTouched, values, errors, touched, isValid, handleSubmit, setFieldError }: FormikProps<IForgotPasswordForm>) => {
                    return (
                        <View style={styles.formContainer}>
                            <View style={styles.fieldContainer}>
                                {touched.email && errors.email &&
                                    <Text style={loginStyles.error}>* {errors.email}</Text>
                                }
                                <View style={styles.inputWrapper}>
                                    <View style={loginStyles.inputBackground} />
                                    <View style={[loginStyles.inputContainer, {backgroundColor: '#EA76A1'}]}>
                                        <Image source={AT_ICON} style={[loginStyles.inputIcon, loginStyles.atIcon]} />
                                        <TextInput
                                            { ...commonInputProps }
                                            keyboardType={'email-address'}
                                            onBlur={() => setFieldTouched('email')}
                                            onChangeText={handleChange('email')}
                                            onSubmitEditing={handleSubmit}
                                            placeholder={i18n.t('global.email')}
                                            value={values.email}
                                        />
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    if (this.isSubmitting === false) {
                                        this.isSubmitting = true;
                                        handleSubmit();
                                    }
                                }}
                                activeOpacity={0.7}
                                style={loginStyles.submitButton}
                            >
                                <Text style={loginStyles.submitText}>{i18n.t('login.go')}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
          </Formik>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                { this.form }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    userProfile: state.userProfile,
    isInternetReachable: state.network.isInternetReachable
});

export default connect(mapStateToProps, { })(ForgotPassword);
