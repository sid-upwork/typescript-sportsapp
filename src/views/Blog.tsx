import React, { Component, Fragment } from 'react';
import { View, Animated, Easing } from 'react-native';
import { ENDPOINTS } from '../utils/endpoints';
import { IArticle } from '../types/article';
import { AxiosResponse } from 'axios';
import { debounce, get, drop } from 'lodash';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';
import { ILists, listsClear } from '../store/modules/userInterface';
import { ETooltipIds } from '../store/modules/tutorials';
import { IScreenProps } from '../index';
import { isAndroid, isIOS13min } from '../utils/os';
import delays from '../utils/animDelays';
import api from '../utils/api';
import I18n from '../utils/i18n';
import { checkSubscriptionStatus } from '../utils/payment';

import ArticleFocusedThumbnail from '../components/Blog/ArticleFocusedThumbnail';
import ArticleThumbnail from '../components/Blog/ArticleThumbnail';
import BackgroundBottomImage from '../static/Blog/background-bottom.svg';
import BackgroundTopImage from '../static/Blog/background-top.svg';
import BlogCarousel from '../components/Blog/BlogCarousel';
import DiffuseShadow from '../components/DiffuseShadow';
// import EllipsisSeparator from '../components/EllipsisSeparator';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import HeaderSpacer from '../components/HeaderSpacer';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import SharedParallaxView from '../components/SharedParallaxView';
import SharedVerticalTitle from '../components/SharedVerticalTitle';
import Sidebar from '../components/Sidebar';
import Tooltip from '../components/Tooltip';

import colors from '../styles/base/colors.style';
import focusedItemStyles from '../styles/components/Blog/ArticleFocusedThumbnail.style';
import { ARTICLE_THUMBNAIL_HEIGHT } from '../styles/components/Blog/ArticleThumbnail.style';
import { viewportHeight, viewportWidth, headerHeight } from '../styles/base/metrics.style';
import { TITLE_CONTAINER_WIDTH } from '../styles/components/SharedVerticalTitle.style';
import styles, {
    BACKGROUND_BOTTOM_WIDTH,
    BACKGROUND_BOTTOM_HEIGHT,
    BACKGROUND_BOTTOM_TITLE_TOP_POSITION,
    BACKGROUND_TOP_WIDTH,
    BACKGROUND_TOP_HEIGHT,
    CAROUSEL_HEIGHT,
    GRADIENT_COLORS_ORANGE,
    GRADIENT_COLORS_ORANGE_LIGHT
} from '../styles/views/Blog.style';

interface IProps {
    activeArticle: number;
    lists: ILists;
    listsClear: () => void;
    navigation: any;
    screenProps: IScreenProps;
}

interface IState {
    animPlaceholderItemOpacity: Animated.Value;
    animPlaceholderOpacity: Animated.Value;
    articleOffset: number;
    articles: IArticle[];
    backgroundTitleTopAnimationOpacity: Animated.Value;
    backgroundTitleTopAnimationTransform: Animated.Value;
    backgroundTitleBottomAnimationOpacity: Animated.Value;
    backgroundTitleBottomAnimationTransform: Animated.Value;
    carouselAnimationOpacity: Animated.Value;
    carouselAnimationTransform: Animated.Value;
    ellipsisAnimationOpacity: Animated.Value;
    ellipsisAnimationTransfrom: Animated.Value;
    fetchError: boolean;
    listEndReached: boolean;
    loaderAnimationOpacity: Animated.Value;
    refreshing: boolean;
    renderCarouselPlaceholder: boolean;
    topBackgroundAnimationOpacity: Animated.Value;
    topBackgroundAnimationTransform: Animated.Value;
}

export const ARTICLES_IN_CAROUSEL: number = 5;
export const ARTICLES_PER_BATCH: number = 15;

// We want the title to follow the scroll until the bottom one reaches the top
const BACKGROUND_TITLES_SCROLL_RANGE = BACKGROUND_BOTTOM_TITLE_TOP_POSITION - headerHeight - 10;

class Blog extends Component<IProps, IState> {

    private BlogCarouselRef: React.RefObject<BlogCarousel>;
    private focused: boolean = true;
    private SharedParallaxViewRef: React.RefObject<SharedParallaxView>;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animPlaceholderItemOpacity: new Animated.Value(0),
            animPlaceholderOpacity: new Animated.Value(1),
            articleOffset: 0,
            articles: [],
            backgroundTitleBottomAnimationOpacity: new Animated.Value(0),
            backgroundTitleBottomAnimationTransform: new Animated.Value(0),
            backgroundTitleTopAnimationOpacity: new Animated.Value(0),
            backgroundTitleTopAnimationTransform: new Animated.Value(0),
            carouselAnimationOpacity: new Animated.Value(0),
            carouselAnimationTransform: new Animated.Value(0),
            ellipsisAnimationOpacity: new Animated.Value(0),
            ellipsisAnimationTransfrom: new Animated.Value(0),
            fetchError: false,
            listEndReached: false,
            loaderAnimationOpacity: new Animated.Value(0),
            refreshing: false,
            renderCarouselPlaceholder: true,
            topBackgroundAnimationOpacity: new Animated.Value(0),
            topBackgroundAnimationTransform: new Animated.Value(0)
        };
        this.BlogCarouselRef = React.createRef();
        this.SharedParallaxViewRef = React.createRef();
    }

    public componentDidMount (): void {
        checkSubscriptionStatus();
        this.animateBackgroundTop();
        this.animateEllipsisis();
        this.animateLoader();
        this.animateCarousel();
        this.animateCarouselPlaceholderItems();
        this.animateBackgroundTitles(() => {
            this.fetchArticles();
        });
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { lists, activeArticle } = this.props;

        if (prevProps.lists && lists !== prevProps.lists) {
            // When additional articles are fetched from the swiper,
            // SharedParallaxView will receive those new articles via Redux with this prop.
            this.setState({
                articles: lists.articles.items,
                articleOffset: lists.articles.items.length,
                listEndReached: lists.articles.listEndReached
            });
        }

        if (activeArticle && activeArticle !== -1 && activeArticle !== prevProps.activeArticle) {
            if (activeArticle > ARTICLES_IN_CAROUSEL) {
                // We need to focus an article in the list
                // We scoll the list to the right article
                get(this.SharedParallaxViewRef, 'current.flatListRef.current').scrollToIndex({
                    index: activeArticle - ARTICLES_IN_CAROUSEL,
                    animated: false
                });
            } else {
                // We need to focus an article in the carousel
                // We scroll this list all the way to the top and we scroll the carousel to the right article
                get(this.SharedParallaxViewRef, 'current.flatListRef.current').scrollToOffset({
                    offset: 0,
                    animated: false
                });
                get(this.BlogCarouselRef, 'current.carouselRef.current').snapToItem(activeArticle);
            }
        }
    }

    public componentWillUnmount (): void {
        this.props.listsClear();
    }

    private async fetchArticles (): Promise<void> {
        if (this.state.refreshing || !this.focused) {
            return;
        }

        this.setState({ refreshing: true });

        try {
            const articlesResponse: AxiosResponse = await api.get(
                ENDPOINTS.articles + `?limit=${ARTICLES_PER_BATCH}&offset=${this.state.articleOffset}&order[updatedAt]=desc`
            );

            if (articlesResponse.headers['x-offset-reached-end']) {
                this.setState({ listEndReached: true });
            }

            this.setState({
                articleOffset: this.state.articleOffset + ARTICLES_PER_BATCH,
                articles: [... this.state.articles, ...articlesResponse.data],
                refreshing: false
            }, () => {
                if (this.state.renderCarouselPlaceholder) {
                    this.hideCarouselPlaceholder();
                }
            });
        } catch (error) {
            console.log('fetch error', error);
            this.setState({ refreshing: false, fetchError: true });
        }
    }

    private retryFetch = (): void => {
        this.setState({ fetchError: false }, () => this.fetchArticles);
    }

    private openArticles = (index: number): void => {
        const { articles } = this.state;
        // Open only one article on Android; it doesn't deserve more than that
        // This will also give a perfomance boost to older iPhones
        if (isAndroid || !isIOS13min) {
            this.props.navigation.navigate('Article', {
                data: articles && articles[index], type: 'article', closeButton: true
            });
        } else {
            this.props.navigation.navigate('ArticleCarousel', {
                data: { items: articles, index, type: 'article' }
            });
        }
    }

    private renderArticle = ({ index, item }: { index: number, item: IArticle }): JSX.Element => {
        const onPress = () => {
            this.focused = false;
            this.openArticles(index + ARTICLES_IN_CAROUSEL);
        };

        return (
            <ArticleThumbnail
                article={item}
                index={index}
                onPress={debounce(onPress, 200, { 'leading': true, 'trailing': false })}
                style={{ paddingLeft: TITLE_CONTAINER_WIDTH }}
            />
        );
    }

    private animateBackgroundTop (): void {
        const { topBackgroundAnimationOpacity, topBackgroundAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.blog.backgroundTopApparition),
            Animated.parallel([
                Animated.timing(topBackgroundAnimationOpacity, {
                    toValue: 1,
                    duration: 250,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(topBackgroundAnimationTransform, {
                    toValue: 1,
                    speed: 15,
                    bounciness: 8,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateEllipsisis (): void {
        const { ellipsisAnimationOpacity, ellipsisAnimationTransfrom } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.blog.ellipsisApparition),
            Animated.parallel([
                Animated.timing(ellipsisAnimationOpacity, {
                    toValue: 1,
                    duration: 250,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(ellipsisAnimationTransfrom, {
                    toValue: 1,
                    speed: 5,
                    bounciness: 12,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateBackgroundTitles (callback: () => void): void {
        const {
            backgroundTitleTopAnimationOpacity, backgroundTitleTopAnimationTransform,
            backgroundTitleBottomAnimationOpacity, backgroundTitleBottomAnimationTransform
        } = this.state;

        Animated.parallel([
            Animated.sequence([
                Animated.delay(delays.views.blog.backgroundTopTitleApparition),
                Animated.parallel([
                    Animated.timing(backgroundTitleTopAnimationOpacity, {
                        toValue: 1,
                        duration: 100,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(backgroundTitleTopAnimationTransform, {
                        toValue: 1,
                        speed: 15,
                        bounciness: 5,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ]),
            Animated.sequence([
                Animated.delay(delays.views.blog.backgroundBottomTitleApparition),
                Animated.parallel([
                    Animated.timing(backgroundTitleBottomAnimationOpacity, {
                        toValue: 1,
                        duration: 100,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(backgroundTitleBottomAnimationTransform, {
                        toValue: 1,
                        speed: 15,
                        bounciness: 5,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ])
        ]).start(() => {
            callback && callback();
        });
    }

    private animateCarousel (): void {
        const { carouselAnimationOpacity, carouselAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.blog.carouselApparition),
            Animated.parallel([
                Animated.timing(carouselAnimationOpacity, {
                    toValue: 1,
                    duration: 250,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(carouselAnimationTransform, {
                    toValue: 1,
                    speed: 15,
                    bounciness: 10,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateCarouselPlaceholderItems (): void {
        const { animPlaceholderItemOpacity } = this.state;

        Animated.sequence([
            Animated.timing(animPlaceholderItemOpacity, {
                toValue: 1,
                duration: 500,
                easing: Easing.ease,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animPlaceholderItemOpacity, {
                toValue: 0,
                duration: 500,
                easing: Easing.ease,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            if (!this.state.renderCarouselPlaceholder || this.state.fetchError) {
                return;
            }
            this.animateCarouselPlaceholderItems();
        });
    }

    private hideCarouselPlaceholder (): void {
        const { animPlaceholderOpacity } = this.state;
        const delay = isAndroid ? 100 : 0; // Hide ignominous flicker on Android...

        Animated.sequence([
            // Animated.delay(delay),
            // For a reason yet to be determined, the animation isn't played if we use a delay...
            // We hack it with an animation to the base value
            Animated.timing(animPlaceholderOpacity, {
                toValue: 1,
                duration: delay,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            }),
            Animated.timing(animPlaceholderOpacity, {
                toValue: 0,
                duration: 250,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            this.setState({ renderCarouselPlaceholder: false });
        });
    }

    private animateLoader (): void {
        Animated.timing(this.state.loaderAnimationOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private onEndReached = (): void => {
        if (!this.state.listEndReached) {
            this.fetchArticles();
        }
    }

    private onScroll = () => {
        if (this.focused === false) {
            this.focused = true;
        }
    }

    private getTopTitleApparitionStyle (): {} {
        const { backgroundTitleTopAnimationOpacity, backgroundTitleTopAnimationTransform } = this.state;
        return {
            opacity: backgroundTitleTopAnimationOpacity,
            transform: [
                {
                    translateX: backgroundTitleTopAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-TITLE_CONTAINER_WIDTH, 0],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
    }

    private getBottomTitleApparitionStyle (): {} {
        const { backgroundTitleBottomAnimationOpacity, backgroundTitleBottomAnimationTransform } = this.state;
        return {
            opacity: backgroundTitleBottomAnimationOpacity,
            transform: [
                {
                    translateX: backgroundTitleBottomAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-TITLE_CONTAINER_WIDTH, 0],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
    }

    private getTitleScrollAnimatedStyle (animatedValue: Animated.Value): {} {
        return {
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, BACKGROUND_TITLES_SCROLL_RANGE],
                        outputRange: [0, -BACKGROUND_TITLES_SCROLL_RANGE],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
    }

    private getBackgroundTop (animatedValue: Animated.Value): JSX.Element {
        const { topBackgroundAnimationOpacity, topBackgroundAnimationTransform } = this.state;

        const firstAnimatedStyle = {
            opacity: topBackgroundAnimationOpacity,
            transform: [
                {
                    translateX: topBackgroundAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [viewportWidth, 0]
                    })
                }
            ]
        };
        const secondAnimatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.2, viewportHeight * 0.6],
                outputRange: [1, 1, 0],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [0, -viewportHeight * 0.4]
                    })
                }
            ]
        };

        return (
            <Animated.View style={[firstAnimatedStyle, styles.backgroundTop]}>
                <Animated.View style={secondAnimatedStyle}>
                    <BackgroundTopImage width={BACKGROUND_TOP_WIDTH} height={BACKGROUND_TOP_HEIGHT} />
                </Animated.View>
            </Animated.View>
        );
    }

    private getBackgroundBottom (animatedValue: Animated.Value): JSX.Element {
        const animatedStyle = {
            flex: 1,
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.4, viewportHeight * 0.8],
                outputRange: [0, 0, 1],
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

        return (
            <Animated.View style={[animatedStyle, styles.backgroundBottom]}>
                <BackgroundBottomImage width={BACKGROUND_BOTTOM_WIDTH} height={BACKGROUND_BOTTOM_HEIGHT} />
            </Animated.View>
        );
    }

    private getBackgroundTitles (animatedValue: Animated.Value): JSX.Element {
        const topApparitionAnimatedStyle = this.getTopTitleApparitionStyle();
        const bottomApparitionAnimatedStyle = this.getBottomTitleApparitionStyle();
        const scrollAnimatedStyle = this.getTitleScrollAnimatedStyle(animatedValue);
        const titleTop: string = I18n.t('blog.latestNews');
        const titleBottom: string = I18n.t('blog.all');

        return (
            <Animated.View style={[scrollAnimatedStyle, styles.backgroundTitles]}>
                <Animated.View style={topApparitionAnimatedStyle}>
                    <SharedVerticalTitle
                        height={CAROUSEL_HEIGHT}
                        width={TITLE_CONTAINER_WIDTH}
                        style={styles.backgroundTitleTop}
                        title={titleTop}
                    />
                </Animated.View>
                <Animated.View style={bottomApparitionAnimatedStyle}>
                    <SharedVerticalTitle
                        height={200}
                        width={TITLE_CONTAINER_WIDTH}
                        style={[
                            styles.backgroundTitleBottom,
                            { top: BACKGROUND_BOTTOM_TITLE_TOP_POSITION }
                        ]}
                        title={titleBottom}
                    />
                </Animated.View>
            </Animated.View>
        );
    }

    private getBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        // const { ellipsisAnimationOpacity, ellipsisAnimationTransfrom } = this.state;
        // const ellipsisContainerAnimatedStyle = {
        //     opacity: ellipsisAnimationOpacity,
        //     transform: [
        //         {
        //             rotateZ: ellipsisAnimationTransfrom.interpolate({
        //                 inputRange: [0, 1],
        //                 outputRange: [-0.3, 0]
        //             })
        //         }
        //     ]
        // };
        // const topEllipsisAnimatedStyle = [
        //     styles.topEllipsis,
        //     {
        //         transform: [{
        //             translateX: animatedValue.interpolate({
        //                 inputRange: [0, 300],
        //                 outputRange: [0, 300]
        //             })
        //         }]
        //     }
        // ];
        // const bottomEllipsisAnimatedStyle = [
        //     styles.bottomEllipsis,
        //     { marginTop: CAROUSEL_HEIGHT + 30 },
        //     {
        //         transform: [{
        //             translateX: animatedValue.interpolate({
        //                 inputRange: [0, 300],
        //                 outputRange: [0, -300]
        //             })
        //         }]
        //     }
        // ];
        // const ellipsis = (
        //     <Animated.View style={ellipsisContainerAnimatedStyle}>
        //         <Animated.View style={topEllipsisAnimatedStyle}>
        //             <EllipsisSeparator />
        //         </Animated.View>
        //         <Animated.View style={bottomEllipsisAnimatedStyle}>
        //             <EllipsisSeparator />
        //         </Animated.View>
        //     </Animated.View>
        // );

        return (
            <View style={styles.fullSpace}>
                <Sidebar scrollY={animatedValue} />
                {/* { ellipsis } */}
                { this.getBackgroundTop(animatedValue) }
                { this.getBackgroundBottom(animatedValue) }
                { this.getBackgroundTitles(animatedValue) }
            </View>
        );
    }

    private getTooltips = (animatedValue: Animated.Value): JSX.Element => {
        const { screenProps } = this.props;
        const topApparitionAnimatedStyle = this.getTopTitleApparitionStyle();
        const bottomApparitionAnimatedStyle = this.getBottomTitleApparitionStyle();
        const scrollAnimatedStyle = this.getTitleScrollAnimatedStyle(animatedValue);
        return (
            <Animated.View style={[styles.fullSpace, scrollAnimatedStyle]} pointerEvents={'box-none'}>
                <Animated.View style={[styles.tooltipTopContainer, topApparitionAnimatedStyle]}>
                    <Tooltip
                        gradientType={'blue'}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.blogLatestNews}
                    />
                </Animated.View>
                <Animated.View style={[styles.tooltipBottomContainer, bottomApparitionAnimatedStyle]}>
                    <Tooltip
                        gradientType={'blue'}
                        screenProps={screenProps}
                        tooltipId={ETooltipIds.blogArticles}
                    />
                </Animated.View>
            </Animated.View>
        );
    }

    private get carouselPlaceholder (): JSX.Element {
        const { animPlaceholderOpacity, renderCarouselPlaceholder } = this.state;
        const animatedStyle = {
            opacity: animPlaceholderOpacity
        };
        return renderCarouselPlaceholder ? (
            <Animated.View style={animatedStyle}>
                <BlogCarousel
                    data={new Array(ARTICLES_IN_CAROUSEL).fill({})}
                    height={CAROUSEL_HEIGHT}
                    inverted={isAndroid}
                    renderItem={() => this.carouselDummyItem}
                    scrollEnabled={false}
                    style={styles.carousel}
                />
            </Animated.View>
        ) : null;
    }

    private get carousel (): JSX.Element {
        // We display a placholder carousel while we wait for our focused articles
        const { carouselAnimationOpacity, carouselAnimationTransform } = this.state;
        const apparitionAnimatedStyle = {
            opacity: carouselAnimationOpacity,
            transform: [
                {
                    translateX: carouselAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [150, 0]
                    })
                }
            ]
        };

        let data = this.state.articles?.slice(0, ARTICLES_IN_CAROUSEL); // We only want the first articles in the carousel
        data = isAndroid ? data.reverse() : data; // Invert the data on Android because the stack layout is inverted (zIndex issues FTW)

        return (
            <Animated.View style={[apparitionAnimatedStyle, styles.carouselContainer, { height: CAROUSEL_HEIGHT }]}>
                <BlogCarousel
                    data={data}
                    height={CAROUSEL_HEIGHT}
                    inverted={isAndroid}
                    ref={this.BlogCarouselRef}
                    renderItem={this.carouselRenderItem}
                    style={styles.carousel}
                />
                { this.carouselPlaceholder }
            </Animated.View>
        );
    }

    private carouselRenderItem  = ({ item, index }: { item: IArticle, index: number }): JSX.Element => {
        const onPress = () => {
            const dataIndex = isAndroid ? ARTICLES_IN_CAROUSEL - index - 1 : index; // Carousel's data set is inverted on Android
            this.focused = false;
            this.openArticles(dataIndex);
        };

        return (
            <ArticleFocusedThumbnail
                article={item}
                index={index}
                key={`blog-articleFocusedThumnail-${index}`}
                onPress={debounce(onPress, 200, { 'leading': true, 'trailing': false })}
            />
        );
    }

    private getHeader = (): JSX.Element => {
        return (
            <View>
                <HeaderSpacer />
                { this.carousel }
            </View>
        );
    }

    private getItemLayout = (_: any, index: number) => {
        return {
            length: ARTICLE_THUMBNAIL_HEIGHT,
            offset: BACKGROUND_BOTTOM_TITLE_TOP_POSITION - headerHeight + ARTICLE_THUMBNAIL_HEIGHT * index,
            index
        };
    }

    private get carouselDummyItem (): JSX.Element {
        const { animPlaceholderItemOpacity } = this.state;
        const placeholderGradientAnimationStyle = {
            opacity: animPlaceholderItemOpacity
        };
        return (
            <View style={focusedItemStyles.container}>
                <View style={focusedItemStyles.border} />
                <View style={focusedItemStyles.containerInner}>
                    <DiffuseShadow
                        borderRadius={20}
                        color={colors.violetDark}
                        horizontalOffset={25}
                        shadowOpacity={0.4}
                        verticalOffset={14}
                    />
                    <View style={focusedItemStyles.containerOverflow}>
                        <LinearGradient
                            angle={150}
                            colors={GRADIENT_COLORS_ORANGE_LIGHT}
                            style={styles.carouselPlaceholderItemGradientLight}
                            useAngle={true}
                        />
                        <Animated.View style={[styles.fullSpace, placeholderGradientAnimationStyle]}>
                            <LinearGradient
                                angle={150}
                                colors={GRADIENT_COLORS_ORANGE}
                                style={styles.carouselPlaceholderItemGradient}
                                useAngle={true}
                            />
                        </Animated.View>
                    </View>
                </View>
            </View>
        );
    }

    private get footer (): JSX.Element {
        const animatedStyle = {
            opacity: this.state.loaderAnimationOpacity
        };

        if (!this.state.fetchError) {
            return (
                <Animated.View style={[animatedStyle, styles.loaderContainer]}>
                    { !this.state.listEndReached ? <Loader color={colors.violetDark} /> : null }
                </Animated.View>
            );
        } else {
            return (
                <View style={styles.errorContainer}>
                    <ErrorMessage
                        retry={this.retryFetch}
                        toastManagerRef={this.props.screenProps?.toastManagerRef}
                    />
                </View>
            );
        }
    }

    private getForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <Fragment>
                { this.getTooltips(animatedValue) }
                <Header animatedValue={animatedValue} mode={'menu'} />
            </Fragment>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <SharedParallaxView
                    data={drop(this.state.articles, ARTICLES_IN_CAROUSEL)} // First articles go in the carousel
                    flatlist={true}
                    getItemLayout={this.getItemLayout}
                    keyExtractor={(_: any, index: number) => `ArticleThumbnail-${index}`}
                    ListFooterComponent={this.footer}
                    ListHeaderComponent={this.getHeader}
                    onEndReached={debounce(this.onEndReached, 500, { 'leading': true, 'trailing': false })}
                    onEndReachedThreshold={0.1}
                    onScroll={this.onScroll}
                    onScrollToIndexFailed={() => null}
                    overScrollMode={'never'}
                    ref={this.SharedParallaxViewRef}
                    refreshing={this.state.refreshing}
                    renderBackground={this.getBackground}
                    renderForeground={this.getForeground}
                    renderItem={this.renderArticle}
                    showsVerticalScrollIndicator={false}
                    style={styles.sharedParallaxView}
                />
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => {
    return {
        lists: state.userInterface.lists,
        activeArticle: state.userInterface.activeArticle
    };
};

export default connect(mapStateToProps, { listsClear })(Blog);
