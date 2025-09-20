import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportsApi } from '../apis';

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
