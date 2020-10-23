import { StyleSheet } from 'react-native';
import { viewportWidth, headerHeight, statusBarOffset, viewportHeight, isLHeight } from '../base/metrics.style';
import { TITLE_CONTAINER_WIDTH } from '../components/SharedVerticalTitle.style';
import { TOOLTIP_TOTAL_SIZE, TOOLTIP_SIZE_DELTA } from '../components/Tooltip.style';
import colors from '../base/colors.style';
import chroma from 'chroma-js';

export const GRADIENT_COLORS_ORANGE = [colors.orange, colors.pink];
export const GRADIENT_COLORS_ORANGE_LIGHT = [chroma(colors.orange).brighten(0.75), chroma(colors.pink).brighten(0.75)];

const TOP_ELLIPSIS_MARGIN_TOP = statusBarOffset + 50;

const CAROUSEL_MARGIN_TOP = isLHeight ? 100 : 80;
const CAROUSEL_MARGIN_BOTTOM = 40;
export const CAROUSEL_HEIGHT = Math.max(Math.round(viewportHeight * 0.40), isLHeight ? 350 : 320);

export const BACKGROUND_BOTTOM_TITLE_TOP_POSITION = headerHeight + CAROUSEL_MARGIN_TOP + CAROUSEL_HEIGHT + CAROUSEL_MARGIN_BOTTOM;

const BACKGROUND_TOP_RATIO = 506 / 374;
export const BACKGROUND_TOP_WIDTH = Math.round(viewportWidth * 1.20);
export const BACKGROUND_TOP_HEIGHT = Math.round(BACKGROUND_TOP_WIDTH / BACKGROUND_TOP_RATIO);

const BACKGROUND_BOTTOM_RATIO = 425 / 318;
export const BACKGROUND_BOTTOM_WIDTH = Math.round(viewportWidth * 1);
export const BACKGROUND_BOTTOM_HEIGHT = Math.round(BACKGROUND_BOTTOM_WIDTH / BACKGROUND_BOTTOM_RATIO );

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    sharedParallaxView: {
        flex: 1
    },
    topEllipsis: {
        alignItems: 'center',
        marginTop: TOP_ELLIPSIS_MARGIN_TOP
    },
    bottomEllipsis: {
        marginLeft: 40
    },
    backgroundTop: {
        position: 'absolute',
        top: headerHeight + BACKGROUND_TOP_HEIGHT * 0.15,
        right: -BACKGROUND_TOP_WIDTH * 0.3
    },
    backgroundBottom: {
        position: 'absolute',
        bottom: -BACKGROUND_BOTTOM_HEIGHT * 0.3,
        left: -BACKGROUND_BOTTOM_WIDTH * 0.2
    },
    backgroundTitles: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: TITLE_CONTAINER_WIDTH
    },
    backgroundTitleTop: {
        position: 'absolute',
        top: headerHeight + CAROUSEL_MARGIN_TOP
    },
    backgroundTitleBottom: {
        position: 'absolute'
    },
    carouselContainer: {
        marginTop: CAROUSEL_MARGIN_TOP,
        marginBottom: CAROUSEL_MARGIN_BOTTOM
    },
    carousel: {
        position: 'absolute'
    },
    carouselPlaceholderItemGradient: {
        flex: 1,
        borderRadius: 20
    },
    carouselPlaceholderItemGradientLight: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20
    },
    diffuseShadow: {
        bottom: 0,
        opacity: 0.4
    },
    loaderContainer: {
        alignItems: 'center',
        paddingVertical: 50
    },
    errorContainer: {
        marginLeft: TITLE_CONTAINER_WIDTH,
        marginRight: 20
    },
    // Android -> No touch event if there's an intermediate container without a properly defined size...
    tooltipTopContainer: {
        position: 'absolute',
        top: headerHeight + CAROUSEL_MARGIN_TOP - TOOLTIP_SIZE_DELTA - (TOOLTIP_TOTAL_SIZE / 2) + 15,
        left: TITLE_CONTAINER_WIDTH - (TOOLTIP_TOTAL_SIZE / 2),
        width: TOOLTIP_TOTAL_SIZE,
        height: TOOLTIP_TOTAL_SIZE
    },
    tooltipBottomContainer: {
        position: 'absolute',
        top: BACKGROUND_BOTTOM_TITLE_TOP_POSITION - TOOLTIP_SIZE_DELTA - (TOOLTIP_TOTAL_SIZE / 2) + 15,
        left: TITLE_CONTAINER_WIDTH - (TOOLTIP_TOTAL_SIZE / 2),
        width: TOOLTIP_TOTAL_SIZE,
        height: TOOLTIP_TOTAL_SIZE
    }
});
