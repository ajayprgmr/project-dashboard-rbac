import { createSlice } from '@reduxjs/toolkit';
import { fetchReportsSnapshot } from '../thunks';

const initialState = {
  data: null,
  status: 'idle',
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsSnapshot.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReportsSnapshot.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchReportsSnapshot.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default reportsSlice.reducer;
