import React,{ useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/spinner/spinner";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import { login } from "../../redux/userSlice";

const AuthCallBack = ()=>{
    const [isLoading, setIsloading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(()=>{
      const checkAuth = async()=>{
        try {
            setIsloading(true);
            const res = await axiosInstance.get('/auth/login/success');
            const data = res.data;
            if(!data.success){
                toast.error("Login failed, Please try again.")
                return;
            }

            dispatch(login({
                user:data.user,
                role:data.role
            }))
            navigate('/user/home');
        } catch (error) {
            console.error("Login failed", error);
            navigate("/user/login");
        }finally {
          setIsloading(false);
        }
      }

      checkAuth();
    }, [dispatch, navigate]);

    return(
        <>
         {
            isLoading && (
             <div className="spinner-loader-layout">
                <Spinner/>
             </div>
            )
         }
        </>
    )
}

export default AuthCallBack;