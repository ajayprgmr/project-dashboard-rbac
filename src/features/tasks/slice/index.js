import { createSlice } from '@reduxjs/toolkit';
import { deleteProject } from '../../projects';
import { createTask, deleteTask, fetchTasks, updateTask } from '../thunks';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    view: 'board',
    projectId: 'all',
  },
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTaskFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.items = state.items.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task,
        );
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.projectId !== action.payload);
      });
  },
});

export const { setTaskFilter } = tasksSlice.actions;

export default tasksSlice.reducer;
