import { all, fork, take } from "redux-saga/effects";
import { actions } from "./slice";
import { Canvas2DUtility } from "./utils/canvas2d";
import { SceneManager } from "./domain/scene";
import { Shot, Viper, Enemy } from "./domain/character";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const ENEMY_MAX_COUNT = 10;
const SHOT_MAX_COUNT = 10;
const ENEMY_SHOT_MAX_COUNT = 50;
let util: any = null;
let canvas: any = null;
let ctx: any = null;
let scene: any = null;
let startTime: any = null;
let viper: any = null;
let enemyArray: any = [];
let shotArray: any = [];
let singleShotArray: any = [];
let enemyShotArray: any = [];
let isKeyDown: {
  [k: string]: boolean;
} = {};

const init = () => {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // シーンを初期化する
  scene = new SceneManager();

  // 自機のショットを初期化する
  for (let i = 0; i < SHOT_MAX_COUNT; i++) {
    shotArray[i] = new Shot(
      ctx,
      0,
      0,
      32,
      32,
      "http://localhost:3000/viper_shot.png"
    );
    singleShotArray[i * 2] = new Shot(
      ctx,
      0,
      0,
      32,
      32,
      "http://localhost:3000/viper_single_shot.png"
    );
    singleShotArray[i * 2 + 1] = new Shot(
      ctx,
      0,
      0,
      32,
      32,
      "http://localhost:3000/viper_single_shot.png"
    );
  }

  // 自機キャラクターを初期化する
  viper = new Viper(ctx, 0, 0, 64, 64, "http://localhost:3000/viper.png");
  // 登場シーンからスタートするための設定を行う
  viper.setComing(
    CANVAS_WIDTH / 2, // 登場演出時の開始 X 座標
    CANVAS_HEIGHT + 50, // 登場演出時の開始 Y 座標
    CANVAS_WIDTH / 2, // 登場演出を終了とする X 座標
    CANVAS_HEIGHT - 100 // 登場演出を終了とする Y 座標
  );
  // ショットを自機キャラクターに設定する
  viper.setShotArray(shotArray, singleShotArray);

  // 敵キャラクターのショットを初期化する
  for (let i = 0; i < ENEMY_SHOT_MAX_COUNT; ++i) {
    enemyShotArray[i] = new Shot(
      ctx,
      0,
      0,
      32,
      32,
      "http://localhost:3000/enemy_shot.png"
    );
  }

  // 敵キャラクターを初期化する
  for (let i = 0; i < ENEMY_MAX_COUNT; ++i) {
    enemyArray[i] = new Enemy(
      ctx,
      0,
      0,
      48,
      48,
      "http://localhost:3000/enemy_small.png"
    );
    // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
    enemyArray[i].setShotArray(enemyShotArray);
  }
};

function loadCheck() {
  let ready = true;

  ready = ready && viper.ready;
  enemyArray.forEach((v: any) => {
    ready = ready && v.ready;
  });
  shotArray.forEach((v: any) => {
    ready = ready && v.ready;
  });
  singleShotArray.forEach((v: any) => {
    ready = ready && v.ready;
  });
  enemyShotArray.forEach((v: any) => {
    ready = ready && v.ready;
  });

  // 全ての準備が完了したら次の処理に進む
  if (ready === true) {
    // イベントを設定する
    eventSetting();
    // シーンを定義する
    sceneSetting();
    // 実行開始時のタイムスタンプを取得する
    startTime = Date.now();
    // 描画処理を開始する
    render();
  } else {
    // 準備が完了していない場合は 0.1 秒ごとに再帰呼出しする
    setTimeout(loadCheck, 100);
  }
}

function eventSetting() {
  window.addEventListener(
    "keydown",
    (event) => {
      isKeyDown[`key_${event.key}`] = true;
    },
    false
  );
  window.addEventListener(
    "keyup",
    (event) => {
      isKeyDown[`key_${event.key}`] = false;
    },
    false
  );
}

function sceneSetting() {
  scene.add("intro", (time: number) => {
    // 2 秒経過したらシーンを invade に変更する
    if (time > 2.0) {
      scene.use("invade");
    }
  });
  // invade シーン
  scene.add("invade", (time: number) => {
    // シーンのフレーム数が 0 のときは敵キャラクターを配置する
    if (scene.frame === 0) {
      // ライフが 0 の状態の敵キャラクターが見つかったら配置する
      for (let i = 0; i < ENEMY_MAX_COUNT; ++i) {
        if (enemyArray[i].life <= 0) {
          let e = enemyArray[i];
          // 出現場所は X が画面中央、Y が画面上端の外側に設定する
          e.set(CANVAS_WIDTH / 2, -e.height, 1, "default");
          // 進行方向は真下に向かうように設定する
          e.setVector(0.0, 1.0);
          break;
        }
      }
    }
    // シーンのフレーム数が 100 になったときに再度 invade を設定する
    if (scene.frame === 100) {
      scene.use("invade");
    }
  });
  // 一番最初のシーンには intro を設定する
  scene.use("intro");
}

function render() {
  // グローバルなアルファを必ず 1.0 で描画処理を開始する
  ctx.globalAlpha = 1.0;
  // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
  util.drawRect(0, 0, canvas.width, canvas.height, "#eeeeee");
  // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
  let nowTime = (Date.now() - startTime) / 1000;

  scene.update();

  viper.update(isKeyDown);

  enemyArray.forEach((v: any) => {
    v.update();
  });

  shotArray.forEach((v: any) => {
    v.update();
  });

  singleShotArray.forEach((v: any) => {
    v.update();
  });

  enemyShotArray.forEach((v: any) => {
    v.update();
  });

  requestAnimationFrame(render);
}

export function* initialize() {
  const { payload } = yield take(actions.initialize);

  util = new Canvas2DUtility(payload);

  canvas = util.canvas;
  ctx = util.context;

  init();
  loadCheck();
}

function* rootSaga() {
  yield all([fork(initialize)]);
}

export default rootSaga;
