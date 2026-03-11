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
            whileHover={{ y: -6, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 cursor-pointer w-full bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
        >
            {/* Background Glow on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-16 h-16 bg-background/80 rounded-2xl flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-sm border border-border group-hover:shadow-xl group-hover:shadow-primary/20 relative z-10">
                <Icon className="w-8 h-8" />
            </div>

            <span className="font-black text-text-primary text-[10px] uppercase tracking-widest text-center group-hover:text-primary transition-colors duration-500 relative z-10">
                {name}
            </span>
        </motion.button>
    );
};
