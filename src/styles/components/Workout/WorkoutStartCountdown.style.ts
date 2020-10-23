import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { baseFont } from '../../base/fonts.style';
import { viewportWidth, viewportHeight, isLWidth } from '../../base/metrics.style';

const NUMBER_COLOR = colors.blueDark;
const NUMBER_SIZE = isLWidth ? 140 : 120;
const TEXT_SIZE = Math.round(NUMBER_SIZE * 0.75);

const SHAPE_TOP_RIGHT_RATIO = 836 / 1605;
const SHAPE_TOP_RIGHT_HEIGHT = Math.round(viewportHeight * 1.1);
const SHAPE_TOP_RIGHT_WIDTH = SHAPE_TOP_RIGHT_HEIGHT * SHAPE_TOP_RIGHT_RATIO;

const SHAPE_LEFT_RATIO = 366 / 342;
const SHAPE_LEFT_WIDTH = Math.round(viewportWidth * 0.75);
const SHAPE_LEFT_HEIGHT = Math.round(SHAPE_LEFT_WIDTH / SHAPE_LEFT_RATIO);

const SHAPE_RIGHT_RATIO = 323 / 410;
const SHAPE_RIGHT_WIDTH = Math.round(viewportWidth * 0.7);
const SHAPE_RIGHT_HEIGHT = Math.round(SHAPE_RIGHT_WIDTH / SHAPE_RIGHT_RATIO);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    overlayBlurAndroid: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: chroma(colors.background).alpha(0.98).css()
    },
    shapeTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: SHAPE_TOP_RIGHT_WIDTH,
        height: SHAPE_TOP_RIGHT_HEIGHT,
        opacity: 0.35
    },
    shapeLeft: {
        position: 'absolute',
        bottom: -Math.round(SHAPE_LEFT_HEIGHT * 0.05),
        left: -Math.round(SHAPE_LEFT_WIDTH * 0.25),
        width: SHAPE_LEFT_WIDTH,
        height: SHAPE_LEFT_HEIGHT
    },
    shapeRight: {
        position: 'absolute',
        top: Math.round(viewportHeight * 0.1),
        right: -Math.round(SHAPE_RIGHT_WIDTH * 0.35),
        width: SHAPE_RIGHT_WIDTH,
        height: SHAPE_RIGHT_HEIGHT
    },
    numberContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    number: {
        color: NUMBER_COLOR,
        fontFamily: baseFont.regular,
        fontSize: NUMBER_SIZE,
        shadowColor: NUMBER_COLOR,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 30 },
        shadowRadius: 40
    },
    label: {
        fontFamily: baseFont.bold,
        fontSize: TEXT_SIZE,
        textTransform: 'uppercase'
    }
});
