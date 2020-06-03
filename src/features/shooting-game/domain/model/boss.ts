import { Character } from "./character";
import { Shot } from "./shot";
import { Homing } from "./homing";
import { Explosion } from "./explosion";
import { Event } from "../event";
import { Action } from "./action";
import { Enemy } from "./enemy";

export class Boss extends Enemy {
  action: Action;
  frame: number;
  speed: number;
  shotArray: Shot[];
  homingArray: Homing[];
  attackTarget: Character;
  explosionArray: Explosion[];
  event: Event;
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
    super(ctx, x, y, w, h, imagePath);

    this.action = null as any;
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

    this.explosionArray = [];

    const event = new Event();
    event.addOnDestroyEvent();
    this.event = event;
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
   * ホーミングショットを設定する
   * @param {Array<Homing>} homingArray - 自身に設定するホーミングショットの配列
   */
  setHomingArray(homingArray: Array<Homing>) {
    // 自身のプロパティに設定する
    this.homingArray = homingArray;
  }

  setAction(action: Action) {
    this.action = action;
    this.frame = 0;
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
