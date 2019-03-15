import { createStore, applyMiddleware } from 'redux';
// import { syncHistoryWithStore} from 'react-router-redux';
import { createBrowserHistory } from 'history';
// import the root reducer
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import rootReducer from './reducers/index';

const defaultState = {};

const persistConfig = {
   key: 'root',
   storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer, defaultState,
 composeWithDevTools(applyMiddleware(thunk)));
export const persistor = persistStore(store);

if (module.hot) {
   module.hot.accept('./reducers/',() => {
      const nextRootReducer = require('./reducers/index').default;
      store.replaceReducer(nextRootReducer);
   });
}

export const history = createBrowserHistory();

