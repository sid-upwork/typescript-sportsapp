import { IProgram } from './program';
import { IMedia } from './media';

export type TGenders = 'male' | 'female' | 'notSpecified';
export type TUnitsSystems = 'metric' | 'imperial';
export type TUserGoals = 'cutting' | 'bulking' | 'maintain';
export type TRoles = 'partner' | 'influencer' | 'admin'; // Other roles won't appear because of permissions

export interface IUser {
    activeProgram?: IProgram;
    autoTimer?: boolean;
    email: string;
    firstName: string;
    firstTouchId?: string;
    firstTouchLink?: string;
    id: string;
    lastName: string;
    lastTouchId?: string;
    lastTouchLink?: string;
    locale: string;
    oneSignalPlayerId?: string;
    picture: IMedia;
    pinCode?: string;
    postRestPopup?: boolean;
    role: TRoles;
    unitSystem: TUnitsSystems;
}

export interface IInfluencer extends IUser {
    influencerLinkId?: string;
    influencerPosition?: number;
    original: boolean;
    primaryColor: string;
    secondaryColor: string;
}
