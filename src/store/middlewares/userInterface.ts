import { IReduxState } from '../reducers';
import { MiddlewareAPI } from 'redux';
import { CONSTANTS } from '../modules/auth';
import { setPurchasedDuringSession } from '../modules/userInterface';

export default () => ({ dispatch }: MiddlewareAPI<any, IReduxState>) => {
    return (next: any) => async (action: any) => {
        if (action.type === CONSTANTS.RESET) {
            // Consider no purchase has been made in this session after the user disconnected
            // even if he hasn't closed the app
            dispatch(setPurchasedDuringSession(false));
        }
        return next(action);
    };
};
