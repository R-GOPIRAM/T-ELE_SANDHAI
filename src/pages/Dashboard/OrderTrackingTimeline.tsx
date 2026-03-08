import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Store } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderTrackingTimelineProps {
    currentStatus: OrderStatus;
}

export default function OrderTrackingTimeline({ currentStatus }: OrderTrackingTimelineProps) {
    const steps = [
        { id: 'pending', label: 'Ordered', icon: Package },
        { id: 'confirmed', label: 'Confirmed', icon: Store },
        { id: 'shipped', label: 'On Way', icon: Truck },
        { id: 'delivered', label: 'Arrived', icon: CheckCircle },
    ];

    const statusPriority: Record<OrderStatus, number> = {
        'pending': 0,
        'confirmed': 1,
        'processing': 1,
        'shipped': 2,
        'delivered': 3,
        'cancelled': -1,
    };

    const currentStepIndex = statusPriority[currentStatus] ?? 0;

    return (
        <div className="relative pt-6 pb-2 px-1">
            {/* Background Line */}
            <div className="absolute top-[50px] left-0 w-full h-0.5 bg-border z-0" />

            {/* Progress Line */}
            <motion.div
                className="absolute top-[50px] left-0 h-0.5 bg-primary z-0"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
            />

            <div className="relative z-10 flex justify-between">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx === currentStepIndex;
                    const isCompleted = idx < currentStepIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <motion.div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border-4 transition-all duration-500 shadow-sm ${isActive || isCompleted
                                    ? 'bg-primary border-primary text-white'
                                    : 'bg-card border-border text-border'
                                    }`}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                    boxShadow: isActive ? '0 10px 15px -3px rgba(37, 99, 235, 0.2)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.div>

                            <div className="mt-4 flex flex-col items-center text-center">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : isCompleted ? 'text-text-primary' : 'text-text-secondary'
                                    }`}>
                                    {step.label}
                                </p>
                                {isActive && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-1 h-1 w-1 bg-primary rounded-full"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
