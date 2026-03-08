import React from 'react';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';

export const ProductDetailSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-background pb-20 animate-pulse">
            {/* Header Placeholder */}
            <div className="bg-card border-b border-border py-4">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-20 hidden sm:block" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="bg-card rounded-[2.5rem] p-10 flex flex-col items-center shadow-sm border border-border">
                            <Skeleton className="w-full aspect-square max-h-[550px] rounded-3xl mb-8" />
                            <div className="flex gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="w-24 h-24 rounded-2xl" />
                                ))}
                            </div>
                        </div>

                        <div className="bg-card rounded-[2.5rem] p-10 space-y-6 shadow-sm border border-border">
                            <Skeleton className="h-10 w-64 mb-4" />
                            <SkeletonText lines={5} />
                        </div>

                        <div className="bg-card rounded-[2.5rem] p-10 shadow-sm border border-border">
                            <Skeleton className="h-10 w-64 mb-10" />
                            <div className="grid grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sticky) */}
                    <div className="lg:col-span-4">
                        <div className="bg-card rounded-[2.5rem] p-10 space-y-8 shadow-2xl shadow-border/50 border border-gray-50 flex flex-col">
                            <div className="space-y-4">
                                <Skeleton className="h-4 w-32 rounded-full" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>

                            <Skeleton className="h-8 w-40 rounded-full" />

                            <div className="p-6 bg-background rounded-3xl space-y-4">
                                <Skeleton className="h-24 w-full rounded-2xl" />
                                <Skeleton className="h-16 w-full rounded-2xl" />
                            </div>

                            <div className="space-y-4 pt-6">
                                <Skeleton className="h-16 w-full rounded-[2rem]" />
                                <Skeleton className="h-16 w-full rounded-[2rem]" />
                                <Skeleton className="h-16 w-full rounded-[2rem]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
