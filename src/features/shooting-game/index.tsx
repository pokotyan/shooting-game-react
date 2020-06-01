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
      <div onClick={() => dispatch(actions.initialize(canvas.current!))}>
        start
      </div>
    </div>
  );
}
