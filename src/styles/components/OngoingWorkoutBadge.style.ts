import { StyleSheet } from 'react-native';
import colors from '../base/colors.style';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    badgeContainer: {
        backgroundColor: colors.orange,
        height: 30,
        width: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badge: {
        height: 15,
        aspectRatio: 1,
        tintColor: colors.white
    }
});
