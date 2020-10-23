import { StyleSheet } from 'react-native';
import { isAndroid } from '../../utils/os';
import chroma from 'chroma-js';
import colors from '../base/colors.style';
import { titleFont } from '../base/fonts.style';
import { isMWidth } from '../base/metrics.style';

export const LOADER_COLOR = isAndroid ? colors.violetLight : colors.violetDark;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
    },
    blurIOS: {
        opacity: 0.75
    },
    blurIOSLabel: {
        opacity: 0.85
    },
    blurAndroid: {
        backgroundColor: chroma(colors.black).alpha(0.7).css()
    },
    loaderContainer: {
        maxWidth: 220,
        alignItems: 'center'
    },
    label: {
        marginTop: 15,
        color: LOADER_COLOR,
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 14 : 13,
        letterSpacing: 0.25,
        textAlign: 'center',
        textTransform: 'uppercase'
    }
});
