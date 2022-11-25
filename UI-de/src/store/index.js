'use strict';
import {createStore, applyMiddleware} from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
// import { composeWithDevTools } from 'redux-devtools-extension';

export default (initialState) => {
  const logger = createLogger();
  // const store = createStore(rootReducer, initialState, composeWithDevTools(applyMiddleware(thunk)));
  const store = __DEV_MODE__ ? createStore(rootReducer, initialState, applyMiddleware(thunk, logger)) : createStore(rootReducer, initialState, applyMiddleware(thunk));
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};
