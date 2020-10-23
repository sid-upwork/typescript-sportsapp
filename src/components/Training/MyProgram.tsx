import React, { Component, Fragment } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';
import { findIndex, isEqual, orderBy } from 'lodash';
import { AxiosResponse } from 'axios';
import { IReduxState } from '../../store/reducers';
import { ENDPOINTS } from '../../utils/endpoints';
import delays from '../../utils/animDelays';
import api from '../../utils/api';
import I18n from '../../utils/i18n';
import { isAndroid } from '../../utils/os';
import { fetchProgression, fetchActiveProgramId } from '../../utils/progression';
import { IProgram, IWeekItem, IWeek } from '../../types/program';
import { IWorkoutHistory } from '../../types/progression';
import { IProgressionState } from '../../store/modules/progression';
import { ETooltipIds } from '../../store/modules/tutorials';
import { IScreenProps } from '../../index';

import ErrorMessage from '../ErrorMessage';
import Loader from '../Loader';
import MyProgramEntry from './MyProgramEntry';
import MyProgramFakeEntry from './MyProgramFakeEntry';
import ProgramManagement from '../Popups/ProgramManagement';
import SharedVerticalTitle from '../SharedVerticalTitle';
import Tooltip from '../Tooltip';

import colors from '../../styles/base/colors.style';
import programManagementStyles, { MANAGE_POPUP_HEIGHT } from '../../styles/components/Popups/ProgramManagement.style';
import styles, {
    CAROUSEL_HEIGHT,
    MY_PROGRAM_LEFT_CONTAINER_WIDTH,
    ITEM_CONTAINER_WIDTH,
    ITEM_CONTAINER_MARGIN_RIGHT,
    TOP_RIGHT_CONTAINER_PADDING_RIGHT,
    WEEKS_CIRCLE_SIZE
} from '../../styles/components/Training/MyProgram.style';

interface IProps {
    containerStyle?: any;
    progression: IProgressionState;
    navigation: any;
    onOpen?: () => void;
    onClose?: () => void;
    screenProps: IScreenProps;
}

interface IState {
    isReady: boolean;
    weekItems: any[];
    renderScrollViewPlaceholder: boolean;
    animInfosOpacity: Animated.Value;
    animInfosTransform: Animated.Value;
    animLabelOpacity: Animated.Value;
    animLabelTransform: Animated.Value;
    animPlaceholderOpacity: Animated.Value;
    animScrollViewOpacity: Animated.Value;
    animScrollViewTransform: Animated.Value;
    animWeekOpacity: Animated.Value;
    animWeekTransform: Animated.Value;
    fetchError: boolean;
}

const SCROLLVIEW_ANIMATION_DURATION = 250;

class MyProgram extends Component<IProps, IState> {
    private scrollX: Animated.Value = new Animated.Value(0);
    private mounted: boolean = false;

    constructor (props: IProps) {
        super(props);
        this.state = {
            isReady: (this.props.progression?.program && this.props.progression?.week) ? true : false,
            weekItems: [],
            renderScrollViewPlaceholder: true,
            animInfosOpacity: new Animated.Value(0),
            animInfosTransform: new Animated.Value(0),
            animLabelOpacity: new Animated.Value(0),
            animLabelTransform: new Animated.Value(0),
            animPlaceholderOpacity: new Animated.Value(1),
            animScrollViewOpacity: new Animated.Value(0),
            animScrollViewTransform: new Animated.Value(0),
            animWeekOpacity: new Animated.Value(0),
            animWeekTransform: new Animated.Value(0),
            fetchError: false
        };
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.animateLabel();
        // If progression is defined in store, fetch week items
        if (this.props.progression?.program && this.props.progression?.week) {
            this.init();
        }
    }

    public shouldComponentUpdate (nextProps: any, nextState: any): boolean {
        if (isEqual(nextProps, this.props) && isEqual(nextState, this.state)) {
            return false;
        } else {
            return true;
        }
    }

    public componentDidUpdate (prevProps: IProps): void {
        // On the first launch we have to wait for the store to receive the progression
        // Or if there is a this.props.progression.error, we init anyway with fallback values
        if (prevProps.progression?.program !== this.props.progression?.program &&
            prevProps.progression?.week?.id !== this.props.progression?.week?.id ||
            this.props.progression?.error && this.props.progression?.error !== prevProps.progression?.error
        ) {
            this.init();
        } else if (this.props.progression?.week?.workoutsDone?.length !== prevProps.progression?.week?.workoutsDone?.length) {
            this.sortWeekItems();
        }
    }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private init (): void {
        const { isReady } = this.state;
        if (isReady) {
            this.animateContent();
            this.fetch();
        } else {
            this.setState({ isReady: true }, () => {
                this.animateContent();
                this.fetch();
            });
        }
    }

    private getAnimation (
        opacityValue: Animated.Value, transformValue: Animated.Value, delay: number = 0, speed: number = 15, bounciness: number = 7
    ): Animated.CompositeAnimation {
        const opacityParams = {
            toValue: 1,
            duration: 250,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: speed,
            bounciness: bounciness,
            isInteraction: false,
            useNativeDriver: true
        };
        return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacityValue, opacityParams),
                Animated.spring(transformValue, springParams)
            ])
        ]);
    }

    private animateLabel (): void {
        const { animLabelOpacity, animLabelTransform } = this.state;
        this.getAnimation(animLabelOpacity, animLabelTransform, delays.views.training.myProgram, 12, 6).start();
    }

    private animateContent (): void {
        const {
            animInfosOpacity, animInfosTransform,
            animScrollViewOpacity, animScrollViewTransform,
            animWeekOpacity, animWeekTransform
        } = this.state;

        Animated.parallel([
            this.getAnimation(animInfosOpacity, animInfosTransform, delays.views.training.myProgram),
            this.getAnimation(animWeekOpacity, animWeekTransform, delays.views.training.myProgram + 200),
            this.getAnimation(animScrollViewOpacity, animScrollViewTransform, delays.views.training.myProgram + 300, 12, 6)
        ]).start();
    }

    private animatePlaceholderScrollView (): void {
        Animated.sequence([
            Animated.timing(this.state.animPlaceholderOpacity, {
                toValue: 0,
                duration: SCROLLVIEW_ANIMATION_DURATION,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            this.setState({ renderScrollViewPlaceholder: false });
        });
    }

    private manage = () => {
        this.props.screenProps.popupManagerRef.current.requestPopup({
            backgroundColors: ['white'],
            borderRadius: 44,
            closeButtonIconColor: colors.gray,
            ContentComponent: ProgramManagement,
            ContentComponentProps: {
                navigation: this.props.navigation,
                progression: this.props.progression,
                screenProps: this.props.screenProps
            },
            height: MANAGE_POPUP_HEIGHT,
            onClose: this.props.onClose || undefined,
            onOpen: this.props.onOpen || undefined,
            overflow: false,
            position: 'bottom',
            scrollView: true,
            title: I18n.t('programManagement.currentProgram'),
            titleStyle: programManagementStyles.popupTitle
        });
    }

    private fetch = async () => {
        try {
            if (!this.props.progression?.program?.id || !this.props.progression?.week?.id || !Number.isInteger(this.props.progression?.week?.position)) {
                // Use `replace` instead of `navigate` for a huge performance boost by not keeping the Training view behind
                this.props.navigation.replace({ routeName: 'ProgramSelectionModal', params: { hideHeader: true } });
                this.props.screenProps?.toastManagerRef?.current?.openToast({
                    message: I18n.t('myProgram.error'),
                    type: 'error'
                });
                throw 'Progression data is missing in the store';
            }

            const programResponse: AxiosResponse = await api.get(ENDPOINTS.programs + '/' + this.props.progression.program.id);
            const program: IProgram = programResponse.data;

            if (!program?.weeks?.length) {
                return;
            }

            const weekIndex = findIndex(program.weeks, (o: IWeek) => { return o.position === this.props.progression.week.position; });
            if (!program.weeks[weekIndex].items) {
                return;
            }
            let weekItems: IWeekItem[] = orderBy(program.weeks[weekIndex].items, 'position', 'asc');
            weekItems = this.sortWeekItems(weekItems);

            let summaryRequestArray = [];
            weekItems.forEach(async (weekItem: IWeekItem) => {
                if (weekItem.workout?.id) {
                    summaryRequestArray.push(api.get(ENDPOINTS.workouts + '/' + weekItem.workout.id));
                } else {
                    summaryRequestArray.push(undefined);
                }
            });
            await Promise.all(summaryRequestArray.map(async (promiseAxios: Promise<AxiosResponse>, index: number) => {
                try {
                    await promiseAxios.then((axiosResponse: AxiosResponse) => {
                        weekItems[index].fullWorkout = axiosResponse.data;
                    });
                } catch (error) {
                    weekItems[index].fullWorkout = undefined;
                }
            }));

            if (!this.mounted) {
                return;
            }
            this.setState({ fetchError: false, weekItems: weekItems }, () => {
                this.animatePlaceholderScrollView();
            });
        } catch (error) {
            console.log(error);
            if (!this.mounted) {
                return;
            }
            this.setState({ fetchError: true });
        }
    }

    private retryFetch = async () => {
        this.setState({ fetchError: false });
        try {
            if (this.props.progression?.error) {
                const programId: string = await fetchActiveProgramId();
                await fetchProgression(programId);
            }
            this.fetch();
        } catch (error) {
            console.log(error);
        }
    }

    private sortWeekItems = (weekItems: IWeekItem[] = null): IWeekItem[] => {
        let setState: boolean = false;
        let sortedWeekItems: IWeekItem[];
        if (!weekItems) {
            if (this.state.weekItems) {
                sortedWeekItems = this.state.weekItems;
                setState = true;
            } else {
                return null;
            }
        } else {
            sortedWeekItems = weekItems;
        }
        const workoutsDone = this.props.progression?.week?.workoutsDone || undefined;
        if (workoutsDone) {
            let weekItemsTodo: IWeekItem[] = [];
            let weekItemsDone: IWeekItem[] = [];
            sortedWeekItems.forEach((weekItem: IWeekItem) => {
                const findIfWeekItemIsDone = findIndex(
                    workoutsDone,
                    (o: IWorkoutHistory) => {
                        return o.position === weekItem.position;
                    }
                );
                if (findIfWeekItemIsDone !== -1) {
                    weekItemsDone.push(weekItem);
                } else {
                    weekItemsTodo.push(weekItem);
                }
            });
            weekItemsTodo = orderBy(weekItemsTodo, 'position', 'asc');
            weekItemsDone = orderBy(weekItemsDone, 'position', 'asc');
            sortedWeekItems = weekItemsTodo.concat(weekItemsDone);
        }
        if (setState) {
            this.setState({ weekItems: sortedWeekItems });
        }
        return sortedWeekItems;
    }

    private get label (): JSX.Element {
        const { animLabelOpacity, animLabelTransform } = this.state;
        const scrollAnimatedStyle = {
            transform: [
                {
                    translateX: this.scrollX.interpolate({
                        inputRange: [0, MY_PROGRAM_LEFT_CONTAINER_WIDTH * 1.5],
                        outputRange: [0, -MY_PROGRAM_LEFT_CONTAINER_WIDTH],
                        extrapolate: 'clamp'
                    })
                }
            ]
        };
        const animatedStyle = {
            opacity: animLabelOpacity,
            transform: [
                {
                    translateY: animLabelTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-MY_PROGRAM_LEFT_CONTAINER_WIDTH, 0]
                    })
                }
            ]
        };
        return (
            <Animated.View style={[styles.labelContainer, scrollAnimatedStyle]}>
                <Animated.View style={[styles.labelContainerInner, animatedStyle]}>
                    <SharedVerticalTitle
                        height={CAROUSEL_HEIGHT}
                        width={MY_PROGRAM_LEFT_CONTAINER_WIDTH}
                        title={I18n.t('myProgram.label')}
                    />
                </Animated.View>
            </Animated.View>
        );
    }

    private get infos (): JSX.Element {
        const { progression } = this.props;
        const { animInfosOpacity, animInfosTransform } = this.state;
        const animatedStyle = {
            opacity: animInfosOpacity,
            transform: [
                {
                    translateY: animInfosTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [80, 0]
                    })
                }
            ]
        };

        const programTitle = progression.program && progression.program.title || I18n.t('app.nuli');
        const weekNumber = progression.week && progression.week.position ? progression.week.position + 1 : 1;
        return (
            <Animated.View style={[styles.infosContainer, animatedStyle]}>
                <Text style={styles.title}>{ programTitle }</Text>
                <Text style={styles.subtitle}>{I18n.t('myProgram.week', {number: weekNumber})}</Text>
                <View style={styles.manageButtonContainer}>
                    <TouchableOpacity
                        style={styles.manageButton}
                        onPress={this.manage}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.manageText}>{I18n.t('myProgram.manage')}</Text>
                        <Tooltip
                            containerStyle={isAndroid ? styles.manageTooltipAndroid : styles.manageTooltipIOS}
                            screenProps={this.props.screenProps}
                            tooltipId={ETooltipIds.trainingManage}
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    }

    private get workoutsCount (): JSX.Element {
        const { progression } = this.props;
        const { animWeekOpacity, animWeekTransform } = this.state;
        const done = progression?.week?.workoutsCount > 0 && progression?.week?.workoutsCount === progression?.week?.workoutsDoneCount;
        const workoutsCount = progression.week && progression.week.workoutsCount || 0;
        const workoutsDoneCount = progression.week && progression.week.workoutsDoneCount || 0;

        const animatedStyle = {
            opacity: animWeekOpacity,
            transform: [
                {
                    translateX: animWeekTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [TOP_RIGHT_CONTAINER_PADDING_RIGHT + WEEKS_CIRCLE_SIZE, 0]
                    })
                }
            ]
        };

        const containerStyle = [
            styles.workoutsContainer,
            done ? styles.workoutsContainerDone : {}
        ];

        const currentWorkoutStyle = [
            styles.currentWorkout,
            workoutsDoneCount > 9 ? { left: -8 } : {},
            done ? styles.currentWeekDone : {}
        ];

        const separatorWorkoutStyle = [
            styles.separatorWeek,
            done ? styles.separatorWeekDone : {}
        ];

        const workoutsCountStyle = [
            styles.workoutsCount,
            workoutsCount > 9 ? { right: -8 } : {},
            done ? styles.workoutsCountDone : {}
        ];

        return (
            <Animated.View style={[styles.workoutsWrapper, animatedStyle]}>
                <View style={containerStyle}>
                    <View style={styles.workoutsContent}>
                        <Text style={currentWorkoutStyle}>{ workoutsDoneCount }</Text>
                        <View style={separatorWorkoutStyle} />
                        <Text style={workoutsCountStyle}>{ workoutsCount }</Text>
                    </View>
                </View>
            </Animated.View>
        );
    }

    private get items (): JSX.Element[] {
        const { weekItems } = this.state;
        if (!weekItems) {
            return null;
        }
        return weekItems.map((weekItem: IWeekItem, index: number) => {
            const id = weekItem.fullWorkout?.id ? weekItem.fullWorkout?.id : weekItem.restDay?.id;
            return(
                <MyProgramEntry
                    index={index}
                    key={`myprogram-workout-${id}-index-${index}`}
                    navigation={this.props.navigation}
                    screenProps={this.props.screenProps}
                    weekItem={weekItem}
                />
            );
        });
    }

    private get scrollViewBar (): JSX.Element {
        const { weekItems } = this.state;
        if (!weekItems) {
            return null;
        }
        let position = Animated.divide(this.scrollX, ITEM_CONTAINER_WIDTH + ITEM_CONTAINER_MARGIN_RIGHT);

        const bullets = weekItems.map((_: IWeekItem, index: number) => {
            let animatedStyle = position.interpolate({
                inputRange: [index - 1, index, index + 1],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp'
            });
            return (
                <View
                    key={`myprogram-bullet-${index}`}
                    style={styles.scrollViewBulletContainer}
                >
                    <Animated.View
                        key={index}
                        style={[styles.scrollViewBullet, {opacity: animatedStyle}]}
                    />
                </View>
            );
        });

        return (
            <View style={[styles.flex, styles.scrollViewBulletWrapper]}>
                <View style={styles.scrollViewBulletWrapperInner}>
                    <Fragment>{bullets}</Fragment>
                </View>
            </View>
        );
    }

    private scrollViewPlaceholderItems = (count: number): JSX.Element[] => {
        let items = [];
        for (let i = 0; i < count; i++) {
            items.push(
                <MyProgramFakeEntry
                    animated={this.state.fetchError ? false : true}
                    index={i}
                    key={`workout-item-fake-${i}`}
                />
            );
        }
        return items;
    }

    private get scrollView (): JSX.Element {
        const animatedStyles = {
            opacity: this.state.animPlaceholderOpacity
        };
        return (
            <View style={styles.carouselContainer}>
                <Animated.ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    overScrollMode={'never'}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: this.scrollX } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={1}
                    snapToAlignment={'start'}
                    snapToInterval={ITEM_CONTAINER_WIDTH + ITEM_CONTAINER_MARGIN_RIGHT}
                    decelerationRate={'fast'}
                >
                    <View style={styles.scrollViewLeftSpacer} />
                    {this.items}
                </Animated.ScrollView>
                {
                    this.state.renderScrollViewPlaceholder &&
                    <Animated.ScrollView
                        style={[styles.scrollViewPlaceholder , animatedStyles]}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                    >
                        <View style={styles.scrollViewLeftSpacer} />
                        {this.scrollViewPlaceholderItems(2)}
                    </Animated.ScrollView>
                }
                { this.error }
            </View>
        );
    }

    private get error (): JSX.Element {
        return this.state.fetchError ? (
            <ErrorMessage
                retry={this.retryFetch}
                containerStyle={styles.errorContainer}
                toastManagerRef={this.props.screenProps?.toastManagerRef}
            />
        ) : null;
    }

    public render (): JSX.Element {
        const { containerStyle } = this.props;
        const { animScrollViewOpacity, animScrollViewTransform, isReady } = this.state;
        const scrollViewAnimatedStyle = [
            styles.scrollViewContainer,
            {
                opacity: animScrollViewOpacity,
                transform: [
                    {
                        translateY: animScrollViewTransform.interpolate({
                            inputRange: [0, 1],
                            outputRange: [150, 0]
                            // extrapolate: 'clamp'
                        })
                    }
                ]
            }
        ];

        return (
            <View style={[styles.container, containerStyle]}>
                <View style={styles.leftContainer}>
                    {this.label}
                </View>
                <View style={styles.rightContainer}>
                    <View style={styles.topRightContainer}>
                        {this.infos}
                        {this.workoutsCount}
                    </View>
                    <Animated.View style={scrollViewAnimatedStyle}>
                        {this.scrollView}
                        {this.scrollViewBar}
                    </Animated.View>
                    { !isReady && <Loader containerStyle={styles.loaderContainer} withContainer={true} />}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    progression: state.progression
});

export default connect(mapStateToProps, {}) (MyProgram);
