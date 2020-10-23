import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { viewportWidth, iosHomeIndicatorOffset, headerHeight, isLWidth, isMWidth } from '../base/metrics.style';
import { SIDEBAR_WIDTH, SIDEBAR_IMAGE_TOP, SIDEBAR_IMAGE_HEIGHT } from '../components/Sidebar.style';
import { TAB_TOTAL_HEIGHT } from '../components/CustomTabBar.style';
import { titleFont } from '../base/fonts.style';
import colorsStyle from '../base/colors.style';

const VECTOR_RATIO = 645 / 819;
const VECTOR_CONTAINER_WIDTH = viewportWidth;
const VECTOR_CONTAINER_HEIGHT = Math.round(VECTOR_CONTAINER_WIDTH / VECTOR_RATIO);
const VECTOR_CONTAINER_TOP = SIDEBAR_IMAGE_TOP + (SIDEBAR_IMAGE_HEIGHT / 2);

const IMAGE_RATIO = 400 / 440;
const IMAGE_WIDTH = Math.round(VECTOR_CONTAINER_WIDTH * 0.65);
const IMAGE_HEIGHT =  Math.round(IMAGE_WIDTH / IMAGE_RATIO);

export const SCROLL_CONTENT_TOP = VECTOR_CONTAINER_TOP + IMAGE_HEIGHT + 40;

const TITLE_CONTAINER_TOP = Math.round(VECTOR_CONTAINER_HEIGHT * 0.1);

export const PADDING_LEFT_TAB_BAR = 50;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        backgroundColor: colorsStyle.background
    },
    topContent: {
        ...StyleSheet.absoluteFillObject,
        top: VECTOR_CONTAINER_TOP,
        overflow: 'visible'
    },
    vector: {
        position: 'absolute',
        top: 0,
        right: -VECTOR_CONTAINER_WIDTH * 0.35,
        width: VECTOR_CONTAINER_WIDTH,
        height: VECTOR_CONTAINER_HEIGHT
    },
    titleContainer: {
        position: 'absolute',
        top: TITLE_CONTAINER_TOP,
        left: 0,
        right: 0,
        alignItems: 'flex-end'
    },
    titleTopSeparator: {
        paddingRight: Math.round(SIDEBAR_WIDTH * 0.8),
        paddingBottom: 10
    },
    titleTopSeparatorText: {
        color: chroma(colorsStyle.white).alpha(0.45).css()
    },
    titleBottomSeparator: {
        paddingRight: Math.round(SIDEBAR_WIDTH * 1.45),
        paddingTop: 10
    },
    title: {
        zIndex: 1,
        alignSelf: 'flex-start',
        paddingLeft: TAB_TOTAL_HEIGHT + 15,
        paddingRight: Math.round(SIDEBAR_WIDTH * 0.35),
        fontSize: isLWidth ? 58 : (isMWidth ? 54 : 42),
        fontFamily: titleFont.black,
        letterSpacing: 4,
        color: colorsStyle.violetDark,
        textTransform: 'uppercase'
    },
    imageContainer: {
        zIndex: 1,
        position: 'absolute',
        top: -TITLE_CONTAINER_TOP,
        right: -Math.round(IMAGE_WIDTH * 0.30),
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        resizeMode: 'contain',
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT
    },
    tabViewContainer: {
        ...StyleSheet.absoluteFillObject
    },
    tabView: {},
    sceneContainerStyle: {},
    loaderContainer: {
        alignItems: 'center',
        paddingVertical: 50
    },
    errorContainer: {
        marginBottom: 40,
        paddingVertical: 5,
        paddingHorizontal: 15
    },
    scrollContentContainer: {
        paddingTop: SCROLL_CONTENT_TOP,
        paddingBottom: iosHomeIndicatorOffset,
        paddingLeft: PADDING_LEFT_TAB_BAR
    }
});
