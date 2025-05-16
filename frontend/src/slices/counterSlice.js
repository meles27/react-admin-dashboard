import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  value: 50,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      if (state.value + 5 <= 100) {
        state.value += 5;
      } else {
        state.value = 100;
      }
    },
    decrement: (state) => {
      if (state.value - 5 >= 0) {
        state.value -= 5;
      } else {
        state.value = 0;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const counterActions = counterSlice.actions;
