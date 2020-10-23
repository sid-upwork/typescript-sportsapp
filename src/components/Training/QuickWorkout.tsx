import React, { PureComponent } from 'react';
import { View, Text, Image, Animated, Easing } from 'react-native';
import { withNavigation } from 'react-navigation';
import { IWorkout } from '../../types/workout';
import { IWorkoutHistory } from '../../types/progression';
import { getLoaderColor } from '../../utils/colors';
import { getFormattedDate } from '../../utils/date';
import { ENDPOINTS } from '../../utils/endpoints';
import { getFormattedDuration, orderSets } from '../../utils/workout';
import { navigateToWorkoutOverview } from '../../utils/navigation';
import { fetchWorkoutHistoryByWorkoutId } from '../../utils/progression';
import { ETooltipIds } from '../../store/modules/tutorials';
import { IScreenProps } from '../../index';
import { debounce } from 'lodash';
import I18n from '../../utils/i18n';
import api from '../../utils/api';
import chroma from 'chroma-js';

import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../DiffuseShadow';
import ErrorMessage from '../ErrorMessage';
import FadeInImage from '../FadeInImage';
import Loader from '../Loader';
// import OngoingWorkoutBadge from '../OngoingWorkoutBadge';
import SharedVerticalTitle from '../SharedVerticalTitle';
import Tooltip from '../Tooltip';
import TouchableScale from '../TouchableScale';

import colors from '../../styles/base/colors.style';
import styles, {
    QUICK_WORKOUT_RIGHT_CONTAINER_WIDTH,
    LINEAR_GRADIENT_GO_BUTTON
} from '../../styles/components/Training/QuickWorkout.style';

import Blob from '../../static/Training/quickworkout-background.svg';

interface IProps {
    navigation: any;
    containerStyle?: any;
    screenProps: IScreenProps;
}

interface IState {
    animationPlaceholderOpacity: Animated.Value;
    done: boolean;
    fetchError: boolean;
    loading: boolean;
    renderPlaceholder: boolean;
    workout: IWorkout;
    workoutHistory: IWorkoutHistory;
}

const STOPWATCH_ICON = require('../../static/icons/stopwatch.png');
const CHECKMARK_ICON = require('../../static/icons/checkmark.png');
const PLACEHOLDER_ANIMATION_DURATION = 350;

class QuickWorkout extends PureComponent<IProps, IState> {
    private mounted: boolean = false;
    constructor (props: IProps) {
        super(props);
        this.state = {
            animationPlaceholderOpacity: new Animated.Value(1),
            done: false,
            fetchError: false,
            loading: false,
            renderPlaceholder: true,
            workout: undefined,
            workoutHistory: undefined
        };
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.fetch();
    }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private fetch = async () => {
        this.setState({ loading: true });
        try {
            const workoutsData = await api.get(ENDPOINTS.workoutLists + '/slug/quick-workout');
            const currentWorkoutId = workoutsData?.data?.currentWorkoutId;
            const workouts: IWorkout[] = workoutsData?.data?.workouts;

            if (!currentWorkoutId || !workouts || !workouts.length) {
                throw 'Quick workout: Missing data';
            }

            // Get active workout's data
            let currentWorkout: IWorkout;
            for (let i = 0; i < workouts.length; i++) {
                if (currentWorkoutId === workouts[i].id) {
                    currentWorkout = workouts[i];
                    break;
                }
            }

            if (!currentWorkout) {
                throw 'Quick workout: No workout data';
            }
            currentWorkout = orderSets([currentWorkout])[0];

            let done: boolean = false;
            const workoutHistory: IWorkoutHistory = await fetchWorkoutHistoryByWorkoutId(currentWorkout?.id);
            if (workoutHistory?.id) {
                done = true;
            }
            if (!this.mounted) {
                return;
            }
            this.setState({ done, loading: false, workout: currentWorkout, workoutHistory }, () => {
                this.animatePlaceholder();
            });
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

    private animatePlaceholder (): void {
        Animated.sequence([
            Animated.timing(this.state.animationPlaceholderOpacity, {
                toValue: 0,
                duration: PLACEHOLDER_ANIMATION_DURATION,
                easing: Easing.linear,
                isInteraction: false,
                useNativeDriver: true
            })
        ]).start(() => {
            this.setState({ renderPlaceholder: false });
        });
    }

    private go = () => {
        const { workout, workoutHistory } = this.state;
        const { navigation } = this.props;
        navigateToWorkoutOverview(
            navigation?.navigate,
            workout,
            workoutHistory,
            false,
            null,
            'quickWorkout',
            undefined,
            () => {
                this.fetch();
            }
        );
    }

    private get shadow (): JSX.Element {
        return (
            <DiffuseShadow
                borderRadius={styles.imageShadow.borderRadius}
                color={chroma(colors.blueDark).darken(2).css()}
                horizontalOffset={25}
                shadowOpacity={0.3}
                verticalOffset={18}
            />
        );
    }

    private get label (): JSX.Element {
        return (
            <View style={styles.rightContainer}>
                <SharedVerticalTitle
                    width={QUICK_WORKOUT_RIGHT_CONTAINER_WIDTH}
                    rotateDirection={'clockwise'}
                    textStyle={styles.sectionTitle}
                    title={I18n.t('training.quickWorkout')}
                />
            </View>
        );
    }

    private get image (): JSX.Element {
        const { done, workout, workoutHistory } = this.state;

        if (!workout) {
            return null;
        }

        // Styles & text changes if the workout is done
        const workoutImageContainerOverlayDone = done ? (
            <View style={styles.fullSpace}>
                <View style={styles.imageContainerOverlayDone} />
                <View style={styles.completedTextContainer}>
                    <View style={styles.checkIconContainer}>
                        <Image source={CHECKMARK_ICON} style={styles.checkIcon} />
                    </View>
                    <Text style={styles.completedText}>{I18n.t('global.lastCompleted')}</Text>
                    <Text style={styles.completedText}>{ getFormattedDate(workoutHistory?.createdAt, 'll') }</Text>
                </View>
            </View>
        ) : null;

        return (
            <View style={styles.imageWrapper}>
                { this.shadow }
                <FadeInImage
                    source={{ uri: workout.image && workout.image.thumbnailUrl }}
                    containerCustomStyle={styles.imageContainer}
                    duration={300}
                    initialZoom={1.6}
                    zoomDuration={1700}
                    loaderColor={getLoaderColor()}
                />
                {workoutImageContainerOverlayDone}
                {/* <OngoingWorkoutBadge containerStyle={styles.badge} workoutId={workout?.id} /> */}
            </View>
        );
    }

    private get button (): JSX.Element {
        const { done } = this.state;

        const goButtonTextStyle = [
            styles.goButtonText,
            done ? styles.goButtonTextDone : {}
        ];
        const goButtonText = done ? I18n.t('global.redo') : I18n.t('global.go');

        return (
            <View style={styles.goButtonContainer}>
                <DiffuseShadow
                    color={chroma(colors.blueDark).darken(2.5).css()}
                    style={styles.goShadow}
                    horizontalOffset={25}
                    shadowOpacity={0.35}
                    verticalOffset={18}
                />
                <LinearGradient
                    colors={LINEAR_GRADIENT_GO_BUTTON}
                    start={{x: 0.7, y: 0}} end={{x: 0.3, y: 1}}
                    style={styles.fullSpace}
                />
                <Text style={goButtonTextStyle}>{goButtonText}</Text>
            </View>
        );
    }

    private get workoutDuration (): string {
        const { workout } = this.state;
        return getFormattedDuration(workout.timeTrialDuration);
    }

    private get description (): JSX.Element {
        const { workout } = this.state;
        if (!workout) {
            return null;
        }
        const time = workout.timeTrialDuration ? (
            <View style={styles.timeContainer}>
                <Image source={STOPWATCH_ICON} style={styles.timeIcon} />
                <Text style={styles.time}>{this.workoutDuration}</Text>
            </View>
        ) : (
            <View style={{ height: 20 }} />
        );

        return (
            <View style={styles.infosContainer}>
                {time}
                <Text style={styles.title} numberOfLines={2}>{workout.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{workout.shortDescription}</Text>
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
        const { fetchError, loading, renderPlaceholder } = this.state;
        const animatedStyles = {
            opacity: this.state.animationPlaceholderOpacity
        };
        const tooltip = !this.state.renderPlaceholder ? (
            <Tooltip
                containerStyle={styles.tooltip}
                gradientType={'blue'}
                screenProps={this.props.screenProps}
                tooltipId={ETooltipIds.trainingQuickWorkout}
            />
        ) : null;
        return (
            <View style={containerStyle}>
                <View style={[styles.container]}>
                    <Blob style={styles.backgroundBlob} />
                    <View style={styles.leftContainer}>
                        <TouchableScale
                            containerStyle={styles.topLeftContainer}
                            onPress={debounce(this.go, 500, { 'leading': true, 'trailing': false })}
                        >
                            {this.image}
                            {this.button}
                        </TouchableScale>
                        <View style={styles.bottomLeftContainer}>
                            {this.description}
                        </View>
                    </View>
                    {this.label}
                    { tooltip }
                </View>
                {
                    renderPlaceholder &&
                    <Animated.View style={[styles.containerPlaceholder, animatedStyles]}>
                        <View style={styles.leftContainer}>
                            <View style={styles.imageWrapper}>
                                { this.shadow }
                                <View style={[styles.fullSpace, styles.imageWrapperPlaceholder]} />
                                {loading && <Loader withContainer={true} color={'#FFFFFF'} />}
                            </View>
                            <View style={[styles.goButtonContainer, styles.goButtonContainerPlaceholder]} >
                                <LinearGradient
                                    colors={LINEAR_GRADIENT_GO_BUTTON}
                                    start={{x: 0.7, y: 0}} end={{x: 0.3, y: 1}}
                                    style={styles.fullSpace}
                                />
                            </View>
                        </View>
                        <View style={styles.rightContainer} />
                    </Animated.View>
                }
                { fetchError && this.error }
            </View>
        );
    }
}

export default withNavigation(QuickWorkout);
