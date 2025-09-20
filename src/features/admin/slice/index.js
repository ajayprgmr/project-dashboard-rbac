import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, updateUserRole } from '../thunks';

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
