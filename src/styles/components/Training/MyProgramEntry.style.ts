import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import chroma from 'chroma-js';
import { titleFont, baseFont } from '../../base/fonts.style';
import { isLWidth } from '../../base/metrics.style';
import {
    CAROUSEL_HEIGHT,
    ITEM_CONTAINER_WIDTH,
    ITEM_CONTAINER_MARGIN_RIGHT,
    TOP_RIGHT_CONTAINER_PADDING_RIGHT
} from './MyProgram.style';

export const GO_BUTTON_LINEAR_GRADIENT = [colors.orange, colors.violetLight];
export const DONE_BUTTON_LINEAR_GRADIENT = [colors.pink, colors.gray];
export const DESCRIPTION_CONTAINER_GRADIENT = [colors.pinkLight, colors.violetLight];
export const REST_DAY_LINEAR_GRADIENT = [colors.violetVeryLight, colors.pink];
export const REST_DAY_LINEAR_GRADIENT_DONE = [colors.orangeVeryLight, colors.orangeVeryLight];

export const PLACEHOLDER_GRADIENT = ['#FFFADE', colors.pinkLight];
export const PLACEHOLDER_GRADIENT_VARIANT = [
    chroma(PLACEHOLDER_GRADIENT[0]).saturate(1).brighten(0.75),
    chroma(PLACEHOLDER_GRADIENT[1]).saturate(1).brighten(0.75)
];
const PLACEHOLDER_SCALE = chroma.scale(PLACEHOLDER_GRADIENT);
const IMAGE_BACKGROUND_COLOR = PLACEHOLDER_SCALE(0.6).css();

const ITEM_CONTAINER_PADDING_BOTTOM = 40;

const CONTENT_WIDTH = ITEM_CONTAINER_WIDTH - TOP_RIGHT_CONTAINER_PADDING_RIGHT;
const CONTENT_BORDER_RADIUS = 20;

const GO_BUTTON_SIZE = isLWidth ? 70 : 64;

export const DIFFUSE_SHADOW_HORIZONTAL_OFFSET = 20;
export const DIFFUSE_SHADOW_VERTICAL_OFFSET = 14;
export const DIFFUSE_SHADOW_VERTICAL_OFFSET_DONE = 10;
export const DIFFUSE_SHADOW_BORDER_RADIUS = 20;
export const DIFFUSE_SHADOW_OPACITY = 0.3;
export const DIFFUSE_SHADOW_OPACITY_DONE = 0.18;
export const DIFFUSE_SHADOW_COLOR = chroma(colors.blueDark).darken(1.5).css();

const QUOTE_RATIO = 213 / 301;
const QUOTE_WIDTH = 100;
const QUOTE_HEIGHT = Math.round(QUOTE_WIDTH * QUOTE_RATIO);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    itemContainer: {
        flex: 1,
        width: ITEM_CONTAINER_WIDTH,
        marginRight: ITEM_CONTAINER_MARGIN_RIGHT,
        paddingBottom: ITEM_CONTAINER_PADDING_BOTTOM
    },
    diffuseShadow: {
        left: 0,
        right: TOP_RIGHT_CONTAINER_PADDING_RIGHT,
        bottom: ITEM_CONTAINER_PADDING_BOTTOM
    },
    borderContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: CONTENT_WIDTH
    },
    border: {
        position: 'absolute',
        width: CONTENT_WIDTH,
        top: 10,
        right: 10,
        bottom: ITEM_CONTAINER_PADDING_BOTTOM - 10,
        borderRadius: CONTENT_BORDER_RADIUS,
        borderWidth: 1,
        borderColor: colors.white
    },
    contentContainer: {
        flex: 1,
        width: CONTENT_WIDTH,
        borderRadius: CONTENT_BORDER_RADIUS,
        overflow: 'hidden',
        backgroundColor: IMAGE_BACKGROUND_COLOR
    },
    contentContainerPlaceholder: {
        backgroundColor: IMAGE_BACKGROUND_COLOR
    },
    workoutImageContainer: {
        flex: 1,
        minHeight: Math.round(CAROUSEL_HEIGHT / 2),
        backgroundColor: IMAGE_BACKGROUND_COLOR
    },
    workoutImage: {
        flex: 1
    },
    workoutImageContainerOverlayDone: {
        backgroundColor: chroma(colors.orangeVeryLight).alpha(0.8).css()
    },
    workoutCompletedTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    workoutCompletedText: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 18 : 16,
        letterSpacing: 1,
        color: colors.violetDark,
        textTransform: 'uppercase'
    },
    workoutDescriptionContainer: {
        backgroundColor: colors.violetLight,
        paddingVertical: isLWidth ? 30 : 28,
        paddingHorizontal: isLWidth ? 25 : 22,
        overflow: 'visible'
    },
    workoutDescriptionContainerOverlayDone: {
        backgroundColor: colors.orangeVeryLight
    },
    workoutTitle: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 21 : 19,
        letterSpacing: isLWidth ? 1 : 0.5,
        textTransform: 'uppercase',
        color: colors.white
    },
    workoutDescription: {
        marginTop: 7,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 14 : 13,
        letterSpacing: 0.5,
        color: colors.white
    },
    workoutDescriptionTextDone: {
        color: colors.violetDark
    },
    goButtonContainer: {
        position: 'absolute',
        top: -Math.round(GO_BUTTON_SIZE / 3 * 2),
        right: 20,
        height: GO_BUTTON_SIZE,
        width: GO_BUTTON_SIZE,
        borderRadius: GO_BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 6
    },
    goGradient: {
        ...StyleSheet.absoluteFillObject
    },
    goButtonText: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 25 : 23,
        letterSpacing: isLWidth ? 1 : 0.5,
        color: colors.white,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    goButtonTextDone: {
        fontSize: 14
    },
    restDayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.pink
    },
    restDayImageWrapper: {
        ...StyleSheet.absoluteFillObject
    },
    restDayImageContainer: {
        height: '100%',
        backgroundColor: colors.violetVeryLight
    },
    restDayGradient: {
        ...StyleSheet.absoluteFillObject
    },
    restDayContentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 25
    },
    restDayTitle: {
        textAlign: 'center',
        marginBottom: 18
    },
    restDayQuoteContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    restDayQuoteContainerInner: {
        marginBottom: 15 // Quote offset
    },
    restDayQuote: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: QUOTE_WIDTH,
        height: QUOTE_HEIGHT,
        tintColor: chroma(colors.violetLight).alpha(0.55)
    },
    restDayMessage: {
        marginTop: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        color: colors.white,
        fontFamily: baseFont.bold,
        textAlign: 'center'
    },
    restDayAuthor: {
        alignSelf: 'flex-end',
        fontSize: 14,
        color: colors.white,
        fontFamily: baseFont.regular,
        marginTop: 18,
        paddingLeft: 30,
        paddingRight: 15
    },
    restDayButtonContainer: {
        alignItems: 'flex-end'
    },
    restDayButton: {
        height: GO_BUTTON_SIZE,
        width: GO_BUTTON_SIZE,
        borderRadius: GO_BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: colors.blueDark
    },
    restDayGoButtonText: {
        fontFamily: titleFont.bold,
        fontSize: 16,
        letterSpacing: 1,
        color: colors.white,
        textTransform: 'uppercase'
    },
    restDayTextDone: {
        color: chroma(colors.violetDark).desaturate(2).alpha(0.75).css()
    },
    restDayQuoteDone: {
        tintColor: chroma(colors.violetVeryLight).alpha(0.35).css()
    },
    badge: {
        position: 'absolute',
        top: 10,
        left: 10
    }
});
