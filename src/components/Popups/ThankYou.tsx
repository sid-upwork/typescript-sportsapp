import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';
import i18n from '../../utils/i18n';

import styles from '../../styles/components/Popups/ThankYou.style';

import HeartIcon from '../../static/Payment/heart.svg';

export interface IProps {
    dismissPopup: () => void;
    firstPurchase?: boolean;
}

class ThankYou extends PureComponent<IProps> {

    private get title (): JSX.Element {
        const { firstPurchase } = this.props;
        const key = firstPurchase ? 'subscriptionPurchasedTitle' : 'subscriptionRenewedTitle';
        return (
            <Text style={styles.title}>
                { i18n.t(`payment.${key}`) }
            </Text>
        );
    }

    private get message (): JSX.Element {
        const { firstPurchase } = this.props;
        const key = firstPurchase ? 'subscriptionPurchasedMessage' : 'subscriptionRenewedMessage';
        return (
            <Text style={styles.message}>
                { i18n.t(`payment.${key}`) }
            </Text>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <HeartIcon
                    style={styles.icon}
                    height={styles.icon.height}
                    width={styles.icon.width}
                />
                { this.title }
                { this.message }
            </View>
        );
    }
}

export default ThankYou;
