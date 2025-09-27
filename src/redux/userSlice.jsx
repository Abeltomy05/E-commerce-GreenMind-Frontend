import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isUserAuthenticated:false,
    user:null,
    role:null,
    loading: true, 
  },
  reducers: {
 
    login: (state, action) => {
      const { user,role } = action.payload;
      state.isUserAuthenticated = true;
      state.user = user;
      state.role = role;
      state.loading = false;
    },
    

    logout: (state) => {
      state.isUserAuthenticated = false;
      state.user = null;
      state.role = null;
      state.loading = false;
    },

    finishLoading: (state) => {
      state.loading = false; 
    }
  }
});


export const { login, logout, finishLoading } = userSlice.actions;
export default userSlice.reducer;