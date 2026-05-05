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
        primary: 'bg-primary/10 text-primary',
        pink: 'bg-bargain/10 text-bargain',
        blue: 'bg-blue-100 text-blue-600',
        gray: 'bg-background text-text-secondary',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-lg mx-auto"
        >
            <div className={`w-28 h-28 rounded-[40px] flex items-center justify-center mb-8 relative ${colorClasses[illustrationColor]}`}>
                <Icon size={48} strokeWidth={1.5} />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-current rounded-full blur-3xl"
                />
            </div>

            <h2 className="text-3xl font-heading font-black text-text-primary tracking-tight mb-4">
                {title}
            </h2>
            <p className="text-text-secondary font-medium leading-relaxed mb-10 text-base max-w-sm">
                {description}
            </p>

            {actionText && onAction && (
                <Button
                    onClick={onAction}
                    className="rounded-2xl px-12 py-6 text-lg font-black shadow-xl shadow-primary/20"
                >
                    {actionText}
                </Button>
            )}
        </motion.div>
    );
}
