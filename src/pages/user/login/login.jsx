import React, { useState,useEffect } from "react";
import { FcGoogle,FcLock, FcInvite } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import loginImg from "../../../assets/images/login-img.png";
import Footer from "../../../components/footer/footer";
import HeaderLogin from "../../../components/header-login/header-login";
import axios from "axios";
import { useDispatch } from 'react-redux';
import {login} from "../../../redux/userSlice"
import "./login.scss"
import Spinner from "../../../components/spinner/spinner";
import axioInstence from "../../../utils/axiosConfig";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading,setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const Navigate = useNavigate();



  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@gmail\.com$/.test(trimmedEmail)) {
      newErrors.email = "Email must be a valid Gmail address.";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password should not be empty.";
    } else if (password.length < 6) {
      newErrors.password = "Password should contain at least 6 digits";
    }

    return newErrors;
  }

  const googleAuth = () => {

    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    window.open("http://localhost:3000/auth/google", "_self");
}

useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      console.log("Checking cookies...");
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');
      console.log('Tokens found:', { accessToken, refreshToken });

      if (!accessToken) {
        console.log('No access token found');
        return; 
      }
      const response = await axioInstence.get("/auth/login/success", {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      console.log('Login success response:', response.data);
      if (response.data.user) {
        dispatch(login({ 
          user: response.data.user, 
          role: response.data.role || 'user' 
        }));
        Navigate('/user/home');
      }
    } catch (error) {
      console.error("Login check error:", error);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
  };

  checkLoginStatus();
}, [dispatch,Navigate]);


const COOKIE_OPTIONS = {
  secure: true, // Only transmitted over HTTPS
  sameSite: 'strict', // Protects against CSRF
  path: '/' // Available across all pages
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitted(true);
  setIsLoading(true)
 
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    setIsLoading(false);
    return;
  }
  
  try {
    const userData = { email, password };
    const response = await axioInstence.post("/user/login", userData, {
      headers: {
        "Content-Type": "application/json",  
      },
      withCredentials: true,
    });

    const { status, message, user, role,accessToken,refreshToken } = response.data;
    if (status === "VERIFIED" && user) {

      Cookies.set('accessToken', accessToken, COOKIE_OPTIONS);
      Cookies.set('refreshToken', refreshToken, COOKIE_OPTIONS);
      
      setTimeout(() => {
        dispatch(login({ 
          user: {
            ...user,
            id: user.id 
          }, 
          role: role 
        }));
        Navigate('/user/home');
      }, 3000);
    }
  } catch(error) {
    console.log("Error in login:", error); 
    console.log("Error response:", error.response); 
    console.log("Error message:", error.response?.data);

    setIsLoading(false)

    const errorMessage = error.response?.data?.message || "Something went wrong";

    toast.error(errorMessage);
  setEmail('');
  setPassword('');

  }
}

  useEffect(() => {
    if (isSubmitted) {
      const validationErrors = validateForm();
      setErrors(validationErrors);
    }
  }, [email, password, isSubmitted]);

  if(isLoading){
    return(
      <>
       <div className="spinner-loader-layout">
        <Spinner/>
       </div>
      </>
    )
  }

  return (
    <>
      <HeaderLogin/>
      <div className="login-container">
        <div className="login-left-section">
          <img
            src={loginImg} 
            alt="Signup Illustration"
            className="login-image"
          />
        </div>
        <div className="login-right-section">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group-login">
            <FcInvite className="icon" />
              <input 
                type="email" 
                placeholder="Email" 
                name="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            <div className={`form-group-login ${errors.password ? 'error' : ''}`}>
            <FcLock className="icon" />
              <input 
                 type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                name="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
               <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  border: 'none', 
                  background: 'none',
                  cursor: 'pointer',
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                {showPassword ? 
                  <EyeOff size={20} className="text-gray-500" /> : 
                  <Eye size={20} className="text-gray-500" />
                }
              </button>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>
        
          <p className="signup-link">
            New user? <Link to="/user/signup">Signup</Link>
          </p>
          <div className="or-divider-login">OR</div>
          
          <button className="google-btn-login" onClick={googleAuth}>
          <FcGoogle  size={24} className="google-icon" />Signin with Google
          </button>
        </div>
       
      </div>
      <Footer/>
    </>
  );
}

export default UserLogin;