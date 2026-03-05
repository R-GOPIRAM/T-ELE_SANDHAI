import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, ShieldCheck, Lock } from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentPageProps {
  onPageChange: (page: string) => void;
  orderId?: string; // We are re-purposing this screen to just handle payment execution right after cart checkout
}

export default function PaymentPage({ onPageChange }: PaymentPageProps) {
  const { user } = useAuth();
  const [orderTotal, setOrderTotal] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);

  const [checkoutInfo, setCheckoutInfo] = useState<any>(null);

  useEffect(() => {
    // In a real flow, the Cart or Checkout page would pass the final assembled checkout data.
    // To adapt the existing code seamlessly, we will pull it from localStorage/mock for the final payment step.
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const info = JSON.parse(localStorage.getItem('checkoutInfo') || '{}');

    setCartItems(cart);
    setCheckoutInfo(info);
    const total = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    // Add tax/shipping logic if necessary
    const deliveryFee = info.deliveryType === 'delivery' ? 50 : 0;
    setOrderTotal(total + deliveryFee);
  }, []);

  const handleOpenRazorpay = async () => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK failing to load. Check your internet connection.');
      return;
    }

    if (orderTotal <= 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setLoadingRazorpay(true);

    try {
      // 1. Create Order on Backend
      const { data: orderResponse } = await api.post('/payment/create-order', {
        amount: orderTotal
      });

      const { id: razorpayOrderId, currency, amount } = orderResponse.data;

      // 2. Initialize Razorpay Checkout Options
      const options = {
        key: 'rzp_test_mock_key_id_123', // In production, this should ideally be passed from backend or env
        amount: amount.toString(),
        currency: currency,
        name: 'T-ELE Sandhai',
        description: 'Secure E-Commerce Transaction',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=200',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          // 3. Callback upon successful payment
          toast.loading('Verifying secure payment...', { id: 'payment-verification' });

          try {
            // Data to save the final MongoDB Order document along with cryptographic proof
            const verificationPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                items: cartItems,
                totalAmount: orderTotal,
                shippingAddress: {
                  street: checkoutInfo?.addressForm?.street || '123 Verified Lane',
                  city: checkoutInfo?.addressForm?.city || 'TechCity',
                  state: checkoutInfo?.addressForm?.state || 'State',
                  zipCode: checkoutInfo?.addressForm?.zipCode || '100001',
                  country: checkoutInfo?.addressForm?.country || 'India',
                  phone: checkoutInfo?.customerDetails?.phone || '9999999999'
                }
              }
            };

            await api.post('/payment/verify', verificationPayload);

            toast.success('Payment cryptographically verified and order placed!', { id: 'payment-verification' });
            setPaymentStatus('success');
            localStorage.removeItem('cart'); // Clear cart on success
            localStorage.removeItem('checkoutInfo');

            setTimeout(() => {
              onPageChange('order-confirmation');
            }, 2500);

          } catch (verifyError: any) {
            toast.error(verifyError.response?.data?.message || 'Payment verification failed', { id: 'payment-verification' });
          }
        },
        prefill: {
          name: checkoutInfo?.customerDetails?.name || user?.name || "Customer",
          email: checkoutInfo?.customerDetails?.email || user?.email || "customer@example.com",
          contact: checkoutInfo?.customerDetails?.phone || "9999999999"
        },
        theme: {
          color: "#2563EB" // Blue-600 to match theme
        }
      };

      // If we are using the fallback dummy key, simulate the Razorpay popup success
      if (options.key === 'rzp_test_mock_key_id_123') {
        toast.success("Development Mode: Simulating Razorpay Checkout...");
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: `mock_pay_id_${Date.now()}`,
            razorpay_order_id: razorpayOrderId,
            razorpay_signature: `mock_signature_${Date.now()}`
          });
        }, 1500);
        return;
      }

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment gateway');
      console.error(error);
    } finally {
      setLoadingRazorpay(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-green-100 p-10 text-center animate-fade-in-up">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto relative z-10 bg-white rounded-full" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Payment Secured!</h2>
            <p className="text-gray-500 mb-6 font-medium">Your cryptographic signature was verified.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100 text-left">
              <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
              <p className="text-2xl font-bold text-gray-900">₹{orderTotal.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex justify-center flex-col gap-3">
              <Button onClick={() => onPageChange('browse')} className="w-full h-12 rounded-xl text-lg font-bold">Continue Shopping</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <button
          onClick={() => onPageChange('cart')}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Cart</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sm:p-12 border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Secure Checkout</h1>
            <p className="text-gray-500 text-center mb-10 font-medium">You are about to be redirected to Razorpay's encrypted payment gateway.</p>

            {/* Order Summary Box */}
            <div className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-10 shadow-inner">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 border-dashed">
                <span className="text-gray-600 font-semibold">Subtotal ({cartItems.length} items)</span>
                <span className="text-xl font-bold text-gray-900">₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 border-dashed">
                <span className="text-gray-600 font-semibold flex items-center gap-1">Fast Shipping</span>
                <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-900 font-extrabold text-lg">Total to Pay</span>
                <span className="text-4xl font-extrabold text-blue-600">₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 w-full gap-4 mb-10">
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl justify-center text-gray-600">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <span className="text-sm font-bold">256-bit SSL</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl justify-center text-gray-600">
                <Lock className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-bold">PCI Compliant</span>
              </div>
            </div>

            <Button
              onClick={handleOpenRazorpay}
              disabled={loadingRazorpay || orderTotal === 0}
              className="w-full h-16 rounded-2xl text-xl font-extrabold shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              {loadingRazorpay ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  Initializing Gateway...
                </>
              ) : (
                `Pay ₹${orderTotal.toLocaleString('en-IN')} Securely`
              )}
            </Button>

            <p className="text-xs text-center text-gray-400 font-medium mt-6 mt-4 flex items-center justify-center gap-1">
              Powered by <span className="font-bold text-gray-600 text-sm tracking-widest uppercase">Razorpay</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
