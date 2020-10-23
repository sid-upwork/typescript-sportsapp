import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { viewportHeight, viewportWidth, statusBarOffset, isLWidth, isLHeight, isAndroidNotch } from '../../base/metrics.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { CIRCUIT_LABEL_TITLE_WIDTH } from '../../views/WorkoutOverview.style';
import { CONTAINER_HEIGHT, CONTAINER_WIDTH, BUTTON_OFFSET_RIGHT } from './WorkoutTimer.style';
import { TOOLTIP_TOTAL_SIZE } from '../Tooltip.style';

const VIEWPORT_HYPOTENUSE = Math.sqrt((viewportWidth * viewportWidth) + (viewportHeight * viewportHeight));
const CIRCLE_SIZE = Math.ceil(VIEWPORT_HYPOTENUSE * 2);

const TOP_GRADIENT_HEIGHT = statusBarOffset + 25;

const BACKGROUND_SHAPE_RATIO = 240 / 812;
const BACKGROUND_SHAPE_HEIGHT = Math.round(viewportHeight * (isAndroidNotch ? 1.4 : 1.05));
const BACKGROUND_SHAPE_WIDTH = BACKGROUND_SHAPE_HEIGHT * BACKGROUND_SHAPE_RATIO;

const BLOB_RATIO = 218 / 280;
const BLOB_WIDTH = Math.round(viewportWidth * (isLHeight ? 0.52 : 0.43));
const BLOB_HEIGHT = Math.round(BLOB_WIDTH / BLOB_RATIO);

export const TOP_GRADIENT_COLORS = [
    chroma(colors.violetLight).alpha(1),
    chroma(colors.violetLight).alpha(0)
];

const CONTENT_PADDING_TOP = statusBarOffset + Math.round(viewportHeight * (isLHeight ? 0.05 : 0.025));

const TITLE_SIZE = isLHeight ? 124 : 95;
const TITLE_SIZE_LINE_HEIGHT = Math.round(TITLE_SIZE * 1.2); // Chinese's line height FTW

const TEXT_COLOR = colors.violetDark;

export const TIMER_CONTAINER_MINIMIZED_SCALE = 0.25;

const TIMER_TEXT_SIZE = isLHeight ? 80 : 65;
const TIMER_TEXT_LINE_HEIGHT = Math.round(TIMER_TEXT_SIZE * 1.1);
const TIMER_TEXT_WIDTH = Math.round(TIMER_TEXT_SIZE * 0.6);
const TIMER_DOT_SIZE = Math.round(TIMER_TEXT_SIZE / 8);
const TIMER_DOT_MARGIN_H = Math.round(TIMER_DOT_SIZE * 0.4);
const TIMER_MARGIN_TOP = Math.round(BLOB_HEIGHT * (isLHeight ? 0.15 : 0.1));
const TIMER_BACKGROUND_PADDING_H = 9 / TIMER_CONTAINER_MINIMIZED_SCALE;
const TIMER_BACKGROUND_PADDING_V = 7 / TIMER_CONTAINER_MINIMIZED_SCALE;
const TIMER_BACKGROUND_BORDER_MARGIN = 5 / TIMER_CONTAINER_MINIMIZED_SCALE;
const TIMER_BACKGROUND_BORDER_WIDTH = StyleSheet.hairlineWidth / TIMER_CONTAINER_MINIMIZED_SCALE;
const TIMER_BACKGROUND_BORDER_RADIUS = 14;
const TIMER_BACKGROUND_COLOR = colors.blueVeryLight;

const TIMER_CONTAINER_HEIGHT = TIMER_TEXT_SIZE + TIMER_BACKGROUND_PADDING_V * 2;
const TIMER_CONTAINER_TOP = CONTENT_PADDING_TOP + TITLE_SIZE_LINE_HEIGHT + TIMER_MARGIN_TOP -
    (TIMER_TEXT_LINE_HEIGHT - TIMER_TEXT_SIZE) - TIMER_BACKGROUND_PADDING_V;

const TIMER_PLACEHOLDER_WIDTH = TIMER_TEXT_WIDTH * 4 + TIMER_DOT_SIZE + TIMER_DOT_MARGIN_H * 2;

// Calculate translations for minimized position
const CENTER_X_INITIAL = viewportWidth / 2;
const CENTER_X_MINIMIZED = viewportWidth - ((viewportWidth - CONTAINER_WIDTH - BUTTON_OFFSET_RIGHT) / 2);
const CENTER_Y_INITIAL = TIMER_CONTAINER_TOP + TIMER_CONTAINER_HEIGHT / 2;
const CENTER_Y_MINIMIZED = statusBarOffset + ((CONTAINER_HEIGHT - statusBarOffset) / 2);
export const TIMER_CONTAINER_TRANSLATE_X = CENTER_X_MINIMIZED - CENTER_X_INITIAL;
export const TIMER_CONTAINER_TRANSLATE_Y = CENTER_Y_MINIMIZED - CENTER_Y_INITIAL;

export const NEXT_CIRCUIT_WIDTH = 40;

const NEXT_IMAGE_RATIO = 16 / 9;
export const NEXT_IMAGE_HEIGHT = isLHeight ? 160 : 120;
const NEXT_IMAGE_WIDTH = Math.min(NEXT_IMAGE_HEIGHT * NEXT_IMAGE_RATIO, viewportWidth - NEXT_CIRCUIT_WIDTH * 2);
const NEXT_IMAGE_BORDER_RADIUS = 15;

const BUTTON_NEXT_SHAPE_RATIO = 188 / 117;
const BUTTON_NEXT_SHAPE_WIDTH = 188;
const BUTTON_NEXT_SHAPE_HEIGHT = Math.round(BUTTON_NEXT_SHAPE_WIDTH / BUTTON_NEXT_SHAPE_RATIO);
const BUTTON_NEXT_ANIMATION_DELTA = 20;
const BUTTON_NEXT_WIDTH = BUTTON_NEXT_SHAPE_WIDTH - BUTTON_NEXT_ANIMATION_DELTA;
export const BUTTON_NEXT_HEIGHT = BUTTON_NEXT_SHAPE_HEIGHT - BUTTON_NEXT_ANIMATION_DELTA;
const BUTTON_NEXT_MARGIN_RIGHT = -Math.round(BUTTON_NEXT_WIDTH * 0.2);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    flexContainer: {
        flex: 1
    },
    circleContainer: {
        position: 'absolute',
        top: 0,
        bottom: -viewportHeight,
        left: -viewportWidth,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    circleContainerInner: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    circle: {
        width: CIRCLE_SIZE,
        aspectRatio: 1,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: colors.white
    },
    circleColored: {
        backgroundColor: colors.violetLight
    },
    topGradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: TOP_GRADIENT_HEIGHT
    },
    backgroundShape: {
        position: 'absolute',
        top: isAndroidNotch ? -Math.round(BACKGROUND_SHAPE_HEIGHT * 0.1) : 0,
        left: -Math.round(BACKGROUND_SHAPE_WIDTH * 0.04), // To prevent backgroung flash during spring animation
        width: BACKGROUND_SHAPE_WIDTH,
        height: BACKGROUND_SHAPE_HEIGHT
    },
    contentContainer: {
        paddingTop: CONTENT_PADDING_TOP
    },
    titleContainer: {
        flexDirection: 'row-reverse', // zIndex hack because the zIndex prop itself is plain buggy
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible'
    },
    titleTextContainer: {
    },
    title: {
        color: TEXT_COLOR,
        fontFamily: titleFont.bold,
        fontSize: TITLE_SIZE,
        lineHeight: TITLE_SIZE_LINE_HEIGHT,
        letterSpacing: 4,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    titleShapeContainer: {
        position: 'absolute',
        top: TITLE_SIZE / 2,
        left: -Math.round(viewportWidth * 0.15),
        width: viewportWidth,
        height: viewportWidth,
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    titleShape: {
        width: BLOB_WIDTH,
        height: BLOB_HEIGHT
    },
    timerContainer: {
        position: 'absolute',
        top: TIMER_CONTAINER_TOP,
        right: 0,
        left: 0,
        height: TIMER_CONTAINER_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center'
    },
    timerContainerInner: {
        paddingHorizontal: TIMER_BACKGROUND_PADDING_H,
        paddingVertical: TIMER_BACKGROUND_PADDING_V
    },
    timerBackground: {
        backgroundColor: chroma(TIMER_BACKGROUND_COLOR).alpha(0.9).css(),
        borderRadius: TIMER_BACKGROUND_BORDER_RADIUS
    },
    timerBackgroundBorder: {
        position: 'absolute',
        top: -TIMER_BACKGROUND_BORDER_MARGIN,
        bottom: -TIMER_BACKGROUND_BORDER_MARGIN,
        left: -TIMER_BACKGROUND_BORDER_MARGIN,
        right: -TIMER_BACKGROUND_BORDER_MARGIN,
        borderColor: chroma(TIMER_BACKGROUND_COLOR).alpha(0.75).css(),
        borderRadius: TIMER_BACKGROUND_BORDER_RADIUS + TIMER_BACKGROUND_BORDER_MARGIN / 2,
        borderWidth: TIMER_BACKGROUND_BORDER_WIDTH
    },
    timerLabel: {
        width: TIMER_TEXT_WIDTH,
        color: TEXT_COLOR,
        fontFamily: titleFont.bold,
        fontSize: TIMER_TEXT_SIZE,
        letterSpacing: 3,
        lineHeight: TIMER_TEXT_LINE_HEIGHT, // Make it visually centered
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    timerDots: {
        width: TIMER_DOT_SIZE,
        aspectRatio: 1,
        marginVertical: Math.round(TIMER_DOT_SIZE * 0.3),
        marginHorizontal: TIMER_DOT_MARGIN_H,
        borderRadius: TIMER_DOT_SIZE / 2,
        backgroundColor: TEXT_COLOR
    },
    timerButtonsContainer: {
        marginTop: TIMER_MARGIN_TOP,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    timerPlaceholder: {
        height: (TIMER_TEXT_SIZE + TIMER_TEXT_LINE_HEIGHT) / 2, // RN, funny you!
        width: TIMER_PLACEHOLDER_WIDTH
    },
    timerButtonTopPart: {
        height: TIMER_TEXT_SIZE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    timerButtonPlusMinus: {
        color: TEXT_COLOR,
        fontFamily: titleFont.light,
        fontSize: Math.round(TIMER_TEXT_SIZE * 0.95),
        lineHeight: Math.round(Math.round(TIMER_TEXT_SIZE * 0.95) * 1.1), // Make it visually centered
        textAlign: 'center'
    },
    timerButtonDuration: {
        marginTop: -Math.round(TIMER_TEXT_SIZE * 0.2),
        color: chroma(TEXT_COLOR).alpha(0.4).css(),
        fontFamily: baseFont.bold,
        fontSize: Math.round(TIMER_TEXT_SIZE * 0.45),
        textAlign: 'center'
    },
    nextExerciseContainer: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: BUTTON_NEXT_HEIGHT + 20,
        paddingHorizontal: 30
    },
    nextExerciseTextContainer: {
        alignItems: 'center'
    },
    nextExerciseTitle: {
        color: TEXT_COLOR,
        fontFamily: titleFont.bold,
        fontSize: isLHeight ? 28 : 22,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    nextExerciseTarget: {
        color: TEXT_COLOR,
        fontFamily: baseFont.regular,
        fontSize: isLHeight ? 14 : 13,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    nextExerciseImageWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        paddingRight: CIRCUIT_LABEL_TITLE_WIDTH * 2
    },
    nextExerciseImageContainer: {
        width: NEXT_IMAGE_WIDTH,
        height: NEXT_IMAGE_HEIGHT
    },
    nextExerciseImage: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: NEXT_IMAGE_BORDER_RADIUS,
        backgroundColor: colors.violetDark
    },
    nextExerciseImageOverlay: {
        backgroundColor: chroma(colors.violetDark).alpha(0.35).css()
    },
    nextExerciseCircuitType: {
        color: TEXT_COLOR,
        fontFamily: baseFont.regular,
        fontSize: 14,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    buttonNextContainer: {
        position: 'absolute',
        bottom: -BUTTON_NEXT_ANIMATION_DELTA,
        right: -BUTTON_NEXT_ANIMATION_DELTA + BUTTON_NEXT_MARGIN_RIGHT,
        width: BUTTON_NEXT_SHAPE_WIDTH,
        height: BUTTON_NEXT_SHAPE_HEIGHT,
        paddingBottom: BUTTON_NEXT_ANIMATION_DELTA,
        paddingRight: BUTTON_NEXT_ANIMATION_DELTA - (BUTTON_NEXT_MARGIN_RIGHT / 2)
    },
    buttonNextShape: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: BUTTON_NEXT_SHAPE_WIDTH,
        height: BUTTON_NEXT_SHAPE_HEIGHT
    },
    buttonNext: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15
    },
    buttonNextLabel: {
        color: colors.white,
        fontSize: isLWidth ? 24 : 22,
        fontFamily: titleFont.bold,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    buttonMinimizeContainer: {
        right: -BUTTON_NEXT_ANIMATION_DELTA * 2 + BUTTON_NEXT_MARGIN_RIGHT + BUTTON_NEXT_WIDTH
    },
    // Android -> No touch event if there's an intermediate container without a properly defined size...
    tooltipContainer: {
        position: 'absolute',
        top: TIMER_CONTAINER_TOP + (TOOLTIP_TOTAL_SIZE / 2),
        right: ((viewportWidth - TIMER_PLACEHOLDER_WIDTH) / 2) - (TOOLTIP_TOTAL_SIZE / 2),
        width: TOOLTIP_TOTAL_SIZE,
        height: TOOLTIP_TOTAL_SIZE
    }
});
