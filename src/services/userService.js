import api from "../api/api";
import { login,logout,finishLoading } from "../redux/userSlice";

export const UserService = {
   checkAuth: async(dispatch)=>{
     try {
        const res = await api.get('/auth/login/success');
        if (res.data.success) {
        dispatch(login({
          user: res.data.user,
          role: res.data.role || "user"
        }));
        }else{
            dispatch(logout());
        }
     } catch (error) {
         console.error("Auth check failed:", error);
          dispatch(logout());
     }finally {
      dispatch(finishLoading()); 
    }
   }
}
