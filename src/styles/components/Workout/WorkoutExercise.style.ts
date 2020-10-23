import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { viewportHeight, isLHeight, isLWidth } from '../../base/metrics.style';
import { BUTTON_PLUS_SIZE, BUTTON_MARGIN } from './WorkoutBottomButtons.style';
import { PROGRESSION_INITIAL_HEIGHT } from './WorkoutProgressionItem.style';
import { ROW_HEIGHT, SETS_CONTAINER_HEIGHT, SETS_HEADER_HEIGHT } from './WorkoutExerciseTable.style';
import { CONTAINER_HEIGHT } from './WorkoutTimer.style';
import { TOOLTIP_SIZE_DELTA } from '../Tooltip.style';

export const IMAGE_GRADIENT_COLORS = [
    chroma(colors.black).alpha(0).css(),
    chroma(colors.black).alpha(0).css(),
    chroma(colors.black).alpha(0.5).css(),
    chroma(colors.black).alpha(1).css()
];

export const HIGHLIGHT_COLOR = colors.violetLight;

const PLAY_BUTTON_SIZE = isLWidth ? 76 : 68;

const BACKGROUND_LINE_RATIO = 64 / 1028;
const BACKGROUND_LINE_HEIGHT = Math.round(viewportHeight * 1.2);
const BACKGROUND_LINE_WIDTH = Math.round(BACKGROUND_LINE_HEIGHT * BACKGROUND_LINE_RATIO);
const BACKGROUND_LINE_TOP = -Math.round(viewportHeight * 0.1);
const BACKGROUND_LINE_RIGHT = 30;

const LINK_ICON_RATIO = 180 / 80;
const LINK_ICON_WIDTH = BUTTON_PLUS_SIZE + BUTTON_MARGIN * 3;
const LINK_ICON_HEIGHT = LINK_ICON_WIDTH / LINK_ICON_RATIO;

const TITLE_PADDING_H = isLWidth ? 45 : 35;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        overflow: 'hidden'
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: viewportHeight // No fullspace here because of the foreground effect (we can share styles this way)
    },
    backgroundLineContainer: {
        position: 'absolute',
        top: BACKGROUND_LINE_TOP,
        right: BACKGROUND_LINE_RIGHT,
        height: BACKGROUND_LINE_HEIGHT,
        width: BACKGROUND_LINE_WIDTH,
        opacity: 0.28
    },
    ellipsisContainer: {
        position: 'absolute',
        top: CONTAINER_HEIGHT + 30,
        right: 40
    },
    ellipsisText: {
        color: chroma(colors.white).alpha(0.75).css()
    },
    halfLinkIconContainer: {
        position: 'absolute',
        // top: viewportHeight - (PROGRESSION_INITIAL_HEIGHT + BUTTON_MARGIN + SETS_CONTAINER_HEIGHT) + SETS_HEADER_HEIGHT + ((ROW_HEIGHT - LINK_ICON_HEIGHT) / 2),
        bottom: PROGRESSION_INITIAL_HEIGHT + BUTTON_MARGIN + SETS_CONTAINER_HEIGHT - SETS_HEADER_HEIGHT - LINK_ICON_HEIGHT - ((ROW_HEIGHT - LINK_ICON_HEIGHT) / 2),
        height: LINK_ICON_HEIGHT,
        width: LINK_ICON_WIDTH,
        opacity: 0.65,
        overflow: 'hidden'
    },
    halfLinkIconContainerLeft: {
        left: -(LINK_ICON_WIDTH - BUTTON_MARGIN)
    },
    halfLinkIconContaineRight: {
        right: -BUTTON_MARGIN
    },
    halfLinkIcon: {
        height: LINK_ICON_HEIGHT,
        width: LINK_ICON_WIDTH
    },
    linkCircuitLabelContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: LINK_ICON_WIDTH,
        alignItems: 'center',
        justifyContent: 'center'
    },
    linkCircuitLabel: {
        color: chroma(colors.violetLight).alpha(0.9).css(),
        fontFamily: baseFont.bold,
        fontSize: 11,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    flexContentContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    videoLauncherContainer: {
        flex: 1,
        marginTop: CONTAINER_HEIGHT,
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
    playIconBlurIOS: {
        backgroundColor: chroma(colors.violetDark).alpha(0.15).css()
    },
    playIconBlurAndroid: {
        backgroundColor: chroma(colors.violetDark).alpha(0.35).css()
    },
    titleContainer: {
        justifyContent: 'center',
        paddingHorizontal: TITLE_PADDING_H,
        paddingBottom: isLHeight ? 30 : 25
    },
    exerciseName: {
        color: colors.white,
        fontFamily: titleFont.black,
        fontSize: isLWidth ? 26 : 23,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    exerciseInfo: {
        marginTop: 8,
        paddingHorizontal: isLWidth ? 15 : 10,
        color: chroma(colors.white).alpha(0.85).css(),
        fontFamily: titleFont.regular,
        fontSize: isLWidth ? 16 : 15,
        textAlign: 'center'
    },
    tooltip: {
        position: 'absolute',
        top: -TOOLTIP_SIZE_DELTA - 8,
        right: -TOOLTIP_SIZE_DELTA - 8
    }
});
