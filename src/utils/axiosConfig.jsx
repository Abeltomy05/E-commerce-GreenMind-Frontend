import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/userSlice';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

const handleAuthError = () => {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }
  
  logoutTimer = setTimeout(() => {
    console.log('Logging out due to auth error');
    store.dispatch(logout());
    
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    
    toast.error('Session expired. Please log in again.');
    
    window.location.href = '/user/login';
  }, 100); // Small delay to prevent multiple toasts and redirects
};

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
        const refreshToken = Cookies.get('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axiosInstance.post('/user/refresh-token', { refreshToken });

        if (refreshResponse.data.accessToken) {
          Cookies.set('accessToken', refreshResponse.data.accessToken, COOKIE_OPTIONS);
          if (refreshResponse.data.refreshToken) {
            Cookies.set('refreshToken', refreshResponse.data.refreshToken, COOKIE_OPTIONS);
          }

          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
          
          processQueue(null, refreshResponse.data.accessToken);
          
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

    if (error.response?.status === 401) {
      handleAuthError();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

