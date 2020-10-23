import { NavigationRouteConfig, NavigationScreenProp } from 'react-navigation';
import { NavigationStackOptions, TransitionPresets } from 'react-navigation-stack';
import { store } from '../index';
import { setDrawerLocked } from '../store/modules/userInterface';
import { TViews, views } from '../views/index';
import { isIOS } from '../utils/os';
import { headerHeight } from '../styles/base/metrics.style';
import headerStyles from '../styles/components/NavBar.style';

interface INavigationOptions {
    disableGestures?: boolean;
    unlockDrawer?: boolean;
    modal?: boolean;
    modalStack?: boolean;
    noTransition?: boolean;
    transparent?: boolean;
}

export const routes: Record<TViews, NavigationRouteConfig<any, any>> = {
    AddCollage: {
        screen: views.AddCollage,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true })
        })
    },
    Article: {
        screen: views.Article,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true })
        })
    },
    ArticleCarousel: {
        screen: views.ArticleCarousel,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true })
        })
    },
    Blog: {
        screen: views.Blog,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, {
                unlockDrawer: true,
                noTransition: true
            })
        })
    },
    Community: {
        screen: views.Community,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    Credits: {
        screen: views.Credits,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    Landing: {
        screen: views.Landing,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    Login: {
        screen: views.Login,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    Onboarding: {
        screen: views.Onboarding,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { noTransition: true })
        })
    },
    OnboardingTransition: {
        screen: views.Onboarding,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { noTransition: false })
        })
    },
    PictureSelection: {
        screen: views.PictureSelection,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true })
        })
    },
    PictureViewer: {
        screen: views.PictureViewer,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true })
        })
    },
    PinCode: {
        screen: views.PinCode,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    PinCodeNoTransition: {
        screen: views.PinCode,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, {
                unlockDrawer: true,
                noTransition: true
            })
        })
    },
    ProgramSelection: {
        screen: views.ProgramSelection,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    ProgramSelectionModal: {
        screen: views.ProgramSelection,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true }) // modalStack: true
        })
    },
    ProgressPictures: {
        screen: views.ProgressPictures,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, {
                unlockDrawer: true,
                noTransition: true
            })
        })
    },
    Recipes: {
        screen: views.Recipes,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, {
                unlockDrawer: true,
                noTransition: true
            })
        })
    },
    Registration: {
        screen: views.Registration,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    Settings: {
        screen: views.Settings,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, {
                unlockDrawer: true,
                noTransition: true
            })
        })
    },
    Training: {
        screen: views.Training,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, {
                unlockDrawer: true,
                noTransition: true
            })
        })
    },
    Video: {
        screen: views.Video,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true })
        })
    },
    VideoWorkoutOverview: {
        screen: views.VideoWorkoutOverview,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    },
    Workout: {
        screen: views.Workout,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { disableGestures: true })
        })
    },
    WorkoutCompletion: {
        screen: views.WorkoutCompletion,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation, { modal: true })
        })
    },
    WorkoutOverview: {
        screen: views.WorkoutOverview,
        navigationOptions: ({ navigation }: any) => ({
            ...defaultNavigationOptions(navigation)
        })
    }
};

export function defaultNavigationOptions (navigation: NavigationScreenProp<{}>, options?: INavigationOptions): NavigationStackOptions {
    const debugDrawer = false;
    const drawerLocked: boolean = store && store.getState().userInterface.drawerLocked;

    if (navigation.isFocused()) {
        // By default the drawer is locked on all routes,
        // we need to explicitly set the unlockDrawer option to true to change that
        if (options) {
            if (options.unlockDrawer) {
                if (drawerLocked) {
                    debugDrawer && console.log('Unlocking drawer because unlockDrawer is true');
                    store.dispatch(setDrawerLocked(false));
                }
            } else {
                if (!drawerLocked) {
                    debugDrawer && console.log('Locking drawer because unlockDrawer is undefined or false');
                    store.dispatch(setDrawerLocked(true));
                }
            }
        } else {
            if (!drawerLocked) {
                debugDrawer && console.log('Locking drawer because option is undefined');
                store.dispatch(setDrawerLocked(true));
            }
        }
    }

    let animationEnabled: boolean = true;
    let cardStyle: any = headerStyles.card;
    let gestureEnabled: boolean = isIOS;
    let transition = TransitionPresets.DefaultTransition;

    if (options) {
        const { modal, modalStack, transparent, noTransition, disableGestures } = options;

        if (transparent) {
            cardStyle = headerStyles.cardTransparent;
        }

        if (modal) {
            if (isIOS && modalStack) {
                transition = TransitionPresets.ModalPresentationIOS;
            } else {
                transition = TransitionPresets.ModalTransition;
            }
        } else if (noTransition) {
            animationEnabled = false;
        }

        if (disableGestures) {
            gestureEnabled = false;
        }
    }

    return {
        animationEnabled,
        cardStyle,
        // The following doesn't seem to work
        // Maybe with a custom interpolation? https://reactnavigation.org/docs/4.x/stack-navigator
        // cardOverlayEnabled: true,
        cardShadowEnabled: true,
        gestureEnabled,
        gestureResponseDistance: {
            horizontal: 35,
            vertical: headerHeight
        },
        gestureVelocityImpact: 0.35,
        ...transition
    };
}
