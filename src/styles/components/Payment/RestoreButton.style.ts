import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { baseFont } from '../../base/fonts.style';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
    },
    restoreLink: {
        marginTop: 20,
        marginBottom: 10,
        paddingVertical: 7,
        paddingHorizontal: 14,
        backgroundColor: colors.violetDark,
        alignSelf: 'center',
        borderRadius: 8,
        elevation: 8
    },
    restoreLinkLabel: {
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: 13,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    }
});
