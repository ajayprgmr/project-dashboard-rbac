export const selectAuthState = (state) => state.auth;

export const selectCurrentUser = (state) => state.auth.user;

export const selectAuthStatus = (state) => state.auth.status;
