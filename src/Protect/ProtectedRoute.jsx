import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet  } from 'react-router-dom';

 const ProtectedRoute = () => {


  const { isUserAuthenticated} = useSelector((state) => state.user);
  console.log(isUserAuthenticated);



  if (!isUserAuthenticated) {
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
  const { isUserAuthenticated, role } = useSelector((state) => state.user);


  if (isUserAuthenticated && role == 'user' ) {
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

  const {isAdminAuthenticated} = useSelector((state) => state.admin);

 
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }


  return <Outlet />;
};

const AdminProtectRouteLogin= () => {
  const { isAdminAuthenticated, role } = useSelector((state) => state.admin);
  
  
  if (isAdminAuthenticated && role == 'admin' ) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export {LoginProtect,ProtectedRoute,AdminProtectRoute,AdminProtectRouteLogin} ;