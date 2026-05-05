/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/apiClient';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

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
    refetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Use auth store user state — NOT localStorage (auth uses httpOnly cookies, no token in localStorage)
    const user = useAuthStore((state) => state.user);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

    const fetchWishlist = useCallback(async () => {
        // Only fetch once auth check is complete and user is confirmed authenticated
        if (isCheckingAuth) return;
        if (!user) {
            setWishlistItems([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.get('/wishlist');
            if (data.success && data.data) {
                setWishlistItems(data.data.items);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setIsLoading(false);
        }
    }, [user, isCheckingAuth]);

    // Fetch wishlist whenever auth state resolves (user logs in / out)
    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const addToWishlist = async (productId: string) => {
        try {
            const { data } = await api.post('/wishlist', { productId });
            if (data.success) {
                setWishlistItems(data.data.items);
                toast.success('Added to wishlist❤️');
            }
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } };
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
        } catch (_error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.some(item => (item.product.id === productId || item.product._id === productId));
    };

    return (
        <WishlistContext.Provider
            value={{ wishlistItems, isLoading, addToWishlist, removeFromWishlist, isInWishlist, refetchWishlist: fetchWishlist }}
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
