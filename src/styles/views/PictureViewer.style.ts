import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { iosHomeIndicatorOffset, viewportWidth, isMWidth, isLWidth } from '../base/metrics.style';
import { baseFont } from '../base/fonts.style';

export const BACKGROUND_GRADIENT_COLORS = [
    '#0C0A0B',
    '#2E383A',
    '#0C0A0B'
];
export const BOTTOM_GRADIENT_COLORS = [
    chroma(colors.black).alpha(0).css(),
    chroma(colors.black).alpha(0.6).css(),
    chroma(colors.black).alpha(1).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1,
        backgroundColor: colors.pink
    },
    footer: {
        width: viewportWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: isLWidth ? 30 : 24,
        paddingTop: 20,
        paddingBottom: 20 + (iosHomeIndicatorOffset * 0.5)
    },
    footerDate: {
        color: colors.violetLight,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 16 : 15,
        textAlign: 'center'
    },
    footerButton: {
        height: 55
    },
    footerButtonText: {
        fontSize: isMWidth ? 18 : 16
    },
    footerIconStyle: {
        width: 28,
        marginHorizontal: 2
    }
});
