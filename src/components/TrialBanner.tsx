import React, { Component } from 'react';
import { Text, View, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';
import { IInfluencersState } from '../store/modules/influencers';
import { logEvent } from '../utils/analytics';
import i18n from '../utils/i18n';
import { isIOS, isAndroid } from '../utils/os';
import { FREE_TRIAL_DAYS } from '../utils/payment';
import { debounce } from 'lodash';

import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from './DiffuseShadow';
import TouchableScale from './TouchableScale';

import colors from '../styles/base/colors.style';
import { viewportHeight } from '../styles/base/metrics.style';
import styles, { PRIMARY_COLOR_SCALE, SECONDARY_COLOR_SCALE } from '../styles/components/TrialBanner.style';

interface IProps {
    influencers: IInfluencersState;
    openPaywall: () => void;
    remainingDays: number;
    scrollY: Animated.Value;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
    containerHeight: number;
    display: boolean;
}

class TrialBanner extends Component<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(0),
            containerHeight: undefined,
            display: true
        };
    }

    public componentDidMount (): void {
        this.animate();
    }

    public hide = (): void => {
        this.animate(true, () => {
            this.setState({ display: false });
        });
    }

    private animate (animateOut?: boolean, callback?: () => void): void {
        const { animOpacity, animTransform } = this.state;
        const toValue = animateOut ? 0 : 1;
        Animated.parallel([
            Animated.timing(animOpacity, {
                toValue,
                duration: 100,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.spring(animTransform, {
                toValue,
                bounciness: 5,
                speed: 12,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            callback && callback();
        });
    }

    private onLayout = (event: any): void => {
        if (isIOS) {
            return;
        }
        // Fix a nasty bug on Android
        // When a container has a 0px height, its children are visible but can't receive tap events...
        // FYI: it's been handled differently in WotkoutBottomButtons.styles.ts
        const { height } = event?.nativeEvent?.layout;
        this.setState({ containerHeight: Math.round(height) });
    }

    private onPress = (): void => {
        const { influencers, openPaywall, remainingDays } = this.props;
        openPaywall && openPaywall();
        logEvent('trial_banner_subscribe_now', {
            firstTouchId: influencers?.firstTouchId,
            lastTouchId: influencers?.lastTouchId,
            remainingDays
        });
    }

    private getColor (type: 'primary' | 'secondary'): string {
        const { remainingDays } = this.props;
        const scale = type === 'secondary' ? SECONDARY_COLOR_SCALE : PRIMARY_COLOR_SCALE;
        const value = 1 - (remainingDays / FREE_TRIAL_DAYS); // Scale is 0 to 1 based
        return scale(value).css();
    }

    public render (): JSX.Element {
        const { remainingDays, scrollY } = this.props;
        const { animOpacity, animTransform, containerHeight, display } = this.state;

        if (!display || typeof remainingDays !== 'number') {
            return null;
        }

        const colorPrimary = this.getColor('primary');
        const colorSecondary = this.getColor('secondary');
        const lastDay = !(remainingDays > 1);
        const label = lastDay ?
            i18n.t('payment.remainingTrialDaysBannerExpiring') :
            i18n.t('payment.remainingTrialDaysBanner', { days: remainingDays });

        const androidTapPassThroughFix = isAndroid ? {
            height: containerHeight
        } : {};
        const containerStyle = [
            styles.container,
            androidTapPassThroughFix,
            {
                transform: [
                    {
                        translateY: scrollY?.interpolate({
                            inputRange: [0, viewportHeight * 0.5, viewportHeight * 1.5],
                            outputRange: [0, 0, 200], // WARNING: make sure this value is higher than banner's height on small devices
                            extrapolate: 'clamp'
                        })
                    }
                ]
            }
        ];
        const animatedContainerStyle = [
            styles.animatedContainer,
            {
                opacity: animOpacity,
                transform: [{
                    translateY: animTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [120, 0]
                    })
                }]
            }
        ];
        const messageStyle = [
            styles.message,
            lastDay ? styles.messageLastDay : {}
        ];
        const buttonLabelStyle = [
            styles.buttonLabel,
            { color: colorSecondary }
        ];

        return (
            <Animated.View style={containerStyle}>
                <Animated.View style={animatedContainerStyle}>
                    <LinearGradient
                        angle={160}
                        colors={[colorPrimary, colorSecondary]}
                        style={[styles.fullSpace, styles.gradient]}
                        useAngle={true}
                    />
                    <View
                        onLayout={this.onLayout}
                        style={styles.containerInner}
                    >
                        <Text style={messageStyle}>{ label }</Text>
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
                </Animated.View>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    influencers: state.influencers
});

export default connect(mapStateToProps, null)(TrialBanner);
