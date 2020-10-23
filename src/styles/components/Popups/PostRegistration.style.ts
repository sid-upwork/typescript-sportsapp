import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { isLWidth, viewportWidth, isLHeight, isMWidth } from '../../base/metrics.style';
import { BORDER_RADIUS } from '../../views/AddCollage.style';

export const POST_REGISTRATION_POPUP_HEIGHT = isLHeight ? 380 : 350;
export const POST_REGISTRATION_POPUP_WIDTH = Math.min(Math.round(viewportWidth * 0.85), 360);

export const BUTTON_GRADIENT = [colors.pink, colors.violetDark];

const PADDING_HORIZONTAL = isLWidth ? 30 : 25;

const BUTTON_BORDER_RADIUS = 30;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        height: POST_REGISTRATION_POPUP_HEIGHT,
        alignItems: 'center',
        paddingHorizontal: PADDING_HORIZONTAL
    },
    icon: {
        width: isMWidth ? 72 : 62,
        aspectRatio: 1,
        marginBottom: isMWidth ? 16 : 14
    },
    title: {
        color: colors.violetDark,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 24 : 20,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    message: {
        marginTop: 15,
        color: colors.pink,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 15 : 14,
        letterSpacing: 0.25,
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: isLHeight ? 25 : 20
    },
    gradient: {
        borderRadius: BUTTON_BORDER_RADIUS
    },
    button: {
        paddingVertical: isMWidth ? 15 : 12,
        paddingHorizontal: isMWidth ? 20 : 16,
        backgroundColor: colors.white,
        borderRadius: BORDER_RADIUS,
        elevation: 4
    },
    buttonLabel: {
        color: colors.white,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 16 : (isMWidth ? 15 : 14),
        letterSpacing: 0.25,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    note: {
        marginTop: 15,
        color: colors.grayLight,
        fontSize: 11,
        fontStyle: 'italic',
        textAlign: 'center'
    }
});
