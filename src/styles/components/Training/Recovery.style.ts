import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { viewportWidth, isLWidth, isMHeight, isSWidth } from '../../base/metrics.style';
import { titleFont, baseFont } from '../../base/fonts.style';
import { SIDEBAR_WIDTH } from '../Sidebar.style';
import { TOOLTIP_TOTAL_SIZE } from '../Tooltip.style';

export const CONTAINER_HEIGHT = isMHeight ? 490 : 420;

const BACKGROUND_RATIO = 781 / 552;
const BACKGROUND_WIDTH = Math.round(viewportWidth * 1.15);
const BACKGROUND_HEIGHT = Math.round(BACKGROUND_WIDTH / BACKGROUND_RATIO);

export const RECOVERY_RIGHT_CONTAINER_WIDTH = 60;

export const RECOVERY_ITEM_WIDTH = viewportWidth;

const IMAGE_MARGIN_LEFT = isSWidth ? 20 : 12;
const IMAGE_MARGIN_RIGHT = isSWidth ? 20 : 12;
const IMAGE_RATIO = 1 / 1;
const IMAGE_WIDTH = viewportWidth - RECOVERY_RIGHT_CONTAINER_WIDTH - IMAGE_MARGIN_LEFT - IMAGE_MARGIN_RIGHT;
const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH / IMAGE_RATIO);

const GO_BUTTON_SIZE = isLWidth ? 70 : 64;
const DESCRIPTION_CONTAINER_MARGIN_LEFT = IMAGE_MARGIN_LEFT;
const DESCRIPTION_CONTAINER_MARGIN_RIGHT = SIDEBAR_WIDTH + (GO_BUTTON_SIZE / 2) + 10;
const BACKGROUND_CONTAINER_PADDING_TOP = Math.max(Math.round(IMAGE_HEIGHT * 0.2), 80);
// const SCROLLVIEW_BULLET_CONTAINER_MAX_WIDTH = Math.round(SIDEBAR_WIDTH * 0.7);
// const SCROLLVIEW_BULLET_CONTAINER_RIGHT = Math.round(SIDEBAR_WIDTH - SCROLLVIEW_BULLET_CONTAINER_MAX_WIDTH);

const TEXT_SIZE = 28;
const TEXT_COLOR = colors.white;

const WORKOUT_COUNT_HEIGHT = Math.round(TEXT_SIZE * 1.5);
const WORKOUT_COUNT_WIDTH = Math.round(TEXT_SIZE * 2.25);

const DESCRIPTION_TITLE_FONT_SIZE = isLWidth ? 18 : 17;
const DESCRIPTION_BACKGROUND_HEIGHT = 80;

export default StyleSheet.create({
    container: {
        minHeight: CONTAINER_HEIGHT
    },
    backgroundContainer: {
        position: 'absolute',
        paddingTop: BACKGROUND_CONTAINER_PADDING_TOP
    },
    backgroundBlob: {
        width: BACKGROUND_WIDTH,
        height: BACKGROUND_HEIGHT,
        right: Math.round(viewportWidth * 0.3)
    },
    topEllipsisContainer: {
        position: 'absolute',
        top: 30,
        width: viewportWidth - SIDEBAR_WIDTH,
        alignItems: 'center'
    },
    bottomEllipsisContainer: {
        position: 'absolute',
        bottom: Math.round(BACKGROUND_HEIGHT * 0.16),
        left: Math.round(viewportWidth * 0.05)
    },
    ellipsisText: {
        lineHeight: 16
    },
    rightContainer: {
        position: 'absolute',
        top: 30,
        right: 0,
        width: RECOVERY_RIGHT_CONTAINER_WIDTH
    },
    sectionTitle: {
        color: colors.white
    },
    scrollViewContainer: {
        flex: 1
    },
    scrollViewItem: {
        flex: 1,
        width: RECOVERY_ITEM_WIDTH
    },
    imageContainer: {
        width: IMAGE_WIDTH,
        aspectRatio: IMAGE_RATIO,
        marginLeft: IMAGE_MARGIN_LEFT
    },
    descriptionBackground: {
        backgroundColor: colors.background,
        position: 'absolute',
        left: DESCRIPTION_CONTAINER_MARGIN_LEFT,
        right: DESCRIPTION_CONTAINER_MARGIN_RIGHT,
        bottom: WORKOUT_COUNT_HEIGHT,
        height: DESCRIPTION_BACKGROUND_HEIGHT
    },
    descriptionContainer: {
        position: 'absolute',
        bottom: WORKOUT_COUNT_HEIGHT + 10,
        marginLeft: DESCRIPTION_CONTAINER_MARGIN_LEFT,
        marginRight: DESCRIPTION_CONTAINER_MARGIN_RIGHT
    },
    goButtonContainer: {
        position: 'absolute',
        bottom: Math.round(BACKGROUND_WIDTH * 0.15),
        right: SIDEBAR_WIDTH - GO_BUTTON_SIZE / 2,
        height: GO_BUTTON_SIZE,
        width: GO_BUTTON_SIZE,
        borderRadius: GO_BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 10
    },
    goGradient: {
        ...StyleSheet.absoluteFillObject
    },
    goButtonText: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 25 : 23,
        letterSpacing: isLWidth ? 1 : 0.5,
        color: colors.white,
        textTransform: 'uppercase'
    },
    title: {
        fontFamily: titleFont.bold,
        fontSize: DESCRIPTION_TITLE_FONT_SIZE,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: colors.violetDark
    },
    description: {
        fontFamily: baseFont.regular,
        fontSize: 12,
        letterSpacing: 1,
        color: colors.violetDark,
        paddingVertical: 5
    },
    workoutsCountContainer: {
        position: 'absolute',
        bottom: 0,
        right: 15,
        width: WORKOUT_COUNT_WIDTH,
        height: WORKOUT_COUNT_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center'
    },
    currentWorkoutContainer: {
        position: 'absolute',
        top: -Math.round(TEXT_SIZE * 0.25),
        left: 0
    },
    currentWorkoutText: {
        color: TEXT_COLOR,
        fontFamily: baseFont.bold,
        fontSize: TEXT_SIZE
    },
    separatorWorkout: {
        height: 30,
        width: 1,
        marginLeft: TEXT_SIZE / 2,
        backgroundColor: chroma(TEXT_COLOR).alpha(0.35).css(),
        transform: [
            { rotate: '30deg' }
        ]
    },
    workoutsCount: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        color: chroma(TEXT_COLOR).alpha(0.75).css(),
        fontFamily: baseFont.light,
        fontSize: isLWidth ? 18 : 16,
        textAlign: 'right'
    },
    placeholderContainer: {
        height: IMAGE_HEIGHT + 150,
        width: viewportWidth
    },
    errorContainer: {
        position: 'absolute',
        top: 125,
        left: 20,
        right: RECOVERY_RIGHT_CONTAINER_WIDTH
    },
    tooltip: {
        position: 'absolute',
        top: -TOOLTIP_TOTAL_SIZE / 2,
        right: RECOVERY_RIGHT_CONTAINER_WIDTH / 2 - TOOLTIP_TOTAL_SIZE / 2
    }
});
