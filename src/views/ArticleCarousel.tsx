import React, { Component, RefObject } from 'react';
import { View, FlatList, Animated, Easing } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { get, uniqBy } from 'lodash';
import { AxiosResponse } from 'axios';
import { IReduxState } from '../store/reducers';
import { listsUpdate, setActiveArticle, ILists } from '../store/modules/userInterface';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { isAndroid } from '../utils/os';
import { IArticle } from '../types/article';
import { IRecipe } from '../types/recipe';
import { IScreenProps } from '../index';
import { logEvent } from '../utils/analytics';
import animDelays from '../utils/animDelays';

import Article from './Article';
import ArticlePlaceholder from '../components/ArticlePlaceholder';
import Header from '../components/Header';

import { ARTICLES_PER_BATCH } from './Blog';
import { RecipeTypes, RECIPES_PER_BATCH } from './Recipes';

import { viewportWidth } from '../styles/base/metrics.style';
import styles, { ITEM_WIDTH } from '../styles/views/ArticleCarousel.style';

interface IProps {
    hideTransition: () => void;
    lists: ILists;
    listsUpdate: (lists: ILists) => void;
    navigation: NavigationScreenProp<{}>;
    screenProps: IScreenProps;
    setActiveArticle: (index: number) => void;
}

interface IState {
    items: IArticle[] | IRecipe[];
    endReached: boolean;
    isRefreshing: boolean;
    initTransitionDone: boolean;
    index: number;
    placeholderAnimOpacity: Animated.Value;
}

const mapStateToProps = (state: IReduxState) => {
    return {
        lists: state.userInterface.lists
    };
};

class ArticleCarousel extends Component<IProps, IState> {

    private data: {
        items: IArticle[];
        index: number;
        type: 'article' | 'recipe';
        recipeType?: RecipeTypes;
    };
    private flatListRef: RefObject<FlatList<any>> = React.createRef<FlatList<any>>();
    private mounted: boolean;
    private mountTimer: any;
    private safetyTimer: any;
    private initDone: boolean = false;

    constructor (props: IProps) {
        super(props);
        this.data = props.navigation.getParam('data', {});
        this.state = {
            items: this.data.items,
            endReached: false,
            isRefreshing: false,
            initTransitionDone: false,
            index: this.data.index,
            placeholderAnimOpacity: new Animated.Value(1)
        };
    }

    public componentDidMount (): void {
        this.mounted = true;

        // Unfortunately the `didFocus` event is not reliable on first mount
        // See: https://github.com/react-navigation/react-navigation/issues/4867
        this.mountTimer = setTimeout(() => {
            this.initAndShow();
            this.safetyTimer = setTimeout(() => {
                Animated.timing(this.state.placeholderAnimOpacity, {
                    toValue: 0,
                    duration: animDelays.views.article.transitioner.opacity,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }).start(() => {
                    this.setState({ initTransitionDone: true });
                });
            }, animDelays.views.article.transitioner.safety);
        }, 400); // Approximate transition's duration
    }

    public componentWillUnmount (): void {
        clearTimeout(this.mountTimer);
        clearTimeout(this.safetyTimer);
    }

    private onMomentumScrollEnd = (event: any): void => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / ITEM_WIDTH);
        if (index !== this.state.index) {
            this.setActiveArticle({ index });
            this.setState({ index });
        }
    }

    private initAndShow (): void {
        if (this.initDone) {
            return;
        }
        this.initDone = true;
        this.scrollToArticle();
        clearTimeout(this.safetyTimer);
    }

    private scrollToArticle (): void {
        const { index } = this.data;
        get(this.flatListRef, 'current').scrollToIndex({ animated: false, index });
        this.logEvent(index);
    }

    private setActiveArticle ({ index }: {index: number}): void {
        this.props.setActiveArticle(index);
        this.logEvent(index);
    }

    private getKeyExtractor = (item: IArticle, index: number) => {
        return `${this.data.type}-article-${item.id}-${index}`;
    }

    private getItemLayout = (data: any, index: number) => {
        return {
            index,
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index
        };
    }

    private renderItem = ({ index, item }: { index: number, item: IArticle }): JSX.Element => {
        const { navigation, screenProps } = this.props;
        return (
            <View style={styles.articleContainer}>
                <Article
                    data={item}
                    navigation={navigation}
                    screenProps={screenProps}
                    type={this.data.type}
                />
            </View>
        );
    }

    private async fetchData (): Promise<any> {
        const { lists } = this.props;
        try {
            const offset = this.state.items.length;
            if (this.data.type === 'recipe') {
                const recipeType = this.data.recipeType;
                if (recipeType) {
                    let endReached = false;
                    const getItems: AxiosResponse = await api.get(
                        ENDPOINTS.recipes + `/slug/${recipeType}?limit=${RECIPES_PER_BATCH}&offset=${offset}`
                    );
                    const items = uniqBy([...this.state.items, ...getItems.data], 'id');
                    endReached = !!getItems.headers['x-offset-reached-end'];
                    this.setState({
                        items: items as IRecipe[],
                        endReached,
                        isRefreshing: false
                    });
                    this.props.listsUpdate({
                        ...lists,
                        [recipeType]: { items: items as IRecipe[], listEndReached: endReached }
                    });
                }
            } else if (this.data.type === 'article') {
                let endReached = false;
                const getItems: AxiosResponse = await api.get(
                    ENDPOINTS.articles + `?limit=${ARTICLES_PER_BATCH}&offset=${offset}&order[createdAt]=desc`
                );
                const items = uniqBy([...this.state.items, ...getItems.data], 'id');
                endReached = !!getItems.headers['x-offset-reached-end'];
                this.setState({
                    items: items as IArticle[],
                    endReached,
                    isRefreshing: false
                });
                this.props.listsUpdate({
                    ...lists,
                    articles: { items: items as IArticle[], listEndReached: endReached }
                });
            }
        } catch (error) {
            console.log('fetch error', error);
        }
    }

    private logEvent = (articleIndex: number): void => {
        const { items } = this.state;
        const isRecipe = this.data.type === 'recipe';
        const isVideo = !!items[articleIndex]?.video;
        const eventName = isRecipe ? 'recipe_display' : 'article_display';
        const eventParams = isRecipe ?
            {
                recipeId: items[articleIndex]?.id,
                recipeTitle: items[articleIndex]?.title
            } : {
                articleId: items[articleIndex]?.id,
                articleTitle: items[articleIndex]?.title,
                articleType: isVideo ? 'video' : 'text'
            };

        logEvent(eventName, eventParams);
    }

    private onEndReached = (): void => {
        if (this.mounted && !this.state.endReached && !this.state.isRefreshing) {
            this.setState({ isRefreshing: true });
            this.fetchData();
        }
    }

    private get placeholder (): JSX.Element {
        const { initTransitionDone } = this.state;

        if (initTransitionDone) {
            return null;
        }

        const placeholderStyle = [{
            ...styles.fullSpace,
            opacity: this.state.placeholderAnimOpacity
        }];

        return (
            <Animated.View style={placeholderStyle}>
                <ArticlePlaceholder
                    data={this.data.items[this.state.index]}
                    type={this.data.type}
                />
            </Animated.View>
        );
    }

    public render (): JSX.Element {
        // Optimize Flatlist
        // https://github.com/filipemerker/flatlist-performance-tips/blob/master/README.md
        // https://facebook.github.io/react-native/docs/optimizing-flatlist-configuration
        const carouselSpecificProps = isAndroid ? {
            initialNumToRender: 1,
            maxToRenderPerBatch: 1,
            updateCellsBatchingPeriod: 500,
            windowSize: 3
        } : {
            initialNumToRender: 3,
            maxToRenderPerBatch: 5,
            updateCellsBatchingPeriod: 1500,
            windowSize: 11
        };

        return this.state.items ? (
            <View style={styles.viewContainer}>
                <FlatList
                    data={this.state.items}
                    decelerationRate={'fast'}
                    directionalLockEnabled={true}
                    disableIntervalMomentum={true}
                    getItemLayout={this.getItemLayout}
                    horizontal={true}
                    keyExtractor={this.getKeyExtractor}
                    snapToAlignment={'center'}
                    snapToInterval={viewportWidth}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold={0.1}
                    onMomentumScrollEnd={this.onMomentumScrollEnd}
                    onScrollToIndexFailed={() => null}
                    ref={this.flatListRef}
                    renderItem={this.renderItem}
                    showsHorizontalScrollIndicator={false}
                    style={styles.articleContainer}
                    {...carouselSpecificProps}
                  >
                </FlatList>
                { this.placeholder }
                <Header
                    mode={'closeWhite'}
                    noGradient={true}
                />
            </View>
        ) : null;
    }
}

export default connect(mapStateToProps, { listsUpdate, setActiveArticle })(ArticleCarousel);

