import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    allowedRoles?: ('customer' | 'seller' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isCheckingAuth } = useAuthStore();
    const location = useLocation();

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="text-center p-8 bg-card/80 rounded-3xl shadow-xl border border-card max-w-sm w-full animate-in fade-in zoom-in duration-300">
                    <LoadingSpinner size="lg" className="mx-auto mb-6 text-primary" />
                    <h3 className="text-lg font-black text-text-primary mb-2 uppercase tracking-tighter">Secure Handshake</h3>
                    <p className="text-text-secondary font-medium text-sm">Validating your credentials with the local hub...</p>
                </div>
            </div>
        );
    }

    // If no user, redirect to login
    if (!user) {
        return <Navigate to="/login/customer" state={{ from: location }} replace />;
    }

    // If roles are specified, check if user has permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to a role-appropriate dashboard or home
        const fallback = user.role === 'customer' ? '/dashboard' :
            user.role === 'seller' ? '/dashboard/seller' : '/dashboard/logistics';
        return <Navigate to={fallback} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
