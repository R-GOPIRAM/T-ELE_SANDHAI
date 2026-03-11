import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Package,
  Layers,
  IndianRupee,
  Settings,
  Sparkles,
  Zap,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/apiClient';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  brand: z.string().min(2, 'Brand name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  originalPrice: z.number().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  stock: z.number().min(0, 'Stock cannot be negative'),
  features: z.array(z.string().min(1, 'Feature cannot be empty')).min(1, 'Add at least one feature'),
  specifications: z.array(z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string().min(1, 'Value is required')
  })).min(1, 'Add at least one specification'),
  images: z.array(z.string()).min(1, 'Add at least one image')
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    trigger
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      features: [''],
      specifications: [{ key: '', value: '' }],
      images: [],
      stock: 0
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          const product = data.data;

          // Convert specifications object back to array for form
          const specsArray = Object.entries(product.specifications || {}).map(([key, value]) => ({
            key,
            value: String(value)
          }));

          reset({
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category,
            subcategory: product.subcategory,
            stock: product.stock,
            features: product.features?.length ? product.features : [''],
            specifications: specsArray.length ? specsArray : [{ key: '', value: '' }],
            images: product.images || []
          });
        } catch (err) {
          toast.error('Failed to load product details');
          navigate('/dashboard/seller');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, reset, navigate]);

  const features = watch('features');
  const specifications = watch('specifications');
  const images = watch('images');

  const categories = [
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'audio', label: 'Audio & Headphones' },
    { value: 'cameras', label: 'Cameras' },
    { value: 'tablets', label: 'Tablets' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const handleNext = async () => {
    let fieldsToValidate: (keyof ProductFormData)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'brand', 'category', 'subcategory', 'description'];
    if (step === 2) fieldsToValidate = ['price', 'originalPrice', 'stock'];
    if (step === 3) fieldsToValidate = ['images'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const handlePrev = () => setStep(s => s - 1);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const productPayload = {
        ...data,
        specifications: data.specifications.reduce((acc, spec) => {
          acc[spec.key] = spec.value;
          return acc;
        }, {} as Record<string, string>),
        isAvailable: true
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, productPayload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', productPayload);
        toast.success('Product deployed to marketplace successfully!');
      }
      navigate('/dashboard/seller');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Operation failed', err);
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'list'} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Mock upload - in production this would be S3/Cloudinary
    const imageUrls = files.map(() =>
      `https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400`
    );
    setValue('images', [...images, ...imageUrls].slice(0, 5));
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-8 mt-16 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <button
              onClick={() => navigate('/dashboard/seller')}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-black uppercase tracking-widest text-[10px] mb-4 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Manifest Control
            </button>
            <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-4">
              {isEditMode ? (
                <Edit className="w-10 h-10 text-primary p-2 bg-card rounded-2xl shadow-sm border border-border" />
              ) : (
                <Plus className="w-10 h-10 text-primary p-2 bg-card rounded-2xl shadow-sm border border-border" />
              )}
              {isEditMode ? 'Modify Product Manifest' : 'New Product Deployment'}
            </h1>
          </div>
          <div className="flex gap-2 bg-card p-1.5 rounded-2xl border border-border shadow-sm">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`w-12 h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-border'}`}
              />
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-card rounded-[3rem] border border-border border-dashed">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-primary mb-6"
            >
              <Zap size={40} />
            </motion.div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Synchronizing Product Data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Main Form Area */}
            <div className="lg:col-span-8 bg-card rounded-[3rem] border border-border shadow-2xl shadow-border/50 p-10 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Core Identity</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Input
                        label="Product Designation"
                        placeholder="e.g. Sony WH-1000XM5"
                        {...register('name')}
                        error={errors.name?.message}
                      />
                      <Input
                        label="Brand Lineage"
                        placeholder="e.g. Sony"
                        {...register('brand')}
                        error={errors.brand?.message}
                      />
                      <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Market Segment</label>
                        <select
                          {...register('category')}
                          className={`w-full h-14 px-6 bg-background border-2 rounded-2xl text-sm font-bold focus:outline-none transition-all ${errors.category ? 'border-danger/20 focus:border-danger text-danger' : 'border-background focus:border-primary focus:bg-card'
                            }`}
                        >
                          <option value="">Select Segment</option>
                          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        {errors.category && <p className="mt-2 text-[10px] font-bold text-danger uppercase tracking-widest px-1">{errors.category.message}</p>}
                      </div>
                      <Input
                        label="Sub-Series (Optional)"
                        placeholder="e.g. Wireless Noise Cancelling"
                        {...register('subcategory')}
                      />
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 px-1">Technical Brief</label>
                        <textarea
                          {...register('description')}
                          rows={5}
                          className={`w-full px-6 py-4 bg-background border-2 rounded-3xl text-sm font-medium focus:outline-none transition-all ${errors.description ? 'border-danger/20 focus:border-danger' : 'border-background focus:border-primary focus:bg-card'
                            }`}
                          placeholder="Detailed engineering and aesthetic description..."
                        />
                        {errors.description && <p className="mt-2 text-[10px] font-bold text-danger uppercase tracking-widest px-1">{errors.description.message}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <IndianRupee className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Value & Inventory</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <Input
                        label="Acquisition Cost"
                        type="number"
                        placeholder="9999"
                        {...register('price', { valueAsNumber: true })}
                        error={errors.price?.message}
                      />
                      <Input
                        label="Market Baseline (MRP)"
                        type="number"
                        placeholder="12999"
                        {...register('originalPrice', { valueAsNumber: true })}
                        error={errors.originalPrice?.message}
                      />
                      <Input
                        label="Available Units"
                        type="number"
                        placeholder="25"
                        {...register('stock', { valueAsNumber: true })}
                        error={errors.stock?.message}
                      />
                    </div>

                    <div className="bg-primary/10 rounded-[2rem] p-8 border border-primary/20 flex items-start gap-6">
                      <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Pricing Logic</p>
                        <p className="text-xs text-primary/60 font-medium leading-relaxed">Lower acquisition costs compared to market baseline enhance product prominence in neighborhood search results.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Visual Assets</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="border-4 border-dashed border-border rounded-[3rem] p-10 flex flex-col items-center justify-center text-center group hover:border-primary/20 transition-all bg-background/50">
                        <div className="w-20 h-20 bg-card rounded-[2rem] shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Upload className="w-10 h-10 text-primary" />
                        </div>
                        <p className="font-black text-text-primary uppercase tracking-widest text-xs mb-2">High-Fidelity Captures</p>
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-8 leading-relaxed">PNG, JPG up to 10MB.<br />Max 5 premium assets.</p>
                        <label className="relative cursor-pointer bg-text-primary text-card px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/20 transition-all">
                          Upload Elements
                          <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {images.map((img, idx) => (
                          <div key={idx} className="aspect-square bg-card rounded-3xl border border-border overflow-hidden relative group p-2">
                            <img src={img} className="w-full h-full object-cover rounded-2xl mix-blend-multiply" />
                            <button
                              type="button"
                              onClick={() => setValue('images', images.filter((_, i) => i !== idx))}
                              className="absolute top-4 right-4 w-8 h-8 bg-danger text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
                          <div key={i} className="aspect-square border-2 border-dashed border-border rounded-3xl" />
                        ))}
                      </div>
                    </div>
                    {errors.images && <p className="text-[10px] font-bold text-danger uppercase tracking-widest px-1">{errors.images.message}</p>}
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Technical Spec Sheet</h2>
                    </div>

                    <div className="space-y-10">
                      <div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-6 px-1">Key Performance Features</p>
                        <div className="space-y-4">
                          {features.map((_, idx) => (
                            <div key={idx} className="flex gap-4">
                              <input
                                {...register(`features.${idx}`)}
                                className="flex-1 h-14 px-6 bg-background border-2 border-background rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:bg-card transition-all"
                                placeholder="e.g. Adaptive Noise Cancellation"
                              />
                              {features.length > 1 && (
                                <button type="button" onClick={() => setValue('features', features.filter((_, i) => i !== idx))} className="w-14 bg-danger/10 text-danger rounded-2xl flex items-center justify-center hover:bg-danger hover:text-white transition-all">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setValue('features', [...features, ''])}
                            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest px-2 hover:translate-x-1 transition-transform"
                          >
                            <Plus className="w-4 h-4" /> Add Intelligence Feature
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-6 px-1">Hardware Specifications</p>
                        <div className="space-y-4">
                          {specifications.map((_, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative pr-20">
                              <input
                                {...register(`specifications.${idx}.key`)}
                                className="h-14 px-6 bg-background border-2 border-background rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:bg-card transition-all"
                                placeholder="Key (e.g. Battery)"
                              />
                              <input
                                {...register(`specifications.${idx}.value`)}
                                className="h-14 px-6 bg-background border-2 border-background rounded-2xl text-sm font-bold focus:outline-none focus:border-primary focus:bg-card transition-all"
                                placeholder="Value (e.g. 30 Hours)"
                              />
                              {specifications.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setValue('specifications', specifications.filter((_, i) => i !== idx))}
                                  className="absolute right-0 top-0 bottom-0 w-14 bg-danger/10 text-danger rounded-2xl flex items-center justify-center hover:bg-danger hover:text-white transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setValue('specifications', [...specifications, { key: '', value: '' }])}
                            className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest px-2 hover:translate-x-1 transition-transform"
                          >
                            <Plus className="w-4 h-4" /> Add Hardware Node
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terminal Actions */}
              <div className="mt-16 pt-10 border-t border-border flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-3 text-text-secondary hover:text-text-primary font-black uppercase tracking-widest text-[10px] transition-all group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return Phase
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/seller')}
                    className="text-text-secondary hover:text-danger font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Terminate Deployment
                  </button>
                )}

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="rounded-2xl px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] group shadow-xl shadow-primary/10"
                  >
                    Advance Phase <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-2xl px-12 py-5 text-[10px] font-black uppercase tracking-[0.2em] bg-text-primary shadow-2xl shadow-text-primary/20 group relative overflow-hidden text-card hover:bg-text-secondary"
                  >
                    {isSubmitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Zap className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <span className="flex items-center gap-3">
                        {isEditMode ? 'Authorize Manifest Synchronization' : 'Initialize Marketplace Deployment'} <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform text-card" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Preview / Info Panel */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-card rounded-[3rem] p-8 border border-border shadow-2xl shadow-border/50">
                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-8 border-b border-border pb-4">Deployment Overview</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step >= 1 ? 'bg-seller/10 text-seller' : 'bg-background text-border'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">Core Identity</p>
                      <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{watch('name') || 'Pending Name'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step >= 2 ? 'bg-seller/10 text-seller' : 'bg-background text-border'}`}>
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">Value Proposition</p>
                      <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{watch('price') ? `₹${watch('price').toLocaleString()}` : 'Pending Pricing'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step >= 3 ? 'bg-seller/10 text-seller' : 'bg-background text-border'}`}>
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">Visual Verification</p>
                      <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{images.length} Assets Synchronized</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-border">
                  <div className="bg-text-primary rounded-[2rem] p-6 text-card">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-primary">Marketplace Insight</p>
                    <p className="text-[11px] font-medium leading-relaxed opacity-70 italic">"Ensure high-contrast imagery to maximize engagement metrics within the hyper-local feed."</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary rounded-[3rem] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-24 h-24" />
                </div>
                <h4 className="text-lg font-black uppercase tracking-tighter mb-4 relative z-10">Launch Protocol</h4>
                <p className="text-xs text-white/80 font-medium leading-relaxed relative z-10">{isEditMode ? 'Updates will be synchronized across the network immediately after authorization.' : 'Once deployed, your product will be immediately visible to users within your geofenced neighborhood radius.'}</p>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}