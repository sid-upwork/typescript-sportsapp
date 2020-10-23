import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { viewportWidth, iosHomeIndicatorOffset, viewportHeight, isMHeight } from '../base/metrics.style';
import colors from '../base/colors.style';
import { SIDEBAR_WIDTH, SIDEBAR_IMAGE_TOP, SIDEBAR_IMAGE_HEIGHT } from '../components/Sidebar.style';
import { CAROUSEL_HEIGHT, WEEKS_CIRCLE_SIZE } from '../components/Training/MyProgram.style';
import { CONTAINER_HEIGHT as QUICK_WORKOUT_HEIGHT } from '../components/Training/QuickWorkout.style';
import { CONTAINER_HEIGHT as WEEKLY_CHALLENGE_HEIGHT } from '../components/Training/WeeklyChallenge.style';
import { CONTAINER_HEIGHT as RECOVERY_HEIGHT } from '../components/Training/Recovery.style';

const TOP_CONTENT_CONTAINER_MARGIN_TOP = SIDEBAR_IMAGE_TOP + Math.round(SIDEBAR_IMAGE_HEIGHT * 0.17);

const BACKGROUND_FIRST_RATIO = 1031 / 943;
const BACKGROUND_FIRST_WIDTH = Math.round(viewportWidth * 1.1);
export const BACKGROUND_FIRST_HEIGHT = Math.round(BACKGROUND_FIRST_WIDTH * BACKGROUND_FIRST_RATIO);
const BACKGROUND_FIRST_TOP = 100;
const BACKGROUND_CIRCLE_SIZE = Math.round(viewportWidth * 0.75);

const IMAGE_FIRST_RATIO = 1;
const IMAGE_FIRST_TOP = Math.round(BACKGROUND_FIRST_TOP * 0.8);
const IMAGE_FIRST_HEIGHT = Math.round(BACKGROUND_FIRST_HEIGHT * 0.6);

const BACKGROUND_LINE_RATIO = 484 / 3010;
export const BACKGROUND_LINE_HEIGHT = 1500;
const BACKGROUND_LINE_WIDTH = Math.round(BACKGROUND_LINE_HEIGHT * BACKGROUND_LINE_RATIO);
const BACKGROUND_LINE_LEFT = -20;
export const BACKGROUND_LINE_TOP = 1280;
export const BACKGROUND_LINE_COVER_HEIGHT = 250;

const TOP_CONTENT_HEIGHT = TOP_CONTENT_CONTAINER_MARGIN_TOP + IMAGE_FIRST_TOP + IMAGE_FIRST_HEIGHT;
const MY_PROGRAM_HEIGHT = CAROUSEL_HEIGHT + WEEKS_CIRCLE_SIZE;
export const SCROLL_THRESHOLD_RECOVERY =
    TOP_CONTENT_HEIGHT +
    MY_PROGRAM_HEIGHT +
    100 + // MyProgram delta
    QUICK_WORKOUT_HEIGHT +
    80 + // QuickWorkout delta
    WEEKLY_CHALLENGE_HEIGHT - // Recovery component begins to appear
    viewportHeight +
    Math.round(RECOVERY_HEIGHT * 0.5) ; // scroll_threshold when we can see ±50% of the component

export default StyleSheet.create({
    absoluteFill: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    topContentContainer: {
        marginTop: TOP_CONTENT_CONTAINER_MARGIN_TOP
    },
    circleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: BACKGROUND_CIRCLE_SIZE,
        overflow: 'hidden'
    },
    circleLeft: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: SIDEBAR_WIDTH,
        width: BACKGROUND_CIRCLE_SIZE / 2,
        overflow: 'hidden'
    },
    circleBottom: {
        position: 'absolute',
        top: BACKGROUND_CIRCLE_SIZE / 2,
        bottom: 0,
        right: SIDEBAR_WIDTH - BACKGROUND_CIRCLE_SIZE / 2,
        width: BACKGROUND_CIRCLE_SIZE,
        overflow: 'hidden'
    },
    circle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: BACKGROUND_CIRCLE_SIZE,
        height: BACKGROUND_CIRCLE_SIZE,
        borderWidth: 2,
        borderColor: colors.violetLight,
        borderRadius: BACKGROUND_CIRCLE_SIZE / 2
    },
    backgroundBlob: {
        position: 'absolute',
        top: BACKGROUND_FIRST_TOP,
        height: BACKGROUND_FIRST_HEIGHT,
        width: BACKGROUND_FIRST_WIDTH,
        transform: [{ scale: 1.15 }] // The blob is apparently not covering the entire surface of the auto-generated JSX component
    },
    ellipsisFirstContainer: {
        position: 'absolute',
        top: BACKGROUND_CIRCLE_SIZE * 0.65,
        right: SIDEBAR_WIDTH * 1.20
    },
    ellipsisTextFirst: {
        color: chroma(colors.white).alpha(0.65).css()
    },
    influencerImage: {
        height: IMAGE_FIRST_HEIGHT,
        aspectRatio: IMAGE_FIRST_RATIO,
        alignSelf: 'flex-end',
        marginTop: IMAGE_FIRST_TOP,
        resizeMode: 'contain'
    },
    backgroundLineContainer: {
        position: 'absolute',
        top: BACKGROUND_LINE_TOP,
        left: BACKGROUND_LINE_LEFT,
        width: BACKGROUND_LINE_WIDTH,
        height: BACKGROUND_LINE_HEIGHT
    },
    backgroundLineCover: {
        position: 'absolute',
        top: BACKGROUND_LINE_TOP - BACKGROUND_LINE_COVER_HEIGHT / 2,
        left: 0,
        width: viewportWidth - SIDEBAR_WIDTH,
        height: BACKGROUND_LINE_COVER_HEIGHT,
        backgroundColor: colors.white
    },
    myProgram: {
        paddingVertical: 5
    },
    quickWorkout: {
        marginTop: isMHeight ? 65 : 45
    },
    weeklyChallenge: {
        marginTop: isMHeight ? 55 : 45
    },
    recovery: {
        marginTop: 0
    },
    targetedAreasTraining: {
        paddingTop: isMHeight ? 55 : 45,
        paddingBottom: 10 + iosHomeIndicatorOffset / 2
    }
});
