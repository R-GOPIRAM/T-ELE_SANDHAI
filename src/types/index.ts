export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
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
  _id: string;
  orderId: string;
  user: string | User;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  /** Normalized lowercase status set after API response mapping */
  status?: string;
  /** Human-readable delivery address string set after API response mapping */
  deliveryAddress?: string;
  deliveryType: 'pickup' | 'delivery';
  paymentMethod?: string;
  paymentInfo?: {
    status: string;
    method: string;
  };
  orderStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderItem {
  product: string | Product;
  seller: string | User;
  name: string;
  /** Resolved product name set after API response mapping */
  productName?: string;
  /** Seller display name set after API response mapping */
  sellerName?: string;
  /** Seller ID string set after API response mapping */
  sellerId?: string;
  /** Computed subtotal (price * quantity) set after API response mapping */
  subtotal?: number;
  image?: string;
  quantity: number;
  price: number;
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