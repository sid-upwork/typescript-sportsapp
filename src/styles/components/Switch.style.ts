import { StyleSheet } from 'react-native';

export const THUMB_SIZE = 20;
export const THUMB_PADDING = 5;

export const SWITCH_WIDTH = 60;
const SWITCH_HEIGHT = 30;
const SWITCH_BORDER_RADIUS = SWITCH_WIDTH / 2;

export default StyleSheet.create({
    container: {
        width: SWITCH_WIDTH,
        height: SWITCH_HEIGHT,
        justifyContent: 'center',
        borderRadius: SWITCH_BORDER_RADIUS,
        borderWidth: 1
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: SWITCH_BORDER_RADIUS
    },
    thumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2
    }
});
