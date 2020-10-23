import { handleActions, createAction } from 'redux-actions';
import { AnyAction } from 'redux';
import { IReduxState } from '../reducers';

export interface IWorkoutDurationState {
    duration: number;
    lastWorkoutDurationUpdate: number;
}

export const CONSTANTS = {
    RESET: 'workoutDuration/RESET',
    SET_DURATION: 'workoutDuration/SET_DURATION',
    SET_LAST_WORKOUT_DURATION_UPDATE: 'workoutDuration/SET_LAST_WORKOUT_DURATION_UPDATE',
    SET_WORKOUT_DURATION_DATA: 'workoutDuration/SET_WORKOUT_DURATION_DATA'
};

export const reset = createAction(CONSTANTS.RESET);
export const setDuration = createAction(
    CONSTANTS.SET_DURATION,
    (duration: number) => duration
);
export const setLastWorkoutDurationUpdate = createAction(
    CONSTANTS.SET_LAST_WORKOUT_DURATION_UPDATE,
    (lastWorkoutDurationUpdate: number) => lastWorkoutDurationUpdate
);
export const setWorkoutDurationData = createAction(
    CONSTANTS.SET_WORKOUT_DURATION_DATA,
    (workoutDurationData: IWorkoutDurationState) => workoutDurationData
);

export function resetWorkoutDuration (): any {
    return async (dispatch: (action: AnyAction) => Promise<void>) => {
        await dispatch(reset());
        return;
    };
}

export function updateWorkoutDuration ({ newDuration, durationToAdd }: { newDuration?: number, durationToAdd?: number }):
(dispatch: (action: AnyAction) => Promise<void>, getState: () => IReduxState) => Promise<void> {
    return async (dispatch: (action: AnyAction) => Promise<void>, getState: () => IReduxState) => {
        const newWorkoutDuration: IWorkoutDurationState = getState().workoutDuration;
        if (!!durationToAdd || durationToAdd === 0) {
            newWorkoutDuration.duration += durationToAdd;
        } else {
            newWorkoutDuration.duration = newDuration;
        }

        await dispatch(setWorkoutDurationData({
            duration: newWorkoutDuration.duration,
            lastWorkoutDurationUpdate: new Date().getTime()
        }));
        return;
    };
}

const initialState: IWorkoutDurationState = {
    duration: 0,
    lastWorkoutDurationUpdate: undefined
};

export default handleActions<IWorkoutDurationState, any>(
    {
        [CONSTANTS.SET_DURATION]: (state: IWorkoutDurationState, { payload }: { payload: number }) => ({
            ...state,
            duration: payload
        }),
        [CONSTANTS.SET_LAST_WORKOUT_DURATION_UPDATE]: (state: IWorkoutDurationState, { payload }: { payload: number }) => ({
            ...state,
            lastWorkoutDurationUpdate: payload
        }),
        [CONSTANTS.SET_WORKOUT_DURATION_DATA]: (state: IWorkoutDurationState, { payload }: { payload: IWorkoutDurationState }) => ({
            ...state,
            ...payload
        }),
        [CONSTANTS.RESET]: () => ({
            ...initialState
        })
    },
    initialState
);
