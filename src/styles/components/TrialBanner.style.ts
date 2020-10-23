import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { baseFont, titleFont } from '../base/fonts.style';
import { isMWidth, iosHomeIndicatorOffset } from '../base/metrics.style';

const BOTTOM_DELTA = 24; // For bouncing animation

const BORDER_RADIUS = 20;
const BORDER_WIDTH = 1;

export const PRIMARY_COLOR_SCALE = chroma.scale([
    '#80CA95',
    '#68C5E9',
    '#7584E4',
    '#EFAAA2'
]);
export const SECONDARY_COLOR_SCALE = chroma.scale([
    '#59BEAA',
    '#5189E9',
    '#7051DD',
    '#E6628B'
]);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },
    animatedContainer: {
        position: 'absolute',
        bottom: -BOTTOM_DELTA,
        right: -BORDER_WIDTH,
        left: -BORDER_WIDTH,
        paddingBottom: BOTTOM_DELTA,
        borderTopLeftRadius: BORDER_RADIUS,
        borderTopRightRadius: BORDER_RADIUS,
        borderColor: chroma(colors.white).alpha(0.65).css(),
        borderWidth: BORDER_WIDTH
    },
    gradient: {
        borderTopLeftRadius: BORDER_RADIUS - BORDER_WIDTH,
        borderTopRightRadius: BORDER_RADIUS - BORDER_WIDTH,
        opacity: 0.96
    },
    containerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: isMWidth ? 20 : 16,
        paddingBottom: (isMWidth ? 20 : 16) + Math.round(iosHomeIndicatorOffset / 3),
        paddingHorizontal: isMWidth ? 25 : 20
    },
    message: {
        flex: 1,
        color: colors.white,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 15 : 14,
        textAlign: 'center'
    },
    messageLastDay: {
        fontSize: isMWidth ? 14 : 13
    },
    buttonContainer: {
        marginLeft: 20
    },
    button: {
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: colors.white,
        borderRadius: 8,
        elevation: 4
    },
    buttonLabel: {
        fontFamily: titleFont.bold,
        fontSize: 14,
        textAlign: 'center',
        textTransform: 'uppercase'
    }
});
