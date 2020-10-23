import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import androidElevations from '../../utils/androidElevations';
import { isMWidth } from '../base/metrics.style';

export const TOOLTIP_TOTAL_SIZE = isMWidth ? 48 : 44;
const TOOLTIP_INNER_SIZE = isMWidth ? 36 : 32;
export const TOOLTIP_SIZE_DELTA = (TOOLTIP_TOTAL_SIZE - TOOLTIP_INNER_SIZE) / 2;
const TOOLTIP_BORDER_RADIUS = TOOLTIP_INNER_SIZE / 2;
const ICON_SIZE = isMWidth ? 22 : 19;

export const BORDER_SCALE = TOOLTIP_INNER_SIZE / TOOLTIP_TOTAL_SIZE;

export const GRADIENT_ORANGE_COLORS = [colors.orange, colors.violetLight];
export const GRADIENT_BLUE_COLORS = [colors.blueLight, colors.blueDark];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        position: 'absolute',
        width: TOOLTIP_TOTAL_SIZE,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    border: {
        borderRadius: TOOLTIP_TOTAL_SIZE / 2,
        borderWidth: 1
    },
    button: {
        width: TOOLTIP_INNER_SIZE,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: TOOLTIP_BORDER_RADIUS,
        shadowColor: chroma(colors.blueDark).darken(2).css(),
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 8,
        elevation: androidElevations.global.tooltip
    },
    gradient: {
        borderRadius: TOOLTIP_BORDER_RADIUS
    },
    icon: {
        width: ICON_SIZE,
        aspectRatio: 1
    }
});
