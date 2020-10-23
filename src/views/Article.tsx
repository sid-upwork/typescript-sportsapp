import React, { PureComponent, Fragment } from 'react';
import { View, Text, Animated, Linking, TouchableOpacity, Appearance } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import HTML from 'react-native-render-html';
import { getParentsTagsRecursively } from 'react-native-render-html/src/HTMLUtils';
import chroma from 'chroma-js';
import I18n from '../utils/i18n';
import animDelays from '../utils/animDelays';
import { getTextColorFromLuminance, checkColorFormat } from '../utils/colors';
import { getFormattedDate } from '../utils/date';
import { getFormatedRecipeWeight, getFormatedRecipeVolume } from '../utils/units';
import { isAndroid } from '../utils/os';
import { getFormattedDuration } from '../utils/workout';
import { IArticle } from '../types/article';
import { IVideoPlayerProps } from '../components/VideoPlayer';
import { IRecipe, IRecipeIngredient } from '../types/recipe';
import { ETooltipIds } from '../store/modules/tutorials';
import { logEvent } from '../utils/analytics';
import { IScreenProps } from '../index';

import BlurWrapper from '../components/BlurWrapper';
import DiffuseShadow from '../components/DiffuseShadow';
import EllipsisSeparator from '../components/EllipsisSeparator';
import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import HTMLRenderersDefault from '../components/HTMLRenderer';
import NativePicker from '../components/Popups/NativePicker';
import NumberTicker from '../components/Ticker/NumberTicker';
import SharedParallaxView from '../components/SharedParallaxView';
import Tooltip from '../components/Tooltip';
import TouchableScale from '../components/TouchableScale';

import colors from '../styles/base/colors.style';
import { viewportHeight, viewportWidth } from '../styles/base/metrics.style';
import getHTMLStyles, { BASE_FONT_STYLE, IMAGE_MAX_WIDTH, IMAGE_INITIAL_SIZE } from '../styles/base/html.style';
import styles, {
    PEOPLE_BUTTON_COLORS,
    BOTTOM_GRADIENT_COLORS
} from '../styles/views/Article.style';

import BackgroundShape from '../static/shared/rounded_background-white.svg';
import BottomShape from '../static/Article/background-bottom.svg';
import IconPlayColored from '../static/icons/video/play-colored.svg';

interface IProps {
    data: IArticle | IRecipe;
    navigation?: any;
    screenProps: IScreenProps;
    type: 'article' | 'recipe';
}

interface IState {
    animContentOpacity: Animated.Value;
    animContentTransform: Animated.Value;
    animPlayOpacity: Animated.Value;
    animPlayTransform: Animated.Value;
    animTopContentOpacity: Animated.Value;
    animTopContentTransform: Animated.Value;
    animTagOpacity: Animated.Value;
    animTagTransform: Animated.Value;
    animTitleOpacity: Animated.Value;
    animTitleTransform: Animated.Value;
    animUIOpacity: Animated.Value;
    animateNutrientsTicker: boolean;
    preventHeaderTitleTouchThrough: boolean;
    servings: number;
    showFullImage: boolean;
}

export const ARTICLE_IMAGE_INITIAL_SCALE = 1.2;
const TITLE_MAX_LINES = 4;
const HEADER_SCROLL_THRESHOLD = viewportHeight * 0.55;

const BULLET = require('../static/icons/bullet.png');
const VEGAN_ICON = require('../static/icons/vegan.png');

class Article extends PureComponent<IProps, IState> {

    private data: IArticle | IRecipe;
    private type: 'article' | 'recipe';
    private closeButton: boolean;
    private article: IArticle;
    private recipe: IRecipe;
    private isArticle: boolean;
    private isRecipe: boolean;
    private isDarkMode: boolean;
    private parallaxHeaderRef: React.RefObject<SharedParallaxView>;
    private recipePeopleCount: number;
    private minDelay: number = animDelays.views.article.transitioner.safety + animDelays.views.article.transitioner.opacity + 150;
    private mounted: boolean = false;

    constructor (props: IProps) {
        super(props);
        const { data, type } = this.props;
        this.data = !data ? this.props.navigation.getParam('data') : data;
        this.type = !type ? this.props.navigation.getParam('type') : type;
        this.closeButton = this.props.navigation.getParam('closeButton');
        this.isRecipe = this.type === 'recipe';
        this.isArticle = this.type === 'article';
        this.isDarkMode = Appearance.getColorScheme() === 'dark';
        this.article = this.isArticle ? this.data as IArticle : null;
        this.recipe = this.isRecipe ? this.data as IRecipe : null;
        this.parallaxHeaderRef = React.createRef();
        this.recipePeopleCount = 10;
        const servings = this.recipe && this.recipe.servings ? this.recipe.servings : 1;
        this.state = {
            animContentOpacity: new Animated.Value(0),
            animContentTransform: new Animated.Value(0),
            animPlayOpacity: new Animated.Value(0),
            animPlayTransform: new Animated.Value(0),
            animTopContentOpacity: new Animated.Value(0),
            animTopContentTransform: new Animated.Value(0),
            animTagOpacity: new Animated.Value(0),
            animTagTransform: new Animated.Value(0),
            animTitleOpacity: new Animated.Value(0),
            animTitleTransform: new Animated.Value(0),
            animUIOpacity: new Animated.Value(0),
            animateNutrientsTicker: false,
            preventHeaderTitleTouchThrough: false,
            servings: servings,
            showFullImage: false
        };
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.animate(1, this.minDelay);
    }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private animate (toValue: number = 1, initialDelay: number = 0): void {
        const {
            animContentOpacity,
            animContentTransform,
            animPlayOpacity,
            animPlayTransform,
            animTopContentOpacity,
            animTopContentTransform,
            animTagOpacity,
            animTagTransform,
            animTitleOpacity,
            animTitleTransform,
            animUIOpacity
        } = this.state;

        const timingParams = {
            toValue,
            duration: 150,
            isInteraction: false,
            useNativeDriver: true
        };

        const springParams = {
            toValue,
            speed: 13,
            bounciness: 6,
            isInteraction: false,
            useNativeDriver: true
        };

        const shouldHideUI = toValue === 0;
        const staggeredDelay = 80;

        this.setState({
            animateNutrientsTicker: !shouldHideUI,
            showFullImage: shouldHideUI
        });

        Animated.parallel([
            Animated.sequence([
                Animated.delay(initialDelay + (shouldHideUI ? staggeredDelay * 5 : staggeredDelay * 0)),
                Animated.timing(animUIOpacity, { ...timingParams, duration: 300 })
            ]),
            Animated.sequence([
                Animated.delay(initialDelay + (shouldHideUI ? staggeredDelay * 4 : staggeredDelay * 1)),
                Animated.parallel([
                    Animated.timing(animPlayOpacity, timingParams),
                    Animated.spring(animPlayTransform, springParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(initialDelay + (shouldHideUI ? staggeredDelay * 3 : staggeredDelay * 2)),
                Animated.parallel([
                    Animated.timing(animTagOpacity, timingParams),
                    Animated.spring(animTagTransform, springParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(initialDelay + (shouldHideUI ? staggeredDelay * 2 : staggeredDelay * 3)),
                Animated.parallel([
                    Animated.timing(animTitleOpacity, timingParams),
                    Animated.spring(animTitleTransform, springParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(initialDelay + (shouldHideUI ? staggeredDelay * 1 : staggeredDelay * 4)),
                Animated.parallel([
                    Animated.timing(animTopContentOpacity, timingParams),
                    Animated.spring(animTopContentTransform, springParams)
                ])
            ]),
            Animated.sequence([
                Animated.delay(initialDelay + (shouldHideUI ? staggeredDelay * 0 : staggeredDelay * 5)),
                Animated.parallel([
                    Animated.timing(animContentOpacity, timingParams),
                    Animated.spring(animContentTransform, springParams)
                ])
            ])
        ]).start();
    }

    private onScrollThresholdReached = (passed: boolean) => {
        this.setState({ preventHeaderTitleTouchThrough: passed });
    }

    private onPressPeopleSelect = () => {
        let items = [];
        for (let i = 1; i <= this.recipePeopleCount; i++) {
            items.push({ label: i.toString(), value: i });
        }

        this.props.screenProps?.popupManagerRef?.current?.requestPopup({
            backgroundColors: this.isDarkMode ? null : ['#FFFADE', '#FFCFF7'],
            backgroundType: 'gradient',
            closeButtonIconColor: this.isDarkMode ? 'white' : colors.violetDark,
            ContentComponent: NativePicker,
            ContentComponentProps: {
                items,
                onValueChange: (itemValue: number) => this.onPeopleCountChange(itemValue),
                selectedValue: this.state.servings
            },
            height: 350,
            position: 'bottom',
            scrollView: false,
            title: I18n.t(`article.chooseServings`),
            titleStyle: { color: this.isDarkMode ? 'white' : colors.violetDark, paddingBottom: 0 }
        });
    }

    private alterNode = (node: any) => {
        const { name, parent } = node;
        const textTags = ['p', 'h1', 'h2', 'h3', 'h4'];
        if (textTags.indexOf(name) && getParentsTagsRecursively(parent).indexOf('aside') !== -1) {
            // Let's assign a specific color to the node's attribs (if there already are)
            node.attribs = { ...(node.attribs || {}), style: `color:white;` };
            return node;
        }
        // Don't return anything (eg a falsy value) for anything else so nothing is altered
    }

    private get categoryInfo (): any {
        const categoriesArray = (this.isRecipe && this.recipe?.tags) || (this.isArticle && this.article?.categories);
        return categoriesArray && categoriesArray.length ? categoriesArray[0] : undefined;
    }

    private get categoryTitle (): string {
        return this.categoryInfo?.title;
    }

    private get categoryColor (): string {
        return checkColorFormat(this.categoryInfo?.color || colors.violetDark);
    }

    private get categoryTitleColor (): string {
        return getTextColorFromLuminance(this.categoryColor);
    }

    private get category (): JSX.Element {
        const icon = this.isRecipe ? (
            <FadeInImage
                containerCustomStyle={styles.tagIcon}
                source={VEGAN_ICON}
                tintColor={this.categoryTitleColor}
            />
        ) : null;
        return !!this.categoryTitle ? (
            <View style={[styles.tagContainer, { backgroundColor: this.categoryColor }]}>
                { icon }
                <Text style={[styles.tagLabel, { color: this.categoryTitleColor }]} numberOfLines={1}>
                    { this.categoryTitle }
                </Text>
            </View>
        ) : null;
    }

    private title (animatedValue: Animated.Value, placeholderVersion: boolean = false): JSX.Element {
        const {
            animTagOpacity,
            animTagTransform,
            animTitleOpacity,
            animTitleTransform
         } = this.state;

        const date = this.isArticle && this.article?.createdAt ? (
            <Text style={styles.date}>{ getFormattedDate(this.article.createdAt) }</Text>
        ) : null;

        const animTagStyle = {
            transform: [{
                translateY: animTagTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [80, 0]
                })
            }],
            opacity: animTagOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            })
        };

        const animTitleStyle = {
            transform: [{
                translateY: animTitleTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                })
            }],
            opacity: animTitleOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            })
        };

        const animatedTitleContainerStyle = {
            transform: [{
                translateY: animatedValue.interpolate({
                    inputRange: [-viewportHeight, 0, viewportHeight],
                    outputRange: [viewportHeight * 0.65, 0, -viewportHeight * 0.75]
                })
            }],
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.5],
                outputRange: [1, 0],
                extrapolate: 'clamp'
            })
        };

        return placeholderVersion ? (
            <View style={styles.titleContainerPlaceholder}>
                <View style={styles.tagAndDateContainer}>
                    <View style={styles.tagWrapper}>
                        { this.category }
                    </View>
                    { date }
                </View>
                <Text
                    style={styles.title}
                    numberOfLines={TITLE_MAX_LINES}
                >
                    { this.data.title }
                </Text>
            </View>
        ) : (
            <Animated.View style={[animatedTitleContainerStyle, styles.titleContainer]}>
                <Animated.View style={[animTagStyle, styles.tagAndDateContainer]}>
                    <View style={styles.tagWrapper}>
                        { this.category }
                    </View>
                    { date }
                </Animated.View>
                <Animated.Text
                    style={[animTitleStyle, styles.title]}
                    numberOfLines={TITLE_MAX_LINES}
                >
                    { this.data.title }
                </Animated.Text>
            </Animated.View>
        );
    }

    private parallaxBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const { animUIOpacity } = this.state;
        const uiAnimatedStyle = { opacity: animUIOpacity };
        const imageAnimationThreshold = viewportHeight * 0.2;
        const animatedImageContainerStyle = this.isRecipe ? {
            transform: [{
                scale: animatedValue.interpolate({
                    inputRange: [-viewportHeight, 0],
                    outputRange: [1.5, 1],
                    extrapolate: 'clamp'
                })
            }, {
                translateY: animatedValue.interpolate({
                    inputRange: [0, viewportHeight],
                    outputRange: [0, -viewportHeight * 0.6],
                    extrapolate: 'clamp'
                })
            }]
        } : {
            transform: [{
                scale: animatedValue.interpolate({
                    inputRange: [0, imageAnimationThreshold],
                    outputRange: [ARTICLE_IMAGE_INITIAL_SCALE, 1],
                    extrapolateRight: 'clamp'
                })
            }, {
                translateY: animatedValue.interpolate({
                    inputRange: [0, imageAnimationThreshold, viewportHeight],
                    outputRange: [0, -viewportHeight * 0.05, -viewportHeight * 0.6],
                    extrapolate: 'clamp'
                })
            }]
        };
        const animatedImageBlurStyle = {
            opacity: this.isRecipe ? animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.35],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            }) : animatedValue.interpolate({
                inputRange: [0, imageAnimationThreshold, viewportHeight * 0.35],
                outputRange: [0, 0, 1],
                extrapolate: 'clamp'
            })
        };
        const animatedDetailsContainerStyle = {
            transform: [{
                translateY: animatedValue.interpolate({
                    inputRange: [0, viewportHeight],
                    outputRange: [0, -viewportHeight * 1],
                    extrapolate: 'clamp'
                })
            }]
        };
        const animatedEllipsis = {
            opacity: animatedValue.interpolate({
                inputRange: [-viewportWidth * 0.5, 0, viewportHeight * 0.75],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp'
            }),
            transform: [{
                translateX: animatedValue.interpolate({
                    inputRange: [0, viewportHeight],
                    outputRange: [0, viewportWidth],
                    extrapolate: 'clamp'
                })
            }]
        };
        const animatedVectorTransform = {
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [-viewportHeight, 0, viewportHeight],
                        outputRange: [viewportHeight * 0.75, 0, -viewportHeight * 1.75],
                        extrapolate: 'clamp'
                    })
                },
                {
                    scale: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [1, 5],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const animatedBottomBackgroundStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.4, viewportHeight * 0.8],
                outputRange: [0, 0, 0.6],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateX: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [-viewportWidth * 0.5, 0],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };

        const blurView = !isAndroid ? (
            <Animated.View style={[styles.fullSpace, animatedImageBlurStyle]}>
                <BlurWrapper
                    type={'vibrancy'}
                    blurType={'light'}
                    blurAmount={10}
                    style={styles.fullSpace}
                />
            </Animated.View>
        ) : null;

        const ellipsis = (
            <Animated.View style={[styles.fullSpace, animatedEllipsis]}>
                <EllipsisSeparator
                    containerTextStyle={[styles.ellipsisContainer, this.isRecipe ? styles.ellipsisContainerRecipe : {}]}
                    textStyle={[styles.ellipsisText, { color: chroma(this.categoryColor).alpha(0.45).css() }]}
                />
            </Animated.View>
        );

        return (
            <View style={styles.fullSpace}>
                <View style={styles.fullSpace}>
                    <Animated.View style={[styles.fullSpace, animatedImageContainerStyle]}>
                        <FadeInImage
                            containerCustomStyle={styles.backgroundImageContainer}
                            loaderColor={'rgba(255, 255, 255, 0.65)'}
                            source={{ uri: this.data.fullscreenImage && this.data.fullscreenImage.url }}
                        />
                    </Animated.View>
                    { blurView }
                </View>
                <Animated.View style={[styles.fullSpace, uiAnimatedStyle]}>
                    <Animated.View style={[styles.fullSpace, animatedDetailsContainerStyle]}>
                        <LinearGradient
                            colors={BOTTOM_GRADIENT_COLORS}
                            style={styles.bottomGradient}
                            pointerEvents={'none'}
                        />
                        {/* { ellipsis } */}
                    </Animated.View>
                    { this.title(animatedValue) }
                    <Animated.View style={[styles.fullSpace, animatedVectorTransform]}>
                        <BackgroundShape style={styles.backgroundShape} />
                    </Animated.View>
                    <Animated.View style={[styles.bottomVectorContainer, animatedBottomBackgroundStyle]}>
                        <BottomShape style={styles.bottomVectorImageContainer} />
                    </Animated.View>
                </Animated.View>
            </View>
        );
    }

    private imageViewer = (animatedValue: Animated.Value): JSX.Element => {
        const { showFullImage } = this.state;

        if (!this.isRecipe) {
            return null;
        }

        const onPress = () => {
            logEvent('recipe_photo_display', { imageId: this.data?.fullscreenImage?.id });
            this.parallaxHeaderRef.current.scrollTo({ y: 0 });
            this.animate(!showFullImage ? 0 : 1);
        };

        const animatedContainerStyle = {
            transform: [{
                translateY: animatedValue.interpolate({
                    inputRange: [0, viewportHeight],
                    outputRange: [0, viewportHeight - viewportHeight * 0.75], // Same parallax effect as `this.title()`
                    extrapolate: 'clamp'
                })
            }]
        };

        const bottomPlaceholder = !showFullImage ? (
            <View pointerEvents={'none'}>
                <Text style={[styles.title, styles.imageViewDummyTitle]} numberOfLines={TITLE_MAX_LINES}>
                    { this.data.title }
                </Text>
                <View style={styles.imageViewerDummyBottom} />
            </View>
        ) : null;

        return (
            <Animated.View style={[styles.fullSpace, animatedContainerStyle]} pointerEvents={'box-none'}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.imageViewer}
                    onPress={onPress}
                >
                    <View style={styles.fullSpace} />
                </TouchableOpacity>
                { bottomPlaceholder }
            </Animated.View>
        );
    }

    private videoLauncher = (animatedValue: Animated.Value): JSX.Element => {
        const { animPlayOpacity, animPlayTransform } = this.state;
        const { navigation } = this.props;
        const video = this.isArticle && this.article?.video;

        if (!video) {
            return null;
        }

        const onPress = () => {
            const player: IVideoPlayerProps = {
                thumbnailSource: video.thumbnailUrl,
                videoSource: video.url
            };
            navigation?.navigate && navigation?.navigate('Video', { player });
            logEvent('article_video_launch', { videoId: video.fileName || '' });
        };

        const animatedStyle = {
            opacity: animPlayOpacity,
            transform: [{
                scale: animPlayTransform
            }]
        };

        const scrollAnimatedStyle = {
            transform: [{
                translateY: animatedValue.interpolate({
                    inputRange: [-viewportHeight, 0, viewportHeight],
                    outputRange: [-viewportHeight + viewportHeight * 0.65, 0, viewportHeight - viewportHeight * 0.75],
                    extrapolate: 'clamp'
                })
            }],
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.5],
                outputRange: [1, 0],
                extrapolate: 'clamp'
            })
        };

        return (
            <Animated.View
                style={[styles.videoLauncherContainer, scrollAnimatedStyle]}
                pointerEvents={'box-none'}
            >
                <Animated.View style={[styles.flexContainer, animatedStyle]}>
                    <View style={styles.playIconContainer}>
                        <TouchableScale
                            style={styles.playIcon}
                            onPress={onPress}
                            activeOpacity={0.9}
                        >
                            <BlurWrapper
                                type={'vibrancy'}
                                blurType={'light'}
                                blurAmount={12}
                                style={[styles.fullSpace, styles.playIconBlur]}
                                blurStyle={styles.playIconBlurIOS}
                                fallbackStyle={styles.playIconBlurAndroid}
                            />
                            <IconPlayColored style={styles.fullSpace} />
                        </TouchableScale>
                    </View>
                    { this.title(animatedValue, true) }
                </Animated.View>
            </Animated.View>
        );
    }

    private foregroundChildren = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <View style={styles.foregroundChildrenContainer} pointerEvents={'box-none'}>
                { this.imageViewer(animatedValue) }
                { this.videoLauncher(animatedValue) }
            </View>
        );
    }

    private parallaxForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const { preventHeaderTitleTouchThrough } = this.state;
        const blurAnimatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.25, HEADER_SCROLL_THRESHOLD],
                outputRange: [0, 0, 1],
                extrapolate: 'clamp'
            })
        };
        return (
            <Fragment>
                <Animated.View
                    style={[styles.headerBlurContainer, blurAnimatedStyle]}
                    pointerEvents={preventHeaderTitleTouchThrough ? 'auto' : 'none'}
                >
                    <BlurWrapper
                        type={'vibrancy'}
                        blurType={'dark'}
                        blurAmount={12}
                        style={styles.headerBlur}
                        blurStyle={styles.headerBlurIOS}
                        fallbackStyle={styles.headerBlurAndroid}
                    />
                </Animated.View>
                <Header
                    animatedValue={animatedValue}
                    gradientAlwaysVisible={true}
                    gradientColors={'black'}
                    mode={this.closeButton ? 'closeWhite' : 'placeholder'}
                    title={this.data.title}
                    titlePreventTouchThrough={preventHeaderTitleTouchThrough}
                />
            </Fragment>
        );
    }

    private onPeopleCountChange = (value: number) => {
        this.setState({ servings: value });
        logEvent('recipe_servings_change', { servings: value });
    }

    private get summary (): JSX.Element {
        return this.article.summary ? (
            <View style={styles.summaryContainer}>
                <Text style={styles.summary}>
                    {this.article.summary}
                </Text>
            </View>
        ) : null;
    }

    private get author (): JSX.Element {
        return this.article.author ? (
            <View style={[styles.authorContainer, this.categoryColor ? { backgroundColor: this.categoryColor } : {}]}>
                <Text style={[styles.author, this.categoryTitleColor ? { color: this.categoryTitleColor } : {}]}>
                    {I18n.t('article.writtenBy')} {this.article.author.firstName}
                </Text>
            </View>
        ) : null;
    }

    private get nutrients (): JSX.Element {
        const { servings, animateNutrientsTicker } = this.state;
        const tickerDuration = animateNutrientsTicker ? 450 : 0;
        const kcalUnit = I18n.t('article.kcal');
        const gUnit = I18n.t('global.units.g');
        const proteinTickerText = `${servings * this.recipe.proteins}`;
        const carbsTickerText = `${servings * this.recipe.carbs}`;
        const fatTickerText = `${servings * this.recipe.fat}`;
        const kCalTickerText = `${servings * this.recipe.calories}`;

        const shadow = (
            <DiffuseShadow
                horizontalOffset={10}
                color={colors.violetDark}
                shadowOpacity={0.35}
                verticalOffset={8}
            />
        );
        const proteinNumber = (
            <NumberTicker
                duration={tickerDuration}
                text={proteinTickerText}
                textStyle={styles.nutrientQuantity}
            />
        );
        const carbsNumber = (
            <NumberTicker
                duration={tickerDuration + 80}
                text={carbsTickerText}
                textStyle={styles.nutrientQuantity}
            />
        );
        const fatNumber = (
            <NumberTicker
                duration={tickerDuration + 160}
                text={fatTickerText}
                textStyle={styles.nutrientQuantity}
            />
        );
        const kcalNumber = (
            <NumberTicker
                duration={tickerDuration + 240}
                text={kCalTickerText}
                textStyle={styles.kCal}
            />
        );

        return (
            <View>
                <View style={styles.backgroundBorder} />
                <View style={styles.nutrientsContainer}>
                    <View style={styles.nutrientBloc}>
                        { shadow }
                        <View style={styles.nutrientBlocInner}>
                            <Text
                                style={styles.nutrientTitle}
                                numberOfLines={1}
                            >
                                { I18n.t('article.proteins') }
                            </Text>
                            <View style={styles.nutrientQuantityContainer}>
                                { proteinNumber }
                                <Text style={[styles.nutrientQuantity, styles.nutrientQuantityUnits]}>
                                    { gUnit }
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.nutrientBloc}>
                        { shadow }
                        <View style={styles.nutrientBlocInner}>
                            <Text
                                style={styles.nutrientTitle}
                                numberOfLines={1}
                            >
                                { I18n.t('article.carbs') }
                            </Text>
                            <View style={styles.nutrientQuantityContainer}>
                                { carbsNumber }
                                <Text style={[styles.nutrientQuantity, styles.nutrientQuantityUnits]}>
                                    { gUnit }
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.nutrientBloc}>
                        { shadow }
                        <View style={styles.nutrientBlocInner}>
                            <Text
                                style={styles.nutrientTitle}
                                numberOfLines={1}
                            >
                                { I18n.t('article.fats') }
                            </Text>
                            <View style={styles.nutrientQuantityContainer}>
                                { fatNumber }
                                <Text style={[styles.nutrientQuantity, styles.nutrientQuantityUnits]}>
                                    { gUnit }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.kCalContainer}>
                    { shadow }
                    <View style={styles.kCalContainerInner}>
                        { kcalNumber }
                        <Text style={[styles.kCal, styles.kCalUnits]}>
                            { kcalUnit }
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    private get infos (): JSX.Element {
        const { screenProps } = this.props;

        const prepTime = this.recipe && this.recipe.preparationTime ? (
            <View style={styles.infosContainerInner}>
                <FadeInImage
                    source={require('../static/icons/whisk-icon.png')}
                    containerCustomStyle={styles.infoIcon}
                    resizeMode={'contain'}
                />
                <Text style={styles.recipeTime}>{getFormattedDuration(this.recipe.preparationTime)}</Text>
                <Tooltip
                    containerStyle={styles.tooltipTime}
                    screenProps={screenProps}
                    tooltipId={ETooltipIds.recipePrepTime}
                />
            </View>
        ) : null;
        const cookTime = this.recipe && this.recipe.cookTime ? (
            <View style={styles.infosContainerInner}>
                <FadeInImage
                    source={require('../static/icons/oven-icon.png')}
                    containerCustomStyle={styles.infoIcon}
                    resizeMode={'contain'}
                />
                <Text style={styles.recipeTime}>{getFormattedDuration(this.recipe.cookTime)}</Text>
                <Tooltip
                    apparitionDelay={200}
                    containerStyle={styles.tooltipTime}
                    screenProps={screenProps}
                    tooltipId={ETooltipIds.recipeCookTime}
                />
            </View>
        ) : null;

        let select: JSX.Element;
        if (isAndroid) {
            let items = [];
            for (let i = 1; i <= this.recipePeopleCount; i++) {
                items.push({ label: i.toString(), value: i });
            }
            select = (
                <View style={styles.peopleContainer}>
                    <LinearGradient
                        colors={PEOPLE_BUTTON_COLORS}
                        start={{x: 0.3, y: 0.3}} end={{x: 1, y: 1}}
                        style={styles.fullSpace}
                    />
                    <View style={styles.dropdownPeopleContainer}>
                        <View style={styles.dropdownPeopleLeftContainer}>
                            <FadeInImage
                                source={require('../static/icons/triple-people.png')}
                                containerCustomStyle={styles.infoIconPeople}
                                resizeMode={'contain'}
                            />
                        </View>
                        <View style={styles.dropdownPeopleRightContainerAndroid}>
                            <NativePicker
                                items={items}
                                onValueChange={(itemValue: number) => this.onPeopleCountChange(itemValue)}
                                selectedValue={this.state.servings}
                                style={styles.recipePeople}
                            />
                        </View>
                    </View>
                </View>
            );
        } else {
            select = (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.onPressPeopleSelect}
                    style={styles.peopleContainer}
                >
                    <LinearGradient
                        colors={PEOPLE_BUTTON_COLORS}
                        start={{x: 0.3, y: 0.3}} end={{x: 1, y: 1}}
                        style={styles.fullSpace}
                    />
                    <View style={styles.dropdownPeopleContainer}>
                        <View style={styles.dropdownPeopleLeftContainer}>
                            <FadeInImage
                                source={require('../static/icons/triple-people.png')}
                                containerCustomStyle={styles.infoIconPeople}
                                resizeMode={'contain'}
                            />
                            <Text style={styles.recipePeople}>
                                { `${this.state.servings} ${I18n.t('article.servings')}` }
                            </Text>
                        </View>
                        <View style={styles.dropdownPeopleRightContainer}>
                            <FadeInImage
                                source={require('../static/icons/down-arrow.png')}
                                containerCustomStyle={styles.dropdownIcon}
                                resizeMode={'contain'}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.infosWrapper}>
                <View style={styles.infosContainer}>
                    { prepTime }
                    { cookTime }
                </View>
                <View style={styles.selectWrapper}>
                    { select }
                    <Tooltip
                        apparitionDelay={400}
                        color={colors.violetDark}
                        containerStyle={styles.tooltipServings}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.recipeServings}
                    />
                </View>
            </View>
        );
    }

    private get ingredients (): JSX.Element {
        const { servings } = this.state;
        if (!this.recipe.ingredients) {
            return;
        }
        const ingredientList = this.recipe.ingredients.map((ingredient: IRecipeIngredient, index: number) => {
            const quantity = ingredient.quantity ? servings * ingredient.quantity : null;
            const weight = ingredient.weight ? getFormatedRecipeWeight(servings * ingredient.weight) : null;
            const volume = ingredient.volume ? getFormatedRecipeVolume(servings * ingredient.volume) : null;
            const prefix = quantity ? quantity : (weight ? weight : volume);
            return (
                <View key={index} style={styles.ingredientItemContainer}>
                    <FadeInImage
                        source={BULLET}
                        containerCustomStyle={styles.bullet}
                    />
                    <Text style={styles.ingredient}>{prefix ? `${prefix} ` : ''}{ingredient.name}</Text>
                </View>
            );
        });

        return (
            <View style={styles.ingredientsContainer}>
                <Text style={getHTMLStyles.h2}>{ I18n.t('article.ingredients') }</Text>
                <View style={styles.ingredientListContainer}>
                    {ingredientList}
                </View>
            </View>
        );
    }

    private get content (): JSX.Element {
        const {
            animTopContentOpacity,
            animTopContentTransform,
            animContentOpacity,
            animContentTransform
        } = this.state;
        const content: string = this.data.content;

        if (!content) {
            return null;
        }

        const animatedTopStyle = {
            opacity: animTopContentOpacity,
            transform: [{
                translateY: animTopContentTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                })
            }]
        };
        const topContent = this.isRecipe ? (
            <Animated.View style={[styles.topContentContainerRecipe, animatedTopStyle]}>
                {this.nutrients}
                {this.infos}
            </Animated.View>
        ) : (
            <Animated.View style={[styles.topContentContainerArticle, animatedTopStyle]}>
                {/* {this.summary} */}
                {this.author}
            </Animated.View>
        );

        const animatedContentStyle = {
            opacity: animContentOpacity,
            transform: [{
                translateY: animContentTransform.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                })
            }]
        };

        return (
            <View style={styles.contentContainer}>
                { topContent }
                <Animated.View style={animatedContentStyle}>
                    { this.isRecipe && this.ingredients }
                    <HTML
                        containerStyle={styles.htmlContentContainer}
                        allowFontScaling={false}
                        baseFontStyle={BASE_FONT_STYLE}
                        html={content}
                        ignoredStyles={['color']}
                        imagesInitialDimensions={{
                            width: IMAGE_INITIAL_SIZE.width,
                            height: IMAGE_INITIAL_SIZE.height
                        }}
                        imagesMaxWidth={IMAGE_MAX_WIDTH}
                        onLinkPress={(_: any, href: string) => Linking.openURL(href) }
                        tagsStyles={getHTMLStyles}
                        renderers={HTMLRenderersDefault()}
                        alterNode={this.alterNode}
                    />
                </Animated.View>
            </View>
        );
    }

    public render (): JSX.Element {
        const { showFullImage } = this.state;
        return this.data ? (
            <View style={[styles.fullSpace, styles.container]}>
                <SharedParallaxView
                    contentContainerStyle={styles.scrollViewContentContainer}
                    onScrollThresholdReached={this.onScrollThresholdReached}
                    ref={this.parallaxHeaderRef}
                    renderBackground={this.parallaxBackground}
                    renderScrollViewForegroundChild={this.foregroundChildren}
                    renderForeground={this.parallaxForeground}
                    scrollEnabled={!showFullImage}
                    scrollThreshold={HEADER_SCROLL_THRESHOLD}
                >
                    {this.content}
                </SharedParallaxView>
            </View>
        ) : null;
    }
}

export default Article;
