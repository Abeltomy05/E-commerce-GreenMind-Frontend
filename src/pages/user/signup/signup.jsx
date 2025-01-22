import "./signup.scss"
import React, { useState,useEffect } from "react";
import { FcGoogle,FcLock, FcInvite,FcBusinessman, FcManager, FcPhone } from 'react-icons/fc';
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImg1 from "../../../assets/images/side1.jpg";
import loginImg2 from "../../../assets/images/side2.jpg";
import loginImg3 from "../../../assets/images/side3.jpg";
import Footer from "../../../components/footer/footer"
import HeaderLogin from "../../../components/header-login/header-login"
import axios from "axios";
import axiosInstence from "../../../utils/axiosConfig"

function UserSignup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState({
    normal: false,
    confirm: false
  });
  
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [loginImg2, loginImg3, loginImg1];
   useEffect(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); 
  
      return () => clearInterval(interval);
    }, []);

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
    } else if (!/^[A-Za-z0-9\s]+$/.test(trimmedUsername)) {
      newErrors.username = "Username can only contain letters and numbers";
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
        
      const response = await axiosInstence.post("/user/signup", userData, {
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
    <HeaderLogin/>
    <div className="min-h-[90vh] w-full bg-cover bg-center p-2 flex items-center justify-center" 
         style={{ 
           backgroundImage: `url('/src/assets/images/bg1.jpg')`,
           backgroundColor: 'rgba(0, 0, 0, 0.5)',
           backgroundBlendMode: 'overlay',
           backgroundSize: 'cover',
         }}>
      {/* Main container */}
      <div className="w-full max-w-6xl bg-white rounded-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative">
          {images.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-all ease-in-out duration-[1500ms]"
              style={{
                opacity: currentImageIndex === index ? 1 : 0,
              }}
            >
              <img
                src={img}
                alt={`Slide ${index + 1}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
  
        {/* Right side - Signup form */}
        <div className="w-full md:w-1/2 p-4">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
            
            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Form Grid for First Name and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                {/* First Name input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">First Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstname"
                      value={firstname}
                      onChange={(e) => {
                        setFirstname(e.target.value);
                        setErrors(prev => ({ ...prev, firstname: '' }));
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                    {errors.firstname && (
                      <p className="mt-0.5 text-xs text-red-600">{errors.firstname}</p>
                    )}
                  </div>
                </div>
  
                {/* Last Name input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastname"
                      value={lastname}
                      onChange={(e) => {
                        setLastname(e.target.value);
                        setErrors(prev => ({ ...prev, lastname: '' }));
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                    {errors.lastname && (
                      <p className="mt-0.5 text-xs text-red-600">{errors.lastname}</p>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Username input */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrors(prev => ({ ...prev, username: '' }));
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                  {errors.username && (
                    <p className="mt-0.5 text-xs text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>
  
              {/* Email input */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                  {errors.email && (
                    <p className="mt-0.5 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
  
              {/* Form Grid for Password fields */}
              <div className="grid grid-cols-2 gap-3">
                {/* Password input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.normal ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({
                        ...prev,
                        normal: !prev.normal
                      }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword.normal ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {errors.password && (
                      <p className="mt-0.5 text-xs text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>
  
                {/* Confirm Password input */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmpassword"
                      value={confirmpassword}
                      onChange={(e) => {
                        setConfirmpassword(e.target.value);
                        setErrors(prev => ({ ...prev, confirmpassword: '' }));
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {errors.confirmpassword && (
                      <p className="mt-0.5 text-xs text-red-600">{errors.confirmpassword}</p>
                    )}
                  </div>
                </div>
              </div>
  
              {/* Phone input */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                  {errors.phone && (
                    <p className="mt-0.5 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
  
              {/* Signup button */}
              <button
                type="submit"
                className="w-full bg-[#47645a] text-white py-1.5 rounded-md hover:bg-[#2f4640] mt-3"
              >
                Sign Up
              </button>
  
              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
  
              {/* Google signup button */}
              <button
                type="button"
                onClick={googleAuth}
                className="w-full border border-gray-300 py-1.5 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <FcGoogle size={20} />
                Continue with Google
              </button>
  
              {/* Login link */}
              <div className="text-center text-sm mt-2">
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/user/login" className="text-gray-900 hover:underline">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
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
    </>
  );
}

export default UserSignup