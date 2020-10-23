import { StyleSheet } from 'react-native';
import { isAndroid } from '../../../utils/os';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { viewportHeight, viewportWidth, iosHomeIndicatorOffset } from '../../base/metrics.style';
import { PROGRESSION_INITIAL_HEIGHT } from './WorkoutProgressionItem.style';
import { TOOLTIP_SIZE_DELTA } from '../Tooltip.style';

export const BUTTON_MARGIN = 12;

export const BUTTON_PLUS_SIZE = 52;
export const BUTTON_PLUS_BOTTOM = BUTTON_MARGIN + PROGRESSION_INITIAL_HEIGHT;
const BUTTON_PLUS_BORDER_RADIUS = BUTTON_PLUS_SIZE / 2;
export const BUTTON_PLUS_ICON_COLOR = colors.violetDark;
const BUTTON_PLUS_ICON_SIZE = 28;

export const BUTTON_COMPLETE_SIZE = BUTTON_PLUS_SIZE;
const BUTTON_COMPLETE_BOTTOM = BUTTON_PLUS_SIZE + BUTTON_MARGIN * 2 + PROGRESSION_INITIAL_HEIGHT;
const BUTTON_COMPLETE_BORDER_RADIUS = BUTTON_COMPLETE_SIZE / 2;
export const BUTTON_COMPLETE_TRANSLATE_X = BUTTON_COMPLETE_SIZE + BUTTON_MARGIN;
export const BUTTON_COMPLETE_GRADIENT_COLORS = [colors.blueLight, colors.blueDark];
const BUTTON_COMPLETE_COLOR_SCALE = chroma.scale(BUTTON_COMPLETE_GRADIENT_COLORS);
const BUTTON_COMPLETE_ICON_SIZE = 28;

export const BUTTON_SET_ACTIVE_GRADIENT_COLORS = [colors.pink, colors.orange];
const BUTTON_SET_ACTIVE_COLOR_SCALE = chroma.scale(BUTTON_SET_ACTIVE_GRADIENT_COLORS);
const BUTTON_SET_ACTIVE_ICON_SIZE = 32;

export const SHEET_NEXT_IMAGE_HEIGHT = 80;
const SHEET_NEXT_WIDTH = viewportWidth;
const SHEET_NEXT_PADDING_TOP = 20;
const SHEET_NEXT_PADDING_BOTTOM = 20 + Math.round(iosHomeIndicatorOffset / 3);
export const SHEET_NEXT_HEIGHT = SHEET_NEXT_IMAGE_HEIGHT + SHEET_NEXT_PADDING_TOP + SHEET_NEXT_PADDING_BOTTOM;
const SHEET_NEXT_BORDER_RADIUS = BUTTON_COMPLETE_BORDER_RADIUS;
const SHEET_NEXT_BACKGROUND_COLOR = colors.white;
const SHEET_NEXT_ANIMATION_DELTA = 30;

const SHEET_MENU_WIDTH = SHEET_NEXT_WIDTH;
const SHEET_MENU_HEIGHT = 106;
const SHEET_MENU_BORDER_RADIUS = BUTTON_COMPLETE_BORDER_RADIUS;
const SHEET_PADDING_H = 18;
export const SHEET_MENU_TOTAL_HEIGHT = SHEET_NEXT_HEIGHT + SHEET_MENU_HEIGHT;
export const SHEET_MENU_BACKGROUND_GRADIENT = ['#A5C4F0', '#719BE7', '#719BE7'];

const BUTTON_SHADOW: any = {
    shadowColor: chroma(colors.blueDark).darken(2).css(),
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 12
};

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },
    overlayContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: viewportWidth,
        height: viewportHeight
    },
    overlay: {
        backgroundColor: chroma(colors.blueDark).darken(2).desaturate(1.5).alpha(0.45).css()
    },
    buttonCompleteContainer: {
        position: 'absolute',
        bottom: BUTTON_COMPLETE_BOTTOM,
        right: BUTTON_MARGIN,
        height: BUTTON_COMPLETE_SIZE,
        aspectRatio: 1,
    },
    buttonComplete: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BUTTON_COMPLETE_COLOR_SCALE(0.3),
        borderRadius: BUTTON_COMPLETE_BORDER_RADIUS,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: chroma(colors.white).alpha(0.2).css(),
        ...BUTTON_SHADOW
    },
    buttonCompleteGradient: {
        borderRadius: BUTTON_COMPLETE_BORDER_RADIUS
    },
    buttonCompleteIcon: {
        width: BUTTON_COMPLETE_ICON_SIZE,
        aspectRatio: 1,
        color: colors.white,
        resizeMode: 'contain'
    },
    buttonSetActive: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BUTTON_SET_ACTIVE_COLOR_SCALE(0.4),
        borderRadius: BUTTON_COMPLETE_BORDER_RADIUS,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: chroma(colors.pink).alpha(0.55).css(),
        ...BUTTON_SHADOW
    },
    buttonSetActiveIcon: {
        width: BUTTON_SET_ACTIVE_ICON_SIZE,
        aspectRatio: 1,
        color: colors.white,
        resizeMode: 'contain'
    },
    sheetContentContainer: {
        // WARNING: Android -> No clicks triggered on the "plus" button without a defined height
        // WARNING: iOS -> If its height is set, this container will prevent clicks events, even with `pointerEvents` set to `none`
        // ¯\_(ツ)_/¯
        height: isAndroid ? SHEET_MENU_TOTAL_HEIGHT : undefined
    },
    menuSheetContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: SHEET_MENU_WIDTH,
        height: SHEET_MENU_TOTAL_HEIGHT,
        borderTopLeftRadius: SHEET_MENU_BORDER_RADIUS
    },
    menuSheetGradient: {
        borderTopLeftRadius: SHEET_MENU_BORDER_RADIUS
    },
    menuSheetInnerContainer: {
        height: SHEET_MENU_HEIGHT,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SHEET_PADDING_H
    },
    nextSheetContainer: {
        position: 'absolute',
        bottom: -SHEET_NEXT_ANIMATION_DELTA,
        right: 0,
        width: SHEET_NEXT_WIDTH,
        height: SHEET_NEXT_HEIGHT + SHEET_NEXT_ANIMATION_DELTA  ,
        paddingTop: SHEET_NEXT_PADDING_TOP,
        paddingBottom: SHEET_NEXT_ANIMATION_DELTA + SHEET_NEXT_PADDING_BOTTOM,
        borderTopLeftRadius: SHEET_NEXT_BORDER_RADIUS,
        backgroundColor: SHEET_NEXT_BACKGROUND_COLOR,
        ...BUTTON_SHADOW
    },
    buttonPlusContainer: {
        position: 'absolute',
        bottom: BUTTON_PLUS_BOTTOM,
        right: BUTTON_MARGIN,
        width: BUTTON_PLUS_SIZE,
        height: BUTTON_PLUS_SIZE
    },
    buttonPlusBackground: {
        backgroundColor: SHEET_NEXT_BACKGROUND_COLOR,
        borderRadius: BUTTON_PLUS_BORDER_RADIUS,
        // borderWidth: StyleSheet.hairlineWidth,
        // borderColor: chroma(BUTTON_PLUS_ICON_COLOR).alpha(0.7).css(),
        shadowColor: chroma(colors.blueDark).darken(2).css(),
        shadowOpacity: 0.45,
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 12
    },
    buttonPlusIconContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonPlusIcon: {
        width: BUTTON_PLUS_ICON_SIZE,
        height: BUTTON_PLUS_ICON_SIZE
    },
    tooltip: {
        position: 'absolute',
        top: -TOOLTIP_SIZE_DELTA - 6,
        right: -TOOLTIP_SIZE_DELTA - (BUTTON_MARGIN / 2)
    }
});
