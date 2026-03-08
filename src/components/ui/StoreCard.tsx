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
            whileHover={{ y: -6 }}
            onClick={onClick}
            className="card cursor-pointer group"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shrink-0 border border-border overflow-hidden group-hover:border-primary/50 transition-colors">
                    {logoUrl ? (
                        <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <Store className="w-8 h-8 text-text-secondary" />
                    )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-text-primary text-lg truncate group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="font-bold text-text-primary text-sm">{rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-small">
                <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{location}</span>
                </div>
                <div className="font-semibold text-text-primary">
                    {productCount} Products
                </div>
            </div>
        </motion.div>
    );
};
