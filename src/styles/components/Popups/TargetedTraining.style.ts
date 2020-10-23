import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { titleFont, baseFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';
import { isMHeight, isMWidth } from '../../base/metrics.style';

export const GRADIENT_COLORS = [colors.orangeDark, colors.pink]; // To be removed
export const WORKOUT_CONTAINER_HEIGHT = isMHeight ? 90 : 80;
export const TITLE_WIDTH = 60;

const BACKGROUND_IMAGE_SIZE = 250;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    backgroundContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: BACKGROUND_IMAGE_SIZE,
        aspectRatio: 1,
        transform: [{ translateX: BACKGROUND_IMAGE_SIZE / 2 }]
    },
    contentContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    labelContainer: {
        width: TITLE_WIDTH,
        paddingTop: 20
    },
    label: {
        color: colors.violetDark
    },
    listWrapper: {
        flex: 1,
        paddingRight: 25
    },
    headerContainer: {
        paddingTop: 20,
        paddingBottom: 25
    },
    title: {
        fontFamily: titleFont.bold,
        fontSize: 18,
        color: colors.violetDark,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    workoutAreas: {
        marginBottom: 8,
        fontFamily: baseFont.regular,
        fontSize: 15,
        color: chroma(colors.violetDark).alpha(0.75).css(),
        letterSpacing: 1
    },
    workoutContainer: {
        flexDirection: 'row',
        height: WORKOUT_CONTAINER_HEIGHT,
        marginBottom: 12
    },
    workoutLeftContainer: {
        flex: 1
    },
    workoutImageContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.violetLight,
        opacity: 0.7
    },
    workoutRightContainer: {
        flex: 2,
        paddingLeft: 10
    },
    workoutDescription: {
        marginTop: 6,
        fontFamily: baseFont.regular,
        fontSize: 12,
        color: chroma(colors.white).alpha(0.85).css()
    },
    workoutTitle: {
        paddingTop: 5,
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 15 : 13,
        color: colors.white,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    noItemContainer: {
        marginVertical: 20,
        borderColor: colors.white
    },
    noItemContainerInner: {
        borderColor: colors.white
    },
    noItemText: {
        color: colors.white
    },
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 30
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 14
    }
});
