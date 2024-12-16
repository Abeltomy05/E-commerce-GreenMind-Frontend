const express =require("express")
const User = require("../model/userModel");
const Product = require("../model/productModel")
const UserOTPVerification = require("../model/userOTPverifivation")
const bcrypt = require('bcrypt');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const securePassword = async(password)=>{
    try{
       return await bcrypt.hash(password,10);
    }catch(error){
       console.log(error)
    }
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    },
});

const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id, 
            email: user.email 
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id, 
            email: user.email 
        }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d' }
    );
};

const refreshTokenController = async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
  
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' });
      }
  
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
     
      const newAccessToken = generateAccessToken(user);
  
     
      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
  
      res.json({ message: 'Token refreshed' });
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  };


const signup = async(req,res)=>{
    try{
      const {firstname,lastname,username,password,email,phone} = req.body;
      console.log(req.body)
      const isEmailExists = await User.findOne({email})
      if(isEmailExists){
        res.status(409).json({message: "User already exists"});
      }else{
        const passwordHash = await securePassword(password);
       
        const user = await User.create({
            firstname,
            lastname,
            username,
            password:passwordHash,
            email,
            phone
        })
        await user.save()
        console.log("User created successfully")
        await sendOTPVerificationEmail({ id: user._id, email: user.email });
        
        res.status(201).json({
            message: "User registered successfully. OTP sent to email.",
            userId: user._id,
            email:email
           
        });
          }
    }catch(error){
        console.error("Signup error:", error.message);
        res.status(500).json({ message: error.message || "Something went wrong at signup" });
    }
}

const sendOTPVerificationEmail = async({id,email})=>{
     try{
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
         
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email",
            text: `Your OTP is ${otp}`,
        };

        const hashedOTP = await bcrypt.hash(otp,10);
        const newOTPVerification =  new UserOTPVerification({
            userId: id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30000,
        })
        await newOTPVerification.save();

        try {
            await transporter.sendMail(mailOptions);
          } catch (emailError) {
            console.error("Email Sending Error:", emailError.message);
            throw new Error(`Failed to send OTP. Reason: ${emailError.message}`);
          }

          console.log("OTP Verification email sent successfully");
        
     }catch(error){
        console.error("Error sending OTP:", error.message);
        throw new Error("Error sending OTP verification email.");
     }
}

const verifyOTP = async(req,res)=>{
    try{
      const{userId, otp} = req.body;
      console.log(req.body)
      if(!userId || !otp){
        throw Error("Empty otp details are not allowed");
      }else{
        const userOTPverifivationRecords = await UserOTPVerification.find({
            userId,
        });
        if(userOTPverifivationRecords.length <= 0){
             throw new Error("Account record dosen't exist or has been already verified. Please signup or login")
        }else{
            const {expiresAt} = userOTPverifivationRecords[0];
            const hashedOTP =  userOTPverifivationRecords[0].otp;

            if(expiresAt < Date.now()){
                await UserOTPVerification.deleteMany({userId});
                throw new Error("Code has expired. Please try again");
            }else{
                const validOTP = await bcrypt.compare(otp, hashedOTP); 
                if(!validOTP){
                    throw new Error("Invalid code passed. Check your inbox.")
                }else{
                   
                   const user = await User.findById(userId);
                   
                   
                   const accessToken = generateAccessToken(user);
                   const refreshToken = generateRefreshToken(user);

                   
                   await User.updateOne({_id: userId},{
                     verified: true,
                     refreshToken: refreshToken 
                   });
                   await UserOTPVerification.deleteMany({userId});

                   res.cookie('accessToken', accessToken, {
                    httpOnly: true,  
                    secure: false, 
                    sameSite: 'strict', 
                    maxAge: 15 * 60 * 1000 //15 Min
                  });

                  res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                  });
                  
                   res.json({
                    status: "VERIFIED",
                    message: "User email verified successfully",
                    userId: user._id,
                    email: user.email
                   })
                }
            }
        }
      }
    }catch(error){
        res.status(400).json({
            status: "FAILED",
            message: error.message,
        })
    }
}

const resendOTP = async(req,res)=>{
    try{
       const{userId, email} = req.body;
      console.log(req.body);
      
       if(!userId || !email){
        throw Error("Empty otp details are not allowed");
       }else{
         await UserOTPVerification.deleteMany({userId});
         await sendOTPVerificationEmail({id:userId,email:email});

         res.status(200).json({
            status: "SUCCESS",
            message: "New OTP sent successfully"
          });
       }
    }catch(error){
        res.json({
            status: "FAILED",
            message: error.message,
        })
    }
}

const login = async (req,res)=>{
  try{
      const {email,password}= req.body
      const user = await User.findOne({email})
     if(!user.isAdmin){
      if(user.verified || user.isGoogleUser){
          if(await bcrypt.compare(password, user.password)){
             
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await User.updateOne({_id: user._id},{
              refreshToken: refreshToken 
            });


              res.cookie('accessToken', accessToken, {
                httpOnly: true,  
                secure: false, 
                sameSite: 'strict', 
                maxAge: 15 * 60 * 1000 //15 Min
              });

              res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
              });
              
               res.json({
                status: "VERIFIED",
                message: "User login success",
                user:{
                  id:user._id,
                  name:user.username,
                  email:user.email,
                  image:user.profileImage,
                  phone:user.phone
                },
                role:"user"
               })
              }else{
                  res.status(401).json({message: "Invalid email or password"})
              }
          }else{
              return res.status(500).json({ message: "Invalid email or password" });
          }
      }else{
          return res.status(500).json({ message: "User Not Found" });
      }
      }catch(err){
          console.log(err);
      }
  }

  const getProductData = async (req, res) => {
    try {
      const products = await Product.find({ isDeleted: false })
        .populate('category', 'name');
 
      return res.status(200).json(products);
    } catch (err) {
      console.error('Product Fetch Error:', err);
      return res.status(500).json({
        error: "Failed to fetch products",
        details: err.message
      });
    }
 };

const getSingleProductData = async(req,res)=>{
   try{
    const id = req.params.id;
    const product = await Product.findById(id).populate("category","name");

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);

   }catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }

}

const getUserData = async(req,res)=>{
    try{
      
      const id = req.params.id;
      console.log(id)
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);

    }catch(error){
      console.error('Error fetching user in home:', error);
    }
}


const logout = async (req, res) => {
    try {
      
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });
  
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });
  
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Logout failed' });
    }
  };



module.exports = {
    signup,
    verifyOTP,
    resendOTP,
    refreshTokenController,
    login,
    logout,
    getProductData,
    getSingleProductData,
    getUserData
}