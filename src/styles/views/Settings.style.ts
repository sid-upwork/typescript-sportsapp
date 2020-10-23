import { StyleSheet } from 'react-native';
import { titleFont, baseFont } from '../base/fonts.style';
import { viewportWidth, statusBarOffset, headerHeight, viewportHeight, isLWidth, isMWidth } from '../base/metrics.style';
import colors from '../base/colors.style';
import chroma from 'chroma-js';

const PORTRAIT_IMAGE_SIZE = viewportWidth * 0.45;
const PORTRAIT_BUTTON_SIZE = 60;
export const COLOR_GRADIENT = [colors.orange, colors.pink];
const PORTRAIT_BUTTON_ICON_WIDTH = 30;

const LANGUAGE_SELECT_BORDER_RADIUS = 10;

const ARROW_DOWN_ICON_RATIO = 24 / 14;
export const ARROW_DOWN_ICON_WIDTH = 15;
export const ARROW_DOWN_ICON_HEIGHT = Math.round(ARROW_DOWN_ICON_WIDTH / ARROW_DOWN_ICON_RATIO);

const GEAR_ICON_RATIO = 292 / 304;
const GEAR_ICON_WIDTH = 150;
const GEAR_ICON_HEIGHT = Math.round(GEAR_ICON_WIDTH / GEAR_ICON_RATIO);

const BACKGROUND_TOP_RATIO = 423 / 322;
export const BACKGROUND_TOP_WIDTH = viewportWidth * 1;
export const BACKGROUND_TOP_HEIGHT = Math.round(BACKGROUND_TOP_WIDTH / BACKGROUND_TOP_RATIO);

const BACKGROUND_BOTTOM_RATIO = 784 / 569;
export const BACKGROUND_BOTTOM_WIDTH = viewportWidth * 2.25;
export const BACKGROUND_BOTTOM_HEIGHT = Math.round(BACKGROUND_BOTTOM_WIDTH / BACKGROUND_BOTTOM_RATIO);

const CLIPBOARD_BUTTON_SIZE = 32;
const CLIPBOARD_BUTTON_ICON_SIZE = 15;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1
    },
    backgroundTop: {
        position: 'absolute',
        top: -BACKGROUND_TOP_HEIGHT * 0.45 + statusBarOffset,
        right: -BACKGROUND_TOP_WIDTH * 0.2
    },
    backgroundGearImage: {
        position: 'absolute',
        top: headerHeight + 350,
        right: -GEAR_ICON_WIDTH * 0.2,
        width: GEAR_ICON_WIDTH,
        height: GEAR_ICON_HEIGHT,
        tintColor: chroma(colors.violetLight).alpha(0.25)
    },
    scrollView: {
    },
    portrait: {
        marginTop: headerHeight - 15,
        alignItems: 'center',
        paddingBottom: 40
    },
    portraitImageContainer: {
        width: PORTRAIT_IMAGE_SIZE,
        height: PORTRAIT_IMAGE_SIZE,
        borderRadius: PORTRAIT_IMAGE_SIZE / 2,
        borderWidth: 15,
        borderColor: chroma(colors.orange).alpha(0.4),
        backgroundColor: chroma(colors.orange).alpha(0.4)
    },
    portraitImage: {
        backgroundColor: colors.orangeLight,
        borderRadius: PORTRAIT_IMAGE_SIZE / 2,
        borderWidth: 2,
        borderColor: colors.orange
    },
    portraitButtons: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row'
    },
    portraitButtonPlaceholder: {
        width: PORTRAIT_BUTTON_SIZE
    },
    portraitButtonContainer: {
        alignItems: 'center'
    },
    portraitButton: {
        width: PORTRAIT_BUTTON_SIZE,
        height: PORTRAIT_BUTTON_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: PORTRAIT_BUTTON_SIZE / 2,
    },
    portraitButtonShadow: {
        position: 'absolute',
        top: 8,
        bottom: 1,
        left: 8,
        right: 8,
        borderRadius: PORTRAIT_BUTTON_SIZE
    },
    portraitButtonGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: PORTRAIT_BUTTON_SIZE,
        borderWidth: 1,
        borderColor: colors.orange
    },
    portraitButtonIcon: {
        width: PORTRAIT_BUTTON_ICON_WIDTH,
        height: PORTRAIT_BUTTON_ICON_WIDTH,
        resizeMode: 'contain',
        tintColor: 'white'
    },
    portraitButtonIconLogout: {
        marginTop: 4
    },
    portraitButtonLabel: {
        marginTop: 8,
        color: colors.pink,
        textTransform: 'uppercase',
        fontFamily: titleFont.regular,
        fontSize: 14
    },
    button: {
        width: 260,
        alignSelf: 'center',
        marginTop: 25
    },
    buttonContent: {
        alignSelf: 'center',
        paddingHorizontal: 20
    },
    buttonIcon: {
        tintColor: 'white',
        width: 36
    },
    buttonLabel: {
        fontFamily: baseFont.regular,
        textTransform: 'capitalize',
        fontSize: isMWidth ? 16 : 15
    },
    options: {
        paddingHorizontal: 25
    },
    title: {
        marginTop: 55,
        color: colors.violetDark,
        textTransform: 'uppercase',
        fontSize: isLWidth ? 28 : 26,
        fontFamily: titleFont.black
    },
    entryContainer: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center'
    },
    entryContainerInner: {
        flex: 1,
        justifyContent: 'center'
    },
    entryLabel: {
        color: chroma(colors.violetDark).brighten(0.5).desaturate(0.5).css(),
        textTransform: 'uppercase',
        fontSize: isLWidth ? 18 : 16,
        fontFamily: titleFont.bold,
        letterSpacing: 0.5
    },
    entryDescription: {
        marginTop: 4,
        color: colors.grayBlueDark,
        fontSize: isLWidth ? 14 : 13,
        fontFamily: baseFont.light
    },
    entrySwitch: {
        marginLeft: 15
    },
    unitsSwitchContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    unitsSwitchLabelLeft: {
        color: colors.orange,
        textTransform: 'uppercase',
        fontSize: 14,
        fontFamily: titleFont.regular,
        letterSpacing: 0.5
    },
    unitsSwitchLabelRight: {
        color: colors.pink
    },
    unitsSwitch: {
        marginHorizontal: 10
    },
    languageSelectContainer: {
        width: 160,
        marginLeft: 10,
        padding: 1,
        borderRadius: LANGUAGE_SELECT_BORDER_RADIUS,
        overflow: 'hidden'
    },
    languageSelect: {
        flexDirection: 'row',
        borderRadius: LANGUAGE_SELECT_BORDER_RADIUS - 1,
        overflow: 'hidden'
    },
    languageSelectValue: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    languageSelectValueLabel: {
        color: 'white',
        textTransform: 'capitalize',
        fontFamily: baseFont.regular,
        fontSize: 15,
        textAlign: 'left'
    },
    languageSelectButton: {
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center'
    },
    languageSelectButtonIcon: {
        width: ARROW_DOWN_ICON_WIDTH,
        height: ARROW_DOWN_ICON_HEIGHT,
        marginHorizontal: 15
    },
    topEllipsis: {
        alignSelf: 'flex-end',
        marginTop: -30
    },
    bottomEllipsis: {
        marginTop: 10,
        marginLeft: 20
    },
    footer: {
        paddingVertical: 60,
        marginTop: 30
    },
    footerBackgroundContainer: {
        position: 'absolute',
        top: 0,
        left: -BACKGROUND_BOTTOM_WIDTH * 0.3
    },
    footerBackground: {
        width: BACKGROUND_BOTTOM_WIDTH,
        height: BACKGROUND_BOTTOM_HEIGHT
    },
    footerInner: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    footerVerticalTitle: {
        color: 'white',
        fontSize: isLWidth ? 30 : 26
    },
    footerEntries: {
        flex: 1
    },
    footerEntry: {
    },
    footerEntryDivider: {
        height: 1,
        backgroundColor: chroma('white').alpha(0.4)
    },
    footerEntryInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingLeft: isLWidth ? 10 : 6,
        paddingRight: isLWidth ? 40 : 30
    },
    footerEntryIcon: {
        width: ARROW_DOWN_ICON_WIDTH,
        height: ARROW_DOWN_ICON_HEIGHT,
        transform: [{
            rotateZ: '-90deg'
        }],
        marginRight: 15,
        tintColor: chroma('white').alpha(0.5)
    },
    footerEntryLabel: {
        flex: 1,
        color: 'white',
        textTransform: 'uppercase',
        fontSize: isLWidth ? 18 : 16,
        fontFamily: titleFont.bold
    },
    debugWrapper: {
        marginBottom: 80,
        marginHorizontal: 22
    },
    debugContainer: {
        backgroundColor: colors.white,
        borderRadius: 30,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
        elevation: 15
    },
    debugButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 35,
        paddingVertical: 25
    },
    debugButtonText: {
        flex: 1,
        color: colors.grayDark,
        fontSize: 21,
        fontFamily: titleFont.bold,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    debugButtonIcon: {
        width: ARROW_DOWN_ICON_WIDTH,
        height: ARROW_DOWN_ICON_HEIGHT,
        tintColor: colors.violetDark
    },
    debugContainerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 25,
        paddingBottom: 25
    },
    debugVerticalTitle: {
        color: colors.grayVeryLight,
        fontSize: 30
    },
    debugEntries: {
        flex: 1
    },
    debugEntry: {
    },
    debugEntryInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    debugEntryInfoInner: {
        flex: 1
    },
    debugEntryLabel: {
        color: colors.grayDark,
        fontSize: 13,
        fontFamily: titleFont.bold,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    debugEntryValue: {
        marginTop: 2,
        color: colors.violetDark,
        fontFamily: baseFont.regular,
        fontSize: 12,
        letterSpacing: 0.25
    },
    debugEntryDivider: {
        height: 1,
        marginVertical: 11,
        backgroundColor: colors.grayVeryLight
    },
    clipboardButton: {
        width: CLIPBOARD_BUTTON_SIZE,
        height: CLIPBOARD_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 15
    },
    clipboardButtonInner: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.violetDark,
        borderRadius: CLIPBOARD_BUTTON_SIZE / 2,
        borderWidth: 1,
        backgroundColor: colors.white,
        elevation: 2
    },
    clipboardButtonIcon: {
        width: CLIPBOARD_BUTTON_ICON_SIZE,
        height: CLIPBOARD_BUTTON_ICON_SIZE,
        resizeMode: 'contain',
        tintColor: colors.violetDark
    },
    copyrightContainer: {
        paddingVertical: 20,
        paddingHorizontal: isLWidth ? 70 : 40
    },
    copyrightGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: viewportHeight,
        borderTopLeftRadius: 52
    },
    copyright: {
        color: colors.white,
        fontSize: 15,
        fontFamily: titleFont.regular,
        textAlign: 'center'
    },
    copyrightLink: {
        fontFamily: titleFont.bold,
        textDecorationLine: 'underline'
    }
});
