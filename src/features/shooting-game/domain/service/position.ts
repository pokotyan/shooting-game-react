import { Shot } from "../model/shot";
import { Character } from "../model/character";
import { Viper } from "../model/viper";

// 衝突判定
export const judgeCollision = ({
  self,
  target,
}: {
  self: Shot | Character;
  target: Character;
}): boolean => {
  // 自身か対象のライフが 0 以下の対象は無視する
  if (self.life <= 0 || target.life <= 0) {
    return false;
  }

  // 自機キャラクターが対象の場合、isComing 中は無敵
  if (target instanceof Viper && target.isComing) {
    return false;
  }

  // 自身の位置と対象との距離を測る
  let dist = self.position.distance(target.position);
  // 自身と対象の幅の 1/4 の距離まで近づいている場合衝突とみなす
  if (dist <= (self.width + target.width) / 4) {
    return true;
  }

  return false;
};

// 移動後の位置が画面外へ出ていないか確認して修正する
export const cantGoOffScreen = (
  target: Character,
  ctx: CanvasRenderingContext2D
) => {
  let canvasWidth = ctx.canvas.width;
  let canvasHeight = ctx.canvas.height;
  let tx = Math.min(Math.max(target.position.x, 0), canvasWidth);
  let ty = Math.min(Math.max(target.position.y, 0), canvasHeight);

  target.position.set(tx, ty);
};
