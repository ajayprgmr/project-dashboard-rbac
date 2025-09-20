import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  theme: 'dark',
  sidebarCollapsed: true,
  globalSearch: '',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setGlobalSearch(state, action) {
      state.globalSearch = action.payload;
    },
    pushNotification: {
      reducer(state, action) {
        state.notifications = [action.payload, ...state.notifications].slice(0, 20);
      },
      prepare({ title, message, variant = 'info' }) {
        return {
          payload: {
            id: nanoid(),
            title,
            message,
            variant,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    dismissNotification(state, action) {
      state.notifications = state.notifications.filter((item) => item.id !== action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setGlobalSearch,
  pushNotification,
  dismissNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
