import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/services/authApi';

// ── Helpers ──────────────────────────────────────────────────

// apiClient's response interceptor already unwraps failed requests down to
// `error.response.data` before rejecting (backend shape: `{ success, error:
// { code, message } }`) — so by the time it gets here there's no `.response`
// wrapper left to dig through. Falling back to the raw axios error shape too,
// defensively, for the rare case a rejection never passed through that
// interceptor (e.g. a network error with no response at all).
const extractError = (err) =>
  err?.error?.message ||
  err?.response?.data?.error?.message ||
  err?.response?.data?.message ||
  err?.message ||
  'Something went wrong';

const saveTokens = (accessToken, refreshToken, actorType) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    if (actorType) localStorage.setItem('actorType', actorType);
  }
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('actorType');
  }
};

// ── B2B Actions ──────────────────────────────────────────────
// This storefront is B2B-only — every session belongs to a shopkeeper.

export const loginB2B = createAsyncThunk(
  'auth/loginB2B',
  async (credentials, { rejectWithValue }) => {
    try {
      // POST /shopkeeper/auth/login  body: { identifier, password }
      const response = await authApi.shopkeeperLogin(credentials);
      const { user, accessToken, refreshToken } = response.data;

      saveTokens(accessToken, refreshToken, 'b2b');
      return { user, accessToken, refreshToken, actorType: 'b2b' };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const registerB2B = createAsyncThunk(
  'auth/registerB2B',
  async (businessData, { rejectWithValue }) => {
    try {
      // POST /shopkeeper/auth/register
      // Required: ownerName, shopName, password + (email OR mobile)
      // The backend already returns a full session on registration (the new
      // shop is immediately authenticated, just not yet APPROVED) — save it
      // the same way login does, so there's no separate login step before
      // landing on the approval screen.
      const response = await authApi.shopkeeperRegister(businessData);
      const { user, accessToken, refreshToken } = response.data;

      saveTokens(accessToken, refreshToken, 'b2b');
      return { user, accessToken, refreshToken, actorType: 'b2b' };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

// ── Shared Actions ───────────────────────────────────────────

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.shopkeeperMe();
      return { user: response.data?.user ?? response.data, actorType: 'b2b' };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(data);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState }) => {
    // A session rehydrated via fetchCurrentUser() (e.g. after a page
    // refresh) never populates state.auth.refreshToken — only login/register
    // do — so fall back to localStorage, the same source apiClient's own
    // refresh-retry logic already trusts for this exact reason.
    const refreshToken = getState().auth.refreshToken
      || (typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null);
    try {
      await authApi.shopkeeperLogout(refreshToken);
    } catch {
      // Always clear local state even if server call fails
    } finally {
      clearTokens();
    }
  }
);
