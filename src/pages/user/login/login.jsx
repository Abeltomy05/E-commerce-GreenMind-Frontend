import React, { useState,useEffect } from "react";
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImg from "../../../assets/images/login-img.png";
import Footer from "../../../components/footer/footer";
import HeaderLogin from "../../../components/header-login/header-login";
import axios from "axios";
import { useDispatch } from 'react-redux';
import {login} from "../../../redux/userSlice"
import "./login.scss"
import Spinner from "../../../components/spinner/spinner";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading,setIsLoading] = useState(false);
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
    window.open("http://localhost:3000/auth/google", "_self");
}

useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/login/success", {
        withCredentials: true
      });

      if (response.data.user) {
        dispatch(login({ 
          user: response.data.user, 
          role: response.data.role || 'user' 
        }));
        Navigate('/user/home');
      }
    } catch (error) {
      console.error("Login check error:", error);
    }
  };

  checkLoginStatus();
}, [dispatch,Navigate]);



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
      const response = await axios.post("http://localhost:3000/user/login", userData, {
        headers: {
          "Content-Type": "application/json",  
        },
      });

      
     toast.success(response.data.message, {
      position: "top-right",
      autoClose: 1000,
      theme: "colored"
    });
   
      const {user,role} = response.data
      if(user){
      setTimeout(() => {
        dispatch(login({user,role}));
        Navigate('/user/home');
      }, 3000);
      }else{
        console.error("Error dispatch login");
        setIsLoading(false)
      }
    } catch(error) {
      setIsLoading(false)
      toast.error(error.response?.data?.message || "Something went wrong", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      console.error("Error config:", error.config);
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      const newErrors = { ...errors };
      if (email.trim()) {
        delete newErrors.email;
      }
      if (password.trim()) {
        delete newErrors.password;
      }
      setErrors(newErrors);
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
              <i className="icon fa fa-envelope"></i>
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
              <i className="icon fa fa-lock"></i>
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
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
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ 
            fontFamily: "serif",
            fontSize: '18px',
          }}
        />
      </div>
      <Footer/>
    </>
  );
}

export default UserLogin;