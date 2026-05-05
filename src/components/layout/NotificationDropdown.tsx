import { motion } from 'framer-motion';
import {
    Bell,
    Package,
    MessageSquare,
    Truck,
    TrendingUp,
    Circle
} from 'lucide-react';
import { Notification, NotificationCategory } from '../../types';

// Simple time formatter since date-fns is not available
const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface NotificationDropdownProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
        case 'bargain':
            return <TrendingUp className="w-4 h-4 text-warning" />;
        case 'order':
            return <Package className="w-4 h-4 text-blue-500" />;
        case 'delivery':
            return <Truck className="w-4 h-4 text-emerald-500" />;
        case 'message':
            return <MessageSquare className="w-4 h-4 text-purple-500" />;
        default:
            return <Bell className="w-4 h-4 text-text-secondary" />;
    }
};

export default function NotificationDropdown({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead
}: NotificationDropdownProps) {

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 mt-3 w-96 bg-card rounded-[32px] shadow-2xl border border-border overflow-hidden z-50"
        >
            <div className="px-6 py-5 border-b border-gray-50 bg-background/30 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-primary-500 text-white text-[10px] px-2 py-0.5 rounded-full ring-4 ring-primary-50">
                                {unreadCount} New
                            </span>
                        )}
                    </h4>
                </div>
                <button
                    onClick={onMarkAllAsRead}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                    Mark all as read
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => onMarkAsRead(notification.id)}
                            className={`px-6 py-5 flex gap-4 cursor-pointer transition-colors relative group ${!notification.isRead ? 'bg-primary/10/30 hover:bg-primary/10/50' : 'hover:bg-background'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${!notification.isRead ? 'bg-card shadow-sm' : 'bg-background'
                                }`}>
                                {getCategoryIcon(notification.category)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className={`text-xs font-black uppercase tracking-tight truncate ${!notification.isRead ? 'text-text-primary' : 'text-text-secondary'
                                        }`}>
                                        {notification.title}
                                    </h5>
                                    <span className="text-[9px] font-bold text-text-secondary/50 whitespace-nowrap ml-2">
                                        {formatTime(notification.timestamp)}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed ${!notification.isRead ? 'text-text-secondary font-medium' : 'text-text-secondary/50'
                                    }`}>
                                    {notification.message}
                                </p>
                            </div>

                            {!notification.isRead && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Circle className="w-2 h-2 fill-primary-500 text-primary-500" />
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center px-10">
                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-text-secondary/50 font-black uppercase tracking-widest text-xs">No notifications yet</p>
                        <p className="text-text-secondary/30 font-medium text-[11px] mt-2">We'll alert you when there's local activity.</p>
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-4 bg-background/50 border-t border-gray-50 text-center">
                    <button className="text-[10px] font-black text-text-secondary/50 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                        View All History
                    </button>
                </div>
            )}
        </motion.div>
    );
}
