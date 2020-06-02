import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GameState {
  point: number;
}

const initialState: GameState = {
  point: 0,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<HTMLCanvasElement>) => {},
    addPoint: (state, action: PayloadAction<number>) => {
      state.point += action.payload;
    },
  },
});

export const actions = gameSlice.actions;
export default gameSlice.reducer;
