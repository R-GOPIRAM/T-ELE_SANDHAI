import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Grid, List, X, Check, ChevronDown, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../features/products/ProductCard';
import ProductSkeleton from '../features/products/ProductSkeleton';
import { useProductStore } from '../store/productStore';

export default function ProductsPage() {
  // Query State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState(0);
  const [isBargainableOnly, setIsBargainableOnly] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);

  // UI State
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Store
  const { products, loading, total, fetchProducts } = useProductStore();

  const categories = useMemo(() => [
    { id: '', name: 'All Electronics' },
    { id: 'smartphones', name: 'Smartphones' },
    { id: 'laptops', name: 'Laptops & PCs' },
    { id: 'audio', name: 'Audio & Headphones' },
    { id: 'wearables', name: 'Wearables' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'tv', name: 'Televisions' },
    { id: 'smarthome', name: 'Smart Home' },
    { id: 'accessories', name: 'Accessories' }
  ], []);

  const sortOptions = useMemo(() => [
    { value: 'popularity', label: 'Popularity' },
    { value: 'relevance', label: 'Best Match' },
    { value: 'price-low', label: 'Lowest Price' },
    { value: 'price-high', label: 'Highest Price' },
    { value: 'rating', label: 'Highest Rating' },
    { value: 'fastest-delivery', label: 'Fastest Delivery' }
  ], []);

  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand).filter(Boolean));
    return ['', ...Array.from(uniqueBrands)].sort();
  }, [products]);

  useEffect(() => {
    const controller = new AbortController();

    const params: Record<string, string | number | boolean> = {
      page,
      limit: 12,
      sort: sortBy
    };

    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedBrand) params.brand = selectedBrand;
    if (priceRange.min) params.minPrice = priceRange.min;
    if (priceRange.max) params.maxPrice = priceRange.max;
    if (minRating > 0) params.rating = minRating;
    if (isBargainableOnly) params.isBargainable = true;

    const timeoutId = setTimeout(() => {
      const isFiltered = !!(searchTerm || selectedCategory || priceRange.min || priceRange.max || minRating > 0 || isBargainableOnly || page > 1);

      // Pass the signal to fetchProducts (assuming productStore supports it/passes it to axios)
      fetchProducts({ ...params, signal: controller.signal }, isFiltered);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchTerm, selectedCategory, selectedBrand, priceRange.min, priceRange.max, sortBy, page, minRating, isBargainableOnly, fetchProducts]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setMinRating(0);
    setIsBargainableOnly(false);
    setFastDelivery(false);
    setSearchTerm('');
    setPage(1);
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Categories</h3>
        <div className="flex flex-col space-y-2">
          {categories.map(cat => (
            <button
              key={cat.id || 'all'}
              onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Brands */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Brands</h3>
        <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {brands.map(brand => (
            <button
              key={brand || 'all-brands'}
              onClick={() => { setSelectedBrand(brand); setPage(1); }}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedBrand === brand
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
            >
              {brand || 'All Brands'}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Price Range</h3>
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-text-secondary font-medium">₹</span>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => { setPriceRange({ ...priceRange, min: e.target.value }); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
              placeholder="Min"
            />
          </div>
          <span className="text-border font-medium">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-text-secondary font-medium">₹</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => { setPriceRange({ ...priceRange, max: e.target.value }); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-lg focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Refine / Features */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Features</h3>
        <div className="flex flex-col space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isBargainableOnly ? 'bg-bargain border-bargain' : 'border-border group-hover:border-bargain-hover'}`}>
              {isBargainableOnly && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={isBargainableOnly} onChange={() => { setIsBargainableOnly(!isBargainableOnly); setPage(1); }} />
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">Accepts Offers (Bargain)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${fastDelivery ? 'bg-seller border-seller' : 'border-border group-hover:border-seller-hover'}`}>
              {fastDelivery && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" className="hidden" checked={fastDelivery} onChange={() => { setFastDelivery(!fastDelivery); setPage(1); }} />
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">Fast Delivery Near Me</span>
          </label>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Customer Rating */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Customer Rating</h3>
        <div className="flex flex-col space-y-2">
          {[4, 3, 2].map(rating => (
            <button
              key={rating}
              onClick={() => { setMinRating(rating); setPage(1); }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${minRating === rating ? 'bg-warning/10' : 'hover:bg-background'}`}
            >
              <div className="flex text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-border'}`} />
                ))}
              </div>
              <span className={`text-sm ${minRating === rating ? 'font-bold text-warning' : 'font-medium text-text-secondary'}`}>& Up</span>
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full text-text-secondary border-border" onClick={clearFilters}>
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">

      {/* Search Header Bar */}
      <div className="bg-card border-b border-border sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-text-secondary/50" />
              <input
                type="text"
                placeholder="Search laptops, smartphones, trusted electronics..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-text-primary placeholder-text-secondary/50"
              />
            </div>
            <Button
              className="w-full sm:w-auto lg:hidden flex items-center justify-center gap-2"
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
            >
              <Filter className="w-5 h-5" /> Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow flex flex-col md:flex-row gap-8">

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-40 bg-card p-6 rounded-2xl border border-border shadow-sm">
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[280px] bg-card shadow-2xl z-50 overflow-y-auto lg:hidden"
              >
                <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur z-10">
                  <h2 className="text-lg font-bold text-text-primary">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-background rounded-full">
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                <div className="p-6">
                  <SidebarContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Grid Column */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Results Header & Sorting */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Electronics'}
              </h1>
              <p className="text-sm text-text-secondary font-medium mt-1">
                Showing {products.length} of {total} results
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* View Toggles */}
              <div className="hidden sm:flex bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-secondary/50 hover:text-text-secondary'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary shadow-sm' : 'text-text-secondary/50 hover:text-text-secondary'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative w-full sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full appearance-none bg-card border border-border text-text-secondary py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium shadow-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-border pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Applied filters tags */}
          {(searchTerm || selectedCategory || selectedBrand || priceRange.min || priceRange.max || minRating > 0 || isBargainableOnly) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTerm && <Badge variant="outline" className="px-3 py-1 bg-card border border-border shadow-sm">"{searchTerm}" <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => { setSearchTerm(''); setPage(1) }} /></Badge>}
              {selectedBrand && <Badge variant="outline" className="px-3 py-1 bg-card border border-border shadow-sm">{selectedBrand} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => { setSelectedBrand(''); setPage(1) }} /></Badge>}
              {isBargainableOnly && <Badge variant="bargain" className="px-3 py-1 shadow-sm text-white">Bargainable <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => { setIsBargainableOnly(false); setPage(1) }} /></Badge>}
              {minRating > 0 && <Badge variant="warning" className="px-3 py-1 shadow-sm bg-warning/10 text-warning">{minRating}+ Stars <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => { setMinRating(0); setPage(1) }} /></Badge>}
              {(priceRange.min || priceRange.max) && <Badge variant="outline" className="px-3 py-1 bg-card border border-border shadow-sm">₹{priceRange.min || '0'} - ₹{priceRange.max || 'Any'} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => { setPriceRange({ min: '', max: '' }); setPage(1) }} /></Badge>}
            </div>
          )}

          {/* Grid Layouts */}
          {products.length === 0 && !loading ? (
            <div className="flex-1 bg-card rounded-2xl border border-dashed border-border flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-border" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">No hyper-local matches</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-6">We couldn't find any electronics matching your exact filters in your neighborhood.</p>
              <Button onClick={clearFilters} variant="outline" className="font-bold border-2">Clear All Filters</Button>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id || (product as { _id?: string })._id}
                  product={product}
                  viewMode={viewMode}
                />
              ))}

              {/* Skeletons append below active products when loading more */}
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={`skel-${i}`} />
              ))}
            </div>
          )}

          {/* Pagination Load More */}
          {!loading && total > products.length && (
            <div className="mt-12 flex justify-center">
              <Button size="lg" variant="outline" className="font-bold border-2 px-10" onClick={() => setPage(p => p + 1)}>
                Load More Products
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}