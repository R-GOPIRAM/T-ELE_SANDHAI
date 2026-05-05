import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocationStore } from '../store/locationStore';

// 🔥 Always use deployed backend in production
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://inspirathon.onrender.com/api' // ✅ FIXED (no /api relative)
    : 'http://localhost:5000/api');

// ✅ Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔥 REQUIRED for cookies
});

// ==========================
// REQUEST INTERCEPTOR
// ==========================
api.interceptors.request.use(
  (config) => {
    // Inject location headers
    const location = useLocationStore.getState().location;

    if (location) {
      config.headers['x-user-latitude'] = location.coordinates.lat;
      config.headers['x-user-longitude'] = location.coordinates.lng;
      config.headers['x-user-pincode'] = location.pincode;
    }

    // 🔥 Ensure cookies always sent
    config.withCredentials = true;

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// RESPONSE INTERCEPTOR
// ==========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔴 Network error
    if (!error.response) {
      if (!originalRequest.url?.includes('/auth/me')) {
        toast.error('Network error. Check your connection.');
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    // ==========================
    // 🔥 HANDLE TOKEN EXPIRED
    // ==========================
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // 🔥 FIX: use SAME api instance (not axios)
        await api.post('/auth/refresh');

        // retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // 🔴 Refresh failed → logout
        localStorage.removeItem('auth-storage');

        const loginPaths = [
          '/login/customer',
          '/login/seller',
          '/login/admin',
          '/login',
        ];

        const isLoginPage = loginPaths.some((path) =>
          window.location.pathname.startsWith(path)
        );

        if (!isLoginPage && !originalRequest.url?.includes('/auth/me')) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login/customer';
        }

        return Promise.reject(refreshError);
      }
    }

    // ==========================
    // OTHER ERRORS
    // ==========================

    if (status === 403) {
      toast.error(
        error.response.data?.message ||
          'You do not have permission to perform this action'
      );
    }

    if (status === 400) {
      toast.error(
        error.response.data?.message || 'Invalid request parameters'
      );
    }

    if (status >= 500) {
      if (!originalRequest.url?.includes('/auth/me')) {
        toast.error(
          error.response.data?.message ||
            'Server error. Please try again later.'
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;