import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { baseFont } from '../base/fonts.style';
import colors from '../base/colors.style';
import { isMWidth, isLWidth } from '../base/metrics.style';

const COLOR = colors.error;
const BORDER_RADIUS = 18;

export default StyleSheet.create({
    container: {
        overflow: 'hidden'
    },
    containerInner: {
        flexDirection: 'row',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: BORDER_RADIUS,
        borderColor: chroma(COLOR).alpha(0.75).css(),
        borderWidth: 1
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: BORDER_RADIUS
    },
    blurIOS: {
        backgroundColor: chroma(colors.background).alpha(0.35).css()
    },
    blurAndroid: {
        backgroundColor: chroma(colors.background).alpha(0.85).css()
    },
    containerInnerContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8
    },
    iconContainer: {
        marginRight: 14
    },
    icon: {
        width: 30,
        height: 30,
        aspectRatio: 1,
        resizeMode: 'contain',
        tintColor: COLOR
    },
    messageContainer: {
        flex: 1
    },
    message: {
        color: COLOR,
        fontFamily: baseFont.bold,
        fontSize: isLWidth ? 14 : 13,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    messageRetry: {
        textAlign: 'left'
    }
});
