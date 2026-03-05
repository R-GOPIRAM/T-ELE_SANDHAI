import React from 'react';
import { Skeleton } from '../common/Skeleton';

interface ProductCardSkeletonProps {
    viewMode?: 'grid' | 'list';
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ viewMode = 'grid' }) => {
    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex space-x-6 animate-pulse">
                <Skeleton className="w-40 h-40 rounded-2xl flex-shrink-0" />
                <div className="flex-1 flex flex-col py-2">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2 flex-1 mr-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="mt-auto flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex space-x-3">
                            <Skeleton className="h-10 w-28 rounded-xl" />
                            <Skeleton className="h-10 w-32 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
            <Skeleton className="w-full pt-[85%]" />
            <div className="p-5 flex-1 flex flex-col">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex justify-between mb-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-8 w-1/3 mb-6" />
                <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-3">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 flex-[2] rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};
