import React, { Component, RefObject } from 'react';
import { View, Text, Animated, Easing, ScrollView } from 'react-native';
import { IReduxState } from '../../store/reducers';
import { getPlansInfos, IPlansInfos, PlanEnum, FREE_TRIAL_DAYS, DISABLE_PAYMENT_FEATURES } from '../../utils/payment';
import { connect } from 'react-redux';
import { isAndroid } from '../../utils/os';
import { logEvent } from '../../utils/analytics';
import { IInfluencersState } from '../../store/modules/influencers';
import { IScreenProps, getRootComponentRef } from '../../index';
import { isDebugBundleID } from '../../utils/bundleId';
import chroma from 'chroma-js';
import delays from '../../utils/animDelays';
import i18n from '../../utils/i18n';

import RNIap from 'react-native-iap';
import crashlytics from '@react-native-firebase/crashlytics';
import LinearGradient from 'react-native-linear-gradient';

import RootLoader from '../RootLoader';
import SharedVerticalTitle from '../SharedVerticalTitle';
import Switch from '../Switch';
import SharedButton from '../SharedButton';
import ToastManager from '../ToastManager';
import ThankYou from '../Popups/ThankYou';

import { viewportHeight } from '../../styles/base/metrics.style';
import { THANK_YOU_POPUP_HEIGHT, THANK_YOU_POPUP_WIDTH } from '../../styles/components/Popups/ThankYou.style';
import colors from '../../styles/base/colors.style';
import styles from '../../styles/components/Popups/ConfirmPayment.style';

interface IProps {
    firstPurchase: boolean;
    influencers: IInfluencersState;
    isInternetReachable: boolean;
    planType: PlanEnum;
    productId: string;
    rootLoaderRef?: RefObject<RootLoader>;
    screenProps: IScreenProps;
    toastManagerRef?: RefObject<ToastManager>;
    dismissPopup: () => void;
}

interface IState {
    confirmChecked: boolean;
    labelAnimationOpacity: Animated.Value;
    labelAnimationTransform: Animated.Value;
    textAnimationOpacity: Animated.Value;
    textAnimationTransform: Animated.Value;
    confirmAnimationOpacity: Animated.Value;
    confirmAnimationTransform: Animated.Value;
}

class ConfirmPayment extends Component<IProps, IState> {

    private timeout: any;
    private plansInfos: IPlansInfos;

    constructor (props: IProps) {
        super(props);
        this.plansInfos = getPlansInfos(i18n);
        this.timeout;
        this.state = {
            confirmChecked: false,
            textAnimationOpacity: new Animated.Value(0),
            textAnimationTransform: new Animated.Value(0),
            labelAnimationOpacity: new Animated.Value(0),
            labelAnimationTransform: new Animated.Value(0),
            confirmAnimationOpacity: new Animated.Value(0),
            confirmAnimationTransform: new Animated.Value(0)
        };
    }

    public async componentDidMount (): Promise<void> {
        this.animateLabel();
        this.animateText();
    }

    private animateLabel (): void {
        const { labelAnimationOpacity, labelAnimationTransform } = this.state;
        Animated.sequence([
            Animated.delay(delays.views.targetedTraining.labelApparition),
            Animated.parallel([
                Animated.timing(labelAnimationOpacity, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(labelAnimationTransform, {
                    toValue: 1,
                    speed: 5,
                    bounciness: 7,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateText (): void {
        const { textAnimationOpacity, textAnimationTransform } = this.state;
        Animated.sequence([
            Animated.delay(delays.views.targetedTraining.textApparition),
            Animated.parallel([
                Animated.timing(textAnimationOpacity, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(textAnimationTransform, {
                    toValue: 1,
                    speed: 15,
                    bounciness: 5,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateConfirm (animateIn: boolean): void {
        const { confirmAnimationOpacity, confirmAnimationTransform } = this.state;
        const toValue = animateIn ? 1 : 0;
        Animated.sequence([
            Animated.parallel([
                Animated.timing(confirmAnimationOpacity, {
                    toValue: toValue,
                    duration: 150,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(confirmAnimationTransform, {
                    toValue: toValue,
                    speed: 15,
                    bounciness: 0,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private onChange = (value: boolean): void => {
        if (value !== this.state.confirmChecked) {
            this.setState({ confirmChecked: value }, () => this.animateConfirm(value));
        }
    }

    private onPressConfirm = (): void => {
        const { dismissPopup, firstPurchase, screenProps } = this.props;
        // Fallback for beta testers
        if (DISABLE_PAYMENT_FEATURES) {
            dismissPopup();

            // Make sure to close the paywall
            getRootComponentRef()?.hidePaywall();

            screenProps?.popupManagerRef?.current?.requestPopup({
                backgroundColors: ['white'],
                backgroundType: 'color',
                borderRadius: 36,
                closeButtonBackgroundColor: colors.pink,
                ContentComponent: ThankYou,
                ContentComponentProps: {
                    firstPurchase
                },
                height: THANK_YOU_POPUP_HEIGHT,
                scrollView: true,
                width: THANK_YOU_POPUP_WIDTH
            });
        } else {
            this.launchSubscriptionRequest();
        }
    }

    private launchSubscriptionRequest = async (): Promise<void> => {
        const { productId, rootLoaderRef, toastManagerRef } = this.props;

        if (!this.props.isInternetReachable) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        if (!productId) {
            toastManagerRef?.current?.openToast({
                message: `${i18n.t('payment.purchaseError')} (${i18n.t('payment.restoreErrorNoProductID')})`,
                type: 'error'
            });
            return;
        }

        rootLoaderRef?.current?.open();

        try {
            await RNIap.requestSubscription(productId, false).catch((error: any) => {
                if (isDebugBundleID()) {
                    console.warn('Request subscription error', error);
                }
                logEvent('subscription_request_error', { error });
                crashlytics().recordError(error);
            });
            // The purchase success will be handled by RNIap.purchaseUpdateListener in AppDrawer
            // Root loader will be closed there
        } catch (error) {
            // The error will be handled by RNIap.purchaseErrorListener in AppDrawer
            rootLoaderRef?.current?.close();
            logEvent('subscription_request_error_second', { error });
            crashlytics().recordError(error);
        }
    }

    private get confirm (): JSX.Element {
        const { confirmAnimationOpacity, confirmAnimationTransform } = this.state;
        const { influencers, planType, productId } = this.props;
        const confirmButtonAnimatedStyle = {
            opacity: confirmAnimationOpacity,
            transform: [{
                translateY: confirmAnimationTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                })
            }]
        };

        return (
            <View>
                <View style={styles.confirmContainer}>
                    <Switch
                        borderColor={{ true: colors.violetDark, false: colors.violetDark }}
                        thumbColor={{ true: 'white', false: colors.violetDark }}
                        trackColor={{ true: colors.violetDark, false: 'transparent' }}
                        onChange={(value: boolean) => {
                            this.onChange(value);
                            // Log only user acknowledgement
                            if (value) {
                                console.log(planType, productId);
                                logEvent('subscription_acknowledgment', {
                                    firstTouchId: influencers?.firstTouchId,
                                    firstTouchLink: influencers?.firstTouchLink,
                                    lastTouchId: influencers?.lastTouchId,
                                    lastTouchLink: influencers?.lastTouchLink,
                                    productId,
                                    type: planType
                                });
                            }
                        }}
                        value={false}
                    />
                    <Text style={styles.confirmText}>{i18n.t('confirmPayment.understand')}</Text>
                </View>
                {this.state.confirmChecked &&
                    <Animated.View style={confirmButtonAnimatedStyle}>
                        <SharedButton
                            color={'pink'}
                            containerStyle={styles.confirmButtonContainer}
                            onPress={this.onPressConfirm}
                            text={i18n.t('confirmPayment.letsGo')}
                            withShadow={true}
                        />
                    </Animated.View>
                }
            </View>
        );
    }

    private get content (): JSX.Element {
        const { textAnimationOpacity, textAnimationTransform } = this.state;
        const headerContainerStyle = {
            opacity: textAnimationOpacity,
            transform: [{
                translateY: textAnimationTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [150, 0]
                })
            }]
        };

        return (
            <View style={styles.contentContainer}>
                { this.label }
                <ScrollView
                    style={styles.infoContainer}
                    contentContainerStyle={styles.infoContentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={headerContainerStyle}>
                        { this.header }
                        { this.confirm }
                    </Animated.View>
                </ScrollView>
                <LinearGradient
                    colors={[chroma('white').alpha(1).css(), chroma('white').alpha(0).css()]}
                    locations={[0, 1]}
                    pointerEvents={'none'}
                    style={styles.topGradient}
                />
                <LinearGradient
                    colors={[chroma('white').alpha(0).css(), chroma('white').alpha(1).css()]}
                    locations={[0, 1]}
                    pointerEvents={'none'}
                    style={styles.bottomGradient}
                />
            </View>
        );
    }

    private get header (): JSX.Element {
        // const { firstPurchase } = this.props;
        const title = i18n.t('confirmPayment.lastStep');
        const descriptionParams = {
            days: FREE_TRIAL_DAYS, // TODO: dynamize this based on referral feature
            storeProvider: isAndroid ? 'Google' : 'Apple'
        };
        // const descriptionKey = firstPurchase ? 'descriptionTrial' : 'descriptionNoTrial';
        const description = i18n.t('confirmPayment.descriptionNoTrial', descriptionParams);

        return (
            <View>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.titleUnderline} />
                <Text style={styles.description}>{description}</Text>
            </View>
        );
    }

    private get label (): JSX.Element {
        const { planType } = this.props;
        const { labelAnimationOpacity, labelAnimationTransform } = this.state;

        const labelContainerStyle = [
            styles.labelContainer,
            {
                opacity: labelAnimationOpacity,
                transform: [
                    {
                        translateX: labelAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-60, 0]
                        })
                    }
                ]
            }
        ];

        let label;
        switch (planType) {
            case PlanEnum.Monthly:
                label = this.plansInfos[PlanEnum.Monthly].label;
                break;
            case PlanEnum.Quarterly:
                label = this.plansInfos[PlanEnum.Quarterly].label;
                break;
            case PlanEnum.Annually:
                label = this.plansInfos[PlanEnum.Annually].label;
                break;
            default:
                label = '';
        }

        return (
            <Animated.View style={labelContainerStyle}>
                <SharedVerticalTitle
                    height={Math.round(viewportHeight * 0.5)}
                    title={label}
                    textStyle={styles.label}
                    textStyleHorizontal={styles.labelHorizontalLanguage}
                    width={72}
                />
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                { this.content }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    influencers: state.influencers,
    isInternetReachable: state.network.isInternetReachable
});

export default connect(mapStateToProps, null)(ConfirmPayment);
