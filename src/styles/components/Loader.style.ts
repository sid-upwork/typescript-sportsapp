import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../base/colors.style';


export default StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    flexContainer: {
        flex: 1
    },
    blurIOS: {
        // opacity: 0.5 -> Interesting effect while the video is playing
    },
    blurAndroid: {
        backgroundColor: chroma(colors.black).alpha(0.7).css()
    }
});
