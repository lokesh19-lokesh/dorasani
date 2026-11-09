export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  mrp: number;
  discountPercent?: number;
  category: string;
  categorySlug: string;
  subCategory?: string;
  fabric: string;
  occasion: string;
  weave?: string;
  careInstructions?: string;
  blouseIncluded?: boolean;
  length?: string;
  rating: number;
  reviewsCount: number;
  soldCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFestive?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  stock?: number;
  sku?: string;
  tags?: string[];
  sizes?: string[];
  primaryImage: string;
  images: string[];
  colors: {
    name: string;
    hex: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productCount?: number;
  subcategories?: {
    name: string;
    slug: string;
    imageUrl?: string;
  }[];
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor: string;
  quantity: number;
  selected: boolean;
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface Address {
  id: string;
  addressType: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  maxDiscountInr?: number | null;
  discountPercent?: number;
  flatDiscount?: number;
  minOrderValue: number;
  usageLimit?: number | null;
  usedCount?: number;
  endDate?: string | null;
  isActive?: boolean;
  description: string;
}

export interface ServiceBenefit {
  id: string;
  iconName: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  reviewerName: string;
  rating: number;
  title?: string;
  content?: string;
  photos?: string[];
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  variantColor: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliveryOption: 'standard' | 'express';
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'refunded';
  timeline: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
  }[];
  courierPartner?: string;
  trackingId?: string;
  orderNotes?: string;
  paymentDetails?: {
    provider: string;
    gatewayOrderId?: string;
    paymentId?: string;
  };
}

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'catalog_manager'
  | 'inventory_manager'
  | 'order_manager'
  | 'support_agent'
  | 'customer';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  whatsappOptIn: boolean;
  role?: UserRole;
  isAdmin?: boolean;
}

export type SortOption = 'featured' | 'newest' | 'price-low-high' | 'price-high-low' | 'popular';

export const IS_DORASANI_TYPES = true;
