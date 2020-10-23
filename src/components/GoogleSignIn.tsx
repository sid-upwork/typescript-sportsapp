import React, { Component, RefObject } from 'react';
import { connect } from 'react-redux';
import { IGoogleLoginPayload, IGoogleRegisterPayload, loginWithGoogle, registerWithGoogle } from '../store/modules/auth';
import { setLastTouchUpdateTimestamp } from '../store/modules/influencers';
import { GOOGLE_WEBCLIENT_ID_ANDROID, GOOGLE_WEBCLIENT_ID_IOS } from '../../env';
import { isIOS } from '../utils/os';
import { IScreenProps } from '../index';
import i18n from '../utils/i18n';

import { GoogleSignin, statusCodes, User } from '@react-native-community/google-signin';

import SharedButton from '../components/SharedButton';
import ToastManager from '../components/ToastManager';

import loginStyles, { LOGIN_BUTTON_BORDER_RADIUS } from '../styles/views/Login.style';

interface IProps {
    firstTouchId?: string;
    firstTouchLink?: string;
    lastTouchId?: string;
    lastTouchLink?: string;
    loginWithGoogle: (payload: IGoogleLoginPayload, toastManagerRef?: RefObject<ToastManager>) => Promise<string>;
    mode: 'login' | 'register';
    onLoggedIn?: () => void;
    onRegistered?: () => void;
    registerWithGoogle: (payload: IGoogleRegisterPayload, toastManagerRef: RefObject<ToastManager>) => Promise<string>;
    screenProps: IScreenProps;
    setLastTouchUpdateTimestamp: (timestamp: number) => void;
}

interface IState {
    isSigninInProgress: boolean;
}

const GOOGLE_ICON = require('../static/icons/google.png');

class GoogleSignIn extends Component<IProps, IState> {
    constructor (props: IProps) {
        super(props);
        this.state = {
            isSigninInProgress: false
        };
    }

    public componentDidMount (): void {
        GoogleSignin.configure({
            webClientId: isIOS ? GOOGLE_WEBCLIENT_ID_IOS : GOOGLE_WEBCLIENT_ID_ANDROID,
            offlineAccess: true
        });
    }

    private async signIn (): Promise<User> {
        const { screenProps } = this.props;

        try {
            await GoogleSignin.hasPlayServices();
            // Logout first just to be safe
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn) {
                await GoogleSignin.signOut();
            }
            const userInfo = await GoogleSignin.signIn();
            return userInfo;
        } catch (error) {
            console.log(error);
            console.log(error?.code);

            if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled the login flow
                screenProps?.toastManagerRef?.current?.openToast({
                    message: i18n.t('app.loginCancelationWarning'),
                    type: 'warning'
                });
                console.log('canceled', error);
                return;
            } else if (error?.code === statusCodes.IN_PROGRESS) {
                // Operation (e.g. sign in) is in progress already
                console.log('progress', error);
            } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // Play services not available or outdated
                console.log('play services', error);
            } else {
                // Some other error happened
                console.log('other error', error);
            }

            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.authError'),
                type: 'error'
            });
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
        }
    }

    private login = async (): Promise<void> => {
        const { screenProps } = this.props;

        try {
            screenProps?.rootLoaderRef?.current?.open();

            const userInfo = await this.signIn();
            const token = await this.props.loginWithGoogle({ idToken: userInfo.idToken }, screenProps?.toastManagerRef);

            if (!token) {
                return;
            }

            this.props.onLoggedIn && this.props.onLoggedIn();
        } catch (error) {
            // Handled in loginWithGoogle() from auth
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
        }
    }

    private register = async (): Promise<void> => {
        const {
            firstTouchId,
            firstTouchLink,
            lastTouchId,
            lastTouchLink,
            screenProps
        } = this.props;

        try {
            screenProps?.rootLoaderRef?.current?.open();

            const userInfo  = await this.signIn();
            const payload = {
                firstTouchId: firstTouchId || 'none',
                firstTouchLink: firstTouchLink || 'none',
                idToken: userInfo.idToken,
                lastTouchId: lastTouchId || 'none',
                lastTouchLink: lastTouchLink || 'none'
            };

            await this.props.registerWithGoogle(payload, screenProps?.toastManagerRef);
            // this.props.setLastTouchUpdateTimestamp(Date.now());
            this.props.onRegistered && this.props.onRegistered();
        } catch (error) {
            // Already handled in registerWithGoogle()
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
        }
    }

    public render (): JSX.Element {
        return (
            <SharedButton
                borderRadius={LOGIN_BUTTON_BORDER_RADIUS}
                color={'pink'}
                containerStyle={loginStyles.emailButtonContainer}
                isTouchableScale={true}
                icon={GOOGLE_ICON}
                onPress={this.props.mode === 'login' ? this.login : this.register}
                text={i18n.t('registration.withGoogle')}
                textStyle={loginStyles.buttonText}
                withShadow={true}
            />
        );
    }
}

export default connect(null, { loginWithGoogle, registerWithGoogle, setLastTouchUpdateTimestamp })(GoogleSignIn);
