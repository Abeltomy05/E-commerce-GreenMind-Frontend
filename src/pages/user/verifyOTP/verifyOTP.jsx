import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import loginImg from "../../../assets/images/login-img.png"
import { useParams } from 'react-router-dom';
import {Link, useNavigate} from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./verifyOTP.scss";
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import { useDispatch } from 'react-redux';
import {login} from '../../../redux/userSlice'
import Spinner from '../../../components/spinner/spinner';
import axioInstence from '../../../utils/axiosConfig';

export default function VerifyOTP() {
   const {userId, email} = useParams();

   const dispatch = useDispatch();
    const Navigate = useNavigate();

    const inputRefs = useRef([]);
    const [otp, setOtp] = useState(new Array(4).fill(""));
    const [timer, setTimer] = useState(30);
    const [resendVisible, setResendVisible] = useState(false);
    // const [isLoading,setIsLoading] = useState(false);

    if (!userId) {
        console.error("UserId not passed to VerifyOTP page");
        return null;
    }

    // if(isLoading){
    //     return(
    //       <>
    //        <div className="spinner-loader-layout">
    //         <Spinner/>
    //        </div>
    //       </>
    //     )
    //   }



    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setResendVisible(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    function handleChange(e, index) {
        if (isNaN(e.target.value)) return;

        const newOtp = otp.map((data, indx) =>
            indx === index ? e.target.value : data
        );
        setOtp(newOtp);

        if (e.target.value && index < otp.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    }

    function handleKeyDown(e, index) {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
                inputRefs.current[index - 1].focus();
            } else if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    }


    async function handleVerify() {
        const otpValue = otp.join("");
        
        if (otpValue.length !== 4) {
          alert("Please enter a valid 4-digit OTP");
          return;
        }
        // setIsLoading(true);
      
        try {
          const response = await axioInstence.post(
            "/user/verifyOTP", 
            {
              userId,
              otp: otpValue,
            },
            {
              withCredentials: true 
            }
          );

    
          const { status, message, user, role,accessToken,refreshToken } = response.data;
         if (status === "VERIFIED" && user) {
         
               localStorage.setItem('accessToken', accessToken);
                 localStorage.setItem('refreshToken', refreshToken);
         
               toast.success("OTP verified successfully", {
                 position: "top-right",
                 autoClose: 1000,
                 theme: "colored"
               });
         
               
               
               setTimeout(() => {
                 dispatch(login({ 
                    user: {
                        ...user,
                        id: user.id 
                      }, 
                      role: role
                 }));
                 Navigate('/user/home');
               }, 1000);
             } else {
            toast.error(message || "OTP verification failed");
            // setIsLoading(false)
          }
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

  async  function handleResend() {
    try {
        setOtp(new Array(4).fill(""));
        setTimer(30);
        setResendVisible(false);

        const response = await axioInstence.post("/user/resendOTP", {
            userId, 
            email 

        });

        toast.success("A new OTP has been sent to your email/phone.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });

    } catch (error) {
        console.error("Error during OTP resend:", error);
        toast.error("An error occurred while resending OTP. Please try again.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
        });    }
    }

 
    return (
        <>
        <HeaderLogin/>
        <div className="otp-container">
            <div className="otp-left">
                <img
                    src={loginImg}
                    alt="Illustration"
                    className="otp-image"
                />
            </div>
            <div className="otp-right">
                <h3>Verify Your OTP</h3>
                <div className="otp-area">
                    {otp.map((data, i) => (
                        <input
                            key={i}
                            type="text"
                            ref={(el) => (inputRefs.current[i] = el)}
                            value={data}
                            maxLength={1}
                            onChange={(e) => handleChange(e, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className="otp-input"
                        />
                    ))}
                </div>
                {resendVisible ? (
                    <a onClick={handleResend} className="resend-link">
                        Resend OTP
                    </a>
                ) : (
                    <p className="timer">{formatTime(timer)}</p>
                )}
                <button onClick={handleVerify} className="verify-button">
                    Verify
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
        theme="dark" // light, dark, colored
        // Custom styles
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
