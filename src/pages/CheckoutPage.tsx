import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Mail,
    CreditCard,
    Truck,
    Store,
    CheckCircle,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    Phone,
    User,
    Sparkles,
    ShoppingBag
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/apiClient';

const checkoutSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    deliveryType: z.enum(['delivery', 'pickup']),
    street: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    paymentMethod: z.enum(['card', 'upi', 'cod']),
}).superRefine((data, ctx) => {
    if (data.deliveryType === 'delivery') {
        if (!data.street) ctx.addIssue({ code: 'custom', message: 'Street is required for delivery', path: ['street'] });
        if (!data.city) ctx.addIssue({ code: 'custom', message: 'City is required for delivery', path: ['city'] });
        if (!data.zipCode) ctx.addIssue({ code: 'custom', message: 'ZIP Code is required for delivery', path: ['zipCode'] });
    }
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type Step = 'address' | 'payment' | 'review';

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<Step>('address');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            deliveryType: 'delivery',
            paymentMethod: 'card',
            email: user?.email || '',
            name: user?.name || '',
        }
    });

    const deliveryType = watch('deliveryType');
    const paymentMethod = watch('paymentMethod');
    const formData = watch();

    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
    }, [items, navigate]);

    const subtotal = getTotalPrice();
    const deliveryFee = deliveryType === 'delivery' ? 50 : 0;
    const total = subtotal + deliveryFee;

    const steps = [
        { id: 'address', label: 'Delivery', icon: MapPin },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'review', label: 'Review', icon: CheckCircle }
    ] as const;

    const handleNextStep = async () => {
        if (currentStep === 'address') {
            const result = await trigger(['name', 'email', 'phone', 'street', 'city', 'zipCode', 'deliveryType']);
            if (result) setCurrentStep('payment');
            else toast.error('Please fix the errors in the form');
        } else if (currentStep === 'payment') {
            setCurrentStep('review');
        }
    };

    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true);
        try {
            const orderData = {
                items: items.map(item => ({
                    product: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    seller: item.sellerId
                })),
                shippingAddress: {
                    street: data.street || 'In-store Pickup',
                    city: data.city || 'Standard',
                    zipCode: data.zipCode || '000000'
                },
                paymentInfo: {
                    method: data.paymentMethod,
                    status: data.paymentMethod === 'cod' ? 'pending' : 'completed'
                },
                deliveryType: data.deliveryType,
                totalAmount: total,
                contactPhone: data.phone
            };

            const response = await api.post('/orders', orderData);

            if (response.data.success) {
                toast.success('Order placed successfully!');
                clearCart();
                navigate('/dashboard/orders');
            } else {
                throw new Error(response.data.message || 'Failed to place order');
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } }, message?: string };
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to place order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 'payment') setCurrentStep('address');
        else if (currentStep === 'review') setCurrentStep('payment');
        else navigate('/cart');
    };

    return (
        <div className="min-h-screen bg-background pb-20 pt-8 mt-16 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-4">
                        <ShoppingBag className="w-10 h-10 text-primary" />
                        Checkout
                    </h1>
                    <Badge variant="outline" className="text-sm py-1 px-4 border-border text-text-secondary font-bold uppercase tracking-widest">
                        Express Secure Hub
                    </Badge>
                </div>

                {/* Step Indicator */}
                <div className="max-w-3xl mx-auto mb-16 relative">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 z-0 rounded-full" />
                        <motion.div
                            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{
                                width: currentStep === 'address' ? '0%' : currentStep === 'payment' ? '50%' : '100%'
                            }}
                        />

                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = steps.findIndex(s => s.id === currentStep) > idx;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                    <motion.div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 shadow-xl ${isActive ? 'bg-primary border-primary/20 text-white scale-110 shadow-primary/30' :
                                            isCompleted ? 'bg-seller border-seller/20 text-white shadow-seller/20' :
                                                'bg-card border-card text-text-secondary/50 shadow-sm'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle className="w-7 h-7" /> : <Icon className="w-6 h-6" />}
                                    </motion.div>
                                    <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-primary' : isCompleted ? 'text-seller' : 'text-text-secondary/50'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-20">

                    {/* LEFT: Step Content */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <AnimatePresence mode="wait">
                                {currentStep === 'address' && (
                                    <motion.div
                                        key="address"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-10"
                                    >
                                        <section className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm">
                                            <h2 className="text-2xl font-black text-text-primary mb-8 uppercase tracking-tighter flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><User className="w-5 h-5" /></div>
                                                Customer Profile
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input
                                                    label="Full Name"
                                                    icon={User}
                                                    {...register('name')}
                                                    error={errors.name?.message}
                                                    placeholder="Enter your name"
                                                />
                                                <Input
                                                    label="Phone Number"
                                                    icon={Phone}
                                                    {...register('phone')}
                                                    error={errors.phone?.message}
                                                    placeholder="+91 00000 00000"
                                                />
                                                <div className="md:col-span-2">
                                                    <Input
                                                        label="Email Address"
                                                        icon={Mail}
                                                        {...register('email')}
                                                        error={errors.email?.message}
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm mt-8">
                                            <h2 className="text-2xl font-black text-text-primary mb-8 uppercase tracking-tighter flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Truck className="w-5 h-5" /></div>
                                                Delivery Strategy
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                <button
                                                    type="button"
                                                    onClick={() => setValue('deliveryType', 'delivery')}
                                                    className={`p-8 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${deliveryType === 'delivery' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-background hover:bg-card hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${deliveryType === 'delivery' ? 'bg-primary text-white' : 'bg-card text-text-secondary/50 border border-border'
                                                        }`}>
                                                        <Truck className="w-7 h-7" />
                                                    </div>
                                                    <h3 className="font-black text-text-primary uppercase tracking-widest text-sm">Doorstep Delivery</h3>
                                                    <p className="text-xs text-text-secondary mt-2 font-medium leading-relaxed">Swift delivery by our verified local delivery team.</p>
                                                    <div className="mt-6 font-black text-primary">₹50.00</div>
                                                    {deliveryType === 'delivery' && (
                                                        <CheckCircle className="absolute top-6 right-6 w-6 h-6 text-primary" />
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setValue('deliveryType', 'pickup')}
                                                    className={`p-8 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${deliveryType === 'pickup' ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-background hover:bg-card hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${deliveryType === 'pickup' ? 'bg-primary text-white' : 'bg-card text-text-secondary/50 border border-border'
                                                        }`}>
                                                        <Store className="w-7 h-7" />
                                                    </div>
                                                    <h3 className="font-black text-text-primary uppercase tracking-widest text-sm">Direct Store Pickup</h3>
                                                    <p className="text-xs text-text-secondary mt-2 font-medium leading-relaxed">Collect from your local merchant and skip shipping.</p>
                                                    <div className="mt-6 font-black text-seller uppercase tracking-widest text-[10px]">Complementary</div>
                                                    {deliveryType === 'pickup' && (
                                                        <CheckCircle className="absolute top-6 right-6 w-6 h-6 text-primary" />
                                                    )}
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {deliveryType === 'delivery' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-6 pt-4 border-t border-border overflow-hidden"
                                                    >
                                                        <Input
                                                            label="Precision Address"
                                                            icon={MapPin}
                                                            {...register('street')}
                                                            error={errors.street?.message}
                                                            placeholder="Flat, Building, Street Info"
                                                        />
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <Input
                                                                label="City"
                                                                {...register('city')}
                                                                error={errors.city?.message}
                                                                placeholder="Location City"
                                                            />
                                                            <Input
                                                                label="ZIP Code"
                                                                {...register('zipCode')}
                                                                error={errors.zipCode?.message}
                                                                placeholder="Postal code"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </section>
                                    </motion.div>
                                )}

                                {currentStep === 'payment' && (
                                    <motion.div
                                        key="payment"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-10"
                                    >
                                        <section className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm">
                                            <h2 className="text-2xl font-black text-text-primary mb-8 uppercase tracking-tighter flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><CreditCard className="w-5 h-5" /></div>
                                                Payment Method
                                            </h2>

                                            <div className="grid grid-cols-1 gap-4">
                                                {[
                                                    { id: 'card', name: 'Premium Card Flow', desc: 'Securely pay via Credit or Debit Card', icon: CreditCard },
                                                    { id: 'upi', name: 'Instant UPI', desc: 'GPay, PhonePe, or BHIM', icon: ShieldCheck },
                                                    { id: 'cod', name: 'Standard Cash Flow', desc: 'Pay on arrival at your door', icon: Truck }
                                                ].map((method) => (
                                                    <button
                                                        key={method.id}
                                                        type="button"
                                                        onClick={() => setValue('paymentMethod', method.id as 'card' | 'upi' | 'cod')}
                                                        className={`w-full p-8 rounded-3xl border-2 flex items-center gap-8 transition-all hover:shadow-xl ${paymentMethod === method.id ? 'border-primary bg-primary/5 shadow-primary/10' : 'border-border bg-background hover:bg-card hover:border-primary/50'
                                                            }`}
                                                    >
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === method.id ? 'bg-primary text-white shadow-lg' : 'bg-card text-text-secondary/50 border border-border'
                                                            }`}>
                                                            <method.icon className="w-8 h-8" />
                                                        </div>
                                                        <div className="text-left flex-1">
                                                            <h3 className="font-black text-text-primary uppercase tracking-widest text-sm">{method.name}</h3>
                                                            <p className="text-xs text-text-secondary mt-1 font-medium">{method.desc}</p>
                                                        </div>
                                                        {paymentMethod === method.id && (
                                                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                                                                <CheckCircle className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        <div className="bg-text-primary rounded-[2.5rem] p-10 text-card relative overflow-hidden group shadow-2xl">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                                <ShieldCheck className="w-32 h-32" />
                                            </div>
                                            <div className="relative flex items-center gap-8">
                                                <div className="w-20 h-20 bg-card/10 backdrop-blur rounded-3xl flex items-center justify-center shrink-0">
                                                    <ShieldCheck className="w-10 h-10 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black uppercase tracking-widest mb-2">Vault Security</h4>
                                                    <p className="text-sm text-card/70 font-medium leading-relaxed">Transactions are cryptographically secured using PCI-DSS standards. We never store sensitive credentials on our local servers.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === 'review' && (
                                    <motion.div
                                        key="review"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-10"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <MapPin className="w-24 h-24 rotate-12" />
                                                </div>
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="font-black text-text-primary uppercase tracking-[0.2em] text-[10px]">Dispatch To</h3>
                                                    <button type="button" onClick={() => setCurrentStep('address')} className="text-primary font-black text-[10px] uppercase hover:underline">Edit</button>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><User className="w-5 h-5" /></div>
                                                        <div>
                                                            <p className="font-black text-text-primary text-lg leading-tight">{formData.name}</p>
                                                            <p className="text-xs text-text-secondary/50 font-medium">{formData.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><MapPin className="w-5 h-5" /></div>
                                                        <p className="text-sm text-text-secondary font-bold leading-relaxed">
                                                            {formData.deliveryType === 'delivery' ? (
                                                                <>{formData.street}, {formData.city}, {formData.zipCode}</>
                                                            ) : (
                                                                <span className="text-seller uppercase tracking-widest text-xs">Self-Pickup from Neighborhood Center</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                                    <CreditCard className="w-24 h-24 -rotate-12" />
                                                </div>
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="font-black text-text-primary uppercase tracking-[0.2em] text-[10px]">Payment Via</h3>
                                                    <button type="button" onClick={() => setCurrentStep('payment')} className="text-primary font-black text-[10px] uppercase hover:underline">Edit</button>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/30">
                                                        {formData.paymentMethod === 'card' ? <CreditCard className="w-10 h-10" /> : formData.paymentMethod === 'upi' ? <ShieldCheck className="w-10 h-10" /> : <Truck className="w-10 h-10" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-text-primary text-xl uppercase tracking-tighter">
                                                            {formData.paymentMethod === 'card' ? 'Premium Card' : formData.paymentMethod === 'upi' ? 'Unified (UPI)' : 'Cash Manifest'}
                                                        </p>
                                                        <Badge variant="seller" className="text-[9px] py-0 mt-1 uppercase">Instant Auth Access</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm">
                                            <h3 className="font-black text-text-primary uppercase tracking-widest text-[10px] mb-8">Inventory Manifest ({items.length} Items)</h3>
                                            <div className="space-y-6">
                                                {items.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-6 group">
                                                        <div className="w-20 h-20 bg-background rounded-2xl p-3 border border-border relative group-hover:border-primary transition-colors">
                                                            <img src={item.product!.images[0]} alt={item.product!.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-text-primary text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-card shadow-lg">
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-text-primary text-base leading-tight group-hover:text-primary transition-colors">{item.product!.name}</h4>
                                                            <p className="text-[10px] text-text-secondary/50 font-black uppercase tracking-[0.2em] mt-1">{item.product!.brand}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-black text-text-primary text-lg">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                                                            <div className="text-[9px] text-text-secondary/50 font-bold">₹{item.price.toLocaleString('en-IN')} / per unit</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="mt-16 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="flex items-center gap-3 text-text-secondary/50 hover:text-text-primary font-black uppercase tracking-widest text-[10px] transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-card group-hover:border-primary/20 transition-all">
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    </div>
                                    {currentStep === 'address' ? 'Review Bag' : 'Go Back'}
                                </button>

                                {currentStep === 'review' ? (
                                    <Button
                                        type="submit"
                                        className="px-14 py-8 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 group bg-text-primary hover:bg-text-primary/90 text-card"
                                        isLoading={isSubmitting}
                                    >
                                        Seal the Deal
                                        <Sparkles className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="px-14 py-8 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 group btn-primary"
                                    >
                                        Continue Flow
                                        <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: Persistent Order Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary to-indigo-600" />

                            <h3 className="text-xl font-black text-text-primary mb-10 uppercase tracking-tighter flex items-center gap-3">
                                Financial Summary
                            </h3>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                                    <span>Inventory Value ({items.length})</span>
                                    <span className="text-text-primary font-black text-sm">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-text-secondary font-bold uppercase tracking-widest text-[10px]">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-primary" />
                                        <span>Logistics Fee</span>
                                    </div>
                                    <span className={deliveryFee > 0 ? 'text-text-primary font-black text-sm' : 'text-seller font-black text-sm'}>
                                        {deliveryFee > 0 ? `+ ₹${deliveryFee}` : 'FREE'}
                                    </span>
                                </div>

                                <div className="pt-8 border-t border-border mt-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-text-secondary/50 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Final Amount</p>
                                            <div className="text-4xl font-black text-text-primary tracking-tighter">
                                                <span className="text-xl align-top mr-1 font-bold">₹</span>{total.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <Badge variant="primary" className="text-[10px] py-0 px-3 bg-text-primary text-card">Total</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-background rounded-3xl border border-border flex items-start gap-4">
                                <ShieldCheck className="w-6 h-6 text-seller shrink-0 mt-0.5" />
                                <p className="text-[9px] text-text-secondary font-black uppercase tracking-relaxed leading-relaxed">
                                    Hyperlocal Fulfillment Guaranteed. Your package will be prepared by authorized neighborhood retailers.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
