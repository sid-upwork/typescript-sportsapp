import React, { Component } from 'react';
import { View, Text, Alert } from 'react-native';
import { saveImageInAlbum } from '../utils/images';
import { getFormattedDate } from '../utils/date';
import { ENDPOINTS } from '../utils/endpoints';
import { logEvent } from '../utils/analytics';
import { IScreenProps } from '../index';
import api from '../utils/api';
import i18n from '../utils/i18n';

import ImageZoomViewer from 'react-native-image-zoom-viewer';
import LinearGradient from 'react-native-linear-gradient';

import Header from '../components/Header';
import Loader from '../components/Loader';
import SharedButton from '../components/SharedButton';

import colors from '../styles/base/colors.style';
import styles, { BOTTOM_GRADIENT_COLORS, BACKGROUND_GRADIENT_COLORS } from '../styles/views/PictureViewer.style';

export interface IImageInfo {
    date: string; // Added by us, not in the module
    height?: number;
    id: string; // Added by us, not in the module
    originSizeKb?: number;
    originUrl?: string;
    props?: any;
    sizeKb?: number;
    url: string;
    thumbnailUrl?: string;
    width?: number;
}

interface IProps {
    navigation: any;
    screenProps: IScreenProps;
}

interface IState {}

const TRASH_ICON = require('../static/icons/trash.png');
const DOWNLOAD_ICON = require('../static/icons/download.png');

class PictureViewer extends Component<IProps, IState> {

    private deleteButton: boolean;
    private downloadButton: boolean;
    private deleteButtonCallback: () => void;
    private images: IImageInfo[];
    private type: 'pictures' | 'collages';

    constructor (props: IProps) {
        super(props);
        this.deleteButton = this.props.navigation.getParam('deleteButton');
        this.downloadButton = this.props.navigation.getParam('downloadButton');
        this.deleteButtonCallback = this.props.navigation.getParam('deleteButtonCallback');
        this.images = this.props.navigation.getParam('images');
        this.type = this.props.navigation.getParam('type');
    }

    private onPressDeleteButton = async (): Promise<void> => {
        const deletePicture = async () => {
            try {
                const endpoint = this.type === 'pictures' ?
                    ENDPOINTS.progressPictures :
                    ENDPOINTS.collages;
                this.props.screenProps?.rootLoaderRef?.current?.open();

                await api.delete(endpoint + '/' + this.images[0].id);
                this.deleteButtonCallback();

                this.props.screenProps?.rootLoaderRef?.current?.close();
                this.props.navigation.goBack();

                logEvent('progress_pictures_delete', { pictureId: this.images[0].id });
            } catch (error) {
                this.props.screenProps?.rootLoaderRef?.current?.close();
                this.props.screenProps?.toastManagerRef?.current?.openToast({
                    message: i18n.t('app.fetchError'),
                    type: 'error'
                });
                console.log('Delete error', error);
                return;
            }
        };

        Alert.alert(
            i18n.t('pictureViewer.confirm.title'),
            i18n.t('pictureViewer.confirm.message'),
            [
                {
                    text: i18n.t('global.cancel'),
                    style: 'cancel'
                },
                {
                    text: i18n.t('global.confirm'),
                    onPress: deletePicture
                }
            ],
            { cancelable: false }
        );
    }

    private onPressDownloadButton = async (): Promise<void> => {
        try {
            this.props.screenProps?.rootLoaderRef?.current?.open();

            await saveImageInAlbum(this.images[0].url);

            this.props.screenProps?.rootLoaderRef?.current?.close();
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('pictureViewer.downloadSuccess'),
                type: 'info'
            });
        } catch (error) {
            this.props.screenProps?.rootLoaderRef?.current?.close();
            this.props.screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
            console.log('Download error', error);
            return;
        }
    }

    private getLoader = (): JSX.Element => {
        return (
            <Loader color={colors.violetVeryLight} />
        );
    }

    private getFooter = (index: number): JSX.Element => {
        const deleteButton = this.deleteButton ? (
            <SharedButton
                color={'pink'}
                onPress={this.onPressDeleteButton}
                icon={TRASH_ICON}
                iconStyle={styles.footerIconStyle}
                style={styles.footerButton}
                // text={i18n.t('pictureViewer.delete')}
                // textStyle={styles.footerButtonText}
            />
        ) : null;

        const downloadButton = this.downloadButton ? (
            <SharedButton
                color={'blue'}
                onPress={this.onPressDownloadButton}
                icon={DOWNLOAD_ICON}
                iconStyle={styles.footerIconStyle}
                style={styles.footerButton}
            />
        ) : null;

        return (
            <View style={styles.footer}>
                <LinearGradient
                    colors={BOTTOM_GRADIENT_COLORS}
                    style={styles.fullSpace}
                    pointerEvents={'none'}
                />
                { downloadButton }
                <Text style={styles.footerDate} numberOfLines={1}>
                    { getFormattedDate(this.images[index].date, 'll') }
                </Text>
                { deleteButton }
            </View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                <LinearGradient
                    angle={160}
                    colors={BACKGROUND_GRADIENT_COLORS}
                    style={styles.fullSpace}
                    useAngle={true}
                />
                <ImageZoomViewer
                    backgroundColor={'transparent'}
                    imageUrls={this.images}
                    loadingRender={this.getLoader}
                    maxOverflow={0}
                    renderFooter={this.getFooter}
                    renderIndicator={() => null}
                    saveToLocalByLongPress={false}
                    useNativeDriver={true}
                />
                <Header
                    gradientAlwaysVisible={true}
                    gradientColors={'black'}
                    mode={'closeWhite'}
                />
            </View>
        );
    }
}

export default PictureViewer;
