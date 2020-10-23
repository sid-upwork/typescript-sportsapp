import { IReduxState } from '../reducers';
import { MiddlewareAPI } from 'redux';
import { CONSTANTS, setLastTouchUpdateTimestamp } from '../modules/influencers';

export default () => ({ dispatch }: MiddlewareAPI<any, IReduxState>) => {
    return (next: any) => (action: any) => {
        // If the locale is changing in the store we also update it in I18n and in moment
        if ([CONSTANTS.SET_LAST_TOUCH_ID, CONSTANTS.SET_LAST_TOUCH_LINK].indexOf(action.type) !== -1) {
            dispatch(setLastTouchUpdateTimestamp(Date.now()));
        }
        return next(action);
    };
};
