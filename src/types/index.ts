export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
}

export interface Seller extends User {
  role: 'seller';
  businessName: string;
  gstin?: string;
  panNumber?: string;
  laborDeptCert?: string;
  businessAddress: string;
  businessPhone: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  documents: {
    aadhaar?: string;
    pan?: string;
    gstin?: string;
    laborCert?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'seller' | 'admin';
  businessName?: string;
  businessAddress?: string;
  phone?: string;
  panNumber?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  stock: number;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  warranty?: string;
  returnPolicy?: string;
  deliveryTime?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product; // Optional for compatibility, but store fills it
  sellerId?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress?: string;
  deliveryType: 'pickup' | 'delivery';
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  sellerId: string;
  productName: string;
  sellerName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationCategory = 'bargain' | 'order' | 'delivery' | 'message' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface Location {
  city: string;
  area: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}