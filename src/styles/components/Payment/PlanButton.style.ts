import { StyleSheet } from 'react-native';
import chroma from 'chroma-js';
import colors from '../../base/colors.style';
import { isLWidth, isMWidth } from '../../base/metrics.style';
import { titleFont, baseFont } from '../../base/fonts.style';

export const MONTHLY_BUTTON_GRADIENT_COLORS = [colors.blueVeryLight, colors.blueDark];
export const QUARTERLY_BUTTON_GRADIENT_COLORS = [colors.orange, colors.pink];
const MONTHLY_BUTTON_COLOR_SCALE = chroma.scale(MONTHLY_BUTTON_GRADIENT_COLORS);
const QUARTERLY_BUTTON_COLOR_SCALE = chroma.scale(QUARTERLY_BUTTON_GRADIENT_COLORS);

const BORDER_RADIUS = 20;

const BADGE_SIZE = 58;
const BADGE_MARGIN_RIGHT = 24;

export default StyleSheet.create({
    fullSpace: {
        ...StyleSheet.absoluteFillObject
    },
    container: {
    },
    buttonContainer: {
        marginTop: 30
    },
    titleMonthly: {
        marginBottom: 6,
        paddingRight: BADGE_MARGIN_RIGHT + BADGE_SIZE + 10,
        fontFamily: titleFont.bold,
        fontSize: isLWidth ? 25 : 22,
        color: colors.blueVeryLight,
        letterSpacing: 0.75,
        textTransform: 'uppercase'
    },
    titleQuarterly: {
        color: colors.orange
    },
    titleAnnually: {
        color: colors.violetDark
    },
    priceContainer: {
        flex: 1,
        paddingRight: 10,
        paddingBottom: 10
    },
    priceBorder: {
        ...StyleSheet.absoluteFillObject,
        top: 15,
        left: 15,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: MONTHLY_BUTTON_COLOR_SCALE(0.5),
        borderRadius: BORDER_RADIUS
    },
    priceBorderQuarterly: {
        borderColor: QUARTERLY_BUTTON_COLOR_SCALE(0.5)
    },
    priceBorderAnnually: {
        borderColor: chroma(colors.violetDark).alpha(0.65).css()
    },
    priceContent: {
        flex: 1,
        borderRadius: BORDER_RADIUS,
        paddingVertical: 12,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    priceContentAnnually: {
        backgroundColor: colors.white,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.violetDark
    },
    priceTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10
    },
    priceTextContainerPaddingVertical: {
        paddingVertical: 6
    },
    priceText: {
        fontFamily: baseFont.regular,
        color: colors.white,
        letterSpacing: 0.5,
        paddingHorizontal: 5
    },
    priceTextAnnually: {
        color: colors.violetDark
    },
    price: {
        fontSize: isLWidth ? 20 : (isMWidth ? 18 : 16),
        fontFamily: baseFont.bold
    },
    pricePerDay: {
        fontSize: isLWidth ? 14 : (isMWidth ? 13 : 12)
    },
    pricePerDayMarginLeft: {
        marginLeft: 12
    },
    priceTrial: {
        flex: 1,
        marginLeft: 12,
        fontSize: isLWidth ? 14 : (isMWidth ? 13 : 12),
        fontFamily: baseFont.bold,
        letterSpacing: 1,
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    badgeContainer: {
        zIndex: 1,
        position: 'absolute',
        top: -Math.round(BADGE_SIZE * 0.65),
        right: BADGE_MARGIN_RIGHT,
        height: BADGE_SIZE,
        width: BADGE_SIZE,
        borderRadius: BADGE_SIZE / 2,
        backgroundColor: colors.violetDark,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeContainerGradient: {
        borderRadius: BADGE_SIZE / 2
    },
    badge: {
        fontFamily: titleFont.bold,
        fontSize: 12,
        color: colors.white,
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    badgePercent: {
        fontFamily: titleFont.bold,
        fontSize: 14,
        color: colors.white,
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center'
    },
    buttonGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: BORDER_RADIUS
    }
});
