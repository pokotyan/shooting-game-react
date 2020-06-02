export class Position {
  x: number;
  y: number;
  // ベクトルの長さを返す静的メソッド
  static calcLength(x: number, y: number) {
    return Math.sqrt(x * x + y * y);
  }
  // ベクトルを単位化した結果を返す静的メソッド
  static calcNormal(x: number, y: number) {
    let len = Position.calcLength(x, y);
    return new Position(x / len, y / len);
  }

  constructor(x: number, y: number) {
    /**
     * X 座標
     */
    this.x = x;
    /**
     * Y 座標
     */
    this.y = y;
  }

  set(x: number, y: number) {
    if (x != null) {
      this.x = x;
    }
    if (y != null) {
      this.y = y;
    }
  }

  // 対象の Position クラスのインスタンスとの距離を返す
  distance(target: Position) {
    let x = this.x - target.x;
    let y = this.y - target.y;
    return Math.sqrt(x * x + y * y);
  }

  /**
   * 対象の Position クラスのインスタンスとの外積を計算する
   * @param {Position} target - 外積の計算を行う対象
   */
  cross(target: Position) {
    return this.x * target.y - this.y * target.x;
  }

  /**
   * 自身を単位化したベクトルを計算して返す
   */
  normalize() {
    // ベクトルの大きさを計算する
    let l = Math.sqrt(this.x * this.x + this.y * this.y);
    // 大きさが 0 の場合は XY も 0 なのでそのまま返す
    if (l === 0) {
      return new Position(0, 0);
    }
    // 自身の XY 要素を大きさで割る
    let x = this.x / l;
    let y = this.y / l;
    // 単位化されたベクトルを返す
    return new Position(x, y);
  }

  /**
   * 指定されたラジアン分だけ自身を回転させる
   * @param {number} radian - 回転量
   */
  rotate(radian: number) {
    // 指定されたラジアンからサインとコサインを求める
    let s = Math.sin(radian);
    let c = Math.cos(radian);
    // 2x2 の回転行列と乗算し回転させる
    this.x = this.x * c + this.y * -s;
    this.y = this.x * s + this.y * c;
  }
}
