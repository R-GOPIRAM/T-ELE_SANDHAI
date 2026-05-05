import { useState, useEffect } from 'react';
import {
    Package,
    AlertTriangle,
    Edit,
    Save,
    X,
    RefreshCw,
    Search
} from 'lucide-react';
import { Product } from '../../types';
import api from '../../services/apiClient';
import toast from 'react-hot-toast';

export default function SellerInventory() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editStock, setEditStock] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products/seller/my-products');
            setProducts(data.data);
        } catch (_error) {
            toast.error('Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleUpdateStock = async (productId: string) => {
        try {
            await api.patch(`/products/${productId}/stock`, { stock: editStock });
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: editStock } : p));
            setEditingId(null);
            toast.success('Stock updated');
        } catch (_error) {
            toast.error('Failed to update stock');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockProducts = products.filter(p => p.stock <= 5);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-text-primary uppercase tracking-tight">Inventory Manager</h1>
                    <p className="text-text-secondary font-medium mt-1">Keep your shelf stocked and sync with local demand.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-card border border-border rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={fetchProducts}
                        className="p-3 bg-card border border-border rounded-2xl text-text-secondary/50 hover:text-primary transition-all shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {lowStockProducts.length > 0 && (
                <div className="bg-danger/10 border border-red-100 rounded-3xl p-6 flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-danger" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-red-900 uppercase tracking-tight">Low Stock Alerts</h3>
                        <p className="text-red-700 font-medium mt-1 text-sm">
                            {lowStockProducts.length} items are running low. Restock soon to avoid missing local orders.
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-background/50 border-b border-border text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Product</th>
                            <th className="px-8 py-5">Category</th>
                            <th className="px-8 py-5">Current Stock</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-background/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-background rounded-2xl border border-border overflow-hidden p-1">
                                            <img src={product.images[0]} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-text-primary uppercase text-sm">{product.name}</h4>
                                            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{product.brand}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs font-bold text-text-secondary/50 uppercase tracking-widest">
                                    {product.category}
                                </td>
                                <td className="px-8 py-6">
                                    {editingId === product.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editStock}
                                                onChange={(e) => setEditStock(parseInt(e.target.value))}
                                                className="w-20 px-3 py-1.5 bg-background border border-border rounded-xl text-sm font-black focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                            <span className="text-[10px] font-bold text-text-secondary/50 uppercase">Units</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${product.stock <= 5 ? 'bg-danger/10 text-danger' : 'bg-seller/10 text-seller'
                                                }`}>
                                                {product.stock} Units
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {editingId === product.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleUpdateStock(product.id)}
                                                className="p-2 bg-primary text-white rounded-xl shadow-md hover:bg-primary-hover transition-all"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 bg-background text-text-secondary/50 rounded-xl hover:text-danger transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setEditingId(product.id); setEditStock(product.stock); }}
                                            className="p-2 opacity-0 group-hover:opacity-100 text-text-secondary/50 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="p-20 text-center">
                        <Package className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                        <p className="text-text-secondary/50 font-bold uppercase tracking-widest text-sm">No products found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
