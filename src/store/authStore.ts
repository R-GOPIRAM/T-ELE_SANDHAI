import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/apiClient';
import { User, LoginCredentials, RegisterData } from '../types';
import { useCartStore } from './cartStore';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isCheckingAuth: boolean;
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
            isCheckingAuth: true,
            error: null,

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', credentials);
                    const userObj = data.data.user;

                    set({
                        user: userObj,
                        isLoading: false
                    });

                    // Background cart sync - isolated and non-blocking
                    setTimeout(() => {
                        useCartStore.getState().mergeLocalCart().catch(err =>
                            console.error('Secondary: Cart sync failed after login', err)
                        );
                    }, 0);

                    return userObj;
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    throw err;
                } finally {
                    set({ isLoading: false });
                }
            },

            register: async (registerData) => {
                set({ isLoading: true, error: null });
                try {
                    const endpoint = registerData.role === 'seller' ? '/auth/register/seller' : '/auth/register/customer';
                    const { data } = await api.post(endpoint, registerData);
                    const userObj = data.data.user;

                    set({
                        user: userObj,
                        isLoading: false
                    });

                    // Background cart sync - isolated and non-blocking
                    setTimeout(() => {
                        useCartStore.getState().mergeLocalCart().catch(err =>
                            console.error('Secondary: Cart sync failed after registration', err)
                        );
                    }, 0);

                    return userObj;
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    const message = error.response?.data?.message || 'Registration failed';
                    set({ error: message, isLoading: false });
                    throw err;
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Secondary: Logout API failed', error);
                } finally {
                    localStorage.removeItem('auth-storage');
                    set({ user: null, error: null });
                    // Clear cart on logout
                    try {
                        useCartStore.getState().clearCart();
                    } catch (e) {
                        console.error('Secondary: Failed to clear cart on logout', e);
                    }
                }
            },

            checkAuth: async () => {
                // Internal initialization guard to prevent double-calls
                const store = useAuthStore as unknown as { _isInitializing?: boolean };
                if (store._isInitializing) return;
                store._isInitializing = true;

                set({ isCheckingAuth: true });

                // Cold-load guard: if no user is persisted in state, no session was ever
                // established — skip the /api/auth/me network call entirely to prevent
                // the 401 → refresh attempt → 401 cascade on unauthenticated page loads.
                const currentUser = useAuthStore.getState().user;
                if (!currentUser) {
                    set({ user: null, isCheckingAuth: false });
                    (useAuthStore as unknown as { _isInitializing?: boolean })._isInitializing = false;
                    return;
                }

                try {
                    const { data } = await api.get('/auth/me');
                    const userObj = data.data.user;
                    set({ user: userObj, isCheckingAuth: false });

                    if (userObj) {
                        // Background fetch cart - isolated and non-blocking
                        setTimeout(() => {
                            useCartStore.getState().fetchCart().catch(err =>
                                console.error('Secondary: Cart fetch failed during checkAuth', err)
                            );
                        }, 0);
                    }
                } catch (error) {
                    set({ user: null, isCheckingAuth: false });
                    // Don't clear storage on background check failures unless it's a 401
                    const err = error as { response?: { status?: number } };
                    if (err.response?.status === 401) {
                        localStorage.removeItem('auth-storage');
                    }
                } finally {
                    set({ isCheckingAuth: false });
                    (useAuthStore as unknown as { _isInitializing?: boolean })._isInitializing = false;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
