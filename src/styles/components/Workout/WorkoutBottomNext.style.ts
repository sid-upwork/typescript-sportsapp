import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { SHEET_NEXT_IMAGE_HEIGHT, BUTTON_PLUS_SIZE, BUTTON_MARGIN } from './WorkoutBottomButtons.style';
import { isMWidth } from '../../base/metrics.style';

export const COMING_UP_WIDTH = 34;

const IMAGE_RATIO = isMWidth ? 4 / 3 : 1;
export const IMAGE_HEIGHT = SHEET_NEXT_IMAGE_HEIGHT;
const IMAGE_WIDTH = SHEET_NEXT_IMAGE_HEIGHT * IMAGE_RATIO;
const IMAGE_BORDER_RADIUS = 15;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: BUTTON_PLUS_SIZE + BUTTON_MARGIN * 2
    },
    infoContainer: {
        flex: 1,
        paddingLeft: isMWidth ? 20 : 14
    },
    infoContainerEmpty: {
        justifyContent: 'center'
    },
    circuitType: {
        marginTop: -2,
        marginBottom: 3,
        color: colors.grayLight,
        fontFamily: baseFont.regular,
        fontSize: isMWidth ? 12 : 11
    },
    title: {
        color: colors.violetDark,
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 16 : 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    titleEmpty: {
        color: colors.violetLight,
        fontFamily: baseFont.regular,
        fontSize: isMWidth ? 14 : 13,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    set: {
        marginTop: 8,
        color: colors.violetLight,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 13 : 12,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    imageWrapper: {
        flexDirection: 'row'
    },
    imageContainer: {
        width: IMAGE_WIDTH,
        height: SHEET_NEXT_IMAGE_HEIGHT
    },
    comingUpLabel: {
        color: colors.grayLight,
        fontFamily: baseFont.regular,
        fontSize: 12,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: IMAGE_BORDER_RADIUS,
        backgroundColor: colors.violetDark
    },
    imageEmpty: {
        backgroundColor: colors.violetLight
    }
});
