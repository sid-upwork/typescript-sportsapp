import React, { Component } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { setPinCode, setPinCodeEnabled } from '../store/modules/userProfile';
import { resetPinCodeInKeychain } from '../utils/pinCode';
import { IReduxState } from '../store/reducers';
import { ENDPOINTS } from '../utils/endpoints';
import { IScreenProps } from '../index';
import { connect } from 'react-redux';
import i18n from '../utils/i18n';
import api from '../utils/api';

import PINCode, { hasUserSetPinCode, IProps as PINCodeProps } from '@haskkor/react-native-pincode';

import ForgotPinCode from '../components/Popups/ForgotPinCode';
import Header, { THeaderMode } from '../components/Header';

import { isMHeight } from '../styles/base/metrics.style';
import styles, { ACTIVE_COLOR, ERROR_COLOR, TITLE_COLOR } from '../styles/views/PinCode.style';

import Blob from '../static/PinCode/pincode-shape.svg';

const SHOW_SUBTITLES = isMHeight;

interface IProps {
    id: string;
    navigation: any;
    pinCode: string;
    pinCodeEnabled: boolean;
    setPinCode: (pinCode: string) => void;
    setPinCodeEnabled: (enabled: boolean) => void;
    screenProps: IScreenProps;
}

interface IState {
    status: PINCodeProps['status'];
}

class PinCode extends Component<IProps, IState> {

    private headerMode: THeaderMode;
    private mode: 'change' | 'disable' | 'enable';
    private onFinishProcessCallback: () => void;
    private protectedRouteName: string;
    private protectedRouteNavigationParams: any;

    constructor (props: IProps) {
        super(props);
        this.headerMode = props.navigation.getParam('headerMode') || 'menuWhite';
        this.mode = props.navigation.getParam('mode');
        this.onFinishProcessCallback = props.navigation.getParam('onFinishProcessCallback');
        this.protectedRouteName = props.navigation.getParam('protectedRouteName');
        this.protectedRouteNavigationParams = props.navigation.getParam('protectedRouteNavigationParams');
        this.state = {
            status: undefined
        };
    }

    public async componentDidMount (): Promise<void> {
        const { screenProps } = this.props;

        screenProps.rootLoaderRef?.current?.open();

        // There's currently a bug on Android with the latest version
        // Every time we call `hasUserSetPinCode()` this asks for touch id
        // See https://github.com/jarden-digital/react-native-pincode/issues/133
        // https://github.com/jarden-digital/react-native-pincode/issues/137
        // The current fallback is to use react-native-pincode v1.2.0 and react-native-keychain v4.0.5
        const pinCodeSet = await hasUserSetPinCode();

        this.setState({ status: pinCodeSet ? 'enter' : 'choose' }, () => {
            screenProps.rootLoaderRef?.current?.close();
        });
    }

    private onFinishProcess = async (pinCode: string): Promise<void> => {
        const { id, navigation, screenProps } = this.props;
        const { status } = this.state;

        screenProps.rootLoaderRef?.current?.open();

        try {
            if (status === 'choose') {
                await api.put(ENDPOINTS.users + '/' + id, { pinCode });
                this.props.setPinCode(pinCode);
            }

            switch (this.mode) {
                case 'enable':
                    this.props.setPinCodeEnabled(true);
                    screenProps.toastManagerRef?.current?.openToast({
                        message: i18n.t('pinCode.enabledToastMessage'),
                        type: 'info'
                    });
                    this.onFinishProcessCallback && this.onFinishProcessCallback();
                    navigation.goBack();
                    break;

                case 'change':
                    // In "change" mode, we first want to confirm the PIN code (status > enter)
                    // And then input a new one (status > choose)
                    if (status === 'enter') {
                        this.setState({ status: 'choose' });
                    } else if (status === 'choose') {
                        screenProps.toastManagerRef?.current?.openToast({
                            message: i18n.t('pinCode.changedToastMessage'),
                            type: 'info'
                        });
                        this.onFinishProcessCallback && this.onFinishProcessCallback();
                        navigation.goBack();
                    }
                    break;

                case 'disable':
                    await api.put(ENDPOINTS.users + '/' + id, { pinCode: null });
                    await resetPinCodeInKeychain();
                    this.props.setPinCodeEnabled(false);
                    screenProps.toastManagerRef?.current?.openToast({
                        message: i18n.t('pinCode.disabledToastMessage'),
                        type: 'info'
                    });
                    this.onFinishProcessCallback && this.onFinishProcessCallback();
                    navigation.goBack();
                    break;

                default:
                    if (this.protectedRouteName) {
                        this.onFinishProcessCallback && this.onFinishProcessCallback();
                        navigation.replace(this.protectedRouteName, this.protectedRouteNavigationParams);
                    } else {
                        console.log(new Error('No protectedRouteName provided to PINCode'));
                    }
                    break;
            }
        } catch (error) {
            console.log(error);
            screenProps.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        } finally {
            screenProps.rootLoaderRef?.current?.close();
        }
    }

    private onPressForgotPincode = (): void => {
        this.props.screenProps.popupManagerRef?.current?.requestPopup({
            ContentComponent: ForgotPinCode,
            ContentComponentProps: {
                navigation: this.props.navigation,
                protectedRouteName: this.protectedRouteName,
                protectedRouteNavigationParams: this.protectedRouteNavigationParams,
                screenProps: this.props.screenProps
            },
            height: 340,
            position: 'bottom',
            scrollView: false
        });
    }

    private onPressSkip = (): void => {
        this.props.setPinCodeEnabled(false);
        if (this.protectedRouteName) {
            this.onFinishProcessCallback && this.onFinishProcessCallback();
            this.props.navigation.replace(this.protectedRouteName, this.protectedRouteNavigationParams);
        } else {
            console.log(new Error('No protectedRouteName provided to PINCode'));
        }
    }

    private get forgotPinCode (): JSX.Element {
        if (this.state.status !== 'enter') {
            return null;
        }

        return (
            <TouchableOpacity activeOpacity={0.7} onPress={this.onPressForgotPincode} style={styles.forgotCode}>
                <Text style={styles.forgotCodeText}>{ i18n.t('pinCode.forgotPinCode') }</Text>
            </TouchableOpacity>
        );
    }

    private get skip (): JSX.Element {
        if (this.state.status !== 'choose' || this.props.pinCodeEnabled !== undefined) {
            return null;
        }

        return (
            <TouchableOpacity activeOpacity={0.7} onPress={this.onPressSkip} style={styles.skip}>
                <View style={styles.skipTextContainer}>
                    <Text style={styles.skipText}>{ i18n.t('pinCode.skip') }</Text>
                </View>
                <Text style={styles.skipInfoText}>{ i18n.t('pinCode.skipInfo') }</Text>
            </TouchableOpacity>
        );
    }

    public render (): JSX.Element {
        const { status } = this.state;

        const translations: any = {
            buttonDeleteText: i18n.t('pinCode.buttonDeleteText'),
            subtitleChoose: i18n.t('pinCode.subtitleChoose'),
            subtitleError: i18n.t('pinCode.subtitleError'),
            textCancelButtonTouchID: i18n.t('pinCode.textCancelButtonTouchID'),
            textDescriptionLockedPage: i18n.t('pinCode.textDescriptionLockedPage'),
            textSubDescriptionLockedPage: i18n.t('pinCode.textSubDescriptionLockedPage'),
            textTitleLockedPage: i18n.t('pinCode.textTitleLockedPage'),
            titleAttemptFailed: i18n.t('pinCode.titleAttemptFailed'),
            titleChoose: i18n.t('pinCode.titleChoose'),
            titleConfirm: i18n.t('pinCode.titleConfirm'),
            titleConfirmFailed: i18n.t('pinCode.titleConfirmFailed'),
            titleEnter: i18n.t('pinCode.titleEnter'),
            touchIDSentence: i18n.t('pinCode.touchIDSentence'),
            touchIDTitle: i18n.t('pinCode.touchIDTitle')
        };

        if (this.mode === 'change') {
            translations.titleChoose = i18n.t('pinCode.changeMode.titleChoose');
            translations.titleConfirm = i18n.t('pinCode.changeMode.titleConfirm');
            translations.titleEnter = i18n.t('pinCode.changeMode.titleEnter');
        }

        if (this.mode === 'disable') {
            translations.subtitleEnter = i18n.t('pinCode.disableMode.subtitleChoose');
        }

        // Disable subtitles on small devices to save vertical space
        const specificProps = isMHeight ? {} : { subtitleComponent: () => <View /> };

        return  (
            <View style={styles.container}>
                <Blob
                    height={styles.backgroundBlob.height}
                    style={styles.backgroundBlob}
                    width={styles.backgroundBlob.width}
                />
                <PINCode
                    buttonComponentLockedPage={() => null}
                    colorCircleButtons={'#F2F5FB'}
                    colorPassword={ACTIVE_COLOR}
                    colorPasswordEmpty={TITLE_COLOR}
                    colorPasswordError={ERROR_COLOR}
                    finishProcess={this.onFinishProcess}
                    numbersButtonOverlayColor={ACTIVE_COLOR}
                    status={status}
                    styleLockScreenViewIcon={{ backgroundColor: ACTIVE_COLOR }}
                    styleMainContainer={styles.pinContainer}
                    stylePinCodeButtonNumber={ACTIVE_COLOR}
                    stylePinCodeButtonNumberPressed={TITLE_COLOR}
                    stylePinCodeColorSubtitle={TITLE_COLOR}
                    stylePinCodeColorSubtitleError={ERROR_COLOR}
                    stylePinCodeColorTitle={TITLE_COLOR}
                    stylePinCodeColorTitleError={ERROR_COLOR}
                    stylePinCodeDeleteButtonColorHideUnderlay={ACTIVE_COLOR}
                    stylePinCodeDeleteButtonColorShowUnderlay={ACTIVE_COLOR}
                    stylePinCodeDeleteButtonSize={42}
                    stylePinCodeDeleteButtonText={styles.deleteButtonText}
                    stylePinCodeHiddenPasswordSizeEmpty={6}
                    stylePinCodeHiddenPasswordSizeFull={12}
                    stylePinCodeMainContainer={styles.pinCodeContainer}
                    stylePinCodeTextSubtitle={styles.subtitle}
                    stylePinCodeTextTitle={styles.title}
                    stylePinCodeViewTitle={styles.titleContainer}
                    {...translations}
                    {...specificProps}
                />
                { this.forgotPinCode }
                { this.skip }
                <Header mode={this.headerMode} />
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    id: state.userProfile.id,
    pinCode: state.userProfile.pinCode,
    pinCodeEnabled: state.userProfile.pinCodeEnabled
});

export default connect(mapStateToProps, { setPinCode, setPinCodeEnabled }) (PinCode);
