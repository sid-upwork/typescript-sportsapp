import { handleActions, createAction } from 'redux-actions';

export enum OnboardingSteps {
    Onboarding = 'onboarding',
    ProgramSelection = 'programSelection',
    Done = 'done'
}

export interface IOnboardingState {
    currentStep: OnboardingSteps;
    skipVideo: boolean;
}

export const CONSTANTS = {
    SET_CURRENT_STEP: 'userInterface/SET_CURRENT_STEP',
    SET_SKIP_VIDEO: 'userInterface/SET_SKIP_VIDEO',
    RESET: 'userInterface/RESET'
};

const initialState: IOnboardingState = {
    currentStep: OnboardingSteps.Onboarding,
    skipVideo: false
};

export const updateOnboardingStep = createAction(CONSTANTS.SET_CURRENT_STEP, (step: OnboardingSteps) => step);
export const skipOnboardingVideo = createAction(CONSTANTS.SET_SKIP_VIDEO, (skipVideo: boolean) => skipVideo);
export const resetOnboarding = createAction(CONSTANTS.RESET);

export default handleActions<IOnboardingState, any>({
    [CONSTANTS.SET_CURRENT_STEP]: (state: IOnboardingState, { payload }: { payload: OnboardingSteps }) => ({
        ...state,
        currentStep: payload
    }),
    [CONSTANTS.SET_SKIP_VIDEO]: (state: IOnboardingState, { payload }: { payload: boolean }) => ({
        ...state,
        skipVideo: payload
    }),
    [CONSTANTS.RESET]: () => initialState
}, initialState);
