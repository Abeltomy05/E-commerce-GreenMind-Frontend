// axiosConfig.jsx
import axios from 'axios';
import { store } from '../redux/store'; // Adjust path as needed
import { logout } from '../redux/userSlice'; // Adjust path as needed
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { toast } from 'react-toastify';

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

const handleAuthError = () => {
  // Dispatch logout action to Redux
  store.dispatch(logout());
  
  // Clear all auth related data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  
  // Show error message
  toast.error('Session expired. Please log in again.');
  
  // Redirect to login page
  window.location.href = '/user/login';
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axiosInstance.post('/user/refresh-token', { refreshToken });

        if (refreshResponse.data.accessToken) {
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
          }

          // Update axios default headers
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
          
          // Process queue with new token
          processQueue(null, refreshResponse.data.accessToken);
          
          // Return the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error('No access token received');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleAuthError();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // If error is still 401 after refresh attempt, or any other auth error
    if (error.response?.status === 401) {
      handleAuthError();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;