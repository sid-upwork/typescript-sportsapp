import React, { Component, RefObject } from 'react';
import { connect} from 'react-redux';
import {
    IFacebookLoginPayload,
    IFacebookRegisterPayload,
    loginWithFacebook,
    registerWithFacebook
} from '../store/modules/auth';
import { setLastTouchUpdateTimestamp } from '../store/modules/influencers';
import { IScreenProps } from '../index';
import i18n from '../utils/i18n';

import { LoginManager, AccessToken, LoginResult } from 'react-native-fbsdk';

import SharedButton from '../components/SharedButton';
import ToastManager from '../components/ToastManager';

import loginStyles, { LOGIN_BUTTON_BORDER_RADIUS } from '../styles/views/Login.style';

interface IProps {
    firstTouchId?: string;
    firstTouchLink?: string;
    lastTouchId?: string;
    lastTouchLink?: string;
    loginWithFacebook: (payload: IFacebookLoginPayload, toastManagerRef?: RefObject<ToastManager>) => Promise<string>;
    mode: 'login' | 'register';
    onLoggedIn?: () => void;
    onRegistered?: () => void;
    registerWithFacebook: (payload: IFacebookRegisterPayload, toastManagerRef: RefObject<ToastManager>) => Promise<string>;
    screenProps: IScreenProps;
    setLastTouchUpdateTimestamp: (timestamp: number) => void;
}

const FACEBOOK_ICON = require('../static/icons/facebook.png');

class FacebookSignIn extends Component<IProps> {
    constructor (props: IProps) {
        super(props);
    }

    private login = async (): Promise<void> => {
        const { screenProps } = this.props;

        try {
            screenProps?.rootLoaderRef?.current?.open();

            LoginManager.logOut(); // Logout first just to be safe
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
            this.onLogin(result);
        } catch (err) {
            console.log(err);
            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.authError'),
                type: 'error'
            });
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
        }
    }

    private onLogin = async (result: LoginResult): Promise<void> => {
        const { screenProps } = this.props;

        if (result.isCancelled) {
            screenProps?.rootLoaderRef?.current?.close();
            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.loginCancelationWarning'),
                type: 'warning'
            });
        } else {
            try {
                const accessToken = await AccessToken.getCurrentAccessToken();
                const token = await this.props.loginWithFacebook({ accessToken: accessToken.accessToken }, screenProps?.toastManagerRef);

                if (!token) {
                    return;
                }

                this.props.onLoggedIn && this.props.onLoggedIn();
            } catch (error) {
                // Handled in loginWithFacebook() from auth
            } finally {
                screenProps?.rootLoaderRef?.current?.close();
            }
        }
    }

    private register = async (): Promise<void> => {
        const {
            firstTouchLink,
            firstTouchId,
            lastTouchLink,
            lastTouchId,
            onRegistered,
            screenProps
        } = this.props;

        try {
            screenProps?.rootLoaderRef?.current?.open();

            LoginManager.logOut(); // Logout first just to be safe
            await LoginManager.logInWithPermissions(['public_profile', 'email']);
            const accessToken = await AccessToken.getCurrentAccessToken();
            const payload = {
                accessToken: accessToken.accessToken,
                firstTouchId: firstTouchId || 'none',
                firstTouchLink: firstTouchLink || 'none',
                lastTouchId: lastTouchId || 'none',
                lastTouchLink: lastTouchLink || 'none'
            };

            await this.props.registerWithFacebook(payload, screenProps?.toastManagerRef);
            // this.props.setLastTouchUpdateTimestamp(Date.now());
            onRegistered && onRegistered();
        } catch (error) {
            // Already handled in registerWithFacebook()
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
        }
    }

    public render (): JSX.Element {
        return (
            <SharedButton
                borderRadius={LOGIN_BUTTON_BORDER_RADIUS}
                containerStyle={loginStyles.emailButtonContainer}
                isTouchableScale={true}
                icon={FACEBOOK_ICON}
                onPress={this.props.mode === 'login' ? this.login : this.register}
                text={i18n.t('registration.withFacebook')}
                textStyle={loginStyles.buttonText}
                withShadow={true}
            />
        );
    }
}

export default connect(null, { loginWithFacebook, registerWithFacebook, setLastTouchUpdateTimestamp })(FacebookSignIn);
