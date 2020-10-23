import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        overflow: 'hidden',
        backgroundColor: colors.violetUltraLight
    },
    blurAndroid: {
        backgroundColor: chroma(colors.background).alpha(0.9).css()
    }
});
