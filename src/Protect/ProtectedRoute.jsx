import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet  } from 'react-router-dom';
import Spinner from '../components/spinner/spinner';

 const ProtectedRoute = () => {

  const { isUserAuthenticated, loading } = useSelector((state) => state.user);

  if (loading) {
    return(
       <div className="spinner-loader-layout">
        <Spinner/>
       </div>
    )
  }

  if (!isUserAuthenticated) {
    return <Navigate to="/user/login"  replace />;
  }

  return <Outlet />;
};

 const  LoginProtect = () => {
  const { isUserAuthenticated, role } = useSelector((state) => state.user);


  if (isUserAuthenticated && role == 'user' ) {
    return <Navigate to="/user/home"  replace />;
  }
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