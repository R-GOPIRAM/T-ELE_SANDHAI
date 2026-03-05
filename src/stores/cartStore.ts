import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex(
                        (item) => item.productId === product.id
                    );

                    if (existingItemIndex > -1) {
                        // Update existing item quantity
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += quantity;
                        return { items: newItems };
                    }

                    // Add new item
                    const newItem: CartItem = {
                        id: Math.random().toString(36).substr(2, 9), // UI key
                        productId: product.id,
                        quantity,
                        price: product.price,
                        product,
                        sellerId: product.sellerId
                    };

                    return { items: [...state.items, newItem] };
                });
            },

            removeItem: (itemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== itemId),
                }));
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                const items = get().items;
                return items.reduce((total, item) => {
                    const price = item.product?.price || item.price || 0;
                    return total + price * item.quantity;
                }, 0);
            },

            getTotalItems: () => {
                const items = get().items;
                return items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage', // Key in localStorage
            // partialize: (state) => ({ items: state.items }), // Option to save only items
        }
    )
);
