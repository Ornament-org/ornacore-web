import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/services/authApi';

// ── Helpers ──────────────────────────────────────────────────

const extractError = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error?.message ||
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

// ── B2C Actions ──────────────────────────────────────────────

export const loginB2C = createAsyncThunk(
  'auth/loginB2C',
  async (credentials, { rejectWithValue }) => {
    try {
      // apiClient interceptor returns response.data (the backend body)
      // Backend shape: { success, data: { user, accessToken, refreshToken } }
      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;

      saveTokens(accessToken, refreshToken, 'b2c');
      return { user, accessToken, refreshToken, actorType: 'b2c' };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

export const registerB2C = createAsyncThunk(
  'auth/registerB2C',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

// ── B2B Actions ──────────────────────────────────────────────

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
      const response = await authApi.shopkeeperRegister(businessData);
      return response.data;
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  }
);

// ── Shared Actions ───────────────────────────────────────────

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { actorType } = getState().auth;
      const response = actorType === 'b2b'
        ? await authApi.shopkeeperMe()
        : await authApi.me();
      return response.data?.user ?? response.data;
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
    const { actorType, refreshToken } = getState().auth;
    try {
      if (actorType === 'b2b') {
        await authApi.shopkeeperLogout(refreshToken);
      } else {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Always clear local state even if server call fails
    } finally {
      clearTokens();
    }
  }
);
