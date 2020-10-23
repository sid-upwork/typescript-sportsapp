import { Linking } from 'react-native';
import { Store } from 'redux';
import api from './api';
import { reset, getNavigationState, navigate } from '../navigation/services';
import { getRootComponentRef } from '../index';
import { IReduxState } from '../store/reducers';
import { ENDPOINTS } from './endpoints';
import i18n from './i18n';
import { navigateToWorkoutOverview } from './navigation';
import { get } from 'lodash';

let storeRef: Store;
const SCHEME = 'nuli://';

type TAllowedRoutes = 'training' | 'recipes' | 'blog' | 'articles' | 'workouts' | 'pictures';

export function initDeeplinkingListener (store: Store): void {
    storeRef = store;
    Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL()
        .then((url: string) => {
            if (url && url.length) {
                handleDeepLink({ url });
            }
        })
        .catch((error: Error) => {
            console.warn(`Error while getting cold start deeplinking URL : ${error}`);
        });
}

export function removeDeeplinkingListener (): void {
    Linking.removeEventListener('url', handleDeepLink);
}

function handleDeepLink (event: { url: string }): void {
    openInAppRoute(event?.url);
}

export function openInAppRoute (route: string): void {
    const reduxState: IReduxState = storeRef?.getState();
    if (!route || !route.length || !reduxState) {
        return;
    }
    const { auth } = reduxState;
    if (!auth.connected) {
        return;
    }

    const routeWithoutScheme = route.replace(SCHEME, ''); // route.replace(/.*?:\/\//g, '')
    if (!routeWithoutScheme || !routeWithoutScheme.length) {
        return;
    }
    const [targetRoute, ...urlParams] = routeWithoutScheme.split('/').map((routePart: string) => routePart.toLowerCase());

    const allowedRoutes: TAllowedRoutes[] = ['training', 'recipes', 'blog', 'articles', 'workouts', 'pictures'];
    const currentRouteName = get(getNavigationState(), 'nav.routes[0].routeName', '');

    // @ts-ignore
    if (allowedRoutes.includes(targetRoute)) {
        if (targetRoute === 'training' && currentRouteName !== 'Training') {
            reset({ routeName: 'Training', params: {} });
        } else if (targetRoute === 'recipes') {
            if (urlParams[0]) {
                // Display recipe
                fetchAndNavigateToArticle(urlParams[0], 'recipe');
            } else {
                // Display recipes list
                reset({ routeName: 'Recipes', params: {} });
            }
        } else if (targetRoute === 'articles' && urlParams[0]) {
            // Display article
            fetchAndNavigateToArticle(urlParams[0], 'article');
        } else if (targetRoute === 'blog' && currentRouteName !== 'Blog') {
            reset({ routeName: 'Blog', params: {} });
        } else if (targetRoute === 'workouts') {
            fetchAndNavigateToWorkout(urlParams[0]);
        } else if (targetRoute === 'pictures') {
           reset({ routeName: 'ProgressPictures', params: {} })
        }
    } else {
        console.warn([
            `First path element ${targetRoute} not allowed. Make sure you ` +
            "didn't leave a trailing slash or that you're trying to open a valid scheme."
        ]);
    }
}

async function fetchAndNavigateToArticle (id: string, type: 'article' | 'recipe'): Promise<void> {

    function getEndpointFromArticleType (): string {
        switch (type) {
            case 'article': return ENDPOINTS.articles;
            case 'recipe': return ENDPOINTS.recipes;
            default: throw new Error(`Unknown article type : ${type}`);
        }
    }

    const rootComponent = getRootComponentRef();
    const screenProps = rootComponent?.getScreenProps();
    const rootLoader = screenProps?.rootLoaderRef?.current;
    rootLoader?.open();

    try {
        const contentResponse = await api.get(`${getEndpointFromArticleType()}/${id}`);
        rootLoader?.close();
        navigate({ routeName: 'Article', params: { type, closeButton: true, data: contentResponse.data } });
    } catch (err) {
        rootLoader?.close();
        screenProps?.toastManagerRef?.current?.openToast({
            duration: 3500,
            message: i18n.t('app.fetchError'),
            type: 'warning'
        });
    }
}

async function fetchAndNavigateToWorkout (id: string): Promise<void> {
    const rootComponent = getRootComponentRef();
    const screenProps = rootComponent?.getScreenProps();
    const rootLoader = screenProps?.rootLoaderRef?.current;
    rootLoader?.open();

    try {
        const contentResponse = await api.get(`${ENDPOINTS.workouts}/${id}`);
        rootLoader?.close();
        navigateToWorkoutOverview(navigate, contentResponse.data);
    } catch (err) {
        rootLoader?.close();
        screenProps?.toastManagerRef?.current?.openToast({
            duration: 3500,
            message: i18n.t('app.fetchError'),
            type: 'warning'
        });
    }
}
