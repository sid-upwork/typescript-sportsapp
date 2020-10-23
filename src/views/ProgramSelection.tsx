import React, { Component, Fragment } from 'react';
import { View, ScrollView, Easing, Animated, BackHandler, NativeEventSubscription } from 'react-native';
import { AxiosResponse } from 'axios';
import { ENDPOINTS } from '../utils/endpoints';
import { connect } from 'react-redux';
import { IReduxState } from '../store/reducers';
import { fetchProfile } from '../store/modules/userProfile';
import { IInfluencer } from '../types/user';
import { IProgram } from '../types/program';
import { IScreenProps } from '../index';
import { get, sortBy } from 'lodash';
import { refreshInfluencers } from '../utils/influencers';
import delays from '../utils/animDelays';
import api from '../utils/api';
import i18n from '../utils/i18n';
import { isAndroid } from '../utils/os';
import chroma from 'chroma-js';

import BackgroundBottomImage from '../static/ProgramSelection/background-bottom.svg';
import BackgroundTopImage from '../static/ProgramSelection/background-top.svg';
import ErrorMessage from '../components/ErrorMessage';
import FadeInImage from '../components/FadeInImage';
import Header from '../components/Header';
import HeaderSpacer from '../components/HeaderSpacer';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import PostRegistrationChooseProgram from '../components/Popups/PostRegistrationChooseProgram';
import ProgramThumbnail from '../components/ProgramSelection/ProgramThumbnail';
import SharedParallaxView from '../components/SharedParallaxView';
import SharedVerticalTitle from '../components/SharedVerticalTitle';

import colors from '../styles/base/colors.style';
import { viewportWidth, viewportHeight, statusBarOffset, baseHeaderHeight } from '../styles/base/metrics.style';
import { TITLE_CONTAINER_WIDTH } from '../styles/components/SharedVerticalTitle.style';
import { CHOOSE_PROGRAM_POPUP_HEIGHT, CHOOSE_PROGRAM_POPUP_WIDTH } from '../styles/components/Popups/PostRegistrationChooseProgram.style';
import styles, {
    BACKGROUND_BOTTOM_WIDTH,
    BACKGROUND_BOTTOM_HEIGHT,
    LIST_HEADER_HEIGHT,
    LIST_HEADER_IMAGE_WIDTH
} from '../styles/views/ProgramSelection.style';

import ListHeaderBackgroundImage from '../static/ProgramSelection/list-header-background.svg';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const SHAPE_SOURCES = {
    candice: require('../static/ProgramSelection/shape-candice.png'),
    hana: require('../static/ProgramSelection/shape-hana.png'),
    may: require('../static/ProgramSelection/shape-may.png'),
    yalan: require('../static/ProgramSelection/shape-yalan.png')
};

interface IThumbnailSorter {
    element: JSX.Element;
    level: number;
    title: string;
}

interface IProps {
    fetchProfile: () => Promise<void>;
    currentInfluencer: IInfluencer;
    influencers: IInfluencer[];
    navigation: any;
    lastTouchId: string;
    screenProps: IScreenProps;
}

interface IState {
    backgroundAnimationOpacity: Animated.Value;
    backgroundAnimationTransform: Animated.Value;
    backgroundTitleAnimationOpacity: Animated.Value;
    backgroundTitleAnimationTransform: Animated.Value;
    fetchErrors: boolean[];
    listHeaderAnimationOpacity: Animated.Value;
    listHeaderAnimationTransform: Animated.Value;
    loaderAnimationOpacity: Animated.Value;
    programs: IProgram[][];
    programThumbnails: JSX.Element[][];
    programThumbnailsReady: boolean;
}

class ProgramSelection extends Component<IProps, IState> {

    private touchId: string;
    private backHandler: NativeEventSubscription;
    private firstItem: number;
    private hideHeader: boolean;
    private isFirstOpening: boolean;
    private horizontalScrollViewRef: React.RefObject<any>;
    private onAnimatedScroll: () => void;
    private sortedInfluencers: IInfluencer[];
    private scrollHintEndTimeout: any;
    private scrollHintStartTimeout: any;
    private scrollX: Animated.Value = new Animated.Value(0);
    private userStartedScrollingHorizontally: boolean;

    constructor (props: IProps) {
        super(props);
        this.state = {
            backgroundAnimationOpacity: new Animated.Value(0),
            backgroundAnimationTransform: new Animated.Value(1),
            backgroundTitleAnimationOpacity: new Animated.Value(0),
            backgroundTitleAnimationTransform: new Animated.Value(1),
            fetchErrors: [],
            listHeaderAnimationOpacity: new Animated.Value(0),
            listHeaderAnimationTransform: new Animated.Value(1),
            loaderAnimationOpacity: new Animated.Value(0),
            programs: [],
            programThumbnails: [],
            programThumbnailsReady: false
        };
        this.isFirstOpening = props.navigation.getParam('isFirstOpening');
        this.hideHeader = props.navigation.getParam('hideHeader');
        this.touchId = props.lastTouchId || props.navigation.getParam('lastTouchId');
        this.horizontalScrollViewRef = React.createRef();
        this.onAnimatedScroll = Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.scrollX } } }],
            { useNativeDriver: true }
        );
        this.userStartedScrollingHorizontally = false;

        // Sort influencers in a reverse alphabetical order
        this.orderInfluencers(props.influencers);

        // Display the relevant influencer's list
        // Will be based on the current influencer (or the original one the very first time)
        const defaultIndex = this.sortedInfluencers.findIndex((influencer: IInfluencer) => {
            return influencer.influencerLinkId?.toLowerCase() === 'candice';
        }) || 0;

        if (props.currentInfluencer) {
            const influencerIndex = this.sortedInfluencers.findIndex((influencer: IInfluencer) => {
                return influencer.influencerLinkId?.toLowerCase() === props.currentInfluencer.influencerLinkId?.toLowerCase();
            });

            this.firstItem = typeof influencerIndex === 'number' && influencerIndex !== -1 ? influencerIndex : defaultIndex;
        } else if (this.touchId) {
            const influencerIndex = this.sortedInfluencers.findIndex((influencer: IInfluencer) => {
                return influencer.influencerLinkId?.toLowerCase() === this.touchId?.toLowerCase();
            });

            this.firstItem = typeof influencerIndex === 'number' && influencerIndex !== -1 ? influencerIndex : defaultIndex;
        } else {
            this.firstItem = defaultIndex;
        }
    }

    public async componentDidMount (): Promise<void> {
        // Manage hardware back button (this will overload the listener in AppDrawer)
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        this.scrollToFirstItem();
        this.openPostRegistrationPopup();

        await this.props.fetchProfile();
        this.fetchPrograms();

        this.animateBackground();
        this.animateBackgroundTitle();
        this.animateListHeader();
        this.animateLoader();
    }

    public componentDidUpdate (prevProps: IProps, prevState: IState): void {
        if (this.state.programThumbnailsReady && !prevState.programThumbnailsReady) {
            if (!this.isFirstOpening) {
                // Will be done after the modal is closed on first opening
                this.animateScrollHint();
            }
        }

        if (prevProps.influencers !== this.props.influencers) {
            this.orderInfluencers(this.props.influencers);
            this.fetchPrograms();
        }
    }

    public componentWillUnmount (): void {
        clearTimeout(this.scrollHintStartTimeout);
        clearTimeout(this.scrollHintEndTimeout);
        this.backHandler.remove();
    }

    private handleBackPress = (): boolean => {
        const popupManager = this.props.screenProps.popupManagerRef?.current;

        // If there is a popup opened we dismiss it
        if (popupManager && popupManager.currentPopup && !popupManager.currentPopup?.preventOverlayDismissal) {
            popupManager.dismissPopup();
            return true;
        }

        if (!this.hideHeader) {
            this.props.navigation.replace('Training');
            return true;
        }
    }

    private openPostRegistrationPopup = (): void => {
        if (!this.isFirstOpening) {
            return;
        }
        // Open the "post-registration" popup
        this.props.screenProps?.popupManagerRef?.current?.requestPopup({
            backgroundColors: ['white'],
            backgroundType: 'color',
            borderRadius: 36,
            closeButtonBackgroundColor: colors.pink,
            ContentComponent: PostRegistrationChooseProgram,
            height: CHOOSE_PROGRAM_POPUP_HEIGHT,
            onClose: () => {
                this.animateScrollHint();
            },
            scrollView: true,
            width: CHOOSE_PROGRAM_POPUP_WIDTH
        });
    }

    private async fetchPrograms (): Promise<void> {
        let programs: IProgram[][] = [];
        let fetchErrors: boolean[] = [];
        for (let i = 0; i < this.sortedInfluencers.length; i++) {
            try {
                const programsResponse: AxiosResponse = await api.get(
                    ENDPOINTS.programs + '?authorId=' + this.sortedInfluencers[i].id
                );

                programs.push(programsResponse.data);
                fetchErrors.push(false);
            } catch (error) {
                console.log('fetch error', error);
                programs.push([]);
                fetchErrors.push(true);
            }
        }

        this.setState({ programs, fetchErrors }, () => this.prepareProgramsForRender());
    }

    private retryFetchPrograms = (): void => {
        this.setState({
            programThumbnailsReady: false,
            fetchErrors: []
        }, () => {
            this.state.loaderAnimationOpacity.setValue(0);
            this.animateLoader();
            this.fetchPrograms();
        });
    }

    private onScrollBeginDrag = (): void => {
        if (!this.userStartedScrollingHorizontally) {
            this.userStartedScrollingHorizontally = true;
        }
    }

    private scrollToFirstItem (): void {
        const horizontalScrollView = this.horizontalScrollViewRef?.current;
        setTimeout(() => {
            horizontalScrollView && horizontalScrollView.scrollTo && horizontalScrollView.scrollTo({
                x: this.firstItem * viewportWidth,
                y: 0,
                animated: false
            });
        }, 1);
    }

    private animateBackground (): void {
        const { backgroundAnimationOpacity, backgroundAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.programSelection.backgroundApparition),
            Animated.parallel([
                Animated.timing(backgroundAnimationOpacity, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(backgroundAnimationTransform, {
                    toValue: 0,
                    speed: 6,
                    bounciness: 8,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateListHeader (): void {
        const { listHeaderAnimationOpacity, listHeaderAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.programSelection.listHeaderApparition),
            Animated.parallel([
                Animated.timing(listHeaderAnimationOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(listHeaderAnimationTransform, {
                    toValue: 0,
                    speed: 10,
                    bounciness: 5,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateBackgroundTitle (): void {
        const { backgroundTitleAnimationOpacity, backgroundTitleAnimationTransform } = this.state;

        Animated.sequence([
            Animated.delay(delays.views.programSelection.listHeaderApparition),
            Animated.parallel([
                Animated.timing(backgroundTitleAnimationOpacity, {
                    toValue: 1,
                    duration: 200,
                    easing: Easing.linear,
                    isInteraction: false,
                    useNativeDriver: true
                }),
                Animated.spring(backgroundTitleAnimationTransform, {
                    toValue: 0,
                    speed: 10,
                    bounciness: 5,
                    isInteraction: false,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }

    private animateLoader (): void {
        Animated.timing(this.state.loaderAnimationOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        }).start();
    }

    private animateScrollHint (): void {
        const horizontalScrollView = this.horizontalScrollViewRef?.current;

        // Visually hint the user that he can scroll horizontally
        if (horizontalScrollView) {
            const hintX = 120 * (this.firstItem === this.sortedInfluencers.length - 1 ? -1 : 1);
            this.scrollHintStartTimeout = setTimeout(() => {
                // We make sure that the user hasn't started scrolling before showing the hint
                if (this.userStartedScrollingHorizontally) {
                    return;
                }
                horizontalScrollView && horizontalScrollView.scrollTo && horizontalScrollView.scrollTo({
                    x: this.firstItem * viewportWidth + hintX,
                    y: 0,
                    animated: true
                });
                this.scrollHintEndTimeout = setTimeout(() => {
                    horizontalScrollView && horizontalScrollView.scrollTo && horizontalScrollView.scrollTo({
                        x: this.firstItem * viewportWidth,
                        y: 0,
                        animated: true
                    });
                }, 350);
            }, 1000);
        }
    }

    private shouldAnimateSlide (index: number): boolean {
        return index === this.firstItem;
    }

    private orderInfluencers (influencers: IInfluencer[]): void {
        // Reorder influencers based on position then first name
        this.sortedInfluencers = sortBy(influencers, [
            (influencer: IInfluencer): number => influencer.influencerPosition,
            (influencer: IInfluencer): string => influencer.firstName
        ]);
    }

    private prepareProgramsForRender (): void {
        // We can't render this synchronously because it takes too much time.
        // So we render a loader while this is being executed.
        let programThumbnails: JSX.Element[][] = [];

        this.state.programs.forEach((programs: IProgram[], influencerIndex: number) => {
            let thumbnails: JSX.Element[] = [];
            let thumbnailsSorter: IThumbnailSorter[] = [];

            programs.forEach((program: IProgram, programIndex: number) => {
                const element = (
                    <ProgramThumbnail
                        animate={this.shouldAnimateSlide(influencerIndex)}
                        index={programIndex}
                        influencer={this.sortedInfluencers[influencerIndex]}
                        isFirstOpening={this.isFirstOpening}
                        key={`program-thumbnail-${influencerIndex}-${programIndex}`}
                        program={program}
                        screenProps={this.props.screenProps}
                    />
                );
                thumbnailsSorter.push({
                    element,
                    level: program?.level,
                    title: program?.title
                });
            });

            // We need to sort thumbnails by leveldifficulty and can only do that in the front end for now
            const sortedThumbnails = sortBy(
                thumbnailsSorter,
                [
                    (o: IThumbnailSorter): number => o?.level,
                    (o: IThumbnailSorter): string => o?.title
                ],
                ['asc', 'asc']
            );

            sortedThumbnails.forEach((infos: IThumbnailSorter, index: number) => {
                thumbnails.push(infos?.element);
            });

            programThumbnails.push(thumbnails);
        });

        this.setState({ programThumbnails, programThumbnailsReady: true });
    }

    private getListBackground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        return (
            <View style={styles.listBackground}>
                { this.getListBackgroundBottom(animatedValue) }
                { this.getListBackgroundTitle() }
            </View>
        );
    }

    private getListBackgroundTitle (): JSX.Element {
        const { backgroundTitleAnimationOpacity, backgroundTitleAnimationTransform } = this.state;
        const title: string = i18n.t('programSelection.chooseYourProgram');

        const animatedStyle = [
            styles.listBackgroundTitle,
            {
                opacity: backgroundTitleAnimationOpacity,
                transform: [
                    {
                        translateX: backgroundTitleAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -50]
                        })
                    }
                ]
            }
        ];

        return (
            <Animated.View style={animatedStyle}>
                <SharedVerticalTitle
                    height={viewportHeight - LIST_HEADER_HEIGHT - 5}
                    title={title}
                    width={TITLE_CONTAINER_WIDTH}
                />
            </Animated.View>
        );
    }

    private getListBackgroundBottom (animatedValue: Animated.Value): JSX.Element {
        const animatedStyle = {
            flex: 1,
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.5],
                outputRange: [0, 0.5],
                extrapolate: 'clamp'
            }),
            transform: [
                {
                    translateX: animatedValue.interpolate({
                        inputRange: [0, viewportHeight],
                        outputRange: [-50, 0],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };

        return (
            <Animated.View style={animatedStyle}>
                <BackgroundBottomImage
                    height={BACKGROUND_BOTTOM_HEIGHT}
                    style={styles.listBackgroundImage}
                    width={BACKGROUND_BOTTOM_WIDTH}
                />
            </Animated.View>
        );
    }

    private getListForeground = ({ animatedValue }: { animatedValue: Animated.Value; }): JSX.Element => {
        const animatedStyle = {
            opacity: animatedValue.interpolate({
                inputRange: [0, viewportHeight * 0.5],
                outputRange: [0, 1],
                extrapolate: 'clamp'
            })
        };

        const overlayColors: string[] = [
            chroma(colors.violetDark).darker(1).alpha(0.5).css(),
            chroma(colors.violetDark).darker(1).alpha(0).css()
        ];

        return (
            <Animated.View
                pointerEvents={'none'}
                style={[animatedStyle, styles.listForegroundGradientContainer]}
            >
                <LinearGradient
                    colors={overlayColors}
                    locations={[0, 1]}
                    style={styles.listForegroundGradient}
                />
            </Animated.View>
        );
    }

    private getListContent (influencerIndex: number): JSX.Element[] | JSX.Element {
        const animatedLoaderStyle = [
            styles.loader,
            {
                opacity: this.state.loaderAnimationOpacity
            }
        ];

        if (this.state.programThumbnailsReady) {
            if (this.state.fetchErrors[influencerIndex]) {
                return (
                    <View style={styles.errorContainer}>
                        <ErrorMessage
                            retry={this.retryFetchPrograms}
                            toastManagerRef={this.props.screenProps?.toastManagerRef}
                        />
                    </View>
                );
            } else {
                return this.state.programThumbnails[influencerIndex];
            }
        } else {
            return (
                <Animated.View style={animatedLoaderStyle}>
                    <Loader color={colors.violetDark} />
                </Animated.View>
            );
        }
    }

    private get background (): JSX.Element {
        const { backgroundAnimationOpacity, backgroundAnimationTransform } = this.state;
        const backgroundAnimatedStyle = {
            opacity: backgroundAnimationOpacity,
            transform: [
                {
                    scaleY: backgroundAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 3]
                    })
                },
                {
                    scaleX: backgroundAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2]
                    })
                },
                {
                    translateY: backgroundAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -100]
                    })
                },
                {
                    translateX: backgroundAnimationTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 50]
                    })
                }
            ]
        };
        const backgroundTopStyles = [
            styles.backgroundTop,
            { top: -baseHeaderHeight + statusBarOffset - 20  }
        ];

        return (
            <Animated.View style={backgroundAnimatedStyle}>
                <BackgroundTopImage style={backgroundTopStyles} />
            </Animated.View>
        );
    }

    private get listHeader (): JSX.Element {
        const { listHeaderAnimationOpacity, listHeaderAnimationTransform } = this.state;
        const headers: JSX.Element[] = this.sortedInfluencers.map((influencer: IInfluencer, index: number) => {
            // We use different input ranges to animate the header coming in form the right,
            // Or going out to the left
            const inputRangeIn = [viewportWidth * (index - 1), viewportWidth * index];
            const inputRangeOut = [viewportWidth * index, viewportWidth * (index + 1)];

            // Apparition
            const containerAnimatedStyle = {
                ...styles.listHeader,
                zIndex: index, // this.sortedInfluencers.length - index,
                opacity: listHeaderAnimationOpacity,
                transform: [
                    {
                        translateX: listHeaderAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 200]
                        })
                    },
                    {
                        scale: listHeaderAnimationTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.7]
                        })
                    }
                ]
            };
            // Parallax
            const containerInnerAnimatedStyle = {
                ...styles.listHeaderInner,
                opacity: this.scrollX.interpolate({
                    inputRange: inputRangeOut,
                    outputRange: [1, 0.35],
                    extrapolate: 'clamp'
                }),
                transform: [
                    {
                        translateX: this.scrollX.interpolate({
                            inputRange: inputRangeOut,
                            outputRange: [0, viewportWidth - LIST_HEADER_IMAGE_WIDTH + Math.round(viewportWidth * 0.13)],
                            extrapolate: 'clamp'
                        })
                    },
                    {
                        translateY: this.scrollX.interpolate({
                            inputRange: inputRangeOut,
                            outputRange: [0, -LIST_HEADER_HEIGHT * 0.3],
                            extrapolate: 'clamp'
                        })
                    },
                    {
                        scale: this.scrollX.interpolate({
                            inputRange: inputRangeOut,
                            outputRange: [1, 0.55],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            };
            const backgroundImageAnimatedStyle = {
                transform: [
                    {
                        scale: this.scrollX.interpolate({
                            inputRange: inputRangeIn,
                            outputRange: [0.7, 1],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            };
            const nameAnimatedStyle = {
                ...styles.listHeaderName,
                transform: [
                    {
                        translateX: this.scrollX.interpolate({
                            inputRange: inputRangeIn,
                            outputRange: [viewportWidth * 0.5, 0],
                            extrapolate: 'clamp'
                        })
                    },
                    {
                        translateX: this.scrollX.interpolate({
                            inputRange: inputRangeOut,
                            outputRange: [0, viewportWidth * 0.1],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            };
            const imageAnimatedStyle = {
                transform: [
                    {
                        translateX: this.scrollX.interpolate({
                            inputRange: inputRangeIn,
                            outputRange: [viewportWidth * 0.3, 0],
                            extrapolate: 'clamp'
                        })
                    },
                    {
                        rotate: this.scrollX.interpolate({
                            inputRange: inputRangeOut,
                            outputRange: ['0deg', '-30deg'],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            };

            // Use PNG images instead of custom SVG to prevent crashes on some Android devices
            const backgroundShape = isAndroid ? (
                <FadeInImage
                    resizeMode={'contain'}
                    source={SHAPE_SOURCES[influencer?.firstName?.toLowerCase() || 'candice']}
                    style={styles.listHeaderBackgroundImage}
                />
            ) : (
                <ListHeaderBackgroundImage
                    // @ts-ignore
                    programSelectionGradientFill1={influencer?.primaryColor}
                    programSelectionGradientFill2={influencer?.secondaryColor}
                    style={styles.listHeaderBackgroundImage}
                    width={styles.listHeaderBackgroundImage.width}
                    height={styles.listHeaderBackgroundImage.height}
                />
            );

            return (
                <Animated.View key={`program-selection-list-header-${index}`} style={containerAnimatedStyle}>
                    <Animated.View style={containerInnerAnimatedStyle}>
                        <Animated.View style={backgroundImageAnimatedStyle} >
                            { backgroundShape }
                        </Animated.View>
                        <Animated.Text style={nameAnimatedStyle}>{influencer?.firstName}</Animated.Text>
                        <Animated.View style={[styles.listHeaderImage, imageAnimatedStyle]}>
                            <FadeInImage
                                resizeMode={'contain'}
                                source={{ uri: get(influencer, 'picture.url') }}
                                style={styles.fullSpace}
                            />
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            );
        });

        const animatedStyle = {
            transform: [
                {
                    translateX: this.scrollX.interpolate({
                        inputRange: [0, viewportWidth * this.sortedInfluencers.length],
                        outputRange: [0, -viewportWidth * this.sortedInfluencers.length],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };

        return (
            <Animated.View style={animatedStyle}>
                <HeaderSpacer />
                <View style={styles.listHeaderContainer}>
                    { headers }
                </View>
            </Animated.View>
        );
    }

    private get lists (): JSX.Element[] | JSX.Element {
        if (this.sortedInfluencers.length === 0) {
            return (
                <View style={{ width: viewportWidth, paddingHorizontal: 20 }}>
                    <ErrorMessage
                        retry={refreshInfluencers}
                        toastManagerRef={this.props.screenProps?.toastManagerRef}
                    />
                </View>
            );
        }

        let lists: JSX.Element[] = [];

        this.sortedInfluencers.forEach((_: any, influencerIndex: number) => {
            lists.push(
                <View key={`program-selection-list-${influencerIndex}`} style={styles.list}>
                    <SharedParallaxView
                        contentContainerStyle={styles.listInner}
                        renderBackground={this.getListBackground}
                        renderForeground={this.getListForeground}
                        showsVerticalScrollIndicator={false}
                        style={{ overflow: 'visible' }}
                    >
                        { this.getListContent(influencerIndex) }
                    </SharedParallaxView>
                </View>
            );
        });

        return lists;
    }

    private get header (): JSX.Element {
        if (this.hideHeader) {
            return null;
        }
        const handle = null; // isIOS ? <GrabHandle color={'white'} /> : null;
        return (
            <Fragment>
                { handle }
                <Header mode={'closePink'} />
            </Fragment>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                { this.background }
                { this.listHeader }
                <AnimatedScrollView
                    contentContainerStyle={styles.scrollViewInner}
                    decelerationRate={'fast'}
                    horizontal={true}
                    onScroll={this.onAnimatedScroll}
                    onScrollBeginDrag={this.onScrollBeginDrag}
                    overScrollMode={'never'}
                    ref={this.horizontalScrollViewRef}
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    snapToAlignment={'center'}
                    snapToInterval={viewportWidth}
                    style={styles.scrollView}
                >
                    { this.lists }
                </AnimatedScrollView>
            { this.header }
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    currentInfluencer: state.influencers?.currentInfluencer,
    influencers: state.influencers?.influencers,
    lastTouchId: state.userProfile?.lastTouchId
});

export default connect(mapStateToProps, { fetchProfile })(ProgramSelection);
