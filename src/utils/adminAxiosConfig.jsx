import React from 'react';
import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/adminSlice';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_API_URL ;

// Create axios instance with default config
const api =  axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

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

const handleLogout = () => {
  store.dispatch(logout());
  toast.error('Session expired. Please log in again.');
  window.location.href = '/admin/login';
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Interceptor caught:", error.response?.status);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          console.log("Axios interceptor reaced")
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/admin/refresh-token');
        processQueue(null);
        return api(originalRequest);  
      } catch (refreshError) {
        processQueue(refreshError);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;