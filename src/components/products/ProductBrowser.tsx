import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';
import ProductCard from './ProductCard';
import ProductComparison from './ProductComparison';
import api from '../../services/api';
import { Product } from '../../types';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductBrowserProps {
  onPageChange: (page: string) => void;
}

export default function ProductBrowser({ onPageChange }: ProductBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const { addToCart } = useCart();

  const categories = [
    'All Categories',
    'smartphones',
    'laptops',
    'audio',
    'cameras',
    'tablets',
    'accessories'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest First' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          page,
          limit: 12,
          sort: sortBy
        };

        if (searchTerm) params.search = searchTerm;
        if (selectedCategory && selectedCategory !== 'All Categories') params.category = selectedCategory;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;

        const { data } = await api.get('/products', { params });
        setProducts(data.data);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, priceRange, sortBy, page]);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId].slice(0, 3) // Max 3 products for comparison
    );
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Browse Products</h1>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">Discover amazing products from verified local retailers tailored just for you.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors duration-200 ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-96 opacity-100 mt-6 pt-6 border-t border-gray-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category Pills */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => {
                    const value = category === 'All Categories' ? '' : category;
                    const isSelected = selectedCategory === value;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(value)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Price Range
                  </label>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Min"
                    />
                  </div>
                  <span className="text-gray-400 font-medium">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPriceRange({ min: '', max: '' });
                      setSelectedCategory('');
                      setSearchTerm('');
                    }}
                    className="text-sm px-4 py-1.5 h-auto text-gray-500 border-gray-200 hover:bg-gray-100"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {products.length} of {total} products
          </p>

          {selectedProducts.length > 0 && (
            <Button
              onClick={() => setSelectedProducts([])}
              variant="outline"
            >
              Clear Selection ({selectedProducts.length})
            </Button>
          )}
        </div>

        {/* Product Comparison */}
        {selectedProducts.length > 1 && (
          <ProductComparison
            products={products.filter(p => selectedProducts.includes(p.id))}
            onClose={() => setSelectedProducts([])}
            onAddToCart={addToCart}
          />
        )}

        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
            }`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          /* Product Grid */
          <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
            }`}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                isSelected={selectedProducts.includes(product.id)}
                onSelect={() => handleProductSelect(product.id)}
                onAddToCart={addToCart}
                showComparison={selectedProducts.length > 0}
                onViewDetails={(id) => onPageChange(`product:${id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls (Simple) */}
        {!loading && total > products.length && (
          <div className="mt-8 flex justify-center">
            <Button onClick={() => setPage(p => p + 1)} variant="outline">Load More</Button>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceRange({ min: '', max: '' });
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}