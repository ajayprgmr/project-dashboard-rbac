import { createAsyncThunk } from '@reduxjs/toolkit';
import { taskApi } from '../apis';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await taskApi.fetchTasks();
      return tasks;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch tasks');
    }
  },
);

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
