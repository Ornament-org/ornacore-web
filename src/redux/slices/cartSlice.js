import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    count: 0,
    totalWeight: 0,
  },
  reducers: {
    addItem(state, action) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
      cartSlice.caseReducers.recalculate(state);
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      cartSlice.caseReducers.recalculate(state);
    },
    updateQuantity(state, action) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) item.quantity = action.payload.quantity;
      if (item && item.quantity <= 0) state.items = state.items.filter((i) => i.id !== action.payload.id);
      cartSlice.caseReducers.recalculate(state);
    },
    clearCart(state) {
      state.items = [];
      state.total = 0;
      state.count = 0;
      state.totalWeight = 0;
    },
    recalculate(state) {
      state.count = state.items.reduce((sum, i) => sum + i.quantity, 0);
      state.total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      state.totalWeight = state.items.reduce((sum, i) => sum + (Number(i.weight) || 0) * i.quantity, 0);
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
