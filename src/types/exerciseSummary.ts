export interface IMaxWeight {
    weight: number;
    scored: number;
    date: string;
}

export interface IMaxScored {
    weight: number;
    scored: number;
    date: string;
}

export interface IRecord {
    maxWeight: IMaxWeight;
    maxScored: IMaxScored;
}

export interface IExerciseSummarySet {
    position: number;
    scored: number;
    weight: number;
}

export interface IExerciseSummaryExercise {
    exerciseHistoryId: string;
    sets: IExerciseSummarySet[];
}

export interface IExerciseSummaryWorkout {
    workoutId: string;
    date: string;
    title: string;
    exercises: IExerciseSummaryExercise[];
}

export interface IExerciseHistorySummary {
    records: IRecord;
    workouts: IExerciseSummaryWorkout[];
}
