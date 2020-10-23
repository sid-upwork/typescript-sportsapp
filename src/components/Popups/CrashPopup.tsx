import React, { PureComponent, Fragment } from 'react';
import { Text, View, ScrollView, Linking } from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../../store/reducers';
import { logEvent } from '../../utils/analytics';
import i18n from '../../utils/i18n';
import { isAndroid } from '../../utils/os';
import { STORE_URL, SUPPORT_EMAIL } from '../../utils/staticLinks';

import codePush from 'react-native-code-push';
import crashlytics from '@react-native-firebase/crashlytics';
import { openComposer } from 'react-native-email-link';
import RNExitApp from 'react-native-exit-app';
import LinearGradient from 'react-native-linear-gradient';

import FadeInImage from '../FadeInImage';
import SharedButton from '../SharedButton';

import styles, {
    FADE_EFFECT_TOP_COLORS,
    FADE_EFFECT_BOTTOM_COLORS
} from '../../styles/components/Popups/CrashPopup.style';

const ICON = require('../../static/icons/sad.png');

export interface IProps {
    error: Error;
    userId: string;
}

class CrashPopup extends PureComponent<IProps> {

    constructor (props: IProps) {
        super(props);
        logEvent('crash_js_expection', {
            errorName: props.error?.name,
            errorMessage: props.error?.message
        });
    }

    public componentDidMount (): void {
        // The error might no longer be recorded automatically since we're catching it with the popup
        // So we make sure to record it programmatically
        this.recordError();
    }

    private async recordError (): Promise<void> {
        const { error, userId } = this.props;
        if (!error) {
            return;
        }
        if (userId) {
            await crashlytics().setUserId(userId);
        }
        crashlytics().recordError(error);
    }

    private onPressLink = (): void => {
        Linking.openURL(STORE_URL);
    }

    private onPressContact = (): void => {
        const { error } = this.props;
        const subject = i18n.t('crash.emailSubject');
        const emailMessage = i18n.t('crash.emailMessage');
        const errorName = error?.name ? `${i18n.t('crash.errorName')}: ${error?.name}` : '';
        const errorMessage = error?.message ? `${i18n.t('crash.errorMessage')}: ${error?.message}` : '';
        // const errorStack = error?.stack ? `\n\n${i18n.t('crash.errorStack')}:\n${error?.stack}` : '';

        // Line break can only ne achieved with `%0D%0A`
        // https://stackoverflow.com/a/22765878/8412141
        // It works when copy-pasting, but not when transferred to the email app
        const lineBreak = '%0D%0A'; // encodeURI('\r\n');

        const body = `${emailMessage}   \n\n### ${errorName} | ${errorMessage} ###\n\n`;

        // Unfortunately, the composer triggers an error on Android
        if (isAndroid) {
            // This one will not open user's preferred email app
            Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
        } else {
            openComposer({
                title: i18n.t('crash.composerTitle'),
                message: i18n.t('crash.composerMessage'),
                cancelLabel: i18n.t('global.cancel'),
                to: SUPPORT_EMAIL,
                subject,
                body
            });
        }
    }

    private onPressRelaunch = (): void => {
        // CodePush has a function to restart the app
        // https://github.com/avishayil/react-native-restart/issues/108#issuecomment-565384127
        codePush.restartApp();
    }

    private onPressQuit = (): void => {
        RNExitApp.exitApp();
    }

    private getGradient (position: 'top' | 'bottom'): JSX.Element {
        const isTop = position === 'top';
        const colors = isTop ? FADE_EFFECT_TOP_COLORS : FADE_EFFECT_BOTTOM_COLORS;
        const style = [
            styles.fadeEffect,
            isTop ? styles.fadeEffectTop : styles.fadeEffectBottom
        ];
        return (
            <LinearGradient
                colors={colors}
                pointerEvents={'none'}
                style={style}
            />
        );
    }

    private get message (): JSX.Element {
        const link = (
            <Text
                onPress={this.onPressLink}
                style={styles.messageLink}
            >
                { i18n.t('crash.messageLink') }
            </Text>
        );
        return (
            <Fragment>
                <Text style={styles.title}>
                    { i18n.t('crash.title') }
                </Text>
                <Text style={styles.message}>
                    { i18n.t('crash.messagePart1') }
                    { link }
                    { i18n.t('crash.messagePart2') }
                </Text>
            </Fragment>
        );
    }

    private get errorInfos (): JSX.Element {
        const { error } = this.props;
        const errorName = error?.name ? (
            <Fragment>
                <Text style={styles.errorLabel}>{ i18n.t('crash.errorName') }</Text>
                <Text style={styles.errorValue}>{ error?.name }</Text>
            </Fragment>
        ) : null;
        const errorMessage = error?.message ? (
            <Fragment>
                <Text style={styles.errorLabel}>{ i18n.t('crash.errorMessage') }</Text>
                <Text style={styles.errorValue}>{ error?.message }</Text>
            </Fragment>
        ) : null;
        const errorStack = error?.stack ? (
            <Fragment>
                <Text style={styles.errorLabel}>{ i18n.t('crash.errorStack') }</Text>
                <Text style={[styles.errorValue, styles.errorValueStack]}>{ error?.stack }</Text>
            </Fragment>
        ) : null;
        return (
            <Fragment>
                { errorName }
                { errorMessage }
                { errorStack }
            </Fragment>
        );
    }

    private get buttons (): JSX.Element {
        return (
            <View style={styles.buttonsContainer}>
                <SharedButton
                    activeOpacity={0.65}
                    color={'blue'}
                    onPress={this.onPressContact}
                    containerStyle={styles.messageButton}
                    isTouchableScale={false}
                    text={i18n.t('crash.buttons.contact')}
                    textStyle={styles.buttonText}
                />
                <View style={styles.buttonsContainerRow}>
                    <SharedButton
                        activeOpacity={0.65}
                        color={'white'}
                        onPress={this.onPressRelaunch}
                        containerStyle={[styles.flexContainer, styles.buttonMarginRight]}
                        isTouchableScale={false}
                        text={i18n.t('crash.buttons.relaunch')}
                        textStyle={styles.buttonText}
                    />
                    <SharedButton
                        activeOpacity={0.65}
                        color={'pink'}
                        onPress={this.onPressQuit}
                        containerStyle={[styles.flexContainer, styles.buttonMarginLeft]}
                        isTouchableScale={false}
                        text={i18n.t('crash.buttons.quit')}
                        textStyle={styles.buttonText}
                    />
                </View>
            </View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.flexContainer}>
                <View style={styles.flexContainer}>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        overScrollMode={'never'}
                        pinchGestureEnabled={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <FadeInImage
                            containerCustomStyle={styles.icon}
                            resizeMode={'contain'}
                            source={ICON}
                        />
                        { this.message }
                        <View style={styles.divider} />
                        { this.errorInfos }
                    </ScrollView>
                    { this.getGradient('top') }
                    { this.getGradient('bottom') }
                </View>
                { this.buttons }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    userId: state.userProfile?.id
});

export default connect(mapStateToProps, null)(CrashPopup);
