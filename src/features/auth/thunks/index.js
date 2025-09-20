import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../apis';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await authApi.login(credentials);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to login');
    }
  },
);

export const impersonateUser = createAsyncThunk(
  'auth/impersonate',
  async (userId, { rejectWithValue }) => {
    try {
      const user = await authApi.impersonate(userId);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to impersonate user');
    }
  },
);
