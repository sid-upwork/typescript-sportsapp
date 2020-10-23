import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { titleFont, baseFont } from '../../base/fonts.style';
import { viewportWidth, isLHeight, isMWidth, isLWidth } from '../../base/metrics.style';
import { SIDEBAR_WIDTH } from '../Sidebar.style';
import { TOOLTIP_SIZE_DELTA } from '../Tooltip.style';

export const GO_BUTTON_LINEAR_GRADIENT = [colors.orange, colors.violetLight];

const MY_PROGRAM_WIDTH = viewportWidth;
export const MY_PROGRAM_LEFT_CONTAINER_WIDTH = 50;

export const TOP_RIGHT_CONTAINER_PADDING_RIGHT = 20;
export const WEEKS_CIRCLE_SIZE = 85;

export const CAROUSEL_HEIGHT = isLHeight ? 360 : 340;
export const ITEM_CONTAINER_MARGIN_RIGHT = 15;
export const ITEM_CONTAINER_WIDTH = Math.round((viewportWidth - MY_PROGRAM_LEFT_CONTAINER_WIDTH) * 0.85);

export const BULLET_CONTAINER_MARGIN_H = isLWidth ? 6 : 5;
const BULLET_SIZE = isLWidth ? 10 : 8;
const BULLET_MARGIN = isLWidth ? 4 : 3;
const BULLET_COLOR = colors.white;

export default StyleSheet.create({
    flex: {
        flex: 1
    },
    container: {
        flexDirection: 'row',
        width: MY_PROGRAM_WIDTH
    },
    loaderContainer: {
        height: 200
    },
    leftContainer: {
        width: MY_PROGRAM_LEFT_CONTAINER_WIDTH
    },
    labelContainer: {
        position: 'absolute',
        height: CAROUSEL_HEIGHT,
        width: MY_PROGRAM_LEFT_CONTAINER_WIDTH
    },
    labelContainerInner: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    labelText: {
        fontFamily: titleFont.bold,
        fontSize: 20,
        color: colors.violetDark,
        textTransform: 'uppercase',
        paddingHorizontal: 4
    },
    rightContainer: {
        flex: 1
    },
    topRightContainer: {
        flexDirection: 'row',
        paddingRight: TOP_RIGHT_CONTAINER_PADDING_RIGHT
    },
    infosContainer: {
        flex: 1
    },
    title: {
        color: colors.violetDark,
        fontFamily: baseFont.regular,
        fontSize: isMWidth ? 18 : 16,
        textTransform: 'capitalize'
    },
    subtitle: {
        marginTop: 4,
        color: colors.violetDark,
        fontFamily: baseFont.light,
        fontSize: 14,
        letterSpacing: 0.75,
        textTransform: 'uppercase'
    },
    manageButtonContainer: {
        flexDirection: 'row'
    },
    manageButton: {
        marginTop: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: colors.violetDark,
        alignSelf: 'flex-start',
        borderRadius: 8,
        elevation: 8
    },
    manageTooltipIOS: {
        position: 'absolute',
        top: -22,
        right: -30
    },
    manageTooltipAndroid: {
        position: 'absolute',
        top: - TOOLTIP_SIZE_DELTA - 6,
        right: -TOOLTIP_SIZE_DELTA - 10
    },
    manageText: {
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: 13,
        letterSpacing: 0.5
    },
    workoutsWrapper: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginLeft: 15
    },
    workoutsContainer: {
        width: WEEKS_CIRCLE_SIZE,
        height: WEEKS_CIRCLE_SIZE,
        borderRadius: WEEKS_CIRCLE_SIZE,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.violetDark,
        alignItems: 'center',
        justifyContent: 'center'
    },
    workoutsContainerDone: {
        backgroundColor: colors.violetDark,
        borderWidth: 0
    },
    workoutsContent: {
        height: Math.round(WEEKS_CIRCLE_SIZE * 0.7),
        width: Math.round(WEEKS_CIRCLE_SIZE * 0.5),
        justifyContent: 'center',
        alignItems: 'center'
    },
    currentWorkout: {
        position: 'absolute',
        top: 0,
        left: 0,
        fontFamily: baseFont.bold,
        fontSize: 24,
        color: colors.violetDark
    },
    currentWeekDone: {
        color: colors.white
    },
    separatorWeek: {
        height: Math.round(WEEKS_CIRCLE_SIZE * 0.5),
        width: 1,
        backgroundColor: colors.violetVeryLight,
        transform: [
            { rotate: '30deg' }
        ]
    },
    separatorWeekDone: {
        backgroundColor: colors.white
    },
    workoutsCount: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        fontFamily: baseFont.bold,
        fontSize: 24,
        color: colors.violetVeryLight
    },
    workoutsCountDone: {
        color: colors.white
    },
    scrollViewContainer: {
        marginTop: 20,
        marginLeft: -MY_PROGRAM_LEFT_CONTAINER_WIDTH
    },
    carouselContainer: {
        height: CAROUSEL_HEIGHT
    },
    scrollViewPlaceholder: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: CAROUSEL_HEIGHT
    },
    scrollViewLeftSpacer: {
        width: MY_PROGRAM_LEFT_CONTAINER_WIDTH
    },
    scrollViewBulletWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        width: SIDEBAR_WIDTH,
        paddingHorizontal: BULLET_CONTAINER_MARGIN_H
    },
    scrollViewBulletWrapperInner: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        flexWrap: 'wrap'
    },
    scrollViewBulletContainer: {
        width: BULLET_SIZE,
        height: BULLET_SIZE,
        margin: BULLET_MARGIN,
        borderWidth: 1,
        borderColor: BULLET_COLOR,
        borderRadius: BULLET_SIZE / 2,
        overflow: 'hidden'
    },
    scrollViewBullet: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: BULLET_COLOR
    },
    errorContainer: {
        position: 'absolute',
        top: Math.round(CAROUSEL_HEIGHT * 0.3),
        marginLeft: MY_PROGRAM_LEFT_CONTAINER_WIDTH + 10,
        width: ITEM_CONTAINER_WIDTH - ITEM_CONTAINER_MARGIN_RIGHT - 20
    }
});
