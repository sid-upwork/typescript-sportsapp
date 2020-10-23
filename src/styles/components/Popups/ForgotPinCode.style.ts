import { StyleSheet } from 'react-native';
import keyboardButtonStyles, { BUTTON_SIZE } from '../../components/CustomKeyboardButton.style';
import { titleFont, baseFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';

const INPUT_HEIGHT = 53;
const BORDER_RADIUS = 8;

export default StyleSheet.create({
    formContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10 // Visually compensate title's margin bottom
    },
    container: {
        flex: 1,
        justifyContent: 'space-around',
        paddingTop: 30,
        paddingHorizontal: 30
    },
    title: {
        fontFamily: titleFont.regular,
        color: colors.pink,
        fontSize: 15,
        textAlign: 'center'
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 15,
        backgroundColor: '#EA76A1',
        borderRadius: BORDER_RADIUS,
        height: INPUT_HEIGHT,
        alignItems: 'center'
    },
    input: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontFamily: baseFont.bold,
        fontSize: 14,
        color: colors.white,
        letterSpacing: 1
    }
});
