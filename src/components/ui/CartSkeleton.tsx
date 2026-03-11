import { motion } from 'framer-motion';

export function CartItemSkeleton() {
    return (
        <div className="p-8 group relative bg-card animate-pulse">
            <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Image Skeleton */}
                <div className="w-28 h-28 bg-background rounded-3xl flex-shrink-0 border border-border/50 shadow-sm" />

                {/* Info Skeleton */}
                <div className="flex-1 space-y-3 w-full sm:w-auto">
                    <div className="h-6 bg-background rounded-full w-3/4 sm:w-1/2" />
                    <div className="h-3 bg-background rounded-full w-1/4" />
                    <div className="flex items-center gap-5 mt-4">
                        <div className="h-8 bg-background rounded-full w-24" />
                    </div>
                </div>

                {/* Controller Skeleton */}
                <div className="flex items-center gap-4">
                    <div className="w-32 h-12 bg-background rounded-2xl border border-border" />
                    <div className="w-12 h-12 bg-background rounded-2xl border border-border" />
                </div>
            </div>
        </div>
    );
}

export function CartSummarySkeleton() {
    return (
        <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-xl animate-pulse">
            <div className="h-6 bg-background rounded-full w-1/2 mb-10" />
            <div className="space-y-6 mb-10">
                <div className="flex justify-between">
                    <div className="h-3 bg-background rounded-full w-1/3" />
                    <div className="h-3 bg-background rounded-full w-1/4" />
                </div>
                <div className="flex justify-between">
                    <div className="h-3 bg-background rounded-full w-1/4" />
                    <div className="h-3 bg-background rounded-full w-1/6" />
                </div>
                <div className="pt-8 border-t border-border mt-8">
                    <div className="h-4 bg-background rounded-full w-1/3 mb-2" />
                    <div className="h-10 bg-background rounded-full w-1/2" />
                </div>
            </div>
            <div className="h-16 bg-background rounded-3xl w-full mb-4" />
            <div className="h-12 bg-background rounded-2xl w-full" />
        </div>
    );
}
