import React, { useState } from 'react';
import { X, MessageSquare, Tag, IndianRupee } from 'lucide-react';
import Button from './Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface BargainModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    productLine: {
        productId: string;
        productName: string;
        originalPrice: number;
        sellerId: string;
        image: string;
    };
}

export default function BargainModal({ isOpen, onClose, onSuccess, productLine }: BargainModalProps) {
    const [proposedPrice, setProposedPrice] = useState<number | ''>('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proposedPrice || proposedPrice <= 0) {
            toast.error('Please enter a valid proposed price');
            return;
        }

        if (proposedPrice >= productLine.originalPrice) {
            toast.error('Your offer must be lower than the current price!');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/bargain/start', {
                productId: productLine.productId,
                offeredPrice: Number(proposedPrice),
                message: message.trim() || 'I would like to negotiate the price of this product.'
            });

            toast.success('Bargain request sent successfully!');
            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send bargain request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-blue-600" />
                        Make an Offer
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <img
                            src={productLine.image || 'https://via.placeholder.com/80'}
                            alt={productLine.productName}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{productLine.productName}</h3>
                            <p className="text-sm text-gray-500 line-through">Current Price: ₹{productLine.originalPrice.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Proposed Price (₹)
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max={productLine.originalPrice - 1}
                                    value={proposedPrice}
                                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-lg text-gray-900"
                                    placeholder="Enter your offer"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Make a fair offer to increase your chances of acceptance.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message to Seller (Optional)
                            </label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    rows={3}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                    placeholder="Hi, I'm interested in buying this but..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                loading={isSubmitting}
                            >
                                Send Offer
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
