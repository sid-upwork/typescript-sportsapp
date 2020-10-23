import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    formContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10, // Visually compensate title's margin bottom
        paddingHorizontal: 30
    },
    fieldContainer: {
        flex: 1,
        marginRight: 18
    },
    inputWrapper: {
    }
});
