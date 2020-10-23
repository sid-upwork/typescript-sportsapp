import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { titleFont, baseFont } from '../../base/fonts.style';
import colors from '../../base/colors.style';
import { isLWidth, viewportHeight } from '../../base/metrics.style';

// TODO: adapt layout so that no scrollview would ever be required
export const MANAGE_POPUP_HEIGHT = Math.min(Math.round(viewportHeight * 0.7), 550);

export default StyleSheet.create({
    container: {
        paddingHorizontal: 20
    },
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    blurAndroid: {
        backgroundColor: chroma(colors.white).alpha(0.85).css()
    },
    popupTitle: {
        color: colors.pinkLight,
        fontSize: isLWidth ? 21 : 19
    },
    programInfoWrapper: {
        marginBottom: 20
    },
    programTitle: {
        color: colors.violetDark,
        fontFamily: titleFont.black,
        fontSize: isLWidth ? 22 : 19,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    programInfoContainer: {
        paddingTop: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    programInfoLabel: {
        fontFamily: titleFont.bold,
        fontSize: 16,
        color: colors.pinkLight,
        textTransform: 'uppercase',
        width: '50%'
    },
    programInfoContent: {
        fontFamily: baseFont.bold,
        fontSize: 16,
        color: colors.violetDark
    },
    changeWeekContentContainer : {
        flexDirection: 'row',
        alignItems: 'center'
    },
    changeWeekTitle: {
        marginTop: 28,
        fontFamily: titleFont.black,
        fontSize: isLWidth ? 22 : 19,
        color: colors.violetDark,
        textTransform: 'uppercase'
    },
    changeWeekPickerContainer: {
        flex: 1,
        marginRight: 20
    },
    changeWeekPicker: {
        color: colors.black,
        height: 125
    },
    changeWeekButton: {
        width: 200
    },
    resetButton: {
        marginTop: 20
    },
    popupStateContainer: {
        paddingVertical: 40,
        justifyContent: 'center'
    },
    fetchErrorContainer: {
        paddingTop: 40
    }
});
