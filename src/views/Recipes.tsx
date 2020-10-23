import React, { Component } from 'react';
import { Animated, View, Easing } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { AxiosResponse } from 'axios';
import { debounce, get } from 'lodash';
import I18n from '../utils/i18n';
import { IScreenProps } from '../index';
import { ILists, listsClear } from '../store/modules/userInterface';
import { IReduxState } from '../store/reducers';
import { IRecipe } from '../types/recipe';
import delays from '../utils/animDelays';
import api from '../utils/api';
import { ENDPOINTS } from '../utils/endpoints';
import { logEvent } from '../utils/analytics';
import { isAndroid, isIOS13min } from '../utils/os';
import { checkSubscriptionStatus } from '../utils/payment';

import { TabView } from 'react-native-tab-view';
import CustomTabBar from '../components/CustomTabBar';
import ErrorMessage from '../components/ErrorMessage';
import EllipsisSeparator from '../components/EllipsisSeparator';
import Header from '../components/Header';
import Loader from '../components/Loader';
import RecipeItem from '../components/RecipeItem';
import SharedParallaxView from '../components/SharedParallaxView';
import Sidebar from '../components/Sidebar';

import colors from '../styles/base/colors.style';
import { getLineHeight } from '../styles/base/fonts.style';
import { viewportHeight, viewportWidth, headerHeight } from '../styles/base/metrics.style';
import { RECIPE_ITEM_HEIGHT } from '../styles/components/RecipeItem.style';
import styles, { SCROLL_CONTENT_TOP } from '../styles/views/Recipes.style';

import BackgroundVector from '../static/Recipes/background.svg';

interface IProps {
    activeArticle: number;
    lists: ILists;
    listsClear: () => void;
    navigation: any;
    screenProps: IScreenProps;
}

interface IState {
    breakfastRecipes: IRecipe[];
    lunchRecipes: IRecipe[];
    dinnerRecipes: IRecipe[];
    snackRecipes: IRecipe[];
    breakfastOffset: number;
    lunchOffset: number;
    dinnerOffset: number;
    snackOffset: number;
    breakfastListEndReached: boolean;
    lunchListEndReached: boolean;
    dinnerListEndReached: boolean;
    snackListEndReached: boolean;
    currentRecipeType: RecipeTypes;
    index: number;
    refreshing: boolean;
    breakfastFetchError: boolean;
    lunchFetchError: boolean;
    dinnerFetchError: boolean;
    snackFetchError: boolean;
    focus: boolean;
    routes: { key: RecipeTypes, title: string }[];
    headerAnimOpacity: Animated.Value;
    headerAnimTransform: Animated.Value;
    vectorAnimOpacity: Animated.Value;
    vectorAnimTransform: Animated.Value;
    imageAnimTransform: Animated.Value;
}

const mapStateToProps = (state: IReduxState) => {
    return {
        lists: state.userInterface.lists,
        activeArticle: state.userInterface.activeArticle
    };
};

// enum of keys used in code, no translation needed
export enum RecipeTypes {
    Breakfast = 'breakfast',
    Lunch = 'lunch',
    Dinner = 'dinner',
    Snack = 'snack'
}

export const RECIPES_PER_BATCH: number = 5;

const BREAKFAST_IMG = require('../static/Recipes/breakfast.png');
const LUNCH_IMG = require('../static/Recipes/lunch.png');
const DINNER_IMG = require('../static/Recipes/dinner.png');
const SNACK_IMG = require('../static/Recipes/snack.png');

class Recipes extends Component<IProps, IState> {

    private recipeTypeLabels: any = {
        Breakfast: I18n.t('recipes.breakfastLabel'),
        Lunch: I18n.t('recipes.lunchLabel'),
        Dinner: I18n.t('recipes.dinnerLabel'),
        Snack: I18n.t('recipes.snackLabel')
    };
    private recipeTypeTitles: any = {
        Breakfast: I18n.t('recipes.breakfastTitle'),
        Lunch: I18n.t('recipes.lunchTitle'),
        Dinner: I18n.t('recipes.dinnerTitle'),
        Snack: I18n.t('recipes.snackTitle')
    };

    private carouselRefs: React.RefObject<SharedParallaxView>[] = [];
    private routes: { key: RecipeTypes, title: string }[] = [
        { key: RecipeTypes.Breakfast, title: this.recipeTypeLabels.Breakfast },
        { key: RecipeTypes.Lunch, title: this.recipeTypeLabels.Lunch },
        { key: RecipeTypes.Dinner, title: this.recipeTypeLabels.Dinner },
        { key: RecipeTypes.Snack, title: this.recipeTypeLabels.Snack }
    ];

    constructor (props: IProps) {
        super(props);
        this.state = {
            breakfastRecipes: [],
            lunchRecipes: [],
            dinnerRecipes: [],
            snackRecipes: [],
            breakfastOffset: 0,
            lunchOffset: 0,
            dinnerOffset: 0,
            snackOffset: 0,
            breakfastListEndReached: false,
            lunchListEndReached: false,
            dinnerListEndReached: false,
            snackListEndReached: false,
            currentRecipeType: RecipeTypes.Breakfast,
            index: 0,
            refreshing: false,
            breakfastFetchError: false,
            lunchFetchError: false,
            dinnerFetchError: false,
            snackFetchError: false,
            focus: true,
            routes: this.routes,
            headerAnimOpacity: new Animated.Value(0),
            headerAnimTransform: new Animated.Value(0),
            vectorAnimOpacity: new Animated.Value(0),
            vectorAnimTransform: new Animated.Value(0),
            imageAnimTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        checkSubscriptionStatus();
        this.animate(() => {
            this.fetchRecipes(this.state.currentRecipeType);
        });
        logEvent('recipe_list_display', { recipeListType: RecipeTypes.Breakfast }); // Default tab
    }

    public componentDidUpdate (prevProps: IProps): void {
        const { lists, activeArticle } = this.props;

        if (prevProps.lists && lists !== prevProps.lists) {
            // When additional recipes are fetched from the swiper, the List view
            // will receive those new articles via Redux with this prop.
            switch (this.state.currentRecipeType) {
                case RecipeTypes.Breakfast:
                    this.setState({
                        breakfastRecipes: lists.breakfast.items,
                        breakfastOffset: lists.breakfast.items.length,
                        breakfastListEndReached: lists.breakfast.listEndReached
                    });
                    break;
                case RecipeTypes.Lunch:
                    this.setState({
                        lunchRecipes: lists.lunch.items,
                        lunchOffset: lists.lunch.items.length,
                        lunchListEndReached: lists.lunch.listEndReached
                    });
                    break;
                case RecipeTypes.Dinner:
                    this.setState({
                        dinnerRecipes: lists.dinner.items,
                        dinnerOffset: lists.dinner.items.length,
                        dinnerListEndReached: lists.dinner.listEndReached
                    });
                    break;
                case RecipeTypes.Snack:
                    this.setState({
                        snackRecipes: lists.snack.items,
                        snackOffset: lists.snack.items.length,
                        snackListEndReached: lists.snack.listEndReached
                    });
                    break;
                default:
                    break;
            }
        }
        if (activeArticle && activeArticle !== prevProps.activeArticle) {
            const index = activeArticle;
            const currentRecipeType = this.state.currentRecipeType;
            // Keep the list scrolled as the user swipes through the slides of the swiper
            index !== -1 && get(this.carouselRefs[currentRecipeType], 'flatListRef.current').scrollToIndex({
                index,
                animated: false
            });
        }
    }

    public componentWillUnmount (): void {
        this.props.listsClear();
    }

    private async fetchRecipes (type: RecipeTypes): Promise<void> {
        this.setState({ refreshing: true });
        try {
            let offset = 0;
            let getRecipes: AxiosResponse;
            let recipes = [];
            const recipesEndpoint = ENDPOINTS.recipes + '/slug';
            switch (type) {
                case RecipeTypes.Breakfast:
                    offset = this.state.breakfastOffset;
                    getRecipes = await api.get(
                        recipesEndpoint + `/${type}?limit=${RECIPES_PER_BATCH}&offset=${offset}`
                    );

                    const newBreakfastRecipes = getRecipes.data ?? [];
                    recipes = [... this.state.breakfastRecipes, ...newBreakfastRecipes];

                    this.setState({
                        breakfastFetchError: false,
                        breakfastOffset: this.state.breakfastOffset + RECIPES_PER_BATCH,
                        breakfastRecipes: recipes,
                        breakfastListEndReached: !!getRecipes.headers['x-offset-reached-end']
                    });
                    break;
                case RecipeTypes.Lunch:
                    offset = this.state.lunchOffset;
                    getRecipes = await api.get(
                        recipesEndpoint + `/${type}?limit=${RECIPES_PER_BATCH}&offset=${offset}`
                    );

                    const newLunchRecipes = getRecipes.data ?? [];
                    recipes = [... this.state.lunchRecipes, ...newLunchRecipes];

                    this.setState({
                        lunchFetchError: false,
                        lunchOffset: this.state.lunchOffset + RECIPES_PER_BATCH,
                        lunchRecipes: recipes,
                        lunchListEndReached: !!getRecipes.headers['x-offset-reached-end']
                    });
                    break;
                case RecipeTypes.Dinner:
                    offset = this.state.dinnerOffset;
                    getRecipes = await api.get(
                        recipesEndpoint + `/${type}?limit=${RECIPES_PER_BATCH}&offset=${offset}`
                    );

                    const newDinnerRecipes = getRecipes.data ?? [];
                    recipes = [... this.state.dinnerRecipes, ...newDinnerRecipes];

                    this.setState({
                        dinnerFetchError: false,
                        dinnerOffset: this.state.dinnerOffset + RECIPES_PER_BATCH,
                        dinnerRecipes: recipes,
                        dinnerListEndReached: !!getRecipes.headers['x-offset-reached-end']
                    });
                    break;
                case RecipeTypes.Snack:
                    offset = this.state.snackOffset;
                    getRecipes = await api.get(
                        recipesEndpoint + `/${type}?limit=${RECIPES_PER_BATCH}&offset=${offset}`
                    );

                    const newSnackRecipes = getRecipes.data ?? [];
                    recipes = [... this.state.snackRecipes, ...newSnackRecipes];
                    this.setState({
                        snackFetchError: false,
                        snackOffset: this.state.snackOffset + RECIPES_PER_BATCH,
                        snackRecipes: recipes,
                        snackListEndReached: !!getRecipes.headers['x-offset-reached-end']
                    });
                    break;
                default:
                    break;
            }
            this.setState({ refreshing: false });
        } catch (error) {
            console.log('fetch error', error);
            switch (type) {
                case RecipeTypes.Breakfast:
                    this.setState({ breakfastFetchError: true, refreshing: false });
                    break;
                case RecipeTypes.Lunch:
                    this.setState({ lunchFetchError: true, refreshing: false });
                    break;
                case RecipeTypes.Dinner:
                    this.setState({ dinnerFetchError: true, refreshing: false });
                    break;
                case RecipeTypes.Snack:
                    this.setState({ snackFetchError: true, refreshing: false });
                    break;
                default:
                    break;
            }
        }
    }

    private animate (callback: () => void): void {
        const { headerAnimOpacity, headerAnimTransform,
        vectorAnimOpacity, vectorAnimTransform,
        imageAnimTransform } = this.state;
        Animated.sequence([
            Animated.delay(delays.views.recipes.header),
            Animated.parallel([
                Animated.parallel([
                    Animated.timing(headerAnimOpacity, {
                        toValue: 1,
                        duration: 100,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(headerAnimTransform, {
                        toValue: 1,
                        speed: 15,
                        bounciness: 7,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ]),
                Animated.parallel([
                    Animated.timing(vectorAnimOpacity, {
                        toValue: 1,
                        duration: 250,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }),
                    Animated.spring(vectorAnimTransform, {
                        toValue: 1,
                        speed: 12,
                        bounciness: 6,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ]),
                Animated.parallel([
                    Animated.timing(imageAnimTransform, {
                        toValue: 1,
                        duration: 550,
                        isInteraction: false,
                        useNativeDriver: true
                    })
                ])
            ])
        ]).start(() => {
            callback && callback();
        });
    }

    private handleIndexChange = (index: number) => {
        this.setState({ index, currentRecipeType: this.state.routes[index].key });
        switch (index) {
            case 0:
                logEvent('recipe_list_display', { recipeListType: RecipeTypes.Breakfast });
                break;
            case 1:
                if (this.state.lunchRecipes.length === 0) {
                    this.fetchRecipes(RecipeTypes.Lunch);
                }
                logEvent('recipe_list_display', { recipeListType: RecipeTypes.Lunch });
                break;
            case 2:
                if (this.state.dinnerRecipes.length === 0) {
                    this.fetchRecipes(RecipeTypes.Dinner);
                }
                logEvent('recipe_list_display', { recipeListType: RecipeTypes.Dinner });
                break;
            case 3:
                if (this.state.snackRecipes.length === 0) {
                    this.fetchRecipes(RecipeTypes.Snack);
                }
                logEvent('recipe_list_display', { recipeListType: RecipeTypes.Snack });
                break;
            default:
                break;
        }
    }

    private openRecipe = (index: number, tabIndex: RecipeTypes): void => {
        let items: IRecipe[];
        switch (tabIndex) {
            case RecipeTypes.Breakfast:
                items = this.state.breakfastRecipes;
                break;
            case RecipeTypes.Lunch:
                items = this.state.lunchRecipes;
                break;
            case RecipeTypes.Dinner:
                items = this.state.dinnerRecipes;
                break;
            case RecipeTypes.Snack:
                items = this.state.snackRecipes;
                break;
            default:
                break;
        }

        // Open only one article on Android; it doesn't deserve more than that
        // This will also give a perfomance boost to older iPhones
        if (isAndroid || !isIOS13min) {
            this.props.navigation.navigate('Article', {
                data: items && items[index], type: 'recipe', closeButton: true
            });
        } else {
            this.props.navigation.navigate('ArticleCarousel', {
                data: { items, index, type: 'recipe', recipeType: tabIndex }
            });
        }
    }

    private getTabBar (props: any): any {
        return <CustomTabBar {...props} routes={this.routes} />;
    }

    private renderRecipe (
        { item, index, tabIndex }:
        { item: IRecipe, index: number, tabIndex: RecipeTypes; }
    ): JSX.Element {
        const onPress = () => {
            this.setState({ focus: false });
            this.openRecipe(index, tabIndex);
        };
        return (
            <RecipeItem
                index={index}
                onPress={onPress}
                recipe={item}
                screenProps={this.props.screenProps}
                tabIndex={tabIndex}
            />
        );
    }

    private onEndReached = (tabIndex: string): any => {
        if (this.state.refreshing && this.state.focus) {
            return;
        }
        switch (tabIndex) {
            case RecipeTypes.Breakfast:
                if (!this.state.breakfastListEndReached) {
                    this.fetchRecipes(RecipeTypes.Breakfast);
                }
                break;
            case RecipeTypes.Lunch:
                if (!this.state.lunchListEndReached) {
                    this.fetchRecipes(RecipeTypes.Lunch);
                }
                break;
            case RecipeTypes.Dinner:
                if (!this.state.dinnerListEndReached) {
                    this.fetchRecipes(RecipeTypes.Dinner);
                }
                break;
            case RecipeTypes.Snack:
                if (!this.state.snackListEndReached) {
                    this.fetchRecipes(RecipeTypes.Snack);
                }
                break;
            default: break;
        }
    }

    private onScroll = () => {
        if (!this.state.focus) {
            this.setState({ focus: true });
        }
    }

    private getItemLayout = (_: any, index: number) => {
        return {
            length: RECIPE_ITEM_HEIGHT,
            offset: RECIPE_ITEM_HEIGHT * index + SCROLL_CONTENT_TOP - headerHeight,
            index
        };
    }

    private renderScene = ({ route }: { route: { key: RecipeTypes; title: string; }}): JSX.Element => {
        const { breakfastRecipes, lunchRecipes, dinnerRecipes, snackRecipes } = this.state;
        let items = [];
        let title = '';
        let image = '';
        switch (route.key) {
            case RecipeTypes.Breakfast:
                title = this.recipeTypeTitles.Breakfast;
                image = BREAKFAST_IMG;
                items = breakfastRecipes;
                break;
            case RecipeTypes.Lunch:
                title = this.recipeTypeTitles.Lunch;
                image = LUNCH_IMG;
                items = lunchRecipes;
                break;
            case RecipeTypes.Dinner:
                title = this.recipeTypeTitles.Dinner;
                image = DINNER_IMG;
                items = dinnerRecipes;
                break;
            case RecipeTypes.Snack:
                title = this.recipeTypeTitles.Snack;
                image = SNACK_IMG;
                items = snackRecipes;
                break;
            default:
                items = [];
                break;
        }

        return (
            <SharedParallaxView
                contentContainerStyle={styles.scrollContentContainer}
                data={items}
                keyExtractor={(item: IRecipe, index: number) => index.toString() + item.id}
                flatlist={true}
                getItemLayout={this.getItemLayout}
                initialNumToRender={RECIPES_PER_BATCH}
                ListFooterComponent={() => this.infiniteLoader(route.key)}
                numColumns={1}
                onEndReached={debounce(() => this.onEndReached(route.key), 500, { 'leading': true, 'trailing': false })}
                onEndReachedThreshold={0.1}
                onScroll={this.onScroll}
                onScrollToIndexFailed={() => { return; }}
                overScrollMode={'never'}
                params={{ title, image }}
                ref={(c: any) => this.carouselRefs[route.key] = c}
                refreshing={this.state.refreshing}
                renderBackground={this.listBackground}
                renderItem={({ item, index }: { item: IRecipe; index: number; }) => this.renderRecipe({
                    item, index, tabIndex: route.key
                })}
                showsVerticalScrollIndicator={false}
            />
        );
    }

    private listBackground = (
        { animatedValue }: { animatedValue: Animated.Value; },
        params: { title: string; image: string; }
    ): JSX.Element => {
        return (
            <View style={styles.fullSpace}>
                <Sidebar scrollY={animatedValue}/>
                {/* { this.kcal(animatedValue) } */}
                <View style={styles.topContent}>
                    { this.vectorBackground(animatedValue) }
                    { this.title(animatedValue, params) }
                </View>
            </View>
        );
    }

    private vectorBackground (animatedValue: Animated.Value): JSX.Element {
        const { vectorAnimOpacity, vectorAnimTransform } = this.state;
        const firstAnimatedStyle = {
            opacity: vectorAnimOpacity,
            transform: [
                {
                    translateX: vectorAnimTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [viewportWidth / 2, 0]
                    })
                }
            ]
        };
        const secondAnimatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.4, viewportHeight * 0.8],
                outputRange: [1, 1, 0],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [0, -viewportHeight * 0.25]
                    })
                }
            ]
        };
        return (
            <Animated.View style={firstAnimatedStyle}>
                <Animated.View style={secondAnimatedStyle}>
                    <BackgroundVector
                        style={styles.vector}
                        height={styles.vector.height}
                        width={styles.vector.width}
                    />
                </Animated.View>
            </Animated.View>
        );
    }

    private imageBackground (animatedValue: Animated.Value, image: string): JSX.Element {
        const { imageAnimTransform } = this.state;
        const apparitionAnimatedStyle = {
            transform: [
                {
                    translateX: imageAnimTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [viewportWidth, 0],
                        extrapolate: 'clamp'
                    })
                },
                {
                    rotate: imageAnimTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '-360deg'],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const scrollAnimatedStyle = {
            transform: [
                {
                    translateX: animatedValue.interpolate({
                        inputRange: [-viewportHeight, 0, viewportWidth],
                        outputRange: [-(viewportHeight * 0.65), 0, viewportWidth],
                        extrapolate: 'clamp'
                    })
                },
                {
                    rotate: animatedValue.interpolate({
                        inputRange: [-viewportWidth, 0, viewportWidth],
                        outputRange: ['-180deg', '0deg', '360deg'],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        return (
            <View style={styles.imageContainer}>
                <Animated.View style={apparitionAnimatedStyle}>
                    <Animated.Image
                        source={image}
                        style={[styles.image, scrollAnimatedStyle]}
                    />
                </Animated.View>
            </View>
        );
    }

    private title (
        animatedValue: Animated.Value,
        params: { title: string; image: string; }
    ): JSX.Element {
        const { headerAnimOpacity, headerAnimTransform } = this.state;
        const firstAnimatedStyle = {
            opacity: headerAnimOpacity,
            transform: [
                {
                    translateY: headerAnimTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                    })
                }
            ]
        };
        const animatedTitleStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.5],
                outputRange: [1, 0]
            }),
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, viewportHeight * 0.5],
                        outputRange: [0, -(viewportHeight * 0.38)]
                    })
                }
            ]
        };
        const animatedTopSeparatorStyle = {
            transform: [{
                translateX: animatedValue.interpolate({
                    inputRange: [0, 100, 200, 300],
                    outputRange: [0, 50, 100, 300]
                })
            }]
        };
        const animatedBottomSeparatorStyle = {
            transform: [{
                translateX: animatedValue.interpolate({
                    inputRange: [0, 100, 200, 300],
                    outputRange: [0, -50, -100, -300]
                })
            }]
        };
        const titleStyle = [
            styles.title,
            { lineHeight: getLineHeight(styles.title.fontSize, 0.95, 1.2) },
            animatedTitleStyle
        ];

        return (
            <Animated.View style={[styles.titleContainer, firstAnimatedStyle]}>
                {/* <Animated.View style={animatedTopSeparatorStyle}>
                    <EllipsisSeparator
                        containerTextStyle={styles.titleTopSeparator}
                        textStyle={styles.titleTopSeparatorText}
                    />
                </Animated.View> */}
                { this.imageBackground(animatedValue, params.image) }
                <Animated.Text style={titleStyle}>{params.title}</Animated.Text>
                {/* <Animated.View style={animatedBottomSeparatorStyle}>
                    <EllipsisSeparator
                        containerTextStyle={styles.titleBottomSeparator}
                    />
                </Animated.View> */}
            </Animated.View>
        );
    }

    private retryFetchRecipes = (recipeType: RecipeTypes) => {
        switch (recipeType) {
            case RecipeTypes.Breakfast:
                this.setState({ breakfastFetchError: false });
                break;
            case RecipeTypes.Lunch:
                this.setState({ lunchFetchError: false });
                break;
            case RecipeTypes.Dinner:
                this.setState({ dinnerFetchError: false });
                break;
            case RecipeTypes.Snack:
                this.setState({ snackFetchError: false });
                break;
            default: break;
        }
        this.fetchRecipes(recipeType);
    }

    private infiniteLoader = (tabIndex: string): JSX.Element => {
        const {
            breakfastListEndReached, lunchListEndReached,
            dinnerListEndReached, snackListEndReached,
            breakfastFetchError, lunchFetchError,
            dinnerFetchError, snackFetchError
        } = this.state;
        let endReached = false;
        let fetchError = false;
        switch (tabIndex) {
            case RecipeTypes.Breakfast:
                endReached = breakfastListEndReached;
                fetchError = breakfastFetchError;
                break;
            case RecipeTypes.Lunch:
                endReached = lunchListEndReached;
                fetchError = lunchFetchError;
                break;
            case RecipeTypes.Dinner:
                endReached = dinnerListEndReached;
                fetchError = dinnerFetchError;
                break;
            case RecipeTypes.Snack:
                endReached = snackListEndReached;
                fetchError = snackFetchError;
                break;
            default: break;
        }
        if (!fetchError) {
            return (
                <View style={styles.loaderContainer}>
                    { !endReached ? <Loader color={colors.violetDark} /> : null }
                </View>
            );
        } else {
            return (
                <View style={styles.errorContainer}>
                    <ErrorMessage
                        retry={() => this.retryFetchRecipes(tabIndex as RecipeTypes)}
                        toastManagerRef={this.props.screenProps?.toastManagerRef}
                    />
                </View>
            );
        }
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <View style={styles.tabViewContainer}>
                    <TabView
                        style={styles.tabView}
                        sceneContainerStyle={styles.sceneContainerStyle}
                        navigationState={this.state}
                        renderScene={this.renderScene}
                        renderTabBar={(props: any) => this.getTabBar(props)}
                        onIndexChange={this.handleIndexChange}
                    />
                </View>
                <Header mode={'menu'} />
            </View>
        );
    }
}

export default connect(mapStateToProps, {listsClear})(Recipes);
