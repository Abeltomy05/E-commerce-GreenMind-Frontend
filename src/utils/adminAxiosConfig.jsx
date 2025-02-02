import React from 'react';
import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/adminSlice';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL ;

// Create axios instance with default config
const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  } 
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there hasn't been a retry yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        const response = await axios.post(
          'https://backend.abeltomy.site/admin/refresh-token',
          {},
          { withCredentials: true }
        );

        if (response.status === 200) {
          // Retry the original request
          return api(originalRequest);
        }
      } catch (err) {
        // If refresh token fails, logout user
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;