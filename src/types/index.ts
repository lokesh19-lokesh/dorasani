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
  inStock: boolean;
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
  code: string;
  discountPercent?: number;
  flatDiscount?: number;
  minOrderValue: number;
  description: string;
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
  paymentStatus: 'pending' | 'paid';
  status: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  timeline: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
  }[];
  courierPartner?: string;
  trackingId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  whatsappOptIn: boolean;
}

export type SortOption = 'featured' | 'newest' | 'price-low-high' | 'price-high-low' | 'popular';
