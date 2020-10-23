import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { isLWidth, viewportWidth, isLHeight } from '../../base/metrics.style';

export const THANK_YOU_POPUP_HEIGHT = isLHeight ? 380 : 350;
export const THANK_YOU_POPUP_WIDTH = Math.min(Math.round(viewportWidth * 0.8), 360);

const PADDING_HORIZONTAL = isLWidth ? 30 : 25;

const HEART_ICON_RATIO = 248 / 225;
const HEART_ICON_WIDTH = Math.round(THANK_YOU_POPUP_WIDTH * 0.25);
const HEART_ICON_HEIGHT = HEART_ICON_WIDTH / HEART_ICON_RATIO;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        height: THANK_YOU_POPUP_HEIGHT,
        alignItems: 'center',
        paddingHorizontal: PADDING_HORIZONTAL
    },
    icon: {
        marginTop: 10,
        width: HEART_ICON_WIDTH,
        height: HEART_ICON_HEIGHT,
        alignItems: 'center',
        marginBottom: 30
    },
    title: {
        color: colors.violetDark,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 26 : 22,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    message: {
        marginTop: 15,
        color: colors.pink,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 16 : 15,
        letterSpacing: 0.5,
        textAlign: 'center'
    }
});
