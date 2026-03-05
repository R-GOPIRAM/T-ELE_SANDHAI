import React from 'react';
import { Skeleton, SkeletonText } from '../common/Skeleton';

export const ProductDetailSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
            {/* Header Placeholder */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-20 hidden sm:block" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="bg-white rounded-3xl p-8 flex flex-col items-center">
                            <Skeleton className="w-full aspect-square max-h-[500px] rounded-2xl mb-6" />
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="w-20 h-20 rounded-xl" />
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 space-y-4">
                            <Skeleton className="h-8 w-48 mb-6" />
                            <SkeletonText lines={4} />
                        </div>

                        <div className="bg-white rounded-3xl p-8">
                            <Skeleton className="h-8 w-48 mb-8" />
                            <div className="grid grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sticky) */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-3xl p-8 space-y-6 shadow-sm border border-gray-100">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <Skeleton className="h-6 w-32 rounded-full" />

                            <Skeleton className="h-32 w-full rounded-2xl" />

                            <Skeleton className="h-20 w-full rounded-xl" />

                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
