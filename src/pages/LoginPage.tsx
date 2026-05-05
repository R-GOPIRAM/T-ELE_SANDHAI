import { useState, useEffect } from 'react';
import { Mail, Lock, User, Store, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'seller', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register: authRegister, loading } = useAuth();
  const navigate = useNavigate();
  const { user, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    // Immediate redirect if already authenticated
    if (user && !isCheckingAuth) {
      toast.success(`You are already signed in as ${user.name}`);
      const fallback = user.role === 'customer' ? '/' :
        user.role === 'seller' ? '/dashboard/seller' : '/dashboard/logistics';
      navigate(fallback, { replace: true });
    }
  }, [user, isCheckingAuth, navigate]);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    formState: { errors: regErrors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const selectedRole = watch('role');

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const loggedInUser = await login(data);
      toast.success(`Welcome back, ${loggedInUser.name}!`);

      const path = loggedInUser.role === 'seller' ? '/dashboard/seller' :
        loggedInUser.role === 'admin' ? '/dashboard/logistics' : '/';
      navigate(path, { replace: true });
    } catch (error) {
      // Error is already handled/stored in authStore, but we show toast here
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(message);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const registeredUser = await authRegister({
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      });

      toast.success('Your local hub account is ready!');

      const path = registeredUser.role === 'seller' ? '/dashboard/seller/verification' : '/';
      navigate(path, { replace: true });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Registration failed. Please check your details.';
      toast.error(message);
    }
  };

  const userTypes = [
    { key: 'customer', label: 'Customer', icon: User, description: 'Shop locally' },
    { key: 'seller', label: 'Seller', icon: Store, description: 'Sell items' },
    { key: 'admin', label: 'Admin', icon: Shield, description: 'Manage all' }
  ] as const;

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-background/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[480px] w-full relative">
        {/* Background blobs for depth */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent-200/30 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative bg-card/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-border/50 border border-card p-10 md:p-12 overflow-hidden">

          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/40 mb-8"
            >
              <Store className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl font-black text-text-primary tracking-tighter mb-2">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-text-secondary font-medium">
              {isLogin ? 'Signin to your local hub' : 'Create your account today'}
            </p>
          </div>

          <form
            onSubmit={isLogin ? handleLoginSubmit(onLoginSubmit) : handleRegSubmit(onRegisterSubmit)}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="reg-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <Input
                    label="Full Name"
                    icon={User}
                    placeholder="John Doe"
                    {...regRegister('name')}
                    error={regErrors.name?.message}
                  />

                  <div className="space-y-3">
                    <label className="text-sm font-black text-text-secondary uppercase tracking-widest px-1">
                      Joining as
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {userTypes.map((type) => (
                        <button
                          key={type.key}
                          type="button"
                          onClick={() => setValue('role', type.key)}
                          className={[
                            "flex flex-col items-center p-4 rounded-2xl border-2 transition-all group",
                            selectedRole === type.key
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                              : "border-gray-50 bg-background/50 hover:border-border hover:bg-card"
                          ].join(' ')}
                        >
                          <type.icon className={`w-6 h-6 mb-2 ${selectedRole === type.key ? "text-primary" : "text-text-secondary/50 group-hover:text-text-secondary"}`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRole === type.key ? "text-primary-900" : "text-text-secondary/50"}`}>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <Input
                label="Email"
                icon={Mail}
                placeholder="email@example.com"
                {... (isLogin ? loginRegister('email') : regRegister('email'))}
                error={isLogin ? loginErrors.email?.message : regErrors.email?.message}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {... (isLogin ? loginRegister('password') : regRegister('password'))}
                  error={isLogin ? loginErrors.password?.message : regErrors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-full text-right px-2"
                >
                  <span className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest hover:text-primary transition-colors">
                    {showPassword ? 'Hide Secret' : 'View Secret'}
                  </span>
                </button>
              </div>

              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Input
                    label="Confirm Password"
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...regRegister('confirmPassword')}
                    error={regErrors.confirmPassword?.message}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full py-7 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/20 group"
                isLoading={loading}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-text-secondary/50 font-bold uppercase tracking-widest text-[10px]">Or</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="group flex items-center justify-center gap-2 mx-auto"
            >
              <span className="text-text-secondary font-medium">
                {isLogin ? "New here?" : "Already joined?"}
              </span>
              <span className="text-primary font-black flex items-center gap-1 group-hover:underline">
                {isLogin ? "Sign Up Free" : "Login Now"}
                <Sparkles className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}