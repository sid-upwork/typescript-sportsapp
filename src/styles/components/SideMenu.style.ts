import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { isXLHeight, isSWidth, isLWidth, isMWidth } from '../base/metrics.style';
import { DRAWER_WIDTH } from './AppDrawer.style';
import { baseFont } from '../base/fonts.style';
import { iosHomeIndicatorOffset, statusBarOffset } from '../base/metrics.style';
import colors from '../base/colors.style';

const PORTRAIT_OUTER_BORDER_SIZE = 10;
const PORTRAIT_SIZE = isXLHeight ? 140 : (isSWidth ? 126 : 100);
const PORTRAIT_CONTAINER_SIZE = PORTRAIT_SIZE + (PORTRAIT_OUTER_BORDER_SIZE * 2);

const TEXT_HIGHLIGHT_COLOR = 'white';

const SETTINGS_ICON_RATIO = 292 / 304;
const SETTINGS_ICON_WIDTH = isSWidth ? 25 : 22;
const SETTINGS_ICON_HEIGHT = Math.round(SETTINGS_ICON_WIDTH / SETTINGS_ICON_RATIO);

const PROGRAM_ICON_RATIO = 41 / 62;
const PROGRAM_ICON_WIDTH = 20;
const PROGRAM_ICON_HEIGHT = Math.round(PROGRAM_ICON_WIDTH / PROGRAM_ICON_RATIO);

export default StyleSheet.create({
    container: {
        flex: 1,
        width: DRAWER_WIDTH,
        justifyContent: 'center',
        paddingBottom: iosHomeIndicatorOffset
    },
    header: {
        alignItems: 'center',
        marginTop: statusBarOffset + 20,
        marginBottom: isXLHeight ? 25 : 20
    },
    portraitContainer: {
        width: PORTRAIT_SIZE,
        height: PORTRAIT_SIZE,
        borderRadius: PORTRAIT_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: chroma(colors.orange).alpha(0.45).css(),
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 14 },
        shadowRadius: 14
    },
    portrait: {
        borderRadius: PORTRAIT_SIZE / 2
    },
    portraitBorder: {
        width: PORTRAIT_CONTAINER_SIZE,
        height: PORTRAIT_CONTAINER_SIZE,
        borderRadius: PORTRAIT_CONTAINER_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: chroma(TEXT_HIGHLIGHT_COLOR).alpha(0.50).css()
    },
    name: {
        marginTop: 16,
        color: TEXT_HIGHLIGHT_COLOR,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 18 : (isMWidth ? 17 : 15),
        letterSpacing: isSWidth ? 1 : 0.5,
        textAlign: 'center'
    },
    program: {
        maxWidth: '80%',
        marginTop: 15,
        paddingVertical: 8,
        paddingHorizontal: 20,
        flexDirection: 'row',
        backgroundColor: chroma('white').alpha(0.15),
        borderRadius: 3
    },
    programIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 20
    },
    programIcon: {
        width: PROGRAM_ICON_WIDTH,
        height: PROGRAM_ICON_HEIGHT
    },
    programInfos: {
        flex: 1
    },
    programName: {
        color: 'white',
        letterSpacing: 1,
        fontSize: 15,
        fontFamily: baseFont.regular
    },
    programWeek: {
        paddingTop: 3,
        color: 'white',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontSize: 15,
        fontFamily: baseFont.regular
    },
    entries: {
        marginBottom: 30
    },
    entriesInner: {
        // flex: 1,
        flexGrow: 1,
        justifyContent: 'center'
    },
    settings: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 30
    },
    settingsIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 15
    },
    settingsIcon: {
        width: SETTINGS_ICON_WIDTH,
        height: SETTINGS_ICON_HEIGHT,
        tintColor: 'white'
    },
    settingsLabel: {
        textTransform: 'capitalize',
        color: 'white',
        fontFamily: baseFont.regular,
        fontSize: isSWidth ? 17 : 15
    }
});
