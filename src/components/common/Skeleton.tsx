import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    variant = 'rect'
}) => {
    const baseStyles = "animate-pulse bg-gray-200 relative overflow-hidden";

    const variantStyles = {
        text: "h-4 w-full rounded",
        rect: "rounded-md",
        circle: "rounded-full"
    };

    const style: React.CSSProperties = {
        width: width || undefined,
        height: height || undefined,
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
    );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 1, className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    width={i === lines - 1 && lines > 1 ? '70%' : '100%'}
                />
            ))}
        </div>
    );
};

export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => {
    return <Skeleton variant="circle" width={size} height={size} className={className} />;
};
