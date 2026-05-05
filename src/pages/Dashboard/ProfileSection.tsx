import React, { useState } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function ProfileSection() {
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
            useAuthStore.getState().checkAuth();
            toast.success('Profile updated successfully!');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-primary uppercase tracking-tight">Profile <span className="text-primary">Settings</span></h1>
                    <p className="text-text-secondary font-medium mt-1">Manage your account identity and security.</p>
                </div>
            </div>

            <Card className="max-w-2xl bg-card rounded-[2.5rem] border border-border p-10 md:p-12 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex items-center gap-6 pb-8 border-b border-border">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary font-black text-3xl shadow-inner">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase">{user.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="text-xs font-black text-text-secondary uppercase tracking-widest">{user.role} Member</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <Input
                            label="Full Name"
                            icon={User}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your full name"
                        />

                        <div className="space-y-2">
                            <Input
                                label="Email Address"
                                icon={Mail}
                                value={user.email}
                                disabled
                                className="bg-background/50 text-text-secondary"
                            />
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-2">Identity verified. Email cannot be modified.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end">
                        <Button
                            type="submit"
                            isLoading={loading}
                            className="px-10 py-6 rounded-2xl font-black shadow-xl shadow-primary/20"
                        >
                            <Save className="w-5 h-5 mr-3" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
