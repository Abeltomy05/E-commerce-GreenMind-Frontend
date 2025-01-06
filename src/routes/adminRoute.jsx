import {Route, Routes } from 'react-router-dom';
import React from "react";
import AdminLogin from "../pages/admin/adminLogin/login";
import AdminDashboard from "../pages/admin/Dashboard/dashboard";
import Products from '../components/admin/products/products';
import Customer from '../components/admin/costumer/customer';
import AdminLayout from '../pages/admin/adminLayout/adminLayout';
import Category from '../pages/admin/category/category';
import Orders from '../pages/admin/orders/orders';
import CouponManagement from '../pages/admin/coupon/coupon';
import Banner from '../pages/admin/banner/banner';
import Transaction from '../pages/admin/transaction/transaction';
import Settings from '../pages/admin/settings/settings';
import LogoutPage from '../pages/admin/logout/logout';
import {AdminProtectRoute,AdminProtectRouteLogin} from "../Protect/ProtectedRoute"


function AdminRoute() {
 

    return (
      <Routes>
        <Route element={<AdminProtectRouteLogin />}>
        <Route path="/login" element={<AdminLogin />} />
      </Route>

      <Route element={<AdminProtectRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/product" element={<Products />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/category" element={<Category />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/coupon" element={<CouponManagement />} />
          <Route path="/banner" element={<Banner />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Route>
      </Route>
      </Routes>
    )
  }
  
  export default AdminRoute