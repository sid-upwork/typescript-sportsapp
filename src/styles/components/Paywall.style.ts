import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { iosHomeIndicatorOffset, headerHeight, viewportWidth, isLWidth, isMWidth } from '../base/metrics.style';
import { baseFont, titleFont } from '../base/fonts.style';

export const HEADER_GRADIENT_HEIGHT = headerHeight + 20;
export const HEADER_GRADIENT_COLORS = [
    chroma(colors.violetDark).alpha(1),
    chroma(colors.violetDark).alpha(0)
];

const VIDEO_FADE_HEIGHT = 40;
export const VIDEO_FADE_GRADIENT_COLORS = [
    chroma(colors.background).alpha(1),
    chroma(colors.background).alpha(0)
];

const VIDEO_RATIO = 16 / 9;
const VIDEO_WIDTH = viewportWidth;
const VIDEO_HEIGHT = Math.round(VIDEO_WIDTH / VIDEO_RATIO);
const VIDEO_MARGIN_TOP = headerHeight + 10;
const VIDEO_MARGIN_H = 12;
const VIDEO_BORDER_RADIUS = 12;

const LOCK_ICON_RATIO = 384 / 512;
const LOCK_ICON_WIDTH = Math.round(viewportWidth * 0.2);
const LOCK_ICON_HEIGHT = LOCK_ICON_WIDTH / LOCK_ICON_RATIO;

const TITLE_FONT_SIZE = isLWidth ? 35 : (isMWidth ? 32 : 28);
const TITLE_MARGIN_BOTTOM = 10;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        backgroundColor: colors.background
    },
    flexZIndexHack: {
        flex: 1,
        flexDirection: 'column-reverse' // zIndex hack
    },
    videoContainer: {
        height: VIDEO_HEIGHT,
        marginTop: VIDEO_MARGIN_TOP,
        marginHorizontal: VIDEO_MARGIN_H,
        overflow: 'visible'
    },
    video: {
        borderRadius: VIDEO_BORDER_RADIUS,
        overflow: 'hidden'
    },
    videoFadeEffect: {
        position: 'absolute',
        bottom: -VIDEO_FADE_HEIGHT,
        left: 0,
        right: 0,
        height: VIDEO_FADE_HEIGHT
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_GRADIENT_HEIGHT
    },
    scrollViewContentContainer: {
        paddingTop: headerHeight,
        paddingBottom: 40 + (iosHomeIndicatorOffset / 2)
    },
    scrollViewContentContainerVideo: {
        paddingTop: 0
    },
    contentContainer: {
        paddingLeft: 30,
        paddingRight: 40
    },
    lockIcon: {
        width: LOCK_ICON_WIDTH,
        height: LOCK_ICON_HEIGHT,
        alignSelf: 'center',
        marginBottom: 20
    },
    title: {
        marginTop: 30,
        marginBottom: TITLE_MARGIN_BOTTOM,
        fontFamily: titleFont.bold,
        fontSize: TITLE_FONT_SIZE,
        color: colors.violetDark,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    chooseText: {
        fontFamily: baseFont.regular,
        fontSize: 14,
        color: colors.violetDark,
        letterSpacing: 1
    },
    loaderContainer: {
        paddingVertical: 40
    },
    buttonsContainer: {
        marginBottom: 30
    },
    help: {
        marginBottom: 8,
        paddingHorizontal: 20,
        color: colors.gray,
        fontFamily: baseFont.regular,
        fontSize: 14,
        letterSpacing: 0.25,
        textAlign: 'center'
    },
    divider: {
        width: 50,
        height: 1,
        alignSelf: 'center',
        marginTop: 15,
        marginBottom: 35,
        backgroundColor: chroma(colors.pink).alpha(0.6).css()
    },
    terms: {
        color: colors.gray,
        fontFamily: baseFont.regular,
        fontSize: 12,
        textAlign: 'center'
    },
    linksContainer: {
        marginTop: 15,
        marginBottom: 25
    },
    link: {
        marginBottom: 18
    },
    linkLast: {
        marginBottom: 0
    },
    linkLabel: {
        color: colors.violetDark,
        fontSize: 13,
        fontFamily: titleFont.bold,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase',
        textDecorationLine: 'underline'
    },
    email: {
        paddingHorizontal: 20,
        color: colors.gray,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 15 : 14,
        letterSpacing: 0.25,
        textAlign: 'center'
    },
    emailColored: {
        color: colors.orange,
        fontFamily: titleFont.bold
    },
    logoutButton: {
        marginTop: 15,
        backgroundColor: colors.orange
    }
});
