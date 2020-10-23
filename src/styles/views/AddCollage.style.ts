import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import { iosHomeIndicatorOffset, isLWidth, isMWidth, baseHeaderHeight, viewportWidth } from '../base/metrics.style';
import { COLLAGE_DIMENSIONS, PICTURE_DIMENSIONS } from '../../utils/images';
import { baseFont, titleFont } from '../base/fonts.style';
import colors from '../base/colors.style';

const BLOB_RATIO = 781 / 552;
const BLOB_HEIGHT = 500;
const BLOB_WIDTH = Math.round(BLOB_HEIGHT * BLOB_RATIO);
const BLOB_POSITION_TOP = -Math.round(BLOB_HEIGHT * 0.25);
const BLOB_COLOR_SCALE = chroma.scale([colors.orange, colors.pink]);

export const BORDER_RADIUS = 20;

const ACTIVE_COLOR = BLOB_COLOR_SCALE(0.5).css();
export const SWITCH_COLOR = colors.violetDark;

const IMAGE_SPACING = isLWidth ? 14 : (isMWidth ? 12 : 10);
const MARGIN_HORIZONTAL = IMAGE_SPACING * (isLWidth ? 1.5 : 2);

const CIRCLE_WIDTH = 84;
const ICON_WIDTH = 44;
const NUMBER_CIRCLE_WIDTH = 32;

const EDIT_BUTTON_OFFSET = 12;
const EDIT_BUTTON_SIZE = 40;
const EDIT_ICON_SIZE = 14;

export const DATE_GRADIENT = [
    chroma(colors.black).alpha(0.65).css(),
    chroma(colors.black).alpha(0).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
        flex: 1,
        paddingHorizontal: MARGIN_HORIZONTAL
    },
    backgroundBlob: {
        position: 'absolute',
        alignSelf: 'center',
        top: BLOB_POSITION_TOP,
        width: BLOB_WIDTH,
        height: BLOB_HEIGHT
    },
    headerTitle: {
        marginRight: baseHeaderHeight + 10,
        fontSize: isMWidth ? 18 : 17,
        textAlign: 'center'
    },
    collageContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    collageContainerInner: {
        flex: 1
    },
    spacing: {
        marginRight: IMAGE_SPACING
    },
    image: {
        width: '100%',
        aspectRatio: COLLAGE_DIMENSIONS.width / COLLAGE_DIMENSIONS.height,
        borderColor: ACTIVE_COLOR,
        borderWidth: 1,
        overflow: 'hidden'
    },
    imageLeft: {
        borderTopLeftRadius: BORDER_RADIUS,
        borderBottomLeftRadius: BORDER_RADIUS
    },
    imageRight: {
        borderTopRightRadius: BORDER_RADIUS,
        borderBottomRightRadius: BORDER_RADIUS
    },
    placeholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.violetUltraLight
    },
    placeholderCircle: {
        width: CIRCLE_WIDTH,
        height: CIRCLE_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: CIRCLE_WIDTH,
        borderColor: ACTIVE_COLOR,
        borderWidth: 1,
        overflow: 'visible'
    },
    placeholderIcon: {
        width: ICON_WIDTH,
        height: ICON_WIDTH,
        marginLeft: -Math.round(ICON_WIDTH * 0.1),
        marginTop: -Math.round(ICON_WIDTH * 0.1),
        tintColor: ACTIVE_COLOR
    },
    placeholderNumber: {
        position: 'absolute',
        bottom: -NUMBER_CIRCLE_WIDTH / 4,
        right: -NUMBER_CIRCLE_WIDTH / 4,
        width: NUMBER_CIRCLE_WIDTH,
        height: NUMBER_CIRCLE_WIDTH,
        borderRadius: NUMBER_CIRCLE_WIDTH / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ACTIVE_COLOR
    },
    placeholderNumberText: {
        color: colors.white,
        fontSize: 18,
        fontFamily: baseFont.bold,
        textAlign: 'center'
    },
    editButtonsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        paddingHorizontal: EDIT_BUTTON_OFFSET,
        paddingVertical: EDIT_BUTTON_OFFSET
    },
    editButton: {
        width: EDIT_BUTTON_SIZE,
        height: EDIT_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: EDIT_BUTTON_SIZE / 2
    },
    editButtonInner: {
        padding: 10
    },
    editDateButton: {
        marginRight: EDIT_BUTTON_OFFSET / 2
    },
    editButtonIcon: {
        width: EDIT_ICON_SIZE,
        height: EDIT_ICON_SIZE
    },
    datePreviewContainer: {
        paddingHorizontal: 10,
        paddingVertical: 14
    },
    datePreviewGradientLeft: {
        borderTopLeftRadius: BORDER_RADIUS
    },
    datePreviewGradientRight: {
        borderTopRightRadius: BORDER_RADIUS
    },
    datePreviewLabel: {
        color: colors.white,
        fontFamily: titleFont.bold,
        fontSize: Math.floor(viewportWidth / PICTURE_DIMENSIONS.width * 50)
    },
    datePreviewLabelLeft: {
        textAlign: 'right'
    },
    datePreviewLabelRight: {
    },
    bottomContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 26,
        paddingBottom: 31 + iosHomeIndicatorOffset / 2
    },
    // Give it the same height as the collage button to avoid the layout from jumping around
    bottomTextContainer: {
        height: 54,
        justifyContent: 'center'
    },
    bottomText: {
        color: ACTIVE_COLOR,
        fontFamily: titleFont.bold,
        fontSize: isMWidth ? 22 : 20,
        letterSpacing: 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    switchContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    },
    switchLabel: {
        marginBottom: 4,
        color: SWITCH_COLOR,
        fontFamily: baseFont.regular,
        fontSize: isLWidth ? 13 : (isMWidth ? 12 : 11),
        letterSpacing: isMWidth ? 1 : 0.5,
        textAlign: 'center',
        textTransform: 'uppercase'
    }
});
