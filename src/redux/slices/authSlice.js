import { createSlice } from '@reduxjs/toolkit';
import {
  loginB2B,
  loginB2BWithGoogle,
  loginB2BWithOtp,
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
  actorType: null, // always 'b2b' once authenticated — this storefront is B2B-only
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
      // ── B2B Login ──
      .addCase(loginB2B.pending, handlePending)
      .addCase(loginB2B.fulfilled, handleLoginFulfilled)
      .addCase(loginB2B.rejected, handleRejected)

      .addCase(loginB2BWithGoogle.pending, handlePending)
      .addCase(loginB2BWithGoogle.fulfilled, handleLoginFulfilled)
      .addCase(loginB2BWithGoogle.rejected, handleRejected)

      .addCase(loginB2BWithOtp.pending, handlePending)
      .addCase(loginB2BWithOtp.fulfilled, handleLoginFulfilled)
      .addCase(loginB2BWithOtp.rejected, handleRejected)

      // ── Register ──
      // registerB2B now carries a real session (same payload shape as
      // loginB2B) since the backend authenticates a shop immediately on
      // registration — it just isn't APPROVED yet.
      .addCase(registerB2B.pending, handlePending)
      .addCase(registerB2B.fulfilled, handleLoginFulfilled)
      .addCase(registerB2B.rejected, handleRejected)

      // ── Fetch current user ──
      .addCase(fetchCurrentUser.pending, handlePending)
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.actorType = action.payload.actorType;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // A stale/invalid token means there's no real session — clear the
        // stuck "loading" gate so route guards can settle on "logged out"
        // instead of hanging forever waiting for auth to resolve.
        state.isAuthenticated = false;
      })

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
