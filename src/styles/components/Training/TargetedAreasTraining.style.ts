import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { SIDEBAR_WIDTH } from '../Sidebar.style';
import { titleFont, baseFont } from '../../base/fonts.style';
import { viewportWidth, isLWidth, isMWidth } from '../../base/metrics.style';
import { TOOLTIP_TOTAL_SIZE } from '../Tooltip.style';

const BACKGROUND_RATIO = 635 / 848;
const BACKGROUND_WIDTH = 410;
const BACKGROUND_HEIGHT = Math.round(BACKGROUND_WIDTH * BACKGROUND_RATIO);

const MARGIN_LEFT = 20;

const VISIBLE_ITEMS = 3;
export const ITEM_MARGIN_RIGHT = 16;
const ITEM_RATIO = 1204 / 1341;
export const ITEM_WIDTH = Math.round((viewportWidth - MARGIN_LEFT - ((VISIBLE_ITEMS - 1) * ITEM_MARGIN_RIGHT)) / (VISIBLE_ITEMS - 0.4));
const ITEM_HEIGHT = Math.round(ITEM_WIDTH / ITEM_RATIO);

const ITEM_SHADOW_WIDTH = Math.round(ITEM_WIDTH * 0.75);
const ITEM_SHADOW_HEIGHT = Math.round(ITEM_HEIGHT * 0.75);

const ITEM_ICON_SIZE = Math.round(ITEM_WIDTH * 5 / 12);

export default StyleSheet.create({
    container: {
        flex: 1
    },
    backgroundBlob: {
        position: 'absolute',
        bottom: -Math.round(viewportWidth * 0.35),
        left: -Math.round(viewportWidth * 0.23),
        width: BACKGROUND_WIDTH,
        height: BACKGROUND_HEIGHT
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingRight: SIDEBAR_WIDTH + 30,
        paddingLeft: MARGIN_LEFT
    },
    labelText: {
        color: colors.violetDark,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 24 : 23,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    tooltip: {
        position: 'absolute',
        right: SIDEBAR_WIDTH - (TOOLTIP_TOTAL_SIZE / 2)
    },
    scrollview: {
        marginTop: 30
    },
    scrollContentContainer: {
        paddingHorizontal: MARGIN_LEFT,
        paddingBottom: 40 // For diffuse shadow
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        marginRight: ITEM_MARGIN_RIGHT
    },
    oddItemContainer: {
        marginTop: 40
    },
    itemShadowContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
    },
    itemShadowWapper: {
        width: ITEM_SHADOW_WIDTH,
        height: ITEM_SHADOW_HEIGHT,
        marginTop: 15
    },
    itemShadow: {
        ...StyleSheet.absoluteFillObject
    },
    itemBackgroundShape: {
        ...StyleSheet.absoluteFillObject
    },
    itemContentContainer: {
        ...StyleSheet.absoluteFillObject,
        right: Math.round(ITEM_WIDTH / 12),
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemIcon: {
        width: ITEM_ICON_SIZE,
        aspectRatio: 1
    },
    itemLabel: {
        marginTop: 8,
        color: colors.violetDark,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 15 : (isMWidth ? 13 : 12),
        textAlign: 'center'
    }
});
