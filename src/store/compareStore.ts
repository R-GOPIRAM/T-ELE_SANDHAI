import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import { toast } from 'react-hot-toast';

interface CompareState {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    clearItems: () => void;
    isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const { items } = get();
                if (items.some((item) => item.id === product.id)) {
                    toast.error('Product already in comparison');
                    return;
                }
                if (items.length >= 3) {
                    toast.error('You can only compare up to 3 products');
                    return;
                }
                set({ items: [...items, product] });
                toast.success(`Added ${product.name} to comparison`);
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.id !== productId) });
            },
            clearItems: () => set({ items: [] }),
            isInCompare: (productId) => {
                return get().items.some((item) => item.id === productId);
            },
        }),
        {
            name: 'compare-storage',
        }
    )
);
