import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { iosHomeIndicatorOffset, viewportWidth, statusBarOffset, isMWidth, isLWidth, isMHeight } from '../base/metrics.style';
import { titleFont, baseFont } from '../base/fonts.style';
import colors from '../base/colors.style';

export const CAROUSEL_WIDTH = viewportWidth;
export const CAROUSEL_ITEM_WIDTH = Math.round(CAROUSEL_WIDTH * 0.75);
const CAROUSEL_ITEM_BORDER_RADIUS = isMWidth ? 40 : 34;
const CAROUSEL_PLACHOLDER_BORDER_LEFT_OFFSET = isMWidth ? 20 : 16;
const CAROUSEL_PLACHOLDER_BORDER_TOP_OFFSET = isMWidth ? 25 : 20;
const CAROUSEL_BOTTOM_MARGIN = 35;

const ADD_BUTTON_BORDER_OFFSET_H = isMWidth ? 12 : 10;
const ADD_BUTTON_BORDER_OFFSET_V = isMWidth ? 10 : 8;

const TAB_BUTTON_PADDING_TOP = 22;
const TAB_BUTTON_PADDING_BOTTOM = iosHomeIndicatorOffset * 0.25 + TAB_BUTTON_PADDING_TOP;
const TAB_BUTTON_FONT_SIZE = isMWidth ? 20 : 17;
const TAB_BUTTON_BORDER_RADIUS = 22;
const TAB_BUTTON_ICON_WIDTH = isMWidth ? 42 : 38;
export const TAB_BUTTON_GRADIENT_COLORS = [colors.orangeDark, colors.pink];

const VIEW_TAB_PADDING = CAROUSEL_BOTTOM_MARGIN + TAB_BUTTON_PADDING_TOP + TAB_BUTTON_FONT_SIZE + TAB_BUTTON_PADDING_BOTTOM;

const ADD_BUTTON_BORDER_RADIUS = 20;
export const ADD_BUTTON_GRADIENT_COLORS = [colors.blueLight, colors.blueDark];
const ADD_BUTTON_COLOR_SCALE = chroma.scale(ADD_BUTTON_GRADIENT_COLORS);

const CAMERA_ICON_RATIO = 101 / 90;
const CAMERA_ICON_WIDTH = TAB_BUTTON_ICON_WIDTH;
const CAMERA_ICON_HEIGHT = Math.round(CAMERA_ICON_WIDTH / CAMERA_ICON_RATIO);

const CAMERA_ADD_ICON_RATIO = 234 / 214;
const CAMERA_ADD_ICON_WIDTH_SMALL = isLWidth ? 50 : (isMWidth ? 44 : 40);
const CAMERA_ADD_ICON_HEIGHT_SMALL = Math.round(CAMERA_ADD_ICON_WIDTH_SMALL / CAMERA_ADD_ICON_RATIO );
const CAMERA_ADD_ICON_WIDTH_LARGE = isLWidth ? 100 : (isMWidth ? 84 : 70);
const CAMERA_ADD_ICON_HEIGHT_LARGE = Math.round(CAMERA_ADD_ICON_WIDTH_LARGE / CAMERA_ADD_ICON_RATIO );

const BACKGROUND_RATIO = 275 / 204;
export const BACKGROUND_WIDTH = 450;
export const BACKGROUND_HEIGHT = Math.round(BACKGROUND_WIDTH / BACKGROUND_RATIO);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    backgroundImage: {
        position: 'absolute',
        top: -BACKGROUND_HEIGHT * 0.65 + statusBarOffset,
        right: -BACKGROUND_WIDTH * 0.45
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scene: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20
    },
    titleContainer: {
        alignItems: 'center',
        paddingHorizontal: isMWidth ? 30 : 26
    },
    title: {
        paddingBottom: 8,
        fontSize: isMWidth ? 22 : 18,
        fontFamily: titleFont.bold,
        color: colors.violetDark,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    subtitle: {
        paddingBottom: 20,
        fontSize: isMWidth ? 18 : 15,
        fontFamily: titleFont.regular,
        color: colors.violetDark,
        textAlign: 'center'
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    editDateButtonWrapper: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'visible'
    },
    dateContainer: {
    },
    date: {
        alignItems: 'center',
        marginBottom: -30,
        paddingTop: isMHeight ? 25 : 15,
        paddingBottom: isMHeight ? 45 : 40,
        paddingHorizontal: isMWidth ? 22 : 20,
        borderTopRightRadius: ADD_BUTTON_BORDER_RADIUS,
        borderBottomRightRadius: ADD_BUTTON_BORDER_RADIUS,
        backgroundColor: colors.violetUltraLight
    },
    dateMonth: {
        color: colors.pink,
        fontFamily: baseFont.bold,
        fontSize: isLWidth ? 25 : (isMWidth ? 22 : 20),
        letterSpacing: isLWidth ? 1 : 0.5,
        lineHeight: isLWidth ? 29 : (isMWidth ? 25 : 23),
        textAlign: 'center'
    },
    dateDay: {
        color: colors.pink,
        fontFamily: baseFont.light,
        fontSize: isLWidth ? 45 : (isMWidth ? 40 : 35),
        letterSpacing: 1,
        lineHeight: isLWidth ? 52 : (isMWidth ? 46 : 40),
        textAlign: 'center'
    },
    dateYear: {
        color: colors.pink,
        fontFamily: baseFont.bold,
        fontSize: isLWidth ? 20 : (isMWidth ? 18 : 16),
        letterSpacing: isLWidth ? 1 : 0.5,
        lineHeight: isLWidth ? 23 : (isMWidth ? 21 : 18),
        textAlign: 'center'
    },
    editDateButton: {
        position: 'absolute',
        top: -10,
        right: -10
    },
    addButtonContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: isMHeight ? 10 : 5,
        paddingBottom: isMHeight ? 30 : 15
    },
    addButton: {
        alignItems: 'flex-start',
        paddingRight: ADD_BUTTON_BORDER_OFFSET_H,
        paddingBottom: ADD_BUTTON_BORDER_OFFSET_V
    },
    addButtonBorder: {
        position: 'absolute',
        top: ADD_BUTTON_BORDER_OFFSET_V,
        bottom: 0,
        left: ADD_BUTTON_BORDER_OFFSET_H,
        right: 0,
        borderRadius: ADD_BUTTON_BORDER_RADIUS,
        borderWidth: 1,
        borderColor: ADD_BUTTON_COLOR_SCALE(0.45)
    },
    addButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: isMHeight ? 15 : 12,
        paddingHorizontal: isMWidth ? 20 : 15,
        borderRadius: ADD_BUTTON_BORDER_RADIUS,
        overflow: 'hidden'
    },
    addButtonIcon: {
        width: CAMERA_ADD_ICON_WIDTH_SMALL,
        height: CAMERA_ADD_ICON_HEIGHT_SMALL,
        marginRight: isMWidth ? 15 : 12
    },
    addButtonTitleContainer: {
        alignItems: 'center'
    },
    addButtonTitleTop: {
        color: 'white',
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 18 : 16,
        textTransform: 'uppercase',
        letterSpacing: isMWidth ? 1 : 0.5
    },
    addButtonTitleBottom: {
        color: 'white',
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 25 : 20,
        textTransform: 'uppercase',
        letterSpacing: isMWidth ? 1.5 : 1,
        lineHeight: isMWidth ? 29 : 23
    },
    carousel: {
        overflow: 'visible',
        paddingBottom: VIEW_TAB_PADDING
    },
    carouselItem: {
        flex: 1
    },
    carouselItemImage: {
        flex: 1,
        borderRadius: CAROUSEL_ITEM_BORDER_RADIUS,
        overflow: 'hidden',
        backgroundColor: colors.violetLight
    },
    carouselPlaceholder: {
        flex: 1,
        width: CAROUSEL_WIDTH,
        alignItems: 'center',
        paddingBottom: VIEW_TAB_PADDING
    },
    carouselPlaceholderInner: {
        flex: 1,
        width: CAROUSEL_ITEM_WIDTH,
        paddingRight: CAROUSEL_PLACHOLDER_BORDER_LEFT_OFFSET,
        paddingBottom: CAROUSEL_PLACHOLDER_BORDER_TOP_OFFSET
    },
    carouselPlaceholderBorder: {
        position: 'absolute',
        top: CAROUSEL_PLACHOLDER_BORDER_TOP_OFFSET,
        right: 0,
        bottom: 0,
        left: CAROUSEL_PLACHOLDER_BORDER_LEFT_OFFSET,
        borderRadius: CAROUSEL_ITEM_BORDER_RADIUS,
        borderWidth: 1,
        borderColor: colors.violetLight
    },
    carouselPlaceholderItem: {
        width: '100%',
        height: '100%'
    },
    carouselPlaceholderItemShadow: {
        bottom: 0
    },
    carouselPlaceholderItemInner: {
        flex: 1,
        borderRadius: CAROUSEL_ITEM_BORDER_RADIUS,
        overflow: 'hidden',
        backgroundColor: colors.violetUltraLight
    },
    carouselPlaceholderItemContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    carouselPlaceholderItemIcon: {
        width: CAMERA_ADD_ICON_WIDTH_LARGE,
        height: CAMERA_ADD_ICON_HEIGHT_LARGE,
        marginBottom: 20,
        tintColor: colors.pink
    },
    carouselPlaceholderItemSubtitle: {
        color: colors.pink,
        textTransform: 'uppercase',
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 20 : 17
    },
    carouselPlaceholderItemTitle: {
        color: colors.pink,
        textTransform: 'uppercase',
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 25 : 23
    },
    // Absolutely positioned so that item's shadow isn't cut out
    tabButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    tabButton: {
        width: '49.5%'
    },
    tabButtonInner: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: TAB_BUTTON_PADDING_TOP,
        paddingBottom: TAB_BUTTON_PADDING_BOTTOM,
        paddingHorizontal: isMWidth ? 15 : 12
    },
    tabButtonBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: -20 // Avoid visual glitch when animating the tabs in
    },
    tabButtonBackgroundBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: TAB_BUTTON_BORDER_RADIUS,
        borderWidth: 1,
        backgroundColor: colors.background
    },
    tabButtonSelected: {
        borderColor: colors.orange
    },
    tabButtonPictures: {
        borderColor: colors.pink
    },
    tabButtonCollages: {
        borderColor: colors.orange
    },
    tabButtonGradientContainer: {
        ...StyleSheet.absoluteFillObject
    },
    tabButtonGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: TAB_BUTTON_BORDER_RADIUS
    },
    tabButtonLabelContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabButtonIcon: {
        position: 'absolute',
        left: -TAB_BUTTON_ICON_WIDTH * 0.66
    },
    tabButtonIconSelected: {
        tintColor: 'white'
    },
    tabButtonIconPictures: {
        top: -Math.round(CAMERA_ICON_HEIGHT / 4),
        width: CAMERA_ICON_WIDTH ,
        height: CAMERA_ICON_HEIGHT,
        tintColor: colors.pink,
        opacity: 0.3
    },
    tabButtonIconCollages: {
        top: -Math.round(TAB_BUTTON_ICON_WIDTH / 4),
        width: TAB_BUTTON_ICON_WIDTH,
        height: TAB_BUTTON_ICON_WIDTH,
        tintColor: colors.orange,
        opacity: 0.3
    },
    tabButtonLabel: {
        textTransform: 'uppercase',
        fontSize: TAB_BUTTON_FONT_SIZE,
        fontFamily: titleFont.bold
    },
    tabButtonLabelSelected: {
        color: 'white'
    },
    tabButtonLabelPictures: {
        color: colors.pink
    },
    tabButtonLabelCollages: {
        color: colors.orange
    }
});
