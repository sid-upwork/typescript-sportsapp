import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { titleFont } from '../base/fonts.style';

export const INPUT_COLORS_SCALE = chroma.scale([colors.orange, colors.pink]);

const EMAIL_ICON_WIDTH = 28;
const EMAIL_ICON_HEIGHT = 22;
const USER_ICON_WIDTH = 14;
const USER_ICON_HEIGHT = 17;
const AT_ICON_SIZE = 17;
const PADLOCK_ICON_WIDTH = 13;
const PADLOCK_ICON_HEIGHT = 17;

export default StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject
    },
    loaderBlurContainer: {
        opacity: 0.75
    },
    labelContainer: {
        position: 'absolute'
    },
    labelEmailIcon: {
        width: EMAIL_ICON_WIDTH,
        height: EMAIL_ICON_HEIGHT
    },
    label: {
        fontFamily: titleFont.bold,
        fontSize: 25,
        color: colors.violetDark,
        textTransform: 'uppercase',
        marginLeft: 15
    },
    userIcon: {
        width: USER_ICON_WIDTH,
        height: USER_ICON_HEIGHT
    },
    atIcon: {
        width: AT_ICON_SIZE,
        height: AT_ICON_SIZE
    },
    padlockIcon: {
        width: PADLOCK_ICON_WIDTH,
        height: PADLOCK_ICON_HEIGHT
    }
});
