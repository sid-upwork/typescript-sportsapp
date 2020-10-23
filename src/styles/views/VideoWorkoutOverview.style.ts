import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { baseFont } from '../base/fonts.style';
import { statusBarOffset, iosHomeIndicatorOffset, isLHeight, isMWidth } from '../base/metrics.style';
import { PLAY_BUTTON_SIZE } from '../components/VideoPlayer.style';

const CONTENT_BORDER_WIDTH = 1;
const CONTENT_MARGIN_HORIZONTAL = 12;
const CONTENT_PADDING_HORIZONTAL = 24;
const CONTENT_BORDER_RADIUS = 36;

const INFOS_ITEM_MARGIN_H = 16;

const HIGHLIGHT_COLOR = colors.pink;

const GRADIENT_COLOR = chroma(colors.violetDark).darken(2).desaturate(1.5);
export const GRADIENT_COLORS = [
    chroma(colors.pink).alpha(0.7).css(),
    chroma(GRADIENT_COLOR).alpha(0.9).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    ellipsisBackground: {
        position: 'absolute',
        bottom: 20,
        left: 40
    },
    textEllipsisBackground: {
        color: chroma(colors.white).alpha(0.45).css()
    },
    contentContainer: {
        justifyContent: 'flex-end'
    },
    videoViewerContainer: {
        flex: 1,
        marginTop: statusBarOffset,
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
    contentOverflowContainer: {
        overflow: 'visible'
    },
    contentInnerContainer: {
        marginHorizontal: CONTENT_MARGIN_HORIZONTAL,
        marginBottom: CONTENT_MARGIN_HORIZONTAL + (iosHomeIndicatorOffset / 2),
        paddingHorizontal: CONTENT_PADDING_HORIZONTAL,
        paddingVertical: Math.round(CONTENT_PADDING_HORIZONTAL * 1.25)
    },
    blurIOS: {
        backgroundColor: chroma(colors.violetDark).alpha(0.15).css()
    },
    blurAndroid: {
        backgroundColor: chroma(colors.violetDark).alpha(0.35).css()
    },
    contentBlurContainer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: CONTENT_BORDER_RADIUS,
        borderColor: chroma(HIGHLIGHT_COLOR).alpha(0.55).css(),
        borderWidth: CONTENT_BORDER_WIDTH,
        overflow: 'hidden'
    },
    contentBlur: {
        borderRadius: CONTENT_BORDER_RADIUS - CONTENT_BORDER_WIDTH
    },
    title: {
        color: colors.white,
        fontSize: isMWidth ? 24 : 20,
        textAlign: 'center'
    },
    description: {
        marginTop: 18,
        color: chroma(colors.white).alpha(0.75).css(),
        fontFamily: baseFont.regular,
        fontSize: isMWidth ? 14 : 13,
        textAlign: 'center'
    },
    infosWrapper: {
        flexDirection: 'row',
        marginTop: isLHeight ? 32 : 28
    },
    infosContainer: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: INFOS_ITEM_MARGIN_H / 2,
        paddingHorizontal: isMWidth ? 7 : 4,
        borderColor: chroma(HIGHLIGHT_COLOR).alpha(0.5).css(),
        borderWidth: 1,
        borderRadius: Math.round(CONTENT_BORDER_RADIUS * 0.5),
        overflow: 'hidden'
    },
    infosContainerFirst: {
        marginLeft: 0
    },
    infosContainerLast: {
        marginRight: 0
    },
    infoTitle: {
        marginBottom: 10,
        color: chroma(HIGHLIGHT_COLOR).alpha(0.85).css(),
        fontFamily: baseFont.bold,
        fontSize: 12,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    infosIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    infoIcon: {
        tintColor: colors.white,
        height: 20,
        width: 20,
        resizeMode: 'contain'
    },
    infoContent: {
        color: colors.white,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 13 : 12,
        textAlign: 'center'
    }
});
