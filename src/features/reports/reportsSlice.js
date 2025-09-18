import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import { reportsApi } from '../../utils/mockApi';

export const fetchReportsSnapshot = createAsyncThunk(
  'reports/fetchSnapshot',
  async (_, { rejectWithValue }) => {
    try {
      const snapshot = await reportsApi.fetchSnapshot();
      return snapshot;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to load reports');
    }
  },
);

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

export const selectReportsState = (state) => state.reports;

export const selectProjectStatusBreakdown = createSelector(
  selectReportsState,
  (reports) => {
    if (!reports.data) return [];
    const counts = reports.data.projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
  },
);

export const selectTaskCompletionTrend = createSelector(selectReportsState, (reports) => {
  if (!reports.data) return [];
  const byMonth = reports.data.tasks.reduce((acc, task) => {
    const key = task.status === 'done' ? 'done' : 'open';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return [
    { name: 'Completed', value: byMonth.done || 0 },
    { name: 'Open', value: byMonth.open || 0 },
  ];
});
