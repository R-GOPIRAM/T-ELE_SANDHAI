import {
    Home,
    Search,
    ShoppingCart,
    Package,
    User,
    Store,
    LayoutDashboard,
    Truck,
    Heart,
    History,
    MapPin,
    Settings,
    MessageSquare,
    ShieldCheck,
    BarChart3,
    LucideIcon
} from 'lucide-react';

export interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    end?: boolean;
}

export const CUSTOMER_NAV = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'My Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Bargain History', href: '/dashboard/bargains', icon: History },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const SELLER_NAV = [
    { name: 'Overview', href: '/dashboard/seller', icon: LayoutDashboard, end: true },
    { name: 'Add Product', href: '/dashboard/seller/add-product', icon: Package },
    { name: 'My Inventory', href: '/dashboard/products', icon: Store },
    { name: 'Orders', href: '/dashboard/seller/orders', icon: Package },
    { name: 'Bargain Requests', href: '/dashboard/bargains', icon: MessageSquare },
    { name: 'Verification', href: '/dashboard/seller/verification', icon: ShieldCheck },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const ADMIN_NAV = [
    { name: 'Overview', href: '/admin/logistics', icon: LayoutDashboard, end: true },
    { name: 'Stores', href: '/admin/stores', icon: Store },
    { name: 'Logistics', href: '/admin/logistics', icon: Truck },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const BOTTOM_NAV_CUSTOMER = [
    { name: 'Home', href: '/', icon: Home, end: true },
    { name: 'Search', href: '/products', icon: Search },
    { name: 'Cart', href: '/cart', icon: ShoppingCart },
    { name: 'Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Profile', href: '/dashboard', icon: User },
];

export const BOTTOM_NAV_SELLER = [
    { name: 'Home', href: '/', icon: Home, end: true },
    { name: 'Inventory', href: '/dashboard/products', icon: Store },
    { name: 'Orders', href: '/dashboard/seller/orders', icon: Package },
    { name: 'Dashboard', href: '/dashboard/seller', icon: LayoutDashboard },
];

export const BOTTOM_NAV_ADMIN = [
    { name: 'Home', href: '/', icon: Home, end: true },
    { name: 'Stores', href: '/admin/stores', icon: Store },
    { name: 'Logistics', href: '/admin/logistics', icon: Truck },
    { name: 'Dashboard', href: '/admin/logistics', icon: LayoutDashboard },
];
