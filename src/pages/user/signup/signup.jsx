import "./signup.scss"
import React, { useState } from "react";
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImg from "../../../assets/images/login-img.png"
import Footer from "../../../components/footer/footer"
import HeaderLogin from "../../../components/header-login/header-login"
import axios from "axios";

function UserSignup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [phone, setPhone] = useState("");
  
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    const trimmedFirstname = firstname.trim();
    const trimmedLastname = lastname.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmpassword = confirmpassword.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstname) {
      newErrors.firstname = "FirstName is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedFirstname)) {
      newErrors.firstname = "FirstName can only contain letters"
    }

    if (!trimmedLastname) {
      newErrors.lastname = "LastName is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedLastname)) {
      newErrors.lastname = "LastName can only contain letters"
    }

    if (!trimmedUsername) {
      newErrors.username = "UserName is required";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedUsername)) {
      newErrors.username = "Username can only contain letters"
    }

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@gmail\.com$/.test(trimmedEmail)) {
      newErrors.email = "Email must be a valid Gmail address.";
    }

    if (!trimmedPhone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(trimmedPhone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!trimmedPassword) {
      newErrors.password = "Password should not be empty."
    } else if (password.length < 6) {
      newErrors.password = "Password should contain at least 6 characters"
    }

    if (trimmedConfirmpassword !== password) {
      newErrors.confirmpassword = "Passwords do not match"
    }

    return newErrors;
  }

  const googleAuth = () => {
    window.open("http://localhost:3000/auth/google/callback", "_self");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
 
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    try {
      const userData = {
        firstname,
        lastname,
        username,
        email,
        phone,
        password,
      };
        
      const response = await axios.post("http://localhost:3000/user/signup", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
       
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
        
      const userId = response.data.userId;
      const responseEmail = response.data.email;
      setTimeout(() => {
        navigate(`/user/verify-otp/${userId}/${responseEmail}`);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
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

  return (
    <>
    <div className="page-wrapper">
      <HeaderLogin />
      <div className="signup-container">
        <div className="left-section">
          <img
            src={loginImg}
            alt="Signup Illustration"
            className="signup-image"
          />
        </div>
        <div className="right-section">
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <i className="icon fa fa-user"></i>
              <input 
                type="text" 
                placeholder="First Name" 
                name="firstname" 
                value={firstname} 
                onChange={(e) => {
                  setFirstname(e.target.value);
                  setErrors(prev => ({ ...prev, firstname: '' }));
                }}
              />
              {errors.firstname && <div className="error-message">{errors.firstname}</div>}
            </div>
            
            <div className="form-group">
              <i className="icon fa fa-user"></i>
              <input 
                type="text" 
                placeholder="Last Name" 
                name="lastname" 
                value={lastname} 
                onChange={(e) => {
                  setLastname(e.target.value);
                  setErrors(prev => ({ ...prev, lastname: '' }));
                }}
              />
              {errors.lastname && <div className="error-message">{errors.lastname}</div>}
            </div>
            
            <div className="form-group">
              <i className="icon fa fa-user-circle"></i>
              <input 
                type="text" 
                placeholder="Username" 
                name="username" 
                value={username} 
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors(prev => ({ ...prev, username: '' }));
                }}
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="form-group">
              <i className="icon fa fa-envelope"></i>
              <input 
                type="email" 
                placeholder="Email" 
                name="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <i className="icon fa fa-lock"></i>
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <i className="icon fa fa-lock"></i>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                name="confirmpassword" 
                value={confirmpassword} 
                onChange={(e) => {
                  setConfirmpassword(e.target.value);
                  setErrors(prev => ({ ...prev, confirmpassword: '' }));
                }}
              />
              {errors.confirmpassword && <div className="error-message">{errors.confirmpassword}</div>}
            </div>
            
            <div className="form-group">
              <i className="icon fa fa-phone"></i>
              <input 
                type="text" 
                placeholder="Phone Number" 
                name="phone" 
                value={phone} 
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors(prev => ({ ...prev, phone: '' }));
                }}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            
            <button type="submit" className="signup-btn">
              Sign Up
            </button>
          </form>
        
          <p className="login-link">
            Already have an account? <a><Link to="/user/login">Login now</Link></a>
          </p>
          <div className="or-divider-signup">OR</div>
         
          <button className="google-btn-signup" onClick={googleAuth}>
            <FcGoogle  size={24} className="google-icon" /> Continue with Google
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
            fontSize: '18px'
          }}
        />
      </div>
      <Footer/>
      </div>
    </>
  )
}

export default UserSignup