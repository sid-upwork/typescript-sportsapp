import { StyleSheet } from 'react-native';
import { iosHomeIndicatorOffset, viewportWidth } from '../base/metrics.style';
import colors from '../base/colors.style';
import { baseFont, titleFont } from '../base/fonts.style';

const CLOSE_BUTTON_SIZE = 24;
const ANIMATION_OVERFLOW_HEIGHT = 30;
const CLOSE_BUTTON_PADDING = 12;
export const CLOSE_BUTTON_BOTTOM_HEIGHT = CLOSE_BUTTON_SIZE + CLOSE_BUTTON_PADDING * 2 + iosHomeIndicatorOffset + ANIMATION_OVERFLOW_HEIGHT;
export const POPUP_WIDTH_ON_POSITION_CENTER = Math.round(viewportWidth * 0.85);

export default StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center'
    },
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    overlayBlur: {
        opacity: 0.75
    },
    overlayInner: {
        flex: 1
    },
    popup: {
        alignSelf: 'center'
    },
    popupBackground: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden'
    },
    popupInner: {
        ...StyleSheet.absoluteFillObject
    },
    popupInnerBottom: {
        bottom: -ANIMATION_OVERFLOW_HEIGHT,
        paddingBottom: ANIMATION_OVERFLOW_HEIGHT
    },
    gradient: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0
    },
    scrollViewGradient: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden'
    },
    scrollViewGradientInner: {
        position: 'absolute',
        right: 0,
        left: 0
    },
    closeButtonContainerTop: {
        position: 'absolute',
        top: -18,
        right: -18
    },
    closeButtonContainerBottom: {
        width: '100%',
        alignItems: 'center'
    },
    closeButtonTop: {
        padding: CLOSE_BUTTON_PADDING,
        borderRadius: 8
    },
    closeButtonBottom: {
        marginBottom: 20 + iosHomeIndicatorOffset * 0.5,
        padding: CLOSE_BUTTON_PADDING,
        borderRadius: 8
    },
    closeButtonIcon: {
        width: CLOSE_BUTTON_SIZE,
        height: CLOSE_BUTTON_SIZE,
        resizeMode: 'contain'
    },
    title: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        fontSize: 22,
        fontFamily: titleFont.bold,
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: 0.5
    },
    actionButton: {
        alignSelf: 'center',
        paddingVertical: 5,
        paddingHorizontal: 15,
        backgroundColor: colors.violetDark,
        borderRadius: 5
    },
    actionButtonLabel: {
        color: 'white',
        fontSize: 18,
        textTransform: 'uppercase',
        fontFamily: baseFont.bold
    }
});
