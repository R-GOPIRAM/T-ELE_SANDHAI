import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
                <Outlet />
            </main>
            <BottomNav />
            {/* Footer could be added here */}
        </div>
    );
};

export default MainLayout;
