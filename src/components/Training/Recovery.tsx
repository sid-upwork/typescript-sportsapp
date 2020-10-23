import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import api from '../../utils/api';
import { getLoaderColor } from '../../utils/colors';
import { ENDPOINTS } from '../../utils/endpoints';
import { orderSets } from '../../utils/workout';
import I18n from '../../utils/i18n';
import { IWorkout } from '../../types/workout';
import { navigateToWorkoutOverview } from '../../utils/navigation';
import { ETooltipIds } from '../../store/modules/tutorials';
import { debounce } from 'lodash';
import { IScreenProps } from '../../index';

// import EllipsisSeparator from '../EllipsisSeparator';
import ErrorMessage from '../ErrorMessage';
import FadeInImage from '../FadeInImage';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../Loader';
import NumberTicker from '../Ticker/NumberTicker';
import SharedVerticalTitle from '../SharedVerticalTitle';
import Tooltip from '../Tooltip';

import colors from '../../styles/base/colors.style';
import { viewportWidth } from '../../styles/base/metrics.style';
import styles, { RECOVERY_RIGHT_CONTAINER_WIDTH, RECOVERY_ITEM_WIDTH } from '../../styles/components/Training/Recovery.style';

import Blob from '../../static/Training/recovery-background.svg';

interface IProps {
    containerStyle?: any;
    navigation: any;
    screenProps: IScreenProps;
}

interface IState {
    activeSlide: number;
    fetchError: boolean;
    loading: boolean;
    workouts: IWorkout[];
}

class Recovery extends Component<IProps, IState> {

    private mounted: boolean = false;
    public onAnimatedScroll: () => void;
    private scrollHintEndTimeout: any;
    private flatListRef: React.RefObject<any> = React.createRef<any>();
    private userStartedScrollingHorizontally: boolean;

    constructor (props: IProps) {
        super(props);
        this.userStartedScrollingHorizontally = false;
        this.state = {
            activeSlide: 1,
            fetchError: false,
            loading: false,
            workouts: undefined
        };
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.fetch();
    }

    public componentWillUnmount (): void {
        this.mounted = false;
        clearTimeout(this.scrollHintEndTimeout);
    }

    public animateScrollHint (): void {
        if (this.userStartedScrollingHorizontally) {
            return;
        }
        const flatListRef = this.flatListRef?.current as any;
        if (!flatListRef || !flatListRef.scrollToOffset) {
            return;
        }
        flatListRef.scrollToOffset({
            offset: Math.round(viewportWidth * 0.55),
            animated: true
        });
        this.scrollHintEndTimeout = setTimeout(() => {
            flatListRef.scrollToOffset({
                offset: 0,
                animated: true
            });
        }, 350);
    }

    private fetch = async () => {
        this.setState({ loading: true });
        try {
            const workoutsData = await api.get(ENDPOINTS.workoutLists + '/slug/recovery');
            if (!this.mounted) {
                return;
            }
            let workouts = workoutsData?.data?.workouts;
            if (!workouts) {
                throw 'No workouts available';
            }
            workouts = orderSets(workouts);

            this.setState({ workouts, loading: false });
        } catch (error) {
            console.log(error);
            if (!this.mounted) {
                return;
            }
            this.setState({ fetchError: true, loading: false });
        }
    }

    private retryFetch = () => {
        this.setState({ fetchError: false }, () => {
            this.fetch();
        });
    }

    private go = (workout: IWorkout): void => {
        const { navigation } = this.props;
        navigateToWorkoutOverview(
            navigation?.navigate,
            workout,
            undefined,
            false,
            undefined
        );
    }

    private onScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / viewportWidth) + 1;
        if (index !== this.state.activeSlide && index >= 1 && index <= this.state.workouts.length) {
            this.setState({ activeSlide: index });
        }
    }

    private onScrollBeginDrag = (): void => {
        if (!this.userStartedScrollingHorizontally) {
            this.userStartedScrollingHorizontally = true;
        }
    }

    private getItemLayout = (_: any, index: number) => {
        return {
            index,
            length: RECOVERY_ITEM_WIDTH,
            offset: RECOVERY_ITEM_WIDTH * index
        };
    }

    private getKeyExtractor = (_: any, index: number) => {
        return `recovery-item-${index}`;
    }

    private get background (): JSX.Element {
        return (
            <View style={styles.backgroundContainer}>
                {/* <EllipsisSeparator
                    containerTextStyle={styles.topEllipsisContainer}
                    textStyle={styles.ellipsisText}
                /> */}
                <Blob style={styles.backgroundBlob} />
                {/* <EllipsisSeparator
                    containerTextStyle={styles.bottomEllipsisContainer}
                    reverseLines={true}
                    textStyle={styles.ellipsisText}
                /> */}
            </View>
        );
    }

    private get label (): JSX.Element {
        return (
            <View style={styles.rightContainer}>
                <SharedVerticalTitle
                    width={RECOVERY_RIGHT_CONTAINER_WIDTH}
                    rotateDirection={'clockwise'}
                    textStyle={styles.sectionTitle}
                    title={I18n.t('training.recovery')}
                />
            </View>
        );
    }

    private get scrollViewIndicator (): JSX.Element {
        const { activeSlide, workouts } = this.state;
        if (!workouts) {
            return null;
        }

        const activeNumber = `${activeSlide < 10 ? '0' : ''}${activeSlide}`;
        const totalNumber = `${workouts.length < 10 ? '0' : ''}${workouts.length}`;

        return (
            <View style={styles.workoutsCountContainer}>
                <NumberTicker
                    duration={180}
                    style={styles.currentWorkoutContainer}
                    text={activeNumber}
                    textStyle={styles.currentWorkoutText}
                />
                <View style={styles.separatorWorkout} />
                <Text style={styles.workoutsCount}>{ totalNumber }</Text>
            </View>
        );
    }

    private renderItem = ({item, index}: {item: IWorkout, index: number}): JSX.Element => {
        const linearGradientGoButton = [colors.orange, colors.violetLight];
        const description = item?.shortDescription ? (
            <Text style={styles.description} numberOfLines={2}>{ item?.shortDescription }</Text>
        ) : null;
        return (
            <TouchableOpacity
                activeOpacity={0.75}
                key={`recovery-${index}`}
                onPress={debounce(() => this.go(item), 500, { 'leading': true, 'trailing': false })}
                style={styles.scrollViewItem}
            >
                <FadeInImage
                    source={{ uri: item?.image?.url }}
                    containerCustomStyle={styles.imageContainer}
                    resizeMode={'contain'}
                    duration={300}
                    loaderColor={getLoaderColor()}
                />
                <View style={styles.goButtonContainer}>
                    <LinearGradient
                        colors={linearGradientGoButton}
                        start={{x: 0.7, y: 0}} end={{x: 0.3, y: 1}}
                        style={styles.goGradient}
                    />
                    <Text style={styles.goButtonText}>{I18n.t('global.go')}</Text>
                </View>
                <View style={styles.descriptionContainer}>
                    <Text style={styles.title} numberOfLines={3}>{ item?.title }</Text>
                    { description }
                </View>
            </TouchableOpacity>
        );
    }

    private get scrollView (): JSX.Element {
        const { workouts } = this.state;
        if (!workouts) {
            return;
        }
        const optimizationProps = {
            initialNumToRender: 3,
            maxToRenderPerBatch: 3,
            removeClippedSubviews: true,
            updateCellsBatchingPeriod: 250,
            windowSize: 5
        };
        return (
            <FlatList
                { ...optimizationProps }
                data={workouts}
                decelerationRate={'fast'}
                disableIntervalMomentum={true}
                getItemLayout={this.getItemLayout}
                horizontal={true}
                keyExtractor={this.getKeyExtractor}
                onScroll={this.onScroll}
                onScrollBeginDrag={this.onScrollBeginDrag}
                overScrollMode={'never'}
                ref={this.flatListRef}
                renderItem={this.renderItem}
                showsHorizontalScrollIndicator={false}
                snapToAlignment={'start'}
                snapToInterval={viewportWidth}
                style={styles.scrollViewContainer}
            />
        );
    }

    private get error (): JSX.Element {
        return this.state.fetchError ? (
            <ErrorMessage
                containerStyle={styles.errorContainer}
                retry={this.retryFetch}
                toastManagerRef={this.props.screenProps?.toastManagerRef}
            />
        ) : null;
    }

    public render (): JSX.Element {
        const { fetchError, loading, workouts } = this.state;
        const { containerStyle } = this.props;

        return (
            <View style={containerStyle}>
                <View style={styles.container}>
                    {/* descriptionBackground is used to hide the background line in Training view
                    without setting a background color to description directly otherwise we would
                    see the background during the scroll, maybe we should just remove it ? */}
                    <View style={styles.descriptionBackground} />
                    {this.background}
                    {this.label}
                    { workouts &&
                        <Fragment>
                            { this.scrollView }
                            { this.scrollViewIndicator }
                            <Tooltip
                                containerStyle={styles.tooltip}
                                gradientType={'blue'}
                                screenProps={this.props.screenProps}
                                tooltipId={ETooltipIds.trainingYoga}
                            />
                        </Fragment>
                    }
                    { !workouts &&
                        <View style={styles.placeholderContainer}>
                            { fetchError && this.error }
                            { loading && <Loader withContainer={true} color={'#FFFFFF'} /> }
                        </View>
                    }
                </View>
            </View>
        );
    }
}

export default withNavigation(Recovery);
