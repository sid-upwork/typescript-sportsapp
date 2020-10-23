import { createAction, handleActions } from 'redux-actions';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AnyAction } from 'redux';
import { IReduxState } from '../reducers';

export interface IApiQueueState {
    queue: AxiosRequestConfig[];
}

export const CONSTANTS = {
    QUEUE: 'apiQueue/QUEUE',
    RESET: 'apiQueue/RESET',
    UNQUEUE: 'apiQueue/UNQUEUE'
};

const initialState: IApiQueueState = {
    queue: []
};

export const queueRequest = createAction(CONSTANTS.QUEUE, (request: AxiosRequestConfig) => ({
    data: request.data,
    headers: request.headers,
    method: request.method,
    url: request.url
}));
export const reset = createAction(CONSTANTS.RESET);
const unqueueRequest = createAction(CONSTANTS.UNQUEUE);

export function retryQueue (): any {
    return async (dispatch: (action: AnyAction) => void, getState: () => IReduxState, api: AxiosInstance) => {
        const { apiQueue: { queue } } = getState();
        if (!queue.length) {
            return;
        }

        for (let i = 0; i < queue.length; i++) {
            try {
                await api.request(queue[i]);
                // Request is now successful : unqueue
                dispatch(unqueueRequest());
            } catch (err) {
                if (err.response) {
                    // Server answered but request failed : unqueue
                    dispatch(unqueueRequest());
                } else {
                    // Server is still unreachable
                    break;
                }
            }
        }
    };
}

export default handleActions<IApiQueueState, any>({
    [CONSTANTS.QUEUE]: (state: IApiQueueState, { payload }: { payload: AxiosRequestConfig }) => ({
        ...state,
        queue: [
            ...state.queue,
            payload
        ]
    }),
    [CONSTANTS.RESET]: () => ({
        ...initialState
    }),
    [CONSTANTS.UNQUEUE]: (state: IApiQueueState) => ({
        ...state,
        queue: state.queue.slice(1)
    })
}, initialState);
