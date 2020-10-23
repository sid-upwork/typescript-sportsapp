import { StyleSheet } from 'react-native';
import colors from '../base/colors.style';

const HANDLE_HEIGHT = 6;

export default StyleSheet.create({
    handleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    handleIcon: {
        height: HANDLE_HEIGHT,
        borderRadius: HANDLE_HEIGHT / 2,
        shadowColor: colors.violetDark,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 6
    }
});
