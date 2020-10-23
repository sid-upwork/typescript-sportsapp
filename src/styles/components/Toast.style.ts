import { StyleSheet } from 'react-native';
import { iosHomeIndicatorOffset, isMWidth } from '../base/metrics.style';
import { baseFont } from '../base/fonts.style';

export default StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        left: 0,
        paddingBottom: Math.round(iosHomeIndicatorOffset / 4) + (isMWidth ? 30 : 22),
        paddingHorizontal: isMWidth ? 34 : 24
    },
    toast: {
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden'
    },
    blur: {
        ...StyleSheet.absoluteFillObject
    },
    messageContainer: {
        paddingVertical: isMWidth ? 22 : 18,
        paddingHorizontal: isMWidth ? 26 : 20
    },
    message: {
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 14 : 13,
        letterSpacing: 0.5,
        textAlign: 'center'
    }
});
