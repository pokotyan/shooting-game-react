import { Shot } from "../model/shot";

// ショットが画面外へ移動しているかどうか
export const isOverflow = (shot: Shot, ctx: CanvasRenderingContext2D) => {
  return (
    shot.position.x + shot.width < 0 ||
    shot.position.x - shot.width > ctx.canvas.width ||
    shot.position.y + shot.height < 0 ||
    shot.position.y - shot.height > ctx.canvas.height
  );
};
