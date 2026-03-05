import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<User>;
    register: (data: RegisterData) => Promise<User>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', credentials);

                    const token = data.accessToken || data.token; // Handle both formats
                    localStorage.setItem('token', token); // Sync with local storage for axios interceptor

                    set({
                        user: data.user,
                        token: token,
                        isLoading: false
                    });

                    return data.user;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            register: async (registerData) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/signup', registerData);

                    const token = data.accessToken || data.token;
                    localStorage.setItem('token', token);

                    set({
                        user: data.user,
                        token: token,
                        isLoading: false
                    });

                    return data.user;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Registration failed',
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.get('/auth/logout');
                } catch (error) {
                    console.error('Logout API auth failed', error);
                } finally {
                    localStorage.removeItem('token');
                    set({ user: null, token: null });
                }
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const { data } = await api.get('/auth/me');
                    set({ user: data.user, isLoading: false });
                } catch (error) {
                    set({ user: null, token: null, isLoading: false });
                    localStorage.removeItem('token');
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token }), // Only persist user and token
        }
    )
);
