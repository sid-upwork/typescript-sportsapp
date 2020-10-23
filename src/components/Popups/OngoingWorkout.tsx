import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { IReduxState } from '../../store/reducers';
import { connect } from 'react-redux';
import { INavigateEntry } from '../../navigation/services';
import { IProgressionState } from '../../store/modules/progression';
import { IWorkoutProgressionState, setWorkoutPaused, resetWorkoutHistory } from '../../store/modules/workoutProgression';
import { IWorkoutDurationState, updateWorkoutDuration } from '../../store/modules/workoutDuration';
import { navigateToWorkoutOverview } from '../../utils/navigation';
import { completeWorkoutManually } from '../../utils/progression';
import { getFormattedDate } from '../../utils/date';
import { confirmPopup } from '../../utils/confirmPopup';
import i18n from '../../utils/i18n';

import SharedButton from '../SharedButton';
import PopupManager from '../PopupManager';
import ToastManager from '../ToastManager';

import styles from '../../styles/components/Popups/OngoingWorkout.style';

const CALENDAR_ICON = require('../../static/icons/calendar.png');

interface IProps {
    navigate: (entry: INavigateEntry) => void;
    popupManagerRef: React.RefObject<PopupManager>;
    progression: IProgressionState;
    resetWorkoutHistory: () => void;
    setWorkoutPaused: (workoutPaused: boolean) => void;
    toastManagerRef: React.RefObject<ToastManager>;
    updateWorkoutDuration: ({ newDuration, durationToAdd }: { newDuration?: number, durationToAdd?: number }) => void;
    workoutDuration: IWorkoutDurationState;
    workoutProgression: IWorkoutProgressionState;
}

interface IState {}

class OngoingWorkout extends Component<IProps, IState> {
    private date: string;
    private workoutTitle: string;

    constructor (props: IProps) {
        super(props);
        this.date = getFormattedDate(props.workoutProgression?.workoutStartDate);
        this.workoutTitle = props.workoutProgression?.currentWorkout?.title;
    }

    private onPressContinueNow = (): void => {
        this.updateWorkoutTimer();

        navigateToWorkoutOverview(
            this.props.navigate,
            this.props.workoutProgression?.currentWorkout,
            undefined,
            !!this.props.workoutProgression?.workoutHistory?.programWeekId,
            this.props.workoutProgression?.workoutHistory?.position,
            this.props.workoutProgression?.workoutOrigin,
            this.props.workoutProgression?.targetedTrainingId
        );

        this.props.popupManagerRef?.current?.dismissPopup();
    }

    private onPressContinueLater = (): void => {
        this.updateWorkoutTimer();
        this.props.popupManagerRef?.current?.dismissPopup();
    }

    private onPressCompleted = (): void => {
        const { popupManagerRef, progression, toastManagerRef, workoutProgression } = this.props;

        const confirmWorkoutDone = async () => {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.toastUpdateMessage'),
                type: 'info'
            });

            try {
                /* TODO:
                 * - we should call createHistoryWorkout directly
                 * - do not forget to call getWorkoutCompletionPercentage and log the event
                 * - refactor completeWorkoutManually that will become less complex...
                */
                await completeWorkoutManually(
                    workoutProgression?.currentWorkout?.id,
                    workoutProgression?.workoutHistory?.position,
                    progression,
                    workoutProgression?.workoutOrigin,
                    workoutProgression,
                    workoutProgression?.currentWorkout?.title
                );

                popupManagerRef?.current?.dismissPopup();

                toastManagerRef?.current?.openToast({
                    message: i18n.t('app.toastUpdateSuccessMessage'),
                    type: 'info'
                });
            } catch (error) {
                console.log(error);
                toastManagerRef?.current?.openToast({
                    message: i18n.t('app.fetchError'),
                    type: 'error'
                });
            }
        };

        confirmPopup(confirmWorkoutDone);
    }

    private onPressSkip = (): void => {
        const confirmSkip = () => {
            this.props.resetWorkoutHistory();
            this.props.popupManagerRef?.current?.dismissPopup();
        };

        confirmPopup(
            confirmSkip,
            null,
            null,
            i18n.t('ongoingWorkout.skipConfirmMessage')
        );
    }

    private updateWorkoutTimer (): void {
        const { toastManagerRef, workoutProgression, workoutDuration } = this.props;

        if (!workoutProgression || !workoutProgression?.currentWorkout || !workoutDuration) {
            toastManagerRef?.current?.openToast({
                message: i18n.t('app.fetchError'),
                type: 'error'
            });
            return;
        }

        // For now we won't use the advanced logic that updates the timer when the app is closed or crashes
        // It might prove confusing to the user in fact
        if (workoutProgression && !workoutProgression.workoutPaused) {
            this.props.setWorkoutPaused(true);
        }

        // if (!workoutPaused && !!workoutDuration?.lastWorkoutDurationUpdate) {
        //     const { timeTrial, timeTrialDuration } = currentWorkout;

        //     // A workout was in progress when the app closed so we need to update the workout's duration
        //     const secondsAwayFromApp = Math.round((new Date().getTime() - workoutDuration.lastWorkoutDurationUpdate) / 1000);

        //     if (timeTrial && workoutDuration.duration + secondsAwayFromApp >= timeTrialDuration) {
        //         // User ran out of time while away
        //         this.props.updateWorkoutDuration({ newDuration: timeTrialDuration });
        //     } else {
        //         this.props.updateWorkoutDuration({ durationToAdd: secondsAwayFromApp });
        //     }

        //     this.props.setWorkoutPaused(true);
        // }
    }

    private get infos (): JSX.Element {
        return (
            <View style={styles.infoContainer}>
                <Text numberOfLines={3} style={styles.workoutTitle}>{ this.workoutTitle }</Text>
                <View style={styles.info}>
                    <Image source={CALENDAR_ICON} style={styles.icon} />
                    <Text numberOfLines={1} style={styles.date}> { i18n.t('ongoingWorkout.startedOn') } { this.date }</Text>
                </View>
            </View>
        );
    }

    private get buttons (): JSX.Element {
        return (
            <View style={styles.buttonContainer}>
                <View style={styles.continueContainer}>
                    <View style={styles.continueNow}>
                        <SharedButton onPress={this.onPressContinueNow} text={i18n.t('ongoingWorkout.continueNow')} />
                    </View>
                    <View style={styles.remindMe}>
                        <SharedButton onPress={this.onPressContinueLater} text={i18n.t('ongoingWorkout.remindMe')} />
                    </View>
                </View>
                <SharedButton
                    color={'pink'}
                    onPress={this.onPressCompleted}
                    style={styles.completeButton}
                    text={i18n.t('ongoingWorkout.markAsCompleted')}
                />
                <SharedButton
                    color={'white'}
                    onPress={this.onPressSkip}
                    text={i18n.t('ongoingWorkout.skip')}
                />
            </View>
        );
    }

    public render (): JSX.Element {
        return (
            <View style={styles.container}>
                { this.infos }
                { this.buttons }
            </View>
        );
    }
}


const mapStateToProps = (state: IReduxState) => {
    return {
        progression: state.progression,
        workoutDuration: state.workoutDuration,
        workoutProgression: state.workoutProgression
    };
};

export default connect(mapStateToProps, { setWorkoutPaused, updateWorkoutDuration, resetWorkoutHistory })(OngoingWorkout);
