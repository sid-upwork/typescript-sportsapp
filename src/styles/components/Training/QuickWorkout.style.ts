import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { viewportWidth, isLWidth } from '../../base/metrics.style';
import { titleFont, baseFont } from '../../base/fonts.style';
import { TOOLTIP_TOTAL_SIZE } from '../Tooltip.style';

const BACKGROUND_RATIO = 922 / 725;
const BACKGROUND_WIDTH = Math.round(viewportWidth * 1.15);
const BACKGROUND_HEIGHT = Math.round(BACKGROUND_WIDTH / BACKGROUND_RATIO);

export const CONTAINER_HEIGHT = Math.round(BACKGROUND_HEIGHT * 0.92);

export const LINEAR_GRADIENT_GO_BUTTON = [colors.blueDark, colors.blueLight];

const IMAGE_BORDER_RADIUS = 30;
const TOP_LEFT_PADDING_BOTTOM = 10;

export const QUICK_WORKOUT_RIGHT_CONTAINER_WIDTH = 60;
const QUICK_WORKOUT_LEFT_CONTAINER_WIDTH = Math.round((viewportWidth - QUICK_WORKOUT_RIGHT_CONTAINER_WIDTH) * 0.8);
const QUICK_WORKOUT_IMAGE_HEIGHT = 165;

const STOPWATCH_ICON_RATIO = 30 / 31;
const STOPWATCH_ICON_WIDTH = 20;
const STOPWATCH_ICON_HEIGHT = Math.round(STOPWATCH_ICON_WIDTH / STOPWATCH_ICON_RATIO );

const CHECKMARK_ICON_RATIO = 59 / 42;
const CHECKMARK_ICON_WIDTH = 20;
const CHECKMARK_ICON_HEIGHT = Math.round(CHECKMARK_ICON_WIDTH / CHECKMARK_ICON_RATIO );

const GO_BUTTON_SIZE = isLWidth ? 70 : 64;
const GO_BUTTON_TOP_POSITION = QUICK_WORKOUT_IMAGE_HEIGHT - Math.round(GO_BUTTON_SIZE / 3 * 2);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        height: CONTAINER_HEIGHT,
        overflow: 'visible'
    },
    containerPlaceholder: {
        position: 'absolute',
        right: 0,
        flexDirection: 'row',
        height: CONTAINER_HEIGHT,
        overflow: 'visible'
    },
    rightContainer: {
        width: QUICK_WORKOUT_RIGHT_CONTAINER_WIDTH
    },
    sectionTitle: {
        color: colors.white
    },
    backgroundBlob: {
        position: 'absolute',
        top: -Math.round(BACKGROUND_HEIGHT * 0.075),
        left: -Math.round(BACKGROUND_WIDTH * 0.25),
        width: BACKGROUND_WIDTH,
        height: BACKGROUND_HEIGHT
    },
    leftContainer: {
        width: QUICK_WORKOUT_LEFT_CONTAINER_WIDTH
    },
    topLeftContainer: {
        width: QUICK_WORKOUT_LEFT_CONTAINER_WIDTH,
        paddingBottom: TOP_LEFT_PADDING_BOTTOM
    },
    imageWrapper: {
        height: QUICK_WORKOUT_IMAGE_HEIGHT,
        borderRadius: IMAGE_BORDER_RADIUS
    },
    imageWrapperPlaceholder: {
        backgroundColor: colors.violetLight,
        borderRadius: IMAGE_BORDER_RADIUS
    },
    imageShadow: {
        borderRadius: IMAGE_BORDER_RADIUS
    },
    imageContainer: {
        height: QUICK_WORKOUT_IMAGE_HEIGHT,
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
        bottom: QUICK_WORKOUT_IMAGE_HEIGHT - GO_BUTTON_TOP_POSITION,
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
        top: GO_BUTTON_TOP_POSITION,
        right: 20,
        height: GO_BUTTON_SIZE,
        width: GO_BUTTON_SIZE,
        borderRadius: GO_BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 10
    },
    goButtonContainerPlaceholder: {
        elevation: undefined
    },
    goShadow: {
        borderRadius: GO_BUTTON_SIZE / 2
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
    bottomLeftContainer: {
        marginTop: -TOP_LEFT_PADDING_BOTTOM / 2
    },
    infosContainer: {
        width: Math.round(BACKGROUND_WIDTH * 0.5)
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 20,
        borderColor: colors.white,
        paddingVertical: 5,
        paddingHorizontal: 15,
        marginVertical: 6
    },
    timeIcon: {
        width: STOPWATCH_ICON_WIDTH,
        height: STOPWATCH_ICON_HEIGHT,
        marginRight: 15,
        tintColor: colors.white
    },
    time: {
        fontFamily: baseFont.bold,
        fontSize: 18,
        color: colors.white
    },
    title: {
        marginTop: 5,
        fontFamily: titleFont.bold,
        fontSize: 18,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: colors.white
    },
    description: {
        fontFamily: baseFont.regular,
        fontSize: 12,
        letterSpacing: 1,
        color: colors.white,
        paddingTop: 10
    },
    errorContainer: {
        position: 'absolute',
        top: QUICK_WORKOUT_IMAGE_HEIGHT + GO_BUTTON_SIZE / 2,
        right: QUICK_WORKOUT_RIGHT_CONTAINER_WIDTH,
        width: QUICK_WORKOUT_LEFT_CONTAINER_WIDTH
    },
    tooltip: {
        position: 'absolute',
        top: 5,
        right: QUICK_WORKOUT_LEFT_CONTAINER_WIDTH + QUICK_WORKOUT_RIGHT_CONTAINER_WIDTH - TOOLTIP_TOTAL_SIZE / 2
    }
});
