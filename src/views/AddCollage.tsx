import React, { Component } from 'react';
import { Appearance, Image, Text, View } from 'react-native';
import {
    COLLAGE_DIMENSIONS,
    deleteFile,
    downloadImage,
    getCollagePreSignedURLs,
    uploadCollagePart
} from '../utils/images';
import { IImageInfo } from './PictureViewer';
import { IScreenProps } from '../index';
import { logEvent } from '../utils/analytics';
import instance from '../utils/api';
import { getFormattedDate, getDateFromUnix } from '../utils/date';
import { ENDPOINTS } from '../utils/endpoints';
import i18n from '../utils/i18n';
import { isAndroid } from '../utils/os';

import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker, { Image as CropPickerImage } from 'react-native-image-crop-picker';
import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../components/DiffuseShadow';
import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import HeaderSpacer from '../components/HeaderSpacer';
import NativeSelectionMenu from '../components/NativeSelectionMenu';
import SharedButton from '../components/SharedButton';
import Switch from '../components/Switch';

import { iosHomeIndicatorOffset } from '../styles/base/metrics.style';
import colors from '../styles/base/colors.style';
import styles, { BORDER_RADIUS, DATE_GRADIENT, SWITCH_COLOR } from '../styles/views/AddCollage.style';

import Blob from '../static/ProgressPictures/background.svg';

const CAMERA_ADD_ICON = require('../static/icons/camera-add.png');
const EDIT_ICON = require('../static/icons/pencil.png');
const CALENDAR_ICON = require('../static/icons/calendar.png');

interface ICollage {
    date: string;
    from: 'camera' | 'library' | 'progress_pictures';
    originalImagePath: string;
    path: string;
    rawDate: Date;
}

interface IProps {
    navigation: any;
    screenProps: IScreenProps;
}

interface IState {
    dateToEdit: Date;
    newCollage: ICollage[];
    newCollageSelectedSide: 0 | 1;
    printDates: boolean;
    showDateTimePicker: boolean;
}

const DATE_FORMAT = 'll';

class AddCollage extends Component<IProps, IState> {

    private commonCropperProps: {};
    private commonPickerProps: {};
    private getMenuOption: (type: 'pictures' | 'collages', picturesLength?: number) => string[];
    private onFinishedCallback: () => void;
    private pictures: IImageInfo[];
    private isDarkMode: boolean;

    constructor (props: IProps) {
        super(props);
        this.commonPickerProps = {
            cropperCancelText: i18n.t('global.cancel'),
            cropperChooseText: i18n.t('global.choose'),
            cropperToolbarTitle: i18n.t('progressPictures.cropPicture'),
            loadingLabelText: i18n.t('progressPictures.processing'),
            mediaType: 'photo',
            writeTempFile: true
        };
        this.commonCropperProps = {
            ...this.commonPickerProps,
            height: COLLAGE_DIMENSIONS.height,
            width: COLLAGE_DIMENSIONS.width
        };
        this.getMenuOption = this.props.navigation.getParam('getMenuOption');
        this.pictures = this.props.navigation.getParam('pictures');
        this.isDarkMode = Appearance.getColorScheme() === 'dark';
        this.onFinishedCallback = this.props.navigation.getParam('onFinishedCallback');
        this.state = {
            dateToEdit: undefined,
            newCollage: [
                { date: undefined, from: undefined, originalImagePath: undefined, path: undefined, rawDate: undefined },
                { date: undefined, from: undefined, originalImagePath: undefined, path: undefined, rawDate: undefined }
            ],
            newCollageSelectedSide: undefined,
            printDates: false,
            showDateTimePicker: false
        };
    }

    public componentWillUnmount (): void {
        this.deleteTempFiles();
    }

    private hasDates (): boolean {
        const { newCollage } = this.state;
        return !!newCollage[0]?.date && !!newCollage[1]?.date;
    }

    private shouldDisplayDates (): boolean {
        const { printDates } = this.state;
        return printDates && this.hasDates();
    }

    private deleteTempFiles (): void {
        const { newCollage } = this.state;

        // Remove temporary files created from progress pictures
        if (newCollage[0]?.from === 'progress_pictures') {
            deleteFile(this.getDownloadedTempFileName(0));
        }
        if (newCollage[1]?.from === 'progress_pictures') {
            deleteFile(this.getDownloadedTempFileName(1));
        }

        // Remove temporary files created from the cropper
        ImagePicker.clean()
        .then()
        .catch((error: string) => console.log(error));
    }

    private getDownloadedTempFileName (side: 0 | 1): string {
        return `temp-${side}.jpg`;
    }

    private onError (error: any, eventName?: string): void {
        const { screenProps } = this.props;

        console.log(error);
        !!eventName && logEvent(eventName, { error });

        // Don't display an error toast if the user cancelled the action
        if (!error?.code?.toLowerCase().includes('cancel')) {
            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private onAddButtonPress = async (_: any, index: number): Promise<void> => {
        const { newCollage, newCollageSelectedSide } = this.state;
        const { screenProps } = this.props;

        try {
            if (index === 0 || index === 1) {
                const method = index === 1 ? 'openPicker' : 'openCamera';

                // Open camera
                screenProps?.rootLoaderRef?.current?.open();

                // We need to keep track of the original image and the plugin isn't doing it
                // Therefore we have no choice but to make it a 2-step process
                // @ts-ignore
                const originalImage: CropPickerImage = await ImagePicker[method](this.commonPickerProps);

                // @ts-ignore
                const croppedImage: CropPickerImage = await ImagePicker.openCropper({
                    ...this.commonCropperProps,
                    cropping: true,
                    path: originalImage?.path
                });

                const updatedCollage = newCollage;
                const dateUnix = originalImage?.creationDate || originalImage?.modificationDate ?
                    parseInt(originalImage?.creationDate || originalImage?.modificationDate, 10) :
                    Date.now(); // Unix timestamp in ms

                // On Android, modificationDate is a ms Unix timestamp
                // On iOS, the timestamp is in seconds...
                const dateUnixSeconds = dateUnix > 9999999999 ? Math.floor(dateUnix / 1000) : dateUnix;

                updatedCollage[newCollageSelectedSide] = {
                    date: getFormattedDate(null, DATE_FORMAT, dateUnixSeconds),
                    from: index === 1 ? 'library' : 'camera',
                    originalImagePath: originalImage?.path,
                    path: croppedImage?.path,
                    rawDate: getDateFromUnix(dateUnixSeconds) // new Date(dateUnixSeconds) returns 01/01/1970 with Chinese language...
                };

                this.setState({ newCollage: updatedCollage }, () => {
                    screenProps?.rootLoaderRef?.current?.close();
                });
            } else if (index === 2) {
                // Choose from previous pictures
                this.props.navigation.navigate('PictureSelection', {
                    callback: this.onPictureChosen,
                    pictures: this.pictures.map((picture: IImageInfo) => ({
                        date: picture?.date,
                        url: picture?.thumbnailUrl
                    }))
                });
            }
        } catch (error) {
            screenProps?.rootLoaderRef?.current?.close();
            this.onError(error, 'collage_capture_error');
        }
    }

    private onPictureChosen = async (imagePath: string, imageDate: string): Promise<void> => {
        const { newCollage, newCollageSelectedSide } = this.state;
        const { screenProps } = this.props;

        screenProps?.rootLoaderRef?.current?.open();

        try {
            const tempFileName = this.getDownloadedTempFileName(newCollageSelectedSide);

            // Download temp image
            const downloadedImagePath = await downloadImage(imagePath, tempFileName);

            // Crop temp image
            const croppedImage: CropPickerImage = await ImagePicker.openCropper({
                ...this.commonCropperProps,
                path: downloadedImagePath
            });

            // Delete temp image
            // Done on unmount so that we can edit the original image rather than the cropped version
            // deleteFile(tempFileName);

            const updatedCollage = newCollage;
            updatedCollage[newCollageSelectedSide] = {
                date: getFormattedDate(imageDate, DATE_FORMAT),
                from: 'progress_pictures',
                originalImagePath: downloadedImagePath,
                path: croppedImage?.path,
                rawDate: !!imageDate ? new Date(imageDate) : new Date()
            };

            this.setState({ newCollage: updatedCollage }, () => {
                screenProps?.rootLoaderRef?.current?.close();
            });
        } catch (error) {
            screenProps?.rootLoaderRef?.current?.close();
            this.onError(error, 'collage_picture_error');
        }
    }

    private editImage = async (side: 0 | 1): Promise<void> => {
        const { newCollage } = this.state;
        const { screenProps } = this.props;

        try {
            screenProps?.rootLoaderRef?.current?.open();

            const imagePath = newCollage[side]?.originalImagePath || newCollage[side]?.path;
            const croppedImage: CropPickerImage = await ImagePicker.openCropper({
                ...this.commonCropperProps,
                path: imagePath
            });

            const updatedCollage = newCollage;
            updatedCollage[side].path = croppedImage?.path;
            this.setState({ newCollage: updatedCollage }, () => {
                screenProps?.rootLoaderRef?.current?.close();
            });
        } catch (error) {
            screenProps?.rootLoaderRef?.current?.close();
            this.onError(error, 'collage_edit_error');
        }
    }

    private onPressCreate = async (): Promise<void> => {
        const { newCollage } = this.state;
        const { screenProps } = this.props;
        try {
            screenProps?.rootLoaderRef?.current?.open(i18n.t('progressPictures.loadingMessage'));

            let preSignedURLs;
            if (this.shouldDisplayDates()) {
                preSignedURLs = await getCollagePreSignedURLs([
                    newCollage[0]?.date,
                    newCollage[1]?.date
                ]);
            } else {
                preSignedURLs = await getCollagePreSignedURLs();
            }

            let fileUid = preSignedURLs[0]?.fields?.key.substr(preSignedURLs[0]?.fields?.key?.lastIndexOf('/') + 1);
            fileUid = fileUid?.substring(0, fileUid.lastIndexOf('-'));
            await Promise.all([
                uploadCollagePart(preSignedURLs[0], newCollage[0]?.path),
                uploadCollagePart(preSignedURLs[1], newCollage[1]?.path)
            ]);

            const polling = setInterval(async () => {
                const uploaded = await instance.get(ENDPOINTS.collages + '/' + fileUid);
                if (uploaded?.data?.status === 'processed') {
                    // Upload succeeded
                    clearTimeout(pollingTimeout);
                    clearInterval(polling);
                    logEvent('collage_upload_success', { fileUid });
                    screenProps?.rootLoaderRef?.current?.close();
                    this.props.navigation.goBack();
                    this.onFinishedCallback();
                }
            }, 2000);

            // Start failure timeout of 20 seconds
            const pollingTimeout = setTimeout(() => {
                // Upload failed
                clearTimeout(pollingTimeout);
                clearInterval(polling);
                logEvent('collage_upload_timeout', { fileUid });
                screenProps?.rootLoaderRef?.current?.close();
                screenProps?.toastManagerRef?.current?.openToast({
                    message: i18n.t('app.fetchError'),
                    type: 'warning'
                });
                this.props.navigation.goBack();
                this.onFinishedCallback();
            }, 20000);
        } catch (err) {
            console.log('Create collage error', err);
            console.log('Create collage network error', err?.response);
            logEvent('collage_upload_error', {
                error: err,
                errorResponse: err?.response
            });
            screenProps?.rootLoaderRef?.current?.close();
            screenProps?.toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
        }
    }

    private chooseDate = (side: 0 | 1): void => {
        const { newCollage } = this.state;
        const initialDate = newCollage[side]?.rawDate;

        // On iOS we use a custom popup, Android has it's own native popup
        if (isAndroid) {
            this.setState({
                dateToEdit: initialDate,
                newCollageSelectedSide: side,
                showDateTimePicker: true
            });
        } else {
            this.setState({ newCollageSelectedSide: side });
            this.props.screenProps.popupManagerRef.current.requestPopup({
                backgroundColors: this.isDarkMode ? null : ['#FFFADE', '#FFCFF7'],
                backgroundType: 'gradient',
                closeButtonIconColor: this.isDarkMode ? 'white' : colors.violetDark,
                ContentComponent: DateTimePicker,
                ContentComponentProps: {
                    value: initialDate,
                    onChange: this.onDateChange,
                    locale: i18n.locale
                },
                height: 360 + iosHomeIndicatorOffset,
                position: 'bottom',
                scrollView: false,
                title: i18n.t('progressPictures.choosePicture'),
                titleStyle: { color: this.isDarkMode ? 'white' : colors.violetDark }
            });
        }
    }

    private onDateChange = async (_: any, localDate: any): Promise<void> => {
        const { newCollage, newCollageSelectedSide } = this.state;

        // Android returns `undefined` if we cancel the picker
        if (!localDate) {
            this.setState({ showDateTimePicker: false });
            return;
        }

        const currentDate = newCollage[newCollageSelectedSide]?.date;
        const selectedDate = getFormattedDate(localDate, DATE_FORMAT);

        if (selectedDate === currentDate) {
            // Date didn't change
            this.setState({ showDateTimePicker: false });
            return;
        }

        const updatedCollage = newCollage;
        newCollage[newCollageSelectedSide].date = selectedDate;
        this.setState({
            newCollage: updatedCollage,
            showDateTimePicker: false
        });
    }

    private onChangeSwitch = (value: boolean): void  => {
        this.setState({ printDates: value });
    }

    private getImage (side: 0 | 1): JSX.Element {
        const { newCollage } = this.state;
        const imageDate = newCollage[side]?.date;
        const imageSource = newCollage[side]?.path;
        const displayDate = !!imageSource && this.shouldDisplayDates();

        const commonButtonProps: any = {
            borderRadius: styles.editButton.borderRadius,
            iconStyle: styles.editButtonIcon,
            shadowProps: {
                borderRadius: styles.editButton.borderRadius,
                horizontalOffset: 0,
                style: { bottom: 10, left: 5, right: 5 },
                verticalOffset: 12
            },
            style: styles.editButtonInner,
            withShadow: true
        };
        const editImageButton = !!imageSource ? (
            <SharedButton
                { ...commonButtonProps }
                color={'pink'}
                containerStyle={styles.editButton}
                icon={EDIT_ICON}
                onPress={() => this.editImage(side)}
            />
        ) : null;
        const editDateButton = displayDate ? (
            <SharedButton
                { ...commonButtonProps }
                color={'blue'}
                containerStyle={[styles.editButton, styles.editDateButton]}
                icon={CALENDAR_ICON}
                onPress={() => this.chooseDate(side)}
            />
        ) : null;

        const dateGradientStyle = [
            styles.fullSpace,
            side === 0 ? styles.datePreviewGradientLeft : styles.datePreviewGradientRight
        ];
        const dateLabelStyle = [
            styles.datePreviewLabel,
            side === 0 ? styles.datePreviewLabelLeft : styles.datePreviewLabelRight
        ];
        const date = displayDate ? (
            <View style={styles.datePreviewContainer}>
                <LinearGradient
                    colors={DATE_GRADIENT}
                    style={dateGradientStyle}
                />
                <Text
                    numberOfLines={1}
                    style={dateLabelStyle}
                >
                    { imageDate }
                </Text>
            </View>
        ) : null;

        const placeholderStyle = [
            styles.placeholder,
            side === 0 ? styles.imageLeft : styles.imageRight
        ];
        const imageStyle = [
            styles.image,
            side === 0 ? styles.imageLeft : styles.imageRight
        ];

        const shadow = !!imageSource ? (
            <DiffuseShadow
                borderRadius={BORDER_RADIUS}
                shadowOpacity={0.18}
                horizontalOffset={12}
                verticalOffset={20}
            />
        ) : null;

        return (
            <NativeSelectionMenu
                onPress={(_: any, index: number) => {
                    this.setState({ newCollageSelectedSide: side }, () => { this.onAddButtonPress(_, index); });
                }}
                options={this.getMenuOption('collages')}
            >
                { shadow }
                <View style={placeholderStyle}>
                    <View style={styles.placeholderCircle}>
                        <FadeInImage
                            containerCustomStyle={styles.placeholderIcon}
                            disableAnimation={true}
                            resizeMode={'contain'}
                            source={CAMERA_ADD_ICON}
                            tintColor={styles.placeholderIcon.tintColor}
                        />
                        <View style={styles.placeholderNumber}>
                            <Text style={styles.placeholderNumberText}>{ side + 1 }</Text>
                        </View>
                    </View>
                </View>
                {/* No FadeInImage component here because we don't want to cache this one */}
                <Image source={{ uri: imageSource }} style={imageStyle} />
                <View style={styles.fullSpace}>
                    { date }
                </View>
                <View style={[styles.fullSpace, styles.editButtonsContainer]}>
                    { editDateButton }
                    { editImageButton }
                </View>
            </NativeSelectionMenu>
        );
    }

    private get bottom (): JSX.Element {
        const { newCollage, printDates } = this.state;

        let content;
        if (!newCollage[0]?.path || !newCollage[1]?.path) {
            const label = !newCollage[0]?.path && !newCollage[1]?.path ?
                i18n.t('progressPictures.remainingPicturesToAdd') :
                i18n.t('progressPictures.remainingPictureToAdd');
            content = (
                <View style={styles.bottomTextContainer}>
                    <Text style={styles.bottomText}>{ label }</Text>
                </View>
            );
        } else {
            const dateSwitch = this.hasDates() ? (
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>{i18n.t('progressPictures.printDates')}</Text>
                    <Switch
                        borderColor={{ true: SWITCH_COLOR, false: SWITCH_COLOR }}
                        thumbColor={{ true: 'white', false: SWITCH_COLOR }}
                        trackColor={{ true: SWITCH_COLOR, false: 'white' }}
                        onChange={this.onChangeSwitch}
                        value={printDates}
                    />
                </View>
            ) : null;
            content = (
                <View style={styles.buttonContainer}>
                    <SharedButton
                        // color={'pink'}
                        onPress={this.onPressCreate}
                        text={i18n.t('progressPictures.createCollage')}
                    />
                    { dateSwitch }
                </View>
            );
        }

        return (
            <View style={styles.bottomContainer}>
                { content }
            </View>
        );
    }

    public render (): JSX.Element {
        const { dateToEdit, showDateTimePicker } = this.state;
        const androidDateTimePicker = isAndroid && showDateTimePicker ? (
            <DateTimePicker
                value={dateToEdit}
                onChange={this.onDateChange}
                locale={i18n.locale}
            />
        ) : null;

        return (
            <View style={styles.container}>
                <HeaderSpacer />
                <Blob
                    height={styles.backgroundBlob.height}
                    style={styles.backgroundBlob}
                    width={styles.backgroundBlob.width}
                />
                <View style={styles.collageContainer}>
                    <View style={[styles.collageContainerInner, styles.spacing]}>
                        { this.getImage(0) }
                    </View>
                    <View style={styles.collageContainerInner}>
                        { this.getImage(1) }
                    </View>
                </View>
                { this.bottom }
                <Header
                    confirm={true}
                    confirmProps={{ title: i18n.t('global.close') }}
                    // gradientAlwaysVisible={true}
                    mode={'closeWhite'}
                    title={i18n.t('progressPictures.collagesButton')}
                    titleStyle={styles.headerTitle}
                />
                { androidDateTimePicker }
            </View>
        );
    }
}

export default AddCollage;
