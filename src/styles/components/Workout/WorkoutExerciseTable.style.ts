import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { baseFont, titleFont } from '../../base/fonts.style';
import { viewportWidth, isLHeight, isXLHeight, isLWidth, isMWidth } from '../../base/metrics.style';
import { BUTTON_PLUS_SIZE, BUTTON_MARGIN, BUTTON_PLUS_BOTTOM } from './WorkoutBottomButtons.style';
import { TOOLTIP_TOTAL_SIZE } from '../Tooltip.style';
import { isAndroid } from '../../../utils/os';

export const SETS_HEADER_HEIGHT = isLHeight ? 32 : 28;

export const ROW_HEIGHT = isLHeight ? 46 : 42;

const VISIBLE_ROWS = isXLHeight ? 5.5 : (isLHeight ? 4.5 : 3.6);
export const SETS_CONTAINER_HEIGHT = Math.round(ROW_HEIGHT * VISIBLE_ROWS) + SETS_HEADER_HEIGHT;
const SETS_CONTAINER_BORDER_RADIUS = SETS_HEADER_HEIGHT;
export const SETS_CONTAINER_MARGIN_LEFT = BUTTON_MARGIN;
export const SETS_CONTAINER_MARGIN_RIGHT = BUTTON_PLUS_SIZE + BUTTON_MARGIN * 2;
export const SETS_CONTAINER_WIDTH = viewportWidth - SETS_CONTAINER_MARGIN_LEFT - SETS_CONTAINER_MARGIN_RIGHT;
const SETS_CONTAINER_BACKGROUND_COLOR = colors.white;

const COLUMN_1_FLEX = 1;
const COLUMN_2_FLEX = 2;
const COLUMN_3_FLEX = 2;
const COLUMN_4_FLEX = 1;
const COLUMN_5_FLEX = 2;

const COLUMN_1_PERCENTAGE = COLUMN_1_FLEX / (COLUMN_1_FLEX + COLUMN_2_FLEX + COLUMN_3_FLEX + COLUMN_4_FLEX + COLUMN_5_FLEX);
const COLUMN_2_PERCENTAGE = COLUMN_2_FLEX / (COLUMN_1_FLEX + COLUMN_2_FLEX + COLUMN_3_FLEX + COLUMN_4_FLEX + COLUMN_5_FLEX);
const COLUMN_5_PERCENTAGE = COLUMN_5_FLEX / (COLUMN_1_FLEX + COLUMN_2_FLEX + COLUMN_3_FLEX + COLUMN_4_FLEX + COLUMN_5_FLEX);

const SETS_BACKGROUND_COLUMN_1_WIDTH = (viewportWidth - SETS_CONTAINER_MARGIN_LEFT - SETS_CONTAINER_MARGIN_RIGHT) * COLUMN_1_PERCENTAGE;
const SETS_BACKGROUND_COLUMN_2_WIDTH = (viewportWidth - SETS_CONTAINER_MARGIN_LEFT - SETS_CONTAINER_MARGIN_RIGHT) * COLUMN_2_PERCENTAGE;
const SETS_BACKGROUND_COLUMN_5_WIDTH = (viewportWidth - SETS_CONTAINER_MARGIN_LEFT - SETS_CONTAINER_MARGIN_RIGHT) * COLUMN_5_PERCENTAGE;

// We'll try to visually compensate for Android inability to center text and let user scroll
// https://github.com/facebook/react-native/issues/25594
const INPUT_FONT_SIZE = isLWidth ? 16 : 15;
const INPUT_NUMBER_WIDTH = Math.round(INPUT_FONT_SIZE * 0.7);
const TYPE_REPS_PADDING_LEFT = (SETS_BACKGROUND_COLUMN_2_WIDTH - (INPUT_NUMBER_WIDTH * 2)) / 2;

const CHECKBOX_SIZE = Math.round(ROW_HEIGHT * 0.35);
const CHECKMARK_ICON_SIZE = 20;

export const BLUR_GRADIENT_COLORS = [
    chroma(colors.pink).alpha(0.4).css(),
    chroma(colors.violetDark).darken(2).alpha(0.4).css()
];

export const HEADER_GRADIENT_COLORS = [
    chroma(colors.pink).alpha(0.4).css(),
    chroma(colors.violetDark).darken(2).alpha(0.4).css()
];
export const ROW_ACTIVE_GRADIENT_COLORS = [
    chroma(colors.white).alpha(0.65).css(),
    chroma(colors.blueLight).alpha(0.45).css()
];
export const ROW_DONE_GRADIENT_COLORS = [
    chroma(colors.pink).alpha(0.4).css(),
    chroma(colors.violetDark).darken(2).alpha(0.4).css()
];

const HIGHLIGHT_COLOR = colors.violetLight;

const NUMBER_COLOR = colors.white;
const NUMBER_COLOR_ACTIVE = colors.violetDark;
const NUMBER_COLOR_DONE = colors.violetLight;
export const PLACEHOLDER_COLOR = chroma(NUMBER_COLOR).alpha(0.45).css();
export const PLACEHOLDER_COLOR_ACTIVE = chroma(NUMBER_COLOR_ACTIVE).alpha(0.65).css();
export const PLACEHOLDER_COLOR_DONE = chroma(NUMBER_COLOR_DONE).alpha(0.65).css();
export const SELECTION_COLOR = HIGHLIGHT_COLOR;
export const SELECTION_COLOR_ACTIVE = chroma(colors.violetDark).alpha(0.5).css();
export const SELECTION_COLOR_DONE = chroma(HIGHLIGHT_COLOR).alpha(0.5).css();

const BORDER_WIDTH = StyleSheet.hairlineWidth;
const BORDER_COLOR = chroma(HIGHLIGHT_COLOR).alpha(0.75).css();

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        height: SETS_CONTAINER_HEIGHT,
        marginBottom: BUTTON_PLUS_BOTTOM,
        marginLeft: SETS_CONTAINER_MARGIN_LEFT,
        marginRight: SETS_CONTAINER_MARGIN_RIGHT,
        borderRadius: SETS_CONTAINER_BORDER_RADIUS,
        borderWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR,
        overflow: 'hidden'
    },
    // We need to define the border on the blur component because the radius is not rendered otherwise
    // On top of that, the single corner radius rule doesn't work for the blur component. So many hacks...
    setsBlur: {
        borderRadius: SETS_CONTAINER_BORDER_RADIUS
    },
    setsBlurIOS: {
        backgroundColor: chroma(colors.violetDark).alpha(0.15).css()
    },
    setsBlurAndroid: {
        backgroundColor: chroma(colors.violetDark).alpha(0.35).css()
    },
    setsBackground: {
        backgroundColor: chroma(SETS_CONTAINER_BACKGROUND_COLOR).alpha(0.92).css()
    },
    setsBackgroundColumn: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: chroma(colors.pink).alpha(0.15).css()
    },
    setsBackgroundColumnLeft: {
        left: 0,
        width: SETS_BACKGROUND_COLUMN_1_WIDTH
    },
    setsBackgroundColumnRight: {
        right: 0,
        width: SETS_BACKGROUND_COLUMN_5_WIDTH
    },
    setsScrollView: {
    },
    setsScrollViewBottomSpacer: {
        height: SETS_CONTAINER_HEIGHT - SETS_HEADER_HEIGHT - ROW_HEIGHT * 2
    },
    column1: {
        flex: COLUMN_1_FLEX
    },
    column2: {
        flex: COLUMN_2_FLEX
    },
    column3: {
        flex: COLUMN_3_FLEX
    },
    column4: {
        flex: COLUMN_4_FLEX
    },
    column5: {
        flex: COLUMN_5_FLEX
    },
    columnBorderLeft: {
        borderLeftWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    columnBorderRight: {
        borderRightWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    columnBorderLeftLight: {
        borderLeftWidth: BORDER_WIDTH,
        borderColor: chroma(BORDER_COLOR).alpha(0.25).css()
    },
    columnBorderRightLight: {
        borderRightWidth: BORDER_WIDTH,
        borderColor: chroma(BORDER_COLOR).alpha(0.25).css()
    },
    headerContainer: {
        height: SETS_HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HIGHLIGHT_COLOR
    },
    headerGradient: {
    },
    headerLabel: {
        color: colors.white,
        fontFamily: titleFont.regular,
        fontSize: isMWidth ? 14 : 13,
        letterSpacing: isMWidth ? 0.5 : 0,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    rowContainer: {
        height: ROW_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: chroma(colors.white).alpha(0.75).css(),
        borderBottomWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    rowContainerLast: {
    },
    rowContainerActive: {
    },
    rowContainerDone: {
        backgroundColor: chroma(colors.violetDark).alpha(0.7).css()
    },
    activeGradient: {
    },
    doneGradient: {
    },
    rowNumber: {
        color: PLACEHOLDER_COLOR,
        fontFamily: baseFont.regular,
        fontSize: 14,
        textAlign: 'center'
    },
    rowNumberActive: {
        color: PLACEHOLDER_COLOR_ACTIVE
    },
    rowNumberDone: {
        color: PLACEHOLDER_COLOR_DONE
    },
    columnInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
        // backgroundColor: chroma(colors.pink).alpha(0.15).css()
    },
    inputContainer: {
        height: ROW_HEIGHT - BORDER_WIDTH,
        justifyContent: 'center',
        alignItems: 'center'
        // backgroundColor: chroma(colors.violetDark).alpha(0.16).css()
    },
    input: {
        width: '100%',
        paddingHorizontal: 8,
        paddingVertical: 7, // Improve touchability
        color: NUMBER_COLOR,
        fontFamily: baseFont.bold,
        fontSize: INPUT_FONT_SIZE,
        letterSpacing: isAndroid ? 0 : 0.5,
        // Marvelous Android bug: if you center the text, you can no longer scroll...
        // https://github.com/facebook/react-native/issues/25594
        textAlign: isAndroid ? undefined : 'center'
    },
    inputAndroidHack: {
        paddingLeft: isAndroid ? TYPE_REPS_PADDING_LEFT : 0
    },
    inputActive: {
        color: NUMBER_COLOR_ACTIVE
    },
    inputDone: {
        color: NUMBER_COLOR_DONE
    },
    inputTimeCustom: {
        fontSize: isMWidth ? INPUT_FONT_SIZE : 13,
        letterSpacing: isMWidth ? 0.5 : 0,
        paddingLeft: 0
    },
    checkboxContainer: {
        height: ROW_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkbox: {
        height: CHECKBOX_SIZE,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: BORDER_WIDTH,
        borderColor: BORDER_COLOR
    },
    checkboxActive: {
        borderColor: chroma(PLACEHOLDER_COLOR_ACTIVE).alpha(0.85).css()
    },
    checkmarkIcon: {
        width: CHECKMARK_ICON_SIZE,
        aspectRatio: 1,
        marginBottom: 6,
        marginLeft: 6
    },
    last: {
        color: PLACEHOLDER_COLOR,
        fontFamily: baseFont.light,
        fontSize: isMWidth ? 10 : 9,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    lastNumber: {
        color: PLACEHOLDER_COLOR,
        fontFamily: baseFont.regular,
        fontSize: isMWidth ? 13 : 12,
        textAlign: 'center'
    },
    lastActive: {
        color: PLACEHOLDER_COLOR_ACTIVE
    },
    lastDone: {
        color: PLACEHOLDER_COLOR_DONE
    },
    lastValue: {
        alignItems: 'center',
        color: PLACEHOLDER_COLOR,
        fontFamily: titleFont.regular,
        fontSize: isMWidth ? 14 : 13,
        textAlign: 'center'
    },
    lastValueActive: {
        color: chroma(PLACEHOLDER_COLOR_ACTIVE).alpha(1).css()
    },
    lastValueDone: {
        color: PLACEHOLDER_COLOR_DONE
    },
    lastValueX: {
        fontFamily: titleFont.light,
        fontSize: 12
    },
    activeBorder: {
        borderWidth: BORDER_WIDTH,
        borderColor: chroma(ROW_ACTIVE_GRADIENT_COLORS[1]).alpha(0.75).css()
    },
    tooltip: {
        position: 'absolute',
        top: -15,
        right: SETS_CONTAINER_MARGIN_RIGHT - (TOOLTIP_TOTAL_SIZE / 2)
    }
});
