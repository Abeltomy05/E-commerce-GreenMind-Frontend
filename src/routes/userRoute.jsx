import { Route, Routes } from 'react-router-dom';
import React from "react";
import UserSignup from "../pages/user/signup/signup";
import VerifyOTP from "../pages/user/verifyOTP/verifyOTP";
import UserHome from "../pages/user/home/UserHome";
import UserLogin from "../pages/user/login/login";
import Shop from '../pages/user/shop/shop';
import ProductView from '../pages/user/product-view/productView';
import { ProtectedRoute,LoginProtect }  from '../Protect/ProtectedRoute';
import AccountDashboard from '../pages/user/yourAccount/userAccount';
import ProfileSettings from '../pages/user/profile/profile'
import AddressManagement from '../pages/user/address/address';
import CartPage from '../pages/user/addtocart/addtocart';
import CheckoutPage from '../pages/user/checkout/checkout';

function UserRoute() {
 

    return (
      <Routes>
        <Route element={< LoginProtect/>}>
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/verify-otp/:userId/:email" element={<VerifyOTP />} />
      </Route>


      <Route element={<ProtectedRoute/>}>
        <Route path="/home" element={<UserHome />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:productId" element={<ProductView/>} />
        <Route path="/account" element={<AccountDashboard/>} />
        <Route path="/profile" element={<ProfileSettings/>} />
        <Route path="/address" element={<AddressManagement/>} />
        <Route path="/cart" element={<CartPage/>} />
        <Route path="/checkout" element={<CheckoutPage/>} />
      </Route>
      </Routes>
    )
  }
  
  export default UserRoute
  