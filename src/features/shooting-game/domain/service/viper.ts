import { Viper } from "../model/viper";

export const action = (
  viper: Viper,
  isKeyDown: { [k: string]: boolean }
): void => {
  // 移動
  if (isKeyDown.ArrowLeft) {
    viper.position.x -= viper.speed; // 左
  }
  if (isKeyDown.ArrowRight) {
    viper.position.x += viper.speed; // 右
  }
  if (isKeyDown.ArrowUp) {
    viper.position.y -= viper.speed; // 上
  }
  if (isKeyDown.ArrowDown) {
    viper.position.y += viper.speed; // 下
  }

  // ショット
  if (isKeyDown.z) {
    attack(viper);
  }
};

const attack = (viper: Viper) => {
  // ショットを撃てる状態なのかを確認する
  // ショットチェック用カウンタが 0 以上ならショットを生成できる
  if (viper.shotCheckCounter >= 0) {
    // ショットの生存を確認し非生存のものがあれば生成する
    for (let i = 0; i < viper.shotArray.length; ++i) {
      // 非生存かどうかを確認する
      if (viper.shotArray[i].life <= 0) {
        // 自機キャラクターの座標にショットを生成する
        viper.shotArray[i].set(viper.position.x, viper.position.y, 0, 0);
        // 中央のショットは攻撃力を 2 にする
        viper.shotArray[i].setPower(2);
        // ショットを生成したのでインターバルを設定する
        viper.shotCheckCounter = -viper.shotInterval;
        // ひとつ生成したらループを抜ける
        break;
      }
    }
    // シングルショットの生存を確認し非生存のものがあれば生成する
    // このとき、2 個をワンセットで生成し左右に進行方向を振り分ける
    for (let i = 0; i < viper.singleShotArray.length; i += 2) {
      // 非生存かどうかを確認する
      if (
        viper.singleShotArray[i].life <= 0 &&
        viper.singleShotArray[i + 1].life <= 0
      ) {
        // 真上の方向（270 度）から左右に 10 度傾いたラジアン
        let radCW = (280 * Math.PI) / 180; // 時計回りに 10 度分
        let radCCW = (260 * Math.PI) / 180; // 反時計回りに 10 度分
        // 自機キャラクターの座標にショットを生成する
        viper.singleShotArray[i].set(viper.position.x, viper.position.y, 0, 0);
        viper.singleShotArray[i].setVectorFromAngle(radCW); // やや右に向かう
        viper.singleShotArray[i + 1].set(
          viper.position.x,
          viper.position.y,
          0,
          0
        );
        viper.singleShotArray[i + 1].setVectorFromAngle(radCCW); // やや左に向かう
        // ショットを生成したのでインターバルを設定する
        viper.shotCheckCounter = -viper.shotInterval;
        // 一組生成したらループを抜ける
        break;
      }
    }
  }
  // ショットチェック用のカウンタをインクリメントする
  ++viper.shotCheckCounter;
};
