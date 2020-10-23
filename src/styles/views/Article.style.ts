import { StyleSheet } from 'react-native';
import {
    viewportWidth,
    viewportHeight,
    iosHomeIndicatorOffset,
    headerHeight,
    isMWidth,
    isLWidth,
    isAndroidNotch
} from '../base/metrics.style';
import { titleFont, baseFont } from '../base/fonts.style';
import { TOOLTIP_TOTAL_SIZE } from '../components/Tooltip.style';
import { HEADER_GRADIENT_HEIGHT } from '../components/Header.style';
import colors from '../base/colors.style';
import chroma from 'chroma-js';

export const SCROLLVIEW_GRADIENT_COLORS = [colors.violetLight, chroma(colors.violetLight).alpha(0)];
export const BOTTOM_GRADIENT_COLORS = [
    chroma(colors.black).alpha(0).css(),
    chroma(colors.black).alpha(1).css()
];

const PLAY_BUTTON_SIZE = isMWidth ? 90 : 80;

const BORDER_RADIUS = 12;
const PEOPLE_CONTAINER_BORDER_RADIUS = BORDER_RADIUS * 2;

export const BACKGROUND_SHAPE_RATIO = 375 / 664;
export const BACKGROUND_SHAPE_WIDTH = viewportWidth;
export const BACKGROUND_SHAPE_HEIGHT = BACKGROUND_SHAPE_WIDTH / BACKGROUND_SHAPE_RATIO;
export const BACKGROUND_SHAPE_TOP = Math.round(viewportHeight * 0.6);

// TODO/WARNING: the android notch "fix" will break if update to a version of React Native
// that returns the proper viewport height
export const TITLE_CONTAINER_BOTTOM = viewportHeight - BACKGROUND_SHAPE_TOP + (isAndroidNotch ? 60 : 0);

export const SCROLLVIEW_TOP = BACKGROUND_SHAPE_TOP + 70;

export const ARTICLE_HORIZONTAL_PADDING = isMWidth ? 32 : 26;

const VECTOR_BOTTOM_RATIO = 849 / 636;
const VECTOR_BOTTOM_WIDTH = Math.round(viewportWidth * 1.2);
const VECTOR_BOTTOM_HEIGHT = Math.round(VECTOR_BOTTOM_WIDTH / VECTOR_BOTTOM_RATIO);
const VECTOR_BOTTOM_LEFT = -Math.round(VECTOR_BOTTOM_WIDTH * 0.4);
const VECTOR_BOTTOM_BOTTOM = -Math.round(VECTOR_BOTTOM_HEIGHT * 0.5);

export const PEOPLE_BUTTON_COLORS = [
    chroma(colors.orange).css(),
    chroma(colors.violetLight).css()
];

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    flexContainer: {
        flex: 1
    },
    container: {
        overflow: 'hidden'
    },
    headerBlurContainer: {
        position: 'absolute',
        left: 0,
        right: 0
    },
    headerBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: HEADER_GRADIENT_HEIGHT
    },
    headerBlurIOS: {
    },
    headerBlurAndroid: {
    },
    headerBackgroundContainer: {
        ...StyleSheet.absoluteFillObject
    },
    foregroundChildrenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: viewportHeight
    },
    imageViewer: {
        flex: 1
    },
    imageViewDummyTitle: {
        marginTop: 0,
        opacity: 0
    },
    imageViewerDummyBottom: {
        height: viewportHeight - BACKGROUND_SHAPE_TOP
    },
    videoLauncherContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: viewportHeight - TITLE_CONTAINER_BOTTOM
    },
    playIconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: headerHeight / 2
    },
    playIcon: {
        width: PLAY_BUTTON_SIZE,
        aspectRatio: 1
    },
    playIconBlur: {
        borderRadius: PLAY_BUTTON_SIZE / 2
    },
    playIconBlurIOS: {
        backgroundColor: chroma(colors.violetDark).alpha(0.15).css()
    },
    playIconBlurAndroid: {
        backgroundColor: chroma(colors.violetDark).alpha(0.35).css()
    },
    backgroundImageContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.violetVeryLight
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Math.round(viewportHeight * 0.7)
    },
    backgroundShape: {
        position: 'absolute',
        top: BACKGROUND_SHAPE_TOP,
        left: 0,
        width: BACKGROUND_SHAPE_WIDTH,
        aspectRatio: BACKGROUND_SHAPE_RATIO
    },
    titleContainer: {
        position: 'absolute',
        bottom: TITLE_CONTAINER_BOTTOM,
        left: 0,
        right: 0,
        overflow: 'visible' // See ellipsis on Android
    },
    titleContainerPlaceholder: {
        opacity: 0
    },
    title: {
        marginTop: 15,
        marginBottom: 16,
        paddingHorizontal: ARTICLE_HORIZONTAL_PADDING,
        paddingBottom: 10, // For text shadow
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 28 : (isMWidth ? 26 : 24),
        textTransform: 'uppercase',
        color: colors.white,
        textShadowColor: chroma(colors.black).alpha(0.35).css(),
        textShadowOffset: {width: 0, height: 8},
        textShadowRadius: 8
    },
    tagAndDateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: ARTICLE_HORIZONTAL_PADDING
    },
    tagWrapper: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginRight: 15
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: isMWidth ? 20 : 16,
        paddingVertical: isMWidth ? 10 : 8,
        borderRadius: isMWidth ? 20 : 16,
        backgroundColor: colors.violetDark
    },
    tagIcon: {
        height: 13,
        width: 16,
        marginRight: 5
    },
    tagLabel: {
        color: colors.white,
        fontSize: isLWidth ? 14 : (isMWidth ? 13 : 12),
        fontFamily: baseFont.light,
        letterSpacing: 0.5,
        textTransform: 'uppercase'
    },
    date: {
        fontFamily: titleFont.bold,
        fontSize: 16,
        color: colors.white
    },
    ellipsisContainer: {
        position: 'absolute',
        bottom: TITLE_CONTAINER_BOTTOM - 45,
        right: 30
    },
    ellipsisContainerRecipe: {
        bottom: TITLE_CONTAINER_BOTTOM - 20
    },
    ellipsisText: {
        color: chroma(colors.white).alpha(0.45).css(),
        lineHeight: 18
    },
    bottomVectorContainer: {
        position: 'absolute',
        width: VECTOR_BOTTOM_WIDTH,
        height: VECTOR_BOTTOM_HEIGHT,
        left: VECTOR_BOTTOM_LEFT,
        bottom: VECTOR_BOTTOM_BOTTOM
    },
    bottomVectorImageContainer: {
        width: VECTOR_BOTTOM_WIDTH,
        height: VECTOR_BOTTOM_HEIGHT
    },
    scrollViewContentContainer: {
        paddingTop: SCROLLVIEW_TOP,
        paddingBottom: iosHomeIndicatorOffset + 100
    },
    contentContainer: {
    },
    topContentContainerRecipe: {
        paddingHorizontal: ARTICLE_HORIZONTAL_PADDING
    },
    topContentContainerArticle: {
        paddingHorizontal: ARTICLE_HORIZONTAL_PADDING,
        paddingTop: 40
    },
    htmlContentContainer: {
        paddingHorizontal: ARTICLE_HORIZONTAL_PADDING
        // backgroundColor: colors.background
    },
    backgroundBorder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.violetLight,
        borderRadius: BORDER_RADIUS,
        margin: 15
    },
    summaryContainer: {
        marginRight: Math.round(BACKGROUND_SHAPE_WIDTH * 0.28)
    },
    summary: {
        fontFamily: baseFont.regular,
        fontSize: 16,
        color: colors.violetDark,
        letterSpacing: 1
    },
    authorContainer: {
        backgroundColor:  colors.violetLight,
        marginBottom: 40,
        marginLeft: -ARTICLE_HORIZONTAL_PADDING,
        alignSelf: 'flex-start',
        paddingVertical: isLWidth ? 15 : (isMWidth ? 14 : 13),
        paddingHorizontal: ARTICLE_HORIZONTAL_PADDING,
        borderTopEndRadius: 40,
        borderBottomEndRadius: 40
    },
    author: {
        color: colors.white,
        fontFamily: titleFont.light,
        fontSize: isLWidth ? 15 : (isMWidth ? 14 : 13),
        letterSpacing: 0.5
        // paddingBottom: 4, // For bottom shadow
        // textShadowColor: chroma(colors.violetDark).alpha(0.3).css(),
        // textShadowOffset: {width: 0, height: 4},
        // textShadowRadius: 4
    },
    nutrientsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    nutrientBloc: {
        width: isMWidth ? 86 : 80,
        aspectRatio: 1
    },
    nutrientBlocInner: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.violetLight,
        borderRadius: BORDER_RADIUS,
        alignItems: 'center',
        justifyContent: 'center'
        // elevation: 6 // Avoid -> this creates strange effect when clicking on image viewer
    },
    nutrientTitle: {
        marginBottom: 3,
        fontFamily: baseFont.regular,
        fontSize: 11,
        color: colors.violetDark,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    nutrientQuantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2
    },
    nutrientQuantity: {
        fontFamily: baseFont.bold,
        fontSize: isLWidth ? 16 : (isMWidth ? 15 : 14),
        color: colors.white,
        letterSpacing: isLWidth ? 1 : 0.5
    },
    nutrientQuantityUnits: {
        marginLeft: 6
    },
    kCalContainer: {
        marginTop: 15,
        alignSelf: 'center'
    },
    kCalContainerInner: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 11,
        paddingHorizontal: 18,
        backgroundColor: colors.violetDark,
        borderRadius: BORDER_RADIUS
        // elevation: 6 // Avoid -> this creates strange effect when clicking on image viewer
    },
    kCal: {
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: 14,
        letterSpacing: isMWidth ? 1 : 0.5
    },
    kCalUnits: {
        marginLeft: 6
    },
    infosWrapper: {
        flexDirection: 'row',
        marginVertical: 20
    },
    infosContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        paddingHorizontal: isMWidth ? 15 : 10,
        borderWidth: 2,
        borderColor: chroma(colors.violetDark).alpha(0.2),
        borderRadius: BORDER_RADIUS
    },
    infosContainerInner: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14
    },
    recipeTime: {
        color: colors.violetDark,
        fontFamily: baseFont.bold,
        fontSize: isMWidth ? 18 : 16,
        letterSpacing: 1
    },
    infoIcon: {
        width: isMWidth ? 15 : 13,
        aspectRatio: 1,
        marginRight: isMWidth ? 8 : 6
    },
    selectWrapper: {
        flex: 1,
        marginLeft: 10
    },
    peopleContainer: {
        flex: 1,
        borderRadius: PEOPLE_CONTAINER_BORDER_RADIUS,
        overflow: 'hidden'
    },
    dropdownPeopleContainer: {
        flex: 1,
        flexDirection: 'row',
        margin: 2,
        borderRadius: PEOPLE_CONTAINER_BORDER_RADIUS - 2,
        overflow: 'hidden'
    },
    dropdownPeopleLeftContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    infoIconPeople: {
        width: isMWidth ? 18 : 16,
        aspectRatio: 18 / 15
    },
    recipePeople: {
        paddingLeft: 6,
        color: colors.white,
        fontFamily: baseFont.regular,
        fontSize: isMWidth ? 14 : 13,
        letterSpacing: isMWidth ? 1 : 0.5
    },
    dropdownPeopleRightContainer: {
        width: 30,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dropdownPeopleRightContainerAndroid: {
        flex: 2
    },
    dropdownIcon: {
        width: 12,
        aspectRatio: 12 / 7
    },
    ingredientsContainer: {
        paddingHorizontal: ARTICLE_HORIZONTAL_PADDING,
        paddingBottom: 20
    },
    ingredientListContainer: {
        paddingLeft: 30
    },
    ingredientItemContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 15
    },
    bullet: {
        height: 13,
        width: 14,
        alignSelf: 'flex-start',
        marginTop: 4
    },
    ingredient: {
        paddingLeft: 10,
        color: colors.grayDark,
        fontFamily: baseFont.regular,
        fontSize: 14,
        letterSpacing: 1
    },
    scrollViewGradientContainer: {
        position: 'absolute',
        top: headerHeight,
        left: 0,
        right: 0,
        height: 50
    },
    scrollViewGradient: {
        ...StyleSheet.absoluteFillObject
    },
    tooltipTime: {
        position: 'absolute',
        top: -15,
        left: -8
    },
    tooltipServings: {
        position: 'absolute',
        right: TOOLTIP_TOTAL_SIZE / 2,
        top: -15
    }
});
