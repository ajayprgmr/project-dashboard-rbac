import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth';
import usersReducer from '../features/admin';
import projectsReducer from '../features/projects';
import tasksReducer from '../features/tasks';
import uiReducer from '../features/ui';
import reportsReducer from '../features/reports';
import { loadState, saveState } from '../utils/storage';
import { hydrateMockStore } from '../utils/mockStore';

const preloadedState = loadState();

if (preloadedState) {
  hydrateMockStore({
    usersSnapshot: preloadedState.users?.items,
    projectsSnapshot: preloadedState.projects?.items,
    tasksSnapshot: preloadedState.tasks?.items,
  });
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    ui: uiReducer,
    reports: reportsReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

store.subscribe(() => {
  const state = store.getState();
  const persistable = {
    auth: state.auth,
    users: state.users,
    projects: state.projects,
    tasks: state.tasks,
    ui: {
      theme: state.ui.theme,
      sidebarCollapsed: state.ui.sidebarCollapsed,
      globalSearch: state.ui.globalSearch,
      notifications: state.ui.notifications,
    },
  };
  saveState(persistable);
});

export default store;
