import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { viewportWidth, viewportHeight, iosHomeIndicatorOffset, headerHeight, isLWidth, isLHeight, isMWidth } from '../base/metrics.style';
import { titleFont, baseFont } from '../base/fonts.style';
import { TOOLTIP_TOTAL_SIZE } from '../components/Tooltip.style';

const BACKGROUND_SHAPE_RATIO = 400 / 540;
const BACKGROUND_SHAPE_WIDTH = viewportWidth;
const BACKGROUND_SHAPE_HEIGHT = BACKGROUND_SHAPE_WIDTH / BACKGROUND_SHAPE_RATIO;

const LOGO_RATIO = 500 / 390;
const LOGO_WIDTH = Math.round(viewportWidth * 0.7);
const LOGO_HEIGHT = Math.round(LOGO_WIDTH / LOGO_RATIO);

export const BACKGROUND_SHAPE_TOP = Math.round(viewportHeight * 0.55);

const SHAPE_MARGIN_RIGHT = Math.round(BACKGROUND_SHAPE_WIDTH * 0.25);
const WORKOUT_TITLE_MARGIN_RIGHT = SHAPE_MARGIN_RIGHT + 15;

const SUMMARY_CONTAINER_INNER_MARGIN_LEFT = 12;
const SUMMARY_CONTAINER_INNER_MARGIN_BOTTOM = 15;
const SUMMARY_ROW_HEIGHT = 35;

export const COMPLETION_SIZE = isLWidth ? 120 : 100;

const VIEW_BACKGROUND_COLOR = colors.violetLight;

const BORDER_RADIUS = 20;

const STAT_ICON_CONTAINER_SIZE = isLWidth ? 45 : 38;
const STAT_ICON_SIZE = isLWidth ? 25 : 20;

const STARS_IMAGE_RATIO = 383 / 334;
export const STARS_IMAGE_HEIGHT = isLHeight ? 160 : 130;
const STARS_IMAGE_WIDTH = STARS_IMAGE_HEIGHT * STARS_IMAGE_RATIO;

const PADDING_HORIZONTAL = isLWidth ? 26 : 22;

const INFLUENCER_IMAGE_WIDTH = Math.round(viewportWidth * 0.52);
const INFLUENCER_IMAGE_MARGIN_RIGHT = -15;

export const GRADIENT_COLORS = [
    chroma(colors.pink).alpha(0.8).css(),
    chroma(colors.orange).alpha(0.8).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        backgroundColor: VIEW_BACKGROUND_COLOR
    },
    nuliImage: {
        position: 'absolute',
        top: -Math.round(LOGO_HEIGHT * 0.05),
        left: 0,
        width: LOGO_WIDTH,
        aspectRatio: LOGO_RATIO,
        tintColor: colors.white,
        opacity: 0.4
    },
    imageBackground: {
        backgroundColor: VIEW_BACKGROUND_COLOR
    },
    stars: {
        position: 'absolute',
        left: 0,
        height: STARS_IMAGE_HEIGHT,
        width: STARS_IMAGE_WIDTH
    },
    backgroundShape: {
        position: 'absolute',
        top: BACKGROUND_SHAPE_TOP,
        left: 0,
        width: BACKGROUND_SHAPE_WIDTH,
        height: BACKGROUND_SHAPE_HEIGHT
    },
    scrollViewContentContainer: {
        paddingBottom: iosHomeIndicatorOffset + 100
    },
    topContainer: {
        alignItems: 'flex-end',
        paddingTop: isLHeight ? headerHeight + 7 : headerHeight - 15,
        paddingHorizontal: PADDING_HORIZONTAL
    },
    title: {
        paddingBottom: 5,
        fontFamily: titleFont.bold,
        color: colors.white,
        fontSize: isLHeight ? 45 : 35,
        textTransform: 'uppercase'
    },
    subtitle: {
        width: isMWidth ? '60%' : '75%',
        marginBottom: isLHeight ? 30 : 24,
        fontFamily: titleFont.regular,
        color: colors.white,
        fontSize: isLHeight ? 20 : 17,
        textAlign: 'right'
    },
    statContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    statIconContainer: {
        width: STAT_ICON_CONTAINER_SIZE,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderRadius: STAT_ICON_CONTAINER_SIZE / 2,
        backgroundColor: colors.violetDark
    },
    statIcon: {
        width: STAT_ICON_SIZE,
        height: STAT_ICON_SIZE,
        resizeMode: 'contain',
        tintColor: colors.white
    },
    statContainerInner: {
        flexDirection: 'column',
        justifyContent: 'center'
    },
    statLabel: {
        fontSize: isLHeight ? 13 : 12,
        color: colors.white,
        fontFamily: titleFont.light,
        textTransform: 'uppercase'
    },
    statValue: {
        color: colors.white,
        fontFamily: titleFont.bold,
        fontSize: isLHeight ? 30 : 22
    },
    bottomContent: {
        paddingHorizontal: PADDING_HORIZONTAL
    },
    programInfo: {
        flexDirection: 'row',
        marginLeft: 12,
        marginBottom: isLWidth ? 30 : 20
    },
    programInfoInner: {
        flex: 1,
        alignSelf: 'flex-start',
        marginRight: INFLUENCER_IMAGE_WIDTH + INFLUENCER_IMAGE_MARGIN_RIGHT - 20
    },
    programInfoInnerTop: {
        marginLeft: 40,
        marginBottom: 10
    },
    completionContainer: {
        width: COMPLETION_SIZE,
        height: COMPLETION_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: colors.white,
        borderRadius: COMPLETION_SIZE / 2
    },
    completionCircle: {
        position: 'absolute'
    },
    completion: {
        color: colors.violetDark,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 32 : 26
    },
    programInfoInnerBottom: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    verticalTitleContainer: {
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: colors.violetDark
    },
    weekPosition: {
        color: colors.white,
        fontFamily: titleFont.regular,
        fontSize: isLWidth ? 15 : 14,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    programNameContainer: {
        flex: 1
    },
    programName: {
        color: colors.violetDark,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 22 : 19,
        textTransform: 'uppercase'
    },
    influencerPicture: {
        position: 'absolute',
        bottom: -30,
        right: INFLUENCER_IMAGE_MARGIN_RIGHT,
        width: INFLUENCER_IMAGE_WIDTH,
        aspectRatio: 1
    },
    workoutTitle: {
        marginTop: 10,
        marginRight: WORKOUT_TITLE_MARGIN_RIGHT,
        marginBottom: 20,
        fontFamily: titleFont.black,
        color: colors.pinkLight,
        fontSize: isLWidth ? 32 : 26,
        textTransform: 'uppercase'
    },
    workoutTitleLong: {
        marginRight: 0
    },
    summaryContainer: {
        marginBottom: 20
    },
    summaryBorder: {
        position: 'absolute',
        top: SUMMARY_CONTAINER_INNER_MARGIN_BOTTOM,
        right: SUMMARY_CONTAINER_INNER_MARGIN_LEFT,
        bottom: 0,
        left: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.pink,
        borderRadius: BORDER_RADIUS
    },
    summaryColumnContainer: {
        flexDirection: 'row',
        marginLeft: SUMMARY_CONTAINER_INNER_MARGIN_LEFT,
        marginBottom: SUMMARY_CONTAINER_INNER_MARGIN_BOTTOM,
        padding: 20,
        backgroundColor: colors.pinkVeryLight,
        borderRadius: BORDER_RADIUS
    },
    summaryColumn: {
        flexDirection: 'column'
    },
    summaryColumnLeft: {
        flex: 1,
        marginRight: 10
    },
    summaryColumnTitle: {
        marginBottom: 10,
        color: colors.pink,
        fontFamily: baseFont.bold,
        fontSize: 15
    },
    summaryRow: {
        height: SUMMARY_ROW_HEIGHT,
        justifyContent: 'center',
        marginBottom: 5
    },
    exerciseTitle: {
        color: colors.violetDark,
        fontFamily: titleFont.regular
    },
    exerciseBestSet: {
        // Padding vertical is controlled by summaryRow.height
        flex: 1,
        paddingHorizontal: 15,
        borderRadius: SUMMARY_ROW_HEIGHT / 2
    },
    exerciseBestSetValue: {
        textAlign: 'center',
        color: colors.white
    },
    closeButton: {
        width: 250,
        alignSelf: 'center',
        marginTop: 20
    },
    tooltip: {
        position: 'absolute',
        top: 0,
        left: (COMPLETION_SIZE / 2) + (TOOLTIP_TOTAL_SIZE / 2)
    }
});
