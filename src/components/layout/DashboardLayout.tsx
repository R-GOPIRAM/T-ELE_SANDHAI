import React from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { CUSTOMER_NAV, SELLER_NAV, ADMIN_NAV } from '../../config/navigation';

const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();

    const getLinks = () => {
        if (user?.role === 'seller') return SELLER_NAV;
        if (user?.role === 'admin') return ADMIN_NAV;
        return CUSTOMER_NAV;
    };

    const links = getLinks();

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border sticky top-0 h-screen">
                <div className="p-6">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-tighter text-primary">T-ELE Sandhai</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.name}
                                to={link.href}
                                end={link.end}
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-primary text-white font-bold shadow-md hover:shadow-lg scale-[1.02]'
                                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                                    }`}
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className="w-5 h-5" />
                                        <span className="text-sm font-bold tracking-tight">{link.name}</span>
                                        {isActive && (
                                            <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left font-bold text-text-secondary hover:bg-danger/10 hover:text-danger rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm uppercase tracking-wider">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-black text-text-primary tracking-tight uppercase">
                            {links.find(l => {
                                if (l.href === location.pathname) return true;
                                if (l.end) return false;
                                return location.pathname.startsWith(l.href);
                            })?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-text-primary leading-none">{user?.name}</p>
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border-2 border-border shadow-md">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto pb-24 md:pb-8">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
