import React, { useState,useEffect } from "react";
import { FcGoogle,FcLock, FcInvite } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import loginImg1 from "../../../assets/images/side1.jpg";
import loginImg2 from "../../../assets/images/side2.jpg";
import loginImg3 from "../../../assets/images/side3.jpg";
import bgImage from '../../../assets/images/bg1.jpg';
import Footer from "../../../components/footer/footer";
import HeaderLogin from "../../../components/header-login/header-login";
import { useDispatch } from 'react-redux';
import {login} from "../../../redux/userSlice"
import Spinner from "../../../components/spinner/spinner";
import axioInstence from "../../../utils/axiosConfig";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading,setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const dispatch = useDispatch();
  const Navigate = useNavigate();

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

    Cookies.remove('user_access_token', { path: '/', domain: '.abeltomy.site' });
    Cookies.remove('user_refresh_token', { path: '/', domain: '.abeltomy.site' });

    console.log('Redirecting to:', `${import.meta.env.VITE_API_URL}/auth/google`);
    window.open(`${import.meta.env.VITE_API_URL}/auth/google`, "_self");
}

useEffect(() => {
  const checkLoginStatus = async () => {
    try {
      console.log("Starting login status check...");

      const accessToken = Cookies.get('user_access_token');
      const refreshToken = Cookies.get('user_refresh_token');

      console.log('Cookie check:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing'
      });

      if (!accessToken && !refreshToken) {
        console.log('No tokens found');
        return;
      }

      // Trying with access token first
      if (accessToken) {
        try {
          const response = await axioInstence.get("/auth/login/success", {
            withCredentials: true,
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            }
          });

          if (response.data.user) {
            dispatch(login({ 
              user: response.data.user, 
              role: response.data.role || 'user' 
            }));
            Navigate('/user/home');
            return;
          }
        } catch (error) {
          console.log('Access token verification failed, trying refresh token');
          
          if (refreshToken) {
            try {
              // Using your actual refresh token endpoint
              const refreshResponse = await axioInstence.get("/user/refresh-token");

              if (refreshResponse.data.status === "VERIFIED") {
                dispatch(login({ 
                  user: refreshResponse.data.user, 
                  role: refreshResponse.data.role 
                }));
                Navigate('/user/home');
                return;
              }
            } catch (refreshError) {
              console.error("Refresh token error:", refreshError);
              Cookies.remove('user_access_token', { path: '/', domain: '.abeltomy.site' });
              Cookies.remove('user_refresh_token', { path: '/', domain: '.abeltomy.site' });
              Navigate('/user/login');
            }
          }
        }
      }
    } catch (error) {
      console.error("Login check error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      Cookies.remove('user_access_token', { path: '/', domain: '.abeltomy.site' });
      Cookies.remove('user_refresh_token', { path: '/', domain: '.abeltomy.site' });
      Navigate('/user/login');
    }
  };

  checkLoginStatus();
}, [dispatch, Navigate]);


const COOKIE_OPTIONS = {
  secure: true, // Only transmitted over HTTPS
  sameSite: 'lax', // Protects against CSRF
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
    console.log('Making request to:', axioInstence.defaults.baseURL);

    const userData = { email, password };
    const response = await axioInstence.post("/user/login", userData, {
      headers: {
        "Content-Type": "application/json",  
      },
      withCredentials: true,
    });

    const { status, message, user, role} = response.data;
    if (status === "VERIFIED" && user) {

      // Cookies.set('user_access_token', accessToken, COOKIE_OPTIONS);
      // Cookies.set('user_refresh_token', refreshToken, COOKIE_OPTIONS);
      
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
    console.error("Login error details:", {
      baseURL: axioInstence.defaults.baseURL,
      endpoint: "/user/login",
      fullError: error,
      response: error.response?.data,
      status: error.response?.status
    });
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
    <div className="min-h-[90vh] w-full bg-cover bg-center p-4 md:p-6 flex items-center justify-center" 
         style={{ 
           backgroundImage: `url(${bgImage})`,
           backgroundColor: 'rgba(0, 0, 0, 0.5)',
           backgroundBlendMode: 'overlay',
           backgroundSize: 'cover',
         }}>
      {/* Main container */}
      <div className="w-full max-w-5xl bg-white rounded-lg overflow-hidden flex flex-col md:flex-row">
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

        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email input */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Password input */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="w-full bg-[#47645a] text-white py-2 rounded-md hover:bg-[#2f4640]"
              >
                Login
              </button>

              {/* Google login button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={googleAuth}
                className="w-full border border-gray-300 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <FcGoogle size={24} />
                Continue with Google
              </button>

              {/* Links */}
              {/* <div className="mt-4 text-center text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-800">
                  Forgot Password?
                </a>
              </div> */}
              
              <div className="text-center text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/user/signup" className="text-gray-900 hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );

}

export default UserLogin;