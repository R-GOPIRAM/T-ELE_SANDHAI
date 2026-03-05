import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  // Initialize auth check once on mount (handled by store persistence mostly, 
  // but good to verify token validity if needed)
  useEffect(() => {
    // Optional: You could trigger a re-validation here if needed
    // store.checkAuth(); 
  }, []);

  return {
    user: store.user,
    login: store.login,
    register: store.register,
    logout: store.logout,
    loading: store.isLoading,
    error: store.error,
    isAuthenticated: !!store.user,
  };
}

// Kept for compatibility if used elsewhere, but effectively no-op or returns store
export const AuthContext = null;
export const useAuthProvider = () => useAuth();