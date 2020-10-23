import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { viewportWidth, viewportHeight, headerHeight, isLWidth } from '../base/metrics.style';
import { TITLE_CONTAINER_WIDTH } from '../components/SharedVerticalTitle.style';
import { titleFont } from '../base/fonts.style';
import colors from '../base/colors.style';

export const LIST_HEADER_HEIGHT = Math.round(viewportHeight * (isLWidth ? 0.32 : 0.29));
const LIST_PADDING_RIGHT = 25;

const BACKGROUND_TOP_RATIO = 836 / 1605;
const BACKGROUND_TOP_WIDTH = viewportWidth;
const BACKGROUND_TOP_HEIGHT = Math.round(BACKGROUND_TOP_WIDTH / BACKGROUND_TOP_RATIO);

const BACKGROUND_RIGHT_RATIO = 398 / 3146;
const BACKGROUND_RIGHT_WIDTH = 300;
const BACKGROUND_RIGHT_HEIGHT = Math.round(BACKGROUND_RIGHT_WIDTH / BACKGROUND_RIGHT_RATIO);

const BACKGROUND_BOTTOM_RATIO = 360 / 343;
export const BACKGROUND_BOTTOM_WIDTH = viewportWidth * 0.75;
export const BACKGROUND_BOTTOM_HEIGHT = Math.round(BACKGROUND_BOTTOM_WIDTH / BACKGROUND_BOTTOM_RATIO);

const LIST_HEADER_BACKGROUND_IMAGE_RATIO = 470 / 440;
const LIST_HEADER_BACKGROUND_IMAGE_HEIGHT = Math.round(LIST_HEADER_HEIGHT * 1.1);
const LIST_HEADER_BACKGROUND_IMAGE_WIDTH = Math.round(LIST_HEADER_BACKGROUND_IMAGE_HEIGHT * LIST_HEADER_BACKGROUND_IMAGE_RATIO );

const LIST_HEADER_IMAGE_RATIO = 1;
const LIST_HEADER_IMAGE_HEIGHT = Math.round(LIST_HEADER_BACKGROUND_IMAGE_WIDTH * LIST_HEADER_IMAGE_RATIO);
export const LIST_HEADER_IMAGE_WIDTH = LIST_HEADER_IMAGE_HEIGHT * LIST_HEADER_IMAGE_RATIO;

export default StyleSheet.create({
    container: {
        flex: 1
    },
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    scrollView: {
        ...StyleSheet.absoluteFillObject,
        paddingTop: headerHeight + LIST_HEADER_HEIGHT
    },
    scrollViewInner: {
        overflow: 'hidden'
    },
    backgroundTop: {
        position: 'absolute',
        right: -20,
        width: BACKGROUND_TOP_WIDTH,
        height: BACKGROUND_TOP_HEIGHT
    },
    backgroundRight: {
        position: 'absolute',
        top: -BACKGROUND_RIGHT_HEIGHT * 0.20,
        right: -25,
        width: BACKGROUND_RIGHT_WIDTH,
        height: BACKGROUND_RIGHT_HEIGHT
    },
    listHeaderContainer: {
        flexDirection: 'row'
    },
    listHeader: {
        height: LIST_HEADER_HEIGHT,
        width: viewportWidth
    },
    listHeaderEllipsis: {
        position: 'absolute',
        left: Math.round(viewportWidth * 0.15),
        bottom: LIST_HEADER_HEIGHT * 0.1
    },
    listHeaderInner: {
        flex: 1
    },
    listHeaderBackgroundImage: {
        position: 'absolute',
        top: -LIST_HEADER_BACKGROUND_IMAGE_HEIGHT * 0.15,
        right: -5,
        width: LIST_HEADER_BACKGROUND_IMAGE_WIDTH,
        height: LIST_HEADER_BACKGROUND_IMAGE_HEIGHT
    },
    listHeaderImage: {
        position: 'absolute',
        top: -LIST_HEADER_IMAGE_HEIGHT * 0.20,
        right: isLWidth ? 5 : -10,
        width: LIST_HEADER_IMAGE_WIDTH,
        height: LIST_HEADER_IMAGE_HEIGHT,
        resizeMode: 'contain'
    },
    listHeaderName: {
        width: LIST_HEADER_IMAGE_WIDTH,
        position: 'absolute',
        top: 8,
        left: isLWidth ? 25 : 15,
        color: colors.violetDark,
        fontFamily: titleFont.black,
        fontSize: isLWidth ? 42 : 36,
        letterSpacing: -0.5,
        textTransform: 'uppercase',
        textShadowColor: chroma(colors.violetDark).alpha(0.15).css(),
        textShadowOffset: {width: 0, height: 5},
        textShadowRadius: 5
    },
    loader: {
        alignItems: 'center',
        paddingTop: 50
    },
    list: {
        width: viewportWidth
    },
    listInner: {
        paddingLeft: TITLE_CONTAINER_WIDTH,
        paddingRight: LIST_PADDING_RIGHT
    },
    listBackground: {
        flex: 1,
        overflow: 'hidden'
    },
    listBackgroundTitle: {
        position: 'absolute',
        top: 5,
        bottom: 0,
        left: 0,
        width: TITLE_CONTAINER_WIDTH
    },
    listBackgroundImage: {
        position: 'absolute',
        bottom: -BACKGROUND_BOTTOM_HEIGHT * 0.5,
        left: -BACKGROUND_BOTTOM_WIDTH * 0.1
    },
    listForegroundGradientContainer: {
        // paddingLeft: TITLE_CONTAINER_WIDTH,
        // paddingRight: LIST_PADDING_RIGHT
    },
    listForegroundGradient: {
        height: 50
    },
    errorContainer: {
        marginTop: 20
    }
});
