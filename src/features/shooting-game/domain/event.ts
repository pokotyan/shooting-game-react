import { EventEmitter } from "events";
import { Shot } from "./model/shot";
import { Character } from "./model/character";
import store from "../../../app/store";
import { actions } from "../slice";
import { Enemy } from "./model/enemy";

export class Event {
  emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public addOnDestroyEvent() {
    this.emitter.on(
      "destroy",
      ({ shot, target }: { shot: Shot; target: Character }) => {
        if (target.life <= 0) {
          for (let i = 0; i < shot.explosionArray.length; ++i) {
            // 発生していない爆発エフェクトがあれば対象の位置に生成する
            if (!shot.explosionArray[i].life) {
              shot.explosionArray[i].set(target.position.x, target.position.y);
              break;
            }
          }

          // もし対象が敵キャラクターの場合はスコアを加算する
          if (target instanceof Enemy) {
            // 敵キャラクターのタイプによってスコアが変化するようにする
            let score = 100;
            if (target.type === "large") {
              score = 1000;
            }
            // スコアシステムにもよるが仮でここでは最大スコアを制限
            store.dispatch(actions.addPoint(Math.min(score, 99999)));
          }
        }

        // 自身のライフを 0 にする
        shot.life = 0;
      }
    );
  }
}
