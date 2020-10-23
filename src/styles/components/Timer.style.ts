import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';

const DOT_SIZE = 4;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dotsContainer: {
    },
    dot: {
        width: DOT_SIZE,
        aspectRatio: 1,
        marginVertical: 1,
        marginHorizontal: 2,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: chroma(colors.violetDark).alpha(0.75).css()
    }
});
