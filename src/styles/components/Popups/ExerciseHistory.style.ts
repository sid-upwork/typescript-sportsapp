import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { titleFont, baseFont } from '../../base/fonts.style';
import { isLWidth } from '../../base/metrics.style';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    headerContainer: {
        flexDirection: 'row'
    },
    headerLeftContainer: {
    },
    headerTitle: {
        fontFamily: baseFont.light,
        fontSize: isLWidth ? 34 : 30,
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    headerRightContainer: {
        flex: 1,
        marginRight: 20
    },
    exerciseSummaryTitle: {
        fontFamily: titleFont.black,
        fontSize: isLWidth ? 22 : 20,
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    exerciseSummarySubtitle: {
        fontFamily: baseFont.light,
        fontSize: 15,
        color: colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 5
    },
    personalRecordsContainer: {
        backgroundColor: chroma(colors.white).alpha(0.15),
        marginTop: 15,
        marginBottom: 30,
        paddingVertical: 20,
        paddingHorizontal: 10,
        justifyContent: 'space-evenly'
    },
    personalRecordsRow: {
        flexDirection: 'row',
        marginBottom: 15
    },
    personalRecordsRowLast: {
        marginBottom: 0
    },
    personalRecordsColumn1: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    personalRecordsColumn1Title: {
        fontFamily: titleFont.regular,
        fontSize: 15,
        color: colors.white,
        textTransform: 'capitalize',
        letterSpacing: 1
    },
    personalRecordsColumn1Date: {
        flex: 1,
        fontFamily: baseFont.light,
        fontSize: 12,
        color: colors.grayVeryLight,
        letterSpacing: 0.5,
        marginLeft: 6
    },
    personalRecordsColumn2: {
        marginLeft: 10
    },
    personalRecordsColumn2Text: {
        fontFamily: titleFont.bold,
        fontSize: 15,
        color: colors.white,
        letterSpacing: 1
    },
    itemsContainer: {
        paddingHorizontal: 20,
        marginTop: 20
    },
    itemContainer: {

    },
    itemDate: {
        fontFamily: titleFont.regular,
        fontSize: isLWidth ? 17 : 16,
        color: colors.white,
        letterSpacing: 1
    },
    itemTitle: {
        marginTop: 4,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 18 : 17,
        color: colors.white,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    itemTable: {
        marginTop: 10,
        marginBottom: 30
    },
    itemRowHeader: {
        flexDirection: 'row',
        backgroundColor: chroma(colors.white).alpha(0.25),
        paddingVertical: 10
    },
    itemRow: {
        flexDirection: 'row',
        backgroundColor: chroma(colors.white).alpha(0.15),
        paddingVertical: 12
    },
    itemColumn1: {
        flex: 1
    },
    itemColumn2: {
        flex: 2
    },
    itemColumn3: {
        flex: 2
    },
    itemColumTitle: {
        color: colors.white,
        fontFamily: titleFont.regular,
        fontSize: isLWidth ? 15 : 14,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    itemText: {
        fontFamily: titleFont.light,
        fontSize: isLWidth ? 17 : 16,
        color: colors.white,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    rowSeparatorContainer: {
        backgroundColor: chroma(colors.white).alpha(0.15)
    },
    rowSeparator: {
        flex: 1,
        height: 1,
        width: '95%',
        backgroundColor: chroma(colors.white).alpha(0.25),
        alignSelf: 'center'
    }
});
