import api from './apiClient';

export interface Bargain {
    _id: string;
    productId: { _id: string; name: string; images: string[] };
    customerId: { _id: string; name: string };
    sellerId: { _id: string; name: string };
    originalPrice: number;
    offeredPrice: number;
    finalPrice?: number;
    status: 'pending' | 'countered' | 'accepted' | 'rejected' | 'expired';
    chatMessages: ChatMessage[];
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChatMessage {
    senderId: string;
    senderRole: 'customer' | 'seller';
    message: string;
    offeredPrice?: number;
    timestamp: string;
}

export const bargainService = {
    initiate: async (productId: string, offeredPrice: number, message?: string) => {
        return api.post('/bargain/start', { productId, offeredPrice, message });
    },

    sendMessage: async (bargainId: string, message: string, offeredPrice?: number) => {
        return api.post('/bargain/message', { bargainId, message, offeredPrice });
    },

    updateStatus: async (bargainId: string, status: 'accepted' | 'rejected') => {
        return api.post('/bargain/action', { bargainId, status });
    },

    getMyBargains: async () => {
        return api.get('/bargain/my');
    },

    getDetails: async (bargainId: string) => {
        return api.get(`/bargain/${bargainId}`);
    },

    getAnalytics: async () => {
        return api.get('/bargain/analytics');
    }
};
