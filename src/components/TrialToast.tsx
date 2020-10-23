import React, { Component } from 'react';
import { Text, View, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';
import { IInfluencersState } from '../store/modules/influencers';
import { setLastTrialReminderDate } from '../store/modules/userProfile';
import { logEvent } from '../utils/analytics';
import { isDebugBundleID, isStagingBundleID } from '../utils/bundleId';
import i18n from '../utils/i18n';
import { isIOS } from '../utils/os';
import { FREE_TRIAL_DAYS } from '../utils/payment';
import { debounce } from 'lodash';
import moment from 'moment';

import LinearGradient from 'react-native-linear-gradient';

import BlurWrapper from './BlurWrapper';
import DiffuseShadow from './DiffuseShadow';
import TouchableScale from './TouchableScale';

import colors from '../styles/base/colors.style';
import { viewportWidth } from '../styles/base/metrics.style';
import styles, { PRIMARY_COLOR_SCALE, SECONDARY_COLOR_SCALE } from '../styles/components/TrialToast.style';

const CLOSE_DELAY = 7000;

interface IProps {
    firstName?: string;
    influencers: IInfluencersState;
    lastTrialReminderDate?: number;
    openPaywall: () => void;
    remainingDays: number;
    setLastTrialReminderDate: (date: number) => void;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
    display: boolean;
}

class TrialToast extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(-1),
            display: false
        };
    }

    public componentDidMount (): void {
        this.display();
    }

    public display (): void {
        if (!this.isReadyToDisplay) {
            return;
        }
        this.setState({ display: true }, () => {
            this.props.setLastTrialReminderDate(Date.now());
            this.animate();
        });
    }

    public hide (): void {
        this.setState({ display: false });
    }

    private animate (out?: boolean, delay?: number): void {
        const { animOpacity, animTransform } = this.state;

        Animated.sequence([
            Animated.delay(delay || 0),
            Animated.parallel([
                Animated.timing(animOpacity, {
                    toValue: out ? 0 : 1,
                    duration: out ? 250 : 100,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animTransform, {
                    toValue: out ? 1 : 0,
                    bounciness: 5,
                    speed: 12,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start(() => {
            if (out) {
                this.hide();
            } else {
                this.animate(true, CLOSE_DELAY);
            }
        });
    }

    private onPress = (): void => {
        const { influencers, openPaywall, remainingDays } = this.props;
        openPaywall && openPaywall();
        this.animate(true);
        logEvent('trial_toast_subscribe_now', {
            firstTouchId: influencers?.firstTouchId,
            lastTouchId: influencers?.lastTouchId,
            remainingDays
        });
    }

    private get isReadyToDisplay (): boolean {
        const { lastTrialReminderDate } = this.props;
        if  (!lastTrialReminderDate) {
            return true;
        }
        if (isDebugBundleID() || isStagingBundleID()) {
            // Show it once every 2 minutes in debug and staging
            // See getTrialRemainingDays() in payment.ts to understand why we use this specific time
            return Date.now() - lastTrialReminderDate >= 2 * 60 * 1000;
        } else {
            // Show it once a day in production
            return moment().dayOfYear() !== moment(lastTrialReminderDate).dayOfYear();
        }
    }

    private getColor (type: 'primary' | 'secondary'): string {
        const { remainingDays } = this.props;
        const scale = type === 'secondary' ? SECONDARY_COLOR_SCALE : PRIMARY_COLOR_SCALE;
        const value = 1 - (remainingDays / FREE_TRIAL_DAYS); // Scale is 0 to 1 based
        return scale(value).css();
    }

    public render (): JSX.Element {
        const { firstName, remainingDays } = this.props;
        const { animOpacity, animTransform, display } = this.state;

        if (!display || typeof remainingDays !== 'number') {
            return null;
        }

        const colorPrimary = this.getColor('primary');
        const colorSecondary = this.getColor('secondary');
        const label = remainingDays > 1 ?
            i18n.t('payment.remainingTrialDaysToast', { days: remainingDays, name: firstName || '' }) :
            i18n.t('payment.remainingTrialDaysToastExpiring', { name: firstName || '' });

        const blur = isIOS ? (
            <BlurWrapper
                blurAmount={14}
                blurType={'light'}
                style={[styles.fullSpace, styles.blur]}
                type={'vibrancy'}
            />
        ) : null;

        const animatedContainerStyle = [
            styles.container,
            {
                opacity: animOpacity,
                transform: [{
                    translateX: animTransform.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [viewportWidth, 0, -viewportWidth]
                    })
                }]
            }
        ];
        const toastStyle = [
            styles.toast,
            {
                borderColor: colorPrimary,
                shadowColor: colorSecondary
            }
        ];
        const buttonLabelStyle = [
            styles.buttonLabel,
            { color: colorSecondary }
        ];

        return (
            <Animated.View style={animatedContainerStyle} pointerEvents={'box-none'}>
                <View style={toastStyle}>
                    { blur }
                    <LinearGradient
                        angle={160}
                        colors={[colorPrimary, colorSecondary]}
                        style={[styles.fullSpace, styles.gradient]}
                        useAngle={true}
                    />
                    <View style={styles.toastInner}>
                        <Text style={styles.message}>{ label }</Text>
                        <TouchableScale
                            activeOpacity={0.85}
                            onPress={debounce(this.onPress, 300, { 'leading': true, 'trailing': false })}
                            style={styles.buttonContainer}
                        >
                            <DiffuseShadow
                                borderRadius={styles.button.borderRadius}
                                color={colors.black}
                                horizontalOffset={12}
                                shadowOpacity={0.2}
                                verticalOffset={12}
                            />
                            <View style={styles.button}>
                                <Text style={buttonLabelStyle}>
                                    { i18n.t('payment.subscribeNow') }
                                </Text>
                            </View>
                        </TouchableScale>
                    </View>
                </View>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    influencers: state.influencers,
    lastTrialReminderDate: state.userProfile.lastTrialReminderDate,
    firstName: state.userProfile.firstName
});

export default connect(mapStateToProps, { setLastTrialReminderDate })(TrialToast);

