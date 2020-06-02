import { Position } from "./position";
import { Shot } from "./shot";
import { Event } from "../event";
import { judgeCollision } from "../service/position";
import { isOverflow } from "../service/shot";

export class Homing extends Shot {
  frame: number;
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
    // 継承元（Shot）の初期化
    super(ctx, x, y, w, h, imagePath);

    // 永遠に曲がり続けないようにするためにフレーム数を持たせる
    this.frame = 0;

    const event = new Event();
    event.addOnDestroyEvent();
    this.event = event;
  }

  /**
   * ホーミングショットを配置する
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
    // フレームをリセットする
    this.frame = 0;
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
    if (isOverflow(this, this.ctx)) {
      this.life = 0;
    }
    // ショットをホーミングさせながら移動させる
    // ※ホーミングで狙う対象は、this.targetArray[0] のみに限定する
    let target = this.targetArray[0];
    // 自身のフレーム数が 100 より小さい場合はホーミングする
    if (this.frame < 100) {
      // ターゲットとホーミングショットの相対位置からベクトルを生成する
      let vector = new Position(
        target.position.x - this.position.x,
        target.position.y - this.position.y
      );
      // 生成したベクトルを単位化する
      let normalizedVector = vector.normalize();
      // 自分自身の進行方向ベクトルも、念のため単位化しておく
      this.vector = this.vector.normalize();
      // ふたつの単位化済みベクトルから外積を計算する
      let cross = this.vector.cross(normalizedVector);
      // 外積の結果は、スクリーン空間では以下のように説明できる
      // 結果が 0.0     → 真正面か真後ろの方角にいる
      // 結果がプラス   → 右半分の方向にいる
      // 結果がマイナス → 左半分の方向にいる
      // １フレームで回転できる量は度数法で約 1 度程度に設定する
      let rad = Math.PI / 180.0;
      if (cross > 0.0) {
        // 右側にターゲットいるので時計回りに回転させる
        this.vector.rotate(rad);
      } else if (cross < 0.0) {
        // 左側にターゲットいるので反時計回りに回転させる
        this.vector.rotate(-rad);
      }
      // ※真正面や真後ろにいる場合はなにもしない
    }
    // 進行方向ベクトルを元に移動させる
    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;
    // 自身の進行方向からアングルを計算し設定する
    this.angle = Math.atan2(this.vector.y, this.vector.x);

    // ショットと対象との衝突判定を行う
    // ※以下は Shot クラスの衝突判定とまったく同じロジック
    this.targetArray.forEach((v) => {
      judgeCollision({
        shot: this,
        target: v,
        cb: () => {
          // 対象のライフを攻撃力分減算する
          v.life -= this.power;
          // もし対象のライフが 0 以下になっていたら爆発エフェクトを発生させる
          this.event.emitter.emit("destroy", { shot: this, target: v });
        },
      });
    });
    // 座標系の回転を考慮した描画を行う
    this.rotationDraw();
    // 自身のフレームをインクリメントする
    ++this.frame;
  }
}
