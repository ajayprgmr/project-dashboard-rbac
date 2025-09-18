import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { userApi } from '../../utils/mockApi';

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const users = await userApi.fetchUsers();
    return users;
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to fetch users');
  }
});

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

const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

const userManagementSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.items = state.items.map((user) =>
          user.id === action.payload.id ? action.payload : user,
        );
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default userManagementSlice.reducer;
