import { StyleSheet } from 'react-native';
import { titleFont, baseFont } from '../../base/fonts.style';
import { viewportWidth, isLWidth, isMWidth, isXLHeight } from '../../base/metrics.style';
import colors from '../../base/colors.style';
import chroma from 'chroma-js';

const BORDER_RADIUS = 20;
const IMAGE_BORDER_RADIUS_RIGHT = 14;
const IMAGE_BORDER_RADIUS_LEFT = 7;
const CONFIRM_BUTTON_BORDER_RADIUS = 16;
const CLOSE_BUTTON_SIZE = 30;
const IMAGE_CONTAINER_MARGIN_RIGHT = isLWidth ? 20 : 16;
const INFO_BORDER_MARGIN_RIGHT = IMAGE_CONTAINER_MARGIN_RIGHT + (isLWidth ? 20 : 16);
const PADDING_HORIZONTAL = isLWidth ? 30 : 25;

const ICON_HEIGHT = isLWidth ? 20 : 18;

const CALENDAR_ICON_RATIO = 34 / 32;
const CALENDAR_ICON_HEIGHT = ICON_HEIGHT;
const CALENDAR_ICON_WIDTH = Math.round(CALENDAR_ICON_HEIGHT / CALENDAR_ICON_RATIO);

const SQUAT_ICON_RATIO = 36 / 38;
const SQUAT_ICON_HEIGHT = ICON_HEIGHT;
const SQUAT_ICON_WIDTH =  Math.round(SQUAT_ICON_HEIGHT / SQUAT_ICON_RATIO);

const DUMBBELL_ICON_RATIO = 62 / 41;
const DUMBBELL_ICON_HEIGHT = ICON_HEIGHT;
const DUMBBELL_ICON_WIDTH = Math.round(DUMBBELL_ICON_HEIGHT / DUMBBELL_ICON_RATIO);

const LOCATION_ICON_RATIO = 34 / 24;
const LOCATION_ICON_HEIGHT = ICON_HEIGHT;
const LOCATION_ICON_WIDTH = Math.round(LOCATION_ICON_HEIGHT / LOCATION_ICON_RATIO);

const KETTLEBELL_ICON_RATIO = 34 / 26;
const KETTLEBELL_ICON_HEIGHT = ICON_HEIGHT;
const KETTLEBELL_ICON_WIDTH = Math.round(KETTLEBELL_ICON_HEIGHT / KETTLEBELL_ICON_RATIO);

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: chroma(colors.violetLight).alpha(0.9)
    },
    containerInner: {
        flex: 1,
        borderRadius: BORDER_RADIUS
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: BORDER_RADIUS
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 20
    },
    closeButtonIcon: {
        width: CLOSE_BUTTON_SIZE,
        height: CLOSE_BUTTON_SIZE
    },
    imageContainer: {
        height: isXLHeight ? 200 : 180,
        marginRight: IMAGE_CONTAINER_MARGIN_RIGHT,
        marginLeft: -10
    },
    imageContainerInner: {
        flex: 1,
        borderTopRightRadius: IMAGE_BORDER_RADIUS_RIGHT,
        borderBottomRightRadius: IMAGE_BORDER_RADIUS_RIGHT,
        borderBottomLeftRadius: IMAGE_BORDER_RADIUS_LEFT,
        borderTopLeftRadius: IMAGE_BORDER_RADIUS_LEFT,
        overflow: 'hidden',
        backgroundColor: colors.violetDark
    },
    image: {
        flex: 1
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        paddingHorizontal: 26,
        paddingVertical: 20
    },
    diffuseShadow: {
        bottom: 0,
        opacity: 0.4
    },
    title: {
        fontSize: isLWidth ? 24 : 22,
        fontFamily: titleFont.bold,
        color: colors.white,
        // textTransform: 'uppercase',
        letterSpacing: 1
    },
    infoContainer: {
        paddingTop: 30,
        paddingBottom: 80
    },
    infoBorderContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: -50,
        marginRight: INFO_BORDER_MARGIN_RIGHT,
        paddingTop: 40,
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: 30,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderTopColor: 'white',
        borderRightColor: 'white',
        borderBottomColor: 'white',
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1
    },
    info: {
        width: '50%',
        marginBottom: 12
    },
    infoLarge: {
        width: '100%'
    },
    infoTitle: {
        paddingBottom: 5,
        fontFamily: titleFont.bold,
        color: 'white',
        fontSize: 14,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    infoValueContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    infoIcon: {
        marginRight: 9
    },
    calendarIcon: {
        width: CALENDAR_ICON_WIDTH,
        height: CALENDAR_ICON_HEIGHT
    },
    squatIcon: {
        width: SQUAT_ICON_WIDTH,
        height: SQUAT_ICON_HEIGHT
    },
    dumbbellIcon: {
        width: DUMBBELL_ICON_WIDTH,
        height: DUMBBELL_ICON_HEIGHT
    },
    locationIcon: {
        width: LOCATION_ICON_WIDTH,
        height: LOCATION_ICON_HEIGHT
    },
    kettlebellIcon: {
        width: KETTLEBELL_ICON_WIDTH,
        height: KETTLEBELL_ICON_HEIGHT
    },
    infoValue: {
        flex: 1,
        color: 'white',
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 14 : 12
    },
    infoDescripion: {
        marginTop: 30,
        paddingHorizontal: PADDING_HORIZONTAL
    },
    infoTip: {
        marginTop: 30,
        paddingHorizontal: PADDING_HORIZONTAL,
        color: 'white',
        textAlign: 'center',
        fontFamily: baseFont.bold,
        fontSize: 14
    },
    scrollViewGradient: {
        height: 50,
        position: 'absolute',
        right: 0,
        bottom: 0,
        left: 0,
        marginBottom: -CONFIRM_BUTTON_BORDER_RADIUS
    },
    confirmButton: {
        width: Math.round(viewportWidth * 0.9),
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: isLWidth ? 24 : 22,
        paddingVertical: isLWidth ? 22 : 20,
        borderRadius: CONFIRM_BUTTON_BORDER_RADIUS,
        backgroundColor: colors.violetDark,
        overflow: 'hidden'
    },
    confirmButtonGradient: {
        ...StyleSheet.absoluteFillObject
    },
    confirmButtonLabel: {
        color: 'white',
        fontSize: isLWidth ? 24 : (isMWidth ? 22 : 20),
        fontFamily: titleFont.bold,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        textAlign: 'center'
    }
});
