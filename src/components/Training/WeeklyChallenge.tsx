import React, { Component, Fragment } from 'react';
import { View, Text, Image, Animated, Easing } from 'react-native';
import { withNavigation } from 'react-navigation';
import { IWorkout } from '../../types/workout';
import { IWorkoutHistory } from '../../types/progression';
import api from '../../utils/api';
import { getLoaderColor } from '../../utils/colors';
import I18n from '../../utils/i18n';
import { ENDPOINTS } from '../../utils/endpoints';
import { navigateToWorkoutOverview } from '../../utils/navigation';
import { getFormattedDuration, orderSets } from '../../utils/workout';
import { fetchWorkoutHistoryByWorkoutId } from '../../utils/progression';
import { getFormattedDate } from '../../utils/date';
import { debounce } from 'lodash';
import { IScreenProps } from '../../index';
import { ETooltipIds } from '../../store/modules/tutorials';
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
    LINEAR_GRADIENT_GO_BUTTON,
    WEEKLY_CHALLENGE_IMAGE_HEIGHT,
    WEEKLY_CHALLENGE_TITLE_CONTAINER_WIDTH
} from '../../styles/components/Training/WeeklyChallenge.style';

interface IProps {
    containerStyle?: any;
    navigation: any;
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

const CHECKMARK_ICON = require('../../static/icons/checkmark.png');
const STOPWATCH_ICON = require('../../static/icons/stopwatch.png');
const PLACEHOLDER_ANIMATION_DURATION = 350;

class WeeklyChallenge extends Component<IProps, IState> {
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

    public async componentDidMount (): Promise<void> {
        this.mounted = true;
        this.fetch();
    }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private fetch = async () => {
        this.setState({ loading: true });
        try {
            const currentWorkoutRes = await api.get(ENDPOINTS.workoutLists + '/slug/weekly-challenge/current');
            const currentWorkout: IWorkout = currentWorkoutRes?.data;

            if (!currentWorkout) {
                throw 'Weekly challenge: No workout data';
            }

            let done: boolean = false;
            const workoutHistory: IWorkoutHistory = await fetchWorkoutHistoryByWorkoutId(currentWorkout.id);
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
            'weeklyChallenge',
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
        const labelSecond = I18n.t('training.weeklyChallenge.labelSecond');
        return (
            <View style={styles.labelContainer}>
                <Text style={styles.labelTextFirst}>{I18n.t('training.weeklyChallenge.labelFirst')}</Text>
                { labelSecond.length ? <Text style={styles.labelTextSecond}>{ labelSecond }</Text> : null }
            </View>
        );
    }

    private get title (): JSX.Element {
        const { workout } = this.state;
        if (!workout || !workout.title) {
            return null;
        }
        return (
            <View style={styles.titleContainer}>
                <SharedVerticalTitle
                    title={workout.title}
                    width={WEEKLY_CHALLENGE_TITLE_CONTAINER_WIDTH}
                    height={WEEKLY_CHALLENGE_IMAGE_HEIGHT}
                    numberOfLines={2}
                    textStyle={styles.title}
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
                { workoutImageContainerOverlayDone }
                {/* <OngoingWorkoutBadge containerStyle={styles.badge} workoutId={workout?.id} /> */}
            </View>
        );
    }

    private get button (): JSX.Element {
        const { done, workout } = this.state;

        if (!workout) {
            return null;
        }

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

    private get workoutDuration (): JSX.Element {
        const { workout } = this.state;
        const duration = getFormattedDuration(workout.timeTrialDuration);
        return workout.timeTrial && workout.timeTrialDuration ?
        (
            <View style={styles.timeContainer}>
                <Image source={STOPWATCH_ICON} style={styles.timeIcon} />
                <Text style={styles.time}>{duration}</Text>
            </View>
        ) : null;
    }

    private get description (): JSX.Element {
        const { workout } = this.state;
        if (!workout) {
            return null;
        }

        return (
            <Fragment>
                { this.workoutDuration }
                <Text style={styles.description} numberOfLines={3}>{workout.shortDescription}</Text>
            </Fragment>
        );
    }

    private get error (): JSX.Element {
        return this.state.fetchError ? (
            <View style={styles.errorContainer}>
                <ErrorMessage
                    retry={this.retryFetch}
                    containerStyle={styles.errorMessage}
                    toastManagerRef={this.props.screenProps?.toastManagerRef}
                />
            </View>
        ) : null;
    }

    public render (): JSX.Element {
        const { containerStyle } = this.props;
        const { fetchError, loading } = this.state;
        const animatedStyles = {
            opacity: this.state.animationPlaceholderOpacity
        };
        const tooltip = !this.state.renderPlaceholder ? (
            <Tooltip
                color={colors.violetDark}
                containerStyle={styles.tooltip}
                screenProps={this.props.screenProps}
                tooltipId={ETooltipIds.trainingWeeklyChallenge}
            />
        ) : null;
        return (
            <View style={containerStyle}>
                <View style={styles.container}>
                    {this.label}
                    <View style={styles.contentContainer}>
                        <View style={styles.topContainer}>
                            {this.title}
                            <TouchableScale
                                style={styles.topContainerInner}
                                onPress={debounce(this.go, 500, { 'leading': true, 'trailing': false })}
                            >
                                {this.image}
                                {this.button}
                            </TouchableScale>
                            { tooltip }
                        </View>
                        <View style={styles.bottomContainer}>
                            {this.description}
                        </View>
                    </View>
                </View>
                {
                    this.state.renderPlaceholder &&
                    <Animated.View style={[styles.containerPlaceholder, animatedStyles]}>
                        <View style={styles.container}>
                            {this.label}
                            <View style={styles.contentContainer}>
                                <View style={styles.topContainer}>
                                    <View style={styles.titleContainer} />
                                    <View style={styles.topContainerInner}>
                                        <View style={styles.imageWrapper}>
                                            { this.shadow }
                                            <View style={styles.imagePlaceholder} />
                                            { fetchError && this.error }
                                            { loading && <Loader withContainer={true} color={'#FFFFFF'} /> }
                                        </View>
                                        <View style={[styles.goButtonContainer, styles.goButtonContainerPlaceholder]}>
                                            <LinearGradient
                                                colors={LINEAR_GRADIENT_GO_BUTTON}
                                                start={{x: 0.3, y: 0.3}} end={{x: 1, y: 1}}
                                                style={styles.goGradient}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.bottomContainer} />
                            </View>
                        </View>
                    </Animated.View>
                }
            </View>
        );
    }
}

export default withNavigation(WeeklyChallenge);
