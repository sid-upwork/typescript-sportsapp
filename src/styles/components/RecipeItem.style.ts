import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { titleFont, baseFont } from '../base/fonts.style';
import colors from '../base/colors.style';
import { SIDEBAR_WIDTH } from './Sidebar.style';
import { isLWidth, isMWidth } from '../base/metrics.style';

const CONTAINER_HEIGHT = isMWidth ? 300 : 265;
const CONTAINER_MARGIN_BOTTOM = 20;
const CONTAINER_BORDER_WIDTH = 1;
export const RECIPE_ITEM_HEIGHT = CONTAINER_HEIGHT + CONTAINER_MARGIN_BOTTOM;
const CONTAINER_MARGIN_H = 12;
const CONTAINER_PADDING_H = CONTAINER_MARGIN_H / 2;
const IMAGE_HEIGHT = isMWidth ? 170 : 150;
const IMAGE_PADDING = isMWidth ? 18 : 15;
const IMAGE_BORDER_RADIUS = 20;
const PADDING_BOTTOM_IMAGE = 20;
const MORE_CONTAINER_SIZE = 70;
const MORE_CONTAINER_RIGHT_OFFSET = 28;
const CLOCK_ICON_SIZE = 20;

const VEGAN_ICON_RATIO = 32 / 26;
const VEGAN_ICON_WIDTH = isMWidth ? 20 : 16;
const VEGAN_ICON_HEIGHT = Math.round(VEGAN_ICON_WIDTH / VEGAN_ICON_RATIO);

export const OVERLAY_COLORS = [
    chroma(colors.black).alpha(0).css(),
    chroma(colors.black).alpha(0.7).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: CONTAINER_HEIGHT,
        marginHorizontal: CONTAINER_MARGIN_H,
        marginBottom: CONTAINER_MARGIN_BOTTOM,
        paddingBottom: 20,
        paddingHorizontal: CONTAINER_PADDING_H,
        borderColor: colors.white,
        borderWidth: CONTAINER_BORDER_WIDTH,
        borderRadius: IMAGE_BORDER_RADIUS,
        backgroundColor: 'transparent'
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 85
    },
    title: {
        flex: 1,
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 18 : 16,
        color: colors.violetDark,
        textTransform: 'uppercase',
        letterSpacing: isMWidth ? 1 : 0.5,
        paddingRight: 15
    },
    topRightContainer: {
        display: 'flex',
        width: SIDEBAR_WIDTH - CONTAINER_MARGIN_H - CONTAINER_PADDING_H,
        justifyContent: 'center',
        alignItems: 'center'
    },
    timeContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderColor: colors.white,
        borderRadius: IMAGE_BORDER_RADIUS,
        borderWidth: 1
    },
    iconTime: {
        width: CLOCK_ICON_SIZE,
        height: CLOCK_ICON_SIZE
    },
    time: {
        fontFamily: titleFont.bold,
        fontSize: 20,
        color: colors.white,
        paddingLeft: 10
    },
    bottomContainer: {
        height: IMAGE_HEIGHT + PADDING_BOTTOM_IMAGE,
        paddingBottom: PADDING_BOTTOM_IMAGE,
        borderRadius: IMAGE_BORDER_RADIUS
    },
    bottomContent: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    imageWrapper: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: IMAGE_BORDER_RADIUS,
        backgroundColor: colors.violetVeryLight
    },
    imageContainer: {
        position: 'absolute',
        width: '100%',
        height: IMAGE_HEIGHT,
        borderRadius: IMAGE_BORDER_RADIUS,
        backgroundColor: colors.violetLight
    },
    imageShadow: {
        position: 'absolute',
        top: '50%',
        bottom: 0,
        left: '10%',
        right: '10%',
        backgroundColor: colors.main, // shadow won't render without setting it
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10
    },
    image: {
        borderRadius: IMAGE_BORDER_RADIUS
    },
    tagContainer: {
        position: 'absolute',
        top: IMAGE_PADDING,
        left: IMAGE_PADDING
        // width: '45%'
    },
    tagTextContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.violetDark,
        borderColor: colors.white,
        borderRadius: IMAGE_BORDER_RADIUS,
        paddingVertical: isMWidth ? 7 : 6,
        paddingHorizontal: isMWidth ? 14 : 12
    },
    iconVegan: {
        width: VEGAN_ICON_WIDTH,
        height: VEGAN_ICON_HEIGHT,
        marginRight: 8
    },
    tagText: {
        fontFamily: baseFont.light,
        letterSpacing: 0.5,
        fontSize: isLWidth ? 14 : (isMWidth ? 13 : 12),
        color: colors.white
    },
    kcalContainer: {
        position: 'absolute',
        top: IMAGE_PADDING,
        right: IMAGE_PADDING,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        backgroundColor: colors.violetDark,
        borderColor: colors.white,
        borderRadius: IMAGE_BORDER_RADIUS,
        paddingVertical: 7,
        paddingHorizontal: 14
    },
    kcalText: {
        fontFamily: baseFont.regular,
        letterSpacing: 1,
        fontSize: isLWidth ? 14 : (isMWidth ? 13 : 12),
        color: colors.white
    },
    subtitleContainer: {
        padding: IMAGE_PADDING,
        paddingRight: IMAGE_PADDING + MORE_CONTAINER_SIZE + MORE_CONTAINER_RIGHT_OFFSET
    },
    subtitleOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderBottomLeftRadius: IMAGE_BORDER_RADIUS,
        borderBottomRightRadius: IMAGE_BORDER_RADIUS
    },
    subtitle: {
        color: colors.white,
        fontSize: 14,
        fontFamily: titleFont.regular,
        letterSpacing: 1
    },
    moreContainer: {
        position: 'absolute',
        bottom: 0,
        right: MORE_CONTAINER_RIGHT_OFFSET,
        justifyContent: 'center',
        alignItems: 'center',
        width: MORE_CONTAINER_SIZE,
        height: MORE_CONTAINER_SIZE
    },
    moreGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: MORE_CONTAINER_SIZE / 2,
        elevation: 10
    },
    more: {
        fontFamily: titleFont.bold,
        fontSize: 15,
        letterSpacing: 2,
        color: colors.white,
        textTransform: 'uppercase',
        elevation: 10
    },
    tooltip: {
        position: 'absolute',
        top: -14,
        right: 0
    }
});
