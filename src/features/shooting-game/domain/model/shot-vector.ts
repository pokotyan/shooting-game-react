import { Shot } from "./shot";
import { Position } from "./position";

export interface ShotVector {
  calc(shot: Shot): void;
}

export class Simple implements ShotVector {
  calc(shot: Shot) {
    // ショットを進行方向に沿って移動させる
    shot.position.x += shot.vector.x * shot.speed;
    shot.position.y += shot.vector.y * shot.speed;
  }
}

export class Homing implements ShotVector {
  calc(shot: Shot) {
    // ショットをホーミングさせながら移動させる
    // ※ホーミングで狙う対象は、this.targetArray[0] のみに限定する
    let target = shot.targetArray[0];

    // 自身のフレーム数が 100 より小さい場合はホーミングする
    if (shot.frame < 100) {
      // ターゲットとホーミングショットの相対位置からベクトルを生成する
      let vector = new Position(
        target.position.x - shot.position.x,
        target.position.y - shot.position.y
      );
      // 生成したベクトルを単位化する
      let normalizedVector = vector.normalize();
      // 自分自身の進行方向ベクトルも、念のため単位化しておく
      shot.vector = shot.vector.normalize();
      // ふたつの単位化済みベクトルから外積を計算する
      let cross = shot.vector.cross(normalizedVector);
      // 外積の結果は、スクリーン空間では以下のように説明できる
      // 結果が 0.0     → 真正面か真後ろの方角にいる
      // 結果がプラス   → 右半分の方向にいる
      // 結果がマイナス → 左半分の方向にいる
      // １フレームで回転できる量は度数法で約 1 度程度に設定する
      let rad = Math.PI / 180.0;
      if (cross > 0.0) {
        // 右側にターゲットいるので時計回りに回転させる
        shot.vector.rotate(rad);
      } else if (cross < 0.0) {
        // 左側にターゲットいるので反時計回りに回転させる
        shot.vector.rotate(-rad);
      }
      // ※真正面や真後ろにいる場合はなにもしない
    }
    // 進行方向ベクトルを元に移動させる
    shot.position.x += shot.vector.x * shot.speed;
    shot.position.y += shot.vector.y * shot.speed;
    // 自身の進行方向からアングルを計算し設定する
    shot.angle = Math.atan2(shot.vector.y, shot.vector.x);
  }
}
