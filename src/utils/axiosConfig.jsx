import React from 'react';
import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/userSlice';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_API_URL ;


const axiosInstance = axios.create({
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
  window.location.href = '/user/login';
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await axiosInstance.post('/user/refresh-token');
        console.log(data)
        processQueue(null);
        return axiosInstance(originalRequest);  
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

export default axiosInstance;

