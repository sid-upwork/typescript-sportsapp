export const ENDPOINTS: Record<TEndpoint, string> = {
    appleLogin: '/login/apple',
    articles: '/articles',
    collages: '/collages',
    exercises: '/exercises',
    googleLogin: '/login/google',
    facebookLogin: '/login/facebook',
    historyExercisesSummary: '/history/exercises/summary',
    historySets: '/history/sets',
    historyWorkout: '/history/workout',
    historyWorkouts: '/history/workouts',
    influencers: '/users/influencers',
    login: '/login',
    medias: '/medias',
    programs: '/programs',
    progressPictures: '/progressPictures',
    progressionPrograms: '/progression/programs',
    progressionProgramsPercentage: 'progression/programs/percentage',
    progressionSummary: '/progression/summary',
    progressionWeeks: '/progression/weeks',
    recipes: '/recipes',
    recipeLists: '/recipeLists',
    self: '/users/self',
    tutorials: '/tutorials/slug/',
    users: '/users',
    userSubscriptions: '/userSubscriptions',
    workoutLists: '/workoutLists',
    workouts: '/workouts'
};

export type TEndpoint =
    'appleLogin' |
    'articles' |
    'collages' |
    'exercises' |
    'googleLogin' |
    'facebookLogin' |
    'influencers' |
    'historyExercisesSummary' |
    'historySets' |
    'historyWorkout' |
    'historyWorkouts' |
    'login' |
    'medias' |
    'programs' |
    'progressPictures' |
    'progressionPrograms' |
    'progressionProgramsPercentage' |
    'progressionWeeks' |
    'progressionSummary' |
    'recipes'|
    'recipeLists' |
    'self'|
    'userSubscriptions' |
    'tutorials'|
    'users'|
    'workoutLists'|
    'workouts';
