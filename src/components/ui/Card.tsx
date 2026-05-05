import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export function Card({ className, children, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={twMerge(
                clsx(
                    'bg-card border border-border rounded-3xl shadow-sm overflow-hidden transition-all duration-300',
                    onClick && 'cursor-pointer hover:shadow-xl hover:-translate-y-1',
                    className
                )
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={twMerge(clsx("flex flex-col space-y-1.5 p-6", className))}
            {...props}
        />
    );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={twMerge(clsx("text-lg font-heading font-semibold leading-none tracking-tight text-text-primary", className))}
            {...props}
        />
    );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={twMerge(clsx("text-sm text-text-secondary", className))}
            {...props}
        />
    );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={twMerge(clsx("p-6 pt-0", className))} {...props} />
    );
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={twMerge(clsx("flex items-center p-6 pt-0", className))}
            {...props}
        />
    );
}
