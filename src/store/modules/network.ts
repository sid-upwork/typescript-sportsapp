import { handleActions, createAction } from 'redux-actions';
import { NetInfoStateType } from '@react-native-community/netinfo';

export interface INetworkState {
    type: NetInfoStateType;
    isInternetReachable: boolean;
}

export const CONSTANTS = {
    SET_NETWORK_STATE: 'network/SET_NETWORK_STATE'
};

export const setNetworkState = createAction(
    CONSTANTS.SET_NETWORK_STATE,
    (state: INetworkState) => state
);

const initialState: INetworkState = {
    type: undefined,
    isInternetReachable: undefined
};

export default handleActions<INetworkState, any>(
    {
        [CONSTANTS.SET_NETWORK_STATE]: (state: INetworkState, { payload }: { payload: INetworkState }) => ({
            ...state,
            type: payload.type,
            isInternetReachable: payload.isInternetReachable
        })
    },
    initialState
);
