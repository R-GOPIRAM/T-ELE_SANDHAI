import { useState, useEffect } from 'react';
import { Mail, Lock, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password is required'),
});

const registerSchema = loginSchema.extend({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    confirmPassword: z.string(),
    businessName: z.string().min(2, 'Business Name is required'),
    businessAddress: z.string().min(5, 'Business Address is required'),
    phone: z.string().min(10, 'Valid Phone Number is required'),
    panNumber: z.string().length(10, 'Valid PAN Number is required')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function SellerLoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register: authRegister, loading } = useAuth();
    const navigate = useNavigate();

    const { user, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        if (user && !isCheckingAuth) {
            navigate('/dashboard/seller');
        }
    }, [user, isCheckingAuth, navigate]);

    const {
        register: loginRegister,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

    const {
        register: regRegister,
        handleSubmit: handleRegSubmit,
        formState: { errors: regErrors },
    } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

    const onLoginSubmit = async (data: LoginFormData) => {
        try {
            const loggedInUser = await login(data);
            if (loggedInUser.role !== 'seller') {
                toast.error(`Please use the correct login portal for your role (${loggedInUser.role}).`);
                return;
            }
            toast.success(`Welcome back, ${loggedInUser.name}!`);
            navigate('/seller/dashboard');
        } catch {
            // 403 will be handled globally by apiClient but local toast handles fallback
            toast.error('Login failed or pending approval.');
        }
    };

    const onRegisterSubmit = async (data: RegisterFormData) => {
        try {
            await authRegister({
                email: data.email,
                password: data.password,
                name: data.name,
                role: 'seller',
                businessName: data.businessName,
                businessAddress: data.businessAddress,
                phone: data.phone,
                panNumber: data.panNumber
            });
            toast.success('Registration initiated. Please complete your profile.');
            navigate('/seller-register');
        } catch {
            toast.error('Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-seller/20 rounded-full blur-[120px] animate-pulse-slow -z-10" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-slow -z-10" />

            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel p-10 relative z-10"
                >
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-seller to-seller-hover rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-seller/30 transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                            <Store className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-heading font-black tracking-tight text-text-primary mb-2">
                            {isLogin ? 'Seller Portal' : 'Join as Seller'}
                        </h2>
                        <p className="text-text-secondary font-medium">
                            {isLogin ? 'Manage your inventory and sales.' : 'Start selling to your local community.'}
                        </p>
                    </div>

                    <form onSubmit={isLogin ? handleLoginSubmit(onLoginSubmit) : handleRegSubmit(onRegisterSubmit)} className="space-y-5">
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    <Input placeholder="Business Name" icon={Store} {...regRegister('businessName')} error={regErrors.businessName?.message} className="bg-white/50 focus:bg-white transition-colors" />
                                    <Input placeholder="Owner Name" icon={Store} {...regRegister('name')} error={regErrors.name?.message} className="bg-white/50 focus:bg-white transition-colors" />
                                    <Input placeholder="Business Address" icon={Store} {...regRegister('businessAddress')} error={regErrors.businessAddress?.message} className="bg-white/50 focus:bg-white transition-colors" />
                                    <Input placeholder="Phone Number" icon={Store} {...regRegister('phone')} error={regErrors.phone?.message} className="bg-white/50 focus:bg-white transition-colors" />
                                    <Input placeholder="PAN Number" icon={Store} {...regRegister('panNumber')} error={regErrors.panNumber?.message} className="bg-white/50 focus:bg-white transition-colors" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-5">
                            <Input placeholder="Email Address" icon={Mail} {...(isLogin ? loginRegister('email') : regRegister('email'))} error={isLogin ? loginErrors.email?.message : regErrors.email?.message} className="bg-white/50 focus:bg-white transition-colors" />

                            <Input placeholder="Password" icon={Lock} type="password" {...(isLogin ? loginRegister('password') : regRegister('password'))} error={isLogin ? loginErrors.password?.message : regErrors.password?.message} className="bg-white/50 focus:bg-white transition-colors" />

                            <AnimatePresence>
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Input placeholder="Confirm Password" icon={Lock} type="password" {...regRegister('confirmPassword')} error={regErrors.confirmPassword?.message} className="bg-white/50 focus:bg-white transition-colors" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end pt-1">
                                <button type="button" className="text-sm font-bold text-seller hover:text-seller-hover transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <Button type="submit" className="w-full py-4 text-lg mt-6 shadow-xl shadow-seller/20 bg-seller hover:bg-seller-hover" isLoading={loading}>
                            {isLogin ? 'Sign In' : 'Begin Verification'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center border-t border-border/50 pt-6">
                        <p className="text-text-secondary font-medium">
                            {isLogin ? "Want to sell with us?" : "Already a seller?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-seller font-black hover:text-seller-hover transition-colors"
                            >
                                {isLogin ? "Sign Up" : "Sign In"}
                            </button>
                        </p>
                    </div>
                </motion.div>

                <div className="mt-8 text-center text-sm font-medium text-text-secondary/70">
                    By continuing, you agree to T-ELE Sandhai's<br />
                    <a href="#" className="hover:text-seller transition-colors">Seller Agreement</a> & <a href="#" className="hover:text-seller transition-colors">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
