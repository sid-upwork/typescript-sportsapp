import React, { PureComponent } from 'react';
import { View, Text, Animated, TouchableOpacity, ViewStyle } from 'react-native';
import { IArticle } from '../../types/article';
import { getTextColorFromLuminance, checkColorFormat } from '../../utils/colors';
import I18n from '../../utils/i18n';

import chroma from 'chroma-js';
import { get } from 'lodash';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';
import GradientOverlay from '../GradientOverlay';
import LinearGradient from 'react-native-linear-gradient';

import colors from '../../styles/base/colors.style';
import styles, { MORE_GRADIENT_COLORS, PLAY_GRADIENT_COLORS } from '../../styles/components/Blog/ArticleThumbnail.style';

import IconPlay from '../../static/icons/video/play.svg';

interface IProps {
    article: IArticle;
    index: number;
    style?: ViewStyle;
    onPress: () => void;
}

interface IState {
    animationTransform: Animated.Value;
}

class ArticleThumbnail extends PureComponent<IProps, IState> {

    private transformInterpolation: Animated.AnimatedInterpolation;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animationTransform: new Animated.Value(1)
        };
        this.transformInterpolation = this.state.animationTransform.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg']
        });
    }

    public componentDidMount (): void {
        this.animateItem();
    }

    private get categoryTitle (): string {
        return get(this.props.article, 'categories[0].title');
    }

    private get categoryColor (): string {
        return checkColorFormat(get(this.props.article, 'categories[0].color', colors.violetDark));
    }

    private get categoryTitleColor (): string {
        return getTextColorFromLuminance(this.categoryColor);
    }

    private animateItem (): void {
        const { animationTransform } = this.state;
        const cappedIndex = Math.abs(this.props.index % 10);
        const delay = cappedIndex * 150;

        Animated.sequence([
            Animated.delay(delay),
            Animated.spring(animationTransform, {
                toValue: 0,
                speed: 1,
                bounciness: 10,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private get gradientOverlay (): JSX.Element {
        const overlayColors: string[] = [
            chroma(colors.violetDark).alpha(0).css(),
            chroma(colors.violetDark).alpha(0.4).css(),
            chroma(colors.violetDark).alpha(0.7).css()
        ];
        const overlayLocation: number[] = [0, 0.6, 1];

        return (
            <GradientOverlay colors={overlayColors} locations={overlayLocation} />
        );
    }

    private get category (): JSX.Element {
        return !!this.categoryTitle ? (
            <View style={[styles.category, { backgroundColor: this.categoryColor }]}>
                <Text numberOfLines={1} style={[styles.categoryLabel, { color: this.categoryTitleColor }]}>
                    { this.categoryTitle }
                </Text>
            </View>
        ) : null;
    }

    private get moreButton (): JSX.Element {
        return (
            <View style={styles.moreButtonContainer}>
                <LinearGradient angle={150} colors={MORE_GRADIENT_COLORS} style={styles.moreButtonBackground} useAngle={true} />
                <Text style={styles.moreButtonText}>{ I18n.t('global.more') }</Text>
            </View>
        );
    }

    private get playButton (): JSX.Element {
        return (
            <View style={styles.moreButtonContainer}>
                <LinearGradient angle={150} colors={PLAY_GRADIENT_COLORS} style={styles.moreButtonBackground} useAngle={true} />
                <View style={styles.playIconContainer}>
                    <IconPlay style={styles.playIcon } />
                </View>
            </View>
        );
    }

    public render (): JSX.Element {
        const { article, onPress, style } = this.props;

        if (!article) {
            return null;
        }

        const isVideo = !!article?.video;
        const uri = article?.image?.thumbnailUrl || article?.video?.thumbnailUrl;
        const animatedStyles = { transform: [{ rotateY: this.transformInterpolation}] };
        const contentContainerStyle: any = [
            styles.contentContainer,
            { justifyContent: !!this.categoryTitle ? 'space-between' : 'flex-end' }
        ];

        return (
            <Animated.View style={[styles.container, animatedStyles, style]}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPress}
                    style={styles.touchableOpacity}
                >
                    <View style={styles.border} />
                    <View style={styles.imageContainer}>
                        <DiffuseShadow
                            borderRadius={20}
                            color={colors.violetDark}
                            horizontalOffset={25}
                            shadowOpacity={0.4}
                            verticalOffset={14}
                        />
                        <View style={styles.imageContainerInner}>
                            <FadeInImage
                                containerCustomStyle={styles.image}
                                source={{ uri }}
                            />
                            <View style={contentContainerStyle}>
                                { this.gradientOverlay }
                                { this.category }
                                <Text numberOfLines={3} style={styles.titleVideo}>{ article.title }</Text>
                            </View>
                        </View>
                    </View>
                    { isVideo ? this.playButton : this.moreButton }
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

export default ArticleThumbnail;
