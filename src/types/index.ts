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
  productType?: string;
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

export const LOW_STOCK_THRESHOLD = 3;

export interface StockStatusMeta {
  qty: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  shortageCount: number;
  adminStatusLabel: string;
  adminShortMessage: string;
  storefrontBadge: string | null;
  storefrontDetailMessage: string;
}

export function getStockStatusMeta(
  stock: number | undefined | null,
  status?: string | null
): StockStatusMeta {
  const safeQty = Math.max(0, Math.round(Number(stock ?? 0) || 0));
  const isOut = status === 'out_of_stock' || safeQty <= 0;

  if (isOut) {
    return {
      qty: safeQty,
      isOutOfStock: true,
      isLowStock: false,
      shortageCount: LOW_STOCK_THRESHOLD,
      adminStatusLabel: 'Out of Stock',
      adminShortMessage:
        'Out of Stock (0 quantity) — automatically marked as Out of Stock',
      storefrontBadge: 'OUT OF STOCK',
      storefrontDetailMessage: 'Currently Out of Stock',
    };
  }

  if (safeQty < LOW_STOCK_THRESHOLD) {
    const shortageCount = LOW_STOCK_THRESHOLD - safeQty;
    const unitWord = safeQty === 1 ? 'unit' : 'units';
    return {
      qty: safeQty,
      isOutOfStock: false,
      isLowStock: true,
      shortageCount,
      adminStatusLabel: `Low Stock (${shortageCount} less)`,
      adminShortMessage: `Low Stock: ${safeQty} ${unitWord} available (${shortageCount} quantity less than minimum ${LOW_STOCK_THRESHOLD})`,
      storefrontBadge: `ONLY ${safeQty} LEFT`,
      storefrontDetailMessage: `Low Stock — Only ${safeQty} left (${shortageCount} less than ${LOW_STOCK_THRESHOLD})`,
    };
  }

  return {
    qty: safeQty,
    isOutOfStock: false,
    isLowStock: false,
    shortageCount: 0,
    adminStatusLabel: 'Healthy',
    adminShortMessage: `In Stock (${safeQty} units available)`,
    storefrontBadge: null,
    storefrontDetailMessage: `In Stock (${safeQty} ready to ship)`,
  };
}

export interface ProductTypeOption {
  value: string;
  label: string;
}

export const DEFAULT_PRODUCT_TYPES: ProductTypeOption[] = [
  { value: 'saree', label: 'Saree' },
  { value: 'lehenga', label: 'Lehenga' },
  { value: 'ethnic_wear', label: 'Ethnic Wear / Salwar / Anarkali' },
  { value: 'kurti', label: 'Kurti / Tunic' },
  { value: 'dress', label: 'Ethnic Dress' },
  { value: 'kids_wear', label: 'Kids Wear' },
  { value: 'fabric', label: 'Blouse / Fabric' },
];

export function formatProductTypeValue(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
}

export function normalizeProductTypes(raw: unknown): ProductTypeOption[] {
  if (!Array.isArray(raw)) {
    return DEFAULT_PRODUCT_TYPES.map((t) => ({ ...t }));
  }

  const out: ProductTypeOption[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const obj = item as Record<string, unknown>;
    const label = typeof obj.label === 'string' ? obj.label.trim() : '';
    const rawVal = typeof obj.value === 'string' ? obj.value.trim() : '';
    const value = formatProductTypeValue(rawVal || label);
    if (!value || !label || seen.has(value)) continue;
    seen.add(value);
    out.push({ value, label });
  }

  return out.length > 0 ? out : DEFAULT_PRODUCT_TYPES.map((t) => ({ ...t }));
}

export function getProductTypeLabel(
  value?: string | null,
  typesList: ProductTypeOption[] = DEFAULT_PRODUCT_TYPES
): string {
  const clean = String(value || '').trim();
  if (!clean) return 'Saree';
  const hit = typesList.find((t) => t.value.toLowerCase() === clean.toLowerCase());
  if (hit) return hit.label;
  return clean
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  | 'product_type'
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
    maxPrice: 5000000,
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
    id: 'product_type',
    type: 'product_type',
    label: 'Product Type',
    enabled: true,
    displayOrder: 4,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
  },
  {
    id: 'weave',
    type: 'weave',
    label: 'Weaving Style',
    enabled: false,
    displayOrder: 5,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
  },
  {
    id: 'color',
    type: 'color',
    label: 'Color',
    enabled: false,
    displayOrder: 6,
    optionSource: 'auto',
    customOptions: [],
    hiddenOptions: [],
  },
  {
    id: 'availability',
    type: 'availability',
    label: 'Availability',
    enabled: false,
    displayOrder: 7,
    optionSource: 'custom',
    customOptions: ['In Stock Only', 'New Arrivals', 'Bestsellers', 'Festive Edit'],
    hiddenOptions: [],
  },
  {
    id: 'discount',
    type: 'discount',
    label: 'Discount',
    enabled: false,
    displayOrder: 8,
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
  googleUrl: string;
  footerCopyright: string;
  productTypes: ProductTypeOption[];
  exploreCategoriesConfig: ExploreCategoriesConfig;
  collectionFiltersConfig: CollectionFiltersConfig;
  delhiveryEnabled: boolean;
  delhiveryPickupLocation: string;
  delhiveryOriginPincode: string;
  delhiveryAutoManifest: boolean;
  delhiveryDefaultWeightGrams: number;
  delhiveryDefaultDimensions: DelhiveryPackageDimensions;
  delhiverySellerGst: string;
}

export interface DelhiveryPackageDimensions {
  length: number;
  breadth: number;
  height: number;
}

export interface ShipmentScan {
  scan: string;
  scanType?: string;
  statusCode?: string;
  location: string;
  instructions?: string;
  dateTime: string;
  formattedTime?: string;
}

export interface OrderShipment {
  id: string;
  orderId: string;
  courierPartner: string;
  trackingNumber: string;
  trackingUrl?: string;
  currentStatus: string;
  statusCode?: string;
  statusType?: string;
  currentLocation?: string;
  pickupLocation?: string;
  shippingMode?: 'Express' | 'Surface' | string;
  paymentMode?: 'Prepaid' | 'COD' | string;
  originCity?: string;
  destinationPincode?: string;
  packageWeightGrams?: number;
  packageDimensions?: DelhiveryPackageDimensions;
  pickupRequestId?: string;
  pickupScheduledDate?: string;
  pickupScheduledTime?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  lastSyncedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  scans: ShipmentScan[];
}

export interface DelhiveryServiceabilityResult {
  configured?: boolean;
  delhiveryEnabled?: boolean;
  fallback?: boolean;
  pincode: string;
  originPincode: string;
  serviceable: boolean;
  prepaid: boolean;
  cod: boolean;
  delhiveryCod?: boolean;
  storeCodEnabled?: boolean;
  pickup: boolean;
  isOda: boolean;
  city: string;
  stateCode: string;
  sortCode: string;
  remarks: string;
  expressTatDays: number;
  standardTatDays: number;
  expressEstimatedWindow: string | null;
  standardEstimatedWindow: string | null;
}

export interface DelhiveryRateQuote {
  zone: string | null;
  chargedWeightGrams: number;
  grossAmountInr: number;
  totalAmountInr: number;
  codChargeInr: number;
  fuelSurchargeInr: number;
  error?: string;
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
    'product_type',
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
  instagramUrl: 'https://www.instagram.com/dorasani.a_symbol_of_tradition/?hl=en',
  facebookUrl: '',
  youtubeUrl: 'https://youtube.com/@ala-dorasanitho?si=HuECZg4ePcoRlyHb',
  googleUrl: 'https://share.google/M3XD0k82h9QQnXiMX',
  footerCopyright: '© 2026 DORASANI. All rights reserved.',
  productTypes: DEFAULT_PRODUCT_TYPES,
  exploreCategoriesConfig: DEFAULT_EXPLORE_CATEGORIES_CONFIG,
  collectionFiltersConfig: DEFAULT_COLLECTION_FILTERS_CONFIG,
  delhiveryEnabled: true,
  delhiveryPickupLocation: 'DORASANI SAREES B2C',
  delhiveryOriginPincode: '500067',
  delhiveryAutoManifest: false,
  delhiveryDefaultWeightGrams: 650,
  delhiveryDefaultDimensions: { length: 34, breadth: 26, height: 6 },
  delhiverySellerGst: '',
};

export interface OrderItem {
  productId: string;
  productTitle: string;
  variantColor: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderRefund {
  id: string;
  amountInr: number;
  refundReference?: string;
  status: string;
  notes?: string;
  createdAt?: string;
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
  trackingUrl?: string;
  shipment?: OrderShipment;
  orderNotes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  refunds?: OrderRefund[];
  statusHistory?: {
    previousStatus?: string;
    newStatus: string;
    note?: string;
    createdAt?: string;
  }[];
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
