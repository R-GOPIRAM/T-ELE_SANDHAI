import { useEffect } from 'react';
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react';
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
            navigate('/dashboard/logistics');
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
                toast.error(`Unauthorized access. Role mismatch (${loggedInUser.role}).`);
                return;
            }
            toast.success(`Welcome back Admin, ${loggedInUser.name}!`);
            navigate('/admin/dashboard');
        } catch {
            toast.error('System access denied.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-[480px] w-full bg-black border border-gray-800 rounded-[3rem] shadow-2xl p-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-red-600/20 border border-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-danger">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-white">Admin Terminal</h2>
                    <p className="text-text-secondary mt-2 text-xs uppercase tracking-widest">Restricted Access Zone</p>
                </div>

                <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
                    <Input
                        label="System Email"
                        icon={Mail}
                        {...loginRegister('email')}
                        error={loginErrors.email?.message}
                        className="bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-red-500"
                    />

                    <Input
                        label="Passphrase"
                        icon={Lock}
                        type="password"
                        {...loginRegister('password')}
                        error={loginErrors.password?.message}
                        className="bg-gray-900 border-gray-800 text-white placeholder-gray-600 focus:border-red-500"
                    />

                    <Button type="submit" className="w-full py-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/20" isLoading={loading}>
                        Authenticate Identity
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </form>

                <p className="text-center text-text-secondary text-[10px] mt-8 uppercase tracking-widest font-black">
                    Admins must be provisioned via system authority.
                </p>
            </div>
        </div>
    );
}
