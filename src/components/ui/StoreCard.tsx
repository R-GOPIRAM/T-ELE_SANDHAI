import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Store } from 'lucide-react';

interface StoreCardProps {
    name: string;
    logoUrl?: string;
    rating: number;
    location: string;
    productCount: number;
    onClick?: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ name, logoUrl, rating, location, productCount, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={onClick}
            className="flex flex-col bg-card rounded-3xl p-6 cursor-pointer group shadow-sm hover:shadow-2xl transition-all duration-300 border border-border"
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden group-hover:shadow-primary/20 transition-colors">
                    {logoUrl ? (
                        <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-black text-text-primary text-xl truncate group-hover:text-primary transition-colors tracking-tight">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 bg-warning/10 w-fit px-2 py-0.5 rounded text-warning">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-[11px]">{rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-secondary font-bold uppercase tracking-widest mt-auto">
                <div className="flex items-center gap-1.5 truncate max-w-[55%]">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{location}</span>
                </div>
                <div className="bg-primary/10 text-primary px-2 py-1 rounded">
                    {productCount} Items
                </div>
            </div>
        </motion.div>
    );
};
