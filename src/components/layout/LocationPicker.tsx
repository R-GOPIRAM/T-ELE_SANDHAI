import { useState } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { useLocationStore } from '../../store/locationStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface LocationPickerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LocationPicker({ isOpen, onClose }: LocationPickerProps) {
    const { location, isLoading, error, detectLocation, updateByPincode } = useLocationStore();
    const [pincode, setPincode] = useState('');

    const handleDetectLocation = async () => {
        try {
            const success = await detectLocation();
            if (success) {
                onClose();
            }
        } catch (err) {
            console.error('Unexpected error during location detection:', err);
        }
    };

    const handlePincodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pincode.length === 6) {
            try {
                const success = await updateByPincode(pincode);
                if (success) {
                    onClose();
                }
            } catch (err) {
                console.error('Unexpected error during pincode update:', err);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Delivery Location" width="md">
            <div className="space-y-6">
                {/* Detect Location Button */}
                <Button
                    onClick={handleDetectLocation}
                    variant="outline"
                    className="w-full py-8 border-2 border-dashed border-border hover:border-primary-500 hover:bg-primary/10 group transition-all"
                    disabled={isLoading}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Navigation className="w-6 h-6 text-primary group-hover:text-white" />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="font-black text-text-primary">Use Current Location</p>
                            <p className="text-sm text-text-secondary">Enable GPS for precise delivery</p>
                        </div>
                    </div>
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-4 text-text-secondary/50 font-black tracking-widest">or enter pincode</span>
                    </div>
                </div>

                {/* Pincode Input */}
                <form onSubmit={handlePincodeSubmit} className="space-y-4">
                    <Input
                        label="Pincode"
                        placeholder="e.g. 600017"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        icon={MapPin}
                        error={error || undefined}
                        maxLength={6}
                    />
                    <Button
                        type="submit"
                        className="w-full py-4 rounded-2xl"
                        disabled={pincode.length !== 6 || isLoading}
                        isLoading={isLoading}
                    >
                        Apply Location
                    </Button>
                </form>

                {/* Current Location Badge */}
                {location && (
                    <div className="p-4 bg-background rounded-2xl border border-border">
                        <p className="text-xs font-black uppercase tracking-widest text-text-secondary/50 mb-2">Current Saved Location</p>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-1" />
                            <div>
                                <p className="font-bold text-text-primary">{location.area || 'Unknown Area'}</p>
                                <p className="text-sm text-text-secondary">{location.city}, {location.pincode}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Handling */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-danger/10 text-danger rounded-xl text-sm font-bold">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
