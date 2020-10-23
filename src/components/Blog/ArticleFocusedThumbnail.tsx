import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import { IArticle } from '../../types/article';
import { getFormattedDate } from '../../utils/date';
import { getTextColorFromLuminance, checkColorFormat } from '../../utils/colors';

import chroma from 'chroma-js';
import { get } from 'lodash';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';
import GradientOverlay from '../GradientOverlay';
import LinearGradient from 'react-native-linear-gradient';

import colors from '../../styles/base/colors.style';
import thumbnailStyles from '../../styles/components/Blog/ArticleThumbnail.style';
import styles, { GRADIENT_COLORS } from '../../styles/components/Blog/ArticleFocusedThumbnail.style';

import IconPlay from '../../static/icons/video/play.svg';

interface IProps {
    article: IArticle;
    index: number;
    onPress: () => void;
    navigation: any;
}

interface IState {}

class ArticleFocusedThumbnail extends PureComponent<IProps, IState> {

    private get categoryTitle (): string {
        return get(this.props.article, 'categories[0].title');
    }

    private get categoryColor (): string {
        return checkColorFormat(get(this.props.article, 'categories[0].color', colors.violetDark));
    }

    private get categoryTitleColor (): string {
        return getTextColorFromLuminance(this.categoryColor);
    }

    private get category (): JSX.Element {
        return !!this.categoryTitle ? (
            <View style={[thumbnailStyles.category, { backgroundColor: this.categoryColor }]}>
                <Text numberOfLines={1} style={[thumbnailStyles.categoryLabel, { color: this.categoryTitleColor }]}>
                    { this.categoryTitle }
                </Text>
            </View>
        ) : null;
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

    public render (): JSX.Element {
        const { article, index, onPress } = this.props;

        if (!article) {
            return null;
        }

        const isVideo = !!article.video;
        const uri = article?.image?.thumbnailUrl || article?.video?.thumbnailUrl;

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                key={`ArticleFocusedThumbnail-${index}`}
                onPress={onPress}
                style={styles.container}
            >
                <View style={styles.border} />
                <View style={styles.containerInner}>
                    <DiffuseShadow
                        borderRadius={20}
                        color={colors.violetDark}
                        horizontalOffset={25}
                        shadowOpacity={0.4}
                        verticalOffset={14}
                    />
                    <View style={styles.containerOverflow}>
                        <View style={styles.imageContainer}>
                            <FadeInImage
                                containerCustomStyle={styles.image}
                                source={{ uri }}
                            />
                            <View style={styles.imageOverlay}>
                                { isVideo && this.gradientOverlay }
                                { this.category }
                            </View>
                        </View>
                        {
                            isVideo ? (
                                <View style={styles.videoInfos}>
                                    <View style={styles.playContainer}>
                                        <View style={styles.playIconContainer}>
                                            <IconPlay style={styles.playIcon } />
                                        </View>
                                    </View>
                                    <Text numberOfLines={3} style={styles.titleVideo}>{ article.title }</Text>
                                </View>
                            ) : (
                                <View style={styles.infos}>
                                    <LinearGradient angle={150} colors={GRADIENT_COLORS} style={styles.gradient} useAngle={true} />
                                    <Text numberOfLines={1} style={styles.date}>{ getFormattedDate(article.createdAt) }</Text>
                                    <Text numberOfLines={3} style={styles.title}>{ article.title }</Text>
                                </View>
                            )
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

export default withNavigation(ArticleFocusedThumbnail);
