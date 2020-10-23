import { StyleSheet } from 'react-native';
import { viewportWidth } from '../../base/metrics.style';
import { TITLE_CONTAINER_WIDTH } from '../SharedVerticalTitle.style';

const CAROUSEL_WIDTH = viewportWidth;
const CAROUSEL_MARGIN_RIGHT = 20;
export const SLIDER_WIDTH = CAROUSEL_WIDTH - TITLE_CONTAINER_WIDTH - CAROUSEL_MARGIN_RIGHT;

export default StyleSheet.create({
    container: {
        flex: 1,
        width: CAROUSEL_WIDTH
    },
    carouselContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingBottom: 10,
        paddingRight: CAROUSEL_MARGIN_RIGHT
    },
    carousel: {
        overflow: 'visible'
    },
    scrollViewBulletWrapper: {
        marginTop: 18
    }
});
