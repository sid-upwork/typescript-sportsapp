import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    noOverflowContainer: {
        overflow: 'hidden'
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        // resizeMode: 'cover', // Don't use it with FastImage
        width: null, // Fix for local images' dimensions
        height: null, // https://github.com/facebook/react-native/issues/4598
        opacity: 1
    },
    curtain: {
        ...StyleSheet.absoluteFillObject
    }
});
