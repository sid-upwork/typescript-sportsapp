import React, { Component, ReactNode } from 'react';
import {Animated, Appearance, Easing, Text, TouchableOpacity, View} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { isAndroid, isIOS } from '../utils/os';
import { convertDateToUTC, convertUTCDatetoLocalDate, formatDateForAPI, getFormattedDate } from '../utils/date';
import { IScreenProps } from '../index';
import { ENDPOINTS } from '../utils/endpoints';
import { AxiosResponse } from 'axios';
import { logEvent } from '../utils/analytics';
import api from '../utils/api';
import i18n, {LANGUAGES} from '../utils/i18n';
import { PICTURE_DIMENSIONS, uploadProgressPicture } from '../utils/images';
import { checkSubscriptionStatus } from '../utils/payment';

import CameraRoll from '@react-native-community/cameraroll';
import Carousel from 'react-native-snap-carousel';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker, { Image as CropPickerImage } from 'react-native-image-crop-picker';
import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../components/DiffuseShadow';
import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import HeaderSpacer from '../components/HeaderSpacer';
import Loader from '../components/Loader';
import NativeSelectionMenu from '../components/NativeSelectionMenu';
import SharedButton from '../components/SharedButton';
import TextSwap from '../components/TextSwap';

import { iosHomeIndicatorOffset, viewportWidth } from '../styles/base/metrics.style';
import delays from '../utils/animDelays';
import colors from '../styles/base/colors.style';
import addCollagesStyles from '../styles/views/AddCollage.style';
import styles, {
    ADD_BUTTON_GRADIENT_COLORS,
    BACKGROUND_HEIGHT,
    BACKGROUND_WIDTH,
    CAROUSEL_ITEM_WIDTH,
    CAROUSEL_WIDTH,
    TAB_BUTTON_GRADIENT_COLORS
} from '../styles/views/ProgressPictures.style';

import BackgroundImage from '../static/ProgressPictures/background.svg';

const MAX_ITEMS = 10;

const CAMERA_ICON = require('../static/icons/camera.png');
const CAMERA_ADD_ICON = require('../static/icons/camera-add.png');
const COLLAGE_ICON = require('../static/icons/collage.png');
const CALENDAR_ICON = require('../static/icons/calendar.png');

interface IProps {
    navigation: any;
    screenProps: IScreenProps;
}

interface IState {
    backgroundAnimationOpacity: Animated.Value;
    backgroundAnimationTransform: Animated.Value;
    collages: ICarouselItem[];
    collagesIndex: number;
    collagesReachedEnd: boolean;
    collagesTabButtonAnimationOpacity: Animated.Value;
    collagesTabButtonAnimationTransform: Animated.Value;
    collagesTabButtonGradientAnimationOpacity: Animated.Value;
    dateToEdit: Date;
    loading: boolean;
    pictures: ICarouselItem[];
    picturesIndex: number;
    picturesTabButtonAnimationOpacity: Animated.Value;
    picturesTabButtonAnimationTransform: Animated.Value;
    picturesTabButtonGradientAnimationOpacity: Animated.Value;
    picturesReachedEnd: boolean;
    routes: { key: string, title: string }[];
    sceneAnimationOpacity: Animated.Value;
    showDateTimePicker: boolean;
    tabIndex: number;
}

type ICarouselItem = ICarouselPictureItem | ICarouselLoaderItem;

interface ICarouselPictureItem {
    date: string;
    url: string;
    thumbnailUrl: string;
    id: string;
    type: 'pictures' | 'collages';
}

interface ICarouselLoaderItem {
    type: 'loader'
}

class ProgressPictures extends Component<IProps, IState> {

    private commonPickerProps: {};
    private collageCarouselRef: React.RefObject<any>;
    private pictureCarouselRef: React.RefObject<any>;
    private timeout: any;
    private isDarkMode: boolean;

    constructor (props: IProps) {
        super(props);
        this.commonPickerProps = {
            cropping: true,
            cropperCancelText: i18n.t('global.cancel'),
            cropperChooseText: i18n.t('global.choose'),
            cropperToolbarTitle: i18n.t('progressPictures.cropPicture'),
            loadingLabelText: i18n.t('progressPictures.processing'),
            mediaType: 'photo',
            height: PICTURE_DIMENSIONS.height,
            width: PICTURE_DIMENSIONS.width
        };
        this.collageCarouselRef = React.createRef();
        this.pictureCarouselRef = React.createRef();
        this.isDarkMode = Appearance.getColorScheme() === 'dark';
        this.state = {
            backgroundAnimationOpacity: new Animated.Value(0),
            backgroundAnimationTransform: new Animated.Value(1),
            collages: [],
            collagesIndex: 0,
            collagesReachedEnd: false,
            collagesTabButtonAnimationOpacity: new Animated.Value(0),
            collagesTabButtonAnimationTransform: new Animated.Value(1),
            collagesTabButtonGradientAnimationOpacity: new Animated.Value(0),
            dateToEdit: undefined,
            loading: true,
            pictures: [],
            picturesIndex: 0,
            picturesReachedEnd: false,
            picturesTabButtonAnimationOpacity: new Animated.Value(0),
            picturesTabButtonAnimationTransform: new Animated.Value(1),
            picturesTabButtonGradientAnimationOpacity: new Animated.Value(1),
            routes: [
                { key: 'pictures', title: 'Pictures' },
                { key: 'collages', title: 'Collages' }
            ],
            sceneAnimationOpacity: new Animated.Value(0),
            showDateTimePicker: false,
            tabIndex: props.navigation?.getParam('tabIndex') || 0
        };
    }

    public componentDidMount (): void {
        checkSubscriptionStatus();
        this.animateBackground();
        this.animateTabButtons();
        this.fetch();
    }

    public componentWillUnmount (): void {
        clearTimeout(this.timeout);
        ImagePicker.clean()
        .then()
        .catch((error: string) => console.log(error));
    }

    public fetch = (): void => {
        this.setState({ loading: true }, async () => {
            try {
                const progressPicturesResponse: AxiosResponse = await api.get(
                    ENDPOINTS.progressPictures + `?order[date]=desc&limit=${MAX_ITEMS}`
                );
                const collagesResponse: AxiosResponse = await api.get(
                    ENDPOINTS.collages + `?order[createdAt]=desc&limit=${MAX_ITEMS}`
                );

                const pictures = this.mapAPIItemsToImageInfo(progressPicturesResponse.data, 'pictures');
                const collages = this.mapAPIItemsToImageInfo(collagesResponse.data, 'collages');

                this.setState({
                    loading: false,
                    collages,
                    pictures,
                    picturesReachedEnd: !!progressPicturesResponse.headers['x-offset-reached-end'],
                    collagesReachedEnd: !!collagesResponse.headers['x-offset-reached-end'],
                }, () => this.animateScene());
            } catch (error) {
                this.props.screenProps?.toastManagerRef?.current?.openToast({
                    message: i18n.t('app.fState as any)etchError'),
                    type: 'error'
                });
                this.setState({
                    loading: false
                }, () => this.animateScene());
                console.log('fetch error', error);
            }
        });
    }

    private mapAPIItemsToImageInfo(apiItems, type: 'pictures' | 'collages'): ICarouselPictureItem[]  {
        return apiItems.map((item) => ({
            date: item.date,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl,
            id: item.id,
            type
        }))
    };

    private animateBackground (): void {
        const { backgroundAnimationOpacity, backgroundAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.progressPictures.backgroundApparition),
            Animated.parallel([
                Animated.timing(backgroundAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(backgroundAnimationTransform, {
                    toValue: 0,
                    speed: 10,
                    bounciness: 4,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateTabButtons (): void {
        const {
            collagesTabButtonAnimationOpacity,
            collagesTabButtonAnimationTransform,
            picturesTabButtonAnimationOpacity,
            picturesTabButtonAnimationTransform
        } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.progressPictures.picturesTabAppartition),
            Animated.parallel([
                Animated.timing(picturesTabButtonAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(picturesTabButtonAnimationTransform, {
                    toValue: 0,
                    speed: 17,
                    bounciness: 5,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();

        Animated.sequence([
            Animated.delay(delays.views.progressPictures.collagesTabApparition),
            Animated.parallel([
                Animated.timing(collagesTabButtonAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(collagesTabButtonAnimationTransform, {
                    toValue: 0,
                    speed: 17,
                    bounciness: 5,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    // Do not remove
    private animateTabButtonGradient (type: 'pictures' | 'collages', delay?: boolean): void {
        const {
            collagesTabButtonGradientAnimationOpacity,
            picturesTabButtonGradientAnimationOpacity
        } = this.state;
        const isPictures = type === 'pictures';

        Animated.sequence([
            Animated.delay(delay ? delays.views.progressPictures.picturesTabAppartition : 0),
            Animated.parallel([
                Animated.timing(
                    isPictures ?
                        picturesTabButtonGradientAnimationOpacity :
                        collagesTabButtonGradientAnimationOpacity,
                    {
                        toValue: 1,
                        duration: 250,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }
                ),
                Animated.timing(
                    isPictures ?
                        collagesTabButtonGradientAnimationOpacity :
                        picturesTabButtonGradientAnimationOpacity,
                    {
                        toValue: 0,
                        duration: 250,
                        easing: Easing.linear,
                        isInteraction: false,
                        useNativeDriver: true
                    }
                )
            ])
        ]).start();
    }

    private animateScene (): void {
        Animated.sequence([
            Animated.timing(this.state.sceneAnimationOpacity, {
                toValue: 1,
                duration: 300,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start();
    }

    private async sendImage (image: CropPickerImage): Promise<void> {
        const { screenProps } = this.props;
        screenProps?.rootLoaderRef?.current?.open(i18n.t('progressPictures.loadingMessage'));
        try {
            await uploadProgressPicture(
                image,
                (fileUuid) => {
                    console.log('success', fileUuid);
                    logEvent('picture_upload_success', { fileUuid });
                    screenProps?.rootLoaderRef?.current?.close();
                    this.fetch();
                },
                () => {
                    logEvent('picture_upload_timeout');
                    screenProps?.rootLoaderRef?.current?.close();
                    screenProps?.toastManagerRef?.current?.openToast({
                        message: i18n.t('app.fetchError'),
                        type: 'warning'
                    });
                });
        } catch (err) {
            console.log('Upload image error', err);
            console.log('Upload image network error', err?.response);
            logEvent('picture_upload_error', {
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

    private chooseDate = (UTCdate: string): void => {
        const { tabIndex } = this.state;
        const isPictures = tabIndex === 0;
        const localDate = convertUTCDatetoLocalDate(UTCdate);

        // On iOS we use a custom popup, Android has it's own native popup
        if (isAndroid) {
            this.setState({ dateToEdit: new Date(localDate), showDateTimePicker: true });
        } else {
            let selectedDate = new Date(localDate);
            this.props.screenProps.popupManagerRef.current.requestPopup({
                backgroundColors: this.isDarkMode ? null : ['#FFFADE', '#FFCFF7'],
                backgroundType: 'gradient',
                closeButtonIconColor: this.isDarkMode ? 'white' : colors.violetDark,
                ContentComponent: DateTimePicker,
                ContentComponentProps: {
                    value: selectedDate,
                    onChange: (_: any, date: any) => { selectedDate = date; },
                    locale: i18n.locale
                },
                height: 360 + iosHomeIndicatorOffset,
                // onDateChange is called here rather than on `onChange` to avoid reloading the carousel on every date change
                onClose: () => this.onDateChange(null, selectedDate),
                position: 'bottom',
                scrollView: false,
                title: i18n.t(`progressPictures.choose${isPictures ? 'Picture' : 'Collage'}Date`),
                titleStyle: { color: this.isDarkMode ? 'white' : colors.violetDark }
            });
        }
    }

    private onDateChange = async (_: any, localDate: any): Promise<void> => {
        const { pictures, collages, picturesIndex, collagesIndex, tabIndex } = this.state;
        const isPictures = tabIndex === 0;
        const items: ICarouselPictureItem[] = isPictures ? (pictures as ICarouselPictureItem[]) : (collages as ICarouselPictureItem[]);
        const itemIndex = isPictures ? picturesIndex : collagesIndex;
        const UTCDate = convertDateToUTC(localDate);

        const id = items[itemIndex].id;
        const currentDate = items[itemIndex].date;

        // Date didn't change
        // Or we're on Android and we pressed cancel (in that case localDate is going to be undefined)
        if ((isAndroid && typeof localDate === 'undefined') || UTCDate === convertDateToUTC(currentDate)) {
            this.setState({ showDateTimePicker: false });
            return;
        }

        try {
            await api.put(
                ENDPOINTS.progressPictures + '/' + id,
                { date: formatDateForAPI(UTCDate) }
            );
            this.setState({ showDateTimePicker: false });
            this.fetch();
        } catch (error) {
            console.log('put error', error);
            this.setState({ showDateTimePicker: false });
            this.props.screenProps?.toastManagerRef?.current?.openToast({ message: i18n.t('app.fetchError'), type: 'error' });
            return;
        }
    }

    private onEndReached = (type: 'pictures' | 'collages'): void => {
        if (this.state[type].filter((element: any) => element.type === 'loader').length > 0) {
            // We already have a loader element rendered, meaning we shouldn't trigger onEndReached
            return;
        }
        let offset = this.state[type].length % MAX_ITEMS === 0 ? this.state[type].length : 0
        if (offset === 0 && this.state[type].length > 0) {
            return;
        }

        const newState: { pictures: ICarouselItem[]; collages: ICarouselItem[] } = {
            pictures: type === 'pictures' ? [...this.state.pictures, { type: 'loader' }] : this.state.pictures,
            collages: type === 'collages' ? [...this.state.collages, { type: 'loader' }] : this.state.collages,
        };
        this.setState(newState, async () => {
            try {
                const ENDPOINT = type === 'pictures' ? ENDPOINTS.progressPictures : ENDPOINTS.collages;
                const apiResponse: AxiosResponse = await api.get(
                    ENDPOINT + `?order[${type === 'pictures' ? 'date' : 'createdAt'}]=desc&limit=${MAX_ITEMS}&offset=${offset}`
                );
                const newElements = this.state[type]
                    .filter((element) => element.type !== 'loader')
                    .concat(this.mapAPIItemsToImageInfo(apiResponse.data, type));
                const newState: { pictures: ICarouselItem[]; collages: ICarouselItem[]; picturesReachedEnd: boolean;  collagesReachedEnd: boolean } = {
                    pictures: type === 'pictures' ? newElements : this.state.pictures,
                    collages: type === 'collages' ? newElements : this.state.collages,
                    picturesReachedEnd: type === 'pictures' ? !!apiResponse.headers['x-offset-reached-end'] : this.state.picturesReachedEnd,
                    collagesReachedEnd: type === 'collages' ? !!apiResponse.headers['x-offset-reached-end'] : this.state.collagesReachedEnd
                };

                this.setState(newState);

            } catch (error) {
                this.props.screenProps?.toastManagerRef?.current?.openToast({
                    message: i18n.t('app.fetchError'),
                    type: 'error'
                });
                this.setState({
                    loading: false
                }, () => this.animateScene());
                console.log('fetch error', error);
            }
        });
    }

    private onAddPicturePress = async (_: any, index: number): Promise<void> => {
        if (index === 0) {
            // Open camera
            try {
                // @ts-ignore
                const image: CropPickerImage = await ImagePicker.openCamera(this.commonPickerProps);

                // Save image locally (Automatic on Android)
                isIOS && CameraRoll.save(image.path);
                this.sendImage(image);
            } catch (error) {
                console.log(error);
                logEvent('picture_capture_error', {
                    error,
                    from: 'camera'
                });
                this.setState({ loading: false }, () => this.animateScene());
            }
        } else if (index === 1) {
            // Choose from library
            try {
                // @ts-ignore
                const image: CropPickerImage = await ImagePicker.openPicker(this.commonPickerProps);

                this.sendImage(image);
            } catch (error) {
                console.log(error);
                logEvent('picture_capture_error', {
                    error,
                    from: 'library'
                });
                this.setState({ loading: false }, () => this.animateScene());
            }
        }
    }

    private onAddCollagePress = (): void => {
        this.props.navigation.navigate('AddCollage', {
            getMenuOption: () => this.getMenuOption('collages', this.state.pictures?.length),
            pictures: this.state.pictures,
            screenProps: this.props.screenProps,
            onFinishedCallback: this.fetch
        });
    }

    private onTabButtonPress = (type: 'pictures' | 'collages'): void => {
        const newTabIndex = type === 'pictures' ? 0 : 1;

        if (newTabIndex !== this.state.tabIndex) {
            this.setState({ tabIndex: newTabIndex });
            this.animateTabButtonGradient(type);
        }
    }

    private onCarouselItemPress = (type: 'pictures' | 'collages', index: number): void => {
        const image = type === 'pictures' ? this.state.pictures[index] : this.state.collages[index];
        this.props.navigation.navigate('PictureViewer', {
            images: [image],
            deleteButton: true,
            deleteButtonCallback: this.fetch,
            downloadButton: true,
            type
        });
    }

    private updateImageIndex = (slideIndex: number): void => {
        if (this.state.tabIndex === 0) {
            this.setState({ picturesIndex: slideIndex });
        } else {
            this.setState({ collagesIndex: slideIndex });
        }
    }

    private renderItem = ({ item, dataIndex }: { item: ICarouselItem, dataIndex: number }): ReactNode => {
        const { type } = item;
        if (type === 'loader') {
            return (
                <View style={styles.loader}>
                    <Loader color={colors.pink} />
                </View>
            );
        }
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => this.onCarouselItemPress((type as 'pictures' | 'collages'), dataIndex)}
                style={styles.carouselItem}
            >
                { this.itemShadow }
                <FadeInImage
                    containerCustomStyle={styles.carouselItemImage}
                    resizeMode={'cover'}
                    source={{ uri: (item as ICarouselPictureItem)?.thumbnailUrl || (item as ICarouselPictureItem)?.url }}
                />
            </TouchableOpacity>
        );
    }

    private getScene = (type: 'pictures' | 'collages'): JSX.Element => {
        const { pictures, collages, sceneAnimationOpacity } = this.state;
        const isPictures = type === 'pictures';
        const empty = isPictures ? (pictures.length === 0) : (collages.length === 0);

        const animatedSceneStyles = [
            styles.scene,
            { opacity: sceneAnimationOpacity }
        ];

            const topContent = empty ? (
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{ i18n.t('progressPictures.emptyTitle') }</Text>
                    <Text style={styles.subtitle}>{ i18n.t('progressPictures.emptySubtitle') }</Text>
                </View>
            ) : (
                <View style={styles.topContainer}>
                    { this.getDate(type) }
                    <View style={styles.addButtonContainer}>
                        { isPictures ? this.addPictureButton : this.addCollageButton }
                    </View>
                </View>
            );
            return (
                <Animated.View style={animatedSceneStyles}>
                    { topContent }
                    { this.getCarousel(type) }
                </Animated.View>
            );

    }

    private getDate (type: 'pictures' | 'collages'): JSX.Element {
        const { pictures, picturesIndex } = this.state;
        const isPictures = type === 'pictures';

        if (!isPictures) {
            return;
        }

        const isChinese = i18n.locale === LANGUAGES.zhTW.locale;
        const currentPicture = pictures[picturesIndex];
        const isLoaderDisplayed = currentPicture?.type === 'loader';
        let date = (currentPicture as ICarouselPictureItem)?.date;
        date = convertDateToUTC(date);

        const content = isChinese ? (
            <View style={styles.dateContainer}>
                <TextSwap
                    effectDirection={'top'}
                    disablePadding={true}
                    fixedSize={true}
                    label={getFormattedDate(date, 'LL').slice(0, 5)}
                    longestValue={'444444'}
                    numberOfLines={1}
                    style={styles.dateYear}
                    translateValue={10}
                    verticalAlignment={'center'}
                />
                <TextSwap
                    containerStyle={{ padding: 0 }}
                    disablePadding={true}
                    effectDirection={'top'}
                    fixedSize={true}
                    label={getFormattedDate(date, 'MMM')}
                    longestValue={'MMM'}
                    numberOfLines={1}
                    startDelay={100}
                    style={styles.dateMonth}
                    translateValue={10}
                    verticalAlignment={'center'}
                />
                <TextSwap
                    effectDirection={'top'}
                    disablePadding={true}
                    fixedSize={true}
                    label={getFormattedDate(date, 'Do')}
                    longestValue={'4444'}
                    numberOfLines={1}
                    startDelay={200}
                    style={styles.dateDay}
                    translateValue={10}
                    verticalAlignment={'center'}
                />
            </View>
        ) : (
            <View style={styles.dateContainer}>
                <TextSwap
                    containerStyle={{ padding: 0 }}
                    disablePadding={true}
                    effectDirection={'top'}
                    fixedSize={true}
                    label={getFormattedDate(date, 'MMM')}
                    longestValue={'MMM'}
                    numberOfLines={1}
                    style={styles.dateMonth}
                    translateValue={10}
                    verticalAlignment={'center'}
                />
                <TextSwap
                    effectDirection={'top'}
                    disablePadding={true}
                    fixedSize={true}
                    label={getFormattedDate(date, 'D')}
                    longestValue={'444'}
                    numberOfLines={1}
                    startDelay={100}
                    style={styles.dateDay}
                    translateValue={10}
                    verticalAlignment={'center'}
                />
                <TextSwap
                    effectDirection={'top'}
                    disablePadding={true}
                    fixedSize={true}
                    label={getFormattedDate(date, 'YYYY')}
                    longestValue={'4444'}
                    numberOfLines={1}
                    startDelay={200}
                    style={styles.dateYear}
                    translateValue={10}
                    verticalAlignment={'center'}
                />
            </View>
        );

        const editButton = (
            <View style={styles.editDateButtonWrapper} pointerEvents={'none'}>
                <SharedButton
                    borderRadius={addCollagesStyles.editButton.borderRadius}
                    color={'pink'}
                    containerStyle={[addCollagesStyles.editButton, styles.editDateButton]}
                    icon={CALENDAR_ICON}
                    iconStyle={addCollagesStyles.editButtonIcon}
                    shadowProps={{
                        borderRadius: addCollagesStyles.editButton.borderRadius,
                        horizontalOffset: 0,
                        style: { bottom: 10, left: 5, right: 5 },
                        verticalOffset: 12
                    }}
                    style={addCollagesStyles.editButtonInner}
                    withShadow={true}
                />
            </View>
        );

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.chooseDate(date)}
                style={styles.date}
            >
                { content }
                { !isLoaderDisplayed && editButton }
            </TouchableOpacity>
        );
    }

    private getMenuOption (type: 'pictures' | 'collages', picturesLength?: number): string[] {
        const isPictures = type === 'pictures';

        const options = [
            i18n.t('progressPictures.takePicture'),
            i18n.t('progressPictures.choosePicture')
        ];

        // On collages we also get to option to choose from a previous progress picture if at least one is available
        !isPictures && picturesLength > 0 && options.push(i18n.t('progressPictures.selectPreviousPicture'));

        return options;
    }

    private getCarousel = (type: 'pictures' | 'collages'): JSX.Element => {

        if (this.state.loading) {
            return this.loader;
        }

        const { pictures, collages, collagesReachedEnd, picturesReachedEnd } = this.state;
        const isPictures = type === 'pictures';
        const isEndReached = (type === 'pictures' && picturesReachedEnd) || (type === 'collages' && collagesReachedEnd);
        const data = isPictures ? pictures : collages;
        const ref = isPictures ? this.pictureCarouselRef : this.collageCarouselRef;
        const carouselOptimizationProps = {
            initialNumToRender: 5,
            maxToRenderPerBatch: 5,
            updateCellsBatchingPeriod: 1000,
            windowSize: 11
        };

        if (data.length > 0) {
            return (
                <Carousel
                    { ...carouselOptimizationProps }
                    activeSlideAlignment={'center'}
                    containerCustomStyle={styles.carousel}
                    data={data}
                    onScrollIndexChanged={this.updateImageIndex}
                    onEndReached={!isEndReached ? () => this.onEndReached(type) : undefined}
                    onEndReachedThreshold={0.5}
                    // onSnapToItem={this.updateImageIndex}
                    inactiveSlideOpacity={0.35}
                    itemWidth={CAROUSEL_ITEM_WIDTH}
                    layout={isIOS ? 'stack' : undefined}
                    ref={ref}
                    // @ts-ignore
                    renderItem={this.renderItem}
                    sliderWidth={CAROUSEL_WIDTH}
                />
            );
        }

        const placeholderContent = (
            <View style={styles.carouselPlaceholderInner}>
                <View style={styles.carouselPlaceholderBorder} />
                <View style={styles.carouselPlaceholderItem}>
                    { this.itemShadow }
                    <View style={styles.carouselPlaceholderItemInner}>
                        <View style={styles.carouselPlaceholderItemContent}>
                            <FadeInImage
                                containerCustomStyle={styles.carouselPlaceholderItemIcon}
                                resizeMode={'contain'}
                                source={CAMERA_ADD_ICON}
                                tintColor={styles.carouselPlaceholderItemIcon.tintColor}
                            />
                            <Text style={styles.carouselPlaceholderItemSubtitle}>
                                { i18n.t('progressPictures.placeholderCarouselSubtitle') }
                            </Text>
                            <Text style={styles.carouselPlaceholderItemTitle}>
                                { i18n.t(`progressPictures.${isPictures ? 'picture' : 'collage'}`) }
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );

        if (isPictures) {
            return (
                <NativeSelectionMenu
                    onPress={this.onAddPicturePress}
                    options={this.getMenuOption(type)}
                    style={styles.carouselPlaceholder}
                >
                    { placeholderContent }
                </NativeSelectionMenu>
            );
        } else {
            return (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={this.onAddCollagePress}
                    style={styles.carouselPlaceholder}
                >
                    { placeholderContent }
                </TouchableOpacity>
            );
        }
    }

    private getTabButton (type: 'pictures' | 'collages', selected: boolean): JSX.Element {
        const {
            collagesTabButtonAnimationOpacity,
            collagesTabButtonAnimationTransform,
            collagesTabButtonGradientAnimationOpacity,
            picturesTabButtonAnimationOpacity,
            picturesTabButtonAnimationTransform,
            picturesTabButtonGradientAnimationOpacity
        } = this.state;

        const isPictures = type === 'pictures';
        const animationOpacity = isPictures ? picturesTabButtonAnimationOpacity : collagesTabButtonAnimationOpacity;
        const animationTransform = isPictures ? picturesTabButtonAnimationTransform : collagesTabButtonAnimationTransform;
        const animatedButtonStyles = [
            styles.tabButton,
            {
                opacity: animationOpacity,
                transform: [
                    {
                        translateY: animationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 300]
                        })
                    }
                ]
            }
        ];

        const borderColor = selected ?
            styles.tabButtonSelected.borderColor :
            (type === 'pictures' ? styles.tabButtonPictures.borderColor : styles.tabButtonCollages.borderColor);
        const buttonIconTintColor = selected ?
            styles.tabButtonIconSelected.tintColor :
            (type === 'pictures' ? styles.tabButtonIconPictures.tintColor : styles.tabButtonIconCollages.tintColor);

        const buttonBorderColor = [
            styles.tabButtonBackgroundBorder,
            { borderColor }
        ];
        const buttonLabelStyles = [
            styles.tabButtonLabel,
            type === 'pictures' ? styles.tabButtonLabelPictures : styles.tabButtonLabelCollages,
            selected ? styles.tabButtonLabelSelected : {}
        ];
        const buttonIconStyles = [
            styles.tabButtonIcon,
            type === 'pictures' ? styles.tabButtonIconPictures : styles.tabButtonIconCollages,
            selected ? styles.tabButtonIconSelected : {}
        ];

        const gradientAnimatedStyles = [
            styles.tabButtonGradientContainer,
            { opacity: isPictures ? picturesTabButtonGradientAnimationOpacity : collagesTabButtonGradientAnimationOpacity
            }
        ];

        return (
            <Animated.View style={animatedButtonStyles}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => this.onTabButtonPress(type)}
                    style={styles.tabButtonInner}
                >
                    <View style={styles.tabButtonBackground}>
                        <View style={buttonBorderColor} />
                        <Animated.View style={gradientAnimatedStyles}>
                            <LinearGradient
                                angle={170}
                                colors={TAB_BUTTON_GRADIENT_COLORS}
                                style={styles.tabButtonGradient}
                                useAngle={true}
                            />
                        </Animated.View>
                    </View>
                    <View style={styles.tabButtonLabelContainer}>
                        <FadeInImage
                            containerCustomStyle={buttonIconStyles}
                            resizeMode={'contain'}
                            source={type === 'pictures' ? CAMERA_ICON : COLLAGE_ICON}
                            tintColor={buttonIconTintColor}
                        />
                        <Text style={buttonLabelStyles}>
                            {
                                type === 'pictures' ?
                                i18n.t('progressPictures.picturesButton') :
                                i18n.t('progressPictures.collagesButton')
                            }
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    private get loader (): JSX.Element {
        return (
            <View style={styles.loader}>
                <Loader color={colors.pink} />
            </View>
        );
    }

    private get tabButtons (): JSX.Element {
        const picturesSelected = this.state.tabIndex === 0;

        return (
            <View style={styles.tabButtonContainer}>
                { this.getTabButton('pictures', picturesSelected) }
                { this.getTabButton('collages', !picturesSelected) }
            </View>
        );
    }

    private get addPictureButton (): JSX.Element {
        return (
            <View style={styles.addButton}>
                <View style={styles.addButtonBorder} />
                <NativeSelectionMenu
                    onPress={this.onAddPicturePress}
                    options={this.getMenuOption('pictures')}
                >
                    <View style={styles.addButtonInner}>
                        <LinearGradient
                            angle={170}
                            colors={ADD_BUTTON_GRADIENT_COLORS}
                            style={styles.tabButtonGradient}
                            useAngle={true}
                        />
                        <FadeInImage
                            containerCustomStyle={styles.addButtonIcon}
                            resizeMode={'contain'}
                            source={CAMERA_ADD_ICON}
                        />
                        <View style={styles.addButtonTitleContainer}>
                            <Text style={styles.addButtonTitleTop}>
                                { i18n.t('progressPictures.addButton')}
                            </Text>
                            <Text style={styles.addButtonTitleBottom}>
                                { i18n.t('progressPictures.picture')}
                            </Text>
                        </View>
                    </View>
                </NativeSelectionMenu>
            </View>
        );
    }

    private get addCollageButton (): JSX.Element {
        return (
            <View style={styles.addButton}>
                <View style={styles.addButtonBorder} />
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.onAddCollagePress}
                >
                    <View style={styles.addButtonInner}>
                        <LinearGradient
                            angle={170}
                            colors={ADD_BUTTON_GRADIENT_COLORS}
                            style={styles.tabButtonGradient}
                            useAngle={true}
                        />
                        <FadeInImage
                            containerCustomStyle={styles.addButtonIcon}
                            resizeMode={'contain'}
                            source={CAMERA_ADD_ICON}
                        />
                        <View style={styles.addButtonTitleContainer}>
                            <Text style={styles.addButtonTitleTop}>
                                { i18n.t('progressPictures.addButton')}
                            </Text>
                            <Text style={styles.addButtonTitleBottom}>
                                { i18n.t('progressPictures.collage')}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    private get itemShadow (): JSX.Element {
        return (
            <DiffuseShadow
                borderRadius={40}
                shadowOpacity={0.22}
                verticalOffset={25}
            />
        );
    }

    public render (): JSX.Element {
        const { backgroundAnimationOpacity,
            backgroundAnimationTransform,
            dateToEdit,
            routes,
            showDateTimePicker,
            tabIndex
        } = this.state;
        const backgroundAnimatedStyle = [
            styles.backgroundImage,
            {
                opacity: backgroundAnimationOpacity,
                transform: [
                    {
                        translateX: backgroundAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, viewportWidth]
                        })
                    }
                ]
            }
        ];

        return (
            <View style={styles.container}>
                <Animated.View style={backgroundAnimatedStyle}>
                    <BackgroundImage width={BACKGROUND_WIDTH} height={BACKGROUND_HEIGHT} />
                </Animated.View>
                <HeaderSpacer />
                <Header mode={'menu'} />
                <TabView
                    lazy={true}
                    navigationState={{ index: tabIndex, routes: routes }}
                    onIndexChange={(index: number) => this.setState({ tabIndex: index })}
                    renderLazyPlaceholder={() => this.loader}
                    renderScene={({ route }: { route: { key: string, title: string } }) => {
                        switch (route.key) {
                            case 'pictures':
                                return this.getScene('pictures');
                            case 'collages':
                                return this.getScene('collages');
                            default:
                                return null;
                        }
                    }}
                    renderTabBar={() => null} // Hide TabBar
                    swipeEnabled={false}
                />
                { this.tabButtons }
                {/* On iOS we use a custom popup, Android has it's own native popup */}
                {
                    isAndroid && showDateTimePicker && (
                        <DateTimePicker
                            value={dateToEdit}
                            onChange={this.onDateChange}
                            locale={i18n.locale}
                        />
                    )
                }
            </View>
        );
    }
}

export default ProgressPictures;
