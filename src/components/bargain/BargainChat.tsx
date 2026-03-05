import { useState, useEffect, useRef } from 'react';
import { Send, Check, X } from 'lucide-react';
import { Bargain, bargainService } from '../../services/bargainService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

import { useSocket } from '../../hooks/useSocket';

interface BargainChatProps {
    bargainId: string;
    onPageChange: (page: string) => void;
}

export default function BargainChat({ bargainId, onPageChange }: BargainChatProps) {
    const { user } = useAuth();
    const socket = useSocket();
    const [bargain, setBargain] = useState<Bargain | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [priceOffer, setPriceOffer] = useState<string>('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchBargain = async () => {
        try {
            const { data } = await bargainService.getDetails(bargainId);
            setBargain(data.data);
        } catch (error) {
            console.error('Failed to fetch chat', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBargain();

        if (socket) {
            // Join the specific bargain room
            socket.emit('join_bargain', bargainId);

            // Listen for updates
            socket.on('offer_updated', (updatedBargain: Bargain) => {
                setBargain(updatedBargain);
            });

            socket.on('status_updated', (updatedBargain: Bargain) => {
                setBargain(updatedBargain);
            });

            socket.on('error', (err: { message: string }) => {
                alert(err.message);
            });

            return () => {
                socket.emit('leave_bargain', bargainId);
                socket.off('offer_updated');
                socket.off('status_updated');
                socket.off('error');
            };
        }
    }, [bargainId, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [bargain?.chatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !priceOffer) return;

        if (socket) {
            socket.emit('send_offer', {
                bargainId,
                message: newMessage || 'Sent a counter offer',
                offeredPrice: priceOffer ? Number(priceOffer) : undefined
            });
            setNewMessage('');
            setPriceOffer('');
        } else {
            // Fallback to HTTP if socket is not available
            setSending(true);
            try {
                await bargainService.sendMessage(
                    bargainId,
                    newMessage || 'Sent a counter offer',
                    priceOffer ? Number(priceOffer) : undefined
                );
                setNewMessage('');
                setPriceOffer('');
                fetchBargain();
            } catch (error) {
                alert('Failed to send message');
            } finally {
                setSending(false);
            }
        }
    };

    const handleStatusUpdate = async (status: 'accepted' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this offer?`)) return;

        if (socket) {
            socket.emit('update_bargain_status', { bargainId, status });
        } else {
            try {
                await bargainService.updateStatus(bargainId, status);
                fetchBargain();
            } catch (error) {
                alert(`Failed to ${status} offer`);
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading chat...</div>;
    if (!bargain) return <div className="p-8 text-center">Chat not found</div>;

    const isSeller = user?.role === 'seller';
    const isFinalized = ['accepted', 'rejected', 'expired'].includes(bargain.status);

    return (
        <div className="flex flex-col h-[600px] w-full bg-gray-50 rounded-lg shadow-inner">
            {/* Header */}
            <div className="bg-white p-4 border-b flex justify-between items-center rounded-t-lg">
                <div>
                    <h3 className="font-bold">{bargain.productId.name}</h3>
                    <p className="text-sm text-gray-500">Original: ₹{bargain.originalPrice} | Current Offer: <span className="text-green-600 font-bold">₹{bargain.offeredPrice}</span></p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${bargain.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    bargain.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {bargain.status.toUpperCase()}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {bargain.chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.senderRole === (isSeller ? 'seller' : 'customer') ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.senderRole === (isSeller ? 'seller' : 'customer')
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white border rounded-bl-none shadow-sm'
                            }`}>
                            <p>{msg.message}</p>
                            {msg.offeredPrice && (
                                <div className="mt-2 bg-black bg-opacity-20 p-2 rounded text-sm">
                                    <strong>Offered: ₹{msg.offeredPrice}</strong>
                                </div>
                            )}
                            <span className="text-xs opacity-70 mt-1 block text-right">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Action Bar (If active) */}
            {!isFinalized && (
                <div className="bg-white p-4 border-t">
                    {/* Accept/Reject Controls for Receiver */}
                    {((isSeller && bargain.status === 'pending') || (!isSeller && bargain.status === 'countered')) && (
                        <div className="flex gap-4 mb-4 justify-center bg-yellow-50 p-3 rounded border border-yellow-200">
                            <span className="self-center font-semibold text-yellow-800">Action Required:</span>
                            <Button onClick={() => handleStatusUpdate('accepted')} variant="primary" className="bg-green-600 hover:bg-green-700" icon={Check}>
                                Accept ₹{bargain.offeredPrice}
                            </Button>
                            <Button onClick={() => handleStatusUpdate('rejected')} variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200" icon={X}>
                                Reject
                            </Button>
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <div className="relative w-1/3">
                                <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    placeholder="Counter Offer"
                                    value={priceOffer}
                                    onChange={e => setPriceOffer(e.target.value)}
                                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="1"
                                />
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || (!newMessage && !priceOffer)}
                                    className="absolute right-2 top-1.5 p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Finalized State */}
            {isFinalized && (
                <div className="p-4 bg-gray-100 text-center text-gray-500 font-medium border-t">
                    This negotiation is {bargain.status}.
                    {bargain.status === 'accepted' && (
                        <div className="mt-2">
                            <p className="text-green-600 mb-2">Deal accepted at ₹{bargain.finalPrice}</p>
                            {!isSeller && (
                                <Button onClick={() => onPageChange('browse')}>
                                    Continue Shopping
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
