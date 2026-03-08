import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'primary' | 'bargain' | 'seller' | 'outline' | 'ghost' | 'danger' | 'warning';
    children?: React.ReactNode;
}

export const Badge = ({ className, variant = 'primary', children, ...props }: BadgeProps) => {
    const variants = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        bargain: 'bg-bargain/10 text-bargain border-bargain/20',
        seller: 'bg-seller/10 text-seller border-seller/20',
        danger: 'bg-danger/10 text-danger border-danger/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        outline: 'bg-transparent border-border text-text-secondary',
        ghost: 'bg-background text-text-primary border-transparent',
    };

    return (
        <div
            className={twMerge(
                clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors',
                    variants[variant],
                    className
                )
            )}
            {...props}
        >
            {children}
        </div>
    );
};
