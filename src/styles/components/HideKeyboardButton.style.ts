import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import keyboardButtonStyles, { BUTTON_SIZE } from './CustomKeyboardButton.style';
import androidElevations from '../../utils/androidElevations';

const BUTTON_COLOR = colors.white;
const BUTTON_BORDER_RADIUS = BUTTON_SIZE / 2;
const ICON_SIZE = 26;
const ICON_COLOR = colors.violetDark;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        position: 'absolute',
        right: keyboardButtonStyles.container.right,
        bottom: keyboardButtonStyles.container.bottom * 2 + BUTTON_SIZE
    },
    button: {
        width: BUTTON_SIZE,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BUTTON_COLOR,
        borderRadius: BUTTON_BORDER_RADIUS,
        shadowColor: chroma(colors.blueDark).darken(2).css(),
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 8,
        elevation: androidElevations.global.keyboardButton
    },
    gradient: {
        borderRadius: BUTTON_BORDER_RADIUS
    },
    icon: {
        width: ICON_SIZE,
        aspectRatio: 1,
        color: ICON_COLOR
    }
});
