import { useState } from 'react';
import {
  Store,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  IndianRupee,
  Phone,
  MapPin,
  Building,
  FileCheck
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const sellerSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessAddress: z.string().min(10, 'Complete business address is required'),
  businessPhone: z.string().min(10, 'Valid phone number is required'),
  gstin: z.string().optional(),
  panNumber: z.string().min(10, 'Valid PAN Number (10 chars) is required').max(10),
  laborDeptCert: z.string().optional(),
  bankAccount: z.string().min(9, 'Valid bank account number is required'),
  ifscCode: z.string().min(11, 'Valid IFSC code (11 chars) is required'),
  businessDescription: z.string().min(20, 'Please provide a brief description (min 20 chars)'),
  businessCategory: z.string().min(1, 'Category is required'),
  yearsInBusiness: z.number().int().min(0, 'Years in business cannot be negative'),
});

type SellerFormData = z.infer<typeof sellerSchema>;

export default function SellerRegistrationPage() {
  useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    aadhaar: null,
    pan: null,
    gstin: null,
    laborCert: null,
    businessLicense: null
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      yearsInBusiness: 0,
      businessCategory: '',
      gstin: '',
      panNumber: ''
    } as Partial<SellerFormData>
  });

  const formData = watch();

  const steps = [
    { number: 1, title: 'Profile', description: 'Business foundations', icon: Store },
    { number: 2, title: 'Legal', description: 'Identity & Compliance', icon: ShieldCheck },
    { number: 3, title: 'Settlement', description: 'Banking configurations', icon: IndianRupee },
    { number: 4, title: 'Finalize', description: 'Review application', icon: FileCheck }
  ] as const;

  const businessCategories = [
    'Electronics & Gadgets',
    'Fashion & Clothing',
    'Home & Kitchen',
    'Books & Stationery',
    'Sports & Fitness',
    'Beauty & Personal Care',
    'Automotive',
    'Others'
  ];

  const handleFileUpload = (key: string, file: File) => {
    setDocuments(prev => ({ ...prev, [key]: file }));
  };

  const nextStep = async () => {
    let fields: (keyof SellerFormData)[] = [];
    if (currentStep === 1) fields = ['businessName', 'businessCategory', 'businessAddress', 'businessPhone', 'yearsInBusiness', 'businessDescription'];
    if (currentStep === 2) fields = ['panNumber', 'gstin'];
    if (currentStep === 3) fields = ['bankAccount', 'ifscCode'];

    const result = await trigger(fields);
    if (result) {
      if (currentStep === 2) {
        if (!documents.aadhaar || !documents.pan) {
          toast.error('Aadhaar and PAN documents are mandatory');
          return;
        }
      }
      setCurrentStep(prev => Math.min(4, prev + 1));
    } else {
      toast.error('Please resolve the errors in the form');
    }
  };

  const onFormSubmit = async (data: SellerFormData) => {
    try {
      setIsSubmitting(true);
      const submissionData = new FormData();

      // Append text fields
      Object.entries(data).forEach(([key, value]) => {
        submissionData.append(key, String(value));
      });

      // Append files
      Object.entries(documents).forEach(([key, file]) => {
        if (file) submissionData.append(key, file);
      });

      await api.post('/sellers/register', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Application submitted! Manual verification in progress.', {
        duration: 6000,
        icon: '🚀'
      });
      navigate('/dashboard/seller');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Submission failed. Please check your data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/50 py-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20"
          >
            <Building className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-3 uppercase italic">Seller Registration</h1>
          <p className="text-text-secondary font-medium max-w-lg mx-auto leading-relaxed">Join the LocalMart ecosystem and take your neighborhood business digital with our verified merchant portal.</p>
        </div>

        {/* Stepper UI */}
        <div className="max-w-4xl mx-auto mb-16 relative px-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-background -translate-y-1/2 z-0 rounded-full" />
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-primary border-card text-white shadow-xl shadow-primary/30' :
                      isCompleted ? 'bg-seller border-card text-white shadow-lg shadow-success-500/20' :
                        'bg-card border-card text-text-secondary/30'
                      }`}
                  >
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </motion.div>
                  <div className="absolute -bottom-10 flex flex-col items-center w-32">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : isCompleted ? 'text-seller' : 'text-text-secondary/30'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Main Area */}
        <div className="bg-card/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-border/50 border border-card p-10 md:p-14 mt-20 overflow-hidden relative">

          <form onSubmit={handleSubmit(onFormSubmit)}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0"><Briefcase className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter">Business profile</h3>
                      <p className="text-xs text-text-secondary/50 font-bold uppercase tracking-widest">Identify your brand presence</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="Registered Entity Name" icon={Building} placeholder="LocalMart Solutions Ltd." {...register('businessName')} error={errors.businessName?.message} />

                    <div className="space-y-2">
                      <label className="block text-sm font-black text-text-secondary uppercase tracking-widest px-1">Industry Vertical</label>
                      <select
                        {...register('businessCategory')}
                        className={`w-full bg-background/50 border-2 rounded-2xl py-3.5 px-4 font-medium text-text-primary focus:bg-card transition-all ${errors.businessCategory ? 'border-red-500' : 'border-gray-50'}`}
                      >
                        <option value="">Choose your niche</option>
                        {businessCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.businessCategory && <p className="text-xs font-bold text-danger px-2">{errors.businessCategory.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <Input label="Physical Headquarters Address" icon={MapPin} placeholder="Suite 404, Tech Park, Chennai" {...register('businessAddress')} error={errors.businessAddress?.message} />
                    </div>

                    <Input label="Operational Contact" icon={Phone} placeholder="+91 00000 00000" {...register('businessPhone')} error={errors.businessPhone?.message} />
                    <Input label="Experience (Years)" type="number" {...register('yearsInBusiness')} error={errors.yearsInBusiness?.message} />

                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-black text-text-secondary uppercase tracking-widest px-1">Professional Narrative</label>
                      <textarea
                        rows={4}
                        placeholder="Briefly describe your inventory specialization and market reach..."
                        {...register('businessDescription')}
                        className={`w-full bg-background/50 border-2 rounded-2xl py-4 px-6 font-medium text-text-secondary focus:bg-card outline-none resize-none transition-all ${errors.businessDescription ? 'border-red-500' : 'border-border'}`}
                      />
                      {errors.businessDescription && <p className="text-xs font-bold text-danger px-2">{errors.businessDescription.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0"><ShieldCheck className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter">Compliance & verify</h3>
                      <p className="text-xs text-text-secondary/50 font-bold uppercase tracking-widest">Upload government-issued credentials</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input label="PAN Card Number" icon={FileText} placeholder="ABCDE1234F" {...register('panNumber')} error={errors.panNumber?.message} />
                    <Input label="GSTIN Identification" icon={ShieldCheck} placeholder="Optional for small scale" {...register('gstin')} error={errors.gstin?.message} />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-border">
                    {[
                      { key: 'aadhaar', label: 'Identity Proof (Aadhaar/Passport)', required: true },
                      { key: 'pan', label: 'PAN Card Digital Copy', required: true },
                      { key: 'gstin', label: 'GST Certificate (if applicable)', required: false },
                      { key: 'businessLicense', label: 'Commerce/Trade License', required: false }
                    ].map((doc) => (
                      <div key={doc.key} className="group relative bg-background/50 rounded-3xl p-6 border-2 border-dashed border-border hover:border-primary-300 hover:bg-card transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${documents[doc.key] ? 'bg-seller/20 text-seller' : 'bg-card text-text-secondary/50'}`}>
                              {documents[doc.key] ? <CheckCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-black text-text-primary uppercase tracking-widest text-[11px] flex items-center gap-2">
                                {doc.label} {doc.required && <Badge variant="primary" className="py-0 text-[8px] bg-red-100 text-danger border-0">Required</Badge>}
                              </p>
                              <p className="text-xs text-text-secondary/50 font-medium">{documents[doc.key] ? documents[doc.key]?.name : 'Maximum file size: 5MB (PDF/JPG/PNG)'}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="file"
                              id={`file-${doc.key}`}
                              className="hidden"
                              onChange={e => e.target.files?.[0] && handleFileUpload(doc.key, e.target.files[0])}
                            />
                            <label htmlFor={`file-${doc.key}`} className="cursor-pointer px-6 py-2.5 bg-card border border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                              {documents[doc.key] ? 'Change Asset' : 'Select Asset'}
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0"><IndianRupee className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter">Settlement nodes</h3>
                      <p className="text-xs text-text-secondary/50 font-bold uppercase tracking-widest">Configure your payout channel</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <Input label="Settlement Account Number" icon={Building} placeholder="0000 0000 0000 0000" {...register('bankAccount')} error={errors.bankAccount?.message} />
                    </div>
                    <Input label="IFSC Protocol" icon={ShieldCheck} placeholder="SBIN0000000" {...register('ifscCode')} error={errors.ifscCode?.message} />
                    <div className="p-6 bg-primary/10/50 rounded-3xl border border-primary/20 flex items-start gap-4">
                      <AlertCircle className="w-6 h-6 text-primary mt-1 shrink-0" />
                      <p className="text-[10px] text-primary-900/60 font-black uppercase tracking-tight leading-relaxed">Ensure bank matches PAN entity. Settlement is usually processed within 24 hours of successful sale confirmation.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 text-center">
                  <h3 className="text-3xl font-black text-text-primary uppercase tracking-tighter mb-4">Final Manifest Review</h3>

                  <div className="bg-background/50 rounded-[2.5rem] border border-border p-8 text-left grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">Brand</p>
                        <p className="font-black text-text-primary text-xl">{formData.businessName}</p>
                        <Badge variant="primary">{formData.businessCategory}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">Base Of Operations</p>
                        <p className="font-bold text-text-secondary text-sm leading-relaxed">{formData.businessAddress}</p>
                      </div>
                    </div>

                    <div className="space-y-6 border-l border-border pl-8 md:pl-12">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">Tax Identity</p>
                        <p className="font-black text-text-primary">PAN: {formData.panNumber}</p>
                        {formData.gstin && <p className="text-xs text-text-secondary font-bold">GST: {formData.gstin}</p>}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-text-secondary/50 uppercase tracking-widest">Settlement Hub</p>
                        <p className="font-black text-text-primary">ACC: {formData.bankAccount.slice(-4).padStart(12, '•')}</p>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest">IFSC: {formData.ifscCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-900 rounded-[2rem] p-8 text-white text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <AlertCircle className="w-24 h-24" />
                    </div>
                    <div className="relative flex items-center gap-6">
                      <div className="w-14 h-14 bg-card/20 backdrop-blur rounded-2xl flex items-center justify-center shrink-0">
                        <AlertCircle className="w-8 h-8 text-primary-100" />
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-widest text-sm mb-1">Agreement of Trust</h4>
                        <p className="text-[10px] text-primary-100/70 font-bold leading-relaxed">By submitting, you certify that all assets and legal credentials provided are authentic. Misrepresentation will result in immediate hub expulsion and legal pursuit.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Console */}
            <div className="flex justify-between mt-16 pt-10 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-3 text-text-secondary/50 hover:text-text-primary font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-20 group"
              >
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-card group-hover:border-primary/20 transition-all">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
                Back Step
              </button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 group"
                >
                  Proceed Forward
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="px-16 py-6 rounded-2xl font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-gray-900/10 group bg-gray-900 hover:bg-black"
                >
                  {isSubmitting ? 'Syncing...' : 'Initiate Application'}
                  <Sparkles className="ml-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}