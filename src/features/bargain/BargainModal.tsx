import { useState } from 'react';
import { IndianRupee, MessageSquare, Tag, Sparkles, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

import { Badge } from '../../components/ui/Badge';

const bargainSchema = z.object({
    offeredPrice: z.number().positive('Offer price must be positive'),
    message: z.string().max(200, 'Message cannot exceed 200 characters').optional(),
});

type BargainFormData = z.infer<typeof bargainSchema>;

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<BargainFormData>({
        resolver: zodResolver(bargainSchema),
        defaultValues: {
            offeredPrice: Math.floor(productLine.originalPrice * 0.9), // Suggest 10% off
            message: '',
        }
    });

    const currentOffer = watch('offeredPrice');
    const discountPercent = productLine.originalPrice > 0
        ? Math.round(((productLine.originalPrice - (Number(currentOffer) || 0)) / productLine.originalPrice) * 100)
        : 0;

    const onSubmit = async (data: BargainFormData) => {
        if (data.offeredPrice >= productLine.originalPrice) {
            toast.error('Your offer must be lower than the current price!');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/bargain/start', {
                productId: productLine.productId,
                offeredPrice: data.offeredPrice,
                message: data.message?.trim() || `I'd like to offer ₹${data.offeredPrice} for this.`
            });

            toast.success('Negotiation started! Check your dashboard.');
            if (onSuccess) onSuccess();
            else onClose();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to start negotiation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Secure Negotiation"
            width="md"
        >
            <div className="flex flex-col gap-8">
                {/* Product Summary Card */}
                <div className="flex items-center gap-6 p-6 bg-primary/10/50 rounded-3xl border border-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Tag className="w-12 h-12 rotate-12" />
                    </div>
                    <img
                        src={productLine.image || 'https://via.placeholder.com/80'}
                        alt={productLine.productName}
                        className="w-20 h-20 object-cover rounded-2xl shadow-md border-2 border-card ring-1 ring-primary-100"
                    />
                    <div className="flex-1">
                        <h3 className="font-black text-text-primary leading-tight mb-1 line-clamp-1">{productLine.productName}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-secondary/50 uppercase tracking-widest line-through">₹{productLine.originalPrice.toLocaleString('en-IN')}</span>
                            <Badge variant="primary" className="text-[10px] py-0">Verified Product</Badge>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Offer Input Block */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-sm font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-accent-500" />
                                Your Best Offer
                            </label>
                            {discountPercent > 0 && (
                                <span className={`text-xs font-black ${discountPercent > 30 ? 'text-danger-600' : 'text-seller'} animate-pulse`}>
                                    {discountPercent}% OFF
                                </span>
                            )}
                        </div>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary/50 group-focus-within:text-primary transition-colors">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <input
                                type="number"
                                {...register('offeredPrice', { valueAsNumber: true })}
                                className={`w-full pl-14 pr-6 py-5 bg-background border-2 rounded-[1.5rem] focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-black text-2xl text-text-primary transition-all ${errors.offeredPrice ? 'border-danger-500' : 'border-border'}`}
                                placeholder="0.00"
                            />
                        </div>
                        {errors.offeredPrice && (
                            <p className="text-xs font-bold text-danger-600 px-2">{errors.offeredPrice.message}</p>
                        )}
                        <p className="text-[10px] text-text-secondary/50 font-bold uppercase tracking-wider px-2 leading-relaxed">
                            Pro Tip: Be fair! Sellers are more likely to accept offers within 10-15% of the list price.
                        </p>
                    </div>

                    {/* Message Area */}
                    <div className="space-y-3">
                        <label className="text-sm font-black text-text-secondary uppercase tracking-widest px-1">
                            Pitch to Seller
                        </label>
                        <div className="relative group">
                            <MessageSquare className="absolute left-5 top-5 w-5 h-5 text-text-secondary/50 group-focus-within:text-primary transition-colors" />
                            <textarea
                                rows={3}
                                {...register('message')}
                                className="w-full pl-14 pr-6 py-5 bg-background border-2 border-border rounded-[1.5rem] focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 resize-none text-sm font-medium text-text-secondary transition-all"
                                placeholder="Why should the seller accept your price?"
                            />
                        </div>
                        {errors.message && (
                            <p className="text-xs font-bold text-danger-600 px-2">{errors.message.message}</p>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center gap-3 p-4 bg-background rounded-2xl border border-border">
                        <ShieldCheck className="w-5 h-5 text-seller shrink-0" />
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight leading-none">
                            Your negotiation is private & secured. Funds are only transferred upon your final checkout approval.
                        </span>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-border mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 py-6 rounded-2xl border-2 font-black"
                            onClick={onClose}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 py-6 rounded-2xl font-black shadow-xl shadow-primary/30"
                            isLoading={isSubmitting}
                        >
                            Submit Offer
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}


