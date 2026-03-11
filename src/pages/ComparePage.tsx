import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingCart, Star, Store, Gauge, Cpu, Monitor, Battery } from 'lucide-react';
import { useCompareStore } from '../store/compareStore';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function ComparePage() {
    const navigate = useNavigate();
    const { items, removeItem, clearItems } = useCompareStore();
    const { addToCart } = useCart();

    const handleAddToCart = (product: any) => {
        addToCart(product, 1);
    };

    const attributes = [
        { label: 'Price', key: 'price', icon: Gauge, format: (val: number) => `₹${val.toLocaleString()}` },
        { label: 'Brand', key: 'brand', icon: Cpu },
        { label: 'Battery', key: 'battery', icon: Battery, specPath: 'Battery' },
        { label: 'Display', key: 'display', icon: Monitor, specPath: 'Display' },
        { label: 'Rating', key: 'rating', icon: Star, format: (val: number) => `${val}/5` },
        { label: 'Seller', key: 'sellerName', icon: Store },
    ];

    const getAttributeValue = (product: any, attr: any) => {
        if (attr.specPath) {
            return product.specifications?.[attr.specPath] || 'N/A';
        }
        const val = product[attr.key];
        return attr.format ? attr.format(val) : val || 'N/A';
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-text-secondary hover:text-primary transition-colors mb-4 group"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Shopping
                        </button>
                        <h1 className="text-4xl font-heading font-black tracking-tighter text-text-primary uppercase italic">
                            Compare <span className="text-primary">Electronics</span>
                        </h1>
                        <p className="text-text-secondary mt-2 font-medium">Side-by-side analysis of your top choices.</p>
                    </div>

                    {items.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={clearItems}
                            className="flex items-center gap-2 border-danger/20 text-danger hover:bg-danger/5"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Comparison
                        </Button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 glass-panel border-dashed border-2 border-border/50">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                            <Gauge className="w-10 h-10 text-primary/30" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">No products to compare</h2>
                        <p className="text-text-secondary mb-8">Add items from the marketplace to start comparing.</p>
                        <Button onClick={() => navigate('/products')} variant="primary" className="px-10 font-black tracking-widest uppercase py-4 rounded-full">
                            Go to Marketplace
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-4 custom-scrollbar">
                        <div className="min-w-[800px]">
                            {/* Product Grid Header */}
                            <div className="grid grid-cols-4 gap-6 mb-8">
                                <div className="flex items-end">
                                    <Badge variant="primary" className="px-4 py-1.5 uppercase tracking-widest font-black text-[10px]">
                                        Analysis Table
                                    </Badge>
                                </div>
                                {items.map((product) => (
                                    <div key={product.id} className="relative group">
                                        <div className="glass-panel p-6 relative overflow-hidden group-hover:border-primary/30 transition-all">
                                            <button
                                                onClick={() => removeItem(product.id)}
                                                className="absolute top-2 right-2 p-1.5 bg-danger/10 text-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger hover:text-white"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="h-32 mb-4 bg-background rounded-xl p-4 flex items-center justify-center">
                                                <img src={product.images[0]} alt={product.name} className="max-h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <h3 className="font-bold text-text-primary h-12 line-clamp-2 text-sm leading-tight uppercase transition-colors group-hover:text-primary">
                                                {product.name}
                                            </h3>
                                            <div className="mt-4">
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    className="w-full font-black text-[10px] tracking-widest uppercase shadow-lg shadow-primary/20"
                                                    onClick={() => handleAddToCart(product)}
                                                >
                                                    <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Placeholder if less than 3 */}
                                {items.length < 3 && Array(3 - items.length).fill(0).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        onClick={() => navigate('/products')}
                                        className="glass-panel border-dashed border-2 flex flex-col items-center justify-center p-6 text-text-secondary/30 hover:text-primary/50 hover:border-primary/30 transition-all cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <span className="text-2xl font-light">+</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Add Device</span>
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            <div className="space-y-px bg-border/30 rounded-3xl overflow-hidden border border-border/30 shadow-2xl">
                                {attributes.map((attr, idx) => {
                                    const Icon = attr.icon;
                                    return (
                                        <div key={idx} className="grid grid-cols-4 bg-card group">
                                            <div className="p-6 bg-background/40 flex items-center gap-4 border-r border-border/30 group-hover:bg-primary/5 transition-colors">
                                                <div className="w-10 h-10 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:border-primary/20 transition-all group-hover:rotate-6 shadow-sm">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-[0.15em] text-text-primary">{attr.label}</span>
                                            </div>
                                            {items.map((product) => (
                                                <div key={product.id} className="p-6 flex items-center justify-center text-center font-bold text-text-primary bg-card/50 transition-colors hover:bg-background/20">
                                                    {attr.label === 'Rating' ? (
                                                        <div className="flex items-center gap-1 text-warning">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            <span className="text-sm font-black tracking-tight">{product.rating || 'New'}</span>
                                                        </div>
                                                    ) : attr.label === 'Price' ? (
                                                        <span className="text-lg font-black tracking-tighter text-primary">
                                                            {getAttributeValue(product, attr)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm tracking-tight text-text-secondary group-hover:text-text-primary transition-colors">
                                                            {getAttributeValue(product, attr)}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {/* Fill empty columns rows */}
                                            {items.length < 3 && Array(3 - items.length).fill(0).map((_, i) => (
                                                <div key={`empty-row-${i}`} className="bg-card/30 p-6 flex items-center justify-center italic text-text-secondary/10 text-[10px] font-black uppercase">
                                                    No Selection
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
