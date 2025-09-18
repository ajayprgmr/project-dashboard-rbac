import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { projectApi } from '../../utils/mockApi';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const projects = await projectApi.fetchProjects();
    return projects;
  } catch (error) {
    return rejectWithValue(error.message || 'Unable to fetch projects');
  }
});

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
