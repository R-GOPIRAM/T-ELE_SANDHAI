import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="mb-8">
                <Link to="/" className="text-3xl font-black tracking-tighter text-primary">
                    LOCALMART
                </Link>
            </div>

            <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-8">
                <Outlet />
            </div>

            <div className="mt-8 text-center text-sm text-text-secondary">
                <p>&copy; {new Date().getFullYear()} T-ELE Sandhai LocalMart. Support your local retailers.</p>
            </div>
        </div>
    );
};

export default AuthLayout;
