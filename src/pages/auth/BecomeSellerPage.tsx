import { useState } from 'react';
import { Store, User, Mail, Phone, MapPin, Building, Lock, Upload, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const sellerRegSchema = z.object({
    businessName: z.string().min(2, 'Store name is required'),
    name: z.string().min(2, 'Owner name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    businessAddress: z.string().min(5, 'Store address is required'),
    city: z.string().min(2, 'City is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SellerRegFormData = z.infer<typeof sellerRegSchema>;

export default function BecomeSellerPage() {
    const { register: authRegister, loading } = useAuth();
    const navigate = useNavigate();
    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SellerRegFormData>({
        resolver: zodResolver(sellerRegSchema),
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: SellerRegFormData) => {
        try {
            // In a real scenario with logo upload, we would use FormData
            // For now, we use the existing register logic from authStore
            await authRegister({
                ...data,
                role: 'seller',
            });
            setIsSuccess(true);
            toast.success('Registration successful!');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed';
            toast.error(message);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full glass-panel p-10 text-center"
                >
                    <div className="w-20 h-20 bg-seller/20 rounded-full flex items-center justify-center mx-auto mb-6 text-seller shadow-lg shadow-seller/10">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-heading font-black text-text-primary mb-4 tracking-tighter">Application Received</h2>
                    <p className="text-text-secondary font-medium mb-8 leading-relaxed">
                        Seller application submitted for approval. Our team will verify your business details within 24-48 hours.
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline" className="w-full py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-xs">
                        Return to Marketplace
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-seller/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side: Brand & Message */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:block space-y-8"
                >
                    <div className="inline-flex items-center gap-2 bg-seller/10 px-4 py-2 rounded-full border border-seller/20">
                        <ShieldCheck className="w-4 h-4 text-seller" />
                        <span className="text-xs font-black text-seller uppercase tracking-widest">Verified Seller Program</span>
                    </div>

                    <h1 className="text-6xl font-heading font-black text-text-primary tracking-tighter leading-[1.1]">
                        Grow your <span className="text-seller">Business</span> <br />
                        Digitally.
                    </h1>

                    <p className="text-xl text-text-secondary font-medium leading-relaxed max-w-lg">
                        Join the most trusted hyperlocal electronics marketplace. Connect with customers in your neighborhood and scale your operations.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 glass-panel bg-white/30">
                            <div className="w-12 h-12 bg-seller/20 rounded-xl flex items-center justify-center text-seller">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary">Instant Visibility</h4>
                                <p className="text-sm text-text-secondary">Reach thousands of local buyers instantly.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 glass-panel bg-white/30">
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                <IndianRupee className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary">Secure Payments</h4>
                                <p className="text-sm text-text-secondary">Direct-to-bank settlements for every sale.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 lg:p-12 relative z-10 border border-seller/10"
                >
                    <div className="mb-10 lg:hidden text-center">
                        <h2 className="text-3xl font-heading font-black text-text-primary tracking-tighter">Become a Seller</h2>
                        <p className="text-text-secondary text-sm font-medium mt-2">Start your journey at T-ELE Sandhai</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Logo Upload */}
                        <div className="flex flex-col items-center mb-8">
                            <label className="relative group cursor-pointer inline-block">
                                <div className={`w-24 h-24 rounded-[2rem] border-2 border-dashed flex items-center justify-center transition-all overflow-hidden ${logoPreview ? 'border-seller' : 'border-border group-hover:border-seller group-hover:bg-seller/5'}`}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Store Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-text-secondary group-hover:text-seller" />
                                    )}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-seller text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                                    <Store className="w-4 h-4" />
                                </div>
                            </label>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary mt-3">Store Logo</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Store Name" icon={Store} placeholder="Electronics Junction" {...register('businessName')} error={errors.businessName?.message} />
                            <Input label="Owner Name" icon={User} placeholder="John Doe" {...register('name')} error={errors.name?.message} />
                            <Input label="Email Address" icon={Mail} placeholder="john@store.com" {...register('email')} error={errors.email?.message} />
                            <Input label="Phone Number" icon={Phone} placeholder="+91 00000 00000" {...register('phone')} error={errors.phone?.message} />
                            <div className="md:col-span-2">
                                <Input label="Store Address" icon={MapPin} placeholder="Suite 12, Main Street" {...register('businessAddress')} error={errors.businessAddress?.message} />
                            </div>
                            <Input label="City" icon={Building} placeholder="Chennai" {...register('city')} error={errors.city?.message} />
                            <Input label="Password" icon={Lock} type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
                        </div>

                        <div className="p-5 bg-background/50 rounded-2xl border border-border flex items-start gap-4 mt-8">
                            <ShieldCheck className="w-5 h-5 text-seller shrink-0 mt-0.5" />
                            <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wide leading-relaxed">
                                By clicking "Initiate Application", you agree to our Seller Verification protocol. Your store will be live once the manual review is complete.
                            </p>
                        </div>

                        <Button type="submit" className="w-full py-5 text-sm font-black uppercase tracking-[0.2em] bg-seller hover:bg-seller-hover shadow-xl shadow-seller/20 rounded-[1.5rem] mt-4" isLoading={loading}>
                            Initiate Application
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

const IndianRupee = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M6 13l8.5 8" />
        <path d="M6 13h3" />
        <path d="M9 13c6.667 0 6.667-10 0-10" />
    </svg>
);
