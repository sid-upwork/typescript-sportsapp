import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { viewportHeight, viewportWidth, isLWidth, isLHeight, isMWidth } from '../../base/metrics.style';

const FADE_EFFECT_TOP_HEIGHT = 34;
const FADE_EFFECT_BOTTOM_HEIGHT = 48;
const FADE_EFFECT_COLOR = 'white';
export const FADE_EFFECT_TOP_COLORS = [
    chroma(FADE_EFFECT_COLOR).alpha(1).css(),
    chroma(FADE_EFFECT_COLOR).alpha(0).css()
];
export const FADE_EFFECT_BOTTOM_COLORS = [
    chroma(FADE_EFFECT_COLOR).alpha(0).css(),
    chroma(FADE_EFFECT_COLOR).alpha(1).css()
];

export const CRASH_POPUP_HEIGHT = Math.round(viewportHeight * (isLHeight ? 0.7 : 0.8));
export const CRASH_POPUP_WIDTH = Math.round(viewportWidth * (isLWidth ? 0.82 : 0.9));

const PADDING_HORIZONTAL = 22;
const BUTTON_MARGIN = 14;

const ICON_SIZE = 64;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    flexContainer: {
        flex: 1
    },
    fadeEffect: {
        position: 'absolute',
        left: 0,
        right: 0
    },
    fadeEffectTop: {
        top: 0,
        height: FADE_EFFECT_TOP_HEIGHT
    },
    fadeEffectBottom: {
        bottom: 0,
        height: FADE_EFFECT_BOTTOM_HEIGHT
    },
    content: {
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingTop: FADE_EFFECT_TOP_HEIGHT,
        paddingBottom: FADE_EFFECT_BOTTOM_HEIGHT
    },
    icon: {
        alignSelf: 'center',
        width: ICON_SIZE,
        aspectRatio: 1,
        marginBottom: 18
    },
    title: {
        color: colors.violetDark,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 22 : 20,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    message: {
        marginTop: 15,
        color: colors.grayDark,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 15 : 14,
        letterSpacing: 0.25,
        textAlign: 'center'
    },
    messageLink: {
        color: colors.violetDark,
        fontFamily: baseFont.bold,
        textDecorationLine: 'underline'
    },
    divider: {
        width: 50,
        height: 1,
        alignSelf: 'center',
        marginTop: 28,
        marginBottom: 28,
        backgroundColor: chroma(colors.pink).alpha(0.6).css()
    },
    errorLabel: {
        color: colors.grayDark,
        fontSize: 13,
        fontFamily: titleFont.bold,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    errorValue: {
        marginTop: 2,
        marginBottom: 18,
        color: colors.violetDark,
        fontFamily: baseFont.regular,
        fontSize: 12,
        letterSpacing: 0.25,
        textAlign: 'center'
    },
    errorValueStack: {
        fontSize: 11,
        letterSpacing: 0
    },
    buttonsContainer: {
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingTop: PADDING_HORIZONTAL / 2,
        paddingBottom: PADDING_HORIZONTAL
    },
    buttonsContainerRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonText: {
        fontSize: isLWidth ? 19 : (isMWidth ? 17 : 16)
    },
    messageButton: {
        marginBottom: BUTTON_MARGIN
    },
    buttonMarginRight: {
        marginRight: BUTTON_MARGIN / 2
    },
    buttonMarginLeft: {
        marginLeft: BUTTON_MARGIN / 2
    }
});
