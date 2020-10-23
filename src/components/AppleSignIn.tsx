import React, { Component, RefObject } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { IAppleLoginPayload, IAppleRegisterPayload, loginWithApple, registerWithApple, setAppleSigninCredentials } from '../store/modules/auth';
import { IReduxState } from '../store/reducers';
import i18n from '../utils/i18n';
import { IScreenProps } from '../index';

import appleAuth, {
    AppleButton,
    AppleAuthRequestOperation,
    AppleAuthRequestScope,
    AppleAuthCredentialState,
    AppleAuthRequestResponse,
} from '@invertase/react-native-apple-authentication';

import ToastManager from './ToastManager';

import { LOGIN_BUTTON_WIDTH, LOGIN_BUTTON_BORDER_RADIUS } from '../styles/views/Login.style';

interface IProps {
    appleSigninCredentials?: typeof AppleAuthRequestResponse;
    loginWithApple: (payload: IAppleLoginPayload, toastManagerRef?: RefObject<ToastManager>) => Promise<string>;
    registerWithApple: (payload: IAppleRegisterPayload, toastManagerRef: RefObject<ToastManager>) => Promise<string>;
    setAppleSigninCredentials: (credentials: typeof AppleAuthRequestResponse) => void;
    firstTouchId?: string;
    firstTouchLink?: string;
    lastTouchId?: string;
    lastTouchLink?: string;
    mode: 'login' | 'register';
    onLoggedIn?: () => void;
    onRegistered?: () => void;
    screenProps: IScreenProps;
}

interface IState {
}

const mapStateToProps = (state: IReduxState) => ({
    appleSigninCredentials: state.auth.appleSigninCredentials
});

class AppleSignIn extends Component<IProps, IState> {
    constructor (props: IProps) {
        super(props);
        this.state = {
            isSigninInProgress: false
        };
    }

    private signIn = async (): Promise<typeof AppleAuthRequestResponse> => {
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: AppleAuthRequestOperation.LOGIN,
            requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
        });
        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

        if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
            return appleAuthRequestResponse;
        } else {
            Alert.alert(i18n.t('app.fetchErrorTitle'), i18n.t('app.fetchError'));
            throw new Error('Credentials not authorized');
        }
    }

    private login = async (): Promise<void> => {
        const { screenProps, loginWithApple, appleSigninCredentials } = this.props;

        try {
            screenProps?.rootLoaderRef?.current?.open();

            const appleAuthRequestResponse = await this.signIn();
            let email = appleAuthRequestResponse?.email || appleSigninCredentials?.email;
            const token = await loginWithApple({ id: appleAuthRequestResponse.user, email }, screenProps?.toastManagerRef);

            if (!token) {
                return;
            }

            this.props.onLoggedIn && this.props.onLoggedIn();
        } catch (error) {
            // Handled in loginWithApple() from auth
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
        }
    }

    private register = async (): Promise<void> => {
        const {
            appleSigninCredentials,
            setAppleSigninCredentials,
            registerWithApple,
            onRegistered,
            firstTouchId,
            firstTouchLink,
            lastTouchId,
            lastTouchLink,
            screenProps
        } = this.props;

        try {
            screenProps?.rootLoaderRef?.current?.open();
            const appleAuthRequestResponse = await this.signIn();

            // Since we can only fetch the user's personnal informations once, we need to store these infos
            // locally in case our API fails or the user's network isn't stable enough to register on the fist try.
            // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/authenticating_users_with_sign_in_with_apple
            let user: string; // Apple's user ID
            let fullName: { familyName: string; givenName: string };
            let email: string;
            if (appleAuthRequestResponse.email) {
                setAppleSigninCredentials(appleAuthRequestResponse);
                email = appleAuthRequestResponse.email;
                fullName = appleAuthRequestResponse.fullName;
                user = appleAuthRequestResponse.user;
            } else if (appleSigninCredentials) {
                fullName = appleSigninCredentials.fullName;
                email = appleSigninCredentials.email;
                user = appleSigninCredentials.user;
            } else {
                // User infos aren't returned by apple's API nor are stored in redux
                // Tell the user how to revoke sign in in the app then try again
                this.props.screenProps?.toastManagerRef?.current?.openToast({
                    message:  i18n.t('app.appleSignInError'),
                    type: 'error',
                    duration: 6000
                });
                return;
            }

            const payload: IAppleRegisterPayload = {
                id: user,
                email,
                givenName: fullName.givenName,
                familyName: fullName.familyName,
                firstTouchId: firstTouchId || 'none',
                firstTouchLink: firstTouchLink || 'none',
                lastTouchId: lastTouchId || 'none',
                lastTouchLink: lastTouchLink || 'none',
            };
            await registerWithApple(payload, screenProps?.toastManagerRef);
            onRegistered && this.props.onRegistered();
        } catch (error) {
            // Already handled in registerWithApple()
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
        }
    }


    public render (): JSX.Element {
        // Make sure apple auth is supported (iOS 13+)
        if (!appleAuth.isSupported) {
            return null;
        }
        const { mode } = this.props;
        const isLogin = mode === 'login';
        // Make sure that the required type is supported ('SIGN_UP' only work with iOS 13.2+)
        const type = isLogin ? 'SIGN_IN' : (appleAuth.isSignUpButtonSupported ? 'SIGN_UP' : 'CONTINUE');
        return (
            <AppleButton
                buttonStyle={AppleButton.Style.BLACK}
                buttonType={AppleButton.Type[type]}
                cornerRadius={LOGIN_BUTTON_BORDER_RADIUS}
                style={{
                    width: LOGIN_BUTTON_WIDTH,
                    height: 58
                }}
                onPress={isLogin ? this.login : this.register}
            />
        );
    }
}

export default connect(mapStateToProps, { loginWithApple, registerWithApple, setAppleSigninCredentials })(AppleSignIn);
