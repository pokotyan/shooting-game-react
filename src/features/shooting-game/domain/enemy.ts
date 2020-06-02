import { Position } from "./position";
import { Character } from "./character";
import { Shot } from "./shot";

export class Enemy extends Character {
  type: string;
  frame: number;
  speed: number;
  shotArray: Shot[];
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
     * 自身のタイプ
     * @type {string}
     */
    this.type = "default";
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
  }

  /**
   * 敵を配置する
   * @param {number} x - 配置する X 座標
   * @param {number} y - 配置する Y 座標
   * @param {number} [life=1] - 設定するライフ
   * @param {string} [type='default'] - 設定するタイプ
   */
  set(x: number, y: number, life: number = 1, type: string = "default") {
    // 登場開始位置に敵キャラクターを移動させる
    this.position.set(x, y);
    // 敵キャラクターのライフを 0 より大きい値（生存の状態）に設定する
    this.life = life;
    // 敵キャラクターのタイプを設定する
    this.type = type;
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

  /**
   * キャラクターの状態を更新し描画を行う
   * TODO Shotのupdateにある衝突のコード、ここにもかく。現在敵とぶつかってもダメージ受けない。
   */
  update() {
    // もし敵キャラクターのライフが 0 以下の場合はなにもしない
    if (this.life <= 0) {
      return;
    }

    // タイプに応じて挙動を変える
    // タイプに応じてライフを 0 にする条件も変える
    switch (this.type) {
      // wave タイプはサイン波で左右に揺れるように動く
      // ショットの向きは自機キャラクターの方向に放つ
      case "wave":
        // 配置後のフレームが 60 で割り切れるときにショットを放つ
        if (this.frame % 60 === 0) {
          // 攻撃対象となる自機キャラクターに向かうベクトル
          let tx = this.attackTarget.position.x - this.position.x;
          let ty = this.attackTarget.position.y - this.position.y;
          // ベクトルを単位化する
          let tv = Position.calcNormal(tx, ty);
          // 自機キャラクターにややゆっくりめのショットを放つ
          this.fire(tv.x, tv.y, 4.0);
        }
        // X 座標はサイン波で、Y 座標は一定量で変化する
        this.position.x += Math.sin(this.frame / 10);
        this.position.y += 2.0;
        // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;
      // large タイプはサイン波で左右に揺れるようにゆっくりと動く
      // ショットの向きは放射状にばらまく
      case "large":
        // 配置後のフレームが 50 で割り切れるときにショットを放つ
        if (this.frame % 50 === 0) {
          // 45 度ごとにオフセットした全方位弾を放つ
          for (let i = 0; i < 360; i += 45) {
            let r = (i * Math.PI) / 180;
            // ラジアンからサインとコサインを求める
            let s = Math.sin(r);
            let c = Math.cos(r);
            // 求めたサイン・コサインでショットを放つ
            this.fire(c, s, 3.0);
          }
        }
        // X 座標はサイン波で、Y 座標は一定量で変化する
        this.position.x += Math.sin((this.frame + 90) / 50) * 2.0;
        this.position.y += 1.0;
        // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
        break;
      // default タイプは設定されている進行方向にまっすぐ進むだけの挙動
      case "default":
      default:
        // 配置後のフレームが 100 のときにショットを放つ
        if (this.frame === 100) {
          this.fire();
        }
        // 敵キャラクターを進行方向に沿って移動させる
        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;
        // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
        if (this.position.y - this.height > this.ctx.canvas.height) {
          this.life = 0;
        }
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
