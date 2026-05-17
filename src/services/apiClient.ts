import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocationStore } from '../store/locationStore';

const isProbablyAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

// ✅ Base URL (production-safe)
// IMPORTANT:
// - Cookie auth must be first-party in modern browsers (3P cookies are commonly blocked).
// - In production on Vercel, always prefer the same-origin reverse proxy route (`/api`)
//   from `vercel.json` rewrites.
const resolveBaseUrl = () => {
  const configured = (import.meta.env.VITE_API_URL || '').trim();

  if (import.meta.env.PROD) {
    // Allow relative overrides (e.g. "/api", "/api/v1")
    if (configured && configured.startsWith('/')) return configured;

    // Disallow absolute URLs by default in production to avoid cross-site cookies
    if (configured && isProbablyAbsoluteUrl(configured)) {
      console.warn(
        `[apiClient] Ignoring absolute VITE_API_URL in production ("${configured}"). ` +
          `Using "/api" to keep auth cookies first-party.`
      );
    }

    return '/api';
  }

  return configured || 'http://localhost:5000/api';
};

const BASE_URL = resolveBaseUrl();

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
          const path = window.location.pathname;
          const redirect =
            path.startsWith('/admin') ? '/admin/login' :
              path.startsWith('/dashboard/seller') ? '/login/seller' :
                '/login/customer';
          window.location.href = redirect;
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
