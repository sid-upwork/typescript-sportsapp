import { Dimensions, PixelRatio, StatusBar } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { isAndroid, isIOS } from '../../utils/os';

const { width, height } = Dimensions.get('window');
export const viewportWidth = Math.min(width, height);
export const viewportHeight = Math.max(width, height);

/**
 * Breakpoints
 * CSS dimensions:
 * https://deviceatlas.com/blog/viewport-resolution-diagonal-screen-size-and-dpi-most-popular-smartphones#iphones
 * https://www.mydevice.io/
 * https://viewportsizer.com/devices/
 */
const breakpoints = {
    height: {
        S: 570, // Excludes iPhone 5s
        M: 600, // Most older Android devices (640) / iPhone 6, 6s, 7, 8 (667)
        L: 680, // iPhone 6+, 6s+, 7+, 8+ (736) / Galaxy Note 8, Galaxy S8, S9 (740) / Pixel 3, 3 XL (786)
        XL: 800, // iPhone X, XS (812) / iPhone XR, XS Max (896) / Galaxy S8+, S9+ (846) / Pixel 2 XL (823)
        XXL: 1000 // iPad portrait
    },
    width: {
        S: 340, // Excludes iPhone 5s and a few Android devices. Most Android devices have a 360 px width and will be considered S
        M: 370, // iPhone 6, 6s, 7, 8, X (375) / Pixel 3, 3 XL (393)
        L: 400, // iPhone 6+, 6s+, 7+, 8+, Xs Max (414) / Pixel 2, 2 XL (412)
        XL: 720, // iPad portrait
        XXL: 1000 // iPad landscape
    }
};

export const isXSHeight = viewportHeight < breakpoints.height.S;
export const isSHeight = viewportHeight >= breakpoints.height.S;
export const isMHeight = viewportHeight >= breakpoints.height.M;
export const isLHeight = viewportHeight >= breakpoints.height.L;
export const isXLHeight = viewportHeight >= breakpoints.height.XL;
export const isXXLHeight = viewportHeight >= breakpoints.height.XXL;

export const isXSWidth = viewportWidth < breakpoints.width.S;
export const isSWidth = viewportWidth >= breakpoints.width.S;
export const isMWidth = viewportWidth >= breakpoints.width.M;
export const isLWidth = viewportWidth >= breakpoints.width.L;
export const isXLWidth = viewportWidth >= breakpoints.width.XL;
export const isXXLWidth = viewportWidth >= breakpoints.width.XXL;

export const isXLScreen = isXLWidth && isXLHeight;

/**
 * Header
 */
export const hasNotch = DeviceInfo.hasNotch();
export const isIOSNotch = isIOS && hasNotch;
export const isAndroidNotch = isAndroid && hasNotch;

const iosStatusBarOffset = isIOSNotch ? 44 : 20;
const androidDefaultStatusBarHeight = 24;
const androidStatusBarOffset = isAndroidNotch ? StatusBar.currentHeight + 20 : androidDefaultStatusBarHeight;
export const notchOffset = isIOSNotch ? 33 : (isAndroidNotch ? androidStatusBarOffset - androidDefaultStatusBarHeight : 0);

export const baseHeaderHeight = 60;
export const statusBarOffset = isIOS ? iosStatusBarOffset : androidStatusBarOffset;
export const headerHeight = baseHeaderHeight + statusBarOffset;

/**
 * Other
 */
export const contentMaxWidth = 560;
export const isHD = PixelRatio.get() >= 1.5;
export const iosHomeIndicatorOffset = isIOSNotch ? 34 : 0; // recommended value is 34

export const availableHeight = viewportHeight - headerHeight - iosHomeIndicatorOffset;

/**
 * Calculate width with a percentage of the device itself
 * or from any value
 * @param  {int} percentage
 * @param  {bool} rounded   round the value
 * @param  {int} target     optionnal
 * @return {int}            width in pixels
 */
export function wp (percentage: number, rounded: boolean = true, target: number = viewportWidth): number {
    const value = (percentage * target) / 100;
    if (rounded) {
        return Math.round(value);
    } else {
        return value;
    }
}

/**
 * Calculate height with a percentage of the device itself
 * or from any value
 * @param  {int} percentage
 * @param  {bool} rounded   round the value
 * @param  {int} target     optionnal
 * @return {int}            height in pixels
 */
export function hp (percentage: number, rounded: boolean = true, target: number = viewportHeight): number {
    const value = (percentage * target) / 100;
    if (rounded) {
        return Math.round(value);
    } else {
        return value;
    }
}

/**
 * Is the viewport wide enough?
 */
export function isMinViewportWidth (value: number): boolean {
    if (!value) {
        return false;
    }
    return viewportWidth >= value;
}
export function isMinViewportHeight (value: number): boolean {
    if (!value) {
        return false;
    }
    return viewportHeight >= value;
}
