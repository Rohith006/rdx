import { createSlice } from "@reduxjs/toolkit";

export const loadSlice = createSlice({
  name: "auth",
  initialState: {
    loading: null,
  },
  reducers: {
    pending: (state, action) => {
      state.loading = true;
    },
    fulfilled: (state, action) => {
      state.loading = false;
    },
  },
});

export const { pending, fulfilled } = loadSlice.actions;
export default loadSlice.reducer;
