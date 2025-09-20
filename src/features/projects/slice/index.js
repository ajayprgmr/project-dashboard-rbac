import { createSlice } from '@reduxjs/toolkit';
import {
  assignProjectMembers,
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
} from '../thunks';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  filters: {
    status: 'all',
    dueDate: 'all',
    view: 'table',
  },
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjectFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.items = state.items.map((project) =>
          project.id === action.payload.id ? action.payload : project,
        );
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((project) => project.id !== action.payload);
      })
      .addCase(assignProjectMembers.fulfilled, (state, action) => {
        state.items = state.items.map((project) =>
          project.id === action.payload.id ? action.payload : project,
        );
      });
  },
});

export const { setProjectFilter } = projectsSlice.actions;

export default projectsSlice.reducer;
