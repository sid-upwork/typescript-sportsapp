import { StyleSheet } from 'react-native';
import { baseFont } from '../../base/fonts.style';
import { TOOLTIP_TOTAL_SIZE, TOOLTIP_SIZE_DELTA } from '../Tooltip.style';
import colors from '../../base/colors.style';
import chroma from 'chroma-js';

export const MENU_ICON_CONTAINER_SIZE = 48;
export const GRADIENT_COLORS = [colors.white, '#E1E5F4'];
const ICON_SIZE = 26;
export const ICON_COLOR = '#2E52B1';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        alignItems: 'center',
        paddingTop: TOOLTIP_TOTAL_SIZE / 3
    },
    iconContainer: {
        width: MENU_ICON_CONTAINER_SIZE,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: MENU_ICON_CONTAINER_SIZE / 2,
        backgroundColor: colors.white,
        shadowColor: chroma(colors.blueDark).darken(2).css(),
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 12,
        elevation: 5
    },
    icon: {
        width: ICON_SIZE,
        aspectRatio: 1
    },
    label: {
        marginTop: 10,
        marginBottom: -5,
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: 12,
        lineHeight: 15,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    tooltip: {
        position: 'absolute',
        top: -TOOLTIP_SIZE_DELTA + 3,
        right: TOOLTIP_SIZE_DELTA
    }
});
