import { Enemy } from "./enemy";
import { Position } from "./position";
import { Boss } from "./boss";

export interface Action {
  action(enemy: Enemy): void;
}

// wave タイプはサイン波で左右に揺れるように動く
// ショットの向きは自機キャラクターの方向に放つ
export class Wave implements Action {
  action(enemy: Enemy) {
    // 配置後のフレームが 60 で割り切れるときにショットを放つ
    if (enemy.frame % 60 === 0) {
      // 攻撃対象となる自機キャラクターに向かうベクトル
      let tx = enemy.attackTarget.position.x - enemy.position.x;
      let ty = enemy.attackTarget.position.y - enemy.position.y;
      // ベクトルを単位化する
      let tv = Position.calcNormal(tx, ty);
      // 自機キャラクターにややゆっくりめのショットを放つ
      enemy.fire(tv.x, tv.y, 4.0);
    }
    // X 座標はサイン波で、Y 座標は一定量で変化する
    enemy.position.x += Math.sin(enemy.frame / 10);
    enemy.position.y += 2.0;
    // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
    if (enemy.position.y - enemy.height > enemy.ctx.canvas.height) {
      enemy.life = 0;
    }
  }
}

// large タイプはサイン波で左右に揺れるようにゆっくりと動く
// ショットの向きは放射状にばらまく
export class Large implements Action {
  action(enemy: Enemy) {
    // 配置後のフレームが 50 で割り切れるときにショットを放つ
    if (enemy.frame % 50 === 0) {
      // 45 度ごとにオフセットした全方位弾を放つ
      for (let i = 0; i < 360; i += 45) {
        let r = (i * Math.PI) / 180;
        // ラジアンからサインとコサインを求める
        let s = Math.sin(r);
        let c = Math.cos(r);
        // 求めたサイン・コサインでショットを放つ
        enemy.fire(c, s, 3.0);
      }
    }
    // X 座標はサイン波で、Y 座標は一定量で変化する
    enemy.position.x += Math.sin((enemy.frame + 90) / 50) * 2.0;
    enemy.position.y += 1.0;
    // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
    if (enemy.position.y - enemy.height > enemy.ctx.canvas.height) {
      enemy.life = 0;
    }
  }
}

// default タイプは設定されている進行方向にまっすぐ進むだけの挙動
export class Default implements Action {
  action(enemy: Enemy) {
    // 配置後のフレームが 100 のときにショットを放つ
    if (enemy.frame === 100) {
      enemy.fire();
    }
    // 敵キャラクターを進行方向に沿って移動させる
    enemy.position.x += enemy.vector.x * enemy.speed;
    enemy.position.y += enemy.vector.y * enemy.speed;
    // 画面外（画面下端）へ移動していたらライフを 0（非生存の状態）に設定する
    if (enemy.position.y - enemy.height > enemy.ctx.canvas.height) {
      enemy.life = 0;
    }
  }
}

export class InvadeAction implements Action {
  action(boss: Boss) {
    boss.position.y += boss.speed;
  }
}

export class EscapeAction implements Action {
  action(boss: Boss) {
    boss.position.y -= boss.speed;
    if (boss.position.y < -boss.height) {
      boss.life = 0;
    }
  }
}

export class FloatingAction implements Action {
  action(boss: Boss) {
    // 配置後のフレーム数を 1000 で割ったとき、余りが 500 未満となる
    // 場合と、そうでない場合で、ショットに関する挙動を変化させる
    if (boss.frame % 1000 < 500) {
      // 配置後のフレーム数を 200 で割った余りが 140 より大きく、かつ、
      // 10 で割り切れる場合に、自機キャラクター狙いショットを放つ
      if (boss.frame % 200 > 140 && boss.frame % 10 === 0) {
        // 攻撃対象となる自機キャラクターに向かうベクトル
        let tx = boss.attackTarget.position.x - boss.position.x;
        let ty = boss.attackTarget.position.y - boss.position.y;
        // ベクトルを単位化する
        let tv = Position.calcNormal(tx, ty);
        // 自機キャラクターにややゆっくりめのショットを放つ
        boss.fire(tv.x, tv.y, 3.0);
      }
    } else {
      // ホーミングショットを放つ
      if (boss.frame % 50 === 0) {
        boss.homingFire(0, 1, 3.5);
      }
    }
    // X 座標はサイン波で左右に揺れるように動かす
    boss.position.x += Math.cos(boss.frame / 100) * 2.0;
  }
}
