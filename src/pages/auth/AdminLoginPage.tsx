import { useEffect } from 'react';
import { Mail, Lock, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const { user, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        if (user && !isCheckingAuth) {
            navigate('/admin');
        }
    }, [user, isCheckingAuth, navigate]);

    const {
        register: loginRegister,
        handleSubmit: handleLoginSubmit,
        formState: { errors: loginErrors },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

    const onLoginSubmit = async (data: LoginFormData) => {
        try {
            const loggedInUser = await login(data);
            if (loggedInUser.role !== 'admin') {
                toast.error(`Terminal Access Denied: Unauthorized role.`);
                return;
            }
            toast.success(`System Access Granted. Welcome, Admin.`);
            navigate('/admin/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Authentication sequence failed.';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse-slow -z-10" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-gray-600/10 rounded-full blur-[100px] animate-pulse-slow -z-10" />

            <div className="w-full max-w-md">
                <div
                    className="backdrop-blur-xl bg-gray-900/60 border border-gray-800/80 rounded-[2rem] p-10 relative z-10 shadow-2xl shadow-red-900/10"
                >
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 shadow-lg shadow-black transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <Shield className="w-10 h-10" />
                        </div>
                        <h2 className="text-4xl font-heading font-black tracking-[0.2em] text-white mb-2 uppercase italic">
                            Terminal
                        </h2>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                            <p className="text-red-500/80 text-[10px] uppercase tracking-[0.4em] font-black">
                                Security Level 4 • Restricted Area
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
                        <div className="space-y-5">
                            <Input
                                placeholder="System Email"
                                icon={Mail}
                                {...loginRegister('email')}
                                error={loginErrors.email?.message}
                                className="bg-black/50 border-gray-800 text-white placeholder-gray-600 focus:border-red-500/50 focus:bg-black transition-colors"
                            />

                            <Input
                                placeholder="Passphrase"
                                icon={Lock}
                                type="password"
                                {...loginRegister('password')}
                                error={loginErrors.password?.message}
                                className="bg-black/50 border-gray-800 text-white placeholder-gray-600 focus:border-red-500/50 focus:bg-black transition-colors"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-5 text-xs font-black uppercase tracking-[0.3em] mt-10 shadow-2xl shadow-red-600/10 bg-red-600 hover:bg-black hover:text-red-600 hover:border-red-600 border border-transparent transition-all duration-500 rounded-none"
                            isLoading={loading}
                        >
                            {loading ? 'Initializing...' : 'Authorize Access'}
                        </Button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-gray-800">
                        <p className="text-center text-gray-500/70 text-[10px] uppercase tracking-[0.2em] font-bold">
                            Admins must be provisioned via system authority.
                        </p>
                        <p className="text-center text-gray-600/50 text-[10px] uppercase tracking-widest font-mono mt-2">
                            IP Logged & Monitored
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
