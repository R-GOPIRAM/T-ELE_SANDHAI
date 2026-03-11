import { useState, useEffect } from 'react';
import { Mail, Lock, User } from 'lucide-react';
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
    password: z.string().min(1, 'Password is required'), // Allow min 1 for flexibility if needed, but keeping min 6 for security is safer. Prompt says "password is required".
});

const registerSchema = loginSchema.extend({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    confirmPassword: z.string(),
    role: z.literal('customer'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function CustomerLoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register: authRegister, loading } = useAuth();
    const navigate = useNavigate();
    const { user, isCheckingAuth } = useAuthStore();

    const {
        register: loginRegister,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

    const {
        register: regRegister,
        handleSubmit: handleRegSubmit,
        formState: { errors: regErrors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { role: 'customer' },
    });

    useEffect(() => {
        if (user && !isCheckingAuth) {
            navigate('/dashboard');
        }
    }, [user, isCheckingAuth, navigate]);

    const onLoginSubmit = async (data: LoginFormData) => {
        try {
            const loggedInUser = await login(data);
            if (loggedInUser.role !== 'customer') {
                toast.error(`Please use the correct login portal for your role (${loggedInUser.role}).`);
                return;
            }
            toast.success(`Welcome back, ${loggedInUser.name}!`);
            navigate('/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Invalid email or password';
            toast.error(message);
        }
    };

    const onRegisterSubmit = async (data: RegisterFormData) => {
        try {
            await authRegister({
                email: data.email,
                password: data.password,
                name: data.name,
                role: 'customer',
            });
            toast.success('Account created successfully!');
            navigate('/');
        } catch {
            toast.error('Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow -z-10" />
            <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-bargain/20 rounded-full blur-[100px] animate-pulse-slow -z-10" />

            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel p-10 relative z-10"
                >
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-primary/30 transform transition-transform duration-500 hover:scale-110">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-heading font-black tracking-tight text-text-primary mb-2">
                            {isLogin ? 'Customer Login' : 'Create Account'}
                        </h2>
                        <p className="text-text-secondary font-medium px-4">
                            {isLogin ? 'Access your hyperlocal shopping terminal.' : 'Start your journey at T-ELE Sandhai.'}
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
                                >
                                    <Input placeholder="Full Name" icon={User} {...regRegister('name')} error={regErrors.name?.message} className="bg-white/50 focus:bg-white transition-colors" />
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
                            <div className="flex justify-between items-center pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    className="text-xs font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all"
                                >
                                    Create Account
                                </button>
                                <button type="button" className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-all">
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] mt-8 shadow-xl shadow-primary/20 rounded-2xl border-none"
                            isLoading={loading}
                        >
                            {isLogin ? 'Login' : 'Submit'}
                        </Button>
                    </form>

                    {!isLogin && (
                        <div className="mt-8 text-center border-t border-border/50 pt-6">
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">
                                Already have an account?
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="ml-2 text-primary hover:text-primary-hover transition-colors"
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    )}
                </motion.div>

                <div className="mt-8 text-center text-sm font-medium text-text-secondary/70">
                    By continuing, you agree to T-ELE Sandhai's<br />
                    <a href="#" className="hover:text-primary transition-colors">Terms of Service</a> & <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                </div>
            </div>
        </div>
    );
}
