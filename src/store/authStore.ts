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

            // ==========================
            // LOGIN
            // ==========================
            login: async (credentials) => {
                set({ isLoading: true, error: null });

                try {
                    const { data } = await api.post('/auth/login', credentials);

                    // ✅ FIX: correct response parsing
                    const userObj = data?.user;

                    if (!userObj) {
                        throw new Error("Invalid login response");
                    }

                    set({
                        user: userObj,
                        isLoading: false
                    });

                    // Background cart sync
                    setTimeout(() => {
                        useCartStore.getState().mergeLocalCart().catch(err =>
                            console.error('Cart sync failed after login', err)
                        );
                    }, 0);

                    return userObj;

                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    const message = error.response?.data?.message || 'Login failed';

                    set({ error: message, isLoading: false });
                    throw err;
                }
            },

            // ==========================
            // REGISTER
            // ==========================
            register: async (registerData) => {
                set({ isLoading: true, error: null });

                try {
                    const endpoint =
                        registerData.role === 'seller'
                            ? '/auth/register/seller'
                            : '/auth/register/customer';

                    const { data } = await api.post(endpoint, registerData);

                    // ✅ FIX: correct response parsing
                    const userObj = data?.user;

                    if (!userObj) {
                        throw new Error("Invalid register response");
                    }

                    set({
                        user: userObj,
                        isLoading: false
                    });

                    // Background cart sync
                    setTimeout(() => {
                        useCartStore.getState().mergeLocalCart().catch(err =>
                            console.error('Cart sync failed after registration', err)
                        );
                    }, 0);

                    return userObj;

                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    const message = error.response?.data?.message || 'Registration failed';

                    set({ error: message, isLoading: false });
                    throw err;
                }
            },

            // ==========================
            // LOGOUT
            // ==========================
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout API failed', error);
                } finally {
                    localStorage.removeItem('auth-storage');

                    set({
                        user: null,
                        error: null
                    });

                    try {
                        useCartStore.getState().clearCart();
                    } catch (e) {
                        console.error('Failed to clear cart on logout', e);
                    }
                }
            },

            // ==========================
            // CHECK AUTH
            // ==========================
            checkAuth: async () => {
                const store = useAuthStore as unknown as { _isInitializing?: boolean };

                if (store._isInitializing) return;
                store._isInitializing = true;

                set({ isCheckingAuth: true });

                const currentUser = useAuthStore.getState().user;

                // Skip unnecessary API call if no user
                if (!currentUser) {
                    set({ user: null, isCheckingAuth: false });
                    store._isInitializing = false;
                    return;
                }

                try {
                    const { data } = await api.get('/auth/me');

                    // ✅ FIX: correct parsing
                    const userObj = data?.user;

                    set({
                        user: userObj || null,
                        isCheckingAuth: false
                    });

                    if (userObj) {
                        setTimeout(() => {
                            useCartStore.getState().fetchCart().catch(err =>
                                console.error('Cart fetch failed during checkAuth', err)
                            );
                        }, 0);
                    }

                } catch (error) {
                    const err = error as { response?: { status?: number } };

                    set({
                        user: null,
                        isCheckingAuth: false
                    });

                    if (err.response?.status === 401) {
                        localStorage.removeItem('auth-storage');
                    }
                } finally {
                    set({ isCheckingAuth: false });
                    store._isInitializing = false;
                }
            },

            // ==========================
            // CLEAR ERROR
            // ==========================
            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user
            }),
        }
    )
);