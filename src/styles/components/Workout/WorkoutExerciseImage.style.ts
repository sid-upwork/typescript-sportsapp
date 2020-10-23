import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        overflow: 'hidden'
    },
    underlay: {
        backgroundColor: colors.violetDark
    }
});
