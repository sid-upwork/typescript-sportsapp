import { StyleSheet } from 'react-native';
import { viewportWidth } from '../base/metrics.style';
import colors from '../base/colors.style';

export const ITEM_WIDTH = viewportWidth;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    viewContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background
    },
    articleContainer: {
        flex: 1,
        width: ITEM_WIDTH
    }
});
