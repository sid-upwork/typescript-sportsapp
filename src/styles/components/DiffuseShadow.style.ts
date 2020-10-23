import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    shadowContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        bottom: 1,
        backgroundColor: 'transparent'
    },
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    }
});
