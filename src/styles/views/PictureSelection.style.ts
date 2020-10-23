import { StyleSheet } from 'react-native';
import { viewportWidth, headerHeight, iosHomeIndicatorOffset } from '../base/metrics.style';
import colors from '../base/colors.style';
// import { PICTURE_DIMENSIONS } from '../../utils/images';

const BLOB_RATIO = 515 / 470;
const BLOB_WIDTH = Math.round(viewportWidth * 1.5);
const BLOB_HEIGHT = Math.round(BLOB_WIDTH / BLOB_RATIO);
const BLOB_POSITION_TOP = -Math.round(BLOB_WIDTH * 0.4);

export const COLUMNS_NUMBER = 2;

const IMAGE_SPACING = 14;

export default StyleSheet.create({
    container: {
        flex: 1
    },
    backgroundBlob: {
        position: 'absolute',
        alignSelf: 'center',
        top: BLOB_POSITION_TOP,
        width: BLOB_WIDTH,
        height: BLOB_HEIGHT
    },
    list: {
        paddingHorizontal: IMAGE_SPACING / 2
    },
    listContentContainer: {
        paddingTop: headerHeight + 15,
        paddingBottom: 30 + iosHomeIndicatorOffset / 2
    },
    image: {
        width: (viewportWidth - (IMAGE_SPACING * (COLUMNS_NUMBER + 1))) / COLUMNS_NUMBER,
        // aspectRatio: PICTURE_DIMENSIONS.width / PICTURE_DIMENSIONS.height,
        aspectRatio: 1,
        margin: IMAGE_SPACING / 2,
        borderRadius: 12,
        backgroundColor: colors.violetUltraLight,
        overflow: 'hidden'
    }
});
