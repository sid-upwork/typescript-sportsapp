import { StyleSheet } from 'react-native';
import { isAndroid } from '../../utils/os';
import colors from '../base/colors.style';
import { titleFont } from '../base/fonts.style';
import { isLWidth, isMWidth } from '../base/metrics.style';

export const BLUE_GRADIENT_COLORS = [colors.blueLight, colors.blueDark];
export const PINK_GRADIENT_COLORS = [colors.orange, colors.pink];

const BORDER_RADIUS = 20;
const BORDER_WIDTH = isAndroid ? StyleSheet.hairlineWidth : 1;

export default StyleSheet.create({
    buttonBackground: {
        ...StyleSheet.absoluteFillObject,
        top: 15,
        left: 15,
        borderWidth: BORDER_WIDTH,
        borderColor: colors.white,
        borderRadius: BORDER_RADIUS
    },
    buttonContainer: {
    },
    buttonContainerWhiteBackground: {
        borderWidth: BORDER_WIDTH,
        borderRadius: BORDER_RADIUS,
        borderColor: colors.violetDark
    },
    buttonContainerWithBackgroundBorders: {
        paddingRight: 10,
        paddingBottom: 10
    },
    diffuseShadow: {
        bottom: 10
    },
    buttonContentContainer: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS,
        backgroundColor: colors.white
    },
    buttonContentContainerWhite: {
        elevation: 0
    },
    buttonGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: BORDER_RADIUS
    },
    buttonContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonContentWithIcon: {
        alignSelf: 'flex-start'
    },
    buttonIcon: {
        width : 30,
        aspectRatio: 1 / 1,
        resizeMode: 'contain'
    },
    buttonIconColoredBackground: {
        tintColor: colors.black
    },
    buttonIconWhiteBackground: {
        tintColor: colors.orange
    },
    buttonText: {
        // flex: 1,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 21 : (isMWidth ? 18 : 17),
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    }
});
