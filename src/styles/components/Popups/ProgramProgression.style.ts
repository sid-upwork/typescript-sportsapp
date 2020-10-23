import { StyleSheet } from 'react-native';
// import chroma from 'chroma-js';
import { titleFont, baseFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';
import { isMWidth } from '../../base/metrics.style';

export const BASE_COLOR = colors.violetDark;
export const PROGRESSION_COLOR = colors.pink;

const ICON_SIZE = isMWidth ? 74 : 64;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    contentContainer: {
        flex: 1,
        paddingTop: 10,
        paddingHorizontal: isMWidth ? 30 : 25
    },
    title: {
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 24 : 20,
        letterSpacing: isMWidth ? 1 : 0.5,
        textAlign: 'center',
        color: BASE_COLOR,
        textTransform: 'uppercase'
    },
    subtitle: {
        marginTop: 12,
        paddingHorizontal: isMWidth ? 20 : 15,
        fontFamily: titleFont.regular,
        fontSize: isMWidth ? 17 : 16,
        letterSpacing: 0.5,
        textAlign: 'center',
        color: BASE_COLOR
    },
    icon: {
        alignSelf: 'center',
        width: ICON_SIZE,
        aspectRatio: 1,
        marginBottom: 25
    },
    completionContainer: {
        marginTop: 30,
        alignItems: 'center'
    },
    completionTitle: {
        marginBottom: 4,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 17 : 16,
        textAlign: 'center',
        color: PROGRESSION_COLOR
    },
    completionCircleContainer: {
        marginTop: 10
    },
    completionPercentageContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    },
    completionPercentage: {
        color: PROGRESSION_COLOR,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 24 : 20
    },
    progressBarContainer: {
        width: '70%'
    },
    progressBarPercentageContainer: {
        marginBottom: 4,
        alignSelf: 'center'
    },
    buttonsContainer: {
        marginTop: 30
    },
    button: {
        marginTop: 15,
        paddingHorizontal: 22,
        paddingVertical: 17
    },
    buttonText: {
        fontSize: isMWidth ? 18 : 16
    },
    popupStateContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
