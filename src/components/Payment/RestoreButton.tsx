import React, { PureComponent } from 'react';
import { Animated, Easing, Text } from 'react-native';
import { connect } from 'react-redux';
import { IReduxState } from '../../store/reducers';
import { IInfluencersState } from '../../store/modules/influencers';
import { logEvent } from '../../utils/analytics';
import api from '../../utils/api';
import { isDebugBundleID } from '../../utils/bundleId';
import { getFormattedDate } from '../../utils/date';
import { ENDPOINTS } from '../../utils/endpoints';
import i18n from '../../utils/i18n';
import { isAndroid } from '../../utils/os';
import { getSubscriptionsSkus } from '../../utils/payment';
import { IScreenProps, getRootComponentRef } from '../../index';
import { debounce } from 'lodash';
import allSettled from 'promise.allsettled';

import RNIap, { Purchase, SubscriptionPurchase } from 'react-native-iap';

import TouchableScale from '../TouchableScale';

import styles from '../../styles/components/Payment/RestoreButton.style';

const DEBUG = isDebugBundleID();

interface IProps {
    influencers: IInfluencersState;
    isInternetReachable: boolean;
    screenProps: IScreenProps;
    onEndRestore?: () => void;
    onStartRestore?: () => void;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
}

class RestoreButton extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateApparition();
    }

    private animateApparition (): void {
        const { animOpacity, animTransform } = this.state;
        Animated.parallel([
            Animated.timing(animOpacity, {
                toValue: 1,
                duration: 100,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.spring(animTransform, {
                toValue: 1,
                speed: 18,
                bounciness: 8,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private async getMostRecentSubscriptionPerProductId (): Promise<(Purchase | SubscriptionPurchase)[]> {
        const subscriptions = await RNIap.getAvailablePurchases();
        const mostRecentSubscriptions: Purchase[] = [];
        const products = getSubscriptionsSkus();
        let foundProducts: string[] = [];
        subscriptions
            .filter((sub: Purchase | SubscriptionPurchase) => products.indexOf(sub?.productId) !== -1)
            .sort((subA: Purchase | SubscriptionPurchase, subB: Purchase | SubscriptionPurchase) => subB?.transactionDate - subA?.transactionDate)
            .forEach((sub: Purchase | SubscriptionPurchase) => {
                if (foundProducts.indexOf(sub?.productId) === -1) {
                    mostRecentSubscriptions.push(sub);
                    foundProducts.push(sub?.productId);
                }
            });
        return mostRecentSubscriptions;
    }

    private restorePurchase = async (): Promise<void> => {
        const { influencers, onEndRestore, onStartRestore, screenProps } = this.props;

        if (!this.props.isInternetReachable) {
            screenProps.toastManagerRef?.current?.openToast({
                message: i18n.t('app.noInternetAccess'),
                type: 'error'
            });
            return;
        }

        onStartRestore && onStartRestore();
        screenProps?.rootLoaderRef?.current?.open();

        try {
            const subscriptions = await this.getMostRecentSubscriptionPerProductId();

            if (!subscriptions.length) {
                throw new Error(i18n.t('payment.restoreErrorNoPurchase'));
            }

            DEBUG && console.log('subscriptions', subscriptions);
            const validationResult = await allSettled(subscriptions.map((sub: Purchase | SubscriptionPurchase) => api.post(
                ENDPOINTS.userSubscriptions + '/validateReceipt',
                { receipt: sub?.transactionReceipt, platform: isAndroid ? 'android' : 'ios' }
            )));
            DEBUG && console.log('validationResult', validationResult);
            const newSubscriptionStatus = await api.get(ENDPOINTS.userSubscriptions + '/status');
            const newSubscription = newSubscriptionStatus?.data?.subscription;
            DEBUG && console.log('status', newSubscriptionStatus?.data);

            if (!newSubscription) {
                throw new Error(i18n.t('payment.restoreErrorNoPurchase'));
            }

            if (!newSubscriptionStatus?.data?.active) {
                const date = newSubscription?.endDate ? getFormattedDate(newSubscription?.endDate) : '---';
                throw new Error(i18n.t('payment.restoreErrorExpired', { date }));
            }

            DEBUG && console.log('Restore: product ID', newSubscription?.productId);
            logEvent('subscription_restore_success', {
                firstTouchId: influencers?.firstTouchId,
                firstTouchLink: influencers?.firstTouchLink,
                lastTouchId: influencers?.lastTouchId,
                lastTouchLink: influencers?.lastTouchLink,
                productId: newSubscription?.productId
            });

            // WARNING: close the paywall, but only if the subscription proves to be active!
            getRootComponentRef()?.hidePaywall();

            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('payment.restoreSuccess', { productId: newSubscription.productId }),
                type: 'info'
            });
        } catch (error) {
            const errorMessage = error?.message ? ` (${error?.message})` : '';

            console.warn(error);
            logEvent('subscription_restore_error', {
                errorCode: error?.code,
                errorMessage: error?.message,
                firstTouchId: influencers?.firstTouchId,
                firstTouchLink: influencers?.firstTouchLink,
                lastTouchId: influencers?.lastTouchId,
                lastTouchLink: influencers?.lastTouchLink
            });

            screenProps?.toastManagerRef?.current?.openToast({
                duration: 5000,
                message: `${i18n.t('payment.restoreFailure')}${errorMessage}`,
                type: 'error'
            });
        } finally {
            screenProps?.rootLoaderRef?.current?.close();
            onEndRestore && onEndRestore();
        }
    }

    public render (): JSX.Element {
        const { animOpacity, animTransform } = this.state;
        const animatedStyle = {
            opacity: animOpacity,
            transform: [
                {
                    translateY: animTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                    })
                }
            ]
        };
        const debouncedOnPress = debounce(
            this.restorePurchase,
            1000,
            { 'leading': true, 'trailing': false }
        );
        return (
            <Animated.View style={[styles.container, animatedStyle]}>
                <TouchableScale
                    activeOpacity={0.85}
                    onPress={debouncedOnPress}
                    style={styles.restoreLink}
                >
                    <Text style={styles.restoreLinkLabel}>{ i18n.t('payment.restore') }</Text>
                </TouchableScale>
            </Animated.View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    influencers: state.influencers,
    isInternetReachable: state.network.isInternetReachable
});

export default connect(mapStateToProps, null)(RestoreButton);
