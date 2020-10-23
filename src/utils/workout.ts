import moment from 'moment';
import { orderBy } from 'lodash';
import crashlytics from '@react-native-firebase/crashlytics';
import i18n from './i18n';
import { IWorkout, TExerciseTypes, ISet, ICircuitExercise, ICircuit } from '../types/workout';
import { IWorkoutProgressionState, IExerciseHistoryState } from '../store/modules/workoutProgression';

export function getFormattedDuration (durationInSeconds: number, hideSeconds?: boolean, hideMinutes?: boolean, hideHours?: boolean): string {
    const momentDuration: moment.Duration = moment.duration(durationInSeconds, 's');
    const hours: number = momentDuration.hours();
    const minutes: number = momentDuration.minutes();
    const seconds: number = momentDuration.seconds();

    const h = hours > 0 && !hideHours ? `${hours}h ` : '';
    const m = minutes > 0 && !hideMinutes ? `${minutes}′ ` : '';
    const s = seconds > 0 && !hideSeconds ? `${seconds}′′` : '';

    return `${h}${m}${s}`;
}

export function getFormattedRepsRange (minReps?: number, maxReps?: number): string {
    return maxReps ? `${minReps ? minReps + '-' : ''}${maxReps}` : '';
}

export function getTargetLabel (target: number, type: TExerciseTypes): string {
    if (!target) {
        return '-';
    }
    if (!type) {
        return target.toString();
    }
    const label = type === 'time' ?
        (target === 1 ? i18n.t('workout.sec') : i18n.t('workout.secs')) :
        (target === 1 ? i18n.t('workout.rep') : i18n.t('workout.reps'));
    return `${target} ${label}`;
}

export function getSetsLabel (sets: ISet[], showNumber: boolean = true): string {
    const setsNumber = sets && sets.length;
    return setsNumber ? `${showNumber ? setsNumber + ' ' : ''}${setsNumber === 1 ? i18n.t('workout.set') : i18n.t('workout.sets')}` : '';
}

export function getCurrentSetLabel (sets: ISet[], activeIndex: number): string {
    const setsNumber = sets && sets.length;
    return setsNumber && activeIndex !== undefined ?
        `${i18n.t('workout.set')} ${activeIndex + 1}/${setsNumber}` :
        (setsNumber ? getSetsLabel(sets) : '');
}

export function getCircuitType (numberOfExercises: number): string {
    if (!numberOfExercises || numberOfExercises < 1) {
        return '';
    } else if (numberOfExercises === 1 ) {
        return '';
        // return i18n.t('workout.set');
    } else if (numberOfExercises === 2) {
        return i18n.t('workout.superset');
    } else if (numberOfExercises === 3) {
        return i18n.t('workout.triset');
    } else {
        return i18n.t('workout.circuit');
    }
}

export function getFirstExerciseWithUncompleteSet (workout: IWorkout, workoutProgression: IWorkoutProgressionState): number {
    try {
        if (!workout?.circuits?.length || !workoutProgression?.workoutHistory?.exerciseHistories?.length) {
            return 0;
        }
        let globalIndex = 0;
        const circuits = orderBy(workout?.circuits, 'position', 'asc');
        for (let circuitIndex = 0; circuitIndex < circuits.length; circuitIndex++) {
            if (!circuits[circuitIndex]?.circuitExercises?.length) {
                return 0;
            }
            const circuitExercises = orderBy(circuits[circuitIndex]?.circuitExercises, 'position', 'asc');
            for (let circuitExerciseIndex = 0; circuitExerciseIndex < circuitExercises?.length; circuitExerciseIndex++) {
                const exerciseHistoryIndex = workoutProgression.workoutHistory.exerciseHistories.findIndex(
                    (exerciseHistory: IExerciseHistoryState) => exerciseHistory.position === globalIndex
                );
                if (exerciseHistoryIndex === -1) {
                    return globalIndex;
                }
                const historySetsCount = workoutProgression.workoutHistory.exerciseHistories[exerciseHistoryIndex]?.setHistories?.length || 0;
                const setsCount = circuitExercises[circuitExerciseIndex]?.sets?.length || 0;
                if (!historySetsCount || setsCount > historySetsCount) {
                    return globalIndex;
                }
                globalIndex += 1;
            }
        }
    } catch (error) {
        console.log(error);
        crashlytics().recordError(error);
    }
    return 0;
}

export function getSetsDoneCount (exercisePosition: number, workoutProgression: IWorkoutProgressionState): number {
    const exerciseHistoryIndex = workoutProgression?.workoutHistory?.exerciseHistories?.findIndex(
        (exerciseHistory: IExerciseHistoryState) => exerciseHistory.position === exercisePosition
    );
    if (exerciseHistoryIndex !== -1) {
        return workoutProgression.workoutHistory.exerciseHistories[exerciseHistoryIndex].setHistories?.length;
    }
    return 0;
}

export function isExerciseFinished (circuitExercise: ICircuitExercise, exercisePosition: number, workoutProgression: IWorkoutProgressionState): boolean {
    const exerciseHistoryIndex = workoutProgression?.workoutHistory?.exerciseHistories?.findIndex(
        (exerciseHistory: IExerciseHistoryState) => exerciseHistory.position === exercisePosition
    );
    if (exerciseHistoryIndex !== -1) {
        const setsCount = workoutProgression.workoutHistory.exerciseHistories[exerciseHistoryIndex].setHistories?.length;
        if (circuitExercise?.sets?.length === setsCount) {
            return true;
        }
    }
    return false;
}

export function orderSets (workouts: IWorkout[]): IWorkout[] {
    workouts.forEach((workout: IWorkout) => {
        workout.circuits?.forEach((circuit: ICircuit) => {
            circuit.circuitExercises?.forEach((circuitExercise: ICircuitExercise) => {
                circuitExercise.sets = orderBy(circuitExercise.sets, 'position', 'asc');
            });
        });
    });
    return workouts;
}
