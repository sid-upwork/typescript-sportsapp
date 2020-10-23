import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { isLWidth } from '../../base/metrics.style';

export const REST_POPUP_HEIGHT = 240;
const TEXT_COLOR = colors.violetDark;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        height: REST_POPUP_HEIGHT,
        paddingHorizontal: 22,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        width: 72,
        aspectRatio: 1,
        marginBottom: 16
    },
    title: {
        color: TEXT_COLOR,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 28 : 25,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    message: {
        marginTop: 10,
        color: colors.pink,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 16 : 15,
        letterSpacing: 0.5,
        textAlign: 'center'
    }
});
