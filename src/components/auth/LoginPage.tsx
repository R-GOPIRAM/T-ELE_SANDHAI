import React, { useState } from 'react';
import { Mail, Lock, User, Store, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

interface LoginPageProps {
  onPageChange: (page: string) => void;
}

export default function LoginPage({ onPageChange }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'customer' | 'seller' | 'admin'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const { login, register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const loggedInUser = await login({ email: formData.email, password: formData.password });
        // Redirect based on user type from backend
        if (loggedInUser.role === 'seller') {
          onPageChange('seller-dashboard');
        } else if (loggedInUser.role === 'admin') {
          onPageChange('admin-dashboard');
        } else {
          onPageChange('browse');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }

        const registeredUser = await register({
          ...formData,
          role: userType
        });

        // For sellers, redirect to registration form
        if (registeredUser.role === 'seller') {
          onPageChange('seller-register');
        } else {
          onPageChange('browse');
        }
      }
    } catch (error: any) {
      // Extract the specific error message from the backend response
      let errorMessage = 'Authentication failed';

      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        if (Array.isArray(backendMessage)) {
          // Handle Zod validation error array
          errorMessage = backendMessage.map((err: any) => err.message).join('\n');
        } else if (typeof backendMessage === 'object') {
          errorMessage = JSON.stringify(backendMessage);
        } else {
          // Handle string error message (e.g. "Email already in use")
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  const userTypes = [
    { key: 'customer', label: 'Customer', icon: User, description: 'Shop from local stores' },
    { key: 'seller', label: 'Seller', icon: Store, description: 'Sell your products' },
    { key: 'admin', label: 'Admin', icon: Shield, description: 'Platform management' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Please wait..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform duration-300">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h2 className="mt-8 text-4xl font-extrabold text-gray-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create your account'}
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-light">
            {isLogin ? 'Sign in to access your LocalMart' : 'Join our platform to get started'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-blue-900/5 border border-white/50 p-8 sm:p-10">
          {/* User Type Selection */}
          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-1 gap-3">
                {userTypes.map((type) => (
                  <label key={type.key} className="cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value={type.key}
                      checked={userType === type.key}
                      onChange={(e) => setUserType(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`flex items-center p-3 rounded-lg border-2 transition-colors ${userType === type.key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <type.icon className={`w-5 h-5 mr-3 ${userType === type.key ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      <div>
                        <div className={`font-medium ${userType === type.key ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                          {type.label}
                        </div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}