import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import chroma from 'chroma-js';
import zIndexes from '../../utils/zIndexes';
import { titleFont, baseFont } from '../base/fonts.style';
import colors from '../base/colors.style';
import { viewportWidth, statusBarOffset, viewportHeight, isLHeight, isMWidth } from '../base/metrics.style';
import headerStyles from '../components/Header.style';
import keyboardButtonStyles, { BUTTON_SIZE } from '../components/CustomKeyboardButton.style';
import androidElevations from '../../utils/androidElevations';

const BACKGROUND_VECTOR_RATIO = 278 / 889;
export const BACKGROUND_VECTOR_HEIGHT = viewportHeight * 1.5;
export const BACKGROUND_VECTOR_WIDTH = BACKGROUND_VECTOR_HEIGHT * BACKGROUND_VECTOR_RATIO;
export const BACKGROUND_VECTOR_STYLE: StyleProp<ViewStyle> = {
    position: 'absolute',
    top: 0,
    right: 0
};

const BACKGROUND_IMAGE_RATIO = 620 / 638;
const BACKGROUND_IMAGE_WIDTH = Math.round(viewportWidth * 0.85);
export const BACKGROUND_IMAGE_HEIGHT = Math.round(BACKGROUND_IMAGE_WIDTH / BACKGROUND_IMAGE_RATIO);

const LOGO_RATIO = 374 / 288;
const LOGO_WIDTH = Math.round(BACKGROUND_IMAGE_WIDTH * 0.4);
const LOGO_HEIGHT = Math.round(LOGO_WIDTH / LOGO_RATIO);
const LOGO_TOP = Math.round(BACKGROUND_IMAGE_HEIGHT * 0.25);
const LOGO_LEFT = viewportWidth - Math.round(BACKGROUND_IMAGE_WIDTH * 0.7);

const TITLE_TOP = Math.round(BACKGROUND_IMAGE_HEIGHT * 0.8);
const TITLE_FONT_SIZE = 55;

export const LOGIN_BUTTON_WIDTH = 240;
export const LOGIN_BUTTON_BORDER_RADIUS = 14;

const INPUT_HEIGHT = 53;
const FIELD_CONTAINER_MARGIN_BOTTOM = 15;
export const FIELD_CONTAINER_PADDING_LEFT = isMWidth ? 70 : 50;
const FIELD_CONTAINER_PADDING_RIGHT = 30;
const INPUT_WRAPPER_PADDING_BOTTOM = 10;
const INPUT_WRAPPER_PADDING_RIGHT = 10;

// More space to prevent the clear icon from being masked by the beyboard buttons
const INPUT_INNER_MARGIN_RIGHT = keyboardButtonStyles.container.right + BUTTON_SIZE + 10 -
    FIELD_CONTAINER_PADDING_RIGHT - INPUT_WRAPPER_PADDING_RIGHT;

const BORDER_RADIUS = 8;

const AT_ICON_SIZE = 17;
const PADLOCK_ICON_WIDTH = 13;
const PADLOCK_ICON_HEIGHT = 17;
const SUBMIT_BUTTON_SIZE = 82;

export default StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject
    },
    loaderBlurContainer: {
        opacity: 0.75
    },
    backgroundImageContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        height: BACKGROUND_IMAGE_HEIGHT,
        width: BACKGROUND_IMAGE_WIDTH,
        overflow: 'visible'
    },
    logoImageContainer: {
        position: 'absolute',
        top: LOGO_TOP,
        left: LOGO_LEFT,
        width: LOGO_WIDTH,
        height: LOGO_HEIGHT,
        overflow: 'visible',
        tintColor: chroma(colors.white).alpha(0.25).css()
    },
    apiInfo: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        color: chroma(colors.violetDark).alpha(0.45).css(),
        fontFamily: baseFont.bold,
        fontSize: 10,
        letterSpacing: 0.5,
        textAlign: 'right',
        textTransform: 'uppercase'
    },
    ellipsisContainer: {
        position: 'absolute',
        top: Math.round(viewportHeight * 0.3),
        right: 20
    },
    ellipsis: {
        color: chroma(colors.white).alpha(0.45).css()
    },
    titleContainer: {
        position: 'absolute',
        top: TITLE_TOP,
        left: 30,
        right: 30
    },
    title: {
        fontFamily: titleFont.black,
        fontSize: TITLE_FONT_SIZE,
        // lineHeight: 50, // Be careful with lineHeight and Chinese characters
        color: colors.violetDark,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    scrollViewContainer: {
        paddingTop: TITLE_TOP + (TITLE_FONT_SIZE * 2.35),
        paddingBottom: statusBarOffset + 20
    },
    contentContainer: {
        marginHorizontal: 30
    },
    emailButtonContainer: {
        width: LOGIN_BUTTON_WIDTH
    },
    buttonMarginBottom: {
        marginBottom: isLHeight ? 18 : 15
    },
    buttonText: {
        fontFamily: titleFont.regular,
        fontSize: 18,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    fieldsContainer: {
        paddingLeft: FIELD_CONTAINER_PADDING_LEFT,
        paddingRight: FIELD_CONTAINER_PADDING_RIGHT
    },
    fieldContainer: {
        marginBottom: FIELD_CONTAINER_MARGIN_BOTTOM
    },
    inputWrapper: {
        paddingRight: INPUT_WRAPPER_PADDING_RIGHT,
        paddingBottom: INPUT_WRAPPER_PADDING_BOTTOM
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: colors.orangeDark,
        borderRadius: BORDER_RADIUS,
        height: INPUT_HEIGHT,
        alignItems: 'center'
    },
    inputBackground: {
        ...StyleSheet.absoluteFillObject,
        top: 10,
        left: 10,
        borderRadius: BORDER_RADIUS,
        borderWidth: 1,
        borderColor: colors.white
    },
    input: {
        flex: 1,
        marginRight: INPUT_INNER_MARGIN_RIGHT,
        paddingVertical: 10,
        fontFamily: baseFont.bold,
        fontSize: 14,
        color: colors.white,
        letterSpacing: 1
    },
    inputIcon: {
        marginHorizontal: 15
    },
    atIcon: {
        width: AT_ICON_SIZE,
        height: AT_ICON_SIZE
    },
    padlockIcon: {
        width: PADLOCK_ICON_WIDTH,
        height: PADLOCK_ICON_HEIGHT
    },
    forgotPassword: {
        paddingVertical: 10, // increase touchable area
        color: colors.pink,
        fontFamily: baseFont.regular,
        fontSize: 13,
        textDecorationLine: 'underline',
        letterSpacing: 0.5
    },
    error: {
        fontSize: 12,
        // lineHeight: 12, // be careful with lineHeight and chinese language
        color: colors.violetDark,
        fontFamily: baseFont.bold,
        letterSpacing: 1,
        paddingBottom: 4,
        textTransform: 'uppercase'
    },
    submitButton: {
        alignSelf: 'flex-end',
        width: SUBMIT_BUTTON_SIZE,
        height: SUBMIT_BUTTON_SIZE,
        borderRadius: SUBMIT_BUTTON_SIZE / 2,
        backgroundColor: colors.violetDark,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: androidElevations.login.goButton
    },
    submitText: {
        fontFamily: titleFont.bold,
        fontSize: 30,
        color: colors.white,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    backToFirstStep: {
        zIndex: zIndexes.header + 1,
        position: 'absolute',
        top: headerStyles.offset.height,
        left: headerStyles.button.marginLeft,
        height: headerStyles.button.height,
        width: headerStyles.button.width
    }
});
