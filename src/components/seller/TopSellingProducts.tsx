import React from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Top Selling Products
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {products.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                        No sales data yet
                    </div>
                ) : (
                    products.map((product, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
                            <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                                <p className="text-xs text-gray-500 font-medium">{product.sales} units sold</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-extrabold text-blue-600">₹{product.revenue.toLocaleString()}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Revenue</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
