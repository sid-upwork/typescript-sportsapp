import i18n from 'i18n-js';
import moment from 'moment';
import 'moment/locale/zh-tw';
import * as localize from 'react-native-localize';

import enUS from './locales/enUS';
import zhTW from './locales/zhTW';

export interface ILanguage {
    isVerticalLanguage: boolean;
    locale: string;
    longName: string;
    shortName: string;
}

export const LANGUAGES: { [key: string]: ILanguage } = {
    enUS: { isVerticalLanguage: false, locale: 'en-US', longName: 'English', shortName: 'en' },
    zhTW: { isVerticalLanguage: true, locale: 'zh-TW', longName: '繁體中文', shortName: 'zh' }
};

export function getLanguageFromLocale (locale: string): ILanguage {
    if (locale && LANGUAGES[locale.replace('-', '')]) {
        return LANGUAGES[locale.replace('-', '')];
    } else {
        return LANGUAGES.zhTW;
    }
}

const LANGUAGES_DEFAULTING_TO_ENGLISH = [
    'de',
    'en',
    'es',
    'fr',
    'it',
    'nl'
];

export function shouldDefaultToEnglish (locale: string): boolean {
    if (!locale) {
        return false;
    }
    const localeShortName = locale.substr(0, locale.indexOf('-'));
    // @ts-ignore
    return LANGUAGES_DEFAULTING_TO_ENGLISH.includes(localeShortName); // This method does exist TSLint!
}

// Fix a brutal crash in release mode because moment is looking for an inexisting `./locale.en-US` module
// See https://github.com/moment/moment/issues/3624
// TODO: locale was null when logging in with a Chinese user on a French device => Investigate
export function callSafeLocale (locale: string): void {
    const modifiedLocale = locale && locale.includes('-') && locale.startsWith('en') ? locale.substr(0, locale.indexOf('-')) : locale;
    moment.locale(modifiedLocale.toLowerCase());
}

// This function is required to show videos in the proper language
// Since language detection takes place during the rehydration, it's already too late to call `i18n.locale`
export function getLanguageShortName (): 'en' | 'zh' {
    const locales = localize.getLocales();
    if (Array.isArray(locales)) {
        const languageTag = locales[0]?.languageTag;
        if (languageTag?.startsWith('en') || shouldDefaultToEnglish(languageTag)) {
            return 'en';
        } else {
            return 'zh';
        }
    } else {
        return 'zh';
    }
}

i18n.missingBehaviour = 'guess'; // It will convert HOME_noteTitle to 'HOME note title' if the value doesn't exist in any of the translation files.
i18n.defaultLocale = LANGUAGES.zhTW.locale; // If the current locale in device is not en or zh
i18n.locale = LANGUAGES.zhTW.locale;

i18n.fallbacks = true;
i18n.translations = {
    zh: zhTW,
    en: enUS
};

export default i18n;
