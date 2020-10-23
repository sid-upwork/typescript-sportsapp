import { StyleSheet } from 'react-native';
import colors from '../base/colors.style';
import { baseFont } from '../base/fonts.style';
import { viewportWidth, isLWidth } from '../base/metrics.style';
import { DONE_OPACITY, DONE_COLOR, MARGIN_HORIZONTAL } from '../views/WorkoutOverview.style';
import { isAndroid } from '../../utils/os';
import { TOOLTIP_TOTAL_SIZE, TOOLTIP_SIZE_DELTA } from './Tooltip.style';

const CONTENT_CONTAINER_HEIGHT = 120;
const SEPARATOR_CONTAINER_HEIGHT = 30;
const SEPARATOR_IMAGE_RATIO = 26 / 46;
const SEPARATOR_IMAGE_HEIGHT = 20;
const SEPARATOR_IMAGE_WIDTH = Math.round(SEPARATOR_IMAGE_HEIGHT * SEPARATOR_IMAGE_RATIO);
export const ITEM_HEIGHT = CONTENT_CONTAINER_HEIGHT + SEPARATOR_CONTAINER_HEIGHT;
export const ITEM_DONE_OPACITY = DONE_OPACITY;

const RIGHT_CONTENT_WIDTH_PERCENTAGE = isLWidth ? 50 : 46;

const SWITCH_WIDTH = 60;
const SWITCH_HEIGHT = 30;
const SWITCH_WRAPPER_TOP = isAndroid ? - 6 : -12; // Not clickable outside of its wrapper on Android
const SWITCH_WRAPPER_RIGHT = Math.round(viewportWidth * (RIGHT_CONTENT_WIDTH_PERCENTAGE / 100) - SWITCH_WIDTH + (isAndroid ? 8 : 12));

export const ALTERNATIVE_COLOR = colors.orange;

const ICON_SIZE = isLWidth ? 14 : 13;

const STOPWATCH_ICON_RATIO = 30 / 31;
const STOPWATCH_ICON_WIDTH = 15;
const STOPWATCH_ICON_HEIGHT = Math.round(STOPWATCH_ICON_WIDTH / STOPWATCH_ICON_RATIO );

const IMAGE_MARGIN_BOTTOM = isLWidth ? 20 : 15;
const IMAGE_MARGIN_RIGHT = MARGIN_HORIZONTAL;
const IMAGE_BORDER_RADIUS = 15;
const IMAGE_BACKGROUND_COLOR = colors.violetLight;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        height: ITEM_HEIGHT
    },
    contentContainer: {
        flexDirection: 'row',
        height: CONTENT_CONTAINER_HEIGHT
    },
    infos: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    leftContent: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: `${100 - RIGHT_CONTENT_WIDTH_PERCENTAGE}%`,
        paddingHorizontal: MARGIN_HORIZONTAL
    },
    rightContent: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: `${RIGHT_CONTENT_WIDTH_PERCENTAGE}%`
    },
    title: {
        color: colors.violetDark,
        fontFamily: baseFont.bold,
        fontSize: isLWidth ? 16 : 15,
        lineHeight: Math.round((isLWidth ? 16 : 15) * 1.2),
        textTransform: 'uppercase'
    },
    titleAlternative: {
        color: ALTERNATIVE_COLOR
    },
    titleDone: {
        color: DONE_COLOR
    },
    muscles: {
        marginTop: 6,
        color: colors.violetDark,
        fontFamily: baseFont.light,
        fontSize: 12
    },
    musclesAlternative: {
        color: ALTERNATIVE_COLOR
    },
    musclesDone: {
        color: DONE_COLOR
    },
    repsOrSecsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
        marginTop: isLWidth ? 20 : 18,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: colors.violetDark
    },
    repsOrSecsContainerAlternative: {
        backgroundColor: ALTERNATIVE_COLOR
    },
    repsOrSecsContainerDone: {
        backgroundColor: DONE_COLOR
    },
    secsIcon: {
        width: STOPWATCH_ICON_WIDTH,
        height: STOPWATCH_ICON_HEIGHT,
        marginRight: 8
    },
    repsIcon: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        marginRight: 8,
        tintColor: colors.white
    },
    repsIconDone: {
        tintColor: colors.violetDark
    },
    repsOrSecsLabel: {
        color: colors.white,
        fontSize: isLWidth ? 12 : 11,
        fontFamily: baseFont.bold
    },
    repsOrSecsLabelAlternative: {
        color: colors.white
    },
    repsOrSecsLabelDone: {
        color: colors.violetDark
    },
    imageWrapper: {
        flex: 1
    },
    imageContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: IMAGE_BORDER_RADIUS,
        marginBottom: IMAGE_MARGIN_BOTTOM,
        marginRight: IMAGE_MARGIN_RIGHT,
        backgroundColor: IMAGE_BACKGROUND_COLOR
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: IMAGE_BORDER_RADIUS,
        backgroundColor: IMAGE_BACKGROUND_COLOR
    },
    videoPlayerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9
    },
    videoPlayerIconContainer: {
        width: 38,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.white
    },
    videoPlayerIcon: {
        width: 20,
        aspectRatio: 1
    },
    backgroundBorder: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: `${RIGHT_CONTENT_WIDTH_PERCENTAGE}%`,
        zIndex: -1
    },
    backgroundBorderBackground: {
        ...StyleSheet.absoluteFillObject,
        top: Math.round(IMAGE_MARGIN_BOTTOM),
        left: Math.round(IMAGE_MARGIN_RIGHT / 2),
        bottom: 0,
        right: Math.round(IMAGE_MARGIN_RIGHT / 2),
        borderWidth: 1,
        borderRadius: IMAGE_BORDER_RADIUS,
        borderColor: colors.violetDark,
        backgroundColor: 'transparent'
    },
    backgroundBorderBackgroundAlternative: {
        borderColor: ALTERNATIVE_COLOR
    },
    backgroundBorderBackgroundDone: {
        borderColor: DONE_COLOR
    },
    backgroundBorderBackgroundHideTop: { // hide borders behind image when there is opacity
        ...StyleSheet.absoluteFillObject,
        top: 0,
        left: 0,
        bottom: IMAGE_MARGIN_BOTTOM,
        right: IMAGE_MARGIN_RIGHT,
        backgroundColor: IMAGE_BACKGROUND_COLOR,
        borderWidth: 1,
        borderRadius: IMAGE_BORDER_RADIUS,
        borderColor: IMAGE_BACKGROUND_COLOR
    },
    switchWrapper: {
        position: 'absolute',
        top: SWITCH_WRAPPER_TOP,
        right: SWITCH_WRAPPER_RIGHT,
        flexDirection: 'row',
        alignItems: 'center'
    },
    switchContainer: {
        height: SWITCH_HEIGHT,
        width: SWITCH_WIDTH,
        backgroundColor: colors.orange,
        borderRadius: 30
    },
    switchImageContainer: {
        height: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    switchCircle: {
        position: 'absolute',
        left: 7,
        height: 20,
        width: 20,
        borderRadius: 20,
        backgroundColor: colors.white
    },
    switchIconReversed: {
        resizeMode: 'contain',
        width: 16,
        transform: [
            { rotate: '180deg' }
        ]
    },
    switchIcon: {
        resizeMode: 'contain',
        width: 16
    },
    separatorWrapper: {
        flex: 1,
        height: SEPARATOR_CONTAINER_HEIGHT
    },
    separatorContainer: {
        position: 'absolute',
        top: 0,
        //left = halfScreen + imageWidth - separatorWidth
        left: Math.round(viewportWidth / 2 + ((viewportWidth / 2  - IMAGE_MARGIN_RIGHT) / 2) - SEPARATOR_IMAGE_WIDTH / 2),
        width: SEPARATOR_IMAGE_WIDTH,
        height: SEPARATOR_CONTAINER_HEIGHT,
        alignItems: 'center'
    },
    separatorTopLine: {
        position: 'absolute',
        top: 0,
        width: 1,
        height: 5,
        backgroundColor: colors.violetDark
    },
    separatorImageContainer: {
        position: 'absolute',
        top: 5,
        width: SEPARATOR_IMAGE_WIDTH,
        height: SEPARATOR_IMAGE_HEIGHT
    },
    separatorBottomLine: {
        position: 'absolute',
        bottom: 0,
        width: 1,
        height: 5,
        backgroundColor: colors.violetDark
    },
    separatorLineAlternative: {
        backgroundColor: ALTERNATIVE_COLOR
    },
    separatorLineDone: {
        backgroundColor: DONE_COLOR
    },
    alternativeTooltip: {
        position: 'absolute',
        top: SWITCH_WRAPPER_TOP - TOOLTIP_SIZE_DELTA - 2,
        right: SWITCH_WRAPPER_RIGHT - SWITCH_WIDTH + TOOLTIP_TOTAL_SIZE / 2 - 10
    },
    setTooltip: {
        position: 'absolute',
        top: 8,
        left: -15
    }
});
