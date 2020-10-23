import { createAppContainer, NavigationContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { routes } from './routes';
import { TViews } from '../views/index';

export const initialRouteName: TViews = 'Landing';

const stackNavigatorConfig: any = {
    headerMode: 'none',
    initialRouteName,
    mode: 'card'
};

// Changelog: https://github.com/react-navigation/react-navigation/blob/4.x/packages/stack/CHANGELOG.md
const stackNavigator: any = createStackNavigator(routes, stackNavigatorConfig);

export const AppContainer: NavigationContainer = createAppContainer(stackNavigator);
