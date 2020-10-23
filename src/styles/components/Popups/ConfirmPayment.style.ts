import { StyleSheet } from 'react-native';
import { titleFont, baseFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';
import { isLWidth } from '../../base/metrics.style';

export const GRADIENT_COLORS = [colors.orangeDark, colors.pink];
export const LETS_GO_GRADIENT_COLORS = [colors.blueLight, colors.blueDark];
const CONTENT_PADDING_TOP = 30;

const LABEL_FONT_SIZE = isLWidth ? 52 : 46;

export default StyleSheet.create({
    container: {
        flex: 1
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingRight: 20
    },
    labelContainer: {
        marginTop: CONTENT_PADDING_TOP
    },
    label: {
        color: colors.grayVeryLight,
        fontFamily: titleFont.regular,
        fontSize: LABEL_FONT_SIZE
    },
    labelHorizontalLanguage: {
        lineHeight: LABEL_FONT_SIZE
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 150
    },
    infoContainer: {
        flex: 1
    },
    infoContentContainer: {
        paddingTop: CONTENT_PADDING_TOP,
        paddingBottom: 30
    },
    title: {
        fontFamily: titleFont.bold,
        fontSize: 22,
        color: colors.violetDark,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    titleUnderline: {
        width: 30,
        height: 1,
        marginTop: 10,
        marginBottom: 22,
        backgroundColor: colors.violetDark
    },
    description: {
        fontFamily: baseFont.regular,
        fontSize: 13,
        color: colors.grayDark,
        letterSpacing: 0.5
    },
    confirmContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30
    },
    confirmText: {
        marginLeft: 15,
        fontFamily: baseFont.bold,
        fontSize: 14,
        color: colors.violetDark,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    confirmButtonContainer: {
        marginTop: 20
    },
    confirmButtonText: {
        fontFamily: baseFont.bold,
        fontSize: 18,
        color: colors.white,
        letterSpacing: 1,
        textTransform: 'uppercase',
        paddingHorizontal: 15,
        paddingVertical: 5
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 30
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 14
    }
});
