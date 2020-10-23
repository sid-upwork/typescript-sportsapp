import { StyleSheet } from 'react-native';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { isLWidth, viewportHeight } from '../../base/metrics.style';

export const ONGOING_WORKOUT_POPUP_HEIGHT = Math.max(Math.round(viewportHeight * 0.55), 520);

const BORDER_RADIUS = 100;
const ICON_SIZE = 18;
const MARGIN = 16;

export default StyleSheet.create({
    container: {
    },
    infoContainer: {
        marginBottom: 30
    },
    info: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        paddingVertical: 12,
        paddingRight: 30,
        paddingLeft: 20,
        borderTopRightRadius: BORDER_RADIUS,
        borderBottomRightRadius: BORDER_RADIUS,
        backgroundColor: colors.pinkLight
    },
    icon: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        marginRight: 12,
        tintColor: colors.white
    },
    date: {
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: 16
    },
    workoutTitle: {
        marginBottom: 20,
        paddingHorizontal: 30,
        color: colors.pinkLight,
        fontFamily: titleFont.black,
        fontSize: isLWidth ? 26 : 24,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    buttonContainer: {
        paddingHorizontal: 30
    },
    continueContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: MARGIN
    },
    continueNow: {
        flex: 1,
        marginRight: MARGIN
    },
    remindMe: {
        flex: 1
    },
    completeButton: {
        marginBottom: MARGIN
    }
});
