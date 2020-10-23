import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { baseFont } from '../base/fonts.style';
import { iosHomeIndicatorOffset, baseHeaderHeight, viewportWidth, viewportHeight, isLWidth, isMHeight } from '../base/metrics.style';
import headerStyles from './Header.style';

const OVERLAY_TINT = chroma(colors.violetDark).darken(2.2).desaturate(2.5);
export const OVERLAY_COLORS = [
    chroma(OVERLAY_TINT).alpha(0.7).css(),
    chroma(OVERLAY_TINT).alpha(0.5).css(),
    chroma(OVERLAY_TINT).alpha(0.4).css(),
    chroma(OVERLAY_TINT).alpha(0.5).css(),
    chroma(OVERLAY_TINT).alpha(0.7).css()
];
export const OVERLAY_LOCATIONS = [
    0,
    0.35,
    0.5,
    0.65,
    1
];

export const PLAY_BUTTON_SIZE: number = isLWidth ? 90 : 80;
const CONTROL_SIZE: number = 60;
const RESIZE_BUTTON_SIZE: number = baseHeaderHeight;
const RESIZE_ICON_SIZE: number = 30;
const STOP_BUTTON_SIZE: number = 58;
const STOP_ICON_SIZE: number = 44;

export const SCREEN_RATIO = viewportWidth /  viewportHeight;
export const VIDEO_RATIO = 1080 / 1920;

export const VIDEO_DIMENSIONS: { height: number, width: number} = SCREEN_RATIO <= VIDEO_RATIO ? {
    width: viewportHeight * VIDEO_RATIO,
    height: viewportHeight
} : {
    width: viewportWidth,
    height: viewportWidth / VIDEO_RATIO
};

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    centerChild: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        backgroundColor: colors.black
    },
    video: {
        ...VIDEO_DIMENSIONS
    },
    videoLandscape: {
        width: VIDEO_DIMENSIONS.height,
        height: VIDEO_DIMENSIONS.width
    },
    loaderBlurContainer: {
        opacity: 0.85
    },
    launchIcon: {
        width: PLAY_BUTTON_SIZE,
        aspectRatio: 1
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    control: {
        width: CONTROL_SIZE,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20
    },
    controlIcon: {
        position: 'absolute',
        width: CONTROL_SIZE,
        aspectRatio: 1
    },
    controlLabel: {
        color: 'white',
        fontFamily: baseFont.bold,
        fontSize: 16,
        letterSpacing: -0.5,
        textAlign: 'center'
    },
    resizeButtonContainer: {
        position: 'absolute',
        top: headerStyles.offset.height,
        right: 10,
        height: RESIZE_BUTTON_SIZE,
        width: RESIZE_BUTTON_SIZE
    },
    resizeButton: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    resizeIcon: {
        width: RESIZE_ICON_SIZE,
        height: RESIZE_ICON_SIZE
    },
    stopButtonContainer: {
        position: 'absolute',
        top: headerStyles.offset.height,
        right: 20,
        height: STOP_BUTTON_SIZE,
        width: STOP_BUTTON_SIZE
    },
    stopButton: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    stopIcon: {
        width: STOP_ICON_SIZE,
        height: STOP_ICON_SIZE
    },
    closeButtonContainer: {
        position: 'absolute',
        top: headerStyles.offset.height,
        left: headerStyles.button.marginLeft,
        height: headerStyles.button.height,
        width: headerStyles.button.width
    },
    closeButton: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    sliderContainer: {
        position: 'absolute',
        bottom: 25 + (iosHomeIndicatorOffset / 2),
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    slider: {
        flex: 1,
        height: 44
    },
    sliderLabel: {
        color: 'white',
        fontFamily: baseFont.bold,
        fontSize: 14
    },
    sliderLabelLeft: {
        marginRight: 10
    },
    sliderLabelRight: {
        marginLeft: 10
    },
    playbackSpeedButton: {
        flexDirection: 'row',
        width: 48,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 20,
        borderRadius: 7,
        borderColor: colors.white,
        borderWidth: 1
    },
    playbackSpeedButtonText: {
        flex: 1,
        color: 'white',
        fontFamily: baseFont.bold,
        fontSize: 14,
        textAlign: 'center'
    },
    playbackSpeedMenu: {
        backgroundColor: chroma(colors.white).alpha(0.96).css()
    },
    playbackSpeedMenuItem: {
        height: 44,
        minWidth: 110
    },
    playbackSpeedMenuItemText: {
        paddingHorizontal: 14,
        color: colors.violetDark,
        fontFamily: baseFont.regular,
        fontSize: isMHeight ? 14 : 13,
        fontWeight: null,
        letterSpacing: 0.25,
        textAlign: 'center'
    }
});
