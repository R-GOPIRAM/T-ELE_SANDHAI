import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For sending cookies
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        // Try getting token from auth-storage (zustand persist) first, then raw token
        const authStorage = localStorage.getItem('auth-storage');
        let token = localStorage.getItem('token');

        if (!token && authStorage) {
            try {
                const parsedStorage = JSON.parse(authStorage);
                if (parsedStorage.state?.token) {
                    token = parsedStorage.state.token;
                }
            } catch (e) {
                console.error('Failed to parse auth-storage', e);
            }
        }

        if (token) {
            // Remove quotes if they exist (artifact of JSON.stringify sometimes)
            token = token.replace(/^"|"$/g, '');
            config.headers.Authorization = `Bearer ${token}`;
        }
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
            toast.error('Network Error: Please check your connection');
            return Promise.reject(error);
        }

        // Handle 401 (Token Expired)
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Logout cleanly
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Only redirect if not already on login page to avoid loops
                if (window.location.pathname !== '/login') {
                    toast.error('Session expired. Please login again.');
                    window.location.href = '/login';
                }

                return Promise.reject(error);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        // Handle 403 (Forbidden)
        if (error.response.status === 403) {
            toast.error(error.response.data?.message || 'You do not have permission to perform this action');
        }

        // Handle 400 (Bad Request)
        if (error.response.status === 400) {
            toast.error(error.response.data?.message || 'Invalid request parameters');
        }

        // Handle 500 (Server Error)
        if (error.response.status >= 500) {
            toast.error(error.response.data?.message || 'Server error. Please try again later.');
        }

        return Promise.reject(error);
    }
);

export default api;
