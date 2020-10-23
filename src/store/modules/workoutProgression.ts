import { handleActions, createAction } from 'redux-actions';
import { IWorkout, TExerciseTypes } from '../../types/workout';
import { AnyAction } from 'redux';
import { IReduxState } from '../reducers';
import { resetWorkoutDuration } from './workoutDuration';
import { TWorkoutOrigin } from '../../utils/navigation';
import { TTargetedTrainingId } from '../../components/Training/TargetedTrainingItem';

export interface IWorkoutHistoryState {
    exerciseHistories?: IExerciseHistoryState[];
    position?: number;
    programWeekId?: string;
    restDayId?: string;
    totalReps?: number;
    workoutId?: string;
}

export interface IWorkoutHistoryPost extends IWorkoutHistoryState {
    duration?: number;
}

export interface IExerciseHistoryState {
    exerciseId: string;
    circuitExercisesId: string;
    position: number;
    type: TExerciseTypes;
    setsType: 'regular' | 'failure';
    setHistories: ISetHistoryState[];
}

export interface ISetHistoryState {
    weight: number | string;
    scored: number;
    position: number;
}

export interface IWorkoutProgressionState {
    currentExerciseIndex: number;
    currentWorkout: IWorkout;
    targetedTrainingId: TTargetedTrainingId;
    workoutHistory: IWorkoutHistoryState;
    workoutOrigin: TWorkoutOrigin;
    workoutPaused: boolean;
    workoutStartDate: number;
}

export const CONSTANTS = {
    SET_CURRENT_EXERCISE_INDEX: 'progression/SET_CURRENT_EXERCISE_INDEX',
    SET_CURRENT_PROGRAM: 'progression/SET_CURRENT_PROGRAM',
    SET_CURRENT_WORKOUT: 'progression/SET_CURRENT_WORKOUT',
    SET_TARGETED_TRAINING_ID: 'progression/SET_TARGETED_TRAINING_ID',
    SET_TOTAL_REPS: 'progression/SET_TOTAL_REPS',
    SET_WORKOUT_HISTORY: 'progression/SET_WORKOUT_HISTORY',
    SET_WORKOUT_ORIGIN: 'progression/SET_WORKOUT_ORIGIN',
    SET_WORKOUT_PAUSED: 'progression/SET_WORKOUT_PAUSED',
    RESET_WORKOUT_HISTORY: 'progression/RESET_WORKOUT_HISTORY'
};

export const setCurrentExerciseIndex = createAction(
    CONSTANTS.SET_CURRENT_EXERCISE_INDEX,
    (exerciseIndex: number) => exerciseIndex
);
export const setCurrentWorkout = createAction(
    CONSTANTS.SET_CURRENT_WORKOUT,
    (workout: IWorkout) => workout
);
export const setTargetedTrainingId = createAction(
    CONSTANTS.SET_TARGETED_TRAINING_ID,
    (targetedTrainingId: TTargetedTrainingId) => targetedTrainingId
);
export const setTotalReps = createAction(
    CONSTANTS.SET_TOTAL_REPS,
    (totalReps: number) => totalReps
);
export const setWorkoutOrigin = createAction(
    CONSTANTS.SET_WORKOUT_ORIGIN,
    (workoutOrigin: TWorkoutOrigin) => workoutOrigin
);
export const setWorkoutHistory = createAction(
    CONSTANTS.SET_WORKOUT_HISTORY,
    (workoutHistory: IWorkoutHistoryState) => workoutHistory
);
export const setWorkoutPaused = createAction(
    CONSTANTS.SET_WORKOUT_PAUSED,
    (workoutPaused: boolean) => workoutPaused
);

const reset = createAction(CONSTANTS.RESET_WORKOUT_HISTORY);

export function resetWorkoutHistory (): any {
    return async (dispatch: (action: AnyAction) => Promise<void>) => {
        await dispatch(reset());
        await dispatch(resetWorkoutDuration());
        return;
    };
}

export function addExerciseHistory (exerciseHistory: IExerciseHistoryState): any {
    return async (dispatch: (action: AnyAction) => Promise<void>, getState: () => IReduxState) => {
        const newWorkoutHistory = getState().workoutProgression?.workoutHistory;

        if (!newWorkoutHistory) {
            throw new Error('workoutHistory not found');
        }

        newWorkoutHistory.exerciseHistories?.push(exerciseHistory);

        await dispatch(setWorkoutHistory(newWorkoutHistory));
        return;
    };
}

export function addSetsHistory (newSetsHistory: ISetHistoryState[], exercisePosition: number): any {
    return async (dispatch: (action: AnyAction) => Promise<void>, getState: () => IReduxState) => {
        const newWorkoutHistory = getState().workoutProgression?.workoutHistory;

        if (!newWorkoutHistory) {
            throw new Error('workoutHistory not found');
        }

        const exerciseHistoryIndex = newWorkoutHistory?.exerciseHistories?.findIndex((exerciseHistory: IExerciseHistoryState) =>
            exerciseHistory.position === exercisePosition
        );

        if (exerciseHistoryIndex === -1) {
            throw new Error('exerciseHistory not found');
        }

        newSetsHistory.forEach((newSetHistory: ISetHistoryState) => {
            const setHistoryIndex = newWorkoutHistory?.exerciseHistories[exerciseHistoryIndex]?.setHistories?.findIndex(
                (setHistory: ISetHistoryState) => setHistory.position === newSetHistory.position);
            if (setHistoryIndex === -1) {
                newWorkoutHistory?.exerciseHistories[exerciseHistoryIndex]?.setHistories?.push(newSetHistory);
            }
        });
        await dispatch(setWorkoutHistory(newWorkoutHistory));
        return;
    };
}

export function updateSetHistory (newSetHistory: ISetHistoryState, exercisePosition: number): any {
    return async (dispatch: (action: AnyAction) => Promise<void>, getState: () => IReduxState) => {
        const newWorkoutHistory = getState().workoutProgression?.workoutHistory;

        if (!newWorkoutHistory) {
            throw new Error('workoutHistory not found');
        }

        const exerciseHistoryIndex = newWorkoutHistory?.exerciseHistories?.findIndex((exerciseHistory: IExerciseHistoryState) =>
            exerciseHistory.position === exercisePosition
        );

        if (exerciseHistoryIndex === -1) {
            throw new Error('exerciseHistory not found');
        }

        const setHistoryIndex = newWorkoutHistory?.exerciseHistories[exerciseHistoryIndex]?.setHistories?.findIndex(
            (setHistory: ISetHistoryState) => setHistory.position === newSetHistory.position);

        if (setHistoryIndex === -1) {
            throw new Error('setHistory not found');
        }

        newWorkoutHistory.exerciseHistories[exerciseHistoryIndex].setHistories[setHistoryIndex] = newSetHistory;
        await dispatch(setWorkoutHistory(newWorkoutHistory));
        return;
    };
}

export function removeSetsHistory (setPositions: number[], exercisePosition: number): any {
    return async (dispatch: (action: AnyAction) => Promise<void>, getState: () => IReduxState) => {
        const newWorkoutHistory = getState().workoutProgression?.workoutHistory;

        if (!newWorkoutHistory) {
            throw new Error('workoutHistory not found');
        }

        const exerciseHistoryIndex = newWorkoutHistory?.exerciseHistories?.findIndex((exerciseHistory: IExerciseHistoryState) =>
            exerciseHistory.position === exercisePosition
        );

        if (exerciseHistoryIndex === -1) {
            throw new Error('exerciseHistory not found');
        }

        setPositions.forEach((setPosition: number) => {
            const setHistoryIndex = newWorkoutHistory?.exerciseHistories[exerciseHistoryIndex]?.setHistories?.findIndex(
                (setHistory: ISetHistoryState) => setHistory.position === setPosition);

            if (setHistoryIndex !== -1) {
                newWorkoutHistory?.exerciseHistories[exerciseHistoryIndex]?.setHistories?.splice(setHistoryIndex, 1);
            }
            // if (setHistoryIndex === -1) {
            //     throw new Error('setHistory not found');
            // }
        });

        await dispatch(setWorkoutHistory(newWorkoutHistory));
        return;
    };
}

const initialState: IWorkoutProgressionState = {
    currentExerciseIndex: undefined,
    currentWorkout: undefined,
    targetedTrainingId: undefined,
    workoutHistory: undefined,
    workoutOrigin: undefined,
    workoutPaused: undefined,
    workoutStartDate: undefined
};

export default handleActions<IWorkoutProgressionState, any>(
    {
        [CONSTANTS.SET_CURRENT_EXERCISE_INDEX]: (state: IWorkoutProgressionState, { payload }: { payload: number }) => ({
            ...state,
            currentExerciseIndex: payload
        }),
        [CONSTANTS.SET_CURRENT_WORKOUT]: (state: IWorkoutProgressionState, { payload }: { payload: IWorkout }) => ({
            ...state,
            currentWorkout: payload,
            workoutStartDate: new Date().getTime()
        }),
        [CONSTANTS.SET_TARGETED_TRAINING_ID]: (state: IWorkoutProgressionState, { payload }: { payload: TTargetedTrainingId }) => ({
            ...state,
            targetedTrainingId: payload
        }),
        [CONSTANTS.SET_TOTAL_REPS]: (state: IWorkoutProgressionState, { payload }: { payload: number }) => ({
            ...state,
            workoutHistory: {
                ...state.workoutHistory,
                totalReps: payload
            }
        }),
        [CONSTANTS.SET_WORKOUT_HISTORY]: (state: IWorkoutProgressionState, { payload }: { payload: IWorkoutHistoryState }) => ({
            ...state,
            workoutHistory: payload
        }),
        [CONSTANTS.SET_WORKOUT_ORIGIN]: (state: IWorkoutProgressionState, { payload }: { payload: TWorkoutOrigin }) => ({
            ...state,
            workoutOrigin: payload
        }),
        [CONSTANTS.SET_WORKOUT_PAUSED]: (state: IWorkoutProgressionState, { payload }: { payload: boolean }) => ({
            ...state,
            workoutPaused: payload
        }),
        [CONSTANTS.RESET_WORKOUT_HISTORY]: () => ({
            ...initialState
        })
    },
    initialState
);
