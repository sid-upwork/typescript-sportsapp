import { handleActions, createAction } from 'redux-actions';
import { IReduxState } from '../reducers';
import { AnyAction } from 'redux';
import { cloneDeep } from 'lodash';

export enum ETooltipIds {
    blogArticles = 'blogArticles',
    blogLatestNews = 'blogLatestNews',
    recipeCookTime = 'recipeCookTime',
    recipePrepTime = 'recipePrepTime',
    recipeServings = 'recipeServings',
    recipeTotalTime = 'recipeTotalTime',
    trainingManage = 'trainingManage',
    trainingQuickWorkout = 'trainingQuickWorkout',
    trainingTargetedArea = 'trainingTargetedArea',
    trainingWeeklyChallenge = 'trainingWeeklyChallenge',
    trainingYoga = 'trainingYoga',
    workoutCompletionPercentage = 'workoutCompletionPercentage',
    workoutExerciseVideo = 'workoutExerciseVideo',
    workoutMainTimer = 'workoutMainTimer',
    workoutMenu = 'workoutMenu',
    workoutMenuComplete = 'workoutMenuComplete',
    workoutMenuHistory = 'workoutMenuHistory',
    workoutMenuQuit = 'workoutMenuQuit',
    workoutMenuSummary = 'workoutMenuSummary',
    workoutOverviewAlternative = 'workoutOverviewAlternative',
    workoutOverviewQuickComplete = 'workoutOverviewQuickComplete',
    workoutOverviewSets = 'workoutOverviewSets',
    workoutRestTimer = 'workoutRestTimer',
    workoutTable = 'workoutTable'
}

export interface IHiddenTooltipsState {
    [ETooltipIds.blogArticles]: boolean;
    [ETooltipIds.blogLatestNews]: boolean;
    [ETooltipIds.recipeCookTime]: boolean;
    [ETooltipIds.recipePrepTime]: boolean;
    [ETooltipIds.recipeServings]: boolean;
    [ETooltipIds.recipeTotalTime]: boolean;
    [ETooltipIds.trainingManage]: boolean;
    [ETooltipIds.trainingQuickWorkout]: boolean;
    [ETooltipIds.trainingTargetedArea]: boolean;
    [ETooltipIds.trainingWeeklyChallenge]: boolean;
    [ETooltipIds.trainingYoga]: boolean;
    [ETooltipIds.workoutCompletionPercentage]: boolean;
    [ETooltipIds.workoutExerciseVideo]: boolean;
    [ETooltipIds.workoutMainTimer]: boolean;
    [ETooltipIds.workoutMenu]: boolean;
    [ETooltipIds.workoutMenuComplete]: boolean;
    [ETooltipIds.workoutMenuHistory]: boolean;
    [ETooltipIds.workoutMenuQuit]: boolean;
    [ETooltipIds.workoutMenuSummary]: boolean;
    [ETooltipIds.workoutOverviewAlternative]: boolean;
    [ETooltipIds.workoutOverviewQuickComplete]: boolean;
    [ETooltipIds.workoutOverviewSets]: boolean;
    [ETooltipIds.workoutRestTimer]: boolean;
    [ETooltipIds.workoutTable]: boolean;
}

export interface ITutorialsState {
    hideTooltips: boolean;
    hiddenTooltips: IHiddenTooltipsState;
    trainingVideoSeen: boolean;
    workoutOverviewScrollHintSeen: boolean;
    workoutOverviewVideoSeen: boolean;
}

export const constants = {
    RESET: 'tutorials/RESET',
    SET_HIDE_TOOLTIPS: 'tutorials/SET_HIDE_TOOLTIPS',
    SET_HIDDEN_TOOLTIPS: 'tutorials/SET_HIDDEN_TOOLTIPS',
    SET_TRAINING_VIDEO_SEEN: 'tutorials/SET_TRAINING_VIDEO_SEEN',
    SET_WORKOUT_OVERVIEW_SCROLL_HINT_SEEN: 'tutorials/SET_WORKOUT_OVERVIEW_SCROLL_HINT_SEEN',
    SET_WORKOUT_OVERVIEW_VIDEO_SEEN: 'tutorials/SET_WORKOUT_OVERVIEW_VIDEO_SEEN'
};

export const initialHiddenTooltipsState = {
    [ETooltipIds.blogArticles]: false,
    [ETooltipIds.blogLatestNews]: false,
    [ETooltipIds.recipeCookTime]: false,
    [ETooltipIds.recipePrepTime]: false,
    [ETooltipIds.recipeServings]: false,
    [ETooltipIds.recipeTotalTime]: false,
    [ETooltipIds.trainingManage]: false,
    [ETooltipIds.trainingQuickWorkout]: false,
    [ETooltipIds.trainingTargetedArea]: false,
    [ETooltipIds.trainingWeeklyChallenge]: false,
    [ETooltipIds.trainingYoga]: false,
    [ETooltipIds.workoutCompletionPercentage]: false,
    [ETooltipIds.workoutExerciseVideo]: false,
    [ETooltipIds.workoutMainTimer]: false,
    [ETooltipIds.workoutMenu]: false,
    [ETooltipIds.workoutMenuComplete]: false,
    [ETooltipIds.workoutMenuHistory]: false,
    [ETooltipIds.workoutMenuQuit]: false,
    [ETooltipIds.workoutMenuSummary]: false,
    [ETooltipIds.workoutOverviewAlternative]: false,
    [ETooltipIds.workoutOverviewQuickComplete]: false,
    [ETooltipIds.workoutOverviewSets]: false,
    [ETooltipIds.workoutRestTimer]: false,
    [ETooltipIds.workoutTable]: false
};

const initialState: ITutorialsState = {
    hideTooltips: false,
    hiddenTooltips: initialHiddenTooltipsState,
    trainingVideoSeen: false,
    workoutOverviewScrollHintSeen: false,
    workoutOverviewVideoSeen: false
};

export const reset = createAction(constants.RESET);

export const setHideTooltips = createAction(
    constants.SET_HIDE_TOOLTIPS,
    (hide: boolean) => hide
);

export const setHiddenTooltips = createAction(
    constants.SET_HIDDEN_TOOLTIPS,
    (hiddenTooltips: IHiddenTooltipsState) => hiddenTooltips
);
export const setTrainingVideoSeen = createAction(
    constants.SET_TRAINING_VIDEO_SEEN,
    (seen: boolean) => seen
);
export const setWorkoutOverviewScrollHintSeen = createAction(
    constants.SET_WORKOUT_OVERVIEW_SCROLL_HINT_SEEN,
    (seen: boolean) => seen
);
export const setWorkoutOverviewVideoSeen = createAction(
    constants.SET_WORKOUT_OVERVIEW_VIDEO_SEEN,
    (seen: boolean) => seen
);

export function setTooltipStatus (tooltipId: ETooltipIds, hide: boolean): any {
    return (dispatch: (action: AnyAction) => void, getState: () => IReduxState) => {
        // A cloneDeep is required here to avoid mutation of the state
        const newHiddenTooltips = cloneDeep(getState().tutorials?.hiddenTooltips);
        newHiddenTooltips[tooltipId] = hide;

        dispatch(setHiddenTooltips(newHiddenTooltips));
    };
}

export function setAllTooltipStatus (hide: boolean): any {
    return (dispatch: (action: AnyAction) => void) => {
        // A cloneDeep is required here to avoid mutation of the state
        const newHiddenTooltips = cloneDeep(initialState.hiddenTooltips);

        if (hide) {
            Object.keys(newHiddenTooltips).forEach((key: string) => {
                newHiddenTooltips[key] = true;
            });

            dispatch(setHideTooltips(true));
        } else {
            dispatch(setHideTooltips(false));
        }

        dispatch(setHiddenTooltips(newHiddenTooltips));
    };
}

export default handleActions<ITutorialsState, any>({
    [constants.RESET]: (state: ITutorialsState, { payload }: { payload: boolean }) => ({
        ...initialState
    }),
    [constants.SET_HIDE_TOOLTIPS]: (state: ITutorialsState, { payload }: { payload: boolean }) => ({
        ...state,
        hideTooltips: payload
    }),
    [constants.SET_HIDDEN_TOOLTIPS]: (state: ITutorialsState, { payload }: { payload: IHiddenTooltipsState }) => ({
        ...state,
        hiddenTooltips: payload
    }),
    [constants.SET_TRAINING_VIDEO_SEEN]: (state: ITutorialsState, { payload }: { payload: boolean }) => ({
        ...state,
        trainingVideoSeen: payload
    }),
    [constants.SET_WORKOUT_OVERVIEW_SCROLL_HINT_SEEN]: (state: ITutorialsState, { payload }: { payload: boolean }) => ({
        ...state,
        workoutOverviewScrollHintSeen: payload
    }),
    [constants.SET_WORKOUT_OVERVIEW_VIDEO_SEEN]: (state: ITutorialsState, { payload }: { payload: boolean }) => ({
        ...state,
        workoutOverviewVideoSeen: payload
    })
}, initialState);
