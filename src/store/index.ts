import { applyMiddleware, createStore, compose, Store } from 'redux';
import { createMigrate, persistStore, persistReducer, Persistor } from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import userProfileMiddleware from './middlewares/userProfile';
import influencersMiddleware from './middlewares/influencers';
import userInterfaceMiddleware from './middlewares/userInterface';
import reducers from './reducers';
import persistStorage from '@react-native-community/async-storage';
import migrations from './migrations';
import defaultInstance, { authInstance, setStoreInstance } from '../utils/api';

// Put reducer keys that you do NOT want stored to persistence here
const persistBlacklist = ['userInterface'];
const persistConfig = {
    blacklist: persistBlacklist,
    key: 'root',
    migrate: createMigrate(migrations, { debug: false }),
    storage: persistStorage,
    version: 11
};

export default function configureStore (initialState?: {}): { store: Store, persistor: Persistor } {
    let createStoreWithMiddleware;

    const appliedMiddlewares = applyMiddleware(
        thunkMiddleware.withExtraArgument({ defaultInstance, authInstance }),
        userProfileMiddleware(),
        influencersMiddleware(),
        userInterfaceMiddleware()
    );
    let middlewares = [appliedMiddlewares];

    if (__DEV__) {
        if (global.reduxNativeDevTools) {
            middlewares.push(global.reduxNativeDevTools());
        }
    }

    createStoreWithMiddleware = compose(...middlewares);

    const store = createStoreWithMiddleware(createStore)(
        persistReducer(persistConfig, reducers),
        initialState
    );
    setStoreInstance(store);

    const persistor = persistStore(store);
    return { store, persistor };
}
