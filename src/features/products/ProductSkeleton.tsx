export default function ProductSkeleton() {
    return (
        <div className="bg-card rounded-[32px] border border-border overflow-hidden animate-pulse shadow-sm">
            <div className="aspect-square bg-background relative">
                <div className="absolute top-4 left-4 w-20 h-6 bg-card/80 rounded-full" />
            </div>
            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <div className="h-4 bg-background rounded-full w-3/4" />
                    <div className="h-3 bg-background rounded-full w-1/2" />
                </div>
                <div className="flex justify-between items-end pt-2">
                    <div className="space-y-2">
                        <div className="h-5 bg-background rounded-lg w-20" />
                        <div className="h-3 bg-background rounded-full w-12" />
                    </div>
                    <div className="w-12 h-12 bg-background rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
