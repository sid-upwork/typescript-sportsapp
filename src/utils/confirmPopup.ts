import { Alert } from 'react-native';
import i18n from './i18n';

export function confirmPopup (
    confirmCallback?: () => any,
    cancelCallback?: () => any,
    title?: string,
    message?: string,
    confirmButtonLabel?: string,
    cancelButtonLabel?: string,
    cancelable?: boolean
): void {
    const confirmTitle = title || i18n.t('app.confirmTitle');
    const confirmMessage = message || '';

    Alert.alert(
        confirmTitle,
        confirmMessage,
        [
            {
                text: cancelButtonLabel || i18n.t('app.confirmCancelLabel'),
                onPress: cancelCallback || null,
                style: 'cancel'
            },
            {
                text: confirmButtonLabel || i18n.t('app.confirmValidateLabel'),
                onPress: confirmCallback || null
            }
        ],
        {
            cancelable: typeof cancelable === 'boolean' ? cancelable : false
        }
    );
}
