import i18n, { getLanguageFromLocale } from './i18n';
import { isAndroid } from './os';

// https://github.com/react-native-community/react-native-video/issues/125#issuecomment-583100357
export function getFileReference (id: string, extension: string): string {
    const suffix = getLanguageFromLocale(i18n.locale).shortName === 'en' ? 'en' : 'zh';
    const fileName = `countdown_${id}_${suffix}`;
    // Videos are stored as resources on iOS and in the `/raw/` folder on Android
    return isAndroid ? fileName : `${fileName}.${extension}`;
}
