import React, { useState } from 'react';
import { User, Mail, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

interface ProfilePageProps {
    onPageChange: (page: string) => void;
}

export default function ProfilePage({ onPageChange }: ProfilePageProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/profile', { name: formData.name });
            // Update global user state
            useAuthStore.getState().checkAuth(); // simple way to reload user from backend
            toast.success('Profile updated successfully!');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        onPageChange('login');
        return null;
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-card rounded-lg shadow-md p-8">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-text-primary">Edit Profile</h2>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                                'bg-seller/20 text-green-800'
                            }`}>
                            <span className="capitalize">{user.role}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-text-secondary/50" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-text-secondary/50" />
                                <input
                                    type="email"
                                    disabled
                                    value={user.email}
                                    className="w-full pl-10 pr-3 py-2 border border-border bg-background rounded-md text-text-secondary cursor-not-allowed"
                                />
                            </div>
                            <p className="mt-1 text-sm text-text-secondary">Email address cannot be changed</p>
                        </div>

                        <div className="pt-4 flex items-center justify-end space-x-4 border-t mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onPageChange(user.role === 'seller' ? 'seller-dashboard' : 'home')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={loading}
                                icon={Save}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
