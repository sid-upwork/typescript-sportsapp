import { handleActions, createAction } from 'redux-actions';
import { IInfluencer } from '../../types/user';

export interface IInfluencersState {
    currentInfluencer: IInfluencer;
    firstTouchId: string;
    firstTouchLink: string;
    influencers: IInfluencer[];
    lastTouchId: string;
    lastTouchLink: string;
    lastTouchUpdateTimestamp: number;
}

export const CONSTANTS = {
    RESET: 'influencers/RESET',
    SET_CURRENT_INFLUENCER: 'influencers/SET_CURRENT_INFLUENCER',
    SET_INFLUENCERS: 'influencers/SET_INFLUENCERS',
    SET_FIRST_TOUCH_ID: 'influencers/SET_FIRST_TOUCH_ID',
    SET_FIRST_TOUCH_LINK: 'influencers/SET_FIRST_TOUCH_LINK',
    SET_LAST_TOUCH_ID: 'influencers/SET_LAST_TOUCH_ID',
    SET_LAST_TOUCH_LINK: 'influencers/SET_LAST_TOUCH_LINK',
    SET_LAST_TOUCH_UPDATE_PENDING: 'influencers/SET_LAST_TOUCH_UPDATE_PENDING',
    SET_LAST_TOUCH_UPDATE_TIMESTAMP: 'influencers/SET_LAST_TOUCH_UPDATE_TIMESTAMP'
};

const initialState: IInfluencersState = {
    currentInfluencer: undefined,
    firstTouchId: undefined,
    firstTouchLink: undefined,
    influencers: undefined,
    lastTouchId: undefined,
    lastTouchLink: undefined,
    lastTouchUpdateTimestamp: undefined
};

export const reset = createAction(CONSTANTS.RESET);
export const setCurrentInfluencer = createAction(CONSTANTS.SET_CURRENT_INFLUENCER, (influencer: IInfluencer) => influencer);
export const setInfluencers = createAction(CONSTANTS.SET_INFLUENCERS, (influencers: IInfluencer[]) => influencers);
export const setFirstTouchId = createAction(CONSTANTS.SET_FIRST_TOUCH_ID, (id: string) => id);
export const setFirstTouchLink = createAction(CONSTANTS.SET_FIRST_TOUCH_LINK, (link: string) => link);
export const setLastTouchId = createAction(CONSTANTS.SET_LAST_TOUCH_ID, (id: string) => id);
export const setLastTouchLink = createAction(CONSTANTS.SET_LAST_TOUCH_LINK, (link: string) => link);
export const setLastTouchUpdateTimestamp = createAction(CONSTANTS.SET_LAST_TOUCH_UPDATE_TIMESTAMP, (timestamp: number) => timestamp);

export default handleActions<IInfluencersState, any>({
    [CONSTANTS.SET_CURRENT_INFLUENCER]: (state: IInfluencersState, { payload }: { payload: IInfluencer }) => ({
        ...state,
        currentInfluencer: payload
    }),
    [CONSTANTS.SET_INFLUENCERS]: (state: IInfluencersState, { payload }: { payload: IInfluencer[] }) => ({
        ...state,
        influencers: payload
    }),
    [CONSTANTS.SET_FIRST_TOUCH_ID]: (state: IInfluencersState, { payload }: { payload: string }) => ({
        ...state,
        firstTouchId: payload
    }),
    [CONSTANTS.SET_FIRST_TOUCH_LINK]: (state: IInfluencersState, { payload }: { payload: string }) => ({
        ...state,
        firstTouchLink: payload
    }),
    [CONSTANTS.SET_LAST_TOUCH_ID]: (state: IInfluencersState, { payload }: { payload: string }) => ({
        ...state,
        lastTouchId: payload
    }),
    [CONSTANTS.SET_LAST_TOUCH_LINK]: (state: IInfluencersState, { payload }: { payload: string }) => ({
        ...state,
        lastTouchLink: payload
    }),
    [CONSTANTS.SET_LAST_TOUCH_UPDATE_TIMESTAMP]: (state: IInfluencersState, { payload }: { payload: number }) => ({
        ...state,
        lastTouchUpdateTimestamp: payload
    }),
    [CONSTANTS.RESET]: () => initialState
}, initialState);
