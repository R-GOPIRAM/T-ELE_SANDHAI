import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle, MapPin, ArrowLeft, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/apiClient';

interface TrackingData {
    tracking_data?: {
        shipment_track?: Array<{
            current_status?: string;
        }>;
    };
}

interface RoutingInfo {
    status?: string;
    storeName?: string;
    courierName?: string;
    distanceFromCustomer?: number;
    estimatedDeliveryDays?: string;
}

export default function OrderTrackingPage() {
    const { awb } = useParams<{ awb: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [routingInfo, setRoutingInfo] = useState<RoutingInfo | null>(null);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const { data } = await api.get(`/shipping/track/${awb}`);
                setTrackingData(data.data.trackingData);
                setRoutingInfo(data.data.routingInfo);
            } catch (error) {
                console.error('Failed to fetch tracking', error);
            } finally {
                setLoading(false);
            }
        };

        if (awb) fetchTracking();
    }, [awb]);

    const steps = [
        { label: 'Order Placed', status: 'completed' },
        { label: 'Pickup Scheduled', status: routingInfo ? 'completed' : 'pending' },
        { label: 'Shipped', status: trackingData?.tracking_data?.shipment_track?.[0]?.current_status === 'Shipped' ? 'completed' : 'pending' },
        { label: 'Out for Delivery', status: trackingData?.tracking_data?.shipment_track?.[0]?.current_status === 'Out for Delivery' ? 'completed' : 'pending' },
        { label: 'Delivered', status: trackingData?.tracking_data?.shipment_track?.[0]?.current_status === 'Delivered' ? 'completed' : 'pending' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/dashboard/orders')}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-bold uppercase tracking-widest text-[10px] mb-8 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Orders
                </button>

                <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-8 flex items-center gap-4">
                    <Truck className="w-10 h-10 text-primary" />
                    Shipment Tracking
                </h1>

                <div className="bg-card rounded-[2.5rem] border border-border shadow-xl shadow-border/50 p-8 md:p-12 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-50 pb-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary/50 mb-1">Tracking ID (AWB)</p>
                            <h2 className="text-2xl font-black text-text-primary tracking-tighter">{awb}</h2>
                        </div>
                        {routingInfo && (
                            <div className="mt-4 md:mt-0 px-5 py-3 bg-primary/10 rounded-2xl flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase text-primary-800 tracking-widest">
                                    {routingInfo.status || 'Active'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress Tracker */}
                    <div className="relative mb-16 px-4">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-background -translate-y-1/2 z-0 rounded-full" />
                        <div className="relative z-10 flex justify-between">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all bg-card
                      ${step.status === 'completed' ? 'border-primary text-primary shadow-lg shadow-primary/20' : 'border-border text-text-secondary/30'}
                    `}
                                    >
                                        {step.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                                    </motion.div>
                                    <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-center text-text-secondary w-24">
                                        {step.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Routing Intelligence (Module G) */}
                    {routingInfo && (
                        <div className="bg-background/50 rounded-3xl p-8 border border-border">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-primary mb-6 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> Smart Logistics Routing
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary/50">Dispatch Location</p>
                                        <p className="text-sm font-black text-text-primary">{routingInfo.storeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary/50">Courier Partner</p>
                                        <p className="text-sm font-black text-primary">{routingInfo.courierName}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary/50">Distance to Destination</p>
                                        <p className="text-sm font-black text-text-primary">{routingInfo.distanceFromCustomer?.toFixed(1) || 0} km away</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary/50">Estimated Transit Time</p>
                                        <p className="text-sm font-black text-text-primary flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-primary-500" /> {routingInfo.estimatedDeliveryDays}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!trackingData && !routingInfo && (
                        <div className="text-center py-12">
                            <Info className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                            <p className="text-sm font-bold text-text-secondary">Awaiting carrier sync or tracking details are unavailable.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
