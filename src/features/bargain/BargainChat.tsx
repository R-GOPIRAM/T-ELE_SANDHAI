import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, X, Store, User, Clock as ClockIcon, Sparkles, ShieldCheck, MoreVertical, Handshake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bargain, bargainService } from '../../services/bargainService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { useSocket } from '../../hooks/useSocket';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IndianRupee } from 'lucide-react';

interface BargainChatProps {
    bargainId: string;
}

export default function BargainChat({ bargainId }: BargainChatProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const socket = useSocket();
    const [bargain, setBargain] = useState<Bargain | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [priceOffer, setPriceOffer] = useState<string>('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchBargain = React.useCallback(async () => {
        try {
            const { data } = await bargainService.getDetails(bargainId);
            setBargain(data.data);
        } catch (_error) {
            console.error('Failed to fetch chat', _error);
        } finally {
            setLoading(false);
        }
    }, [bargainId]);

    useEffect(() => {
        fetchBargain();

        if (socket) {
            socket.emit('join_bargain', bargainId);

            socket.on('offer_updated', (updatedBargain: Bargain) => {
                setBargain(updatedBargain);
                if (updatedBargain.chatMessages[updatedBargain.chatMessages.length - 1].senderRole !== (user?.role === 'seller' ? 'seller' : 'customer')) {
                    toast('New counter offer received!', { icon: '💰' });
                }
            });

            socket.on('status_updated', (updatedBargain: Bargain) => {
                setBargain(updatedBargain);
                toast(`Negotiation ${updatedBargain.status}`, { icon: '📢' });
            });

            return () => {
                socket.emit('leave_bargain', bargainId);
                socket.off('offer_updated');
                socket.off('status_updated');
            };
        }
    }, [bargainId, socket, fetchBargain, user?.role]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [bargain?.chatMessages, bargain?.status]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !priceOffer) return;

        if (socket) {
            socket.emit('send_offer', {
                bargainId,
                message: newMessage || 'Sent a new offer',
                offeredPrice: priceOffer ? Number(priceOffer) : undefined
            });
            setNewMessage('');
            setPriceOffer('');
        } else {
            setSending(true);
            try {
                await bargainService.sendMessage(
                    bargainId,
                    newMessage || 'Sent a new offer',
                    priceOffer ? Number(priceOffer) : undefined
                );
                setNewMessage('');
                setPriceOffer('');
                fetchBargain();
            } catch (_error) {
                toast.error('Failed to send message');
            } finally {
                setSending(false);
            }
        }
    };

    const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
        if (socket) {
            socket.emit('update_bargain_status', { bargainId, status });
        } else {
            try {
                await bargainService.updateStatus(bargainId, status);
                fetchBargain();
            } catch (_error) {
                toast.error(`Failed to ${status} offer`);
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col h-[700px] w-full bg-card rounded-[2.5rem] shadow-sm border border-border items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-text-secondary/50 font-black uppercase tracking-widest text-[10px]">Syncing encryption...</p>
        </div>
    );

    if (!bargain) return (
        <div className="flex flex-col h-[700px] w-full bg-card rounded-[2.5rem] shadow-sm border border-border items-center justify-center">
            <p className="text-text-secondary font-bold">Negotiation session not found.</p>
        </div>
    );

    const isSeller = user?.role === 'seller';
    const isFinalized = ['accepted', 'rejected', 'expired'].includes(bargain.status);
    const isMyTurnToAct = ((isSeller && bargain.status === 'pending') || (!isSeller && bargain.status === 'countered'));

    return (
        <div className="flex flex-col h-[700px] w-full bg-card rounded-[2.5rem] shadow-2xl shadow-border/50 border border-border overflow-hidden relative">

            {/* Header: Immersive Chat Top Bar */}
            <div className="bg-card/80 backdrop-blur-xl p-6 border-b border-gray-50 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl flex items-center justify-center text-primary shadow-inner group relative">
                        {isSeller ? <User className="w-7 h-7" /> : <Store className="w-7 h-7" />}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-seller rounded-full border-2 border-card" />
                    </div>
                    <div>
                        <h3 className="font-black text-text-primary text-lg leading-none mb-1.5">{bargain.productId.name}</h3>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[9px] py-0 border-border text-text-secondary/50">ID: {bargainId.slice(-6)}</Badge>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <IndianRupee className="w-3 h-3" /> {bargain.offeredPrice.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${bargain.status === 'accepted' ? 'bg-seller/10 text-seller-hover border-seller/20' :
                        bargain.status === 'rejected' ? 'bg-danger/10 text-red-700 border-red-100' :
                            'bg-accent-50 text-accent-700 border-accent-100 animate-pulse'
                        }`}>
                        {bargain.status}
                    </div>
                    <button className="p-2.5 hover:bg-background rounded-xl transition-colors text-text-secondary/50">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Price Gauge: Visual Negotiation Status */}
            <div className="bg-background/50 px-6 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
                    <ClockIcon className="w-3.5 h-3.5" />
                    History
                </div>
                <div className="flex-1 max-w-[200px] h-1.5 bg-border rounded-full mx-4 relative overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (bargain.offeredPrice / bargain.originalPrice) * 100)}%` }}
                        className="h-full bg-primary-500 rounded-full"
                    />
                </div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                    {Math.round((1 - bargain.offeredPrice / bargain.originalPrice) * 100)}% Discount
                </div>
            </div>

            {/* Scrollable Message History */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-[0.98]">
                <div className="text-center">
                    <span className="inline-flex items-center gap-2 bg-card/80 backdrop-blur shadow-sm border border-border text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full text-text-secondary/50">
                        <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted Secure Channel
                    </span>
                </div>

                <AnimatePresence initial={false}>
                    {bargain.chatMessages.map((msg, idx) => {
                        const isMyMessage = msg.senderRole === (isSeller ? 'seller' : 'customer');
                        const isLatestMessage = idx === bargain.chatMessages.length - 1;

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`flex flex-col w-full ${isMyMessage ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[75%]`}>
                                    {!isMyMessage && (
                                        <div className="w-10 h-10 rounded-2xl bg-background flex items-center justify-center shrink-0 mb-1 shadow-sm font-black text-xs text-text-secondary/50">
                                            {msg.senderRole[0].toUpperCase()}
                                        </div>
                                    )}

                                    <div className={`relative px-6 py-5 shadow-xl transition-all ${isMyMessage
                                        ? 'bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-3xl rounded-br-md shadow-primary/10'
                                        : 'bg-card border border-border text-text-primary rounded-3xl rounded-bl-md shadow-gray-200/30'
                                        }`}>

                                        {msg.offeredPrice && (
                                            <div className={`mb-4 p-4 rounded-2xl border ${isMyMessage ? 'bg-card/10 border-card/10' : 'bg-primary/10/50 border-primary/20'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isMyMessage ? 'text-primary-100' : 'text-primary'}`}>New Price Offer</span>
                                                    <Sparkles className={`w-3.5 h-3.5 ${isMyMessage ? 'text-primary-200' : 'text-primary-400'}`} />
                                                </div>
                                                <div className={`text-3xl font-black ${isMyMessage ? 'text-white' : 'text-text-primary'}`}>
                                                    ₹{msg.offeredPrice.toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-base leading-relaxed font-medium">{msg.message}</p>

                                        <div className={`flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-widest ${isMyMessage ? 'text-primary-100 opacity-60' : 'text-text-secondary/50'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMyMessage && <Check className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Contextual Inline Actions */}
                                {isLatestMessage && !isMyMessage && isMyTurnToAct && !isFinalized && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 flex gap-3 ml-12"
                                    >
                                        <Button
                                            size="md"
                                            variant="success"
                                            onClick={() => handleStatusUpdate('accepted')}
                                            className="px-8 font-black rounded-2xl shadow-xl shadow-success-500/20"
                                        >
                                            <Handshake className="w-5 h-5 mr-2" />
                                            Accept Deal
                                        </Button>
                                        <Button
                                            size="md"
                                            variant="outline"
                                            onClick={() => handleStatusUpdate('rejected')}
                                            className="bg-card border-2 border-red-100 text-danger hover:bg-danger/10 rounded-2xl font-black"
                                        >
                                            <X className="w-5 h-5 mr-2" />
                                            Reject
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input / Composition Area */}
            {!isFinalized ? (
                <div className="bg-card p-6 relative z-30 border-t border-gray-50">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-4 p-2 pl-4 bg-background/50 rounded-[2rem] border-2 border-primary-50 focus-within:bg-card focus-within:border-primary/50 focus-within:shadow-2xl transition-all duration-500">
                        {/* Price Input */}
                        <div className="relative group shrink-0 py-2">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xl">₹</div>
                            <input
                                type="number"
                                placeholder="Counter"
                                value={priceOffer}
                                onChange={e => setPriceOffer(e.target.value)}
                                className="w-24 sm:w-32 pl-10 pr-4 py-4 bg-card border-2 border-transparent rounded-2xl focus:border-primary/20 outline-none font-black text-xl text-text-primary placeholder:font-bold placeholder:text-text-secondary/30 transition-all"
                            />
                        </div>

                        <div className="w-1 h-12 bg-primary/20 rounded-full my-auto opacity-30" />

                        {/* Text input */}
                        <div className="flex-1 py-1">
                            <input
                                type="text"
                                placeholder="Write your message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                className="w-full px-4 py-4 bg-transparent border-0 focus:outline-none text-text-primary font-bold placeholder:text-text-secondary/50 text-lg"
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={sending || (!newMessage && !priceOffer)}
                            className="w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 group"
                        >
                            <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-background p-8 border-t border-border text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-500 via-primary-500 to-indigo-500 opacity-50" />
                    <h3 className="text-2xl font-black text-text-primary mb-2 flex items-center justify-center gap-3">
                        {bargain.status === 'accepted' ? <Handshake className="w-8 h-8 text-seller" /> : <X className="w-8 h-8 text-danger" />}
                        Deal {bargain.status.toUpperCase()}
                    </h3>
                    {bargain.status === 'accepted' ? (
                        <div className="space-y-6">
                            <p className="text-text-secondary font-bold">Successfully negotiated at <span className="text-3xl font-black text-seller bg-seller/10 px-4 py-1 rounded-2xl ml-2">₹{bargain.finalPrice}</span></p>
                            {!isSeller && (
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/cart')}
                                    className="bg-gray-900 text-white hover:bg-black px-12 py-7 rounded-[2rem] font-black text-xl shadow-2xl"
                                >
                                    Proceed to Checkout
                                </Button>
                            )}
                        </div>
                    ) : (
                        <p className="text-text-secondary/50 font-black uppercase tracking-widest text-xs">This negotiation thread is closed.</p>
                    )}
                </div>
            )}
        </div>
    );
}


