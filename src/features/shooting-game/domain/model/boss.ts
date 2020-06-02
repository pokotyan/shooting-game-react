import { Position } from "./position";
import { Character } from "./character";
import { Shot } from "./shot";
import { Homing } from "./homing";

export class Boss extends Character {
  mode: string;
  frame: number;
  speed: number;
  shotArray: Shot[];
  homingArray: Homing[];
  attackTarget: Character;
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {Image} image - キャラクター用の画像のパス
   */
  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    imagePath: string
  ) {
    // 継承元の初期化
    super(ctx, x, y, w, h, 0, imagePath);

    /**
     * 自身のモード
     * @type {string}
     */
    this.mode = "";
    /**
     * 自身が出現してからのフレーム数
     * @type {number}
     */
    this.frame = 0;
    /**
     * 自身の移動スピード（update 一回あたりの移動量）
     * @type {number}
     */
    this.speed = 3;
    /**
     * 自身が持つショットインスタンスの配列
     * @type {Array<Shot>}
     */
    this.shotArray = null as any;
    /**
     * 自身が持つホーミングショットインスタンスの配列
     * @type {Array<Homing>}
     */
    this.homingArray = null as any;
    /**
     * 自身が攻撃の対象とする Character 由来のインスタンス
     * @type {Character}
     */
    this.attackTarget = null as any;
  }

  /**
   * ボスを配置する
   * @param {number} x - 配置する X 座標
   * @param {number} y - 配置する Y 座標
   * @param {number} [life=1] - 設定するライフ
   */
  set(x: number, y: number, life: number = 1) {
    // 登場開始位置にボスキャラクターを移動させる
    this.position.set(x, y);
    // ボスキャラクターのライフを 0 より大きい値（生存の状態）に設定する
    this.life = life;
    // ボスキャラクターのフレームをリセットする
    this.frame = 0;
  }

  /**
   * ショットを設定する
   * @param {Array<Shot>} shotArray - 自身に設定するショットの配列
   */
  setShotArray(shotArray: Array<Shot>) {
    // 自身のプロパティに設定する
    this.shotArray = shotArray;
  }

  /**
   * ホーミングショットを設定する
   * @param {Array<Homing>} homingArray - 自身に設定するホーミングショットの配列
   */
  setHomingArray(homingArray: Array<Homing>) {
    // 自身のプロパティに設定する
    this.homingArray = homingArray;
  }

  /**
   * 攻撃対象を設定する
   * @param {Character} target - 自身が攻撃対象とするインスタンス
   */
  setAttackTarget(target: Character) {
    // 自身のプロパティに設定する
    this.attackTarget = target;
  }

  /**
   * モードを設定する
   * @param {string} mode - 自身に設定するモード
   */
  setMode(mode: string) {
    // 自身のプロパティに設定する
    this.mode = mode;
  }

  /**
   * ボスキャラクターの状態を更新し描画を行う
   */
  update() {
    // もしボスキャラクターのライフが 0 以下の場合はなにもしない
    if (this.life <= 0) {
      return;
    }

    // モードに応じて挙動を変える
    switch (this.mode) {
      // 出現演出時
      case "invade":
        InvadeAction.action(this);
        break;
      // 退避する演出時
      case "escape":
        EscapeAction.action(this);
        break;
      case "floating":
        FloatingAction.action(this);
        break;
      default:
        break;
    }

    // 描画を行う（いまのところ特に回転は必要としていないのでそのまま描画）
    this.draw();
    // 自身のフレームをインクリメントする
    ++this.frame;
  }

  /**
   * 自身から指定された方向にショットを放つ
   * @param {number} [x=0.0] - 進行方向ベクトルの X 要素
   * @param {number} [y=1.0] - 進行方向ベクトルの Y 要素
   * @param {number} [speed=5.0] - ショットのスピード
   */
  fire(x: number = 0.0, y: number = 1.0, speed: number = 5.0) {
    // ショットの生存を確認し非生存のものがあれば生成する
    for (let i = 0; i < this.shotArray.length; ++i) {
      // 非生存かどうかを確認する
      if (this.shotArray[i].life <= 0) {
        // ボスキャラクターの座標にショットを生成する
        this.shotArray[i].set(this.position.x, this.position.y, 0, 0);
        // ショットのスピードを設定する
        this.shotArray[i].setSpeed(speed);
        // ショットの進行方向を設定する（真下）
        this.shotArray[i].setVector(x, y);
        // ひとつ生成したらループを抜ける
        break;
      }
    }
  }

  /**
   * 自身から指定された方向にホーミングショットを放つ
   * @param {number} [x=0.0] - 進行方向ベクトルの X 要素
   * @param {number} [y=1.0] - 進行方向ベクトルの Y 要素
   * @param {number} [speed=3.0] - ショットのスピード
   */
  homingFire(x: number = 0.0, y: number = 1.0, speed: number = 3.0) {
    // ショットの生存を確認し非生存のものがあれば生成する
    for (let i = 0; i < this.homingArray.length; ++i) {
      // 非生存かどうかを確認する
      if (this.homingArray[i].life <= 0) {
        // ボスキャラクターの座標にショットを生成する
        this.homingArray[i].set(this.position.x, this.position.y, 0, 0);
        // ショットのスピードを設定する
        this.homingArray[i].setSpeed(speed);
        // ショットの進行方向を設定する（真下）
        this.homingArray[i].setVector(x, y);
        // ひとつ生成したらループを抜ける
        break;
      }
    }
  }
}

class InvadeAction {
  static action(boss: Boss) {
    boss.position.y += boss.speed;
    if (boss.position.y > 100) {
      boss.position.y = 100;
      boss.mode = "floating";
      boss.frame = 0;
    }
  }
}

class EscapeAction {
  static action(boss: Boss) {
    boss.position.y -= boss.speed;
    if (boss.position.y < -boss.height) {
      boss.life = 0;
    }
  }
}

class FloatingAction {
  static action(boss: Boss) {
    // 配置後のフレーム数を 1000 で割ったとき、余りが 500 未満となる
    // 場合と、そうでない場合で、ショットに関する挙動を変化させる
    if (boss.frame % 1000 < 500) {
      // 配置後のフレーム数を 200 で割った余りが 140 より大きく、かつ、
      // 10 で割り切れる場合に、自機キャラクター狙いショットを放つ
      if (boss.frame % 200 > 140 && boss.frame % 10 === 0) {
        // 攻撃対象となる自機キャラクターに向かうベクトル
        let tx = boss.attackTarget.position.x - boss.position.x;
        let ty = boss.attackTarget.position.y - boss.position.y;
        // ベクトルを単位化する
        let tv = Position.calcNormal(tx, ty);
        // 自機キャラクターにややゆっくりめのショットを放つ
        boss.fire(tv.x, tv.y, 3.0);
      }
    } else {
      // ホーミングショットを放つ
      if (boss.frame % 50 === 0) {
        boss.homingFire(0, 1, 3.5);
      }
    }
    // X 座標はサイン波で左右に揺れるように動かす
    boss.position.x += Math.cos(boss.frame / 100) * 2.0;
  }
}
