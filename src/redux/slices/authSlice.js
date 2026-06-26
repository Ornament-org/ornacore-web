import { createSlice } from '@reduxjs/toolkit';
import {
  loginB2C,
  loginB2B,
  registerB2C,
  registerB2B,
  fetchCurrentUser,
  changePassword,
  logoutUser,
} from '../actions/authActions';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  actorType: null, // 'b2c' | 'b2b'
  loading: false,
  error: null,
};

// ── Reusable case handlers ────────────────────────────────────

const handlePending = (state) => {
  state.loading = true;
  state.error = null;
};

const handleRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload;
};

const handleLoginFulfilled = (state, action) => {
  state.loading = false;
  state.user = action.payload.user;
  state.accessToken = action.payload.accessToken;
  state.refreshToken = action.payload.refreshToken;
  state.isAuthenticated = true;
  state.actorType = action.payload.actorType;
  state.error = null;
};

// ── Slice ─────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      Object.assign(state, initialState);
    },
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── B2C Login ──
      .addCase(loginB2C.pending, handlePending)
      .addCase(loginB2C.fulfilled, handleLoginFulfilled)
      .addCase(loginB2C.rejected, handleRejected)

      // ── B2B Login ──
      .addCase(loginB2B.pending, handlePending)
      .addCase(loginB2B.fulfilled, handleLoginFulfilled)
      .addCase(loginB2B.rejected, handleRejected)

      // ── Register ──
      .addCase(registerB2C.pending, handlePending)
      .addCase(registerB2C.fulfilled, (state) => { state.loading = false; })
      .addCase(registerB2C.rejected, handleRejected)

      .addCase(registerB2B.pending, handlePending)
      .addCase(registerB2B.fulfilled, (state) => { state.loading = false; })
      .addCase(registerB2B.rejected, handleRejected)

      // ── Fetch current user ──
      .addCase(fetchCurrentUser.pending, handlePending)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, handleRejected)

      // ── Change password ──
      .addCase(changePassword.pending, handlePending)
      .addCase(changePassword.fulfilled, (state) => { state.loading = false; })
      .addCase(changePassword.rejected, handleRejected)

      // ── Logout ──
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState);
      });
  },
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
