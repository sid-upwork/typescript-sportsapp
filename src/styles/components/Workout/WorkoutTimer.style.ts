import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { titleFont } from '../../base/fonts.style';
import { viewportWidth, statusBarOffset, notchOffset, isLHeight, hasNotch, isLWidth, isMWidth, isMHeight } from '../../base/metrics.style';
import androidElevations from '../../../utils/androidElevations';
import { TOOLTIP_SIZE_DELTA, TOOLTIP_TOTAL_SIZE } from '../Tooltip.style';
import { isAndroid } from '../../../utils/os';

const BUTTON_SIZE = isLHeight ? 52 : (isMHeight ? 48 : 44);
export const BUTTON_OFFSET_RIGHT = BUTTON_SIZE / 2;
export const BUTTON_COLOR = colors.violetDark;
export const BUTTON_BORDER_RADIUS_PLAY = 10;
export const BUTTON_BORDER_RADIUS_PAUSE = BUTTON_SIZE / 2;
const BUTTON_ICON_SIZE = Math.round(BUTTON_SIZE * 0.45);
export const BUTTON_ICON_COLOR = colors.white;

export const CONTAINER_WIDTH = Math.round(viewportWidth * 0.5);
const BASE_HEIGHT = BUTTON_SIZE + 20;
const SPACER_HEIGHT = hasNotch ? notchOffset : statusBarOffset;
export const CONTAINER_HEIGHT = BASE_HEIGHT + SPACER_HEIGHT;

const CONTAINER_BORDER_RADIUS = 40;
const CONTAINER_BORDER_WIDTH = 1;

export const TOP_GRADIENT_COLORS = [
    chroma(BUTTON_COLOR).alpha(0.75).css(),
    chroma(BUTTON_COLOR).alpha(0).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CONTAINER_WIDTH + BUTTON_OFFSET_RIGHT,
        height: CONTAINER_HEIGHT,
        paddingRight: BUTTON_OFFSET_RIGHT
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: SPACER_HEIGHT,
        paddingRight: BUTTON_SIZE / 2,
        borderBottomRightRadius: CONTAINER_BORDER_RADIUS,
        backgroundColor: chroma(colors.white).alpha(0.35).css(),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 15
    },
    containerBorder: {
        position: 'absolute',
        top: -CONTAINER_BORDER_WIDTH,
        bottom: 0,
        left: -CONTAINER_BORDER_WIDTH,
        right: 0,
        borderWidth: CONTAINER_BORDER_WIDTH,
        borderColor: chroma(BUTTON_COLOR).alpha(0.85).css(),
        borderBottomRightRadius: CONTAINER_BORDER_RADIUS
    },
    blur: {
        position: 'absolute',
        top: -CONTAINER_BORDER_RADIUS, // Ugly hack because independant borders don't seem to work with blur views,
        bottom: 0,
        left: -CONTAINER_BORDER_RADIUS, // Ugly hack because independant borders don't seem to work with blur views
        right: 0,
        borderRadius: CONTAINER_BORDER_RADIUS
    },
    blurIOS: {
        backgroundColor: chroma(colors.white).alpha(0.25).css()
    },
    blurAndroid: {
        backgroundColor: chroma(colors.white).alpha(0.92).css()
    },
    buttonContainer: {
        position: 'absolute',
        top: SPACER_HEIGHT + (BASE_HEIGHT - BUTTON_SIZE) / 2,
        right: 0
    },
    buttonContainerInner: {
        width: BUTTON_SIZE,
        aspectRatio: 1
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: statusBarOffset
    },
    button: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BUTTON_COLOR,
        borderRadius: BUTTON_BORDER_RADIUS_PAUSE,
        elevation: androidElevations.workout.timer
    },
    buttonIcon: {
        width: BUTTON_ICON_SIZE,
        height: BUTTON_ICON_SIZE
    },
    clockLabel: {
        width: isLWidth ? 18 : (isMWidth ? 17 : 15),
        color: BUTTON_COLOR,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 27 : (isMWidth ? 25 : 22),
        letterSpacing: isLWidth ? 1 : 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    tooltip: {
        position: 'absolute',
        bottom: isAndroid ? (-TOOLTIP_SIZE_DELTA - 8) : (TOOLTIP_TOTAL_SIZE / 2),
        right: BUTTON_SIZE / 2
    }
});
