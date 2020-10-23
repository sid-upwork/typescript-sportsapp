import React, { Component, Fragment } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { orderBy } from 'lodash';
import { ENDPOINTS } from '../../utils/endpoints';
import { IScreenProps } from '../../index';
import { getFormattedDate, convertSecondsToTimeLabel } from '../../utils/date';
import { IExerciseHistorySummary, IExerciseSummaryWorkout, IExerciseSummaryExercise, IExerciseSummarySet } from '../../types/exerciseSummary';
import { getFormatedSetWeight, getConvertedSetWeight, getSetWeightUnit } from '../../utils/units';
import api from '../../utils/api';
import I18n from '../../utils/i18n';

import Loader from '../../components/Loader';
import SharedVerticalTitle from '../../components/SharedVerticalTitle';
import ErrorMessage from '../../components/ErrorMessage';

import colors from '../../styles/base/colors.style';
import styles from '../../styles/components/Popups/ExerciseHistory.style';
import { ICircuitExercise } from '../../types/workout';

interface IProps {
    dismissPopup: () => void;
    screenProps: IScreenProps;
    circuitExercise: ICircuitExercise;
}

interface IState {
    animOpacity: Animated.Value;
    animTransform: Animated.Value;
    exerciseHistorySummary: IExerciseHistorySummary;
    fetchError: boolean;
    loading: boolean;
}

class ExerciseHistory extends Component<IProps, IState> {

    private mounted: boolean = false;

    constructor (props: IProps) {
        super(props);
        this.state = {
            animOpacity: new Animated.Value(0),
            animTransform: new Animated.Value(0),
            exerciseHistorySummary: undefined,
            fetchError: false,
            loading: false
        };
    }

    public componentDidMount (): void {
        this.mounted = true;
        this.fetch(this.animate);
    }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private animate = (): void => {
        const { animOpacity, animTransform } = this.state;
        const opacityParams = {
            toValue: 1,
            duration: 250,
            easing: Easing.linear,
            isInteraction: false,
            useNativeDriver: true
        };
        const springParams = {
            toValue: 1,
            speed: 10,
            bounciness: 5,
            isInteraction: false,
            useNativeDriver: true
        };
        Animated.parallel([
            Animated.timing(animOpacity, opacityParams),
            Animated.spring(animTransform, springParams)
        ]).start();
    }

    private fetch = async (callback: any = null) => {
        const { circuitExercise } = this.props;

        this.setState({ loading: true });
        let exerciseHistorySummary: IExerciseHistorySummary;
        let fetchError: boolean = false;
        try {
            const endpoint = ENDPOINTS.historyExercisesSummary + '/' + circuitExercise.exercise.id + '?type=' + circuitExercise.type;
            const response = await api.get(endpoint);
            exerciseHistorySummary = response.data;
        } catch (error) {
            fetchError = true;
            console.log(error.response);
        } finally {
            if (this.mounted) {
                this.setState({ exerciseHistorySummary, fetchError, loading: false }, () => {
                    callback && callback();
                });
            }
        }
    }

    private retryFetch = () => {
        this.setState({ fetchError: false }, () => {
            this.fetch();
        });
    }

    private get loader (): JSX.Element {
        return (
            <Loader
                color={colors.violetDark}
                containerType={'flex'}
                withContainer={true}
            />
        );
    }

    private get error (): JSX.Element {
        return (
            <ErrorMessage
                retry={this.retryFetch}
                toastManagerRef={this.props.screenProps?.toastManagerRef}
            />
        );
    }

    private get header (): JSX.Element {
        const { circuitExercise } = this.props;
        const { exerciseHistorySummary } = this.state;
        if (!circuitExercise || !exerciseHistorySummary) {
            return;
        }

        return (
            <View style={styles.headerContainer}>
                <View style={styles.headerLeftContainer}>
                    <SharedVerticalTitle
                        height={160}
                        title={I18n.t('exerciseHistory.title')}
                        textStyle={styles.headerTitle}
                        width={70}
                    />
                </View>
                <View style={styles.headerRightContainer}>
                    <Text style={styles.exerciseSummaryTitle} numberOfLines={2}>{ circuitExercise.exercise.title }</Text>
                    <Text style={styles.exerciseSummarySubtitle}>{ I18n.t('exerciseHistory.personalRecords') }</Text>
                    <View style={styles.personalRecordsContainer}>
                        <View style={styles.personalRecordsRow}>
                            <View style={styles.personalRecordsColumn1}>
                                <Text style={styles.personalRecordsColumn1Title}>
                                    { I18n.t('workout.weight') }
                                </Text>
                                <Text style={styles.personalRecordsColumn1Date}>
                                    { exerciseHistorySummary.records?.maxWeight?.date &&
                                    getFormattedDate(exerciseHistorySummary.records?.maxWeight?.date, 'll') }
                                </Text>
                            </View>
                            <View style={styles.personalRecordsColumn2}>
                                <Text style={styles.personalRecordsColumn2Text}>
                                    { getFormatedSetWeight(exerciseHistorySummary.records?.maxWeight?.weight) }
                                    { (exerciseHistorySummary.records?.maxScored?.scored && ' x ') || ' - ' }
                                    { exerciseHistorySummary.records?.maxWeight?.scored }
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.personalRecordsRow, styles.personalRecordsRowLast]}>
                            <View style={styles.personalRecordsColumn1}>
                                <Text style={styles.personalRecordsColumn1Title}>
                                    { I18n.t('workout.reps') }
                                </Text>
                                <Text style={styles.personalRecordsColumn1Date}>
                                    { exerciseHistorySummary.records?.maxScored?.date &&
                                    getFormattedDate(exerciseHistorySummary.records?.maxScored?.date, 'll') }
                                </Text>
                            </View>
                            <View style={styles.personalRecordsColumn2}>
                                <Text style={styles.personalRecordsColumn2Text}>
                                    { getFormatedSetWeight(exerciseHistorySummary.records?.maxWeight?.weight) }
                                    { (exerciseHistorySummary.records?.maxScored?.scored && ' x ') || ' - ' }
                                    { exerciseHistorySummary.records?.maxScored?.scored }
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    private get content (): JSX.Element {
        const { circuitExercise } = this.props;
        const { exerciseHistorySummary } = this.state;
        if (!exerciseHistorySummary?.workouts) {
            return;
        }
        const workouts = exerciseHistorySummary?.workouts && orderBy(exerciseHistorySummary?.workouts, 'date', 'desc');
        let workoutItems = [];
        workouts?.forEach((workout: IExerciseSummaryWorkout, workoutIndex: number) => {
            let exerciseItems = [];
            workout?.exercises?.forEach((exerciseSummary: IExerciseSummaryExercise, exerciseSummaryIndex: number) => {
                const sets = exerciseSummary?.sets && orderBy(exerciseSummary?.sets, 'position', 'asc');
                const type = circuitExercise.type || 'reps';
                let setItems = [];
                sets?.forEach((set: IExerciseSummarySet, setIndex: number) => {
                    const position = (set.position + 1).toString();
                    const weight = getConvertedSetWeight(set.weight)?.toString() || '-';
                    let scored = type === 'time' ? convertSecondsToTimeLabel(set.scored) : set.scored?.toString();
                    scored = scored || '-';
                    setItems.push(
                        <View key={`exerciseHistory-row-${setIndex}`} style={styles.itemRow}>
                            <View style={styles.itemColumn1}>
                                <Text style={styles.itemText}>{ position }</Text>
                            </View>
                            <View style={styles.itemColumn2}>
                                <Text style={styles.itemText}>{ weight }</Text>
                            </View>
                            <View style={styles.itemColumn3}>
                                <Text style={styles.itemText}>{ scored }</Text>
                            </View>
                        </View>
                    );
                    if (setIndex < exerciseSummary.sets.length - 1) {
                        setItems.push(
                            <View key={`exerciseHistory-row-separator-${setIndex}`} style={styles.rowSeparatorContainer} >
                                <View style={styles.rowSeparator} />
                            </View>
                        );
                    }
                });
                exerciseItems.push(
                    <View key={`exerciseHistory-table-${exerciseSummaryIndex}`} style={styles.itemTable}>
                        <View style={styles.itemRowHeader}>
                            <View style={styles.itemColumn1} />
                            <View style={styles.itemColumn2}>
                                <Text style={styles.itemColumTitle}>{ getSetWeightUnit() }</Text>
                            </View>
                            <View style={styles.itemColumn3}>
                                <Text style={styles.itemColumTitle}>{ I18n.t(`workout.${type}`) }</Text>
                            </View>
                        </View>
                        { setItems }
                    </View>
                );
            });
            workoutItems.push(
                <View key={`exerciseHistory-workout-${workoutIndex}`} style={styles.itemContainer}>
                    <Text style={styles.itemDate}>{ getFormattedDate(workout.date, 'll') }</Text>
                    <Text style={styles.itemTitle}>{ workout.title }</Text>
                    { exerciseItems }
                </View>
            );
        });
        return (
            <View style={styles.itemsContainer}>
                { workoutItems }
            </View>
        );
    }

    private get popupContent (): JSX.Element {
        return (
            <Fragment>
                { this.header }
                { this.content }
            </Fragment>
        );
    }

    private get popupState (): JSX.Element {
        const { loading, fetchError } = this.state;
        if (loading) {
            return (
                <View style={{ marginVertical: 20 }}>
                    { this.loader }
                </View>
            );
        } else if (fetchError) {
            return (
                <View style={{ marginVertical: 50, marginHorizontal: 20 }}>
                    { this.error }
                </View>
            );
        }
        return null;
    }

    public render (): JSX.Element {
        const { animOpacity, animTransform } = this.state;
        const animatedStyle = {
            opacity: animOpacity,
            transform: [
                {
                    translateY: animTransform.interpolate({
                        inputRange: [0, 1],
                        outputRange: [350, 0]
                    })
                }
            ]
        };
        return (
            <View style={styles.container}>
                { this.popupState }
                <Animated.View style={animatedStyle}>
                    { this.popupContent }
                </Animated.View>
            </View>
        );
    }
}

export default ExerciseHistory;
