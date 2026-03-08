import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionText?: string;
    onAction?: () => void;
    illustrationColor?: string;
}

export default function EmptyState({
    title,
    description,
    icon: Icon,
    actionText,
    onAction,
    illustrationColor = 'primary'
}: EmptyStateProps) {
    const colorClasses: Record<string, string> = {
        primary: 'bg-primary/10 text-primary-500',
        pink: 'bg-pink-50 text-pink-500',
        blue: 'bg-blue-50 text-blue-500',
        gray: 'bg-background text-text-secondary/50',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-lg mx-auto"
        >
            <div className={`w-24 h-24 rounded-[40px] flex items-center justify-center mb-8 relative ${colorClasses[illustrationColor]}`}>
                <Icon size={40} strokeWidth={1.5} />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-current rounded-full blur-2xl"
                />
            </div>

            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-3">
                {title}
            </h2>
            <p className="text-text-secondary font-medium leading-relaxed mb-10 text-sm">
                {description}
            </p>

            {actionText && onAction && (
                <Button
                    onClick={onAction}
                    className="rounded-2xl px-10 py-6 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-100"
                >
                    {actionText}
                </Button>
            )}
        </motion.div>
    );
}
