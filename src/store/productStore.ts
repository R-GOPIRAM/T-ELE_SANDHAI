import { create } from 'zustand';
import { Product } from '../types';
import api from '../services/apiClient';
import { toast } from 'react-hot-toast';

interface ProductState {
    products: Product[];
    total: number;
    loading: boolean;
    lastFetched: number | null;
    fetchProducts: (params: Record<string, unknown>, force?: boolean) => Promise<void>;
    clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let abortController: AbortController | null = null;

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    total: 0,
    loading: false,
    lastFetched: null,

    fetchProducts: async (params: Record<string, unknown>, force = false) => {
        const { lastFetched, products } = get();
        const now = Date.now();

        // Use cache if available and fresh
        if (!force && lastFetched && (now - lastFetched < CACHE_DURATION) && products.length > 0 && !params.search && !params.category) {
            return;
        }

        // Abort previous request
        if (abortController) {
            abortController.abort();
        }
        abortController = new AbortController();

        set({ loading: true });
        try {
            const { data } = await api.get('/products', {
                params,
                signal: abortController.signal
            });

            const productsData = data.data?.products || data.data || [];
            const totalData = data.data?.total || data.total || 0;

            if (params.page === 1) {
                set({
                    products: productsData,
                    total: totalData,
                    lastFetched: now,
                });
            } else {
                set({
                    products: [...get().products, ...productsData],
                    total: totalData,
                });
            }
        } catch (err) {
            const error = err as { name?: string; response?: { data?: { message?: string } } };
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                return; // Ignore aborted requests
            }
            const message = error.response?.data?.message || 'Failed to fetch products';
            toast.error(message);
        } finally {
            set({ loading: false });
        }
    },

    clearCache: () => set({ products: [], total: 0, lastFetched: null })
}));
