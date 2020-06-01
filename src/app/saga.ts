import { all, fork } from "redux-saga/effects";
import counter from "../features/counter/saga";
import game from "../features/shooting-game/saga";

export function* rootSaga() {
  yield all([fork(counter), fork(game)]);
}
