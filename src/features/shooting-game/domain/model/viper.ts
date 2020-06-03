import { Position } from "./position";
import { Character } from "./character";
import { Shot } from "./shot";
import { cantGoOffScreen } from "../service/position";
import { action } from "../service/viper";

export class Viper extends Character {
  speed: number;
  shotCheckCounter: number;
  shotInterval: number;
  isComing: boolean;
  comingStart: number;
  comingStartPosition: Position;
  comingEndPosition: Position;
  shotArray: Shot[];
  singleShotArray: Shot[];
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
     * 自身の移動スピード（update 一回あたりの移動量）
     * @type {number}
     */
    this.speed = 3;
    /**
     * ショットを撃ったあとのチェック用カウンタ
     * @type {number}
     */
    this.shotCheckCounter = 0;
    /**
     * ショットを撃つことができる間隔（フレーム数）
     * @type {number}
     */
    this.shotInterval = 10;
    /**
     * viper が登場中かどうかを表すフラグ
     * @type {boolean}
     */
    this.isComing = false;
    /**
     * 登場演出を開始した際のタイムスタンプ
     * @type {number}
     */
    this.comingStart = null as any;
    /**
     * 登場演出を開始する座標
     * @type {Position}
     */
    this.comingStartPosition = null as any;
    /**
     * 登場演出を完了とする座標
     * @type {Position}
     */
    this.comingEndPosition = null as any;
    /**
     * 自身が持つショットインスタンスの配列
     * @type {Array<Shot>}
     */
    this.shotArray = null as any;
    /**
     * 自身が持つシングルショットインスタンスの配列
     * @type {Array<Shot>}
     */
    this.singleShotArray = null as any;
  }

  /**
   * 登場演出に関する設定を行う
   * @param {number} startX - 登場開始時の X 座標
   * @param {number} startY - 登場開始時の Y 座標
   * @param {number} endX - 登場終了とする X 座標
   * @param {number} endY - 登場終了とする Y 座標
   */
  setComing(startX: number, startY: number, endX: number, endY: number) {
    // 自機キャラクターのライフを 1 に設定する（復活する際を考慮）
    this.life = 1;
    // 登場中のフラグを立てる
    this.isComing = true;
    // 登場開始時のタイムスタンプを取得する
    this.comingStart = Date.now();
    // 登場開始位置に自機を移動させる
    this.position.set(startX, startY);
    // 登場開始位置を設定する
    this.comingStartPosition = new Position(startX, startY);
    // 登場終了とする座標を設定する
    this.comingEndPosition = new Position(endX, endY);
  }

  /**
   * ショットを設定する
   * @param {Array<Shot>} shotArray - 自身に設定するショットの配列
   * @param {Array<Shot>} singleShotArray - 自身に設定するシングルショットの配列
   */
  setShotArray(shotArray: Array<Shot>, singleShotArray: Array<Shot>) {
    // 自身のプロパティに設定する
    this.shotArray = shotArray;
    this.singleShotArray = singleShotArray;
  }

  /**
   * キャラクターの状態を更新し描画を行う
   */
  update(isKeyDown: { [k: string]: boolean }) {
    // ライフが尽きていたら何も操作できないようにする
    if (this.life <= 0) {
      return;
    }
    // 現時点のタイムスタンプを取得する
    let justTime = Date.now();

    // 登場シーンかどうかに応じて処理を振り分ける
    if (this.isComing) {
      // 登場シーンが始まってからの経過時間
      let comingTime = (justTime - this.comingStart) / 1000;
      // 登場中は時間が経つほど上に向かって進む
      let y = this.comingStartPosition.y - comingTime * 50;
      // 一定の位置まで移動したら登場シーンを終了する
      if (y <= this.comingEndPosition.y) {
        this.isComing = false; // 登場シーンフラグを下ろす
        y = this.comingEndPosition.y; // 行き過ぎの可能性もあるので位置を再設定
      }
      // 求めた Y 座標を自機に設定する
      this.position.set(this.position.x, y);

      // 自機の登場演出時は点滅させる
      if (justTime % 100 < 50) {
        this.ctx.globalAlpha = 0.5;
      }
    } else {
      // キーの押下状態に従って行動する
      action(this, isKeyDown);
      // 移動後の位置が画面外へ出ていないか確認して修正する
      cantGoOffScreen(this, this.ctx);
    }

    // 自機キャラクターを描画する
    this.draw();

    // 念の為グローバルなアルファの状態を元に戻す
    this.ctx.globalAlpha = 1.0;
  }
}
