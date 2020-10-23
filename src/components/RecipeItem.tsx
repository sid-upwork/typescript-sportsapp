import React, { PureComponent } from 'react';
import { Animated, Easing, View, Text, Image } from 'react-native';
import { IRecipe } from '../types/recipe';
import { getTextColorFromLuminance, checkColorFormat } from '../utils/colors';
import { ETooltipIds } from '../store/modules/tutorials';
import { IScreenProps } from '../index';
import { get } from 'lodash';
import I18n from '../utils/i18n';
import { RecipeTypes } from '../views/Recipes';

import LinearGradient from 'react-native-linear-gradient';
import Tooltip from './Tooltip';

import FadeInImage from './FadeInImage';
import TouchableScale from './TouchableScale';

import colors from '../styles/base/colors.style';
import styles, { OVERLAY_COLORS } from '../styles/components/RecipeItem.style';

interface IProps {
    index: number;
    onPress: () => void;
    screenProps: IScreenProps;
    recipe: IRecipe;
    tabIndex: RecipeTypes;
}

interface IState {
    animationOpacity: Animated.Value;
    animationTransform: Animated.Value;
}

const CLOCK_ICON = require('../static/icons/clock.png');
const VEGAN_ICON = require('../static/icons/vegan.png');

class RecipeItem extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            animationOpacity: new Animated.Value(0),
            animationTransform: new Animated.Value(0)
        };
    }

    public componentDidMount (): void {
        this.animateItem();
    }

    private animateItem (): void {
        const { animationOpacity, animationTransform } = this.state;
        const cappedIndex = Math.abs(this.props.index % 10);
        const delay = cappedIndex * 120;

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animationOpacity, {
                    toValue: 1,
                    duration: 100,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(animationTransform, {
                    toValue: 1,
                    speed: 18,
                    bounciness: 8,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private onPress = (): void => {
        const { onPress } = this.props;
        onPress && onPress();
    }

    private get categoryTitle (): string {
        return get(this.props.recipe, 'tags[0].title');
    }

    private get categoryColor (): string {
        return checkColorFormat(get(this.props.recipe, 'tags[0].color', colors.violetDark));
    }

    private get categoryTitleColor (): string {
        return getTextColorFromLuminance(this.categoryColor);
    }

    private get title (): JSX.Element {
        const { recipe } = this.props;
        if (recipe && recipe.title) {
            return (
                <Text
                    style={styles.title}
                    numberOfLines={3}
                >
                    {recipe.title}
                </Text>
            );
        }
        return null;
    }

    private get time (): JSX.Element {
        const { index, recipe, screenProps, tabIndex } = this.props;
        if (recipe) {
            let totalTime = recipe.preparationTime ? recipe.preparationTime : 0;
            totalTime += recipe.cookTime ? recipe.cookTime : 0;
            const minutes = Math.floor(totalTime / 60);

            const tooltip = index === 0 && tabIndex === RecipeTypes.Breakfast ? (
                <Tooltip
                    color={colors.violetDark}
                    containerStyle={styles.tooltip}
                    screenProps={screenProps}
                    tooltipId={ETooltipIds.recipeTotalTime}
                />
            ) : null;

            return (
                <View style={styles.topRightContainer}>
                    <View style={styles.timeContainer}>
                        <Image source={CLOCK_ICON} style={styles.iconTime} />
                        <Text
                            style={styles.time}
                            numberOfLines={4}
                        >
                            {minutes}'
                        </Text>
                    </View>
                    { tooltip }
                </View>
            );
        }
        return null;
    }

    private get image (): JSX.Element {
        const { recipe } = this.props;
        return recipe && recipe.image && recipe.image.thumbnailUrl ? (
            <View style={styles.imageWrapper}>
                <View style={styles.imageShadow} />
                <FadeInImage
                    containerCustomStyle={styles.imageContainer}
                    imageStyle={styles.image}
                    source={{ uri: recipe.image.thumbnailUrl }}
                />
            </View>
        ) : null;
    }

    private get tag (): JSX.Element {
        const title = this.categoryTitle;
        if (!!title) {
            return (
                <View style={styles.tagContainer}>
                    <View style={[styles.tagTextContainer, { backgroundColor: this.categoryColor }]}>
                        <FadeInImage
                            containerCustomStyle={styles.iconVegan}
                            source={VEGAN_ICON}
                            tintColor={this.categoryTitleColor}
                        />
                        <Text numberOfLines={1} style={[styles.tagText, { color: this.categoryTitleColor }]}>
                            { title }
                        </Text>
                    </View>
                </View>
            );
        }
        return null;
    }

    private get kcal (): JSX.Element {
        const { recipe } = this.props;
        if (recipe && recipe.calories) {
            return (
                <View style={styles.kcalContainer}>
                    <Text style={styles.kcalText}>{recipe.calories} kCal</Text>
                </View>
            );
        }
        return null;
    }

    private get subtitle (): JSX.Element {
        const { recipe } = this.props;

        if (!recipe || !recipe.summary) {
            return null;
        }

        return (
            <View style={styles.subtitleContainer}>
                <LinearGradient
                    colors={OVERLAY_COLORS}
                    style={styles.subtitleOverlay}
                />
                <Text numberOfLines={3} style={styles.subtitle}>
                    {recipe.summary}
                </Text>
            </View>
        );
    }

    public render (): JSX.Element {
        const { recipe } = this.props;
        if (!recipe) {
            return null;
        }
        const { animationOpacity, animationTransform } = this.state;
        const animatedStyle = {
            opacity: animationOpacity,
            transform: [
                {
                    translateY: animationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0]
                    })
                }
            ]
        };
        const linearGradientMore = [colors.orange, colors.violetVeryLight];

        return (
            <TouchableScale onPress={this.onPress}>
                <Animated.View style={[styles.container, animatedStyle]}>
                    <View style={styles.topContainer}>
                        {this.title}
                        {this.time}
                    </View>
                    <View style={styles.bottomContainer}>
                        <View style={styles.bottomContent}>
                            {this.image}
                            {this.subtitle}
                            {this.tag}
                            {this.kcal}
                        </View>
                        <View style={styles.moreContainer}>
                            <LinearGradient
                                colors={linearGradientMore}
                                start={{x: 0, y: 0.5}} end={{x: 1, y: 1}}
                                style={styles.moreGradient}
                            />
                            <Text style={styles.more}>{ I18n.t('global.more') }</Text>
                        </View>
                    </View>
                </Animated.View>
            </TouchableScale>
        );
    }
}

export default RecipeItem;
