import React, { Component, Fragment, RefObject } from 'react';
import {
    View, Text, TouchableOpacity, TextInput, Animated, Image, Keyboard,
    Easing, ImageSourcePropType, BackHandler, NativeEventSubscription
} from 'react-native';
import { connect } from 'react-redux';
import { TViews } from './index';
import { StackActions, NavigationActions, NavigationEvents } from 'react-navigation';
import { Formik, FormikProps } from 'formik';
import { get } from 'lodash';
import * as Yup from 'yup';
import { IReduxState } from '../store/reducers';
import { IAuthState, ILoginPayload, login } from '../store/modules/auth';
import { IUserProfileState } from '../store/modules/userProfile';
import { updateOnboardingStep, OnboardingSteps } from '../store/modules/onboarding';
import { refreshProgression } from '../utils/progression';
import {isAndroid, isIOS} from '../utils/os';
import { IScreenProps } from '../index';
import chroma from 'chroma-js';
import delays from '../utils/animDelays';
import { isReleaseBundleID } from '../utils/bundleId';
import i18n from '../utils/i18n';
import { LOGIN_IMAGE_URL } from '../utils/staticLinks';
import { API_DOMAIN } from '../../env';

import AppleSignIn from '../components/AppleSignIn';
import CustomKeyboardButton from '../components/CustomKeyboardButton';
// import EllipsisSeparator from '../components/EllipsisSeparator';
import FacebookSignIn from '../components/FacebookSignIn';
import FadeInImage from '../components/FadeInImage';
import ForgotPassword from '../components/Popups/ForgotPassword';
import GoogleSignIn from '../components/GoogleSignIn';
import Header from '../components/Header';
import HideKeyboardButton from '../components/HideKeyboardButton';
import SharedButton from '../components/SharedButton';
import SharedParallaxView from '../components/SharedParallaxView';
import ToastManager from '../components/ToastManager';

import colors from '../styles/base/colors.style';
import { getLineHeight } from '../styles/base/fonts.style';
import { viewportWidth, viewportHeight } from '../styles/base/metrics.style';
import styles, {
    BACKGROUND_IMAGE_HEIGHT,
    BACKGROUND_VECTOR_HEIGHT,
    BACKGROUND_VECTOR_WIDTH,
    BACKGROUND_VECTOR_STYLE,
    LOGIN_BUTTON_BORDER_RADIUS
} from '../styles/views/Login.style';

import BackgroundVector from '../static/Login/background.svg';

// const LOGO_NULI = require('../static/shared/logo-nuli.png');

const AT_ICON = require('../static/icons/at.png');
const CHECK_ICON = require('../static/icons/checkmark-thin.png');
const ENVELOPE_ICON = require('../static/icons/envelope.png');
const NEXT_ICON = require('../static/icons/next.png');
const PADLOCK_ICON = require('../static/icons/padlock.png');

interface ILoginForm {
    email: string;
    password: string;
}

interface IProps extends IAuthState {
    login: (payload: ILoginPayload, toastManagerRef?: RefObject<ToastManager>) => Promise<string>;
    navigation: any;
    screenProps: IScreenProps;
    updateOnboardingStep: (step: OnboardingSteps) => void;
    userProfile: IUserProfileState;
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
    animFieldEmailTransform: Animated.Value;
    animFieldPasswordTransform: Animated.Value;
    animSubmitTransform: Animated.Value;
    animTitleTransform: Animated.Value;
    keyboardButtonIcon: ImageSourcePropType;
    showKeyboardButtons: boolean;
    step: 1 | 2;
}

class Login extends Component<IProps, IState> {

    private backHandler: NativeEventSubscription;
    private focusedInput: 'email' | 'password';
    private handleSubmit: () => any;
    private inputEmail: RefObject<TextInput>;
    private inputPassword: RefObject<TextInput>;
    private isSubmitting: boolean;
    private keyboardDidHideListener: any;
    private keyboardDidShowListener: any;
    private keyboardWillHideListener: any;
    private keyboardWillShowListener: any;
    private formikProps: FormikProps<ILoginForm>;
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
            animFieldEmailTransform: new Animated.Value(0),
            animFieldPasswordTransform: new Animated.Value(0),
            animSubmitTransform: new Animated.Value(0),
            animTitleTransform: new Animated.Value(0),
            keyboardButtonIcon: NEXT_ICON,
            showKeyboardButtons: false,
            step: 1
        };
        this.handleSubmit = undefined;
        this.inputEmail = React.createRef();
        this.inputPassword = React.createRef();
        this.isSubmitting = false;
        this.parallaxRef = React.createRef();
    }

    public componentDidMount (): void {
        // Manage hardware back button (this will overload the listener in AppDrawer)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        this.addKeyboardEventListeners();
        this.animateButtons();
        this.animateTitle();
        this.animateBackground();
    }

    public async componentWillUnmount (): Promise<void> {
        this.removeKeyboardEventListeners();
        this.backHandler.remove();
    }

    private handleBackPress = (): boolean => {
        const popupManager = this.props.screenProps.popupManagerRef?.current;

        // If there is a popup opened we dismiss it
        if (popupManager && popupManager.currentPopup && !popupManager.currentPopup?.preventOverlayDismissal) {
            popupManager.dismissPopup();
            return true;
        }

        // If we are on step 2 we go back to step one
        if (this.state.step === 2) {
            this.animateForm(false);
            return true;
        }
    }

    private onDidFocus = (): void => {
    }

    private onWillBlur = (): void => {
        Keyboard.dismiss();
    }

    private onKeyboardDidHide = (): void => {
        this.focusedInput = null;
    }

    private onSetFocus = (ref: 'email' | 'password'): void => {
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
        const values: ILoginForm = this.formikProps?.values;
        if (this.focusedInput === 'password') {
            if (values && values.email && values.password && this.handleSubmit) {
                Keyboard.dismiss();
                this.handleSubmit();
            } else {
                this.inputEmail?.current?.focus && this.inputEmail?.current?.focus();
            }
        } else {
            this.inputPassword?.current?.focus && this.inputPassword?.current?.focus();
        }
    }

    private animateBackground (/*animateOut?: boolean*/): void {
        const toValue = 1; //animateOut ? 0 : 1;
        const { animBackgroundTransform } = this.state;
        Animated.timing(animBackgroundTransform, {
            toValue: toValue,
            duration: 1500,
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

    private animateForm (animateOut: boolean): void {
        const {
            animFieldEmailTransform,
            animFieldPasswordTransform,
            animSubmitTransform
        } = this.state;
        const toValue = animateOut ? 1 : 0;
        const springParams = {
            toValue,
            speed: 10,
            bounciness: 5,
            isInteraction: false,
            useNativeDriver: true
        };
        Animated.parallel([
            Animated.sequence([
                Animated.delay(50),
                Animated.spring(animFieldEmailTransform, springParams)
            ]),
            Animated.sequence([
                Animated.delay(100),
                Animated.spring(animFieldPasswordTransform, springParams)
            ]),
            Animated.sequence([
                Animated.delay(150),
                Animated.spring(animSubmitTransform, springParams)
            ])
        ]).start(() => {
            if (!animateOut) {
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

    private login = async (values: ILoginForm, actions: FormikProps<ILoginForm>) => {
        const { screenProps } = this.props;

        screenProps.rootLoaderRef?.current?.open();
        try {
            await this.props.login(
                {
                    email: values.email,
                    password: values.password
                },
                screenProps.toastManagerRef
            );
            this.onLoggedIn();
        } catch (error) {
            // Handled in login() from auth
            this.isSubmitting = false;
            actions.setFieldError('email', i18n.t('app.credentialsError'));
        } finally {
            screenProps.rootLoaderRef?.current?.close();
        }
    }

    private onLoggedIn = (): void => {
        try {
            const routeName: TViews = 'Training';
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName })]
            });
            this.props.updateOnboardingStep(OnboardingSteps.Done);
            this.props.screenProps.rootLoaderRef?.current?.close();
            this.props.navigation.dispatch(resetAction);
            refreshProgression();
        } catch (err) {
            console.log(err);
            this.isSubmitting = false;
            this.props.screenProps.rootLoaderRef?.current?.close();
        }
    }

    private onPressEmail = (): void => {
        get(this.parallaxRef, 'current.scrollViewRef.current').scrollTo({y: 0});
        this.animateButtons(true);
    }

    private onPressForgotPassword = (): void => {
        const { screenProps } = this.props;
        screenProps.popupManagerRef?.current?.requestPopup({
            ContentComponent: ForgotPassword,
            ContentComponentProps: {
                screenProps: screenProps
            },
            height: Math.round(viewportHeight * 0.45),
            position: 'bottom',
            scrollView: false,
            title: i18n.t('forgotPassword.title')
        });
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

        const apiEnv = API_DOMAIN.includes('staging') ? 'Staging' : 'Production'; // TODO: better way to retrieve this?
        const apiInfo = !isReleaseBundleID() ? (
            <Text style={styles.apiInfo}>
                { `API: ${apiEnv}` }
            </Text>
        ) : null;

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
                        containerCustomStyle={styles.backgroundImageContainer}
                        duration={300}
                        initialZoom={1.4}
                        zoomDuration={1000}
                    />
                    {/* <FadeInImage
                        source={LOGO_NULI}
                        tintColor={styles.logoImageContainer.tintColor}
                        containerCustomStyle={styles.logoImageContainer}
                        resizeMode={'contain'}
                        duration={300}
                        initialZoom={1.4}
                        zoomDuration={1200}
                    /> */}
                    {/* <EllipsisSeparator containerTextStyle={styles.ellipsisContainer} textStyle={styles.ellipsis} /> */}
                </Animated.View>
                { apiInfo }
                { this.title(animatedValue) }
            </Fragment>
        );
    }

    private parallaxForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <Header animatedValue={animatedValue} mode={'backPink'} />
        );
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
            styles.title,
            { lineHeight: getLineHeight(styles.title.fontSize, 0.95, 1.2) },
            animatedTitleStyleOnScroll
        ];
        return (
            <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
                <Animated.Text style={titleStyle}>{ i18n.t('login.title') }</Animated.Text>
            </Animated.View>
        );
    }

    private get form (): JSX.Element {
        const { userProfile } = this.props;
        const {
            animFieldEmailTransform,
            animFieldPasswordTransform,
            animSubmitTransform
        } = this.state;

        const animatedFieldEmailStyle = this.animateFieldStyle(animFieldEmailTransform);
        const animatedFieldPasswordStyle = this.animateFieldStyle(animFieldPasswordTransform);
        const animatedSubmitStyle = this.animateFieldStyle(animSubmitTransform);

        const initialValues = {
            email: userProfile.email || '',
            password: ''
        } as ILoginForm;

        const validationSchema = Yup.object().shape({
            email: Yup
            .string()
            .required(i18n.t('global.fieldRequired')),
            password: Yup
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
            style: styles.input
            // enablesReturnKeyAutomatically: true,
            // keyboardAppearance: 'dark',
        };

        return (
            <Formik
                initialValues={initialValues}
                onSubmit={(values: ILoginForm, actions: FormikProps<ILoginForm>) => this.login(values, actions)}
                validationSchema={validationSchema}
                innerRef={(ref: FormikProps<ILoginForm>) => { this.formikProps = ref; }}
            >
                {({ handleChange, setFieldTouched, values, errors, touched, handleSubmit }: FormikProps<ILoginForm>) => {
                    this.handleSubmit = handleSubmit;
                    return (
                        <View>
                            <View style={styles.fieldsContainer}>
                                <Animated.View style={[styles.fieldContainer, animatedFieldEmailStyle]}>
                                    {touched.email && errors.email &&
                                        <Text style={styles.error}>* {errors.email}</Text>
                                    }
                                    <View style={styles.inputWrapper}>
                                        <View style={styles.inputBackground} />
                                        <View style={[styles.inputContainer, {backgroundColor: '#EA76A1'}]}>
                                            <Image source={AT_ICON} style={[styles.inputIcon, styles.atIcon]} />
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
                                <Animated.View style={[styles.fieldContainer, animatedFieldPasswordStyle]}>
                                    {touched.password && errors.password &&
                                        <Text style={styles.error}>* {errors.password}</Text>
                                    }
                                    <View style={styles.inputWrapper}>
                                        <View style={styles.inputBackground} />
                                        <View style={[styles.inputContainer, {backgroundColor: '#DD7BCE'}]}>
                                            <Image source={PADLOCK_ICON} style={[styles.inputIcon, styles.padlockIcon]} />
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
                                    <TouchableOpacity
                                        onPress={this.onPressForgotPassword}
                                    >
                                        <Text style={styles.forgotPassword}>
                                            {i18n.t('login.forgotPassword')}
                                        </Text>
                                    </TouchableOpacity>
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
                                        style={styles.submitButton}
                                    >
                                        <Text style={styles.submitText}>{i18n.t('login.go')}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        </View>
                    );
                }}
          </Formik>
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
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.buttonMarginBottom, animatedFacebookStyle]}>
                    <FacebookSignIn
                       mode={'login'}
                       onLoggedIn={this.onLoggedIn}
                       screenProps={screenProps}
                    />
                </Animated.View>
                <Animated.View style={[styles.buttonMarginBottom, animatedGoogleStyle]}>
                    <GoogleSignIn
                        mode={'login'}
                        onLoggedIn={this.onLoggedIn}
                        screenProps={screenProps}
                    />
                </Animated.View>
                <Animated.View style={[styles.buttonMarginBottom, animatedEmailStyle]}>
                    <SharedButton
                        borderRadius={LOGIN_BUTTON_BORDER_RADIUS}
                        color={'white'}
                        containerStyle={[styles.emailButtonContainer]}
                        isTouchableScale={true}
                        icon={ENVELOPE_ICON}
                        onPress={this.onPressEmail}
                        text={i18n.t('registration.withEmail')}
                        textStyle={styles.buttonText}
                    />
                </Animated.View>
                { isIOS && <Animated.View style={[styles.buttonMarginBottom, animatedAppleStyle]}>
                    <AppleSignIn
                        mode={'login'}
                        onLoggedIn={this.onLoggedIn}
                        screenProps={screenProps}
                    />
                </Animated.View> }
            </View>
        );
    }

    public render (): JSX.Element {
        const { step } = this.state;
        const { navigation } = this.props;

        return (
            <View style={styles.container}>
                <NavigationEvents
                    onDidFocus={this.onDidFocus}
                    onWillBlur={this.onWillBlur}
                />
                <SharedParallaxView
                    ref={this.parallaxRef}
                    renderBackground={this.parallaxBackground}
                    renderForeground={this.parallaxForeground}
                    showsVerticalScrollIndicator={false}
                    overScrollMode={'never'}
                    contentContainerStyle={styles.scrollViewContainer}
                >
                    { step && step === 1 ? this.content : this.form }
                </SharedParallaxView>
                { this.hideKeyboardButton }
                { this.nextInputButton }
                { step && step === 1 && navigation?.isFirstRouteInParent && navigation?.isFirstRouteInParent() &&
                    <TouchableOpacity
                        style={styles.backToFirstStep}
                        onPress={this.goToOnboarding}
                    />
                }
                { step && step === 2 &&
                    <TouchableOpacity
                        style={styles.backToFirstStep}
                        onPress={this.goBackToFirstStep}
                    />
                }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    auth: state.auth,
    userProfile: state.userProfile
});

export default connect(mapStateToProps, { login, updateOnboardingStep })(Login);
