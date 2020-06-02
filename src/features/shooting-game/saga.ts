import { all, fork, take } from "redux-saga/effects";
import { actions } from "./slice";
import { Canvas2DUtility } from "./utils/canvas2d";
import { SceneManager } from "./domain/model/scene";
import { Shot } from "./domain/model/shot";
import { Viper } from "./domain/model/viper";
import { Enemy } from "./domain/model/enemy";
import { Boss } from "./domain/model/boss";
import { Explosion } from "./domain/model/explosion";
import { BackgroundStar } from "./domain/model/background-star";
import { Homing } from "./domain/model/homing";
import store, { RootState } from "../../app/store";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const ENEMY_SMALL_MAX_COUNT = 20;
const ENEMY_LARGE_MAX_COUNT = 5;
const SHOT_MAX_COUNT = 10;
const ENEMY_SHOT_MAX_COUNT = 50;
const HOMING_MAX_COUNT = 50;
const EXPLOSION_MAX_COUNT = 10;
const BACKGROUND_STAR_MAX_COUNT = 100;
const BACKGROUND_STAR_MAX_SIZE = 3;
const BACKGROUND_STAR_MAX_SPEED = 4;

let util: Canvas2DUtility = null as any;
let canvas: HTMLCanvasElement = null as any;
let ctx: CanvasRenderingContext2D = null as any;
let scene: SceneManager = null as any;
// let startTime: any = null;
let viper: Viper = null as any;
let enemyArray: Array<Enemy | Boss> = [];
let shotArray: Shot[] = [];
let singleShotArray: Shot[] = [];
let enemyShotArray: Shot[] = [];
let boss: Boss = null as any;
let homingArray: Homing[] = [];
let explosionArray: Explosion[] = [];
let backgroundStarArray: BackgroundStar[] = [];
let restart = false;
let isKeyDown: {
  [k: string]: boolean;
} = {};

const init = () => {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // シーンを初期化する
  scene = new SceneManager();

  // 爆発エフェクトを初期化する
  for (let i = 0; i < EXPLOSION_MAX_COUNT; ++i) {
    explosionArray[i] = new Explosion(ctx, 100.0, 15, 40.0, 1.0);
  }

  // 自機のショットを初期化する
  for (let i = 0; i < SHOT_MAX_COUNT; i++) {
    shotArray[i] = new Shot(ctx, 0, 0, 32, 32, "viper_shot.png");
    singleShotArray[i * 2] = new Shot(
      ctx,
      0,
      0,
      32,
      32,
      "viper_single_shot.png"
    );
    singleShotArray[i * 2 + 1] = new Shot(
      ctx,
      0,
      0,
      32,
      32,
      "viper_single_shot.png"
    );
  }

  // 自機キャラクターを初期化する
  viper = new Viper(ctx, 0, 0, 64, 64, "viper.png");
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
    enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, "enemy_shot.png");
    enemyShotArray[i].setTargets([viper]);
    enemyShotArray[i].setExplosions(explosionArray); // 思ったけどショットが爆発のarray持ってるの変。viper or enemy or bossが持ってるべきでは？
  }

  // ボスキャラクターのホーミングショットを初期化する
  for (let i = 0; i < HOMING_MAX_COUNT; ++i) {
    homingArray[i] = new Homing(ctx, 0, 0, 32, 32, "homing_shot.png");
    homingArray[i].setTargets([viper]); // 引数は配列なので注意
    homingArray[i].setExplosions(explosionArray);
  }

  // ボスキャラクターを初期化する
  boss = new Boss(ctx, 0, 0, 128, 128, "boss.png");
  // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
  boss.setShotArray(enemyShotArray);
  // ボスキャラクターはホーミングショットを持っているので設定する
  boss.setHomingArray(homingArray);
  // 敵キャラクターは常に自機キャラクターを攻撃対象とする
  boss.setAttackTarget(viper);

  // 敵キャラクター（小）を初期化する
  for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
    enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, "enemy_small.png");
    // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
    enemyArray[i].setShotArray(enemyShotArray);
    // 敵キャラクターは常に自機キャラクターを攻撃対象とする
    enemyArray[i].setAttackTarget(viper);
  }

  // 敵キャラクター（大）を初期化する
  for (let i = 0; i < ENEMY_LARGE_MAX_COUNT; ++i) {
    enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(
      ctx,
      0,
      0,
      64,
      64,
      "enemy_large.png"
    );
    // 敵キャラクターはすべて同じショットを共有するのでここで与えておく
    enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
    // 敵キャラクターは常に自機キャラクターを攻撃対象とする
    enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTarget(viper);
  }

  // ボスキャラクターも衝突判定の対象とするために配列に加えておく
  enemyArray = [...enemyArray, boss];

  for (let i = 0; i < SHOT_MAX_COUNT; ++i) {
    // 衝突判定を行うために対象を設定する
    shotArray[i].setTargets(enemyArray);
    singleShotArray[i * 2].setTargets(enemyArray);
    singleShotArray[i * 2 + 1].setTargets(enemyArray);
    // 爆発エフェクトを行うためにショットに設定する
    shotArray[i].setExplosions(explosionArray);
    singleShotArray[i * 2].setExplosions(explosionArray);
    singleShotArray[i * 2 + 1].setExplosions(explosionArray);
  }

  // 流れる星を初期化する
  for (let i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i) {
    // 星の速度と大きさはランダムと最大値によって決まるようにする
    let size = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
    let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);
    // 星のインスタンスを生成する
    backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
    // 星の初期位置もランダムに決まるようにする
    let x = Math.random() * CANVAS_WIDTH;
    let y = Math.random() * CANVAS_HEIGHT;
    backgroundStarArray[i].set(x, y);
  }
};

function loading() {
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

  if (!ready) {
    // 準備が完了していない場合は 0.1 秒ごとに再帰呼出しする
    setTimeout(loading, 100);
  }
}

function eventSetting() {
  window.addEventListener(
    "keydown",
    (event) => {
      isKeyDown[`key_${event.key}`] = true;
      // ゲームオーバーから再スタートするための設定（エンターキー）
      if (event.key === "Enter") {
        // 自機キャラクターのライフが 0 以下の状態
        if (viper.life <= 0) {
          // 再スタートフラグを立てる
          restart = true;
        }
      }
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
    // 3 秒経過したらシーンを invade に変更する
    if (time > 3.0) {
      scene.use("invade_default_type");
    }
  });
  // invade シーン（default type の敵キャラクターを生成）
  scene.add("invade_default_type", (time: number) => {
    // シーンのフレーム数が 30 で割り切れるときは敵キャラクターを配置する
    if (scene.frame % 30 === 0) {
      // ライフが 0 の状態の敵キャラクター（小）が見つかったら配置する
      for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
        if (enemyArray[i].life <= 0) {
          let e = enemyArray[i];
          // ここからさらに２パターンに分ける
          // frame を 60 で割り切れるかどうかで分岐する
          if (scene.frame % 60 === 0) {
            // 左側面から出てくる
            e.set(-e.width, 30, 2, "default");
            // 進行方向は 30 度の方向
            e.setVectorFromAngle(degreesToRadians(30));
          } else {
            // 右側面から出てくる
            e.set(CANVAS_WIDTH + e.width, 30, 2, "default");
            // 進行方向は 150 度の方向
            e.setVectorFromAngle(degreesToRadians(150));
          }
          break;
        }
      }
    }
    // シーンのフレーム数が 270 になったとき次のシーンへ
    if (scene.frame === 270) {
      scene.use("blank");
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if (viper.life <= 0) {
      scene.use("gameover");
    }
  });
  // 間隔調整のための空白のシーン
  scene.add("blank", (time: number) => {
    // シーンのフレーム数が 150 になったとき次のシーンへ
    if (scene.frame === 150) {
      scene.use("invade_wave_move_type");
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if (viper.life <= 0) {
      scene.use("gameover");
    }
  });
  // invade シーン（wave move type の敵キャラクターを生成）
  scene.add("invade_wave_move_type", (time: number) => {
    // シーンのフレーム数が 50 で割り切れるときは敵キャラクターを配置する
    if (scene.frame % 50 === 0) {
      // ライフが 0 の状態の敵キャラクター（小）が見つかったら配置する
      for (let i = 0; i < ENEMY_SMALL_MAX_COUNT; ++i) {
        if (enemyArray[i].life <= 0) {
          let e = enemyArray[i];
          // ここからさらに２パターンに分ける
          // frame が 200 以下かどうかで分ける
          if (scene.frame <= 200) {
            // 左側を進む
            e.set(CANVAS_WIDTH * 0.2, -e.height, 2, "wave");
          } else {
            // 右側を進む
            e.set(CANVAS_WIDTH * 0.8, -e.height, 2, "wave");
          }
          break;
        }
      }
    }
    // シーンのフレーム数が 450 になったとき次のシーンへ
    if (scene.frame === 450) {
      scene.use("invade_large_type");
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if (viper.life <= 0) {
      scene.use("gameover");
    }
  });
  // invade シーン（large type の敵キャラクターを生成）
  scene.add("invade_large_type", (time: number) => {
    // シーンのフレーム数が 100 になった際に敵キャラクター（大）を配置する
    if (scene.frame === 100) {
      // ライフが 0 の状態の敵キャラクター（大）が見つかったら配置する
      let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
      for (let j = ENEMY_SMALL_MAX_COUNT; j < i; ++j) {
        if (enemyArray[j].life <= 0) {
          let e = enemyArray[j];
          // 画面中央あたりから出現しライフが多い
          e.set(CANVAS_WIDTH / 2, -e.height, 50, "large");
          break;
        }
      }
    }
    // シーンのフレーム数が 500 になったとき intro へ
    if (scene.frame === 500) {
      scene.use("invade_boss");
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    if (viper.life <= 0) {
      scene.use("gameover");
    }
  });
  // invade シーン（ボスキャラクターを生成）
  scene.add("invade_boss", (time: number) => {
    // シーンのフレーム数が 0 となる最初のフレームでボスを登場させる
    if (scene.frame === 0) {
      // 画面中央上から登場するように位置を指定し、ライフは 250 に設定
      boss.set(CANVAS_WIDTH / 2, -boss.height, 250);
      // ボスキャラクター自身のモードは invade から始まるようにする
      boss.setMode("invade");
    }
    // 自機キャラクターが被弾してライフが 0 になっていたらゲームオーバー
    // ゲームオーバー画面が表示されているうちにボス自身は退避させる
    if (viper.life <= 0) {
      scene.use("gameover");
      boss.setMode("escape");
    }
    // ボスが破壊されたらシーンを intro に設定する
    if (boss.life <= 0) {
      scene.use("intro");
    }
  });
  // ゲームオーバーシーン
  // ここでは画面にゲームオーバーの文字が流れ続けるようにする
  scene.add("gameover", (time: number) => {
    // 流れる文字の幅は画面の幅の半分を最大の幅とする
    let textWidth = CANVAS_WIDTH / 2;
    // 文字の幅を全体の幅に足し、ループする幅を決める
    let loopWidth = CANVAS_WIDTH + textWidth;
    // フレーム数に対する除算の剰余を計算し、文字列の位置とする
    let x = CANVAS_WIDTH - ((scene.frame * 2) % loopWidth);
    // 文字列の描画
    ctx.font = "bold 72px sans-serif";
    util.drawText("GAME OVER", x, CANVAS_HEIGHT / 2, "#ff0000", textWidth);
    // 再スタートのための処理
    if (restart) {
      // 再スタートフラグはここでまず最初に下げておく
      restart = false;
      // スコアをリセットしておく
      // gameScore = 0;
      // 再度スタートするための座標等の設定
      viper.setComing(
        CANVAS_WIDTH / 2, // 登場演出時の開始 X 座標
        CANVAS_HEIGHT + 50, // 登場演出時の開始 Y 座標
        CANVAS_WIDTH / 2, // 登場演出を終了とする X 座標
        CANVAS_HEIGHT - 100 // 登場演出を終了とする Y 座標
      );
      // シーンを intro に設定
      scene.use("intro");
    }
  });
  // 一番最初のシーンには intro を設定する
  scene.use("intro");
}

function render() {
  // グローバルなアルファを必ず 1.0 で描画処理を開始する
  ctx.globalAlpha = 1.0;
  // 描画前に画面全体を暗いネイビーで塗りつぶす
  util.drawRect(0, 0, canvas.width, canvas.height, "#111122");

  // スコアの表示
  const {
    game: { point },
  }: RootState = store.getState();
  ctx.font = "bold 24px monospace";
  util.drawText(zeroPadding(point, 5), 30, 50, "#ffffff");

  scene.update();

  backgroundStarArray.forEach((v: any) => {
    v.update();
  });

  viper.update(isKeyDown);

  boss.update();

  homingArray.forEach((v: any) => {
    v.update();
  });

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

  explosionArray.forEach((v: any) => {
    v.update();
  });

  requestAnimationFrame(render);
}

/**
 * 度数法の角度からラジアンを生成する
 * @param {number} degrees - 度数法の度数
 */
const degreesToRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

/**
 * 数値の不足した桁数をゼロで埋めた文字列を返す
 * @param {number} number - 数値
 * @param {number} count - 桁数（２桁以上）
 */
function zeroPadding(number: number, count: number) {
  // 配列を指定の桁数分の長さで初期化する
  let zeroArray = new Array(count);
  // 配列の要素を '0' を挟んで連結する（つまり「桁数 - 1」の 0 が連なる）
  let zeroString = zeroArray.join("0") + number;
  // 文字列の後ろから桁数分だけ文字を抜き取る
  return zeroString.slice(-count);
}

export function* initialize() {
  const { payload } = yield take(actions.initialize);

  util = new Canvas2DUtility(payload);

  canvas = util.canvas;
  ctx = util.context;

  init();
  loading();
  // イベントを設定する
  eventSetting();
  // シーンを定義する
  sceneSetting();
  // 描画処理を開始する
  render();
}

function* rootSaga() {
  yield all([fork(initialize)]);
}

export default rootSaga;
