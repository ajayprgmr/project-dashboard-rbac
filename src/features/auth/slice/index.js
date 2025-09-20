import { createSlice } from '@reduxjs/toolkit';
import { updateUserRole } from '../../admin';
import { impersonateUser, loginUser } from '../thunks';

const initialState = {
  user: null,
  originalUser: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.originalUser = null;
      state.status = 'idle';
      state.error = null;
    },
    restoreSession(state, action) {
      state.user = action.payload;
    },
    stopImpersonation(state) {
      if (state.originalUser) {
        state.user = state.originalUser;
        state.originalUser = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.originalUser = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(impersonateUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(impersonateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (!state.originalUser && state.user) {
          state.originalUser = state.user;
        }
        state.user = action.payload;
      })
      .addCase(impersonateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        if (state.user?.id === action.payload.id) {
          state.user = { ...state.user, role: action.payload.role };
        }
        if (state.originalUser?.id === action.payload.id) {
          state.originalUser = { ...state.originalUser, role: action.payload.role };
        }
      });
  },
});

export const { logout, restoreSession, stopImpersonation } = authSlice.actions;

export default authSlice.reducer;
