import React, { PureComponent, Fragment } from 'react';
import { View, Animated, Easing, Text } from 'react-native';
import { logEvent } from '../../utils/analytics';
import i18n, { getLanguageFromLocale } from '../../utils/i18n';
import {
    ISubscriptionExtended,
    PlanEnum,
    IPlanInfos,
    IPlansInfos,
    FREE_TRIAL_DAYS,
    getPlansInfos,
    formatPrice
} from '../../utils/payment';
import { IInfluencersState } from '../../store/modules/influencers';
import { IReduxState } from '../../store/reducers';
import { IScreenProps } from '../../index';
import { connect } from 'react-redux';
import { debounce } from 'lodash';

import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';

import ConfirmPayment from '../Popups/ConfirmPayment';
import TouchableScale from '../TouchableScale';

import colors from '../../styles/base/colors.style';
import { viewportHeight } from '../../styles/base/metrics.style';
import styles, {
    QUARTERLY_BUTTON_GRADIENT_COLORS,
    MONTHLY_BUTTON_GRADIENT_COLORS
} from '../../styles/components/Payment/PlanButton.style';



//  react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
//  cd android/ && ./gradlew assembleDebug

interface IProps {
    displayTrial?: boolean;
    firstPurchase: boolean;
    index: number;
    influencers: IInfluencersState;
    monthlyCostPerDay: number;
    screenProps: IScreenProps;
    subscription: ISubscriptionExtended;
    onClose?: () => void;
    onOpen?: () => void;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
}

class PlanButton extends PureComponent<IProps, IState> {

    private plansInfos: IPlansInfos;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(0)
        };
        this.plansInfos = getPlansInfos(i18n);
    }

    public componentDidMount (): void {
        this.animateApparition();
    }

    private animateApparition (): void {
        const { animOpacity, animTransform } = this.state;
        const { index } = this.props;
        const delay = index * 80;

        Animated.sequence([
            Animated.delay(delay),
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
            ])
        ]).start();
    }

    private onPressPlan = (planType: PlanEnum): void => {
        const { firstPurchase, onClose, onOpen, screenProps, subscription, influencers } = this.props;
        const productId = subscription?.productId;

        console.log(planType, productId);
        logEvent('subscription_choice', {
            firstTouchId: influencers?.firstTouchId,
            firstTouchLink: influencers?.firstTouchLink,
            lastTouchId: influencers?.lastTouchId,
            lastTouchLink: influencers?.lastTouchLink,
            productId,
            type: planType
        });

        screenProps?.popupManagerRef?.current?.requestPopup({
            backgroundColors: ['white'],
            borderRadius: 44,
            closeButtonIconColor: colors.gray,
            ContentComponent: ConfirmPayment,
            ContentComponentProps: {
                firstPurchase,
                planType,
                productId,
                rootLoaderRef: screenProps?.rootLoaderRef,
                screenProps,
                toastManagerRef: screenProps?.toastManagerRef
            },
            height: Math.round(viewportHeight * 0.65),
            onClose: () => { onClose && onClose(); },
            onOpen: () => { onOpen && onOpen(); },
            overflow: false,
            position: 'bottom',
            scrollView: false
        });
    }

    private isVerticalLanguage (): boolean {
        return getLanguageFromLocale(i18n.locale).isVerticalLanguage;
    }

    private getBadge (costPerDay: number, duration: number = 500, iterationDelay: number = 2200, showGradient?: boolean): JSX.Element {
        const { monthlyCostPerDay } = this.props;

        if (!costPerDay || !monthlyCostPerDay) {
            return null;
        }

        // There is a cultural difference with Asian cultures: you don't display the discount percentage,
        // you show the percentage of the initial price you pay. We need to alter the calculation to reflect that.
        const isVerticalLanguage = this.isVerticalLanguage();
        const discountPercentage = monthlyCostPerDay ? Math.round((1 - (costPerDay / monthlyCostPerDay)) * 100) : 0;
        const pricePercentage = monthlyCostPerDay ? Math.round((costPerDay / monthlyCostPerDay) * 100) : 0;
        let text: JSX.Element;

        if (!discountPercentage && !pricePercentage) {
            return null;
        }

        if (!isVerticalLanguage) {
            text = (
                <Fragment>
                    <Text style={styles.badge}>{ i18n.t('payment.save') }</Text>
                    <Text style={styles.badgePercent}>{ `${discountPercentage}%` }</Text>
                </Fragment>
            );
        } else {
            text = (
                <Text style={styles.badgePercent}>{ i18n.t('payment.pay', { percentage: pricePercentage }) }</Text>
            );
        }

        const gradient = showGradient ? (
            <LinearGradient
                angle={175}
                colors={QUARTERLY_BUTTON_GRADIENT_COLORS}
                style={[styles.fullSpace, styles.badgeContainerGradient]}
                useAngle={true}
            />
        ) : null;

        return (
            <Animatable.View
                pointerEvents={'none'}
                style={styles.badgeContainer}
                animation={'tada'}
                duration={duration}
                delay={500}
                easing={'ease-out-cubic'}
                iterationCount={'infinite'}
                iterationDelay={iterationDelay}
                // @ts-ignore
                isInteraction={false}
                useNativeDriver={true}
            >
                { gradient }
                { text }
            </Animatable.View>
        );
    }

    private get button (): JSX.Element {
        const { subscription } = this.props;
        const id = subscription?.productId;
        const costPerDay = subscription?.priceNumber / subscription?.subscriptionLengthInDays;
        const dailyPrice = formatPrice(costPerDay, subscription.currency);

        let planInfos: IPlanInfos;
        let isMonthly: boolean = true; // Default to 'monthly' style
        let isQuarterly: boolean = false;
        let isAnnually: boolean = false;
        let badge: JSX.Element = null;

        // We need to rely on a harcoded value to determine which style to apply to the button
        // So far, we huse a string that's supposed to be part of the product ID
        // Pretty error-prone indeed...
        if (id?.includes(this.plansInfos[PlanEnum.Monthly].typeCheck)) {
            isMonthly = true;
            planInfos = this.plansInfos[PlanEnum.Monthly];
        } else if (id?.includes(this.plansInfos[PlanEnum.Quarterly].typeCheck)) {
            isMonthly = false;
            isQuarterly = true;
            planInfos = this.plansInfos[PlanEnum.Quarterly];
            badge = this.getBadge(costPerDay);
        } else if (id?.includes(this.plansInfos[PlanEnum.Annually].typeCheck)) {
            isMonthly = false;
            isAnnually = true;
            planInfos = this.plansInfos[PlanEnum.Annually];
            badge = this.getBadge(costPerDay, 600, 2600, true);
        }

        const type = planInfos?.type;
        const titleLabel = subscription?.title || planInfos?.label;

        const titleStyle = [
            styles.titleMonthly,
            isQuarterly ? styles.titleQuarterly : {},
            isAnnually ? styles.titleAnnually : {}
        ];
        const priceBorderStyle = [
            styles.priceBorder,
            isQuarterly ? styles.priceBorderQuarterly : {},
            isAnnually ? styles.priceBorderAnnually : {}
        ];
        const priceContentStyle = [
            styles.priceContent,
            isAnnually ? styles.priceContentAnnually : {}
        ];
        const priceTextStyle = [
            styles.priceText,
            isAnnually ? styles.priceTextAnnually : {}
        ];

        const gradient = isMonthly || isQuarterly ? (
            <LinearGradient
                angle={175}
                colors={isQuarterly ? QUARTERLY_BUTTON_GRADIENT_COLORS : MONTHLY_BUTTON_GRADIENT_COLORS}
                style={styles.buttonGradient}
                useAngle={true}
            />
        ) : null;

        const onPress = debounce(
            () => this.onPressPlan(type),
            1000,
            { 'leading': true, 'trailing': false }
        );

        // Used with previous subscription that has the trial built-in
        // const content = displayTrial ? (
        //     <View style={styles.priceTextContainer}>
        //         <View>
        //             <Text style={[priceTextStyle, styles.price]}>
        //                 { subscription.localizedPrice }
        //             </Text>
        //             <Text style={[priceTextStyle, styles.pricePerDay]}>
        //                 { i18n.t('payment.pricePerDay', { price: dailyPrice }) }
        //             </Text>
        //         </View>
        //         <Text style={[priceTextStyle, styles.priceTrial]}>
        //             { i18n.t('payment.trial', { days: FREE_TRIAL_DAYS }) }
        //         </Text>
        //     </View>
        // ) : (
        const content = (
            <View style={[styles.priceTextContainer, styles.priceTextContainerPaddingVertical]}>
                <Text style={[priceTextStyle, styles.price]}>
                    { subscription.localizedPrice }
                </Text>
                <Text style={[priceTextStyle, styles.pricePerDay, styles.pricePerDayMarginLeft]}>
                    { i18n.t('payment.pricePerDay', { price: dailyPrice }) }
                </Text>
            </View>
        );

        return (
            <View style={styles.buttonContainer}>
                <Text style={titleStyle}>{ titleLabel }</Text>
                <TouchableScale
                    activeOpacity={0.7}
                    onPress={onPress}
                    style={styles.priceContainer}
                >
                    <View style={priceBorderStyle} />
                    <View style={priceContentStyle}>
                        { gradient }
                        { content }
                    </View>
                    { badge }
                </TouchableScale>
            </View>
        );
    }

    public render (): JSX.Element {
        const { animOpacity, animTransform } = this.state;
        const { subscription } = this.props;
        const animatedStyle = {
            opacity: animOpacity,
            transform: [
                {
                    translateY: animTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [60, 0]
                    })
                }
            ]
        };
        return subscription ? (
            <Animated.View style={[styles.container, animatedStyle]}>
                { this.button }
            </Animated.View>
        ) : null;
    }
}

const mapStateToProps = (state: IReduxState) => ({
    influencers: state.influencers
});

export default connect(mapStateToProps, null)(PlanButton);
