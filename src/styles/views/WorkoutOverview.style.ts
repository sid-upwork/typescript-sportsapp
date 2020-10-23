import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { viewportWidth, viewportHeight, iosHomeIndicatorOffset, isXLHeight, statusBarOffset, isLWidth, isMWidth } from '../base/metrics.style';
import { titleFont, baseFont } from '../base/fonts.style';
import { BACKGROUND_SHAPE_RATIO, BACKGROUND_SHAPE_WIDTH, BACKGROUND_SHAPE_HEIGHT } from './Article.style';
import { SIDEBAR_WIDTH } from '../components/Sidebar.style';
import { PLAY_BUTTON_SIZE } from '../components/VideoPlayer.style';
import { TOOLTIP_SIZE_DELTA } from '../components/Tooltip.style';

export const HEADER_MAX_HEIGHT = Math.round(viewportHeight * (isXLHeight ? 0.45 : 0.4));

const BACKGROUND_SHAPE_TOP = Math.round(viewportHeight * 0.55);
const ELLIPSIS_TOP = BACKGROUND_SHAPE_TOP - 80;
const SCROLLVIEW_TOP = BACKGROUND_SHAPE_TOP + Math.round(BACKGROUND_SHAPE_HEIGHT * 0.12);

export const DONE_OPACITY = 0.65;
export const DONE_COLOR = colors.orangeLight;

export const IMAGE_GRADIENT_COLORS = [
    chroma(colors.black).alpha(0).css(),
    chroma(colors.black).alpha(0.6).css(),
    chroma(colors.black).alpha(1).css()
];

export const MARGIN_HORIZONTAL = isLWidth ? 26 : 24;
const SHAPE_MARGIN_RIGHT = Math.round(BACKGROUND_SHAPE_WIDTH * 0.25);
const TITLE_MARGIN_RIGHT = SHAPE_MARGIN_RIGHT + 15;

const DESCRIPTION_BORDER_RADIUS = 24;

const BUTTON_START_RATIO = 520 / 771;
const BUTTON_START_WIDTH = viewportWidth * 0.9;
const BUTTON_START_HEIGHT = Math.round(BUTTON_START_RATIO * BUTTON_START_WIDTH);
const BUTTON_START_BOTTOM_MARGIN = Math.round(iosHomeIndicatorOffset / 4);
const BUTTON_START_BOTTOM = -Math.round(BUTTON_START_HEIGHT * 0.35) + BUTTON_START_BOTTOM_MARGIN;
const BUTTON_START_RIGHT = -Math.round(BUTTON_START_WIDTH * 0.55);
const BUTTON_START_TEXT_HEIGHT = Math.round(BUTTON_START_HEIGHT * 0.65) + BUTTON_START_BOTTOM;

const BUTTON_RESTART_RATIO = 209 / 359;
const BUTTON_RESTART_WIDTH = viewportWidth * 0.5;
const BUTTON_RESTART_HEIGHT = Math.round(BUTTON_RESTART_RATIO * BUTTON_RESTART_WIDTH);
const BUTTON_RESTART_BOTTOM = -Math.round(BUTTON_RESTART_WIDTH * 0.15) + BUTTON_START_BOTTOM_MARGIN;
const BUTTON_RESTART_RIGHT = Math.round(BUTTON_RESTART_WIDTH * 0.15);
const BUTTON_RESTART_TEXT_WIDTH = Math.round(BUTTON_RESTART_WIDTH * 0.38);

const CHECK_BUTTON_SIZE = 52;
const CHECK_BUTTON_INNER_SIZE = 40;
const CHECK_BUTTON_COLOR = colors.violetLight;
export const CHECK_TITLE_HEIGHT = 140;
export const CHECK_TITLE_HEIGHT_DONE = 110;
export const CHECK_TITLE_WIDTH = CHECK_BUTTON_SIZE;
const CHECK_TITLE_MARGIN_BOTTOM = 10;

export const FADE_EFFECT_HEIGHT = (viewportHeight - BACKGROUND_SHAPE_TOP -
    Math.round(BACKGROUND_SHAPE_HEIGHT * 0.28)) * 0.6;
export const FADE_EFFECT_COLORS: string[] = [
    chroma(colors.background).alpha(0).css(),
    chroma(colors.background).alpha(0.5).css(),
    chroma(colors.background).alpha(1).css(),
    chroma(colors.background).alpha(1).css()
];
export const FADE_EFFECT_LOCATIONS: number[] = [0, 0.25, 0.9, 1];

const checkButtonPosition = (position: 'top' | 'bottom', height?: number) => {
    const deltaFromShapeTop = Math.round(BACKGROUND_SHAPE_HEIGHT * 0.25);
    return position === 'bottom' ?
        viewportHeight - BACKGROUND_SHAPE_TOP - deltaFromShapeTop - (CHECK_BUTTON_SIZE / 2) :
        BACKGROUND_SHAPE_TOP - (height + CHECK_TITLE_MARGIN_BOTTOM + (CHECK_BUTTON_SIZE / 2)) + deltaFromShapeTop;
};

const CHECKMARK_ICON_RATIO = 59 / 42;
const CHECKMARK_ICON_WIDTH = 20;
const CHECKMARK_ICON_HEIGHT = Math.round(CHECKMARK_ICON_WIDTH / CHECKMARK_ICON_RATIO );

const REPEAT_ICON_RATIO = 59 / 60;
const REPEAT_ICON_WIDTH = 30;
const REPEAT_ICON_HEIGHT = Math.round(REPEAT_ICON_WIDTH / REPEAT_ICON_RATIO );

const VIEW_BACKGROUND_COLOR = colors.violetLight;

const CIRCUIT_LABEL_TOP = -5;
const CIRCUIT_LABEL_BOTTOM = 35;
const CIRCUIT_LABEL_BORDER_WIDTH = 5;
export const CIRCUIT_LABEL_TITLE_WIDTH = 20;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        backgroundColor: VIEW_BACKGROUND_COLOR
    },
    imageBackground: {
        backgroundColor: VIEW_BACKGROUND_COLOR
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: viewportHeight - BACKGROUND_SHAPE_TOP
    },
    ellipsisBackground: {
        position: 'absolute',
        top: ELLIPSIS_TOP,
        left: 40
    },
    textEllipsisBackground: {
        color: chroma(colors.white).alpha(0.45).css()
    },
    overlayDone: {
        backgroundColor: DONE_COLOR,
        opacity: 0.35
    },
    vectorBackgroundContainer: {
        position: 'absolute'
    },
    backgroundShape: {
        position: 'absolute',
        top: BACKGROUND_SHAPE_TOP,
        left: 0,
        width: BACKGROUND_SHAPE_WIDTH,
        aspectRatio: BACKGROUND_SHAPE_RATIO
    },
    sidebarContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        overflow: 'hidden'
    },
    sidebar: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.violetLight
    },
    sidebarDone: {
        backgroundColor: DONE_COLOR
    },
    scrollViewInnerForegroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: viewportWidth,
        height: viewportHeight
    },
    alreadyCompletedTooltip: {
        position: 'absolute',
        bottom: -TOOLTIP_SIZE_DELTA - 5,
        right: Math.round(SHAPE_MARGIN_RIGHT * 0.1)
    },
    alreadyCompletedContainer: {
        position: 'absolute',
        bottom: checkButtonPosition('bottom'),
        right: 0,
        width: SHAPE_MARGIN_RIGHT,
        alignItems: 'center'
    },
    alreadyCompletedContainerDone: {
    },
    alreadyCompletedInner: {
        alignItems: 'center'
    },
    alreadyCompletedTextContainer: {
        alignItems: 'flex-start'
    },
    alreadyCompletedTextContainerVerticalLanguage: {
        top: null,
        bottom: -5
    },
    alreadyCompletedText: {
        color: CHECK_BUTTON_COLOR,
        fontSize: 14,
        fontFamily: baseFont.bold,
        letterSpacing: 0.5,
        lineHeight: 14,
        textAlign: 'left'
    },
    alreadyCompletedTextDone: {
        color: DONE_COLOR
    },
    alreadyCompletedTextDoneVL: {
        paddingHorizontal: 10,
        lineHeight: 16,
        textAlign: 'center'
    },
    checkIconContainer: {
        marginTop: CHECK_TITLE_MARGIN_BOTTOM,
        height: CHECK_BUTTON_SIZE,
        width: CHECK_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: CHECK_BUTTON_COLOR,
        borderRadius: CHECK_BUTTON_SIZE / 2,
        borderWidth: 1
    },
    checkIconContainerDone: {
        borderColor: DONE_COLOR
    },
    checkIconContainerInner: {
        height: CHECK_BUTTON_INNER_SIZE,
        width: CHECK_BUTTON_INNER_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: CHECK_BUTTON_COLOR,
        borderRadius: CHECK_BUTTON_INNER_SIZE / 2
    },
    checkIconContainerInnerDone: {
        backgroundColor: DONE_COLOR
    },
    checkIcon: {
        width: CHECKMARK_ICON_WIDTH,
        height: CHECKMARK_ICON_HEIGHT
    },
    videoViewerContainer: {
        position: 'absolute',
        top: statusBarOffset,
        left: 0,
        right: 0,
        height: BACKGROUND_SHAPE_TOP - statusBarOffset
    },
    videoViewerInnerContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
    },
    playIcon: {
        width: PLAY_BUTTON_SIZE,
        aspectRatio: 1
    },
    playIconBlur: {
        borderRadius: PLAY_BUTTON_SIZE / 2
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100 // size needed on Android for "touch" events on children
    },
    restartButtonContainer: {
        position: 'absolute',
        bottom: BUTTON_RESTART_BOTTOM,
        right: BUTTON_RESTART_RIGHT,
        width: BUTTON_RESTART_WIDTH,
        height: BUTTON_RESTART_HEIGHT,
        resizeMode: 'contain'
    },
    restartTextContainer: {
        position: 'absolute',
        bottom: 0,
        right: BUTTON_RESTART_RIGHT + BUTTON_RESTART_WIDTH - BUTTON_RESTART_TEXT_WIDTH,
        width: BUTTON_RESTART_TEXT_WIDTH,
        height: BUTTON_START_TEXT_HEIGHT, // Same as startTextContainer
        justifyContent: 'center',
        alignItems: 'center'
    },
    restartIcon: {
        width: REPEAT_ICON_WIDTH,
        height: REPEAT_ICON_HEIGHT
    },
    startButtonContainer: {
        position: 'absolute',
        bottom: BUTTON_START_BOTTOM,
        right: BUTTON_START_RIGHT,
        width: BUTTON_START_WIDTH,
        height: BUTTON_START_HEIGHT,
        resizeMode: 'contain'
    },
    startTextContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        height: BUTTON_START_TEXT_HEIGHT,
        width: BUTTON_START_WIDTH + BUTTON_START_RIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    startText: {
        color: colors.white,
        fontSize: isLWidth ? 23 : (isMWidth ? 21 : 18),
        fontFamily: titleFont.bold,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    bottomFadeEffect: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: FADE_EFFECT_HEIGHT
    },
    scrollViewContentContainer: {
        paddingTop: SCROLLVIEW_TOP,
        paddingBottom: iosHomeIndicatorOffset + 100
    },
    titleContainer: {
        marginBottom: 20,
        paddingLeft: MARGIN_HORIZONTAL,
        paddingRight: TITLE_MARGIN_RIGHT
    },
    titleContainerDone: {
        opacity: DONE_OPACITY
    },
    title: {
        fontSize: isLWidth ? 28 : 25,
        fontFamily: titleFont.black,
        letterSpacing: 0.5,
        color: colors.violetDark,
        textTransform: 'uppercase'
    },
    titleDone: {
        color: DONE_COLOR
    },
    descriptionContainer: {
        marginTop: 10,
        marginRight: TITLE_MARGIN_RIGHT,
        paddingLeft: MARGIN_HORIZONTAL,
        paddingRight: MARGIN_HORIZONTAL,
        paddingVertical: 16,
        backgroundColor: chroma(colors.pink).alpha(0.2).css(),
        borderTopRightRadius: DESCRIPTION_BORDER_RADIUS,
        borderBottomRightRadius: DESCRIPTION_BORDER_RADIUS
    },
    descriptionContainerDone: {
        backgroundColor: chroma(DONE_COLOR).alpha(0.15).css(),
        opacity: DONE_OPACITY
    },
    description: {
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 13 : 12,
        color: chroma(colors.violetDark).alpha(0.75).css()
    },
    descriptionDone: {
        color: DONE_COLOR
    },
    listContainer: {
        marginTop: 50
    },
    circuitIndicatorContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0
    },
    circuitLabelBorder: {
        position: 'absolute',
        top: CIRCUIT_LABEL_TOP,
        bottom: CIRCUIT_LABEL_BOTTOM,
        left: 0,
        width: CIRCUIT_LABEL_BORDER_WIDTH,
        backgroundColor: colors.violetDark,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6
    },
    circuitLabelContainer: {
        position: 'absolute',
        top: CIRCUIT_LABEL_TOP,
        bottom: CIRCUIT_LABEL_BOTTOM,
        left: CIRCUIT_LABEL_BORDER_WIDTH,
        width: CIRCUIT_LABEL_TITLE_WIDTH,
        justifyContent: 'center'
    },
    circuitLabel: {
        color: colors.violetDark,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 12 : 11
    }
});
