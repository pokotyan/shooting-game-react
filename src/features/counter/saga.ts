import { all, fork, take, put } from "redux-saga/effects";
import { actions } from "./slice";

function* incrementSaga() {
  while (true) {
    const { payload } = yield take(actions.incrementAsync);

    console.log(payload);
    yield put(actions.increment());
  }
}

function* rootSaga() {
  yield all([fork(incrementSaga)]);
}

export default rootSaga;
