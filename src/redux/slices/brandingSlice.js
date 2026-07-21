import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { brandingApi } from '@/services/brandingApi';

// The single source of truth for site name/logo everywhere on the storefront (header,
// browser tab) — set once in the toolbox (Settings) and fetched here unauthenticated,
// since visitors browse before any shopkeeper login exists. Falls back to a generic
// name/mark until the platform owner sets their own in the toolbox.
const DEFAULT_DISPLAY_NAME = 'OrnaCore';

const initialState = {
  displayName: DEFAULT_DISPLAY_NAME,
  logo: null,
  favicon: null,
  status: 'idle', // 'idle' -> 'loading' -> 'loaded' | 'failed'
};

export const fetchBranding = createAsyncThunk('branding/fetch', async () => {
  const response = await brandingApi.getBranding();
  return response.data;
});

const brandingSlice = createSlice({
  name: 'branding',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranding.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBranding.fulfilled, (state, action) => {
        state.status = 'loaded';
        state.displayName = action.payload.displayName?.trim() || DEFAULT_DISPLAY_NAME;
        state.logo = action.payload.logo || null;
        state.favicon = action.payload.favicon || null;
      })
      .addCase(fetchBranding.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default brandingSlice.reducer;
