import React, { Component, Fragment, RefObject } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Easing, TextInput, Keyboard, ImageSourcePropType } from 'react-native';
import { connect } from 'react-redux';
import { StackActions, NavigationActions, NavigationEvents } from 'react-navigation';
import { Formik, FormikProps } from 'formik';
import { get } from 'lodash';
import { IReduxState } from '../store/reducers';
import { TViews } from './index';
import { IAuthState, IEmailRegisterPayload, ILoginPayload, login, registerWithEmail } from '../store/modules/auth';
import { updateOnboardingStep, OnboardingSteps } from '../store/modules/onboarding';
import { setLastTouchUpdateTimestamp } from '../store/modules/influencers';
import {isAndroid, isIOS} from '../utils/os';
import { IInfluencer } from '../types/user';
import { IScreenProps } from '../index';
import chroma from 'chroma-js';
import * as Yup from 'yup';
import delays from '../utils/animDelays';
import i18n from '../utils/i18n';
import { LOGIN_IMAGE_URL } from '../utils/staticLinks';

import AppleSignIn from '../components/AppleSignIn';
import CustomKeyboardButton from '../components/CustomKeyboardButton';
// import EllipsisSeparator from '../components/EllipsisSeparator';
import FacebookSignIn from '../components/FacebookSignIn';
import FadeInImage from '../components/FadeInImage';
import GoogleSignIn from '../components/GoogleSignIn';
import Header from '../components/Header';
import HideKeyboardButton from '../components/HideKeyboardButton';
import SharedButton from '../components/SharedButton';
import SharedParallaxView from '../components/SharedParallaxView';
import SharedVerticalTitle from '../components/SharedVerticalTitle';
import ToastManager from '../components/ToastManager';

import { getLineHeight } from '../styles/base/fonts.style';
import colors from '../styles/base/colors.style';
import { viewportWidth, viewportHeight } from '../styles/base/metrics.style';
import loginStyles, {
    BACKGROUND_IMAGE_HEIGHT,
    BACKGROUND_VECTOR_STYLE,
    BACKGROUND_VECTOR_HEIGHT,
    BACKGROUND_VECTOR_WIDTH,
    FIELD_CONTAINER_PADDING_LEFT,
    LOGIN_BUTTON_BORDER_RADIUS
} from '../styles/views/Login.style';
import styles, { INPUT_COLORS_SCALE } from '../styles/views/Registration.style';

import BackgroundVector from '../static/Login/background.svg';

// const LOGO_NULI = require('../static/shared/logo-nuli.png');

const AT_ICON = require('../static/icons/at.png');
const CHECK_ICON = require('../static/icons/checkmark-thin.png');
const ENVELOPE_ICON = require('../static/icons/envelope.png');
const NEXT_ICON = require('../static/icons/next.png');
const PADLOCK_ICON = require('../static/icons/padlock.png');
const USER_ICON = require('../static/icons/user.png');

interface IRegisterForm {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface IProps extends IAuthState {
    firstTouchId: string;
    firstTouchLink: string;
    influencers: IInfluencer[];
    isInternetReachable: boolean;
    lastTouchId: string;
    lastTouchLink: string;
    login: (payload: ILoginPayload) => Promise<string>;
    navigation: any;
    screenProps: IScreenProps;
    setLastTouchUpdateTimestamp: (timestamp: number) => void;
    registerWithEmail: (payload: IEmailRegisterPayload, toastManagerRef: RefObject<ToastManager>) => Promise<string>;
    updateOnboardingStep: (step: OnboardingSteps) => void;
}

interface IState {
    animBackgroundTransform: Animated.Value;
    animBackgroundFormTransform: Animated.Value;
    animAppleButtonOpacity: Animated.Value;
    animAppleButtonTransform: Animated.Value;
    animEmailButtonOpacity: Animated.Value;
    animEmailButtonTransform: Animated.Value;
    animFacebookButtonOpacity: Animated.Value;
    animFacebookButtonTransform: Animated.Value;
    animGoogleButtonOpacity: Animated.Value;
    animGoogleButtonTransform: Animated.Value;
    animFormTitleTransform: Animated.Value;
    animFieldFirstnameTransform: Animated.Value;
    animFieldLastnameTransform: Animated.Value;
    animFieldEmailTransform: Animated.Value;
    animFieldPasswordTransform: Animated.Value;
    animSubmitTransform: Animated.Value;
    animTitleTransform: Animated.Value;
    keyboardButtonIcon: ImageSourcePropType;
    isSigninInProgress: boolean;
    showKeyboardButtons: boolean;
    step: 1 | 2;
}

class Registration extends Component<IProps, IState> {

    private focusedInput: 'firstName' | 'lastName' | 'email' | 'password';
    private handleSubmit: () => any;
    private keyboardDidHideListener: any;
    private keyboardDidShowListener: any;
    private keyboardWillHideListener: any;
    private keyboardWillShowListener: any;
    private formikProps: FormikProps<IRegisterForm>;
    private inputEmail: RefObject<TextInput>;
    private inputFirstName: RefObject<TextInput>;
    private inputLastName: RefObject<TextInput>;
    private inputPassword: RefObject<TextInput>;
    private isSubmitting: boolean;
    private parallaxRef: RefObject<SharedParallaxView>;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animBackgroundTransform: new Animated.Value(0),
            animBackgroundFormTransform: new Animated.Value(0),
            animAppleButtonOpacity: new Animated.Value(0),
            animAppleButtonTransform: new Animated.Value(0),
            animEmailButtonOpacity: new Animated.Value(0),
            animEmailButtonTransform: new Animated.Value(0),
            animFacebookButtonOpacity: new Animated.Value(0),
            animFacebookButtonTransform: new Animated.Value(0),
            animGoogleButtonOpacity: new Animated.Value(0),
            animGoogleButtonTransform: new Animated.Value(0),
            animFieldFirstnameTransform: new Animated.Value(0),
            animFieldLastnameTransform: new Animated.Value(0),
            animFieldEmailTransform: new Animated.Value(0),
            animFieldPasswordTransform: new Animated.Value(0),
            animSubmitTransform: new Animated.Value(0),
            animFormTitleTransform: new Animated.Value(0),
            animTitleTransform: new Animated.Value(0),
            isSigninInProgress: false,
            keyboardButtonIcon: NEXT_ICON,
            showKeyboardButtons: false,
            step: 1
        };
        this.handleSubmit = undefined;
        this.inputEmail = React.createRef();
        this.inputFirstName = React.createRef();
        this.inputLastName = React.createRef();
        this.inputPassword = React.createRef();
        this.isSubmitting = false;
        this.parallaxRef = React.createRef();
    }

    public async componentDidMount (): Promise<void> {
        this.addKeyboardEventListeners();
        this.animateButtons();
        this.animateTitle();
        this.animateBackgroundVector();
    }

    public async componentWillUnmount (): Promise<void> {
        this.removeKeyboardEventListeners();
    }

    private onWillBlur = (): void => {
        Keyboard.dismiss();
    }

    private onKeyboardDidHide = (): void => {
        this.focusedInput = null;
    }

    private onSetFocus = (ref: 'firstName' | 'lastName' | 'email' | 'password'): void => {
        this.focusedInput = ref;

        if (ref === 'password') {
            this.setState({ keyboardButtonIcon: CHECK_ICON });
        } else {
            this.setState({ keyboardButtonIcon: NEXT_ICON });
        }
    }

    private addKeyboardEventListeners (): void {
        // The `keyboardWillBlur` event is not triggered on Android whereas it makes for a better synchronization
        if (isAndroid) {
            this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.showKeyboardButtons);
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                this.onKeyboardDidHide();
                this.hideKeyboardButtons();
            });
        } else {
            this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.showKeyboardButtons);
            this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.hideKeyboardButtons);
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide);
        }
    }

    private removeKeyboardEventListeners (): void {
        this.keyboardDidShowListener?.remove && this.keyboardDidShowListener?.remove();
        this.keyboardDidHideListener?.remove && this.keyboardDidHideListener?.remove();
        this.keyboardWillShowListener?.remove && this.keyboardWillShowListener?.remove();
        this.keyboardWillHideListener?.remove && this.keyboardWillHideListener?.remove();
    }

    private showKeyboardButtons = (): void => {
        this.setState({ showKeyboardButtons: true });
    }

    private hideKeyboardButtons = (): void => {
        this.setState({ showKeyboardButtons: false });
    }

    private focusNextInput = (): void => {
        const values: IRegisterForm = this.formikProps?.values;
        if (this.focusedInput === 'firstName') {
            this.inputLastName?.current?.focus && this.inputLastName?.current?.focus();
        } else if (this.focusedInput === 'lastName') {
            this.inputEmail?.current?.focus && this.inputEmail?.current?.focus();
        } else if (this.focusedInput === 'email') {
            this.inputPassword?.current?.focus && this.inputPassword?.current?.focus();
        } else if (this.focusedInput === 'password') {
            if (values &&
                values.firstName &&
                values.lastName &&
                values.email &&
                values.password &&
                this.handleSubmit
            ) {
                Keyboard.dismiss();
                this.handleSubmit();
            } else {
                this.inputFirstName?.current?.focus && this.inputFirstName?.current?.focus();
            }
        }
    }

    private animateBackgroundVector (): void {
        const { animBackgroundTransform } = this.state;
        Animated.timing(animBackgroundTransform, {
            toValue: 1,
            duration: 1100,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private animateBackgroundVectorForm (animateOut?: boolean): void {
        const toValue = animateOut ? 0 : 1;
        const { animBackgroundFormTransform } = this.state;
        Animated.timing(animBackgroundFormTransform, {
            toValue: toValue,
            duration: 1500,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private animateTitle (): void {
        const { animTitleTransform } = this.state;
        Animated.spring(animTitleTransform, {
            toValue: 1,
            speed: 5,
            bounciness: 15,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private animateButtons (animateOut?: boolean): void {
        const {
            animFacebookButtonTransform, animFacebookButtonOpacity,
            animGoogleButtonTransform, animGoogleButtonOpacity,
            animEmailButtonTransform, animEmailButtonOpacity,
            animAppleButtonOpacity, animAppleButtonTransform
        } = this.state;
        const toValue = animateOut ? 0 : 1;
        const commonParams = {
            toValue,
            isInteraction: false,
            useNativeDriver: true
        };
        const opacityParams = {
            duration: 100,
            easing: Easing.ease
        };
        const springParams = {
            speed: 5,
            bounciness: animateOut ? 0 : 11
        };

        Animated.sequence([
            Animated.delay(delays.views.registration.buttons),
            Animated.parallel([
                Animated.sequence([
                    Animated.delay(delays.views.registration.facebook),
                    Animated.parallel([
                        Animated.spring(animFacebookButtonOpacity, {
                            ...commonParams,
                            ...opacityParams
                        }),
                        Animated.spring(animFacebookButtonTransform, {
                            ...commonParams,
                            ...springParams
                        })
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(delays.views.registration.google),
                    Animated.parallel([
                        Animated.spring(animGoogleButtonOpacity, {
                            ...commonParams,
                            ...opacityParams
                        }),
                        Animated.spring(animGoogleButtonTransform, {
                            ...commonParams,
                            ...springParams
                        })
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(delays.views.registration.email),
                    Animated.parallel([
                        Animated.spring(animEmailButtonTransform, {
                            ...commonParams,
                            ...opacityParams
                        }),
                        Animated.spring(animEmailButtonOpacity, {
                            ...commonParams,
                            ...springParams
                        })
                    ])
                ]),
                Animated.sequence([
                    Animated.delay(delays.views.registration.apple),
                    Animated.parallel([
                        Animated.spring(animAppleButtonOpacity, {
                            ...commonParams,
                            ...opacityParams
                        }),
                        Animated.spring(animAppleButtonTransform, {
                            ...commonParams,
                            ...springParams
                        })
                    ])
                ])
            ])
        ]).start(() => {
            if (animateOut) {
                this.setState({ step: 2 }, () => {
                    this.animateForm(animateOut);
                    this.animateBackgroundVectorForm();
                });
            }
        });
    }

    private animateForm (showForm: boolean): void {
        const toValue = showForm ? 1 : 0;
        const {
            animFormTitleTransform,
            animFieldFirstnameTransform,
            animFieldLastnameTransform,
            animFieldEmailTransform,
            animFieldPasswordTransform,
            animSubmitTransform
        } = this.state;
        const springParams = {
            toValue,
            speed: 10,
            bounciness: 5,
            isInteraction: false,
            useNativeDriver: true
        };
        Animated.parallel([
            Animated.spring(animFormTitleTransform, {
                toValue: toValue,
                speed: 5,
                bounciness: 3,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.spring(animFieldFirstnameTransform, {
                toValue: toValue,
                speed: 5,
                bounciness: 5,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.sequence([
                Animated.delay(50),
                Animated.spring(animFieldLastnameTransform, springParams)
            ]),
            Animated.sequence([
                Animated.delay(100),
                Animated.spring(animFieldEmailTransform, springParams)
            ]),
            Animated.sequence([
                Animated.delay(150),
                Animated.spring(animFieldPasswordTransform, springParams)
            ]),
            Animated.sequence([
                Animated.delay(200),
                Animated.spring(animSubmitTransform, springParams)
            ])
        ]).start(() => {
            if (!showForm) {
                this.setState({ step: 1 }, () => {
                    this.animateButtons(false);
                    this.animateBackgroundVectorForm(true);
                });
            }
        });
    }

    private animateFieldStyle (animated: Animated.Value): any {
        return {
            transform: [
                {
                    translateX: animated.interpolate({
                        inputRange: [0, 1],
                        outputRange: [viewportWidth, 0]
                    })
                }
            ]
        };
    }

    private goToOnboarding = (): void => {
        this.props.navigation.replace('OnboardingTransition');
    }

    private goBackToFirstStep = (): void => {
        this.animateForm(false);
    }

    private onPressEmail = (): void => {
        get(this.parallaxRef, 'current.scrollViewRef.current').scrollTo({y: 0});
        this.animateButtons(true);
    }

    private get hideKeyboardButton (): JSX.Element {
        const { showKeyboardButtons } = this.state;
        return (
            <HideKeyboardButton visible={showKeyboardButtons} />
        );
    }

    private get nextInputButton (): JSX.Element {
        const { keyboardButtonIcon, showKeyboardButtons } = this.state;
        return (
            <CustomKeyboardButton
                icon={keyboardButtonIcon}
                onPress={this.focusNextInput}
                visible={showKeyboardButtons}
            />
        );
    }

    private parallaxBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const { animBackgroundTransform, animBackgroundFormTransform } = this.state;
        const animatedBackgroundVectorStyle = {
            transform: [
                {
                    rotate: animBackgroundTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['-50deg', '0deg']
                    })
                }
            ]
        };
        const animatedBackgroundVectorFormStyle = {
            transform: [
                {
                    scale: animBackgroundFormTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 3]
                    })
                },
                {
                    translateY: animBackgroundFormTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, -BACKGROUND_IMAGE_HEIGHT * 0.7]
                    })
                },
                {
                    rotate: animBackgroundFormTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '15deg']
                    })
                }
            ]
        };
        const animatedBackgroundStyle = {
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [- viewportHeight, 0, viewportHeight],
                        outputRange: [0, 0, -viewportHeight * 0.85]
                    })
                }
            ]
        };
        return (
            <Fragment>
                <Animated.View style={animatedBackgroundVectorStyle}>
                    <Animated.View style={animatedBackgroundVectorFormStyle}>
                        <BackgroundVector
                            style={BACKGROUND_VECTOR_STYLE}
                            height={BACKGROUND_VECTOR_HEIGHT}
                            width={BACKGROUND_VECTOR_WIDTH}
                        />
                    </Animated.View>
                </Animated.View>
                <Animated.View style={animatedBackgroundStyle}>
                    <FadeInImage
                        source={{ uri: LOGIN_IMAGE_URL }}
                        containerCustomStyle={loginStyles.backgroundImageContainer}
                        duration={300}
                        initialZoom={1.4}
                        zoomDuration={1000}
                    />
                    {/* <FadeInImage
                        source={LOGO_NULI}
                        tintColor={loginStyles.logoImageContainer.tintColor}
                        containerCustomStyle={loginStyles.logoImageContainer}
                        resizeMode={'contain'}
                        duration={300}
                        initialZoom={1.4}
                        zoomDuration={1200}
                    /> */}
                    {/* <EllipsisSeparator containerTextStyle={loginStyles.ellipsisContainer} textStyle={loginStyles.ellipsis} /> */}
                </Animated.View>
                { this.title(animatedValue) }
            </Fragment>
        );
    }

    private parallaxForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <Header animatedValue={animatedValue} mode={'backPink'} />
        );
    }

    private onRegistered = async (): Promise<void> => {
        const routeName: TViews = 'ProgramSelection';
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName, params: {
                isFirstOpening: true,
                hideHeader: true,
                lastTouchId: this.props.firstTouchId
            }})]
        });
        this.props.updateOnboardingStep(OnboardingSteps.ProgramSelection);
        this.props.screenProps?.rootLoaderRef?.current?.close();
        this.props.navigation?.dispatch(resetAction);
        this.props.setLastTouchUpdateTimestamp(Date.now());
    }

    private onSubmit = async (values: IRegisterForm, actions: FormikProps<IRegisterForm>): Promise<void> => {
        const { firstTouchId, firstTouchLink, lastTouchId, lastTouchLink, screenProps } = this.props;

        if (!this.props.isInternetReachable) {
            this.props.screenProps.toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        this.props.screenProps.rootLoaderRef?.current?.open();

        const userObject = {
            email: values.email,
            firstName: values.firstName,
            firstTouchId: firstTouchId || 'none',
            firstTouchLink: firstTouchLink || 'none',
            lastName: values.lastName,
            lastTouchId: lastTouchId || 'none',
            lastTouchLink: lastTouchLink || 'none',
            password: values.password
        };

        try {
            await this.props.registerWithEmail(userObject, screenProps.toastManagerRef);
            this.onRegistered();
        } catch (error) {
            screenProps.rootLoaderRef?.current?.close();
            this.isSubmitting = false;
            if (!error.response) {
                // TODO-Angelo: Tell the user the server is unreachable ?
                actions.setFieldError('email', i18n.t('app.credentialsError'));
            }
            if (error.response && error.response.data && error.response.data.message) {
                if (error.response.data.message === 'Email already taken') {
                    actions.setFieldError('email', i18n.t('registration.emailAlreadyTaken'));
                } else {
                    actions.setFieldError('email', i18n.t('app.credentialsError'));
                }
            }
        }
    }

    private title (animatedValue: Animated.Value): JSX.Element {
        const { animTitleTransform } = this.state;
        const animatedTitleStyle = {
            transform: [
                {
                    translateX: animTitleTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-viewportWidth, 0]
                    })
                }
            ]
        };
        const animatedTitleStyleOnScroll = {
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [0, -viewportHeight * 0.95]
                    })
                },
                {
                    translateX: animatedValue.interpolate({
                        inputRange: [0, viewportWidth],
                        outputRange: [0, viewportWidth * 0.35]
                    })
                }
            ]
        };
        const titleStyle = [
            loginStyles.title,
            { lineHeight: getLineHeight(loginStyles.title.fontSize, 0.95, 1.2) },
            animatedTitleStyleOnScroll
        ];
        return (
            <Animated.View style={[loginStyles.titleContainer, animatedTitleStyle]}>
                <Animated.Text style={titleStyle}>{ i18n.t('registration.title') }</Animated.Text>
            </Animated.View>
        );
    }

    private get content (): JSX.Element {
        const {
            animFacebookButtonTransform, animFacebookButtonOpacity,
            animGoogleButtonTransform, animGoogleButtonOpacity,
            animEmailButtonTransform, animEmailButtonOpacity,
            animAppleButtonOpacity, animAppleButtonTransform
        } = this.state;
        const { screenProps } = this.props;
        const animatedFacebookStyle = {
            opacity: animFacebookButtonOpacity,
            transform: [{ scale: animFacebookButtonTransform }]
        };
        const animatedGoogleStyle = {
            opacity: animGoogleButtonOpacity,
            transform: [{ scale: animGoogleButtonTransform }]
        };
        const animatedEmailStyle = {
            opacity: animEmailButtonOpacity,
            transform: [{ scale: animEmailButtonTransform }]
        };
        const animatedAppleStyle = {
            opacity: animAppleButtonOpacity,
            transform: [{ scale: animAppleButtonTransform }]
        };

        return (
            <View style={loginStyles.contentContainer}>
                <Animated.View style={[loginStyles.buttonMarginBottom, animatedFacebookStyle]}>
                    <FacebookSignIn
                        firstTouchId={this.props.firstTouchId}
                        firstTouchLink={this.props.firstTouchLink}
                        lastTouchId={this.props.lastTouchId}
                        lastTouchLink={this.props.lastTouchLink}
                        mode={'register'}
                        onRegistered={this.onRegistered}
                        screenProps={screenProps}
                    />
                </Animated.View>
                <Animated.View style={[loginStyles.buttonMarginBottom, animatedGoogleStyle]}>
                    <GoogleSignIn
                        firstTouchId={this.props.firstTouchId}
                        firstTouchLink={this.props.firstTouchLink}
                        lastTouchId={this.props.lastTouchId}
                        lastTouchLink={this.props.lastTouchLink}
                        mode={'register'}
                        onRegistered={this.onRegistered}
                        screenProps={screenProps}
                    />
                </Animated.View>
                <Animated.View style={[loginStyles.buttonMarginBottom, animatedEmailStyle]}>
                    <SharedButton
                        borderRadius={LOGIN_BUTTON_BORDER_RADIUS}
                        color={'white'}
                        containerStyle={[loginStyles.emailButtonContainer]}
                        isTouchableScale={true}
                        icon={ENVELOPE_ICON}
                        onPress={this.onPressEmail}
                        text={i18n.t('registration.withEmail')}
                        textStyle={loginStyles.buttonText}
                    />
                </Animated.View>
                { isIOS && <Animated.View style={[loginStyles.buttonMarginBottom, animatedAppleStyle]}>
                    <AppleSignIn
                        mode={'register'}
                        onRegistered={this.onRegistered}
                        screenProps={screenProps}
                    />
                </Animated.View> }
            </View>
        );
    }

    private get form (): JSX.Element {
        const {
            animFormTitleTransform,
            animFieldFirstnameTransform,
            animFieldLastnameTransform,
            animFieldEmailTransform,
            animFieldPasswordTransform,
            animSubmitTransform
        } = this.state;
        const animatedFormTitleStyle = [
            styles.labelContainer,
            { transform: [
                {
                    translateX: animFormTitleTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-viewportWidth, 0]
                    })
                }
            ]}
        ];
        const animatedFieldFistnameStyle = this.animateFieldStyle(animFieldFirstnameTransform);
        const animatedFieldLastnameStyle = this.animateFieldStyle(animFieldLastnameTransform);
        const animatedFieldEmailStyle = this.animateFieldStyle(animFieldEmailTransform);
        const animatedFieldPasswordStyle = this.animateFieldStyle(animFieldPasswordTransform);
        const animatedSubmitStyle = this.animateFieldStyle(animSubmitTransform);

        const initialValues = {
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        } as IRegisterForm;

        // nameRegExp: letter (lower, upper), accent (\u00C0-\u00FF), punct (‘’' -)
        const nameRegEx = /^([a-zA-Z\u00C0-\u00FF]+(([‘’' -][a-zA-Z\u00C0-\u00FF ])?[a-zA-Z\u00C0-\u00FF]*)*$)|/;
        // http://flyingsky.github.io/2018/01/26/javascript-detect-chinese-japanese/

        // passwordRegEx: min 6 characters, at least 1 digit
        const passwordRegEx = /^(?=.*\d).{6,}$/;

        const validationSchema = Yup.object().shape({
            firstName: Yup
            .string()
            .required(i18n.t('global.fieldRequired'))
            .min(1, i18n.t('global.fieldMinLength', {number: 1}))
            .max(40, i18n.t('global.fieldMaxLength', {number: 40}))
            .matches(nameRegEx, i18n.t('global.fieldValidName')),
            lastName: Yup
            .string()
            .required(i18n.t('global.fieldRequired'))
            .min(1, i18n.t('global.fieldMinLength', {number: 1}))
            .max(40, i18n.t('global.fieldMaxLength', {number: 40}))
            .matches(nameRegEx, i18n.t('global.fieldValidName')),
            email: Yup
            .string()
            .required(i18n.t('global.fieldRequired'))
            .max(255, i18n.t('global.fieldMaxLength', {number: 255}))
            .email(i18n.t('global.fieldValidEmail')),
            password: Yup
            .string()
            .required(i18n.t('global.fieldRequired'))
            .min(6, i18n.t('global.fieldMinLength', {number: 6}))
            .max(40, i18n.t('global.fieldMaxLength', {number: 40}))
            .matches(passwordRegEx, i18n.t('global.fieldValidPassword'))
        });

        const commonInputProps: any = {
            autoCapitalize: 'none',
            autoCorrect: false,
            clearButtonMode: 'while-editing',
            returnKeyType: 'done',
            placeholderTextColor: chroma(colors.white).alpha(0.45).css(),
            selectionColor: colors.violetDark,
            style: loginStyles.input
            // enablesReturnKeyAutomatically: true,
            // keyboardAppearance: 'dark',
        };

        return (
            <Formik
                // validateOnMount={true}
                initialValues={initialValues}
                onSubmit={(values: IRegisterForm, actions: FormikProps<IRegisterForm>) => this.onSubmit(values, actions)}
                validationSchema={validationSchema}
                innerRef={(ref: FormikProps<IRegisterForm>) => { this.formikProps = ref; }}
            >
                {({ handleChange, setFieldTouched, values, errors, touched, isValid, handleSubmit }: FormikProps<IRegisterForm>) => {
                    this.handleSubmit = handleSubmit;
                    return (
                        <View>
                            <Animated.View style={animatedFormTitleStyle}>
                                <SharedVerticalTitle
                                    height={300}
                                    IconComponent={<Image source={ENVELOPE_ICON} style={styles.labelEmailIcon} />}
                                    textStyle={styles.label}
                                    title={i18n.t('registration.withEmail')}
                                    width={FIELD_CONTAINER_PADDING_LEFT}
                                />
                            </Animated.View>
                            <Animated.View style={loginStyles.fieldsContainer}>
                                <Animated.View style={[loginStyles.fieldContainer, animatedFieldFistnameStyle]}>
                                    {touched.firstName && errors.firstName &&
                                        <Text style={loginStyles.error}>* {errors.firstName}</Text>
                                    }
                                    <View style={loginStyles.inputWrapper}>
                                        <View style={loginStyles.inputBackground} />
                                        <View style={[loginStyles.inputContainer, { backgroundColor: INPUT_COLORS_SCALE(0).css()}]}>
                                            <Image source={USER_ICON} style={[loginStyles.inputIcon, styles.userIcon]} />
                                            <TextInput
                                                { ...commonInputProps }
                                                blurOnSubmit={false} // Prevent keyboard flickering when focusing the next input
                                                onChangeText={handleChange('firstName')}
                                                onBlur={() => setFieldTouched('firstName')}
                                                onFocus={() => this.onSetFocus('firstName')}
                                                onSubmitEditing={this.focusNextInput}
                                                placeholder={i18n.t('global.firstName')}
                                                ref={this.inputFirstName}
                                                value={values.firstName}
                                            />
                                        </View>
                                    </View>
                                </Animated.View>
                                <Animated.View style={[loginStyles.fieldContainer, animatedFieldLastnameStyle]}>
                                    {touched.lastName && errors.lastName &&
                                        <Text style={loginStyles.error}>* {errors.lastName}</Text>
                                    }
                                    <View style={loginStyles.inputWrapper}>
                                        <View style={loginStyles.inputBackground} />
                                        <View style={[loginStyles.inputContainer, { backgroundColor: INPUT_COLORS_SCALE(0.33).css()}]}>
                                            <Image source={USER_ICON} style={[loginStyles.inputIcon, styles.userIcon]} />
                                            <TextInput
                                                { ...commonInputProps }
                                                blurOnSubmit={false} // Prevent keyboard flickering when focusing the next input
                                                onBlur={() => setFieldTouched('lastName')}
                                                onChangeText={handleChange('lastName')}
                                                onFocus={() => this.onSetFocus('lastName')}
                                                onSubmitEditing={this.focusNextInput}
                                                placeholder={i18n.t('global.lastName')}
                                                ref={this.inputLastName}
                                                value={values.lastName}
                                            />
                                        </View>
                                    </View>
                                </Animated.View>
                                <Animated.View style={[loginStyles.fieldContainer, animatedFieldEmailStyle]}>
                                    {touched.email && errors.email &&
                                        <Text style={loginStyles.error}>* {errors.email}</Text>
                                    }
                                    <View style={loginStyles.inputWrapper}>
                                        <View style={loginStyles.inputBackground} />
                                        <View style={[loginStyles.inputContainer, { backgroundColor: INPUT_COLORS_SCALE(0.66).css()}]}>
                                            <Image source={AT_ICON} style={[loginStyles.inputIcon, styles.atIcon]} />
                                            <TextInput
                                                { ...commonInputProps }
                                                blurOnSubmit={false} // Prevent keyboard flickering when focusing the next input
                                                keyboardType={'email-address'}
                                                onBlur={() => setFieldTouched('email')}
                                                onChangeText={handleChange('email')}
                                                onFocus={() => this.onSetFocus('email')}
                                                onSubmitEditing={this.focusNextInput}
                                                placeholder={i18n.t('global.email')}
                                                ref={this.inputEmail}
                                                value={values.email}
                                            />
                                        </View>
                                    </View>
                                </Animated.View>
                                <Animated.View style={[loginStyles.fieldContainer, animatedFieldPasswordStyle]}>
                                    {touched.password && errors.password &&
                                        <Text style={loginStyles.error}>* {errors.password}</Text>
                                    }
                                    <View style={loginStyles.inputWrapper}>
                                        <View style={loginStyles.inputBackground} />
                                        <View style={[loginStyles.inputContainer, { backgroundColor: INPUT_COLORS_SCALE(1).css()}]}>
                                            <Image source={PADLOCK_ICON} style={[loginStyles.inputIcon, styles.padlockIcon]} />
                                            <TextInput
                                                { ...commonInputProps }
                                                onBlur={() => setFieldTouched('password')}
                                                onChangeText={handleChange('password')}
                                                onFocus={() => this.onSetFocus('password')}
                                                onSubmitEditing={() => handleSubmit()}
                                                placeholder={i18n.t('global.password')}
                                                ref={this.inputPassword}
                                                secureTextEntry={true}
                                                selectTextOnFocus={true}
                                                value={values.password}
                                            />
                                        </View>
                                    </View>
                                </Animated.View>
                                <Animated.View style={animatedSubmitStyle}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (this.isSubmitting === false) {
                                                this.isSubmitting = true;
                                                handleSubmit();
                                            }
                                        }}
                                        activeOpacity={0.7}
                                        style={loginStyles.submitButton}
                                        disabled={!isValid}
                                    >
                                        <Text style={loginStyles.submitText}>{i18n.t('global.go')}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </Animated.View>
                        </View>
                    );
                }}
          </Formik>
        );
    }

    public render (): JSX.Element {
        const { step } = this.state;
        const { navigation } = this.props;

        return (
            <View style={styles.container}>
                <NavigationEvents
                    onWillBlur={this.onWillBlur}
                />
                <SharedParallaxView
                    ref={this.parallaxRef}
                    renderBackground={this.parallaxBackground}
                    renderForeground={this.parallaxForeground}
                    showsVerticalScrollIndicator={false}
                    overScrollMode={'never'}
                    contentContainerStyle={loginStyles.scrollViewContainer}
                >
                    { step && step === 1 ? this.content : this.form }
                </SharedParallaxView>
                { this.hideKeyboardButton }
                { this.nextInputButton }
                { step && step === 1 && navigation?.isFirstRouteInParent && navigation?.isFirstRouteInParent() &&
                    <TouchableOpacity
                        style={loginStyles.backToFirstStep}
                        onPress={this.goToOnboarding}
                    />
                }
                { step && step === 2 &&
                    <TouchableOpacity
                        style={loginStyles.backToFirstStep}
                        onPress={this.goBackToFirstStep}
                    />
                }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    auth: state.auth,
    influencers: state.influencers.influencers,
    firstTouchId: state.influencers.firstTouchId,
    firstTouchLink: state.influencers.firstTouchLink,
    isInternetReachable: state.network.isInternetReachable,
    lastTouchId: state.influencers.lastTouchId,
    lastTouchLink: state.influencers.lastTouchLink
});

export default connect(mapStateToProps, { login, updateOnboardingStep, registerWithEmail, setLastTouchUpdateTimestamp })(Registration);
