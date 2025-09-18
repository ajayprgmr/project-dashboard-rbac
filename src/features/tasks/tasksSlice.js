import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { taskApi } from '../../utils/mockApi';
import { deleteProject } from '../projects/projectsSlice';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const tasks = await taskApi.fetchTasks();
    return tasks;
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to fetch tasks');
  }
});

export const createTask = createAsyncThunk(
  'tasks/create',
  async (payload, { rejectWithValue }) => {
    try {
      const task = await taskApi.createTask(payload);
      return task;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create task');
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (payload, { rejectWithValue }) => {
    try {
      const task = await taskApi.updateTask(payload);
      return task;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update task');
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to delete task');
    }
  },
);

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
