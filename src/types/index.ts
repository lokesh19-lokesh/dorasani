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
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  imageUrl: string;
  filterKeywords?: string;
  productCount?: number;
  subcategories?: {
    id?: string;
    name: string;
    slug: string;
    imageUrl?: string;
    filterKeywords?: string;
  }[];
}

export interface ExploreCategoryOverride {
  enabled?: boolean;
  title?: string;
  showAllPill?: boolean;
  allPillLabel?: string;
}

export interface ExploreCategoriesConfig {
  enabled: boolean;
  title: string;
  showOnShopAll: boolean;
  showOnCollections: boolean;
  showOnNewArrivals: boolean;
  showOnBestsellers: boolean;
  showAllPill: boolean;
  allPillLabel: string;
  categoryOverrides: Record<string, ExploreCategoryOverride>;
}

export const DEFAULT_EXPLORE_CATEGORIES_CONFIG: ExploreCategoriesConfig = {
  enabled: true,
  title: 'Explore Categories',
  showOnShopAll: true,
  showOnCollections: true,
  showOnNewArrivals: true,
  showOnBestsellers: true,
  showAllPill: true,
  allPillLabel: 'All',
  categoryOverrides: {},
};

export type FilterGroupType =
  | 'price_range'
  | 'fabric'
  | 'occasion'
  | 'weave'
  | 'color'
  | 'availability'
  | 'discount'
  | 'tag';

export interface FilterGroupConfig {
  id: string;
  type: FilterGroupType;
  label: string;
  enabled: boolean;
  displayOrder: number;
  optionSource: 'auto' | 'custom';
  customOptions: string[];
  hiddenOptions: string[];
  minPrice?: number;
  maxPrice?: number;
  step?: number;
}

export interface CategoryFilterGroupOverride {
  enabled?: boolean;
  label?: string;
  customOptions?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface CategoryFilterOverride {
  enabled?: boolean;
  sidebarTitle?: string;
  disabledGroupIds?: string[];
  groupOverrides?: Record<string, CategoryFilterGroupOverride>;
}

export interface CollectionFiltersConfig {
  enabled: boolean;
  sidebarTitle: string;
  showClearAll: boolean;
  showSortDropdown: boolean;
  groups: FilterGroupConfig[];
  categoryOverrides: Record<string, CategoryFilterOverride>;
}

export const DEFAULT_FILTER_GROUPS: FilterGroupConfig[] = [
  {
    id: 'price',
    type: 'price_range',
    label: 'Price Range',
    enabled: true,
    displayOrder: 1,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
    minPrice: 500,
    maxPrice: 0,
    step: 500,
  },
  {
    id: 'fabric',
    type: 'fabric',
    label: 'Fabric',
    enabled: true,
    displayOrder: 2,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
  },
  {
    id: 'occasion',
    type: 'occasion',
    label: 'Occasion',
    enabled: true,
    displayOrder: 3,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
  },
  {
    id: 'weave',
    type: 'weave',
    label: 'Weaving Style',
    enabled: false,
    displayOrder: 4,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
  },
  {
    id: 'color',
    type: 'color',
    label: 'Color',
    enabled: false,
    displayOrder: 5,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
  },
  {
    id: 'availability',
    type: 'availability',
    label: 'Availability',
    enabled: false,
    displayOrder: 6,
    optionSource: 'custom',
    customOptions: ['In Stock Only', 'New Arrivals', 'Bestsellers', 'Festive Edit'],
    hiddenOptions: [],
  },
  {
    id: 'discount',
    type: 'discount',
    label: 'Discount',
    enabled: false,
    displayOrder: 7,
    optionSource: 'custom',
    customOptions: ['10% or more', '20% or more', '30% or more'],
    hiddenOptions: [],
  },
];

export const DEFAULT_COLLECTION_FILTERS_CONFIG: CollectionFiltersConfig = {
  enabled: true,
  sidebarTitle: 'Filters',
  showClearAll: true,
  showSortDropdown: true,
  groups: DEFAULT_FILTER_GROUPS,
  categoryOverrides: {},
};

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
  status?: string;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  supportEmail: string;
  conciergeEmail: string;
  supportPhone: string;
  storeAddress: string;
  storeCityStatePin: string;
  studioHours: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  codEnabled: boolean;
  announcementItems: string[];
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  footerCopyright: string;
  exploreCategoriesConfig: ExploreCategoriesConfig;
  collectionFiltersConfig: CollectionFiltersConfig;
}

export function normalizeExploreCategoriesConfig(raw: unknown): ExploreCategoriesConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ...DEFAULT_EXPLORE_CATEGORIES_CONFIG,
      categoryOverrides: {},
    };
  }
  const obj = raw as Record<string, unknown>;
  const overridesRaw =
    obj.categoryOverrides && typeof obj.categoryOverrides === 'object' && !Array.isArray(obj.categoryOverrides)
      ? (obj.categoryOverrides as Record<string, any>)
      : {};
  const categoryOverrides: Record<string, ExploreCategoryOverride> = {};
  for (const [slug, val] of Object.entries(overridesRaw)) {
    if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
    const item = val as Record<string, unknown>;
    categoryOverrides[slug] = {
      enabled: typeof item.enabled === 'boolean' ? item.enabled : undefined,
      title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : undefined,
      showAllPill: typeof item.showAllPill === 'boolean' ? item.showAllPill : undefined,
      allPillLabel:
        typeof item.allPillLabel === 'string' && item.allPillLabel.trim()
          ? item.allPillLabel.trim()
          : undefined,
    };
  }

  return {
    enabled:
      typeof obj.enabled === 'boolean' ? obj.enabled : DEFAULT_EXPLORE_CATEGORIES_CONFIG.enabled,
    title:
      typeof obj.title === 'string' && obj.title.trim()
        ? obj.title.trim()
        : DEFAULT_EXPLORE_CATEGORIES_CONFIG.title,
    showOnShopAll:
      typeof obj.showOnShopAll === 'boolean'
        ? obj.showOnShopAll
        : DEFAULT_EXPLORE_CATEGORIES_CONFIG.showOnShopAll,
    showOnCollections:
      typeof obj.showOnCollections === 'boolean'
        ? obj.showOnCollections
        : DEFAULT_EXPLORE_CATEGORIES_CONFIG.showOnCollections,
    showOnNewArrivals:
      typeof obj.showOnNewArrivals === 'boolean'
        ? obj.showOnNewArrivals
        : DEFAULT_EXPLORE_CATEGORIES_CONFIG.showOnNewArrivals,
    showOnBestsellers:
      typeof obj.showOnBestsellers === 'boolean'
        ? obj.showOnBestsellers
        : DEFAULT_EXPLORE_CATEGORIES_CONFIG.showOnBestsellers,
    showAllPill:
      typeof obj.showAllPill === 'boolean'
        ? obj.showAllPill
        : DEFAULT_EXPLORE_CATEGORIES_CONFIG.showAllPill,
    allPillLabel:
      typeof obj.allPillLabel === 'string' && obj.allPillLabel.trim()
        ? obj.allPillLabel.trim()
        : DEFAULT_EXPLORE_CATEGORIES_CONFIG.allPillLabel,
    categoryOverrides,
  };
}

export function normalizeCollectionFiltersConfig(raw: unknown): CollectionFiltersConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ...DEFAULT_COLLECTION_FILTERS_CONFIG,
      groups: DEFAULT_FILTER_GROUPS.map((g) => ({
        ...g,
        customOptions: [...g.customOptions],
        hiddenOptions: [...g.hiddenOptions],
      })),
      categoryOverrides: {},
    };
  }
  const obj = raw as Record<string, unknown>;
  const rawGroups = Array.isArray(obj.groups) ? obj.groups : [];
  const validTypes = new Set<FilterGroupType>([
    'price_range',
    'fabric',
    'occasion',
    'weave',
    'color',
    'availability',
    'discount',
    'tag',
  ]);

  const parsedGroups: FilterGroupConfig[] = [];
  const seenIds = new Set<string>();

  rawGroups.forEach((g, idx) => {
    if (!g || typeof g !== 'object' || Array.isArray(g)) return;
    const item = g as Record<string, unknown>;
    const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `group-${idx + 1}`;
    if (seenIds.has(id)) return;
    seenIds.add(id);

    const type = validTypes.has(item.type as FilterGroupType)
      ? (item.type as FilterGroupType)
      : 'tag';

    parsedGroups.push({
      id,
      type,
      label:
        typeof item.label === 'string' && item.label.trim()
          ? item.label.trim()
          : id.replace(/[-_]+/g, ' '),
      enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
      displayOrder: Number.isFinite(Number(item.displayOrder))
        ? Number(item.displayOrder)
        : idx + 1,
      optionSource: item.optionSource === 'custom' ? 'custom' : 'auto',
      customOptions: Array.isArray(item.customOptions)
        ? item.customOptions.map((x) => String(x).trim()).filter(Boolean)
        : [],
      hiddenOptions: Array.isArray(item.hiddenOptions)
        ? item.hiddenOptions.map((x) => String(x).trim()).filter(Boolean)
        : [],
      ...(type === 'price_range'
        ? {
            minPrice:
              Number.isFinite(Number(item.minPrice)) && Number(item.minPrice) >= 0
                ? Math.round(Number(item.minPrice))
                : 500,
            maxPrice:
              Number.isFinite(Number(item.maxPrice)) && Number(item.maxPrice) >= 0
                ? Math.round(Number(item.maxPrice))
                : 0,
            step:
              Number.isFinite(Number(item.step)) && Number(item.step) > 0
                ? Math.round(Number(item.step))
                : 500,
          }
        : {}),
    });
  });

  // Backfill core default groups if missing (never remove custom tag groups)
  for (const def of DEFAULT_FILTER_GROUPS) {
    if (!seenIds.has(def.id)) {
      parsedGroups.push({
        ...def,
        customOptions: [...def.customOptions],
        hiddenOptions: [...def.hiddenOptions],
      });
    }
  }

  parsedGroups.sort((a, b) => a.displayOrder - b.displayOrder);

  const overridesRaw =
    obj.categoryOverrides && typeof obj.categoryOverrides === 'object' && !Array.isArray(obj.categoryOverrides)
      ? (obj.categoryOverrides as Record<string, any>)
      : {};
  const categoryOverrides: Record<string, CategoryFilterOverride> = {};
  for (const [slug, val] of Object.entries(overridesRaw)) {
    if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
    const item = val as Record<string, unknown>;
    const groupOverridesRaw =
      item.groupOverrides && typeof item.groupOverrides === 'object' && !Array.isArray(item.groupOverrides)
        ? (item.groupOverrides as Record<string, any>)
        : {};
    const groupOverrides: Record<string, CategoryFilterGroupOverride> = {};
    for (const [gid, gVal] of Object.entries(groupOverridesRaw)) {
      if (!gVal || typeof gVal !== 'object' || Array.isArray(gVal)) continue;
      const gItem = gVal as Record<string, unknown>;
      groupOverrides[gid] = {
        enabled: typeof gItem.enabled === 'boolean' ? gItem.enabled : undefined,
        label:
          typeof gItem.label === 'string' && gItem.label.trim() ? gItem.label.trim() : undefined,
        customOptions: Array.isArray(gItem.customOptions)
          ? gItem.customOptions.map((x) => String(x).trim()).filter(Boolean)
          : undefined,
        minPrice:
          gItem.minPrice !== undefined && Number.isFinite(Number(gItem.minPrice))
            ? Math.max(0, Math.round(Number(gItem.minPrice)))
            : undefined,
        maxPrice:
          gItem.maxPrice !== undefined && Number.isFinite(Number(gItem.maxPrice))
            ? Math.max(0, Math.round(Number(gItem.maxPrice)))
            : undefined,
      };
    }

    categoryOverrides[slug] = {
      enabled: typeof item.enabled === 'boolean' ? item.enabled : undefined,
      sidebarTitle:
        typeof item.sidebarTitle === 'string' && item.sidebarTitle.trim()
          ? item.sidebarTitle.trim()
          : undefined,
      disabledGroupIds: Array.isArray(item.disabledGroupIds)
        ? item.disabledGroupIds.map((x) => String(x))
        : [],
      groupOverrides,
    };
  }

  return {
    enabled:
      typeof obj.enabled === 'boolean' ? obj.enabled : DEFAULT_COLLECTION_FILTERS_CONFIG.enabled,
    sidebarTitle:
      typeof obj.sidebarTitle === 'string' && obj.sidebarTitle.trim()
        ? obj.sidebarTitle.trim()
        : DEFAULT_COLLECTION_FILTERS_CONFIG.sidebarTitle,
    showClearAll:
      typeof obj.showClearAll === 'boolean'
        ? obj.showClearAll
        : DEFAULT_COLLECTION_FILTERS_CONFIG.showClearAll,
    showSortDropdown:
      typeof obj.showSortDropdown === 'boolean'
        ? obj.showSortDropdown
        : DEFAULT_COLLECTION_FILTERS_CONFIG.showSortDropdown,
    groups: parsedGroups,
    categoryOverrides,
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  storeName: 'Dorasani Sarees',
  supportEmail: 'dorasanisarees@gmail.com',
  conciergeEmail: 'dorasanisarees@gmail.com',
  supportPhone: '+91 7780673360',
  storeAddress:
    'Plot No 7-13/1/A, Bhagyalaxmi Colony, Shapur Road, Quthbullapur (M), Medchal Dist (Landmark: Opposite Maxx Cycle Shop and beside new KFC)',
  storeCityStatePin: 'Hyderabad, Telangana - 500067',
  studioHours: 'Monday – Sunday: 10:30 AM – 9:00 PM IST',
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  expressShippingFee: 199,
  codEnabled: false,
  announcementItems: [
    'Free Shipping Above ₹{threshold}',
    'Easy Returns',
    'Authentic Handloom',
    'Customer Support',
  ],
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  footerCopyright: '© 2026 DORASANI. All rights reserved.',
  exploreCategoriesConfig: DEFAULT_EXPLORE_CATEGORIES_CONFIG,
  collectionFiltersConfig: DEFAULT_COLLECTION_FILTERS_CONFIG,
};

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
  paymentMethod: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
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
