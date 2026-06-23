import type { AuthenticatedUser } from '@kuberone/shared-types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


export interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  requiresProfileCompletion: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  requiresProfileCompletion: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthenticatedUser; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.requiresProfileCompletion = false;
    },
    setRequiresProfileCompletion: (state, action: PayloadAction<boolean>) => {
      state.requiresProfileCompletion = action.payload;
    },
    patchUser: (state, action: PayloadAction<Partial<AuthenticatedUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, clearCredentials, setRequiresProfileCompletion, patchUser } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
