import { Character } from "./character";
import { Explosion } from "./explosion";
import { Viper } from "./viper";

export class Shot extends Character {
  speed: number;
  power: number;
  targetArray: Character[];
  explosionArray: Explosion[];
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
    this.speed = 7;
    /**
     * 自身の攻撃力
     * @type {number}
     */
    this.power = 1;
    /**
     * 自身と衝突判定を取る対象を格納する
     * @type {Array<Character>}
     */
    this.targetArray = [];
    this.explosionArray = [];
  }

  /**
   * ショットを配置する
   * @param {number} x - 配置する X 座標
   * @param {number} y - 配置する Y 座標
   * @param {number} [speed] - 設定するスピード
   * @param {number} [power] - 設定する攻撃力
   */
  set(x: number, y: number, speed: number, power: number) {
    // 登場開始位置にショットを移動させる
    this.position.set(x, y);
    // ショットのライフを 0 より大きい値（生存の状態）に設定する
    this.life = 1;
    // スピードを設定する
    this.setSpeed(speed);
    // 攻撃力を設定する
    this.setPower(power);
  }

  /**
   * ショットのスピードを設定する
   * @param {number} [speed] - 設定するスピード
   */
  setSpeed(speed: number) {
    // もしスピード引数が有効なら設定する
    if (speed != null && speed > 0) {
      this.speed = speed;
    }
  }

  /**
   * ショットの攻撃力を設定する
   * @param {number} [power] - 設定する攻撃力
   */
  setPower(power: number) {
    // もしスピード引数が有効なら設定する
    if (power != null && power > 0) {
      this.power = power;
    }
  }

  /**
   * ショットが衝突判定を行う対象を設定する
   * @param {Array<Character>} [targets] - 衝突判定の対象を含む配列
   */
  setTargets(targets: Array<Character>) {
    // 引数の状態を確認して有効な場合は設定する
    if (targets && Array.isArray(targets) && targets.length) {
      this.targetArray = targets;
    }
  }

  /**
   * ショットが爆発エフェクトを発生できるよう設定する
   * @param {Array<Explosion>} [targets] - 爆発エフェクトを含む配列
   */
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
    // もしショットのライフが 0 以下の場合はなにもしない
    if (this.life <= 0) {
      return;
    }
    // もしショットが画面外へ移動していたらライフを 0（非生存の状態）に設定する
    if (
      this.position.x + this.width < 0 ||
      this.position.x - this.width > this.ctx.canvas.width ||
      this.position.y + this.height < 0 ||
      this.position.y - this.height > this.ctx.canvas.height
    ) {
      this.life = 0;
    }
    // ショットを進行方向に沿って移動させる
    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;

    // ショットと対象との衝突判定を行う
    this.targetArray.forEach((v) => {
      // 自身か対象のライフが 0 以下の対象は無視する
      if (this.life <= 0 || v.life <= 0) {
        return null;
      }
      // 自身の位置と対象との距離を測る
      let dist = this.position.distance(v.position);
      // 自身と対象の幅の 1/4 の距離まで近づいている場合衝突とみなす
      // TODO 衝突のコードを切り出してEnemyのupdateでも実行する。自機との衝突
      if (dist <= (this.width + v.width) / 4) {
        // 自機キャラクターが対象の場合、isComing 中は無敵
        if (v instanceof Viper && v.isComing) {
          return;
        }
        // 対象のライフを攻撃力分減算する
        v.life -= this.power;
        // もし対象のライフが 0 以下になっていたら爆発エフェクトを発生させる
        if (v.life <= 0) {
          for (let i = 0; i < this.explosionArray.length; ++i) {
            // 発生していない爆発エフェクトがあれば対象の位置に生成する
            if (!this.explosionArray[i].life) {
              this.explosionArray[i].set(v.position.x, v.position.y);
              break;
            }
          }
          // TODO 撃破eventを発行してsubscribeした側でスコアを加算する
          // もし対象が敵キャラクターの場合はスコアを加算する
          // if (v instanceof Enemy === true) {
          //   // 敵キャラクターのタイプによってスコアが変化するようにする
          //   let score = 100;
          //   if (v.type === "large") {
          //     score = 1000;
          //   }
          //   // スコアシステムにもよるが仮でここでは最大スコアを制限
          //   gameScore = Math.min(gameScore + score, 99999);
          // }
        }
        // 自身のライフを 0 にする
        this.life = 0;
      }
    });

    // 座標系の回転を考慮した描画を行う
    this.rotationDraw();
  }
}
