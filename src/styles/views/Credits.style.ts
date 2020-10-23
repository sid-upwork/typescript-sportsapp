import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { isAndroid } from '../../utils/os';
import { viewportWidth, statusBarOffset, headerHeight, isLWidth, iosHomeIndicatorOffset } from '../base/metrics.style';
import { titleFont, baseFont } from '../base/fonts.style';
import colors from '../base/colors.style';

export const GRADIENT_COLORS = [colors.pink, colors.orange];

const BACKGROUND_TOP_RATIO = 423 / 322;
export const BACKGROUND_TOP_WIDTH = viewportWidth * 1;
export const BACKGROUND_TOP_HEIGHT = Math.round(BACKGROUND_TOP_WIDTH / BACKGROUND_TOP_RATIO);
const BACKGROUND_TOP_POSITION = -Math.round(BACKGROUND_TOP_HEIGHT * 0.45) + statusBarOffset;

const CONTENT_MARGIN_LEFT = 22;
const BULLER_SIZE = 6;
const BUTTON_SIZE = 28;

const ARROW_DOWN_ICON_RATIO = 24 / 14;
export const ARROW_DOWN_ICON_WIDTH = 10;
export const ARROW_DOWN_ICON_HEIGHT = Math.round(ARROW_DOWN_ICON_WIDTH / ARROW_DOWN_ICON_RATIO);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    scrollView: {
        paddingTop: BACKGROUND_TOP_HEIGHT + Math.round(BACKGROUND_TOP_POSITION * 1.75),
        paddingBottom: Math.max(iosHomeIndicatorOffset, 50)
    },
    backgroundTop: {
        position: 'absolute',
        top: BACKGROUND_TOP_POSITION,
        right: -BACKGROUND_TOP_WIDTH * 0.2
    },
    creditsContainer: {
        paddingHorizontal: 30
    },
    creditCategoryTitle: {
        marginTop: 35,
        marginBottom: 15,
        color: colors.violetDark,
        textTransform: 'uppercase',
        fontSize: isLWidth ? 28 : 26,
        fontFamily: titleFont.black
    },
    entryDiffuseShadow: {
        bottom: 1
    },
    entryContainer: {
        marginTop: 6,
        marginLeft: CONTENT_MARGIN_LEFT,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: colors.background,
        borderRadius: 10,
        borderColor: chroma(colors.violetDark).alpha(0.35).css(),
        borderWidth: isAndroid ? StyleSheet.hairlineWidth : 1
    },
    entryContainerLeft: {
        flex: 1
    },
    entryTitle: {
        color: colors.violetDark,
        fontSize: 14,
        fontFamily: baseFont.bold,
        letterSpacing: 0.25
    },
    entryButtonContainer: {
        height: BUTTON_SIZE,
        width: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: colors.violetDark,
        justifyContent: 'center',
        alignItems: 'center'
    },
    entryButtonGradient: {
        borderRadius: BUTTON_SIZE / 2,
    },
    entryButtonIcon: {
        width: ARROW_DOWN_ICON_WIDTH,
        height: ARROW_DOWN_ICON_HEIGHT,
        transform: [{
            rotateZ: '-90deg'
        }],
        tintColor: chroma('white')
    },
    iconEntryContainer: {
        flexDirection: 'row',
        marginLeft: CONTENT_MARGIN_LEFT,
        paddingVertical: 5
    },
    iconEntryBullet: {
        width: BULLER_SIZE,
        height: BULLER_SIZE,
        marginTop: 6,
        marginRight: 10,
        borderRadius: BULLER_SIZE / 2,
        backgroundColor: colors.violetDark
    },
    iconEntry: {
        flex: 1,
        color: colors.violetDark,
        fontSize: 13,
        fontFamily: baseFont.regular,
        letterSpacing: 0.25
    },
    iconEntryLink: {
        color: colors.pink,
        fontSize: 13,
        fontFamily: baseFont.bold,
        textDecorationLine: 'underline'
    }
});
