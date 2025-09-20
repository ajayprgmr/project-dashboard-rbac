import { createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from '../apis';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const users = await userApi.fetchUsers();
      return users;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch users');
    }
  },
);

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const user = await userApi.updateRole({ userId, role });
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update user role');
    }
  },
);
