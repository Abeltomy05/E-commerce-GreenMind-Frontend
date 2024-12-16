import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import {login} from "../../../redux/authSlice"
import 'react-toastify/dist/ReactToastify.css';
import { 
  LockKeyhole, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  UserCog 
} from 'lucide-react';
import axios from "axios";
import "./login.scss";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@(gmail\.com|admin\.com)$/.test(trimmedEmail)) {
      newErrors.email = "Use an authorized admin email.";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password is required.";
    } 

    return newErrors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const userData = { email, password };
      const response = await axios.post("http://localhost:3000/admin/login", userData, {
        headers: {
          "Content-Type": "application/json",  
        },
      });
      const {user,role} = response.data
      
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
  
      if(user){
        dispatch(login({user,role}));
        setTimeout(() => {
          Navigate('/admin/dashboard');
        }, 2000);
        }else{
          toast.error("SignUp failed!.")
          console.error("Error dispatch login");
        }
    } catch(error) {
      toast.error(error.response?.data?.message || "Login failed", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
    
      console.error("Login Error:", error);
    }
  }

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-card-header">
          <div className="admin-icon">
            <UserCog size={64} strokeWidth={1.5} />
          </div>
          <h2>
            <ShieldCheck size={32} /> Admin Login
          </h2>
        </div>
        
        <form className="login-card-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <Mail />
            </div>
            <input 
              type="email" 
              placeholder="Admin Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>
          
          <div className="form-group">
            <div className="input-icon">
              <LockKeyhole />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              <KeyRound className={`${showPassword ? 'active' : ''}`} />
            </button>
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
          >
            <ShieldCheck /> Log In
          </button>
        </form>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </div>
  );
}

export default AdminLogin;