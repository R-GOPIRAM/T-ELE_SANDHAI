
import { X, Star, MapPin, ShoppingCart, CheckCircle } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductComparison({ products, onClose, onAddToCart }: ProductComparisonProps) {
  if (products.length === 0) return null;

  const allFeatures = Array.from(new Set(products.flatMap(p => p.features)));
  const allSpecs = Array.from(new Set(products.flatMap(p => Object.keys(p.specifications))));

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border mb-6">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary">
          Product Comparison ({products.length} products)
        </h3>
        <button
          onClick={onClose}
          className="text-text-secondary/50 hover:text-text-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-text-primary w-48">
                Product
              </th>
              {products.map(product => (
                <th key={product.id} className="px-4 py-3 text-center min-w-64">
                  <div className="space-y-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg mx-auto"
                    />
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">{product.name}</h4>
                      <p className="text-xs text-text-secondary">{product.brand}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {/* Price */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-text-primary">Price</td>
              {products.map(product => (
                <td key={product.id} className="px-4 py-3 text-center">
                  <div className="text-lg font-bold text-text-primary">
                    ₹{product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && (
                    <div className="text-sm text-text-secondary line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="bg-background">
              <td className="px-4 py-3 text-sm font-medium text-text-primary">Rating</td>
              {products.map(product => (
                <td key={product.id} className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">{product.rating}</span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {product.reviewCount} reviews
                  </div>
                </td>
              ))}
            </tr>

            {/* Seller */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-text-primary">Seller</td>
              {products.map(product => (
                <td key={product.id} className="px-4 py-3 text-center">
                  <div className="text-sm font-medium text-text-primary">{product.sellerName}</div>
                  <div className="flex items-center justify-center text-xs text-text-secondary">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.sellerLocation}
                  </div>
                </td>
              ))}
            </tr>

            {/* Availability */}
            <tr className="bg-background">
              <td className="px-4 py-3 text-sm font-medium text-text-primary">Stock</td>
              {products.map(product => (
                <td key={product.id} className="px-4 py-3 text-center">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${product.stock > 10
                    ? 'bg-seller/20 text-green-800'
                    : product.stock > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {product.stock} units
                  </div>
                </td>
              ))}
            </tr>

            {/* Specifications */}
            {allSpecs.map(spec => (
              <tr key={spec} className={allSpecs.indexOf(spec) % 2 === 0 ? 'bg-background' : ''}>
                <td className="px-4 py-3 text-sm font-medium text-text-primary">{spec}</td>
                {products.map(product => (
                  <td key={product.id} className="px-4 py-3 text-center text-sm text-text-secondary">
                    {product.specifications[spec] || '-'}
                  </td>
                ))}
              </tr>
            ))}

            {/* Features */}
            <tr className={allSpecs.length % 2 === 0 ? 'bg-background' : ''}>
              <td className="px-4 py-3 text-sm font-medium text-text-primary">Key Features</td>
              {products.map(product => (
                <td key={product.id} className="px-4 py-3">
                  <div className="space-y-1">
                    {allFeatures.map(feature => (
                      <div key={feature} className="flex items-center justify-center text-xs">
                        {product.features.includes(feature) ? (
                          <CheckCircle className="w-3 h-3 text-seller mr-1" />
                        ) : (
                          <div className="w-3 h-3 mr-1" />
                        )}
                        <span className={product.features.includes(feature) ? 'text-text-primary' : 'text-text-secondary/50'}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr>
              <td className="px-4 py-4 text-sm font-medium text-text-primary">Actions</td>
              {products.map(product => (
                <td key={product.id} className="px-4 py-4 text-center">
                  <Button
                    size="sm"
                    icon={ShoppingCart}
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full"
                  >
                    Add to Cart
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}