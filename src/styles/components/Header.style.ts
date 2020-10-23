import { StyleSheet } from 'react-native';
import { isAndroid } from '../../utils/os';
import zIndexes from '../../utils/zIndexes';
import { baseHeaderHeight, statusBarOffset, notchOffset, hasNotch } from '../base/metrics.style';
import { headerHeight } from '../base/metrics.style';
import colors from '../base/colors.style';
import chroma from 'chroma-js';
import { titleFont } from '../base/fonts.style';

const MENU_IMAGE_SIZE: number = 40;
const CLOSE_IMAGE_SIZE: number = 30;
const BACK_IMAGE_SIZE: number = 30;

export const HEADER_GRADIENT_HEIGHT = headerHeight + 20;
export const GRADIENT_COLORS_PURPLE = [
    chroma(colors.violetDark).alpha(1),
    chroma(colors.violetDark).alpha(0)
];
export const GRADIENT_COLORS_BLACK = [
    chroma(colors.black).alpha(isAndroid ? 1 : 0.9).css(),
    chroma(colors.black).alpha(0).css()
];

export default StyleSheet.create({
    container: {
        zIndex: zIndexes.header,
        position: 'absolute',
        left: 0,
        right: 0
    },
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_GRADIENT_HEIGHT
    },
    gradient: {
        ...StyleSheet.absoluteFillObject
    },
    offset: {
        height: (hasNotch ? notchOffset : statusBarOffset) + 10
    },
    offsetLandscape: {
        height: isAndroid ? statusBarOffset : 10
    },
    containerInner: {
        flexDirection: 'row',
        height: baseHeaderHeight,
        justifyContent: 'flex-start'
    },
    button: {
        alignSelf: 'flex-start',
        width: baseHeaderHeight,
        height: baseHeaderHeight,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonLandscape: {
        marginLeft: 20
    },
    effectContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    menu: {
        width: MENU_IMAGE_SIZE,
        height: MENU_IMAGE_SIZE
    },
    close: {
        width: CLOSE_IMAGE_SIZE,
        height: CLOSE_IMAGE_SIZE
    },
    back: {
        width: BACK_IMAGE_SIZE,
        height: BACK_IMAGE_SIZE
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 18
    },
    title: {
        color: colors.white,
        fontFamily: titleFont.bold,
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase'
    }
});
