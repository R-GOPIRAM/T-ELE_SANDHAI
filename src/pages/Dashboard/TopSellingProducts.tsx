import { TrendingUp } from 'lucide-react';

interface ProductData {
    name: string;
    revenue: number;
    sales: number;
    image: string;
}

interface TopSellingProductsProps {
    products: ProductData[];
}

export const TopSellingProducts: React.FC<TopSellingProductsProps> = ({ products }) => {
    return (
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Selling Products
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {products.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-text-secondary italic">
                        No sales data yet
                    </div>
                ) : (
                    products.map((product, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-2xl hover:bg-card hover:shadow-md transition-all duration-300 border border-transparent hover:border-border">
                            <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-card flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-text-primary truncate">{product.name}</h4>
                                <p className="text-xs text-text-secondary font-medium">{product.sales} units sold</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-extrabold text-primary">₹{product.revenue.toLocaleString()}</div>
                                <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Revenue</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
