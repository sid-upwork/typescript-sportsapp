import { IUser } from './user';
import { IMedia } from './media';

export type TExerciseTypes = 'reps' | 'time';

export interface IWorkout {
    author: IUser;
    backgroundVideo?: IMedia;
    categories: IWorkoutCategory[];
    circuits: ICircuit[];
    description: string;
    fullscreenImage: IMedia;
    hashtags: string[];
    id: string;
    image: IMedia;
    shortDescription: string;
    timeTrial?: boolean;
    timeTrialDuration?: number;
    title: string;
    type: 'generic' | 'recovery';
    video?: IMedia;
}

export interface IWorkoutCategory {
    color: string;
    id: string;
    slug: string;
    title: string;
}

export interface IVideoWorkout extends IWorkout {
    bodyFocus?: string;
    duration?: number;
    level?: number;
}

export interface IRestDay {
    fullscreenImage: IMedia;
    id: string;
    image: IMedia;
    message: string;
    quoteAuthor: string;
    title: string;
}

export interface ICircuit {
    circuitId: string;
    circuitExercises: ICircuitExercise[];
    id: string; // id === workoutCircuits.id, TODO: rename interface to IWorkoutCircuit ?
    position: number;
    workoutId: string;
}

export interface ICircuitExercise {
    id: string;
    circuitId: string;
    position: number;
    type: TExerciseTypes;
    restAfterLastSet?: number;
    restBetweenSets?: number;
    exercise: IExercise;
    sets: ISet[];
    circuitLength: number; // Manually added in `WorkoutOverview`
    isFirstOfCircuit?: boolean; // Manually added in `WorkoutOverview`
    isLastOfCircuit?: boolean; // Manually added in `WorkoutOverview`
    useAlternative?: boolean; // Manually added in `WorkoutOverview`
}

export interface IExercise {
    id: string;
    bodyweight: boolean;
    image: IMedia;
    fullscreenImage: IMedia;
    title: string;
    info: string;
    mainMuscleGroup: IMuscleGroup;
    secondaryMuscleGroup?: IMuscleGroup;
    video: IMedia;
    alternativeExercise: IExercise;
}

export interface ISet {
    hasHistoryValue?: boolean; // Manually added in `WorkoutOverview`
    position: number;
    reps: number;
    repsHistoryValue?: number; // Manually added in `WorkoutOverview`
    toFailure: boolean;
    weight?: number | string; // Manually added in `WorkoutOverview`
    weightHistoryValue?: number; // Manually added in `WorkoutOverview`
}

interface IMuscleGroup {
    id: string;
    name: string;
}
