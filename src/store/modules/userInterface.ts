import { handleActions, createAction } from 'redux-actions';
import { IArticle } from '../../types/article';
import { IRecipe } from '../../types/recipe';

export interface ILists {
    breakfast?: { items: IRecipe[], listEndReached: boolean };
    lunch?: { items: IRecipe[], listEndReached: boolean };
    dinner?: { items: IRecipe[], listEndReached: boolean };
    snack?: { items: IRecipe[], listEndReached: boolean };
    articles?: { items: IArticle[], listEndReached: boolean };
}

const initialListItem = { items: [], listEndReached: false };
const initialListsState = {
    breakfast: initialListItem,
    lunch: initialListItem,
    dinner: initialListItem,
    snack: initialListItem,
    articles: initialListItem
};

export interface IUserInterfaceState {
    appInBackground: boolean;
    drawerLocked: boolean;
    drawerOpened: boolean;
    lists: ILists;
    activeArticle: number;
    purchasedDuringSession: boolean;
}

export const CONSTANTS = {
    SET_APP_IN_BACKGROUND: 'userInterface/SET_APP_IN_BACKGROUND',
    SET_DRAWER_OPENED: 'userInterface/SET_DRAWER_OPENED',
    TOGGLE_DRAWER_OPENED: 'userInterface/TOGGLE_DRAWER_OPENED',
    SET_DRAWER_LOCKED: 'userInterface/SET_DRAWER_LOCKED',
    LISTS_UPDATE: 'userInterface/LISTS_UPDATE',
    LISTS_CLEAR: 'userInterface/LISTS_CLEAR',
    ACTIVE_ARTICLE_SET: 'userInterface/ACTIVE_ARTICLE_SET',
    SET_PURCHASED_DURING_SESSION: 'userInterface/SET_PURCHASED_DURING_SESSION'
};

const initialState: IUserInterfaceState = {
    appInBackground: false,
    drawerLocked: true,
    drawerOpened: false,
    lists: initialListsState,
    activeArticle: undefined,
    purchasedDuringSession: false
};

export const setAppInBackground = createAction(CONSTANTS.SET_APP_IN_BACKGROUND, (open: boolean) => open);
export const setDrawerOpened = createAction(CONSTANTS.SET_DRAWER_OPENED, (open: boolean) => open);
export const toggleDrawerOpened = createAction(CONSTANTS.TOGGLE_DRAWER_OPENED);
export const setDrawerLocked = createAction(CONSTANTS.SET_DRAWER_LOCKED);
export const listsUpdate = createAction(CONSTANTS.LISTS_UPDATE, (lists: ILists) => lists);
export const listsClear = createAction(CONSTANTS.LISTS_CLEAR);
export const setActiveArticle = createAction(CONSTANTS.ACTIVE_ARTICLE_SET);
export const setPurchasedDuringSession = createAction(CONSTANTS.SET_PURCHASED_DURING_SESSION, (purchased) => purchased);

export default handleActions<IUserInterfaceState, any>({
    [CONSTANTS.SET_APP_IN_BACKGROUND]: (state: IUserInterfaceState, { payload }: { payload: boolean }) => ({
        ...state,
        appInBackground: payload
    }),
    [CONSTANTS.SET_DRAWER_OPENED]: (state: IUserInterfaceState, { payload }: { payload: boolean }) => ({
        ...state,
        drawerOpened: payload
    }),
    [CONSTANTS.TOGGLE_DRAWER_OPENED]: (state: IUserInterfaceState) => ({
        ...state,
        drawerOpened: !state.drawerOpened
    }),
    [CONSTANTS.SET_DRAWER_LOCKED]: (state: IUserInterfaceState, { payload }: { payload: boolean }) => ({
        ...state,
        drawerLocked: payload
    }),
    [CONSTANTS.LISTS_UPDATE]: (state: IUserInterfaceState, { payload }: { payload: ILists }) => ({
        ...state,
        lists: payload
    }),
    [CONSTANTS.LISTS_CLEAR]: (state: IUserInterfaceState) => ({
        ...state,
        lists: initialListsState,
        activeArticle: undefined
    }),
    [CONSTANTS.ACTIVE_ARTICLE_SET]: (state: IUserInterfaceState = initialState, { payload }: { payload: number }) => ({
        ...state,
        activeArticle: payload
    }),
    [CONSTANTS.SET_PURCHASED_DURING_SESSION]: (state: IUserInterfaceState = initialState, { payload }: { payload: boolean }) => ({
        ...state,
        purchasedDuringSession: payload
    }),
}, initialState);
