import { StyleSheet } from 'react-native';
import { POPUP_WIDTH_ON_POSITION_CENTER } from '../Popup.style';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';

const POPUP_PADDING_V = 30;
const TITLE_FONT_SIZE = 22;
const TITLE_MARGIN_BOTTOM = 24;

export const ITEM_SIZE = Math.round(POPUP_WIDTH_ON_POSITION_CENTER / 3);
export const ITEM_BORDER_RADIUS = 16;

export const SUMMARY_POPUP_HEIGHT = POPUP_PADDING_V * 2 + (TITLE_FONT_SIZE * 1.5) + TITLE_MARGIN_BOTTOM + ITEM_SIZE;

export const SEPARATOR_CONTAINER_WIDTH = 20;
const LINK_ICON_RATIO = 180 / 80;
const LINK_ICON_WIDTH = SEPARATOR_CONTAINER_WIDTH;
const LINK_ICON_HEIGHT = LINK_ICON_RATIO / LINK_ICON_WIDTH;

const HIGHLIGHT_COLOR = colors.orangeLight;

export const ACTIVE_GRADIENT_LOCATIONS = [0.3, 0.7, 1];
export const ACTIVE_GRADIENT_COLORS = [
    chroma(HIGHLIGHT_COLOR).alpha(0).css(),
    chroma(HIGHLIGHT_COLOR).alpha(0.45).css(),
    chroma(HIGHLIGHT_COLOR).alpha(0.9).css()
];

export const OVERLAY_COLORS = [
    chroma(colors.black).alpha(0).css(),
    chroma(colors.black).alpha(0.75).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    contentContainer: {
        paddingVertical: POPUP_PADDING_V
    },
    popupTitle: {
        marginBottom: TITLE_MARGIN_BOTTOM,
        paddingHorizontal: 20,
        color: colors.violetDark,
        fontSize: TITLE_FONT_SIZE,
        fontFamily: titleFont.black,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.5
    },
    scrollView: {
        overflow: 'visible'
    },
    scrollViewContentContainer: {
        paddingLeft: SEPARATOR_CONTAINER_WIDTH,
        alignItems: 'center'
    },
    itemContainer: {
    },
    itemContainerInner: {
        height: ITEM_SIZE,
        width: ITEM_SIZE,
        borderRadius: ITEM_BORDER_RADIUS,
        overflow: 'hidden'
    },
    itemImageContainer: {
        backgroundColor: colors.violetLight
    },
    overlay: {
        backgroundColor: chroma(HIGHLIGHT_COLOR).alpha(0.8).css(),
        justifyContent: 'center',
        alignItems: 'center'
    },
    overlayDoneIcon: {
        height: 30,
        aspectRatio: 1,
        resizeMode: 'contain'
    },
    border: {
        borderRadius: ITEM_BORDER_RADIUS,
        borderColor: chroma(colors.violetDark).alpha(0.45).css(),
        borderWidth: 1
    },
    borderActive: {
        borderRadius: ITEM_BORDER_RADIUS,
        borderColor: chroma(HIGHLIGHT_COLOR).alpha(0.92).css(),
        borderWidth: 3
    },
    infoContainer: {
        ...StyleSheet.absoluteFillObject
    },
    setsContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: chroma(colors.violetDark).alpha(0.7).css(),
        borderBottomStartRadius: ITEM_BORDER_RADIUS,
        paddingHorizontal: 8,
        paddingVertical: 5
    },
    setsText: {
        color: colors.white,
        fontFamily: baseFont.bold,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    titleContainerInner: {
        paddingHorizontal: 10,
        paddingVertical: 8
    },
    titleText: {
        color: colors.white,
        fontFamily: baseFont.bold,
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: 'capitalize'
    },
    separatorContainer: {
        width: SEPARATOR_CONTAINER_WIDTH
    },
    anchorIcon: {
        width: SEPARATOR_CONTAINER_WIDTH,
        height: SEPARATOR_CONTAINER_WIDTH,
        resizeMode: 'contain',
        tintColor: colors.violetDark
    },
    anchorIconDone: {
        tintColor: colors.orangeLight
    }
});
