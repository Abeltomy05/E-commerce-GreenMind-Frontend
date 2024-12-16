import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated:false,
    user:null,
    role:null
  },
  reducers: {
 
    login: (state, action) => {
      const { user, role } = action.payload;

      state.isAuthenticated = true;
      state.user = user;
      state.role = role
    },
    

    logout: (state) => {

      state.isAuthenticated = false;
      state.user = null;
      state.role = null
    }
  }
});


export const { login, logout } = authSlice.actions;

export default authSlice.reducer;