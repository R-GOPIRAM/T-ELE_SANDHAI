import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/apiClient';
import { Product, CartItem } from '../types';
import { toast } from 'react-hot-toast';

interface CartApiItem {
    productId: Product & { _id: string };
    quantity: number;
    price: number;
    sellerId?: string;
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    error: string | null;
    fetchCart: () => Promise<void>;
    addItem: (product: Product, quantity?: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    mergeLocalCart: () => Promise<void>;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            error: null,

            fetchCart: async () => {
                set({ isLoading: true });
                try {
                    const { data } = await api.get('/cart');
                    const formattedItems: CartItem[] = data.data.items.map((item: CartApiItem) => ({
                        id: item.productId._id,
                        productId: item.productId._id,
                        quantity: item.quantity,
                        price: item.price,
                        product: item.productId,
                        sellerId: item.sellerId
                    }));
                    set({ items: formattedItems, isLoading: false, error: null });
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    const message = error.response?.data?.message || 'Failed to fetch cart';
                    set({ isLoading: false, error: message });
                    toast.error(message);
                }
            },

            addItem: async (product, quantity = 1) => {
                const previousItems = get().items;
                const productId = product.id || (product as unknown as { _id: string })._id;

                // Optimistic update
                set((state) => {
                    const existingItemIndex = state.items.findIndex(item => item.productId === productId);
                    if (existingItemIndex > -1) {
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += quantity;
                        return { items: newItems };
                    }
                    const newItem: CartItem = {
                        id: productId,
                        productId,
                        quantity,
                        price: product.price,
                        product,
                        sellerId: product.sellerId || (product as unknown as { shopOwnerId: string }).shopOwnerId
                    };
                    return { items: [...state.items, newItem] };
                });

                try {
                    await api.post('/cart', { productId, quantity });
                    set({ error: null });
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    set({ items: previousItems }); // Rollback
                    const message = error.response?.data?.message || 'Failed to add item to cart';
                    set({ error: message });
                    toast.error(message);
                    get().fetchCart(); // Final sync
                }
            },

            removeItem: async (productId) => {
                const previousItems = get().items;
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                }));

                try {
                    await api.delete(`/cart/${productId}`);
                    set({ error: null });
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    set({ items: previousItems }); // Rollback
                    const message = error.response?.data?.message || 'Failed to remove item';
                    set({ error: message });
                    toast.error(message);
                    get().fetchCart();
                }
            },

            updateQuantity: async (productId, quantity) => {
                if (quantity <= 0) return get().removeItem(productId);

                const previousItems = get().items;
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
                    ),
                }));

                try {
                    await api.put(`/cart/${productId}`, { quantity });
                    set({ error: null });
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    set({ items: previousItems }); // Rollback
                    const message = error.response?.data?.message || 'Failed to update quantity';
                    set({ error: message });
                    toast.error(message);
                    get().fetchCart();
                }
            },

            clearCart: async () => {
                const previousItems = get().items;
                set({ items: [], isLoading: true });
                try {
                    await api.delete('/cart');
                    set({ isLoading: false, error: null });
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    set({ items: previousItems, isLoading: false });
                    const message = error.response?.data?.message || 'Failed to clear cart';
                    toast.error(message);
                }
            },

            mergeLocalCart: async () => {
                const { items } = get();
                if (items.length === 0) return get().fetchCart();

                set({ isLoading: true });
                try {
                    const { data } = await api.post('/cart/merge', {
                        items: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity
                        }))
                    });

                    const formattedItems: CartItem[] = data.data.items.map((item: CartApiItem) => ({
                        id: item.productId._id,
                        productId: item.productId._id,
                        quantity: item.quantity,
                        price: item.price,
                        product: item.productId,
                        sellerId: item.sellerId
                    }));
                    set({ items: formattedItems, isLoading: false, error: null });
                    toast.success('Cart merged successfully');
                } catch (err) {
                    const error = err as { response?: { data?: { message?: string } } };
                    set({ isLoading: false });
                    const message = error.response?.data?.message || 'Failed to merge cart';
                    toast.error(message);
                    get().fetchCart();
                }
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const price = item.product?.price || item.price || 0;
                    return total + price * item.quantity;
                }, 0);
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items }),
        }
    )
);

