import type { AuthenticatedUser } from '@kuberone/shared-types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';


export interface AuthState {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  requiresPartnerKyc: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  requiresPartnerKyc: false,
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
      state.requiresPartnerKyc = false;
    },
    setRequiresPartnerKyc: (state, action: PayloadAction<boolean>) => {
      state.requiresPartnerKyc = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setRequiresPartnerKyc } = authSlice.actions;
export const authReducer = authSlice.reducer;
