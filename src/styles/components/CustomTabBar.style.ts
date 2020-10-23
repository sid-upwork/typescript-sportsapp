import staticColors from '../base/colors.style';
import { titleFont } from '../base/fonts.style';
import { StyleSheet } from 'react-native';
import { viewportHeight, isLWidth, isMWidth } from '../base/metrics.style';

export const TAB_BAR_WIDTH = Math.round(viewportHeight * 0.6);
const TAB_BAR_OFFSET = Math.round(viewportHeight * 0.05);

const TAB_HEIGHT = 40;
// const TAB_WIDTH = TAB_BAR_WIDTH / 4;
const TAB_PADDING_HORIZONTAL = 6;
const TAB_PADDING_VERTICAL = 5;

export const TAB_TOTAL_HEIGHT = TAB_HEIGHT + TAB_PADDING_VERTICAL * 2;

const INDICATOR_HEIGHT = 1;

export default StyleSheet.create({
    fadeEffect: {
        zIndex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: TAB_TOTAL_HEIGHT + 10
    },
    tabBar: {
        zIndex: 2,
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        elevation: 0,
        width: TAB_BAR_WIDTH,
        transform: [
            { rotate: '-90deg' },
            { translateY: -(TAB_BAR_WIDTH / 2 - (TAB_TOTAL_HEIGHT / 2)) },
            { translateX: TAB_BAR_WIDTH / 2 - (TAB_HEIGHT / 2) + TAB_BAR_OFFSET }
        ]
    },
    tab: {
        height: TAB_HEIGHT,
        // width: TAB_WIDTH,
        paddingVertical: TAB_PADDING_VERTICAL,
        paddingHorizontal: TAB_PADDING_HORIZONTAL
    },
    tabBarIndicatorContainer: {
        position: 'absolute',
        bottom: 0
    },
    tabBarIndicator: {
        height: INDICATOR_HEIGHT,
        width: '90%',
        backgroundColor: staticColors.orange,
        alignSelf: 'center'
    },
    tabBarLabel: {
        color: staticColors.violetDark,
        fontFamily: titleFont.regular,
        fontSize: isLWidth ? 15 : (isMWidth ? 14 : 13),
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    tabBarLabelActive: {
        color: staticColors.orange
    },
    tabBarLabelInactive: {
        color: staticColors.violetDark
    },
    VLLabelContainer: {
        // width: TAB_WIDTH,
        height: TAB_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center'
    },
    VLLabelContainerInner: {
        width: TAB_HEIGHT,
        // height: TAB_WIDTH,
        justifyContent: 'center',
        transform: [{ rotate: '90deg' }]
    },
    VLCharacter: {
        width: TAB_HEIGHT
    }
});
