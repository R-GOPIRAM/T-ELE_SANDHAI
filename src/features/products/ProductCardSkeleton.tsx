import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

interface ProductCardSkeletonProps {
    viewMode?: 'grid' | 'list';
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ viewMode = 'grid' }) => {
    return (
        <Card className={`overflow-hidden border border-border/60 shadow-none bg-card ${viewMode === 'list' ? 'flex flex-row items-center h-48' : 'flex flex-col h-full'}`}>

            {/* Image Container */}
            <div className={`bg-background flex-shrink-0 relative ${viewMode === 'list' ? 'w-48 h-full border-r border-border/50' : 'w-full h-56'}`}>
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
            </div>

            {/* Content Container */}
            <CardContent className={`flex-1 flex flex-col w-full ${viewMode === 'list' ? 'p-6' : 'p-5'}`}>
                {/* Title */}
                <div className="mb-3">
                    <Skeleton className="h-5 w-11/12 mb-2 rounded-md" />
                    <Skeleton className="h-5 w-2/3 rounded-md" />
                </div>

                {/* Store & Rating */}
                <div className="flex flex-col gap-2 mb-4">
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                </div>

                {/* Space Filler */}
                <div className="flex-1" />

                {/* Price & Actions */}
                <div className="mt-auto">
                    {/* Price */}
                    <Skeleton className="h-8 w-1/3 mb-4 rounded-md" />

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full">
                        <Skeleton className="h-9 flex-1 rounded-lg" />
                        <Skeleton className="h-9 flex-none w-12 rounded-lg" />
                    </div>
                </div>
            </CardContent>

        </Card>
    );
};
