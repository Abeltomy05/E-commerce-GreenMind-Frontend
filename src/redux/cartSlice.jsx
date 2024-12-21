import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
      selectedItems: [],
      total: 0,
      cartCount: 0
    },
    reducers: {
      setSelectedItems: (state, action) => {
        state.selectedItems = action.payload.selectedItems;
        state.total = action.payload.total;
      },
      clearSelectedItems: (state) => {
        state.selectedItems = [];
        state.total = 0;
      },
      updateCartCount: (state,action) => {
        state.cartCount = action.payload;
      }
    }
  });
  

  export const { setSelectedItems, clearSelectedItems, updateCartCount } = cartSlice.actions;
  export default cartSlice.reducer;