import React, { PureComponent, Fragment } from 'react';
import { Image, View, Text, Alert } from 'react-native';
import { connect } from 'react-redux';

import { debounce, findIndex } from 'lodash';
import chroma from 'chroma-js';
import { IReduxState } from '../../store/reducers';
import { getLoaderColor } from '../../utils/colors';
import { IProgressionState } from '../../store/modules/progression';
import I18n from '../../utils/i18n';
import { navigateToWorkoutOverview } from '../../utils/navigation';
import { createHistoryWorkout } from '../../utils/progression';
import { confirmPopup } from '../../utils/confirmPopup';
import { getFormattedDate } from '../../utils/date';
import { IWeekItem } from '../../types/program';
import { IRestDay, IWorkout } from '../../types/workout';
import { IWorkoutHistory } from '../../types/progression';
import { IWorkoutHistoryState, IWorkoutProgressionState } from '../../store/modules/workoutProgression';
import { IScreenProps } from '../../index';

import LinearGradient from 'react-native-linear-gradient';

import DiffuseShadow from '../DiffuseShadow';
import FadeInImage from '../FadeInImage';
// import OngoingWorkoutBadge from '../OngoingWorkoutBadge';
import TouchableScale from '../TouchableScale';

import styles, {
    DESCRIPTION_CONTAINER_GRADIENT,
    GO_BUTTON_LINEAR_GRADIENT,
    DIFFUSE_SHADOW_COLOR,
    DIFFUSE_SHADOW_OPACITY,
    DIFFUSE_SHADOW_OPACITY_DONE,
    DIFFUSE_SHADOW_BORDER_RADIUS,
    DIFFUSE_SHADOW_VERTICAL_OFFSET,
    DIFFUSE_SHADOW_VERTICAL_OFFSET_DONE,
    DIFFUSE_SHADOW_HORIZONTAL_OFFSET,
    REST_DAY_LINEAR_GRADIENT,
    REST_DAY_LINEAR_GRADIENT_DONE
} from '../../styles/components/Training/MyProgramEntry.style';

const QUOTE = require('../../static/Article/quote.png');

interface IProps {
    index: number;
    navigation: any;
    progression: IProgressionState;
    screenProps: IScreenProps;
    weekItem: IWeekItem;
    workoutProgression: IWorkoutProgressionState;
}

interface IState {
}

class MyProgramEntry extends PureComponent<IProps, IState> {

    private mounted: boolean = false;

    constructor (props: IProps) {
        super(props);
    }

    public componentDidMount (): void {
        this.mounted = true;
    }

    // public async componentDidUpdate (prevProps: IProps): Promise<void> {
        // Update on a workout done (ex: user clicked on "already completed" in WorkoutOverview)
        // if (Number.isInteger(this.props.weekItem?.position) &&
        // prevProps.progression?.week?.workoutsDone !== this.props.progression?.week?.workoutsDone) {
        //     const done: boolean = this.isDone();
        //     const workoutHistory: IWorkoutHistory = this.getWorkoutHistory();
        //     this.setState({ workoutHistory, done: done });
        // }
    // }

    public componentWillUnmount (): void {
        this.mounted = false;
    }

    private go = () => {
        const { navigation, weekItem } = this.props;
        const workout: IWorkout = weekItem?.fullWorkout;
        const workoutHistory: IWorkoutHistory = this.getWorkoutHistory();
        if (workout) {
            const weekItemPosition = Number.isInteger(weekItem.position) ? weekItem.position : 0;
            navigateToWorkoutOverview(
                navigation?.navigate,
                workout,
                workoutHistory,
                true,
                weekItemPosition,
                'myProgram'
            );
        }
    }

    private onPressRestDayButton = (weekItem: IWeekItem) => {
        if (!weekItem.restDay || !weekItem.restDay.id || !Number.isInteger(weekItem.position)) {
            Alert.alert(I18n.t('app.fetchErrorTitle'), I18n.t('app.fetchError'));
        }

        const confirmRestDayDone = async () => {
            if (this.props.progression && this.props.progression.week && this.props.progression.week.id) {
                this.props.screenProps.toastManagerRef.current.openToast({
                    close: () => null,
                    message: I18n.t('app.toastUpdateMessage'),
                    type: 'info'
                });
                const workoutHistory: IWorkoutHistoryState = {
                    restDayId: weekItem.restDay.id,
                    position: weekItem.position,
                    exerciseHistories: [],
                    programWeekId: this.props.progression.week.id
                };
                const created = await createHistoryWorkout(workoutHistory, true);
                if (created && this.mounted) {
                    this.setState({ done: true }, () => {
                        this.props.screenProps.toastManagerRef.current.openToast({
                            close: () => null,
                            message: I18n.t('app.toastUpdateSuccessMessage'),
                            type: 'info'
                        });
                    });
                }
            }
        };

        confirmPopup(confirmRestDayDone);
    }

    private getWorkoutHistory = (): IWorkoutHistory => {
        const { progression, weekItem } = this.props;
        if (Number.isInteger(weekItem?.position) && weekItem?.workout?.id && progression?.week?.workoutsDone) {
            const indexWorkoutHistory = findIndex(
                progression.week.workoutsDone,
                (o: IWorkoutHistory) => {
                    return o.workoutId === weekItem?.workout?.id && o.position === weekItem?.position;
                }
            );
            if (indexWorkoutHistory !== -1) {
                const workoutHistory: IWorkoutHistory = progression.week.workoutsDone[indexWorkoutHistory];
                return workoutHistory;
            }
        }
        return undefined;
    }

    private isDone = (): boolean => {
        const { weekItem, progression } = this.props;
        let done: boolean = false;
        if (Number.isInteger(weekItem?.position) && progression?.week?.workoutsDone) {
            const findIfWeekItemIsDone = findIndex(
                progression.week.workoutsDone,
                (o: IWorkoutHistory) => {
                    return o.position === weekItem?.position;
                }
            );
            if (findIfWeekItemIsDone !== -1) {
                done = true;
            }
        }
        return done;
    }

    private get workout (): JSX.Element {
        const { weekItem } = this.props;
        const workout: IWorkout = weekItem?.fullWorkout;
        if (!workout) {
            return;
        }
        const done: boolean = this.isDone();
        const workoutHistory: IWorkoutHistory = this.getWorkoutHistory();
        // Styles & text changes if the workout is done
        const workoutImageContainerOverlayDone = done ?
        <View style={[styles.fullSpace, styles.workoutImageContainerOverlayDone]}>
            <View style={styles.workoutCompletedTextContainer}>
                <Text style={styles.workoutCompletedText}>{ I18n.t('global.lastCompleted') }</Text>
                <Text style={styles.workoutCompletedText}>{ getFormattedDate(workoutHistory?.createdAt, 'll') }</Text>
            </View>
        </View>
        : null;
        const workoutDescriptionContainerStyle = [
            styles.workoutDescriptionContainer,
            done ? styles.workoutDescriptionContainerOverlayDone : {}
        ];
        const workoutDescriptionTextDoneStyle = done ? styles.workoutDescriptionTextDone : {};
        const description = workout?.shortDescription; // No fallback on the longer description
        const workoutDescription = description ? (
            <Text style={[styles.workoutDescription, workoutDescriptionTextDoneStyle]} numberOfLines={3}>
                { description }
            </Text>
        ) : null;

        const goButtonTextStyle = [
            styles.goButtonText,
            done ? styles.goButtonTextDone : {}
        ];
        const goButtonText = done ? I18n.t('global.redo') : I18n.t('global.go');

        return (
            <Fragment>
                <View style={styles.workoutImageContainer}>
                    <FadeInImage
                        source={{ uri: workout.image && workout.image.thumbnailUrl }}
                        duration={300}
                        initialZoom={1.4}
                        zoomDuration={900}
                        containerCustomStyle={styles.workoutImage}
                        loaderColor={getLoaderColor()}
                    />
                    { workoutImageContainerOverlayDone }
                </View>
                <View style={workoutDescriptionContainerStyle}>
                    { !done && (
                        <LinearGradient
                            colors={DESCRIPTION_CONTAINER_GRADIENT}
                            start={{x: 0.8, y: 0}} end={{x: 0.2, y: 1}}
                            style={styles.restDayGradient}
                        />
                    )}
                    <Text style={[styles.workoutTitle, workoutDescriptionTextDoneStyle]} numberOfLines={2}>{workout.title}</Text>
                    { workoutDescription }
                    <View style={styles.goButtonContainer}>
                        <LinearGradient
                            colors={GO_BUTTON_LINEAR_GRADIENT}
                            start={{x: 0.3, y: 0.3}} end={{x: 1, y: 1}}
                            style={styles.goGradient}
                        />
                        <Text style={goButtonTextStyle}>{goButtonText}</Text>
                    </View>
                </View>
            </Fragment>
        );
    }

    private get restDay (): JSX.Element {
        const { weekItem } = this.props;
        if (!weekItem.restDay) {
            return;
        }
        const done: boolean = this.isDone();
        const restDay: IRestDay = weekItem.restDay;
        const backgroundGradientColors = done ? REST_DAY_LINEAR_GRADIENT_DONE : REST_DAY_LINEAR_GRADIENT;
        const imageGradientColors = [
            chroma(backgroundGradientColors[0]).alpha(0.8).css(),
            chroma(backgroundGradientColors[1]).alpha(0.95).css()
        ];
        const restDayTitle: string = restDay.title ? restDay.title : I18n.t('myProgram.restDayTitle');
        const titleStyle = [
            styles.workoutTitle,
            styles.restDayTitle,
            done ? styles.restDayTextDone : {}
        ];
        const messageStyle = [
            styles.restDayMessage,
            done ? styles.restDayTextDone : {}
        ];
        const authorStyle = [
            styles.restDayAuthor,
            done ? styles.restDayTextDone : {}
        ];
        const quoteStyle = [
            styles.restDayQuote,
            done ? styles.restDayQuoteDone : {}
        ];
        return (
            <View style={styles.restDayContainer}>
                <LinearGradient
                    colors={backgroundGradientColors}
                    start={{x: 0, y: 0.5}} end={{x: 1, y: 1}}
                    style={styles.restDayGradient}
                />
                { restDay.image && restDay.image.thumbnailUrl &&
                    <View style={styles.restDayImageWrapper}>
                        <FadeInImage
                            source={{ uri: restDay.image.thumbnailUrl }}
                            duration={300}
                            initialZoom={1.4}
                            zoomDuration={900}
                            containerCustomStyle={styles.restDayImageContainer}
                            loaderColor={getLoaderColor()}
                        />
                        <LinearGradient
                            colors={imageGradientColors}
                            start={{x: 0, y: 0.3}} end={{x: 0.8, y: 1}}
                            style={styles.restDayGradient}
                        />
                    </View>
                }
                <View style={styles.restDayContentContainer}>
                    <View style={{flex: 1}}>
                        <Text style={titleStyle} numberOfLines={2}>
                            { restDayTitle }
                        </Text>
                        <View style={styles.restDayQuoteContainer}>
                            <View style={styles.restDayQuoteContainerInner}>
                                <Image source={QUOTE} style={quoteStyle} />
                                <Text style={messageStyle} numberOfLines={6}>{ restDay.message }</Text>
                                <Text style={authorStyle} numberOfLines={2}>— { restDay.quoteAuthor }</Text>
                            </View>
                        </View>
                    </View>
                    { !done &&
                        <View style={styles.restDayButtonContainer}>
                            <TouchableScale
                                onPress={() => this.onPressRestDayButton(weekItem)}
                                style={styles.restDayButton}
                            >
                                <Text style={styles.restDayGoButtonText}>{ I18n.t('myProgram.done') }</Text>
                            </TouchableScale>
                        </View>
                    }
                </View>
            </View>
        );
    }

    public render (): JSX.Element {
        const { weekItem } = this.props;
        const done: boolean = this.isDone();
        const item = weekItem.workout ? this.workout : (weekItem.restDay ? this.restDay : null);
        const ComponentName = weekItem.restDay ? View : TouchableScale;
        const specificProps = weekItem.restDay ? {} : {
            onPress: debounce(this.go, 1500, { 'leading': true, 'trailing': false })
        };

        return (
            <ComponentName
                { ...specificProps }
                style={styles.itemContainer}
            >
                <View style={styles.borderContainer}>
                    <View style={styles.border} />
                </View>
                <DiffuseShadow
                    style={styles.diffuseShadow}
                    horizontalOffset={DIFFUSE_SHADOW_HORIZONTAL_OFFSET}
                    verticalOffset={done ? DIFFUSE_SHADOW_VERTICAL_OFFSET_DONE : DIFFUSE_SHADOW_VERTICAL_OFFSET}
                    borderRadius={DIFFUSE_SHADOW_BORDER_RADIUS}
                    shadowOpacity={done ? DIFFUSE_SHADOW_OPACITY_DONE : DIFFUSE_SHADOW_OPACITY}
                    color={DIFFUSE_SHADOW_COLOR}
                />
                <View style={styles.contentContainer}>
                    { item }
                </View>
                {/* <OngoingWorkoutBadge containerStyle={styles.badge} workoutId={weekItem.workout?.id} /> */}
            </ComponentName>
        );
    }
}

const mapStateToProps = (state: IReduxState) => ({
    progression: state.progression,
    workoutProgression: state.workoutProgression
});

export default connect(mapStateToProps, { }) (MyProgramEntry);
