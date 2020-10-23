import { StyleSheet } from 'react-native';
import { isAndroid } from '../../../utils/os';
import chroma from 'chroma-js';
import { viewportWidth, viewportHeight } from '../../base/metrics.style';
import colors from '../../base/colors.style';
import { SETS_CONTAINER_HEIGHT } from './WorkoutExerciseTable.style';

export const ITEM_WIDTH = viewportWidth;

const DARK_GRADIENT_2ND_LOCATION = isAndroid ? 0.35 : 0.25;
let SETS_CONTAINER_TOP: any = (SETS_CONTAINER_HEIGHT / viewportHeight).toFixed(2);
SETS_CONTAINER_TOP = SETS_CONTAINER_TOP <= DARK_GRADIENT_2ND_LOCATION ?
    DARK_GRADIENT_2ND_LOCATION - 0.1 :
    SETS_CONTAINER_TOP;
export const DARK_GRADIENT_LOCATIONS = [
    0,
    DARK_GRADIENT_2ND_LOCATION,
    1 - SETS_CONTAINER_TOP,
    1
];

const DARK_GRADIENT_COLOR = chroma(colors.violetDark).darken(2).desaturate(1.5);
export const DARK_GRADIENT_COLORS = [
    chroma(DARK_GRADIENT_COLOR).alpha(0).css(),
    chroma(DARK_GRADIENT_COLOR).alpha(0).css(),
    chroma(DARK_GRADIENT_COLOR).alpha(0.75).css(),
    chroma(DARK_GRADIENT_COLOR).alpha(0.85).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    viewContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.violetDark,
        overflow: 'hidden'
    },
    overlayGradient: {
        backgroundColor: chroma(colors.violetDark).alpha(0.15).css()
    },
    exerciseContainer: {
        flex: 1,
        width: ITEM_WIDTH
    }
});
