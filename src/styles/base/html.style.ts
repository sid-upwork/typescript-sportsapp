import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { viewportWidth } from './metrics.style';
import { adaptedFontSize, emSize, baseFont, titleFont } from './fonts.style';
import { ARTICLE_HORIZONTAL_PADDING } from '../views/Article.style';
import { getBackgroundNuance } from '../../utils/colors';

export const IMAGE_MAX_WIDTH = viewportWidth - ARTICLE_HORIZONTAL_PADDING;
export const IMAGE_INITIAL_SIZE = {
    width: IMAGE_MAX_WIDTH,
    height: IMAGE_MAX_WIDTH * 9 / 16
};
export const IMAGE_RADIUS = 26;

const IMAGE_BACKGROUND_RATIO = 445 / 270;
const IMAGE_BACKGROUND_WIDTH = Math.round(viewportWidth * 1.1);
const IMAGE_BACKGROUND_HEIGHT = Math.round(IMAGE_BACKGROUND_WIDTH / IMAGE_BACKGROUND_RATIO);
const IMAGE_BACKGROUND_RIGHT = -Math.round(IMAGE_BACKGROUND_WIDTH * 0.3);

// Modular scale (minor third | 1.2)
// See: http://www.modularscale.com/
export const H1_FACTOR = 1.728;
export const H2_FACTOR = 1.44;
export const H3_FACTOR = 1.2;
export const H4_FACTOR = 1;
// export const H5_FACTOR = 0.833;
// export const H6_FACTOR = 0.694;

export const TITLE_MARGIN_TOP_EM = 0.5; // 1.5
export const TITLE_MARGIN_BOTTOM_EM = 0.35;

const TITLE_LINE_HEIGHT = 1.2;
const P_LINE_HEIGHT = 1.6;

export const P_FONT_SIZE = adaptedFontSize(1);

export const BASE_FONT_STYLE = {
    backgroundColor: 'transparent',
    fontFamily: baseFont.regular,
    fontSize: P_FONT_SIZE,
    lineHeight: Math.ceil(P_FONT_SIZE * P_LINE_HEIGHT)
};

const TITLE_COLOR: string = '#434343';
const LINK_COLOR: string = colors.violetDark;

const ACTIVE_COLOR = colors.orange;
export function P_STYLE (factor: number = 1): {} {
    return {
        marginBottom: Math.round(emSize(0.75) * factor),
        backgroundColor: 'transparent',
        color: colors.textPrimary,
        fontFamily: baseFont.light,
        fontSize: Math.round(P_FONT_SIZE * factor),
        lineHeight: Math.round(Math.ceil(P_FONT_SIZE * P_LINE_HEIGHT) * factor),
        letterSpacing: 0.5
    };
};

const UL_BULLET_WIDTH = 14;
const UL_BULLET_HEIGHT = 13;
const ASIDE_BORDER_RADIUS = 20;

export default StyleSheet.create({
    h1: {
        marginTop: emSize(TITLE_MARGIN_TOP_EM * H1_FACTOR),
        marginBottom: emSize(TITLE_MARGIN_BOTTOM_EM * H1_FACTOR),
        backgroundColor: 'transparent',
        fontSize: adaptedFontSize(H1_FACTOR),
        lineHeight: adaptedFontSize(H1_FACTOR * TITLE_LINE_HEIGHT),
        color: TITLE_COLOR,
        fontFamily: titleFont.bold,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    h2: {
        marginTop: emSize(TITLE_MARGIN_TOP_EM * H2_FACTOR),
        marginBottom: emSize(TITLE_MARGIN_BOTTOM_EM * H2_FACTOR),
        backgroundColor: 'transparent',
        fontSize: adaptedFontSize(H2_FACTOR),
        lineHeight: adaptedFontSize(H2_FACTOR * TITLE_LINE_HEIGHT),
        color: TITLE_COLOR,
        fontFamily: titleFont.bold,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    h3: {
        marginTop: emSize(TITLE_MARGIN_TOP_EM * H3_FACTOR),
        marginBottom: emSize(TITLE_MARGIN_BOTTOM_EM * H3_FACTOR),
        backgroundColor: 'transparent',
        fontSize: adaptedFontSize(H3_FACTOR),
        lineHeight: adaptedFontSize(H3_FACTOR * TITLE_LINE_HEIGHT),
        color: TITLE_COLOR,
        fontFamily: titleFont.bold,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    h4: {
        marginTop: emSize(TITLE_MARGIN_TOP_EM * H4_FACTOR),
        marginBottom: emSize(TITLE_MARGIN_BOTTOM_EM * H4_FACTOR),
        backgroundColor: 'transparent',
        fontSize: adaptedFontSize(H4_FACTOR),
        lineHeight: adaptedFontSize(H4_FACTOR * TITLE_LINE_HEIGHT),
        color: TITLE_COLOR, // colors.violetDark,
        fontFamily: titleFont.regular,
        fontWeight: 'normal',
        letterSpacing: 1
    },
    blockquoteContainer: {
        marginLeft: -40
    },
    blockquoteImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 100,
        width: 100,
        resizeMode: 'contain',
        tintColor: chroma(colors.orange).alpha(0.3).css()
    },
    blockquoteTextContainer: {
        marginLeft: 70,
        marginTop: 40
    },
    blockquote: {
        fontFamily: baseFont.light,
        fontSize: 32,
        lineHeight: 38,
        letterSpacing: 1
    },
    p: {
        ...P_STYLE()
    },
    a: {
        color: LINK_COLOR,
        fontFamily: baseFont.bold,
        fontSize: P_FONT_SIZE,
        textDecorationLine: 'underline'
    },
    strong: {
        fontFamily: baseFont.bold
    },
    b: {
        fontWeight: 'normal',
        fontFamily: baseFont.bold
    },
    em: {
        fontStyle: null,
        fontFamily: baseFont.regular
    },
    i: {
        fontStyle: null,
        fontFamily: baseFont.light
    },
    imgContainer: {
        marginTop: 10,
        marginBottom: 10,
        paddingBottom: 25,
        overflow: 'visible'
    },
    imgBackground: {
        position: 'absolute',
        bottom: 0,
        right: IMAGE_BACKGROUND_RIGHT,
        height: IMAGE_BACKGROUND_HEIGHT,
        width: IMAGE_BACKGROUND_WIDTH
    },
    img: {
        // ...IMAGE_INITIAL_SIZE,
        borderBottomLeftRadius: IMAGE_RADIUS,
        borderTopLeftRadius: IMAGE_RADIUS,
        backgroundColor: colors.violetLight
    },
    hr: {
        marginTop: emSize(1),
        marginBottom: emSize(1),
        height: 1,
        backgroundColor: getBackgroundNuance()
    },
    ul: {
        paddingLeft: 20,
        paddingRight: 0
    },
    li: {
        color: colors.grayDark,
        fontFamily: baseFont.regular,
        fontSize: 14,
        letterSpacing: 1
    },
    ol: {
        paddingLeft: 20,
        paddingRight: 0
    },
    ulPrefix: {
        marginTop: 3,
        paddingRight: 10,
        color: ACTIVE_COLOR,
        fontFamily: baseFont.light,
        fontSize: adaptedFontSize(0.9)
    },
    olPrefix: {
        marginTop: 3,
        paddingRight: 10,
        color: ACTIVE_COLOR,
        fontFamily: baseFont.regular,
        fontSize: adaptedFontSize(1.1)
    },
    liText: {
        ...P_STYLE(),
        marginBottom: 0
    },
    ulContainer: {
        marginTop: 5,
        marginBottom: 10,
        paddingLeft: 30
    },
    olContainer: {
        marginTop: 5,
        marginBottom: 10,
        paddingLeft: 30
    },
    ulContainerInner: {
        marginBottom: 6,
        flexDirection: 'row'
    },
    olContainerInner: {
        marginBottom: 6,
        flexDirection: 'row'
    },
    ulBullet: {
        height: UL_BULLET_HEIGHT,
        width: UL_BULLET_WIDTH,
        alignSelf: 'flex-start',
        marginTop: 6,
        marginRight: 12
    },
    olBullet: {
        alignSelf: 'flex-start',
        marginRight: 12
    },
    olBulletNumber: {
        color: ACTIVE_COLOR,
        fontFamily: baseFont.bold,
        fontSize: 14,
        textAlign: 'center'
    },
    asideWrapper: {
        paddingRight: 20,
        paddingBottom: 20
    },
    asideContainer: {
        backgroundColor: colors.pink,
        padding: 20,
        borderRadius: ASIDE_BORDER_RADIUS
    },
    asideBorder: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        bottom: 10,
        borderColor: colors.pink,
        borderRadius: ASIDE_BORDER_RADIUS,
        borderWidth: 1
    }
});
