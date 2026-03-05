import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, CreditCard, Truck, Store, ArrowLeft } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

interface CartPageProps {
  onPageChange: (page: string) => void;
}

export default function CartPage({ onPageChange }: CartPageProps) {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Structured address state
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: ''
  });

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || '',
    phone: '',
    email: user?.email || ''
  });

  // Ensure items have product details
  const validItems = items.filter(item => item.product);

  // Group items by seller
  const itemsBySeller = validItems.reduce((acc, item) => {
    const product = item.product!;
    // Fallback if seller info is missing in product type for now, but backend sends it
    // We might need to fetch seller details or store them in product object
    // For now assuming product has sellerId and sellerName (from populated backend response)
    const sellerId = product.sellerId;

    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: {
          id: sellerId,
          name: product.sellerName || 'Seller',
          location: product.sellerLocation || 'Unknown'
        },
        items: []
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { seller: { id: string; name: string; location: string }; items: typeof items }>);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      onPageChange('login');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode || !customerDetails.phone) {
        alert('Please fill in all address and contact details');
        return;
      }
    }

    if (!customerDetails.name || !customerDetails.phone) {
      alert('Please fill in all required customer details');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Save checkout data to localStorage so PaymentPage can calculate totals and build final payload
      const checkoutData = items.map(item => ({ ...item.product, quantity: item.quantity, price: item.price }));
      localStorage.setItem('cart', JSON.stringify(checkoutData));
      localStorage.setItem('checkoutInfo', JSON.stringify({
        addressForm,
        customerDetails,
        deliveryType,
        paymentMethod
      }));

      // Navigate to PaymentPage to initialize Razorpay logic
      onPageChange('payment');
    } catch (error: any) {
      console.error('Checkout failed', error);
      alert('Failed to initialize checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const deliveryFee = deliveryType === 'delivery' ? 50 : 0;
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Button
              onClick={() => onPageChange('browse')}
              size="lg"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => onPageChange('browse')}
            className="mb-4"
          >
            Continue Shopping
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.values(itemsBySeller).map((sellerGroup) => (
              <div key={sellerGroup.seller.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Seller Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Store className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{sellerGroup.seller.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {sellerGroup.seller.location}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {sellerGroup.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.product!.images[0]}
                          alt={item.product!.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.product!.name}</h4>
                          <p className="text-gray-600 text-sm">{item.product!.brand}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{item.price.toLocaleString()}
                            </span>
                            {item.product!.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₹{item.product!.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            disabled={item.quantity >= item.product!.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center mt-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.quantity >= item.product!.stock && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-yellow-800 text-sm">
                            Only {item.product!.stock} units available in stock
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Checkout Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              {user && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Delivery Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value as 'delivery')}
                      className="mr-3"
                    />
                    <Truck className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Home Delivery</div>
                      <div className="text-sm text-gray-600">₹50 delivery fee</div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value as 'pickup')}
                      className="mr-3"
                    />
                    <Store className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Store Pickup</div>
                      <div className="text-sm text-gray-600">Free pickup from store</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Delivery Address */}
              {deliveryType === 'delivery' && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Street Address *"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City *"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Zip Code *"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                <div className="space-y-2">
                  {[
                    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    { value: 'upi', label: 'UPI Payment', icon: CreditCard },
                    { value: 'cod', label: 'Cash on Delivery', icon: CreditCard }
                  ].map((method) => (
                    <label key={method.value} className="flex items-center p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <method.icon className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                loading={isCheckingOut}
                disabled={!user}
                className="w-full"
                size="lg"
              >
                {!user ? 'Login to Checkout' : 'Place Order'}
              </Button>

              {!user && (
                <p className="text-center text-sm text-gray-600 mt-3">
                  <button
                    onClick={() => onPageChange('login')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </button>
                  {' '}to continue with checkout
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}