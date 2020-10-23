export interface IProgressionProgram {
    createdAt: string;
    currentProgramWeekId: string;
    finished: boolean;
    finishedAt: string;
    id: string;
    programId: string;
    startedAt: string;
    updatedAt: string;
    weeks: number;
    weeksDone: number;
    weeksUnlocked: number;
}

export interface IProgressionProgramPercentage {
    percentage: number;
}

export interface IProgressionWeek {
    id: string;
    programWeekId: string;
    startedAt: string;
    finished: boolean;
    finishedAt: string;
    createdAt: string;
    updatedAt: string;
    workouts: number;
    workoutsDone: number;
}

export interface IProgressionSummary {
    currentProgramWeekPosition: number;
    programWeekId: string;
    title: string;
    workouts: number;
    workoutsDone: any[];
}

export interface IWorkoutHistory {
    createdAt: string;
    duration?: number;
    id: string;
    position?: number;
    restDayId?: string;
    totalReps?: string;
    updatedAt: string;
    userId: string;
    weekProgressionId?: string;
    workoutId?: string;
}
