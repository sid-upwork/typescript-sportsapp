import { StyleSheet } from 'react-native';
import { titleFont, baseFont } from '../base/fonts.style';
import colors from '../base/colors.style';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    backgroundImageContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30
    },
    title: {
        fontFamily: titleFont.bold,
        fontSize: 32,
        color: colors.violetDark,
        textTransform: 'uppercase',
        paddingVertical: 15
    },
    submitButtonContainer: {
        height: 40,
        backgroundColor: colors.orange,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5
    },
    submitButtonText: {
        fontFamily: baseFont.bold,
        fontSize: 21,
        color: colors.white
    }
});
