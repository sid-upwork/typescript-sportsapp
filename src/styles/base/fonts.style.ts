import I18n, { getLanguageFromLocale } from '../../utils/i18n';

// *** Available fonts ***
// - OpenSans-Bold
// - OpenSans-Light
// - OpenSans-Regular
// - WorkSans-Bold
// - WorkSans-Light
// - WorkSans-Regular

export const baseFontSize = 15; // isAndroid ? 16 : 15;

export const baseFont = {
    bold: 'OpenSans-Bold',
    light: 'OpenSans-Light',
    regular: 'OpenSans-Regular'
};

export const titleFont = {
    black: 'WorkSans-Black',
    bold: 'WorkSans-Bold',
    light: 'WorkSans-Light',
    regular: 'WorkSans-Regular'
};

export function adaptedFontSize (ratio: number = 1, sizeRef: number = baseFontSize): number {
    return Math.round(ratio * sizeRef);
}

export function emSize (value: number = 1, sizeRef: number = baseFontSize): number {
    return Math.round(value * sizeRef);
}

// WARNING: this will only work when called dynamically, i.e. not in a Stylesheet.create() call
export function getLineHeight (fontSize?: number, lineHeightFactorHL: number = 1, lineHeightFactorVL: number = 1.1): number {
    const isVerticalLanguage = getLanguageFromLocale(I18n.locale).isVerticalLanguage;
    const size = fontSize || baseFontSize;
    return Math.round(size * (isVerticalLanguage ? lineHeightFactorVL : lineHeightFactorHL));
}
