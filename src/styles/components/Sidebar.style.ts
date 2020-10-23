import { StyleSheet } from 'react-native';
import { statusBarOffset, viewportWidth } from '../base/metrics.style';
import colors from '../base/colors.style';

export const SIDEBAR_WIDTH = Math.round(viewportWidth * 0.4);

const SIDEBAR_IMAGE_RATIO = 390 / 500;
const SIDEBAR_IMAGE_WIDTH = SIDEBAR_WIDTH;
export const SIDEBAR_IMAGE_HEIGHT = Math.round(SIDEBAR_IMAGE_WIDTH * SIDEBAR_IMAGE_RATIO);
export const SIDEBAR_IMAGE_TOP = statusBarOffset + 30;
const SIDEBAR_IMAGE_LEFT = -Math.round(SIDEBAR_IMAGE_WIDTH * 0.15);

export default StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        overflow: 'hidden'
    },
    bar: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.violetLight
    },
    imageContainer: {
        position: 'absolute',
        top: SIDEBAR_IMAGE_TOP,
        left: SIDEBAR_IMAGE_LEFT,
        width: SIDEBAR_IMAGE_WIDTH,
        height: SIDEBAR_IMAGE_HEIGHT,
        overflow: 'visible'
    }
});
