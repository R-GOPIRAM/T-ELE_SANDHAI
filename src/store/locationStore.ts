import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location } from '../types';
import axios from 'axios';

interface LocationState {
    location: Location | null;
    isLoading: boolean;
    error: string | null;
    setLocation: (location: Location) => void;
    detectLocation: () => Promise<boolean>;
    updateByPincode: (pincode: string) => Promise<boolean>;
    clearError: () => void;
}

export const useLocationStore = create<LocationState>()(
    persist(
        (set) => ({
            location: null,
            isLoading: false,
            error: null,

            setLocation: (location) => set({ location, error: null }),

            detectLocation: async () => {
                set({ isLoading: true, error: null });

                if (!navigator.geolocation) {
                    set({ error: 'Geolocation is not supported by your browser', isLoading: false });
                    return false;
                }

                try {
                    // Check for permission status if supported (Chrome/Firefox/Edge)
                    if (navigator.permissions && navigator.permissions.query) {
                        const status = await navigator.permissions.query({ name: 'geolocation' });
                        if (status.state === 'denied') {
                            set({ error: 'Location permission denied. Please enable it in your browser settings.', isLoading: false });
                            return false;
                        }
                    }
                } catch (_e) {
                    // Permission API might not be supported or fail, proceed to getCurrentPosition
                }

                return new Promise<boolean>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            try {
                                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                                const data = await res.json();

                                const locationData: Location = {
                                    city: data.city || data.locality || data.principalSubdivision || 'Unknown City',
                                    area: data.localityInfo?.informal?.[0]?.name || data.locality || 'Unknown Area',
                                    pincode: data.postcode || '',
                                    coordinates: { lat: latitude, lng: longitude }
                                };

                                set({ location: locationData, isLoading: false, error: null });
                                resolve(true);
                            } catch (_err) {
                                set({ error: 'Failed to fetch locality details from Map Service', isLoading: false });
                                resolve(false);
                            }
                        },
                        (err) => {
                            let message = 'Failed to detect location';
                            if (err.code === err.PERMISSION_DENIED) {
                                message = 'Location access blocked. Please enable permissions in your browser bar (top left) and refresh.';
                            } else if (err.code === err.POSITION_UNAVAILABLE) {
                                message = 'GPS Position unavailable. Try entering your pincode manually.';
                            } else if (err.code === err.TIMEOUT) {
                                message = 'Location request timed out. Please try again or enter pincode.';
                            }

                            set({ error: message, isLoading: false });
                            resolve(false);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 15000, // Increased to 15s for better reliability 
                            maximumAge: 30000
                        }
                    );
                });
            },

            updateByPincode: async (pincode) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&country=india&addressdetails=1`,
                        {
                            headers: { 'User-Agent': 'T-ELE-Sandhai-Client' },
                            timeout: 10000
                        }
                    );

                    if (response.data && response.data.length > 0) {
                        const result = response.data[0];
                        const address = result.address;
                        const locationData: Location = {
                            city: address.city || address.town || address.village || address.state_district || 'Unknown City',
                            area: address.suburb || address.neighbourhood || 'Unknown Area',
                            pincode: pincode,
                            coordinates: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
                        };
                        set({ location: locationData, isLoading: false, error: null });
                        return true;
                    } else {
                        set({ error: 'Invalid pincode or location not found', isLoading: false });
                        return false;
                    }
                } catch (_err) {
                    set({ error: 'Service Unavailable: Failed to fetch location by pincode', isLoading: false });
                    return false;
                }
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'location-storage',
        }
    )
);
