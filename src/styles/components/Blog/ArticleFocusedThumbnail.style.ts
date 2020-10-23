import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { viewportWidth, isLWidth, isMWidth } from '../../base/metrics.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';

export const ARTICLE_FOCUSED_THUMBNAIL_WIDTH: number = viewportWidth - 80;
export const GRADIENT_COLORS = [colors.orange, colors.pink];
const PLACEHOLDER_SCALE = chroma.scale([colors.orange, colors.pink]);

const BORDER_TOP_OFFSET: number = 20;
const BORDER_LEFT_OFFSET: number = 12;

const PLAY_ICON_SIZE = isMWidth ? 86 : 74;

export const ARTICLE_TITLE_STYLE: any = {
    color: colors.white,
    fontSize: isLWidth ? 18 : (isMWidth ? 17 : 16),
    fontFamily: titleFont.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
};
export const VIDEO_TITLE_STYLE: any = {
    color: colors.white,
    fontSize: isLWidth ? 21 : (isMWidth ? 18 : 17),
    fontFamily: titleFont.bold,
    letterSpacing: 0.5,
    textTransform: 'capitalize'
};

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1,
        paddingRight: BORDER_LEFT_OFFSET,
        paddingBottom: BORDER_TOP_OFFSET
    },
    containerInner: {
        flex: 1
    },
    containerOverflow: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden'
    },
    border: {
        position: 'absolute',
        top: BORDER_TOP_OFFSET,
        right: 0,
        bottom: 0,
        left: BORDER_LEFT_OFFSET,
        borderWidth: 1,
        borderColor: colors.white,
        borderRadius: 20
    },
    imageContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: PLACEHOLDER_SCALE(0.6).css()
    },
    image: {
        flex: 1
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'flex-end',
        padding: 15
    },
    infos: {
        paddingVertical: 15,
        paddingHorizontal: 25
    },
    videoInfos: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        paddingVertical: 20,
        paddingHorizontal: 25
    },
    gradient: {
        ...StyleSheet.absoluteFillObject
    },
    date: {
        marginBottom: 6,
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: 15,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    title: {
        ...ARTICLE_TITLE_STYLE
    },
    titleVideo: {
        ...VIDEO_TITLE_STYLE,
        textAlign: 'center'
    },
    playContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    playIconContainer: {
        width: PLAY_ICON_SIZE,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: PLAY_ICON_SIZE / 2,
        borderWidth: 1,
        borderColor: colors.white,
        opacity: 0.92
    },
    playIcon: {
        width: 54,
        aspectRatio: 1
    }
});
