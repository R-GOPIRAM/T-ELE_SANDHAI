import React from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
    // Use to trigger re-animation on route change if needed
    pageKey?: string;
}

export function Layout({ children, className = '', pageKey }: LayoutProps) {
    return (
        <motion.main
            key={pageKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-8 pb-24 md:pb-8 ${className}`}
        >
            {children}
        </motion.main>
    );
}
