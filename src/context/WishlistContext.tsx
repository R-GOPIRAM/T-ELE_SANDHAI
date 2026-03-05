import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface WishlistItem {
    product: {
        _id: string;
        id?: string;
        name: string;
        price: number;
        originalPrice?: number;
        images: string[];
        brand: string;
        rating: number;
        sellerName: string;
    };
    addedAt: string;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    isLoading: boolean;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Note: ideally we fetch this when the user logs in. 
    // For now, fetch on mount if token exists.
    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const { data } = await api.get('/wishlist');
                if (data.success && data.data) {
                    setWishlistItems(data.data.items);
                }
            } catch (error) {
                console.error('Failed to fetch wishlist', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    const addToWishlist = async (productId: string) => {
        try {
            const { data } = await api.post('/wishlist', { productId });
            if (data.success) {
                setWishlistItems(data.data.items);
                toast.success('Added to wishlist❤️');
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error('Please login to add to wishlist');
            } else {
                toast.error('Failed to add to wishlist');
            }
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            const { data } = await api.delete(`/wishlist/${productId}`);
            if (data.success) {
                setWishlistItems(data.data.items);
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.some(item => (item.product.id === productId || item.product._id === productId));
    };

    return (
        <WishlistContext.Provider
            value={{ wishlistItems, isLoading, addToWishlist, removeFromWishlist, isInWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
