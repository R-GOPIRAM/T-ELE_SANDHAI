import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocationStore } from '../store/locationStore';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For sending cookies
});

// Request Interceptor: Ensure credentials (cookies) are sent and inject location headers
api.interceptors.request.use(
    (config) => {
        // Inject location headers if available
        const location = useLocationStore.getState().location;
        if (location) {
            config.headers['x-user-latitude'] = location.coordinates.lat;
            config.headers['x-user-longitude'] = location.coordinates.lng;
            config.headers['x-user-pincode'] = location.pincode;
        }

        // We no longer manually inject Bearer tokens from localStorage.
        // Authentication is handled via httpOnly cookies.
        config.withCredentials = true;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors globally
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Network Error
        if (!error.response) {
            // Don't toast for silent auth checks
            if (!originalRequest.url?.includes('/auth/me')) {
                toast.error('Network Error: Please check your connection');
            }
            return Promise.reject(error);
        }

        // Handle 401 (Token Expired or Invalid)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh');

        if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token using httpOnly cookie via backend refresh endpoint
                await axios.post(
                    `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout cleanly
                localStorage.removeItem('auth-storage');

                const loginPaths = ['/login/customer', '/login/seller', '/login/admin', '/login'];
                const isLoginPage = loginPaths.some(path => window.location.pathname.startsWith(path));

                if (!isLoginPage && !originalRequest.url?.includes('/auth/me')) {
                    toast.error('Session expired. Please login again.');
                    window.location.href = '/login/customer';
                }
                return Promise.reject(refreshError);
            }
        }

        // If it's a 401 on an auth endpoint, just reject without retrying
        if (error.response.status === 401 && isAuthEndpoint) {
            return Promise.reject(error);
        }

        // Handle 403 (Forbidden)
        if (error.response.status === 403) {
            toast.error(error.response.data?.message || 'You do not have permission to perform this action');
        }

        // Handle 400 (Bad Request)
        if (error.response.status === 400) {
            toast.error(error.response.data?.message || 'Invalid request parameters');
        }

        // Handle 500+ (Server Error)
        if (error.response.status >= 500) {
            // Silently handle server errors for auth check to avoid intrusive messages on startup
            if (!originalRequest.url?.includes('/auth/me')) {
                toast.error(error.response.data?.message || 'Server error. Please try again later.');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
