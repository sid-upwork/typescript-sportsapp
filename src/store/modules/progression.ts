import { handleActions, createAction } from 'redux-actions';
import { IWorkoutHistory } from '../../types/progression';

export interface IProgramState {
    id?: string;
    title?: string;
}

export interface IWeekState {
    id?: string;
    position?: number;
    workoutsCount?: number;
    workoutsDone?: IWorkoutHistory[];
    workoutsDoneCount?: number;
}

export interface IProgressionState {
    error?: boolean;
    program: IProgramState;
    week: IWeekState;
    openProgressionProgramPopup?: boolean;
}

export const CONSTANTS = {
    RESET: 'progression/RESET',
    SET_PROGRAM_DATA: 'progression/SET_PROGRAM_DATA',
    SET_WEEK_DATA: 'progression/SET_WEEK_DATA',
    SET_PROGRESSION_DATA: 'progression/SET_PROGRESSION_DATA',
    SET_ERROR: 'progression/SET_ERROR',
    SET_OPEN_PROGRESSION_PROGRAM_POPUP: 'progression/SET_OPEN_PROGRESSION_PROGRAM_POPUP'
};

export const reset = createAction(CONSTANTS.RESET);

export const setProgramData = createAction(
    CONSTANTS.SET_PROGRAM_DATA,
    (program: IProgramState) => program
);

export const setWeekData = createAction(
    CONSTANTS.SET_WEEK_DATA,
    (week: IWeekState) => week
);

export const setProgressionData = createAction(
    CONSTANTS.SET_PROGRESSION_DATA,
    (progression: IProgressionState) => progression
);

export const setError = createAction(
    CONSTANTS.SET_ERROR,
    (error: boolean) => error
);

export const setOpenProgressionProgramPopup = createAction(
    CONSTANTS.SET_OPEN_PROGRESSION_PROGRAM_POPUP,
    (openProgressionProgramPopup: boolean) => openProgressionProgramPopup
);

const initialState: IProgressionState = {
    week: undefined,
    program: undefined,
    error: false,
    openProgressionProgramPopup: false
};

export default handleActions<IProgressionState, any>(
    {
        [CONSTANTS.SET_PROGRAM_DATA]: (state: IProgressionState, { payload }: { payload: IProgramState }) => ({
            ...state,
            program: payload
        }),
        [CONSTANTS.SET_WEEK_DATA]: (state: IProgressionState, { payload }: { payload: IWeekState }) => ({
            ...state,
            week: payload
        }),
        [CONSTANTS.SET_PROGRESSION_DATA]: (state: IProgressionState, { payload }: { payload: IProgressionState }) => ({
            ...state,
            program: payload.program,
            week: payload.week
        }),
        [CONSTANTS.SET_ERROR]: (state: IProgressionState, { payload }: { payload: boolean }) => ({
            ...state,
            error: payload
        }),
        [CONSTANTS.SET_OPEN_PROGRESSION_PROGRAM_POPUP]: (state: IProgressionState, { payload }: { payload: boolean }) => ({
            ...state,
            openProgressionProgramPopup: payload
        }),
        [CONSTANTS.RESET]: () => initialState
    },
    initialState
);
