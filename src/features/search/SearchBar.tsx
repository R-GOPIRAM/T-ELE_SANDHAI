import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export default function SearchBar({ isMobile = false, onClose }: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        { id: '1', title: 'iPhone 15 Pro', category: 'Smartphones' },
        { id: '2', title: 'MacBook Air M2', category: 'Laptops' },
        { id: '3', title: 'Sony WH-1000XM5', category: 'Audio' },
        { id: '4', title: 'Samsung Galaxy Watch 6', category: 'Wearables' },
    ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsFocused(false);
            if (onClose) onClose();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative z-50 ${isMobile ? 'w-full' : 'flex-1 max-w-2xl mx-6 hidden md:block'}`}>
            <form onSubmit={handleSearch} className="relative z-50">
                <div className={`relative flex items-center w-full h-11 rounded-2xl bg-background/80 border border-border overflow-hidden transition-all duration-300 ${isFocused ? 'bg-card ring-2 ring-primary-500 border-primary-500 shadow-lg' : 'hover:bg-border/50'}`}>
                    <div className="pl-4 pr-2 text-text-secondary">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search local electronics shops..."
                        value={searchQuery}
                        onFocus={() => setIsFocused(true)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-full bg-transparent text-sm text-text-primary outline-none placeholder-gray-500 font-medium"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="p-2 text-text-secondary/50 hover:text-text-secondary mr-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="h-full px-5 bg-primary-500 hover:bg-primary text-white font-bold transition-colors text-sm shadow-inner"
                    >
                        Search
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {isFocused && (searchQuery || suggestions.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-card border border-border shadow-2xl rounded-2xl z-[100] overflow-hidden py-2"
                    >
                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-secondary/50 mb-1">
                            {searchQuery ? 'Suggestions' : 'Trending Now'}
                        </div>
                        {suggestions.length > 0 ? (
                            suggestions.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setSearchQuery(item.title);
                                        navigate(`/products?search=${encodeURIComponent(item.title)}`);
                                        setIsFocused(false);
                                        if (onClose) onClose();
                                    }}
                                    className="px-4 py-3 hover:bg-primary/10 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Search className="h-4 w-4 text-text-secondary/50 group-hover:text-primary-500" />
                                        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{item.title}</span>
                                    </div>
                                    <span className="text-[10px] bg-background text-text-secondary px-2 py-0.5 rounded-full font-bold uppercase group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        {item.category}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-text-secondary/50 italic text-sm">
                                No local matches found for "{searchQuery}"
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
