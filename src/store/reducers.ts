import { combineReducers } from 'redux';
import apiQueue, { IApiQueueState } from './modules/apiQueue';
import auth, { IAuthState } from './modules/auth';
import influencers, { IInfluencersState } from './modules/influencers';
import network, { INetworkState } from './modules/network';
import onboarding, { IOnboardingState } from './modules/onboarding';
import progression, { IProgressionState } from './modules/progression';
import tutorials, { ITutorialsState } from './modules/tutorials';
import userInterface, { IUserInterfaceState } from './modules/userInterface';
import userProfile, { IUserProfileState } from './modules/userProfile';
import workoutDuration, { IWorkoutDurationState } from './modules/workoutDuration';
import workoutProgression, { IWorkoutProgressionState } from './modules/workoutProgression';

export interface IReduxState {
    apiQueue: IApiQueueState;
    auth: IAuthState;
    influencers: IInfluencersState;
    network: INetworkState;
    onboarding: IOnboardingState;
    progression: IProgressionState;
    tutorials: ITutorialsState;
    userInterface: IUserInterfaceState;
    userProfile: IUserProfileState;
    workoutDuration: IWorkoutDurationState;
    workoutProgression: IWorkoutProgressionState;
}

export default combineReducers({
    apiQueue,
    auth,
    influencers,
    network,
    onboarding,
    progression,
    tutorials,
    userInterface,
    userProfile,
    workoutDuration,
    workoutProgression
});
