import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    picker: {
        width: 100
    },
    item: {
        color: colors.violetDark
    },
    seperator: {
        fontSize: 20,
        color: colors.violetDark
    }
});
