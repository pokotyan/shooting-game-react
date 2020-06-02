import { Shot } from "../model/shot";
import { Character } from "../model/character";
import { Viper } from "../model/viper";

export const judgeCollision = ({
  shot,
  target,
  cb,
}: {
  shot: Shot;
  target: Character;
  cb: () => void;
}) => {
  // 自身か対象のライフが 0 以下の対象は無視する
  if (shot.life <= 0 || target.life <= 0) {
    return null;
  }

  // 自機キャラクターが対象の場合、isComing 中は無敵
  if (target instanceof Viper && target.isComing) {
    return;
  }

  // 自身の位置と対象との距離を測る
  let dist = shot.position.distance(target.position);
  // 自身と対象の幅の 1/4 の距離まで近づいている場合衝突とみなす
  // TODO 衝突のコードを切り出してEnemyのupdateでも実行する。自機との衝突
  if (dist <= (shot.width + target.width) / 4) {
    cb();
  }
};
