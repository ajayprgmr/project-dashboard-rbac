import { createAsyncThunk } from '@reduxjs/toolkit';
import { projectApi } from '../apis';

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await projectApi.fetchProjects();
      return projects;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to fetch projects');
    }
  },
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (payload, { rejectWithValue }) => {
    try {
      const project = await projectApi.createProject(payload);
      return project;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to create project');
    }
  },
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async (payload, { rejectWithValue }) => {
    try {
      const project = await projectApi.updateProject(payload);
      return project;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to update project');
    }
  },
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (projectId, { rejectWithValue }) => {
    try {
      await projectApi.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to delete project');
    }
  },
);

export const assignProjectMembers = createAsyncThunk(
  'projects/assignMembers',
  async ({ projectId, memberIds }, { rejectWithValue }) => {
    try {
      const project = await projectApi.assignMembers({ projectId, memberIds });
      return project;
    } catch (error) {
      return rejectWithValue(error.message || 'Unable to assign members');
    }
  },
);
