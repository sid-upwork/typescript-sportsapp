import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { titleFont, baseFont } from '../../base/fonts.style';
import { isLWidth, isXLHeight, isLHeight } from '../../base/metrics.style';
import colors from '../../base/colors.style';

export const LOW_FREQUENCY_GRADIENT_COLORS: string[] = [
    chroma(colors.violetDark).alpha(0).css(),
    chroma(colors.violetDark).alpha(0.35).css(),
    chroma(colors.violetDark).alpha(0.65).css()
];
export const HIGH_FREQUENCY_GRADIENT_COLORS: string[] = [
    chroma(colors.pink).alpha(0).css(),
    chroma(colors.orange).alpha(0.35).css(),
    chroma(colors.orange).alpha(0.65).css()
];
export const GRADIENT_LOCATIONS: number[] = [0, 0.45, 1];

export const PROGRAM_THUMBNAIL_HEIGHT = isXLHeight ? 180 : (isLHeight ? 170 : 160);

const BORDER_RADIUS = 22;

const BORDER_TOP_OFFSET: number = 15;
const BORDER_LEFT_OFFSET: number = 15;

const LEVEL_ICON_RATIO = 41 / 62;
const LEVEL_ICON_WIDTH = 14;
const LEVEL_ICON_HEIGHT = Math.round(LEVEL_ICON_WIDTH / LEVEL_ICON_RATIO);

const PADDING_H = isLWidth ? 18 : 16;
const PADDING_V = isLWidth ? 16 : 14;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        height: PROGRAM_THUMBNAIL_HEIGHT,
        marginBottom: 20,
        borderRadius: BORDER_RADIUS
    },
    touchableOpacity: {
        flex: 1
    },
    touchableOpacityInner: {
        flex: 1,
        paddingRight: BORDER_LEFT_OFFSET,
        paddingBottom: BORDER_TOP_OFFSET
    },
    border: {
        position: 'absolute',
        top: BORDER_TOP_OFFSET,
        right: 0,
        bottom: 0,
        left: BORDER_LEFT_OFFSET,
        borderWidth: 1,
        borderColor: colors.violetLight,
        borderRadius: BORDER_RADIUS
    },
    imageContainer: {
        flex: 1
    },
    imageContainerInner: {
        flex: 1,
        borderRadius: BORDER_RADIUS,
        overflow: 'hidden',
        backgroundColor: colors.violetDark
    },
    image: {
        flex: 1
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end'
    },
    gradientOverlay: {
        borderRadius: BORDER_RADIUS
    },
    gradientOverlayActive: {
        borderWidth: 2,
        borderRadius: BORDER_RADIUS
    },
    diffuseShadow: {
        bottom: 0
    },
    titleContainer: {
        paddingHorizontal: PADDING_H,
        paddingVertical: PADDING_V
    },
    title: {
        fontSize: isLWidth ? 22 : 20,
        fontFamily: titleFont.bold,
        color: colors.white,
        // textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    level: {
        position: 'absolute',
        top: PADDING_V,
        right: PADDING_H,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    levelText: {
        marginRight: 10,
        fontFamily: baseFont.bold,
        color: 'white',
        fontSize: 15
    },
    levelIconContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    levelIcon: {
        width: LEVEL_ICON_WIDTH,
        height: LEVEL_ICON_HEIGHT
    }
});
