import {
  configureStore,
  combineReducers,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import counterReducer from "../features/counter/slice";
import gameReducer from "../features/shooting-game/slice";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./saga";
import logger from "redux-logger";

export type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();
const middleware = [
  ...getDefaultMiddleware({ thunk: false, serializableCheck: false }),
  sagaMiddleware,
  logger,
];

export const rootReducer = combineReducers({
  counter: counterReducer,
  game: gameReducer,
});

const setupStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware,
  });

  sagaMiddleware.run(rootSaga);
  return store;
};

const store = setupStore();

export default store;
