import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import chroma from 'chroma-js';
import { titleFont, baseFont } from '../../base/fonts.style';
import { viewportWidth, isLWidth } from '../../base/metrics.style';
import { SIDEBAR_WIDTH } from '../Sidebar.style';
import { TOOLTIP_TOTAL_SIZE } from '../Tooltip.style';

export const CONTAINER_HEIGHT = 380;
export const LINEAR_GRADIENT_GO_BUTTON = [colors.orange, colors.violetLight];

const START_BUTTON_SIZE = isLWidth ? 70 : 64;
const TOP_CONTAINER_PADDING_BOTTOM = Math.round(START_BUTTON_SIZE / 3);
const CONTENT_CONTAINER_MARGIN_LEFT = Math.round(viewportWidth * 0.10);
const IMAGE_BORDER_RADIUS = 30;
export const WEEKLY_CHALLENGE_TITLE_CONTAINER_WIDTH = 75;
export const WEEKLY_CHALLENGE_IMAGE_HEIGHT = 200;

const IMAGE_WRAPPER_MARGIN_RIGHT = 20;
const IMAGE_WRAPPER_WIDTH = viewportWidth - CONTENT_CONTAINER_MARGIN_LEFT - WEEKLY_CHALLENGE_TITLE_CONTAINER_WIDTH - IMAGE_WRAPPER_MARGIN_RIGHT;

const CHECKMARK_ICON_RATIO = 59 / 42;
const CHECKMARK_ICON_WIDTH = 20;
const CHECKMARK_ICON_HEIGHT = Math.round(CHECKMARK_ICON_WIDTH / CHECKMARK_ICON_RATIO );

const STOPWATCH_ICON_RATIO = 30 / 31;
const STOPWATCH_ICON_WIDTH = 20;
const STOPWATCH_ICON_HEIGHT = Math.round(STOPWATCH_ICON_WIDTH / STOPWATCH_ICON_RATIO );

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        height: CONTAINER_HEIGHT
    },
    containerPlaceholder: {
        position: 'absolute'
    },
    labelContainer: {
        justifyContent: 'center',
        paddingRight: SIDEBAR_WIDTH + 15,
        paddingLeft: 20
    },
    labelTextFirst: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 25 : 23,
        textTransform: 'uppercase',
        color: colors.violetDark
    },
    labelTextSecond: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 22 : 20,
        textTransform: 'uppercase',
        color: colors.violetDark
    },
    tooltip: {
        position: 'absolute',
        top: -TOOLTIP_TOTAL_SIZE / 2,
        right: SIDEBAR_WIDTH - (TOOLTIP_TOTAL_SIZE / 2)
    },
    contentContainer: {
        marginLeft: CONTENT_CONTAINER_MARGIN_LEFT,
        paddingTop: 20
    },
    topContainer: {
        flexDirection: 'row'
    },
    topContainerInner: {
        marginRight: IMAGE_WRAPPER_MARGIN_RIGHT,
        paddingBottom: TOP_CONTAINER_PADDING_BOTTOM
    },
    titleContainer: {
        flex: 1
    },
    title: {
        fontFamily: titleFont.bold,
        fontSize: 20,
        color: colors.violetDark,
        textTransform: 'uppercase',
        paddingHorizontal: 4,
        textAlign: 'left'
    },
    imageWrapper: {
        width: IMAGE_WRAPPER_WIDTH,
        height: WEEKLY_CHALLENGE_IMAGE_HEIGHT,
        marginLeft: WEEKLY_CHALLENGE_TITLE_CONTAINER_WIDTH,
        borderRadius: IMAGE_BORDER_RADIUS
    },
    imageShadow: {
        borderRadius: IMAGE_BORDER_RADIUS
    },
    imageContainer: {
        flex: 1,
        backgroundColor: colors.violetLight,
        borderRadius: IMAGE_BORDER_RADIUS
    },
    imageContainerOverlayDone: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: chroma(colors.violetDark).alpha(0.4).css(),
        borderRadius: IMAGE_BORDER_RADIUS
    },
    checkIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.orange,
        height: 40,
        width: 40,
        borderRadius: 20,
        marginBottom: 10
    },
    checkIconContainerDone: {
        backgroundColor: colors.orange
    },
    checkIcon: {
        width: CHECKMARK_ICON_WIDTH,
        height: CHECKMARK_ICON_HEIGHT
    },
    completedTextContainer: {
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    completedText: {
        fontFamily: titleFont.bold,
        fontSize: 15,
        letterSpacing: 1,
        color: colors.white,
        textTransform: 'uppercase'
    },
    goButtonContainer: {
        position: 'absolute',
        bottom: 0,
        right: 20,
        height: START_BUTTON_SIZE,
        width: START_BUTTON_SIZE,
        borderRadius: START_BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 10
    },
    goButtonContainerPlaceholder: {
        elevation: undefined
    },
    goGradient: {
        ...StyleSheet.absoluteFillObject
    },
    goShadow: {
        borderRadius: START_BUTTON_SIZE / 2
    },
    goButtonText: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 25 : 23,
        letterSpacing: isLWidth ? 1 : 0.5,
        color: colors.white,
        textTransform: 'uppercase'
    },
    goButtonTextDone: {
        fontSize: 15
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10
    },
    bottomContainer: {
        marginTop: -TOP_CONTAINER_PADDING_BOTTOM,
        marginRight: SIDEBAR_WIDTH + 10,
        paddingTop: 10
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 20,
        borderColor: colors.violetDark,
        paddingVertical: 2,
        paddingHorizontal: 15
    },
    timeIcon: {
        width: STOPWATCH_ICON_WIDTH,
        height: STOPWATCH_ICON_HEIGHT,
        marginRight: 15,
        tintColor: colors.violetDark
    },
    time: {
        fontFamily: baseFont.bold,
        fontSize: 18,
        color: colors.violetDark
    },
    description: {
        fontFamily: baseFont.regular,
        fontSize: 12,
        letterSpacing: 1,
        color: colors.violetDark,
        paddingTop: 10
    },
    placeholderFullWidth: {
        backgroundColor: colors.violetVeryLight,
        width: '100%',
        height: 20,
        marginVertical: 2,
        alignSelf: 'flex-start'
    },
    placeholderHalfWidth: {
        backgroundColor: colors.violetVeryLight,
        width: '50%',
        height: 20,
        marginVertical: 2,
        alignSelf: 'flex-start'
    },
    imagePlaceholder: {
        flex: 1,
        backgroundColor: colors.violetLight,
        borderRadius: IMAGE_BORDER_RADIUS
    },
    errorContainer: {
        ...StyleSheet.absoluteFillObject
    },
    errorMessage: {
        marginTop: 40,
        marginHorizontal: 10
    }
});
