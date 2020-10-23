import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';

export const PROGRESSION_INITIAL_HEIGHT = 8;
export const PROGRESSION_DONE_HEIGHT = 30;

const ACTIVE_SCALE = chroma.scale([colors.blueLight, colors.blueDark]);
export const ACTIVE_COLOR = ACTIVE_SCALE(0.35);

const BORDER_WIDTH = StyleSheet.hairlineWidth;

const HIGHLIGHT_COLOR = colors.violetLight;

const MARGIN = 16;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1,
        height: PROGRESSION_INITIAL_HEIGHT,
        marginBottom: -1,
        borderTopWidth: BORDER_WIDTH,
        borderBottomWidth: BORDER_WIDTH,
        borderRightWidth: BORDER_WIDTH,
        borderColor: HIGHLIGHT_COLOR
    },
    containerFirst: {
        borderLeftWidth: BORDER_WIDTH
    },
    containerLast: {
        // borderRightWidth: BORDER_WIDTH
    },
    containerMarginLeft: {
        marginLeft: MARGIN / 2
    },
    containerMarginRight: {
        marginRight: MARGIN / 2
    },
    visible: {
        backgroundColor: chroma(ACTIVE_COLOR).alpha(0.85).css()
    }
});
