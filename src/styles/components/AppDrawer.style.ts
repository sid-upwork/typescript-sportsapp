import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { viewportHeight, viewportWidth } from '../base/metrics.style';
import colors from '../base/colors.style';

const MIN_DRAWER_WIDTH = 280;
const MIN_DRAWER_OFFSET = 80;

export const DRAWER_ANIMATION_DURATION = 300;
export const DRAWER_OFFSET = viewportWidth > MIN_DRAWER_WIDTH + MIN_DRAWER_OFFSET ?
    viewportWidth - MIN_DRAWER_WIDTH :
    MIN_DRAWER_OFFSET;

export const DRAWER_WIDTH: number = viewportWidth - DRAWER_OFFSET;

export const DRAWER_PAN_CLOSE = parseFloat((DRAWER_OFFSET / viewportWidth).toFixed(2));
export const DRAWER_PAN_OPEN = 0.1;

const BACKGROUND_SIZE = Math.sqrt(viewportHeight * viewportHeight + viewportWidth * viewportWidth) * 2; // Hypotenuse

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    backgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
    },
    background: {
        left: viewportWidth,
        height: BACKGROUND_SIZE,
        aspectRatio: 1,
        borderRadius: BACKGROUND_SIZE / 2,
        backgroundColor: chroma(colors.violetDark).alpha(0.45).css()
    },
    drawer: {
        backgroundColor: 'transparent',
        elevation: 0
    },
    main: {
        shadowColor: colors.black,
        shadowOpacity: 0.4,
        shadowOffset: { width: -25, height: 50 },
        shadowRadius: 50
    },
    mainOverlay: {}
});
