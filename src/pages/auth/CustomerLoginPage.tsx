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
    password: z.string().min(1, 'Password is required'),
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

    // ==========================
    // LOGIN
    // ==========================
    const onLoginSubmit = async (data: LoginFormData) => {
        try {
            const loggedInUser = await login(data);

            if (loggedInUser.role !== 'customer') {
                toast.error(`Please use correct portal (${loggedInUser.role})`);
                return;
            }

            toast.success(`Welcome back, ${loggedInUser.name}!`);
            navigate('/dashboard');

        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Invalid email or password';

            toast.error(message);
        }
    };

    // ==========================
    // REGISTER (🔥 FIXED)
    // ==========================
    const onRegisterSubmit = async (data: RegisterFormData) => {
        try {
            const res = await authRegister({
                email: data.email,
                password: data.password,
                name: data.name,
                role: 'customer',
            });

            console.log("REGISTER SUCCESS:", res);

            toast.success('Account created successfully!');

            // 🔥 User already logged in (cookie set)
            navigate('/dashboard');

        } catch (err: any) {
            console.error("REGISTER ERROR:", err);

            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Something went wrong';

            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">

            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel p-10"
                >
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                            <User className="w-8 h-8" />
                        </div>

                        <h2 className="text-4xl font-black mb-2">
                            {isLogin ? 'Customer Login' : 'Create Account'}
                        </h2>

                        <p className="text-gray-500">
                            {isLogin
                                ? 'Access your hyperlocal shopping terminal.'
                                : 'Start your journey at T-ELE Sandhai.'}
                        </p>
                    </div>

                    <form
                        onSubmit={
                            isLogin
                                ? handleLoginSubmit(onLoginSubmit)
                                : handleRegSubmit(onRegisterSubmit)
                        }
                        className="space-y-5"
                    >

                        {!isLogin && (
                            <Input
                                placeholder="Full Name"
                                icon={User}
                                {...regRegister('name')}
                                error={regErrors.name?.message}
                            />
                        )}

                        <Input
                            placeholder="Email"
                            icon={Mail}
                            {...(isLogin
                                ? loginRegister('email')
                                : regRegister('email'))}
                            error={
                                isLogin
                                    ? loginErrors.email?.message
                                    : regErrors.email?.message
                            }
                        />

                        <Input
                            placeholder="Password"
                            icon={Lock}
                            type="password"
                            {...(isLogin
                                ? loginRegister('password')
                                : regRegister('password'))}
                            error={
                                isLogin
                                    ? loginErrors.password?.message
                                    : regErrors.password?.message
                            }
                        />

                        {!isLogin && (
                            <Input
                                placeholder="Confirm Password"
                                icon={Lock}
                                type="password"
                                {...regRegister('confirmPassword')}
                                error={regErrors.confirmPassword?.message}
                            />
                        )}

                        <Button type="submit" isLoading={loading}>
                            {isLogin ? 'Login' : 'Register'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary"
                        >
                            {isLogin
                                ? 'Create Account'
                                : 'Already have an account? Login'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}