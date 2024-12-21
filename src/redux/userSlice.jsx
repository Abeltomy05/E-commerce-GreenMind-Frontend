import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isUserAuthenticated:false,
    user:null,
    role:null
  },
  reducers: {
 
    login: (state, action) => {
      const { user,role } = action.payload;

      state.isUserAuthenticated = true;
      state.user = user;
      state.role = role;
    },
    

    logout: (state) => {

      state.isUserAuthenticated = false;
      state.user = null;
      state.role = null;
    }
  }
});


export const { login, logout } = userSlice.actions;
export default userSlice.reducer;