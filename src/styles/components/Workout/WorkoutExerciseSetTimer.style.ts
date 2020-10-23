import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { SETS_CONTAINER_WIDTH, SETS_CONTAINER_MARGIN_LEFT, SETS_HEADER_HEIGHT } from './WorkoutExerciseTable.style';
import { isMWidth } from '../../base/metrics.style';
import { titleFont } from '../../base/fonts.style';

const TIMER_HEIGHT = 56;
const TIMER_RADIUS = Math.round(SETS_CONTAINER_WIDTH * 0.92);
const TIMER_MARGIN_H = (SETS_CONTAINER_WIDTH - TIMER_RADIUS) / 2;
const TIMER_ACCENT_COLOR = colors.white;

export const GRADIENT_COLORS = [
    colors.violetLight,
    colors.violetDark,
    colors.violetLight,
];

const BUTTON_SIZE = 28;
const ICON_SIZE = 10;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    overflowContainer: {
        height: TIMER_HEIGHT,
        width: SETS_CONTAINER_WIDTH,
        marginLeft: SETS_CONTAINER_MARGIN_LEFT
        // overflow: 'hidden'
    },
    innerContainer: {
        position: 'absolute',
        top: 0,
        left: TIMER_MARGIN_H,
        right: TIMER_MARGIN_H,
        height: TIMER_RADIUS
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: TIMER_HEIGHT + (SETS_HEADER_HEIGHT / 2), // Balance between spring animation and visiblity behind the table
        overflow: 'hidden'
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: TIMER_RADIUS,
        aspectRatio: 1,
        borderRadius: Math.round(TIMER_RADIUS * 0.5),
        backgroundColor: chroma(colors.violetDark).alpha(0.65).css(),
        borderColor: colors.violetLight,
        borderWidth: 1
    },
    content: {
        position: 'absolute',
        top: Math.round(TIMER_HEIGHT * 0.075),
        left: 0,
        right: 0,
        height: TIMER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    clockLabel: {
        color: TIMER_ACCENT_COLOR,
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 18 : 17,
        letterSpacing: 0.5,
        textAlign: 'right',
        width: 12
    },
    clockDots: {
        width: 3,
        aspectRatio: 1,
        marginVertical: 1,
        marginHorizontal: 2,
        borderRadius: 2,
        backgroundColor: TIMER_ACCENT_COLOR
    },
    button: {
        width: BUTTON_SIZE,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        borderRadius: BUTTON_SIZE / 2,
        borderColor: TIMER_ACCENT_COLOR,
        borderWidth: 1
    },
    icon: {
        width: ICON_SIZE,
        aspectRatio: 1,
        color: TIMER_ACCENT_COLOR
    }
});
