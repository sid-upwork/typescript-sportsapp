import { StyleSheet } from 'react-native';
import { titleFont } from '../base/fonts.style';
import colors from '../base/colors.style';
import { isLHeight } from '../base/metrics.style';

export function getLineHeight (fontSize: number, vertical?: boolean): number {
    return Math.round(fontSize * (vertical ? 1.1 : 1));
}

export const TITLE_CONTAINER_WIDTH = 70;
const DEFAULT_FONT_SIZE = isLHeight ? 25 : 22;

export default StyleSheet.create({
    container: {
    },
    containerInnerRotated: {
        position: 'absolute',
        top: 0,
        justifyContent: 'center'
    },
    containerInnerRotatedCounterClockwise: {
        left: 0,
        alignItems: 'flex-end'
    },
    containerInnerRotatedClockwise: {
        right: 0,
        alignItems: 'flex-start'
    },
    containerInnerRotatedRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        paddingVertical: 5,
        fontFamily: titleFont.bold,
        fontSize: DEFAULT_FONT_SIZE,
        lineHeight: getLineHeight(DEFAULT_FONT_SIZE),
        color: colors.violetDark,
        textTransform: 'uppercase',
        textAlign: 'right'
    },
    titleHorizontalLanguage: {
        textAlign: 'right',
        letterSpacing: 0.6
    },
    titleVerticalLanguage: {
        textAlign: 'center',
        lineHeight: getLineHeight(DEFAULT_FONT_SIZE, true)
    }
});
