import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../utils/mockApi';
import { updateUserRole } from '../admin/userManagementSlice';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const user = await authApi.login(credentials);
    return user;
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to login');
  }
});

export const impersonateUser = createAsyncThunk('auth/impersonate', async (userId, { rejectWithValue }) => {
  try {
    const user = await authApi.impersonate(userId);
    return user;
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to impersonate user');
  }
});

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
