import { StyleSheet } from 'react-native';
import { iosHomeIndicatorOffset, isMWidth, headerHeight, isLWidth, isMHeight, isLHeight, statusBarOffset, baseHeaderHeight } from '../base/metrics.style';
import { baseFont, titleFont } from '../base/fonts.style';
import colors from '../base/colors.style';

export const TITLE_COLOR = colors.white;
export const ACTIVE_COLOR = colors.violetDark;
export const ERROR_COLOR = '#7D2225'; // colors.black

const BLOB_RATIO = 781 / 552;
const BLOB_HEIGHT = 500;
const BLOB_WIDTH = Math.round(BLOB_HEIGHT * BLOB_RATIO);
const BLOB_POSITION_TOP = -Math.round(BLOB_HEIGHT * 0.25);

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundBlob: {
        position: 'absolute',
        alignSelf: 'center',
        top: BLOB_POSITION_TOP,
        width: BLOB_WIDTH,
        height: BLOB_HEIGHT
    },
    pinContainer: {
        paddingTop: statusBarOffset + (isMHeight ? 45 : 35),
        paddingHorizontal: baseHeaderHeight + 20
    },
    pinCodeContainer: {
        paddingBottom: 30
    },
    titleContainer: {
        minHeight: null,
        justifyContent: 'flex-start',
        // flex: null,
        // height: 70, // Fixed height to avoid jumping around
        marginBottom: -40
    },
    title: {
        fontWeight: null,
        lineHeight: null,
        color: ACTIVE_COLOR,
        fontFamily: titleFont.black,
        fontSize: isLWidth ? 22 : (isMWidth ? 20 : 18),
        letterSpacing: 0.25,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    subtitle: {
        fontWeight: null,
        lineHeight: null,
        marginTop: 6,
        color: colors.gray,
        fontFamily: baseFont.light,
        fontSize: isMWidth ? 16 : 15
    },
    forgotCode: {
        alignItems: 'center',
        marginBottom: (isMHeight ? 32 : 25) + (iosHomeIndicatorOffset / 2),
        paddingVertical: isMHeight ? 10 : 8
    },
    forgotCodeText: {
        fontFamily: baseFont.bold,
        color: ACTIVE_COLOR,
        fontSize: 14,
        letterSpacing: 0.5
    },
    skip: {
        marginBottom: (isMHeight ? 32 : 22) + (iosHomeIndicatorOffset / 2)
    },
    skipTextContainer: {
        alignSelf: 'center',
        marginBottom: 8,
        paddingVertical: 7,
        paddingHorizontal: 30,
        backgroundColor: ACTIVE_COLOR,
        borderRadius: 10,
        elevation: 8
    },
    skipText: {
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: 15,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    skipInfoText: {
        alignSelf: 'center',
        fontFamily: baseFont.regular,
        color: ACTIVE_COLOR,
        fontSize: 13
    },
    deleteButtonText: {
        color: ACTIVE_COLOR,
        fontFamily: titleFont.regular,
        fontWeight: null,
        fontSize: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    }
});
