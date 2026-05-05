import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocationStore } from '../store/locationStore';

// ✅ Base URL (production-safe)
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// ✅ Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 🔥 REQUIRED for cookies
});

// ==========================
// ✅ REQUEST INTERCEPTOR
// ==========================
api.interceptors.request.use(
  (config) => {
    const location = useLocationStore.getState().location;

    if (location) {
      config.headers['x-user-latitude'] = location.coordinates.lat;
      config.headers['x-user-longitude'] = location.coordinates.lng;
      config.headers['x-user-pincode'] = location.pincode;
    }

    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================
// ✅ RESPONSE INTERCEPTOR
// ==========================
api.interceptors.response.use(
  (response) => {
    // 🔥 IMPORTANT: DO NOT reject successful responses
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // 🔴 Network error
    if (!error.response) {
      if (!originalRequest?.url?.includes('/auth/me')) {
        toast.error('Network error. Check your connection.');
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/signup') ||
      originalRequest?.url?.includes('/auth/refresh');

    // ==========================
    // 🔥 TOKEN EXPIRED (401)
    // ==========================
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        await api.post('/auth/refresh');

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('auth-storage');

        const isLoginPage = window.location.pathname.includes('/login');

        if (!isLoginPage) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login/customer';
        }

        return Promise.reject(refreshError);
      }
    }

    // ==========================
    // 🔥 HANDLE VALIDATION ERRORS CLEANLY
    // ==========================
    if (status === 400) {
      // ❗ DO NOT show generic "registration failed"
      const msg =
        error.response.data?.message ||
        error.response.data?.error ||
        'Invalid request';

      toast.error(msg);
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error(
        error.response.data?.message ||
          'You do not have permission to perform this action'
      );
    }

    if (status >= 500) {
      if (!originalRequest?.url?.includes('/auth/me')) {
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
