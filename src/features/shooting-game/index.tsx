import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { actions } from "./slice";

export function ShootingGame() {
  const dispatch = useDispatch();
  const canvas = useRef<HTMLCanvasElement>(null);

  return (
    <div>
      <canvas
        style={{
          margin: "0px auto",
          backgroundColor: "white",
          width: "640px",
          height: "480px",
        }}
        id="main_canvas"
        ref={canvas}
      ></canvas>
      <button
        style={{
          display: "block",
          margin: "auto",
        }}
        onClick={() => dispatch(actions.initialize(canvas.current!))}
      >
        start
      </button>
      <div
        style={{
          color: "#f0f0f0",
        }}
      >
        十字キー: 移動
        <br />
        Z: ショット
        <br />
        Enter: リトライ
      </div>
    </div>
  );
}
