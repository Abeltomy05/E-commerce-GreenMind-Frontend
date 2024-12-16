import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet  } from 'react-router-dom';

 const ProtectedRoute = () => {


  const { isAuthenticated} = useSelector((state) => state.auth);
  console.log(isAuthenticated);


  if (!isAuthenticated) {
    return <Navigate to="/user/login"  replace />;
  }

  // if (!userData) {
  //   return <Navigate to="/login"  replace />;
  // }

  // if (allowedRoles && !allowedRoles.includes(userData.role)) {
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
};

 const  LoginProtect = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);


  if (isAuthenticated) {
    return <Navigate to="/user/home"  replace />;
  }

  // if (!userData) {
  //   return <Navigate to="/login"  replace />;
  // }

  // if (allowedRoles && !allowedRoles.includes(userData.role)) {
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
};

const AdminProtectRoute = () => {

  const {isAuthenticated} = useSelector((state) => state.auth);

 
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }


  return <Outlet />;
};

const AdminProtectRouteLogin= () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  
  
  if (isAuthenticated ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export {LoginProtect,ProtectedRoute,AdminProtectRoute,AdminProtectRouteLogin} ;