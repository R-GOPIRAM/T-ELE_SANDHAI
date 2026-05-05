import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface OrderConfirmationPageProps {
    orderId?: string;
}

export default function OrderConfirmationPage({ orderId }: OrderConfirmationPageProps) {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card rounded-3xl shadow-xl p-10 text-center border border-border overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-emerald-500" />

                <div className="mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-seller/10 rounded-full flex items-center justify-center mx-auto"
                    >
                        <CheckCircle className="w-12 h-12 text-seller" />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-black text-text-primary mb-2 uppercase tracking-tight">Order Confirmed!</h1>
                {orderId && (
                    <div className="mb-6 inline-block bg-background px-4 py-2 rounded-xl border border-border">
                        <span className="text-xs font-bold text-text-secondary/50 uppercase tracking-widest block mb-1">Order Identifier</span>
                        <span className="text-sm font-black text-primary font-mono">{orderId}</span>
                    </div>
                )}
                <p className="text-text-secondary mb-10 font-medium leading-relaxed">
                    Thank you for supporting neighborhood commerce. Your order is being processed by local retailers and will be ready soon.
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={() => navigate('/dashboard/orders')}
                        className="w-full py-4 text-lg font-bold rounded-2xl group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            View My Orders
                        </span>
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-full py-4 text-lg font-bold rounded-2xl group border-2"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Return to Home
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
