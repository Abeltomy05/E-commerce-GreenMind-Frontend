import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
      selectedItems: [],
      total: 0
    },
    reducers: {
      setSelectedItems: (state, action) => {
        state.selectedItems = action.payload.selectedItems;
        state.total = action.payload.total;
      },
      clearSelectedItems: (state) => {
        state.selectedItems = [];
        state.total = 0;
      }
    }
  });
  

export const { setSelectedItems, clearSelectedItems } = cartSlice.actions;
export default cartSlice.reducer;