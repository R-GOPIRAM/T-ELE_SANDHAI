import React, { useState } from 'react';
import { Store, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import api from '../../services/api';

interface SellerRegistrationPageProps {
  onPageChange: (page: string) => void;
}

export default function SellerRegistrationPage({ onPageChange }: SellerRegistrationPageProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    gstin: '',
    panNumber: '',
    laborDeptCert: '',
    bankAccount: '',
    ifscCode: '',
    businessDescription: '',
    businessCategory: '',
    yearsInBusiness: '',
    documents: {
      aadhaar: null as File | null,
      pan: null as File | null,
      gstin: null as File | null,
      laborCert: null as File | null,
      businessLicense: null as File | null
    }
  });

  const steps = [
    { number: 1, title: 'Business Information', description: 'Basic business details' },
    { number: 2, title: 'Legal Documents', description: 'Government verification documents' },
    { number: 3, title: 'Bank Details', description: 'Payment and settlement information' },
    { number: 4, title: 'Review & Submit', description: 'Review your application' }
  ];

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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorObj, setErrorObj] = useState<any>(null);

  const handleFileUpload = (documentType: string, file: File) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [documentType]: file
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorObj(null);
      const data = new FormData();

      // Append text fields
      data.append('businessName', formData.businessName);
      data.append('businessAddress', formData.businessAddress);
      data.append('businessPhone', formData.businessPhone);
      data.append('gstin', formData.gstin);
      data.append('panNumber', formData.panNumber);
      data.append('laborDeptCert', formData.laborDeptCert);
      data.append('bankAccount', formData.bankAccount);
      data.append('ifscCode', formData.ifscCode);
      data.append('businessDescription', formData.businessDescription);
      data.append('businessCategory', formData.businessCategory);
      data.append('yearsInBusiness', formData.yearsInBusiness);

      // Append files
      if (formData.documents.aadhaar) data.append('aadhaar', formData.documents.aadhaar);
      if (formData.documents.pan) data.append('pan', formData.documents.pan);
      if (formData.documents.gstin) data.append('gstin', formData.documents.gstin);
      if (formData.documents.laborCert) data.append('laborCert', formData.documents.laborCert);
      if (formData.documents.businessLicense) data.append('businessLicense', formData.documents.businessLicense);

      // NOTE: backend endpoint expects 'businessLicense' for one of the docs? 
      // Based on sellerRoutes.js it expects fields: aadhaar, pan, businessLicense. 
      // But passing others might be ignored or handled if I update backend. 
      // For now, let's stick to what the frontend collects.

      await api.post('/sellers/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Application submitted successfully! You will be notified once verification is complete.');
      // Force refresh to update user role in session/context
      window.location.href = '/seller-dashboard';
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrorObj(error.response?.data?.message || 'Registration failed');
      alert(`Registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            required
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Category *
          </label>
          <select
            required
            value={formData.businessCategory}
            onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {businessCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Address *
          </label>
          <textarea
            required
            rows={3}
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter complete business address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Phone *
          </label>
          <input
            type="tel"
            required
            value={formData.businessPhone}
            onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years in Business
          </label>
          <input
            type="number"
            value={formData.yearsInBusiness}
            onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            rows={4}
            value={formData.businessDescription}
            onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your business, products, and services..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Documents</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-blue-800 text-sm">
            All documents are required for verification. Ensure documents are clear and readable.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GST Number
          </label>
          <input
            type="text"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="33ABCDE1234F1Z5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PAN Number *
          </label>
          <input
            type="text"
            required
            value={formData.panNumber}
            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ABCDE1234F"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Labor Department Certificate
          </label>
          <input
            type="text"
            value={formData.laborDeptCert}
            onChange={(e) => setFormData({ ...formData, laborDeptCert: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Certificate number"
          />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'aadhaar', label: 'Aadhaar Card', required: true },
          { key: 'pan', label: 'PAN Card', required: true },
          { key: 'gstin', label: 'GST Certificate', required: false },
          { key: 'laborCert', label: 'Labor Department Certificate', required: false },
          { key: 'businessLicense', label: 'Business License', required: false }
        ].map((doc) => (
          <div key={doc.key} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900">
                {doc.label} {doc.required && <span className="text-red-500">*</span>}
              </span>
              {formData.documents[doc.key as keyof typeof formData.documents] && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(doc.key, file);
                }}
                className="hidden"
                id={`file-${doc.key}`}
              />
              <label
                htmlFor={`file-${doc.key}`}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </label>
              {formData.documents[doc.key as keyof typeof formData.documents] && (
                <span className="text-sm text-gray-600">
                  {formData.documents[doc.key as keyof typeof formData.documents]?.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Bank Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Account Number *
          </label>
          <input
            type="text"
            required
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter bank account number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code *
          </label>
          <input
            type="text"
            required
            value={formData.ifscCode}
            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SBIN0001234"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Review & Submit</h3>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Business Information</h4>
          <p className="text-gray-600">{formData.businessName}</p>
          <p className="text-gray-600">{formData.businessCategory}</p>
          <p className="text-gray-600">{formData.businessAddress}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Contact Details</h4>
          <p className="text-gray-600">{formData.businessPhone}</p>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Legal Information</h4>
          {formData.gstin && <p className="text-gray-600">GST: {formData.gstin}</p>}
          <p className="text-gray-600">PAN: {formData.panNumber}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Documents Uploaded</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(formData.documents).map(([key, file]) => (
              file && (
                <span key={key} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  <FileText className="w-3 h-3 mr-1" />
                  {key}
                </span>
              )
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800 text-sm">
            Your application will be reviewed within 2-3 business days. You will be notified via email once approved.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Registration</h1>
          <p className="text-gray-600 mt-2">Complete your registration to start selling on LocalMart</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-500'
                    }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3 text-left">
                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {errorObj && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{typeof errorObj === 'string' ? errorObj : 'Registration failed'}</p>
            </div>
          )}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}