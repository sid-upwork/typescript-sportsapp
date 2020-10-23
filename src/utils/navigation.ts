import { IWorkout } from '../types/workout';
import { IPartialWorkout } from '../types/program';
import { IWorkoutHistory } from '../types/progression';
import { INavigateEntry } from '../navigation/services';
import { TTargetedTrainingId } from '../components/Training/TargetedTrainingItem';

export type TWorkoutOrigin = 'myProgram' | 'quickWorkout' | 'weeklyChallenge' | 'targetedTraining';

export async function navigateToWorkoutOverview (
    navigate: (entry: INavigateEntry) => void,
    workout: IWorkout | IPartialWorkout,
    workoutHistory: IWorkoutHistory = undefined,
    fromProgram: boolean = false,
    position: number = 0,
    workoutOrigin: TWorkoutOrigin = undefined,
    targetedTrainingId: TTargetedTrainingId = undefined,
    callbackForTraining: () => void = null
): Promise<void> {
    if (!workout || !navigate) {
        return;
    }
    const navigateTo = workout.type && workout.type === 'recovery' ? 'VideoWorkoutOverview' : 'WorkoutOverview';
    let params: any = {
        workout,
        workoutHistory,
        fromProgram,
        position,
        workoutOrigin,
        targetedTrainingId,
        callbackForTraining
    };
    navigate({ routeName: navigateTo, params });
}
