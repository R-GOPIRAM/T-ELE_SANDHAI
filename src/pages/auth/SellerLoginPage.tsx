import { useState, useEffect } from 'react';
import { Mail, Lock, Store, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-[480px] w-full bg-card rounded-[3rem] shadow-xl p-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                        <Store className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black">{isLogin ? 'Seller Portal' : 'Join as Seller'}</h2>
                    <p className="text-text-secondary mt-2">Manage your inventory and sales.</p>
                </div>

                <form onSubmit={isLogin ? handleLoginSubmit(onLoginSubmit) : handleRegSubmit(onRegisterSubmit)} className="space-y-6">
                    <AnimatePresence>
                        {!isLogin && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                                <Input label="Business Name" icon={Store} {...regRegister('businessName')} error={regErrors.businessName?.message} />
                                <Input label="Owner Name" icon={Store} {...regRegister('name')} error={regErrors.name?.message} />
                                <Input label="Business Address" icon={Store} {...regRegister('businessAddress')} error={regErrors.businessAddress?.message} />
                                <Input label="Phone Number" icon={Store} {...regRegister('phone')} error={regErrors.phone?.message} />
                                <Input label="PAN Number" icon={Store} {...regRegister('panNumber')} error={regErrors.panNumber?.message} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Input label="Email" icon={Mail} {...(isLogin ? loginRegister('email') : regRegister('email'))} error={isLogin ? loginErrors.email?.message : regErrors.email?.message} />
                    <Input label="Password" icon={Lock} type="password" {...(isLogin ? loginRegister('password') : regRegister('password'))} error={isLogin ? loginErrors.password?.message : regErrors.password?.message} />
                    {!isLogin && <Input label="Confirm Password" icon={Lock} type="password" {...regRegister('confirmPassword')} error={regErrors.confirmPassword?.message} />}

                    <Button type="submit" className="w-full py-6 rounded-2xl" isLoading={loading}>
                        {isLogin ? 'Sign In' : 'Begin Verification'}
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center mt-6 text-sm text-text-secondary hover:text-primary font-bold transition-colors">
                    {isLogin ? "Want to sell with us? Sign Up" : "Already a seller? Sign In"}
                </button>
            </div>
        </div>
    );
}
