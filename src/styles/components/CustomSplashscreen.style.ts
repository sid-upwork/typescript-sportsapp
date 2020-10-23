import { StyleSheet } from 'react-native';
import { viewportWidth } from '../base/metrics.style';

export const LOGO_SIZE_INITIAL = Math.round(viewportWidth * 180 / 480); // See image metrics in XCode/LaunchScreen.xib
export const LOGO_SIZE_FINAL = Math.round(viewportWidth * 2);

export default StyleSheet.create({
    splashscreenContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center'
    },
    splashscreenBackground: {
        ...StyleSheet.absoluteFillObject,
        width: null, // Fix for local images' dimensions
        height: null, // https://github.com/facebook/react-native/issues/4598
        resizeMode: 'stretch'
    },
    splashscreenLogo: {
        width: LOGO_SIZE_FINAL,
        height: LOGO_SIZE_FINAL,
        resizeMode: 'contain'
    }
});
