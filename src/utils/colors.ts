import chroma from 'chroma-js';
import colors from '../styles/base/colors.style';

export function getBackgroundNuance (value?: number, color?: string): string {
    const chromaMethod = 'brighten';
    const effectValue = value || 0.4;
    const baseColor = color || colors.grayVeryLight;
    return chroma(baseColor)[chromaMethod](effectValue).css();
}

export function getLoaderColor (muted: boolean = false): string {
    const chromaMethod = 'darken';
    if (muted) {
        return chroma(colors.violetDark)[chromaMethod](1.25).css();
    } else {
        return chroma(colors.white).alpha(0.6).css();
    }
}

export function getTextColorFromLuminance (color: string, threshold: number = 0.4): string {
    if (!color) {
        return 'white';
    }
    return chroma(color).luminance() > threshold ? colors.black : 'white';
}

export function checkColorFormat (color: string): string {
    if (typeof color !== 'string') {
        return undefined;
    }
    // Prevent double # which would crash the app
    const first2Characters = color.substring(0, 2);
    if (first2Characters === '##') {
        color = '#' + color.substring(2);
    }
    // Add a # if there's none and if the color is not using a format like rgb(), hsl()...
    const firstCharacter = color.charAt(0);
    if (firstCharacter !== '#' && !color.includes('(')) {
        color = '#' + color;
    }
    return color;
}
