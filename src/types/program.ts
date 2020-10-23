import { IInfluencer } from './user';
import { IMedia } from './media';
import { IRestDay, IWorkout } from './workout';

export interface IPartialWorkout {
    description: string;
    hastags: string;
    id: string;
    image: IMedia;
    position: number;
    subtitle: string;
    title: string;
    type: 'generic' | 'recovery';
}

export interface IWeek {
    id: string;
    position: number;
    items: IWeekItem[];
}

export interface IWeekItem {
    fullWorkout?: IWorkout; // added in MyProgram component
    position: number;
    restDay?: IRestDay;
    workout?: IPartialWorkout;
}

export interface IProgram {
    author: IInfluencer;
    description: string;
    duration: number;
    equipment: string;
    frequency: string;
    id: string;
    image: IMedia;
    level: number;
    location: string;
    subtitle: string;
    summary: string;
    title: string;
    weeks: IWeek[];
}
