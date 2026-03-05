import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import Button from '../common/Button';

interface OrderConfirmationPageProps {
    onPageChange: (page: string) => void;
}

export default function OrderConfirmationPage({ onPageChange }: OrderConfirmationPageProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your order has been placed successfully and is being processed.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => onPageChange('my-orders')}
                        className="w-full justify-center"
                        icon={ShoppingBag}
                    >
                        View My Orders
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => onPageChange('home')}
                        className="w-full justify-center"
                        icon={Home}
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
