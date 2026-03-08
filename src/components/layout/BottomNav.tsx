import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCart } from '../../hooks/useCart';
import {
    BOTTOM_NAV_CUSTOMER,
    BOTTOM_NAV_SELLER,
    BOTTOM_NAV_ADMIN
} from '../../config/navigation';

export default function BottomNav() {
    const { getTotalItems } = useCart();
    const { user } = useAuthStore();

    const getNavItems = () => {
        if (!user || user.role === 'customer') return BOTTOM_NAV_CUSTOMER;
        if (user.role === 'seller') return BOTTOM_NAV_SELLER;
        return BOTTOM_NAV_ADMIN;
    };

    const navItems = getNavItems();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border px-4 py-2 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isCart = item.href === '/cart';
                    const badge = isCart ? getTotalItems() : 0;

                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.end}
                            className={({ isActive }) => `flex flex-col items-center gap-1 group relative py-1 transition-all flex-1 ${isActive ? 'text-primary scale-105' : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/10 shadow-sm' : 'active:scale-90'
                                        }`}>
                                        <Icon size={24} strokeWidth={isActive ? 3 : 2.5} />
                                        {badge > 0 && (
                                            <span className="absolute top-0 right-1/4 bg-warning text-white text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                                                {badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter transition-all">
                                        {item.name}
                                    </span>
                                    {isActive && (
                                        <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
