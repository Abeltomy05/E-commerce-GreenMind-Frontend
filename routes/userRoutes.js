const express = require("express");
const userRoute = express.Router();
const {signup,verifyOTP,resendOTP,refreshTokenController,login,getProductData,getSingleProductData,getUserData} = require("../controller/userController")
const {getProfiledata,updateUserProfile,changePassword,profileImgUpdate,getAdressOfaUser,setNewAddressForUser,updateAddress,deleteAddress} = require('../controller/userDashboard')
const {getCartData,addToCart,getCartDataForCartPage,updateCartItemQuantity,removeCartItem} = require("../controller/cartController")
const authMiddleware = require("../middleware/authMiddleware");

userRoute.post("/signup",signup);
userRoute.post("/verifyOTP",verifyOTP)
userRoute.post("/resendOTP",resendOTP)
userRoute.post('/refresh-token', refreshTokenController);
userRoute.post("/login",login);
userRoute.get("/getproductdata",getProductData);
userRoute.get("/product-view/:id",getSingleProductData);
userRoute.get("/getuserdata/:id",getUserData);
userRoute.get("/profile/:id",getProfiledata)
userRoute.put("/profileupdate/:id",updateUserProfile)
userRoute.put("/change-password/:id",changePassword)
userRoute.put("/profileImageupdate/:id",profileImgUpdate)
//address
userRoute.get("/addressdata/:id",getAdressOfaUser)
userRoute.post("/addnewaddress/:id",setNewAddressForUser)
userRoute.put("/updateaddress/:id",updateAddress)
userRoute.delete("/deleteaddress/:id",deleteAddress)
//cart
userRoute.get("/getcartdata/:id",getCartData)
userRoute.post("/addtocart",addToCart)
userRoute.get("/getcartdataforcartpage/:id",getCartDataForCartPage)
userRoute.patch("/updatequantity/:id",updateCartItemQuantity)
userRoute.delete("/removecartitem/:id",removeCartItem)

module.exports = userRoute