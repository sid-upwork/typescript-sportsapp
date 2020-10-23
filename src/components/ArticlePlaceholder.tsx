import React, { PureComponent, Fragment } from 'react';
import { View } from 'react-native';
import { IArticle } from '../types/article';
import { IRecipe } from '../types/recipe';

import BlurWrapper from './BlurWrapper';
import FadeInImage from './FadeInImage';
import Header from './Header';

import { ARTICLE_IMAGE_INITIAL_SCALE } from '../views/Article';
import styles from '../styles/components/ArticlePlaceholder.style';

interface IProps {
    data: IArticle | IRecipe;
    type: 'article' | 'recipe';
}

interface IState {
    renderThumbnail: boolean;
}

export default class ArticlePlaceholder extends PureComponent<IProps, IState> {

    constructor (props: IProps) {
        super(props);
        this.state = {
            renderThumbnail: true
        };
    }

    private onLoad = () => {
        this.setState({ renderThumbnail: false });
    }

    private get image (): JSX.Element {
        const { data } = this.props;
        const thumbnail = data?.image?.thumbnailUrl || data?.video?.thumbnailUrl;
        const imageContainerStyle = [
            styles.fullSpace,
            { transform: [{ scale: ARTICLE_IMAGE_INITIAL_SCALE }] }
        ];

        return data.video ? (
            <FadeInImage
                source={{ uri: thumbnail }}
                containerCustomStyle={imageContainerStyle}
            />
        ) : (
            <Fragment>
                {/* Render thumbnail image to have something quickier to render than HD version */}
                {
                    this.state.renderThumbnail &&
                    <FadeInImage
                        source={{ uri: thumbnail }}
                        containerCustomStyle={imageContainerStyle}
                    />
                }
                <FadeInImage
                    containerCustomStyle={imageContainerStyle}
                    onLoad={this.onLoad}
                    source={{ uri: data.fullscreenImage && data.fullscreenImage.url }}
                />
                <BlurWrapper
                    type={'vibrancy'}
                    blurType={'light'}
                    blurAmount={12}
                    style={styles.fullSpace}
                    fallbackStyle={styles.blurAndroid}
                />
            </Fragment>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={[styles.fullSpace, styles.container]}>
                { this.image }
                <Header
                    gradientAlwaysVisible={true}
                    gradientColors={'black'}
                    mode={'placeholder'}
                />
            </View>
        );
    }
}
