import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { viewportHeight, statusBarOffset, iosHomeIndicatorOffset, isAndroidNotch } from '../base/metrics.style';
import colors from '../base/colors.style';
import { titleFont } from '../base/fonts.style';

export const REGISTER_BUTTON_GRADIENT_COLORS = [colors.blueLight, colors.blueDark];
export const LOGIN_BUTTON_GRADIENT_COLORS = [colors.orange, colors.pink];

const BACKGROUND_LINE_RATIO = 64 / 1028;
const BACKGROUND_LINE_HEIGHT = Math.round(viewportHeight * (isAndroidNotch ? 1.4 : 1.2));
const BACKGROUND_LINE_WIDTH = Math.round(BACKGROUND_LINE_HEIGHT * BACKGROUND_LINE_RATIO);
const BACKGROUND_LINE_TOP = -Math.round(viewportHeight * (isAndroidNotch ? 0.2 : 0.1));
const BACKGROUND_LINE_RIGHT = 40;

const LOGO_RATIO = 374 / 288;
const LOGO_HEIGHT = 125;
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * LOGO_RATIO);
const LOGO_TOP = statusBarOffset + 20;
const LOGO_LEFT = -10;

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black
    },
    fullscreen: {
        ...StyleSheet.absoluteFillObject
    },
    skipButtonContainer: {
        position: 'absolute',
        top: statusBarOffset + 15,
        right: 22
    },
    skipButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.white,
        backgroundColor: chroma(colors.violetDark).alpha(0.4).css()
    },
    skipbuttonLabel: {
        color: colors.white,
        fontFamily: titleFont.regular,
        fontSize: 16,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    backgroundImageContainer: {
        ...StyleSheet.absoluteFillObject
    },
    backgroundLineContainer: {
        position: 'absolute',
        top: BACKGROUND_LINE_TOP,
        right: BACKGROUND_LINE_RIGHT,
        height: BACKGROUND_LINE_HEIGHT,
        width: BACKGROUND_LINE_WIDTH,
        opacity: 0.35
    },
    logoImageContainer: {
        position: 'absolute',
        top: LOGO_TOP,
        left: LOGO_LEFT,
        width: LOGO_WIDTH,
        height: LOGO_HEIGHT,
        opacity: 0.3,
        overflow: 'visible'
    },
    ellipsisContainer: {
        position: 'absolute',
        top: Math.round(viewportHeight * 0.3),
        right: 20
    },
    ellipsis: {
        color: chroma(colors.white).alpha(0.35).css()
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingBottom: 25 + (iosHomeIndicatorOffset / 2),
        paddingHorizontal: 10
    },
    buttonWrapper: {
        flex: 1
    },
    rightButtonWrapper: {
        marginLeft: 15
    }
});
