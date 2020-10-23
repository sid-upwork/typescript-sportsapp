import api from './api';
import crashlytics from '@react-native-firebase/crashlytics';
import { AxiosResponse, AxiosError } from 'axios';
import { store } from '../index';
import { ENDPOINTS } from './endpoints';
import { queueRequest } from '../store/modules/apiQueue';
import { IProgram, IWeek } from '../types/program';
import { IWorkout, ICircuit, ICircuitExercise } from '../types/workout';
import { IUser, IInfluencer } from '../types/user';
import { logEvent } from '../utils/analytics';
import { isEqual } from 'lodash';
import { formatDateForAPI } from './date';
import { setCurrentInfluencer } from '../store/modules/influencers';
import { resetWorkoutHistory, IWorkoutHistoryPost } from '../store/modules/workoutProgression';
import {
    setProgressionData,
    IProgressionState,
    setError as setProgressionError,
    setOpenProgressionProgramPopup
} from '../store/modules/progression';
import {
    IProgressionSummary,
    IProgressionProgram,
    IProgressionWeek,
    IWorkoutHistory,
    IProgressionProgramPercentage
} from '../types/progression';
import {
    IWorkoutHistoryState,
    IExerciseHistoryState,
    ISetHistoryState,
    IWorkoutProgressionState
} from '../store/modules/workoutProgression';
import { TWorkoutOrigin } from './navigation';

/**
 * API utils:
 * create_: POST
 * fetch_: GET
 * update_: PUT
 */

/**
 * Creates or returns progression for a given program and program week.
 * Also makes sure both programProgression and weekProgression are properly inserted in database.
 *
 * @param programId
 * @param programWeekId
 */
export async function retrieveProgressionProgram (programId: string, programWeekId: string): Promise<IProgressionProgram> {
    try {
        await api.get(`${ENDPOINTS.progressionPrograms}/${programId}`);
    } catch (error) {
        if (error?.response?.status === 404) {
            // If program progression doesn't exist at all
            try {
                await api.post(
                    ENDPOINTS.progressionPrograms,
                    {
                        'programId': programId,
                        'currentProgramWeekId': programWeekId,
                        'weeksUnlocked': 1,
                        'startedAt': formatDateForAPI(),
                        'finished': false
                    }
                );
            } catch (error) {
                console.log('Error while creating program progression', error);
                console.log(error?.response);
            }
        } else {
            throw new Error('Cannot check current program progression');
        }
    }

    try {
        // Check if weeks exist too
        await api.get(`${ENDPOINTS.progressionWeeks}/${programWeekId}`);
    } catch (error) {
        if (error?.response?.status === 404) {
            // If week progression doesn't exist
            try {
                await api.post(
                    ENDPOINTS.progressionWeeks,
                    {
                        'programWeekId': programWeekId,
                        'startedAt': formatDateForAPI()
                    }
                );
            } catch (error) {
                console.log('Error while creating week progression', error);
                console.log(error?.response);
            }
        } else {
            throw new Error('Cannot check current week progression');
        }
    }

    try {
        const currentProgramProgression = await api.get(`${ENDPOINTS.progressionPrograms}/${programId}`);
        return currentProgramProgression.data;
    } catch (error) {
        console.log(error?.response);
        throw new Error('Cannot retrieve program progression');
    }
}

export async function createProgressionWeek (progressionProgram: IProgressionProgram, programWeekId: string): Promise<boolean> {
    try {
        await api.post(
            ENDPOINTS.progressionWeeks,
            {
                'programWeekId': programWeekId,
                'startedAt': formatDateForAPI()
            }
        );
        await api.put(
            ENDPOINTS.progressionPrograms + '/' + progressionProgram.programId,
            {
                'currentProgramWeekId': programWeekId,
                'weeksUnlocked': progressionProgram.weeksUnlocked += 1
            }
        );
        await fetchProgression(progressionProgram.programId);
        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function createHistoryWorkout (workoutHistory: IWorkoutHistoryState, fromProgram: boolean = false): Promise<IWorkoutHistoryPost> {
    let workoutHistoryCleaned: IWorkoutHistoryPost;
    try {
        workoutHistoryCleaned = cleanWorkoutBeforeSendingRequest(workoutHistory);
        await api.post(
            ENDPOINTS.historyWorkouts,
            {
                ...workoutHistoryCleaned
            }
        );

        if (fromProgram && store?.getState && store?.getState()?.progression) {
            const currentProgressionState: IProgressionState = store?.getState()?.progression;
            const newProgressionState: IProgressionState = await fetchProgression(currentProgressionState.program?.id);
            // If the user finished a workout or a restday from the program
            if (currentProgressionState?.week?.workoutsDone !== newProgressionState?.week?.workoutsDone) {
                try {
                    const progressionWeek: IProgressionWeek = await fetchProgressionWeek(newProgressionState?.week?.id);
                    // If the week is not already finished but all workouts are done
                    if (!progressionWeek.finished &&
                        newProgressionState?.week?.workoutsDone?.length === newProgressionState?.week?.workoutsCount) {
                        let newProgressionWeek: IProgressionWeek = progressionWeek;
                        newProgressionWeek.finished = true;
                        newProgressionWeek.finishedAt = formatDateForAPI();
                        const updateProgressionWeekResponse: boolean = await updateProgressionWeek(newProgressionWeek);
                        // We are sure that the user just finished a week ! congrats =)
                        await store.dispatch(setOpenProgressionProgramPopup(true));
                        const progressionProgram = await fetchProgressionProgram(newProgressionState?.program?.id);
                        // If the week update is successful, the program is not already finished but all weeks are done
                        if (updateProgressionWeekResponse &&
                            !progressionProgram.finished &&
                            progressionProgram?.weeks === progressionProgram?.weeksDone) {
                            const newProgressionProgram: IProgressionProgram = progressionProgram;
                            newProgressionProgram.finished = true;
                            newProgressionProgram.finishedAt = newProgressionWeek.finishedAt;
                            await updateProgressionProgram(newProgressionProgram);
                        }
                        await fetchProgression(newProgressionState?.program?.id);
                    }
                } catch (error) {
                    crashlytics().recordError(
                        new Error('createHistoryWorkout creates a workoutHistory, should have create a weekProgression but an error happened')
                    );
                    crashlytics().recordError(error);
                    console.log(error);
                }
            }
        }
        return workoutHistoryCleaned;
    } catch (error) {
        if (!workoutHistoryCleaned && !error.response) {
            // Add your failed request to the queue using the Redux action
            store.dispatch(queueRequest((error as AxiosError).config));
        }
        crashlytics().recordError(error);
        console.log(error);
        return workoutHistoryCleaned;
    }
}

export async function fetchActiveProgram (): Promise<IProgram> {
    try {
        const response: AxiosResponse = await api.get(ENDPOINTS.self);
        const userProfile: IUser = response.data;
        return userProfile?.activeProgram;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function fetchActiveProgramId (): Promise<string> {
    try {
        const response: AxiosResponse = await api.get(ENDPOINTS.self);
        const userProfile: IUser = response.data;
        return userProfile?.activeProgram?.id;
    } catch (error) {
        return null;
    }
}

export async function fetchProgram (programId: string): Promise<IProgram> {
    try {
        const programResponse: AxiosResponse = await api.get(ENDPOINTS.programs + '/' + programId);
        const program: IProgram = programResponse.data;
        return program;
    } catch (error) {
        console.log(error);
    }
    return null;
}

// TODO: this function should only return the progressionState, we should not do a dispatch (see refreshProgression)
export async function fetchProgression (programId: string): Promise<IProgressionState> {
    try {
        const progressionSummaryResponse: AxiosResponse = await api.get(ENDPOINTS.progressionSummary + '/' + programId);
        const progressionSummary: IProgressionSummary = progressionSummaryResponse.data;

        if (progressionSummary && Number.isInteger(progressionSummary.currentProgramWeekPosition)) {
            const progressionState: IProgressionState = {
                ...store.getState().progression,
                program: {
                    id: programId,
                    title: progressionSummary.title
                },
                week: {
                    id: progressionSummary.programWeekId,
                    position: progressionSummary.currentProgramWeekPosition,
                    workoutsCount: progressionSummary.workouts || 0,
                    workoutsDone: progressionSummary.workoutsDone,
                    workoutsDoneCount: progressionSummary.workoutsDone && progressionSummary.workoutsDone.length || 0
                },
                error: false
            };
            if (!isEqual(progressionState, store.getState().progression)) {
                await store.dispatch(setProgressionData(progressionState));
            }
            return progressionState;
        }
    } catch (error) {
        throw error;
    }
}

export async function fetchProgressionProgram (programId: string): Promise<IProgressionProgram> {
    const response = await api.get(ENDPOINTS.progressionPrograms + '/' + programId);
    return response.data as IProgressionProgram;
}

export async function fetchProgressionProgramPercentage (programId: string): Promise<IProgressionProgramPercentage> {
    const response = await api.get(ENDPOINTS.progressionProgramsPercentage + '/' + programId);
    return response.data as IProgressionProgramPercentage;
}

export async function fetchProgressionWeek (weekId: string): Promise<IProgressionWeek> {
    try {
        const response = await api.get(ENDPOINTS.progressionWeeks + '/' + weekId);
        return response.data as IProgressionWeek;
    } catch (error) {
        console.log(error);
        if (error.response.status === 404) {
            return null;
        } else {
            throw 'Unknown error';
        }
    }
}

export async function fetchWorkout (workoutId: string): Promise<IWorkout> {
    try {
        const response = await api.get(ENDPOINTS.workouts + '/' + workoutId);
        return response.data as IWorkout;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function fetchWorkoutHistory (workoutHistoryId: string): Promise<IWorkoutHistory> {
    try {
        const response = await api.get(ENDPOINTS.historyWorkout + '/' + workoutHistoryId);
        return response.data as IWorkoutHistory;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function fetchWorkoutHistoryByWorkoutId (workoutId: string): Promise<IWorkoutHistory> {
    try {
        const response = await api.get(ENDPOINTS.historyWorkouts + '/' + workoutId + '?order[createdAt]=desc&limit=1');
        return response.data[0] as IWorkoutHistory;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function updateProgramIdByUserId (programId: string, userId: string): Promise<void> {
    await api.put(ENDPOINTS.users + '/' + userId, {
        activeProgramId: programId
    });
}

// TODO: remove this function and use goToWeekPosition
export async function updateWeekIdProgressionProgram (progressionProgram: IProgressionProgram, weekId: string): Promise<boolean> {
    try {
        const progressionWeek: IProgressionWeek = await fetchProgressionWeek(weekId);
        if (progressionWeek) {
            await api.put(
                ENDPOINTS.progressionPrograms + '/' + progressionProgram.programId,
                {
                    'currentProgramWeekId': weekId
                }
            );
            await fetchProgression(progressionProgram.programId);
        } else {
            // fetchProgression is already done in createProgressionWeek, no need to call it here
            await createProgressionWeek(progressionProgram, weekId);
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function updateProgressionWeek (progressionWeek: IProgressionWeek): Promise<boolean> {
    try {
        if (progressionWeek) {
            await api.put(
                ENDPOINTS.progressionWeeks + '/' + progressionWeek.programWeekId,
                {
                    finished: progressionWeek.finished,
                    finishedAt: progressionWeek.finishedAt ? formatDateForAPI(progressionWeek.finishedAt) : undefined,
                    startedAt: progressionWeek.startedAt ? formatDateForAPI(progressionWeek.startedAt) : undefined
                }
            );
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function updateProgressionProgram (progressionProgram: IProgressionProgram): Promise<boolean> {
    try {
        if (progressionProgram) {
            await api.put(
                ENDPOINTS.progressionPrograms + '/' + progressionProgram.programId,
                {
                    currentProgramWeekId: progressionProgram.currentProgramWeekId,
                    finished: progressionProgram.finished,
                    finishedAt: progressionProgram.finishedAt ? formatDateForAPI(progressionProgram.finishedAt) : undefined,
                    startedAt: progressionProgram.startedAt ? formatDateForAPI(progressionProgram.startedAt) : undefined
                }
            );
        }
        return true;
    } catch (error) {
        console.log(error.response);
        return false;
    }
}

/**
 * Other utils
 */

// Used in src/index.tsx & after user login
export async function refreshProgression (): Promise<void> {
    try {
        if (store?.getState()?.progression?.error !== false)  {
            store.dispatch(setProgressionError(false));
        }
        const program: IProgram = await fetchActiveProgram();
        if (program?.id && program?.author) {
            await fetchProgression(program.id);
            const influencer: IInfluencer = store?.getState()?.influencers?.currentInfluencer;
            if (influencer?.id !== program?.author?.id)  {
                store.dispatch(setCurrentInfluencer(program.author));
            }
        } else {
            store.dispatch(setProgressionError(true));
        }
    } catch (error) {
        console.log(error);
        store.dispatch(setProgressionError(true));
    }
}

// Helpers
export function getTotalReps (workoutHistory: IWorkoutHistoryState): number {
    if (!workoutHistory) {
        return null;
    }

    let totalReps = 0;

    workoutHistory.exerciseHistories?.forEach((exerciseHistory: IExerciseHistoryState) => {
        if (exerciseHistory.type === 'reps') {
            exerciseHistory.setHistories?.forEach((setHistory: ISetHistoryState) => {
                totalReps += setHistory.scored;
            });
        }
    });

    return totalReps;
}

/** Returns the percentage of completed sets or null */
export function getWorkoutCompletionPercentage (currentWorkout: IWorkout, workoutHistory: IWorkoutHistoryState): number | null {
    if (!currentWorkout || !workoutHistory) {
        return null;
    }

    let numberOfSets = 0;
    currentWorkout.circuits?.forEach((circuit: ICircuit) => {
        circuit.circuitExercises?.forEach((circuitExercise: ICircuitExercise) => {
            numberOfSets += circuitExercise.sets?.length;
        });
    });

    // Can't divide by zero
    if (numberOfSets === 0) {
        return null;
    }

    let numberOfSetsCompleted = 0;
    workoutHistory.exerciseHistories?.forEach((exerciseHistory: IExerciseHistoryState) => {
        numberOfSetsCompleted += exerciseHistory.setHistories?.length;
    });

    return Math.round((numberOfSetsCompleted / numberOfSets) * 100);
}

export async function completeWorkoutManually (
    workoutId: string,
    workoutPosition: number,
    progression?: IProgressionState,
    workoutOrigin?: TWorkoutOrigin,
    workoutProgression?: IWorkoutProgressionState,
    workoutTitle?: string
): Promise<boolean> {
    const fromProgram: boolean = (workoutOrigin === 'myProgram');
    let workoutHistory: IWorkoutHistoryState = {
        exerciseHistories: [],
        position: workoutPosition,
        programWeekId: fromProgram ? progression?.week?.id : undefined,
        workoutId: workoutId
    };
    let completionPercentage: number = 0;

    // If the workout has been started we add the history we have
    const isOngoingWorkout = checkOngoingWorkout(workoutId, workoutPosition, workoutOrigin);
    if (isOngoingWorkout) {
        completionPercentage = getWorkoutCompletionPercentage(
            workoutProgression?.currentWorkout,
            workoutProgression?.workoutHistory
        );
        workoutHistory.exerciseHistories = workoutProgression.workoutHistory.exerciseHistories;
        workoutHistory.totalReps = getTotalReps(workoutProgression.workoutHistory);

        store.dispatch(resetWorkoutHistory());
    }

    logEvent('workout_manual_complete', {
        workoutId,
        workoutTitle,
        completionPercentage
    });

    return await createHistoryWorkout(workoutHistory, fromProgram) ? true : false;
}

export function isExerciseComplete (
    circuitExercise: ICircuitExercise,
    exerciseIndex: number,
    workoutProgression: IWorkoutProgressionState
    ): boolean {
    if (workoutProgression?.workoutHistory?.exerciseHistories?.length > 0 && exerciseIndex >= 0) {
        const exerciseHistoryIndex = workoutProgression.workoutHistory.exerciseHistories.findIndex(
            (exerciseHistory: IExerciseHistoryState) => exerciseHistory.position === exerciseIndex
        );
        const currentExerciseHistory = workoutProgression.workoutHistory.exerciseHistories[exerciseHistoryIndex];
        if (circuitExercise.sets.length === currentExerciseHistory?.setHistories?.length) {
            return true;
        }
    }
    return false;
}

export async function goToWeekPosition (position: number): Promise<boolean> {
    let result: boolean = false;
    try {
        const progression: IProgressionState = store?.getState && store?.getState().progression;
        const program: IProgram = await fetchProgram(progression?.program.id);
        const nextWeekIndex = program.weeks.findIndex((week: IWeek) => week.position === position);
        if (nextWeekIndex !== -1) {
            const progressionWeek: IProgressionWeek = await fetchProgressionWeek(program.weeks[nextWeekIndex].id);
            // If the progression week does not already exist, create it
            if (progressionWeek?.programWeekId) {
                await api.put(
                    ENDPOINTS.progressionPrograms + '/' + program.id,
                    {
                        'currentProgramWeekId': progressionWeek.programWeekId
                    }
                );
                await fetchProgression(program.id);
                result = true;
            } else {
                const progressionProgram = await fetchProgressionProgram(progression?.program.id);
                // Create the next week progression, it will refresh the progression in the store
                result = await createProgressionWeek(progressionProgram, program.weeks[nextWeekIndex].id);
            }
        }
    } catch (error) {
        crashlytics().recordError(error);
        console.log(error);
    } finally {
        return result;
    }
}

export async function resetProgressionProgram (progressionProgram: IProgressionProgram): Promise<boolean> {
    try {
        const newStartedAt: string = formatDateForAPI();

        // Reset all weekProgression
        const program: IProgram = await fetchProgram(progressionProgram.programId);
        program?.weeks?.forEach(async (week: IWeek) => {
            await api.put(
                ENDPOINTS.progressionWeeks + '/' + week.id,
                {
                    finished: false,
                    startedAt: newStartedAt
                }
            );
            if (week.position === 0) {
                await api.put(
                    ENDPOINTS.progressionPrograms + '/' + program.id,
                    {
                        'currentProgramWeekId': week.id
                    }
                );
            }
        });

        // Reset programProgression
        let newProgressionProgram = progressionProgram;
        newProgressionProgram.finished = false;
        newProgressionProgram.startedAt = newStartedAt;
        return await updateProgressionProgram(newProgressionProgram);
    } catch (error) {
        crashlytics().recordError(error);
        console.log(error);
        return false;
    }
}

export async function resetProgressionWeekByWeekId (weekId: string): Promise<boolean> {
    try {
        const newStartedAt: string = formatDateForAPI();
        await api.put(
            ENDPOINTS.progressionWeeks + '/' + weekId,
            {
                finished: false,
                startedAt: newStartedAt
            }
        );
        return true;
    } catch (error) {
        crashlytics().recordError(error);
        console.log(error);
        return false;
    }
}

function cleanWorkoutBeforeSendingRequest (workoutHistory: IWorkoutHistoryState): IWorkoutHistoryPost {
    // clone the workoutHistory
    let workoutHistoryPost: IWorkoutHistoryPost = { ...workoutHistory };
    workoutHistoryPost?.exerciseHistories?.forEach((exerciseHistory: IExerciseHistoryState) => {
        exerciseHistory?.setHistories?.forEach((setHistory: ISetHistoryState) => {
            // Convert the weight to a number if it's a string
            if (typeof setHistory?.weight === 'string') {
                setHistory.weight = parseFloat(setHistory?.weight);
            }

            // Check for NaN
            if (Number.isNaN(setHistory?.weight) || setHistory?.weight < 0) {
                setHistory.weight = 0;
            }
        });
    });
    workoutHistoryPost.totalReps = getTotalReps(workoutHistoryPost);
    workoutHistoryPost.duration = store.getState().workoutDuration?.duration;
    return workoutHistoryPost;
}

export function checkOngoingWorkout (workoutId: string, position: number, workoutOrigin: TWorkoutOrigin): boolean {
    const workoutProgression = store?.getState()?.workoutProgression;
    if (!workoutProgression) {
        return false;
    }

    if (workoutProgression?.workoutHistory?.workoutId === workoutId &&
        workoutProgression?.workoutHistory?.position === position &&
        workoutProgression?.workoutOrigin === workoutOrigin) {
        return true;
    }
    return false;
}
