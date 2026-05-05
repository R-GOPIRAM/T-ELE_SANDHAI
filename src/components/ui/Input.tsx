import React from 'react';
import { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: LucideIcon;
    error?: string;
    containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, icon: Icon, error, containerClassName, className, ...props }, ref) => {
        return (
            <div className={twMerge(clsx("space-y-2", containerClassName))}>
                {label && (
                    <label className="block text-sm font-black text-text-secondary uppercase tracking-widest px-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {Icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50 group-focus-within:text-primary transition-colors">
                            <Icon size={20} />
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={twMerge(
                            clsx(
                                "w-full transition-all duration-300",
                                "bg-background/50 border-2 border-border rounded-2xl",
                                "py-3.5 px-4",
                                Icon && "pl-12",
                                "focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary",
                                "font-medium text-text-primary placeholder:text-text-secondary/50",
                                error && "border-danger focus:ring-danger/10 focus:border-danger",
                                className
                            )
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs font-bold text-danger px-2 animate-fade-in">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
