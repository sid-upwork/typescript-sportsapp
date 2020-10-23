import { StyleSheet } from 'react-native';
import { baseFont, titleFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';
import { isLWidth, isMWidth } from '../../base/metrics.style';

const SCROLLVIEW_GRADIENT_HEIGHT = 40;
const FONT_SIZE = isMWidth ? 16 : 14;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1,
        paddingHorizontal: 35,
        paddingBottom: 30
    },
    scrollViewContainer: {
        flex: 1,
        marginBottom: 20
    },
    scrollViewInner: {
        paddingVertical: SCROLLVIEW_GRADIENT_HEIGHT
    },
    scrollViewGradientInner: {
        position: 'absolute',
        right: 0,
        left: 0,
        height: SCROLLVIEW_GRADIENT_HEIGHT
    },
    message: {
        color: colors.grayDark,
        fontFamily: titleFont.regular,
        fontSize: FONT_SIZE,
        lineHeight: FONT_SIZE * 1.4,
        textAlign: 'center'
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    switchLabel: {
        flex: 1,
        marginRight: 10,
        color: colors.pink,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 13 : (isMWidth ? 12 : 11),
        letterSpacing: 1,
        textAlign: 'right',
        textTransform: 'uppercase'
    }
});
