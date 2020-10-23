import { StyleSheet } from 'react-native';
import colors from '../base/colors.style';

export const VIEW_PADDING = 60;
export const BACKGROUND_GRADIENT_COLOR = ['#ffffff', '#ffffff'];
export const SPINNER_COLOR: string = colors.highlight;
export const GRADIENT_COLORS = [colors.orangeDark, colors.pink];

export default StyleSheet.create({
    applicationView: {
        flex: 1
    },
    transitionContainer: {
        backgroundColor: 'transparent'
    },
    container: {},
    drawerBackground: {
        ...StyleSheet.absoluteFillObject
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
