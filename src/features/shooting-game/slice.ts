import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GameState {}

const initialState: GameState = {};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<HTMLCanvasElement>) => {},
    start: () => {},
  },
});

export const actions = gameSlice.actions;
export default gameSlice.reducer;
