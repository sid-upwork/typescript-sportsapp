import { MigrationManifest } from 'redux-persist';
import { IReduxState } from './reducers';
import { initialHiddenTooltipsState } from './modules/tutorials';
import { isAndroid } from '../utils/os';
import { omit } from 'lodash';

// https://github.com/rt2zz/redux-persist/blob/master/docs/migrations.md
// This file allows us to migrate the persisted store.
// To add a migration, increment the version in src/store/index.ts > persistConfig,
// Then add a new key in the migrations object below with your modifications.

// !! ANY ERROR IN THE MIGRATIONS CAN CORRUPT THE STORE !!

const migrations = {
    0: (state: IReduxState) => {
        return {
            ...state
        };
    },
    1: (state: IReduxState) => {
        return {
            ...state,
            tutorials: {
                workoutOverviewScrollHintSeen: false
            }
        };
    },
    2: (state: IReduxState) => {
        return {
            ...state,
            userProfile: {
                ...state.userProfile,
                notificationPermissionRequested: false
            }
        };
    },
    3: (state: IReduxState) => {
        return {
            ...state,
            tutorials: {
                ...state.tutorials,
                hideTooltips: false,
                hiddenTooltips: {
                    ...initialHiddenTooltipsState
                }
            }
        };
    },
    4: (state: IReduxState) => {
        return {
            ...state,
            influencers: {
                ...state.influencers,
                originalInfluencerLink: undefined
            },
            userProfile: {
                ...state.userProfile,
                originalInfluencerLink: undefined,
                originalInfluencerLinkId: undefined
            }
        };
    },
    5: (state: IReduxState) => {
        return {
            ...state,
            workoutDuration: {
                ...state.workoutDuration,
                duration: (state.workoutProgression?.workoutHistory as any)?.duration,
                lastWorkoutDurationUpdate: (state.workoutProgression as any)?.lastWorkoutDurationUpdate
            },
            workoutProgression: {
                ...omit(state.workoutProgression, 'lastWorkoutDurationUpdate'),
                workoutHistory: {
                    ...omit(state.workoutProgression?.workoutHistory, 'duration')
                }
            }
        };
    },
    6: (state: IReduxState) => {
        return {
            ...state,
            onboarding: {
                ...omit(state.onboarding, 'shouldSkip')
            }
        };
    },
    7: (state: IReduxState) => {
        return {
            ...state,
            influencers: {
                ...state.influencers,
                firstTouchId: (state.userProfile as any).originalInfluencerLinkId,
                firstTouchLink: (state.userProfile as any).originalInfluencerLink,
                lastTouchId: undefined,
                lastTouchLink: undefined,
                lastTouchUpdatePending: false,
                lastTouchUpdateTimestamp: undefined
            },
            userProfile: {
                ...omit(state.userProfile, 'originalInfluencerLink', 'originalInfluencerLinkId'),
                firstTouchId: (state.userProfile as any).originalInfluencerLinkId,
                firstTouchLink: (state.userProfile as any).originalInfluencerLink,
                lastTouchId: undefined,
                lastTouchLink: undefined
            }
        };
    },
    8: (state: IReduxState) => {
        return {
            ...state,
            userProfile: {
                ...state.userProfile,
                pinCode: undefined,
                pinCodeEnabled: undefined
            }
        };
    },
    9: (state: IReduxState) => {
        return {
            ...state,
            userProfile: {
                ...state.userProfile,
                restNotifications: isAndroid ? true : undefined,
                trainingNotifications: isAndroid ? true : undefined,
                nutritionNotifications: isAndroid ? true : undefined,
                blogNotifications: isAndroid ? true : undefined,
                generalNotifications: isAndroid ? true : undefined
            }
        };
    },
    10: (state: IReduxState) => {
        return {
            ...state,
            userProfile: {
                ...state.userProfile,
                autoTimer: true,
                postRestPopup: true
            }
        };
    },
    11: (state: IReduxState) => {
        return {
            ...state,
            userProfile: {
                ...state.userProfile,
                lastTrialReminderDate: undefined
            },
            userInterface: {
                ...state.userInterface,
                purchasedDuringSession: false
            }
        };
    }
};

export default migrations as MigrationManifest;
