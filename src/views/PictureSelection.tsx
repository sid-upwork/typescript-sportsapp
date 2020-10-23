import React, { Component } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { IImageInfo } from './PictureViewer';

import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import SharedParallaxView from '../components/SharedParallaxView';

import styles, { COLUMNS_NUMBER } from '../styles/views/PictureSelection.style';

import Blob from '../static/ProgressPictures/background-picture_selection.svg';

interface IProps {
    navigation: any;
}

interface IState {}

class PictureSelection extends Component<IProps, IState> {

    private callback: (imageUrl: string, imageDate: string) => void;
    private pictures: IImageInfo[];

    constructor (props: IProps) {
        super(props);
        this.callback = props.navigation.getParam('callback');
        this.pictures = props.navigation.getParam('pictures');
    }

    private onPressItem = (item: IImageInfo): void => {
        this.callback(item?.url, item?.date);
        this.props.navigation.goBack();
    }

    private renderItem = ({ item }: { item: IImageInfo }): JSX.Element => {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.onPressItem(item)}
            >
                <FadeInImage source={{ uri: item?.url }} containerCustomStyle={styles.image} />
            </TouchableOpacity>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <Blob
                    height={styles.backgroundBlob.height}
                    style={styles.backgroundBlob}
                    width={styles.backgroundBlob.width}
                />
                <SharedParallaxView
                    contentContainerStyle={styles.listContentContainer}
                    data={this.pictures}
                    flatlist={true}
                    keyExtractor={(_: any, index: number) => `picture-selection-item-${index}`}
                    numColumns={COLUMNS_NUMBER}
                    renderItem={this.renderItem}
                    style={styles.list}
                />
                <Header
                    // gradientAlwaysVisible={true}
                    mode={'closeWhite'}
                />
            </View>
        );
    }
}

export default PictureSelection;
