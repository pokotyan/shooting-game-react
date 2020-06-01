import { all, fork } from "redux-saga/effects";
import game from "../features/shooting-game/saga";

export function* rootSaga() {
  yield all([fork(game)]);
}
