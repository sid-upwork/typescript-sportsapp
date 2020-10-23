import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { baseFont, titleFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';
import { ARTICLE_TITLE_STYLE, VIDEO_TITLE_STYLE } from './ArticleFocusedThumbnail.style';
import { isLWidth, isLHeight, isMHeight, isMWidth } from '../../base/metrics.style';

const HEIGHT = isLHeight ? 200 : (isMHeight ? 180 : 160);
const PADDING_BOTTOM = 20;

export const ARTICLE_THUMBNAIL_HEIGHT = HEIGHT + PADDING_BOTTOM;
export const MORE_GRADIENT_COLORS = [colors.orange, colors.pink];
export const PLAY_GRADIENT_COLORS = [colors.blueLight, colors.blueDark];

const BORDER_TOP_OFFSET: number = 20;
const BORDER_LEFT_OFFSET: number = 12;

const MORE_BUTTON_SIZE: number = isLWidth ? 70 : 64;
const MORE_BUTTON_RIGHT: number = isLWidth ? 25 : 20;

const INNER_PADDING_H = isLWidth ? 25 : (isMWidth ? 20 : 18);
const INNER_PADDING_V = isLWidth ? 20 : (isMWidth ? 16 : 15);

const TITLE_PADDING_RIGHT = MORE_BUTTON_RIGHT - BORDER_LEFT_OFFSET + MORE_BUTTON_SIZE - INNER_PADDING_H + 15;

const PLACEHOLDER_SCALE = chroma.scale([colors.pink, colors.violetDark]);

export default StyleSheet.create({
    container: {
        flex: 1,
        height: ARTICLE_THUMBNAIL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: PADDING_BOTTOM,
        backfaceVisibility: 'hidden',
        paddingRight: 20
    },
    touchableOpacity: {
        flex: 1,
        width: '100%',
        paddingRight: BORDER_LEFT_OFFSET,
        paddingBottom: BORDER_TOP_OFFSET
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
        flex: 1
    },
    imageContainerInner: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: PLACEHOLDER_SCALE(0.4).css()
    },
    image: {
        flex: 1
    },
    contentContainer: {
        ...StyleSheet.absoluteFillObject,
        paddingHorizontal: INNER_PADDING_H,
        paddingVertical: INNER_PADDING_V
    },
    title: {
        ...ARTICLE_TITLE_STYLE,
        marginRight: TITLE_PADDING_RIGHT
    },
    titleVideo: {
        ...VIDEO_TITLE_STYLE,
        marginRight: TITLE_PADDING_RIGHT
    },
    category: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: colors.violetDark
    },
    categoryLabel: {
        color: colors.white,
        fontFamily: baseFont.light,
        fontSize: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    moreButtonContainer: {
        position: 'absolute',
        right: MORE_BUTTON_RIGHT,
        bottom: 10,
        width: MORE_BUTTON_SIZE,
        height: MORE_BUTTON_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: MORE_BUTTON_SIZE / 2,
        overflow: 'hidden'
    },
    moreButtonBackground: {
        ...StyleSheet.absoluteFillObject
    },
    moreButtonText: {
        color: colors.white,
        fontSize: isLWidth ? 18 : 16,
        fontFamily: titleFont.bold,
        textTransform: 'uppercase',
        letterSpacing: isLWidth ? 1.5 : 1
    },
    playIconContainer: {
        width: 38,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center'
        // borderRadius: 20,
        // borderWidth: 1,
        // borderColor: colors.white
    },
    playIcon: {
        width: 32,
        aspectRatio: 1
    }
});
