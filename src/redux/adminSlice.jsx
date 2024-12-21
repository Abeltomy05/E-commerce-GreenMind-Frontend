import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    isAdminAuthenticated:false,
    user:null,
    role:null
  },
  reducers: {
 
    login: (state, action) => {
      const { user,role } = action.payload;

      state.isAdminAuthenticated = true;
      state.user = user;
      state.role = role;
    },
    

    logout: (state) => {

      state.isAdminAuthenticated = false;
      state.user = null;
      state.role = null;
    }
  }
});


export const { login, logout } = adminSlice.actions;
export default adminSlice.reducer;