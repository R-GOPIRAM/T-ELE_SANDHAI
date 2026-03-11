import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Home, Briefcase, Globe, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import api from '../../services/apiClient';

interface Address {
    _id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    label?: string;
}

export default function AddressSection() {
    const { user } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    // In a real app, addresses might be a separate collection or inside user object
    // For this implementation, we'll assume they are stored in the user profile address field 
    // or as an array if the schema supports it. Since the User model seen earlier had a single address object,
    // we will handle it as a primary address and potentially allow editing.

    // Note: If the backend supports multiple addresses, we'd fetch an array.
    // Given the User model has a single 'address' object, we'll implement it as "Primary Address" management.

    const [formData, setFormData] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'India',
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.patch('/users/profile', { address: formData });
            toast.success('Address updated successfully');
            setIsAdding(false);
            // Refreshing the page or state would be ideal here
            // window.location.reload(); 
        } catch (err) {
            toast.error('Failed to update address');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-heading font-black text-text-primary uppercase tracking-tight">Saved Locations</h2>
                    <p className="text-text-secondary font-bold mt-1">Manage your delivery hubs and pickup points.</p>
                </div>
                {!isAdding && user?.address?.street && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        variant="primary"
                        size="sm"
                        className="rounded-2xl uppercase font-black text-[10px] tracking-widest gap-2"
                    >
                        <Plus className="w-4 h-4" /> Edit Address
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isAdding || !user?.address?.street ? (
                    <motion.div
                        key="address-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="p-8 border-border">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Street Address"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        placeholder="Flat, Building, Street Name"
                                        required
                                    />
                                    <Input
                                        label="City"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Mumbai"
                                        required
                                    />
                                    <Input
                                        label="State"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="Maharashtra"
                                        required
                                    />
                                    <Input
                                        label="ZIP Code"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        placeholder="400001"
                                        required
                                    />
                                    <Input
                                        label="Country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        placeholder="India"
                                        required
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button type="submit" isLoading={isLoading} className="rounded-2xl flex-1">
                                        Save Address
                                    </Button>
                                    {user?.address?.street && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsAdding(false)}
                                            className="rounded-2xl flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        key="address-display"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <Card className="p-8 border-primary/20 bg-primary/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <Home className="w-20 h-20" />
                            </div>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-text-primary uppercase tracking-tight">Primary Address</h4>
                                        <span className="bg-seller/20 text-seller px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle2 className="w-2 h-2" /> Default
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-0.5">Shipping Hub</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-text-primary font-black uppercase text-sm">{user.address.street}</p>
                                <p className="text-text-secondary font-bold text-xs uppercase tracking-wider">
                                    {user.address.city}, {user.address.state} {user.address.zipCode}
                                </p>
                                <p className="text-text-secondary font-bold text-xs uppercase tracking-widest">
                                    {user.address.country}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-primary/10 flex gap-4">
                                <Button
                                    onClick={() => setIsAdding(true)}
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-transparent"
                                >
                                    Modify
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
