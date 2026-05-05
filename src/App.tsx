import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import { WishlistProvider } from './context/WishlistContext';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Single point of initialization for the entire app
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <WishlistProvider>
        <div className="min-h-screen bg-background">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#1f2937',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '16px',
                fontFamily: 'Inter, sans-serif'
              },
            }}
          />
          <ScrollToTop />
          <AppRoutes />
        </div>
      </WishlistProvider>
    </ErrorBoundary>
  );
}

export default App;