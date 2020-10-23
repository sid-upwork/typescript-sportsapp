import AddCollage from './AddCollage';
import Article from './Article';
import ArticleCarousel from './ArticleCarousel';
import Blog from './Blog';
import Community from './Community';
import Credits from './Credits';
import Landing from './Landing';
import Login from './Login';
import Onboarding from './Onboarding';
import ProgramSelection from './ProgramSelection';
import PictureSelection from './PictureSelection';
import PictureViewer from './PictureViewer';
import PinCode from './PinCode';
import ProgressPictures from './ProgressPictures';
import Recipes from './Recipes';
import Registration from './Registration';
import Training from './Training';
import Settings from './Settings';
import Video from './Video';
import VideoWorkoutOverview from './VideoWorkoutOverview';
import Workout from './Workout';
import WorkoutCompletion from './WorkoutCompletion';
import WorkoutOverview from './WorkoutOverview';

export type TViews =
    | 'AddCollage'
    | 'Article'
    | 'ArticleCarousel'
    | 'Blog'
    | 'Community'
    | 'Credits'
    | 'Landing'
    | 'Login'
    | 'Onboarding'
    | 'OnboardingTransition'
    | 'ProgramSelection'
    | 'ProgramSelectionModal'
    | 'PictureSelection'
    | 'PictureViewer'
    | 'PinCode'
    | 'PinCodeNoTransition'
    | 'ProgressPictures'
    | 'Recipes'
    | 'Registration'
    | 'Settings'
    | 'Training'
    | 'Video'
    | 'VideoWorkoutOverview'
    | 'Workout'
    | 'WorkoutCompletion'
    | 'WorkoutOverview';

export const views = {
    AddCollage,
    ArticleCarousel,
    Article,
    Blog,
    Community,
    Credits,
    Landing,
    Login,
    Onboarding,
    ProgramSelection,
    PictureSelection,
    PictureViewer,
    PinCode,
    ProgressPictures,
    Recipes,
    Registration,
    Settings,
    Training,
    Video,
    VideoWorkoutOverview,
    Workout,
    WorkoutCompletion,
    WorkoutOverview
};
