import { Position } from "./position";

export class Character {
  ctx: CanvasRenderingContext2D;
  position: Position;
  vector: Position;
  angle: number;
  width: number;
  height: number;
  life: number;
  ready: boolean;
  image: HTMLImageElement;
  /**
   * @constructor
   * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
   * @param {number} x - X 座標
   * @param {number} y - Y 座標
   * @param {number} w - 幅
   * @param {number} h - 高さ
   * @param {number} life - キャラクターのライフ（生存フラグを兼ねる）
   * @param {string} imagePath - キャラクター用の画像のパス
   */
  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    life: number,
    imagePath: string
  ) {
    this.ctx = ctx;
    this.position = new Position(x, y);
    this.vector = new Position(0.0, -1.0);
    this.angle = (270 * Math.PI) / 180;
    this.width = w;
    this.height = h;
    this.life = life;
    this.ready = false;
    this.image = new Image();
    this.image.addEventListener(
      "load",
      () => {
        // 画像のロードが完了したら準備完了フラグを立てる
        this.ready = true;
      },
      false
    );
    this.image.src = imagePath;
  }

  /**
   * 進行方向を設定する
   * @param {number} x - X 方向の移動量
   * @param {number} y - Y 方向の移動量
   */
  setVector(x: number, y: number) {
    // 自身の vector プロパティに設定する
    this.vector.set(x, y);
  }

  /**
   * 進行方向を角度を元に設定する
   * @param {number} angle - 回転量（ラジアン）
   */
  setVectorFromAngle(angle: number) {
    // 自身の回転量を設定する
    this.angle = angle;
    // ラジアンからサインとコサインを求める
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    // 自身の vector プロパティに設定する
    this.vector.set(cos, sin);
  }

  // キャラクターを描画する
  draw() {
    // キャラクターの幅を考慮してオフセットする量
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    // キャラクターの幅やオフセットする量を加味して描画する
    this.ctx.drawImage(
      this.image,
      this.position.x - offsetX,
      this.position.y - offsetY,
      this.width,
      this.height
    );
  }

  /**
   * 自身の回転量を元に座標系を回転させる
   */
  rotationDraw() {
    // 座標系を回転する前の状態を保存する
    this.ctx.save();
    // 自身の位置が座標系の中心と重なるように平行移動する
    this.ctx.translate(this.position.x, this.position.y);
    // 座標系を回転させる（270 度の位置を基準にするため Math.PI * 1.5 を引いている）
    this.ctx.rotate(this.angle - Math.PI * 1.5);

    // キャラクターの幅を考慮してオフセットする量
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    // キャラクターの幅やオフセットする量を加味して描画する
    this.ctx.drawImage(
      this.image,
      -offsetX, // 先に translate で平行移動しているのでオフセットのみ行う
      -offsetY, // 先に translate で平行移動しているのでオフセットのみ行う
      this.width,
      this.height
    );

    // 座標系を回転する前の状態に戻す
    this.ctx.restore();
  }
}
