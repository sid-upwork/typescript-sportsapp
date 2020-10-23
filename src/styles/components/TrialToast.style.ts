import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { isIOS } from '../../utils/os';
import zIndexes from '../../utils/zIndexes';
import colors from '../base/colors.style';
import { baseFont, titleFont } from '../base/fonts.style';
import { isMWidth } from '../base/metrics.style';
import headerStyles from './Header.style';

const BORDER_RADIUS = 12;
const BORDER_WIDTH = 2;

export const PRIMARY_COLOR_SCALE = chroma.scale([
    '#80CA95',
    '#68C5E9',
    '#7584E4',
    '#EFAAA2'
]);
export const SECONDARY_COLOR_SCALE = chroma.scale([
    '#59BEAA',
    '#5189E9',
    '#7051DD',
    '#E6628B'
]);

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        zIndex: zIndexes.header + 1, // Over the menu button
        position: 'absolute',
        top: headerStyles.offset.height,
        right: 0,
        left: 0,
        paddingHorizontal: isMWidth ? 16 : 14
    },
    toast: {
        borderRadius: BORDER_RADIUS,
        borderWidth: BORDER_WIDTH,
        shadowOpacity: 0.65,
        shadowOffset: { width: 0, height: 15 },
        shadowRadius: 30,
        elevation: 3
    },
    blur: {
        borderRadius: BORDER_RADIUS - BORDER_WIDTH
    },
    gradient: {
        borderRadius: BORDER_RADIUS - BORDER_WIDTH,
        opacity: isIOS ? 0.9 : 0.96
    },
    toastInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: isMWidth ? 18 : 15,
        paddingHorizontal: isMWidth ? 20 : 16
    },
    message: {
        flex: 1,
        color: colors.white,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 13 : 12
    },
    buttonContainer: {
        marginLeft: 15
    },
    button: {
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: colors.white,
        borderRadius: 8,
        elevation: 4
    },
    buttonLabel: {
        fontFamily: titleFont.bold,
        fontSize: 13,
        textAlign: 'center',
        textTransform: 'uppercase'
    }
});
