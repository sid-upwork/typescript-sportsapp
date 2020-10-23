import { StyleSheet } from 'react-native';
import { isLWidth, isMWidth, isLHeight, isMHeight, isSWidth } from '../base/metrics.style';
import { titleFont } from '../base/fonts.style';
import chroma from 'chroma-js';

const MARGIN_HORIZONTAL = isSWidth ? 30 : 20;
const PADDING_HORIZONTAL = isSWidth ? 15 : 13;
const PADDING_VERTICAL = isLHeight ? 17 : (isMHeight ? 15 : 13);
const BORDER_RADIUS = 12;
const ACTIVE_BG_COLOR = chroma('white').alpha(0.15).css();

export default StyleSheet.create({
    container: {
        marginRight: MARGIN_HORIZONTAL,
        marginVertical: 3,
        paddingLeft: MARGIN_HORIZONTAL + PADDING_HORIZONTAL,
        paddingRight: PADDING_HORIZONTAL,
        paddingVertical: PADDING_VERTICAL
    },
    activeContainer: {
        ...StyleSheet.absoluteFillObject,
        left: '-20%', // account for animation's bounciness
        backgroundColor: ACTIVE_BG_COLOR,
        borderTopRightRadius: BORDER_RADIUS,
        borderBottomRightRadius: BORDER_RADIUS,
        shadowColor: ACTIVE_BG_COLOR,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 8
    },
    title: {
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 16 : (isMWidth ? 15 : 14),
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center',
        color: 'white'
    },
    activeTitle: {
        color: 'white'
    }
});
