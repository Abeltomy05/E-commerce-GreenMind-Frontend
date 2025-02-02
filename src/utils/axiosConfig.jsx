import React from 'react';
import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/userSlice';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const BACKEND_URL = import.meta.env.VITE_API_URL ;

const COOKIE_OPTIONS = {
  secure: true,
  sameSite: 'lax',
  path: '/'
};

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let logoutTimer = null;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// const handleAuthError = () => {
//   if (logoutTimer) {
//     clearTimeout(logoutTimer);
//   }
  
//   logoutTimer = setTimeout(() => {
//     console.log('Logging out due to auth error');
//     store.dispatch(logout());
    
//     Cookies.remove('accessToken');
//     Cookies.remove('refreshToken');
    
//     toast.error('Session expired. Please log in again.');
    
//     window.location.href = '/user/login';
//   }, 100); // Small delay to prevent multiple toasts and redirects
// };

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('user_access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleLogout = () => {
  store.dispatch(logout());
  Cookies.remove('user_access_token');
  Cookies.remove('user_refresh_token');
  toast.error('Session expired. Please log in again.');
  window.location.href = '/user/login';
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.get('/user/refresh-token');
        const { accessToken, refreshToken } = response.data;

        if (accessToken && refreshToken) {
          Cookies.set('user_access_token', accessToken, {
            secure: true,
            sameSite: 'lax',
            path: '/'
          });
          Cookies.set('user_refresh_token', refreshToken, {
            secure: true,
            sameSite: 'lax',
            path: '/'
          });

          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

