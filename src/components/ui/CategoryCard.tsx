import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
    name: string;
    icon: LucideIcon;
    onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, icon: Icon, onClick }) => {
    return (
        <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="card flex flex-col items-center justify-center gap-4 p-6 sm:p-8 cursor-pointer w-full group"
        >
            <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-border">
                <Icon className="w-7 h-7" />
            </div>
            <span className="font-bold text-text-primary text-center group-hover:text-primary transition-colors duration-300">
                {name}
            </span>
        </motion.button>
    );
};
