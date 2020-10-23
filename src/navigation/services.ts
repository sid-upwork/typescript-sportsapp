import { StackActions, NavigationParams, NavigationActions } from 'react-navigation';
import { TViews } from '../views/index';

let navigator: any;

// These methods can be used anywhere outside of the AppContainer component, as long as setTopLevelNavigator as been called.
// Prefer using the navigation prop if you are in a child component of AppContainer.'
// https://reactnavigation.org/docs/en/navigating-without-navigation-prop.html
// https://reactnavigation.org/docs/en/connecting-navigation-prop.html

export interface INavigateEntry {
    routeName: TViews;
    params: NavigationParams;
}

export interface INavigateMenuEntry extends INavigateEntry {
    displayName: string;
}

export function setTopLevelNavigator (navigatorRef: any): void {
    navigator = navigatorRef;
}

export function getNavigationState (): any {
    return navigator ? navigator.state : undefined;
}

export function navigate (entry: INavigateEntry): void {
    navigator?.dispatch(
        NavigationActions.navigate({
            routeName: entry?.routeName,
            params: entry?.params
        })
    );
}

export function push (entry: INavigateEntry): void {
    navigator?.dispatch(
        StackActions.push({
            routeName: entry?.routeName,
            params: entry?.params
        })
    );
}

export function replace (entry: INavigateEntry): void {
    navigator?.dispatch(
        StackActions.replace({
            routeName: entry?.routeName,
            params: entry?.params
        })
    );
}

export function reset (entry: INavigateEntry): void {
    navigator?.dispatch(
        StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({
                routeName: entry?.routeName,
                params: entry?.params
            })]
        })
    );
}

export function pop (): void {
    navigator?.dispatch(StackActions.pop({ n: 1 }));
}
