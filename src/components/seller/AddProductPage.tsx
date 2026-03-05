import React, { useState } from 'react';
import { Package, Upload, Save, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import api from '../../services/api';

interface AddProductPageProps {
  onPageChange: (page: string) => void;
}

export default function AddProductPage({ onPageChange }: AddProductPageProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    stock: '',
    features: [''],
    specifications: [{ key: '', value: '' }],
    images: [] as string[]
  });

  const categories = [
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'audio', label: 'Audio & Headphones' },
    { value: 'cameras', label: 'Cameras' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleAddSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: '', value: '' }]
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // In a real app, you would upload these to a storage service
    // For now, we'll use placeholder URLs
    const imageUrls = files.map((_, index) =>
      `https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400`
    );
    setFormData({
      ...formData,
      images: [...formData.images, ...imageUrls].slice(0, 5) // Max 5 images
    });
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.brand || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create new product payload
      // Note: Backend expects 'body' properties directly, not wrapped in 'product' object depending on controller implementation.
      // Controller uses req.body directly. Service adds shopOwnerId.

      const price = parseInt(formData.price);
      const originalPrice = formData.originalPrice ? parseInt(formData.originalPrice) : undefined;
      const stock = parseInt(formData.stock) || 0;

      if (isNaN(price)) {
        alert('Invalid price');
        return;
      }

      const productPayload = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: price,
        originalPrice: isNaN(originalPrice as number) ? undefined : originalPrice,
        category: formData.category,
        subcategory: formData.subcategory,
        // Ensure at least one image if possible, or use placeholder
        images: formData.images.length > 0 ? formData.images : ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400'],
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: formData.specifications.reduce((acc, spec) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value;
          }
          return acc;
        }, {} as Record<string, string>),
        stock: stock,
        isAvailable: true
      };

      await api.post('/products', productPayload);

      alert('Product added successfully!');
      onPageChange('seller-dashboard');
    } catch (error: any) {
      console.error('Failed to add product', error);
      alert(`Failed to add product: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => onPageChange('seller-dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
          <p className="text-gray-600">Fill in the details to list your product on the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="iPhone 15 Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pro Series"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="134900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (MRP)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="139900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload images</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Max 5 images)</p>
              </div>

              {formData.images.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          images: formData.images.filter((_, i) => i !== index)
                        })}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a key feature"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={X}
                      onClick={() => handleRemoveFeature(index)}
                    />
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFeature}
                className="mt-2"
              >
                Add Feature
              </Button>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specification name (e.g., Display)"
                  />
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Specification value (e.g., 6.1 inch)"
                    />
                    {formData.specifications.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={X}
                        onClick={() => handleRemoveSpecification(index)}
                      />
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSpecification}
                className="mt-2"
              >
                Add Specification
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => onPageChange('seller-dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={Save}
            >
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}