import { Character } from "./character";
import { Shot } from "./shot";
import { Event } from "../event";
import { judgeCollision } from "../service/position";
import { Explosion } from "./explosion";
import { Action } from "./action";

export class Enemy extends Character {
  frame: number;
  speed: number;
  shotArray: Shot[];
  attackTarget: Character;
  explosionArray: Explosion[];
  action: Action;
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
    super(ctx, x, y, w, h, 0, imagePath);

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
     * 自身が攻撃の対象とする Character 由来のインスタンス
     * @type {Character}
     */
    this.attackTarget = null as any;

    this.explosionArray = [];

    this.action = null as any;

    const event = new Event();
    event.addOnDestroyEvent();
    this.event = event;
  }

  /**
   * 敵を配置する
   * @param {number} x - 配置する X 座標
   * @param {number} y - 配置する Y 座標
   * @param {number} [life=1] - 設定するライフ
   * @param {string} [type='default'] - 設定するタイプ
   */
  set(x: number, y: number, life: number = 1, action: Action) {
    // 登場開始位置に敵キャラクターを移動させる
    this.position.set(x, y);
    // 敵キャラクターのライフを 0 より大きい値（生存の状態）に設定する
    this.life = life;
    // 敵キャラクターのタイプを設定する
    // this.type = type;
    this.action = action;
    // 敵キャラクターのフレームをリセットする
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
   * 攻撃対象を設定する
   * @param {Character} target - 自身が攻撃対象とするインスタンス
   */
  setAttackTarget(target: Character) {
    // 自身のプロパティに設定する
    this.attackTarget = target;
  }

  setExplosions(targets: Array<Explosion>) {
    // 引数の状態を確認して有効な場合は設定する
    if (targets && Array.isArray(targets) && targets.length) {
      this.explosionArray = targets;
    }
  }

  /**
   * キャラクターの状態を更新し描画を行う
   */
  update() {
    // もし敵キャラクターのライフが 0 以下の場合はなにもしない
    if (this.life <= 0) {
      return;
    }

    this.action.action(this);

    // Viperとの衝突判定
    const isCollision = judgeCollision({
      self: this,
      target: this.attackTarget,
    });

    if (isCollision) {
      // Viperのライフを2減らす。
      this.attackTarget.life -= 2;
      // もし対象のライフが 0 以下になっていたら爆発エフェクトを発生させる
      this.event.emitter.emit("destroy", {
        self: this,
        target: this.attackTarget,
      });
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
   */
  fire(x: number = 0.0, y: number = 1.0, speed = 5.0) {
    // ショットの生存を確認し非生存のものがあれば生成する
    for (let i = 0; i < this.shotArray.length; ++i) {
      // 非生存かどうかを確認する
      if (this.shotArray[i].life <= 0) {
        // 敵キャラクターの座標にショットを生成する
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
}
