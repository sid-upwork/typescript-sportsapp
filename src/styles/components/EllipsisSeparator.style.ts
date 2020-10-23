import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { isXLHeight } from '../base/metrics.style';
import colors from '../base/colors.style';

export default StyleSheet.create({
    containerText: {
        position: 'relative'
    },
    text: {
        fontSize: isXLHeight ? 24 : 18,
        color: chroma(colors.violetLight).alpha(0.45).css(),
        lineHeight: isXLHeight ? 24 : 18,
        letterSpacing: 3
    },
    firstLine: {
        marginLeft: 10
    },
    secondLine: {
    }
});
