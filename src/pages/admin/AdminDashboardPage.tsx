import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Image as ImageIcon,
  FileDown,
  Plus,
  Search,
  Truck,
  TrendingUp,
  DollarSign,
  Users,
  X,
  ExternalLink,
  ShieldCheck,
  Store,
  LogOut,
  Lock,
  User as UserIcon,
  Pencil,
  Trash2,
  SlidersHorizontal,
  History,
  AlertTriangle,
  Eye,
  Mail,
  MessageSquare,
  Star,
  Settings,
  Sparkles,
  Headphones,
  Activity,
  Shield,
  Upload,
  ArrowUp,
  ArrowDown,
  EyeOff,
  BarChart3,
  RefreshCw,
  Printer,
  Calendar,
  CheckCircle2,
  Copy,
  Loader2,
  Box,
  XCircle,
} from 'lucide-react';
import {
  adminService,
  type AdminProductInput,
  type AdminCategoryInput,
  type AdminCouponInput,
  type AdminBannerInput,
  type AdminServiceBenefitInput,
} from '../../services/adminService';
import {
  delhiveryService,
  type DelhiveryLabelResponse,
} from '../../services/delhiveryService';
import { authService } from '../../services/authService';
import { useStore } from '../../context/StoreContext';
import { SeoHead } from '../../components/common/SeoHead';
import { OptimizedPicture } from '../../components/common/OptimizedPicture';
import {
  AdminAnalyticsPanel,
  OverviewAnalyticsPulse,
} from '../../components/admin/AdminAnalyticsPanel';
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_EXPLORE_CATEGORIES_CONFIG,
  DEFAULT_COLLECTION_FILTERS_CONFIG,
  DEFAULT_PRODUCT_TYPES,
  LOW_STOCK_THRESHOLD,
  formatProductTypeValue,
  normalizeExploreCategoriesConfig,
  normalizeCollectionFiltersConfig,
  normalizeProductTypes,
  getProductTypeLabel,
  getStockStatusMeta,
  type DelhiveryPackageDimensions,
  type DelhiveryRateQuote,
  type DelhiveryServiceabilityResult,
  type ExploreCategoriesConfig,
  type ExploreCategoryOverride,
  type CollectionFiltersConfig,
  type CategoryFilterOverride,
  type CategoryFilterGroupOverride,
  type FilterGroupConfig,
  type ProductTypeOption,
  type SiteSettings,
  type UserRole,
} from '../../types';

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'inventory'
  | 'categories'
  | 'coupons'
  | 'users'
  | 'cms'
  | 'reports';

const slugify = (val: string) =>
  val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const getShipmentsFromOrder = (ord: any): any[] => {
  const list: any[] = Array.isArray(ord?.shipments)
    ? ord.shipments
    : ord?.shipments
      ? [ord.shipments]
      : [];
  return [...list].sort(
    (a, b) => new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
  );
};

const getActiveShipmentFromOrder = (ord: any): any | null => {
  const list = getShipmentsFromOrder(ord);
  return list.find((s) => !s?.cancelled_at && s?.tracking_number) || null;
};

const getDefaultPickupDateString = (): string => {
  const now = new Date();
  // Move to tomorrow if past 15:30 local time, and skip Sunday (Delhivery pickups Mon-Sat)
  if (now.getHours() > 15 || (now.getHours() === 15 && now.getMinutes() >= 30)) {
    now.setDate(now.getDate() + 1);
  }
  if (now.getDay() === 0) {
    now.setDate(now.getDate() + 1);
  }
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const PRODUCT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'archived', label: 'Archived' },
];

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
  { value: 'refunded', label: 'Refunded' },
];

const STOCK_REASONS = [
  { value: 'restock', label: 'Restock' },
  { value: 'audit_correction', label: 'Audit Correction' },
  { value: 'damaged', label: 'Damaged / Write-off' },
  { value: 'return', label: 'Customer Return' },
  { value: 'manual_adjustment', label: 'Manual Adjustment' },
];

const BANNER_TYPES = [
  { value: 'hero', label: 'Hero Slider' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'subpage', label: 'Collection Subpage' },
  { value: 'announcement', label: 'Announcement' },
];

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'support_agent', label: 'Support Agent' },
  { value: 'order_manager', label: 'Order Manager' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'catalog_manager', label: 'Catalog Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

const BENEFIT_ICONS: { value: string; label: string }[] = [
  { value: 'Sparkles', label: 'Sparkles (Craft)' },
  { value: 'ShieldCheck', label: 'ShieldCheck (Trust)' },
  { value: 'Truck', label: 'Truck (Shipping)' },
  { value: 'Headphones', label: 'Headphones (Support)' },
];

const MESSAGE_STATUSES: { value: 'new' | 'read' | 'responded'; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'responded', label: 'Responded' },
];

const REVIEW_STATUSES: { value: 'pending' | 'approved' | 'rejected'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  maxWidthClass?: string;
  dialogClassName?: string;
  children: React.ReactNode;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onClose,
  labelledBy,
  maxWidthClass = 'max-w-2xl',
  dialogClassName = '',
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const focusTarget = dialog.querySelector<HTMLElement>('[data-autofocus], [autofocus]');
      if (focusTarget && document.activeElement !== focusTarget) {
        focusTarget.focus();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const isPointerOutside = (
    e: React.PointerEvent<HTMLDialogElement>,
    dialog: HTMLDialogElement
  ) => {
    const rect = dialog.getBoundingClientRect();
    return (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    );
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      {...({ closedby: 'any' } as any)}
      onClose={(e) => {
        e.currentTarget.returnValue = '';
        if (open) {
          onClose();
        }
      }}
      onPointerDown={(e) => {
        if (!('closedBy' in HTMLDialogElement.prototype)) {
          pressedOutsideRef.current = isPointerOutside(e, e.currentTarget);
        }
      }}
      onPointerUp={(e) => {
        if (!('closedBy' in HTMLDialogElement.prototype)) {
          if (pressedOutsideRef.current && isPointerOutside(e, e.currentTarget)) {
            e.currentTarget.close();
          }
          pressedOutsideRef.current = false;
        }
      }}
      className={`p-0 bg-white rounded-2xl border border-[#D8C7B5] shadow-2xl w-full ${maxWidthClass} ${dialogClassName} overflow-y-auto text-[#1A3B2B]`}
    >
      {open ? <div className="p-6 space-y-5">{children}</div> : null}
    </dialog>
  );
};

interface CommaListInputProps {
  id?: string;
  values: string[];
  onChange: (nextValues: string[]) => void;
  placeholder?: string;
  className?: string;
}

const CommaListInput: React.FC<CommaListInputProps> = ({
  id,
  values,
  onChange,
  placeholder,
  className = '',
}) => {
  const [text, setText] = useState(() => values.join(', '));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setText(values.join(', '));
    }
  }, [values]);

  return (
    <input
      id={id}
      type="text"
      value={text}
      placeholder={placeholder}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;
        const parsed = text
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        setText(parsed.join(', '));
        onChange(parsed);
      }}
      onChange={(e) => {
        const nextRaw = e.target.value;
        setText(nextRaw);
        onChange(
          nextRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }}
      className={className}
    />
  );
};

interface ProductFormState {
  title: string;
  slug: string;
  sku: string;
  subtitle: string;
  category_id: string;
  product_type: string;
  price_inr: number;
  mrp_inr: number;
  stock_quantity: number;
  status: string;
  fabric: string;
  occasion: string;
  weaving_style: string;
  saree_length: string;
  care_instructions: string;
  blouse_included: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_festive: boolean;
  specificationsSubCategory: string;
  specificationsTagsText: string;
  imagesText: string;
  description: string;
}

const DEFAULT_PRODUCT_FORM: ProductFormState = {
  title: '',
  slug: '',
  sku: '',
  subtitle: '',
  category_id: '',
  product_type: 'saree',
  price_inr: 2999,
  mrp_inr: 4999,
  stock_quantity: 15,
  status: 'active',
  fabric: 'Pure Mulberry Silk',
  occasion: 'Wedding & Festive',
  weaving_style: 'Handloom Temple Border',
  saree_length: '5.5m Saree + 0.8m Blouse Piece',
  care_instructions: 'Dry Clean Only',
  blouse_included: true,
  is_featured: false,
  is_new: true,
  is_bestseller: false,
  is_festive: false,
  specificationsSubCategory: '',
  specificationsTagsText: '',
  imagesText: '/assets/products/kanjivaram_silk_saree.jpg',
  description: '',
};

interface CategoryFormState {
  name: string;
  slug: string;
  parent_id: string;
  display_order: number;
  image_url: string;
  filter_keywords: string;
  description: string;
  is_active: boolean;
}

const DEFAULT_CATEGORY_FORM: CategoryFormState = {
  name: '',
  slug: '',
  parent_id: '',
  display_order: 10,
  image_url: '',
  filter_keywords: '',
  description: '',
  is_active: true,
};

interface CouponFormState {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount_inr: number;
  max_discount_inr: string;
  usage_limit: string;
  end_date: string;
  is_active: boolean;
}

const DEFAULT_COUPON_FORM: CouponFormState = {
  code: '',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_amount_inr: 0,
  max_discount_inr: '',
  usage_limit: '',
  end_date: '',
  is_active: true,
};

interface BannerFormState {
  banner_type: string;
  tagline: string;
  title_line_1: string;
  title_line_2: string;
  description: string;
  primary_cta_label: string;
  primary_cta_link: string;
  secondary_cta_label: string;
  secondary_cta_link: string;
  desktop_image_url: string;
  mobile_image_url: string;
  display_order: number;
  is_active: boolean;
}

const DEFAULT_BANNER_FORM: BannerFormState = {
  banner_type: 'hero',
  tagline: '',
  title_line_1: '',
  title_line_2: '',
  description: '',
  primary_cta_label: 'Explore Collection',
  primary_cta_link: '/shop',
  secondary_cta_label: '',
  secondary_cta_link: '',
  desktop_image_url: '',
  mobile_image_url: '',
  display_order: 1,
  is_active: true,
};

interface SettingsFormState extends SiteSettings {
  announcementText: string;
}

const DEFAULT_SETTINGS_FORM: SettingsFormState = {
  ...DEFAULT_SITE_SETTINGS,
  announcementText: DEFAULT_SITE_SETTINGS.announcementItems.join('\n'),
};

const DEFAULT_BENEFIT_FORM: AdminServiceBenefitInput = {
  icon_name: 'Sparkles',
  title: '',
  description: '',
  display_order: 1,
  is_active: true,
};

const renderBenefitIcon = (iconName?: string) => {
  switch (iconName) {
    case 'ShieldCheck':
      return <ShieldCheck className="w-5 h-5 text-[#285A3C]" />;
    case 'Truck':
      return <Truck className="w-5 h-5 text-[#285A3C]" />;
    case 'Headphones':
      return <Headphones className="w-5 h-5 text-[#285A3C]" />;
    default:
      return <Sparkles className="w-5 h-5 text-[#285A3C]" />;
  }
};

export const AdminDashboardPage: React.FC = () => {
  const {
    user,
    authLoading,
    logout,
    showToast,
    refreshCoupons,
    refreshSiteSettings,
    refreshStoreCategories,
  } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [usersSubTab, setUsersSubTab] = useState<'users' | 'messages' | 'newsletter' | 'reviews'>('users');
  const [verifyingAdmin, setVerifyingAdmin] = useState<boolean>(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Metrics
  const [metrics, setMetrics] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProfiles: 0,
    staffCount: 0,
    guestOrderCustomers: 0,
    unreadMessages: 0,
    newsletterCount: 0,
    publishedReviews: 0,
    pendingReviews: 0,
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    returnedOrders: 0,
    recentOrders: [],
  });

  // Core Datasets
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [inventoryLedger, setInventoryLedger] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [adminEmails, setAdminEmails] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [serviceBenefits, setServiceBenefits] = useState<any[]>([]);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [usersSearch, setUsersSearch] = useState('');
  const [messageStatusFilter, setMessageStatusFilter] = useState<'all' | 'new' | 'read' | 'responded'>('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Product Add/Edit & Delete Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductSpecs, setEditingProductSpecs] = useState<Record<string, any>>({});
  const [productSlugTouched, setProductSlugTouched] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(DEFAULT_PRODUCT_FORM);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Stock Adjust Modal State
  const [stockTarget, setStockTarget] = useState<any | null>(null);
  const [stockMode, setStockMode] = useState<'exact' | 'delta'>('exact');
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [stockReason, setStockReason] = useState<string>('restock');
  const [savingStock, setSavingStock] = useState(false);

  // Order Details, Fulfillment & Delete Modal State
  const [orderDetailsTarget, setOrderDetailsTarget] = useState<any | null>(null);
  const [orderEditTarget, setOrderEditTarget] = useState<any | null>(null);
  const [orderEditStatus, setOrderEditStatus] = useState<string>('confirmed');
  const [orderEditCourier, setOrderEditCourier] = useState<string>('');
  const [orderEditTracking, setOrderEditTracking] = useState<string>('');
  const [savingOrder, setSavingOrder] = useState(false);
  const [deleteOrderTarget, setDeleteOrderTarget] = useState<any | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

  // Delhivery One Shipping, Manifest, Label, Pickup & Live Sync State
  const [delhiveryManifestTarget, setDelhiveryManifestTarget] = useState<any | null>(null);
  const [delhiveryManifestForm, setDelhiveryManifestForm] = useState<{
    pickupLocation: string;
    shippingMode: 'Express' | 'Surface';
    weightGrams: number;
    length: number;
    breadth: number;
    height: number;
  }>({
    pickupLocation: DEFAULT_SITE_SETTINGS.delhiveryPickupLocation,
    shippingMode: 'Express',
    weightGrams: DEFAULT_SITE_SETTINGS.delhiveryDefaultWeightGrams,
    length: DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.length,
    breadth: DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.breadth,
    height: DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.height,
  });
  const [delhiveryManifestRates, setDelhiveryManifestRates] = useState<{
    destinationPincode: string;
    originPincode: string;
    serviceability: DelhiveryServiceabilityResult | null;
    express: DelhiveryRateQuote;
    surface: DelhiveryRateQuote;
  } | null>(null);
  const [loadingManifestRates, setLoadingManifestRates] = useState(false);
  const [manifestingOrder, setManifestingOrder] = useState(false);
  const [manifestError, setManifestError] = useState<string | null>(null);

  const [delhiveryLabelTarget, setDelhiveryLabelTarget] = useState<{
    order: any;
    label: DelhiveryLabelResponse;
  } | null>(null);
  const [loadingLabelOrderId, setLoadingLabelOrderId] = useState<string | null>(null);

  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupForm, setPickupForm] = useState({
    pickupLocation: DEFAULT_SITE_SETTINGS.delhiveryPickupLocation,
    pickupDate: getDefaultPickupDateString(),
    pickupTime: '14:00:00',
    expectedPackageCount: 1,
  });
  const [schedulingPickup, setSchedulingPickup] = useState(false);
  const [pickupError, setPickupError] = useState<string | null>(null);

  const [syncingAllDelhivery, setSyncingAllDelhivery] = useState(false);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  const [cancelAwbConfirm, setCancelAwbConfirm] = useState(false);
  const [cancelAwbReason, setCancelAwbReason] = useState('');
  const [cancellingAwb, setCancellingAwb] = useState(false);

  const [testingDelhiveryConn, setTestingDelhiveryConn] = useState(false);
  const [delhiveryConnResult, setDelhiveryConnResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [webhookUrlCopied, setWebhookUrlCopied] = useState(false);
  const keepAwbButtonRef = useRef<HTMLButtonElement>(null);

  // Category & Explore Management State
  const [categoriesSubTab, setCategoriesSubTab] = useState<'items' | 'builder'>('items');
  const [categoryParentFilter, setCategoryParentFilter] = useState<'all' | 'top' | string>('all');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(DEFAULT_CATEGORY_FORM);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  // Dynamic Product Types & Inline Product Modal Creation State
  const [productTypesList, setProductTypesList] =
    useState<ProductTypeOption[]>(DEFAULT_PRODUCT_TYPES);
  const [newTypeLabelInput, setNewTypeLabelInput] = useState('');
  const [editingTypeValue, setEditingTypeValue] = useState<string | null>(null);
  const [editingTypeLabel, setEditingTypeLabel] = useState('');
  const [savingProductTypes, setSavingProductTypes] = useState(false);

  const [showInlineCatDrawer, setShowInlineCatDrawer] = useState(false);
  const [inlineCatName, setInlineCatName] = useState('');
  const [inlineCatParentId, setInlineCatParentId] = useState('');
  const [savingInlineCat, setSavingInlineCat] = useState(false);

  const [showInlineTypeDrawer, setShowInlineTypeDrawer] = useState(false);
  const [inlineTypeLabel, setInlineTypeLabel] = useState('');
  const [savingInlineType, setSavingInlineType] = useState(false);

  // Explore Bar & Collection Filters Builder State
  const [exploreConfigForm, setExploreConfigForm] = useState<ExploreCategoriesConfig>(
    DEFAULT_EXPLORE_CATEGORIES_CONFIG
  );
  const [filtersConfigForm, setFiltersConfigForm] = useState<CollectionFiltersConfig>(
    DEFAULT_COLLECTION_FILTERS_CONFIG
  );
  const [configScopeSlug, setConfigScopeSlug] = useState<string>('__global__');
  const [customTagLabelInput, setCustomTagLabelInput] = useState<string>('');
  const [savingExploreAndFilters, setSavingExploreAndFilters] = useState<boolean>(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Coupon Add/Edit & Delete Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState<CouponFormState>(DEFAULT_COUPON_FORM);
  const [couponFormError, setCouponFormError] = useState<string | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [deleteCouponTarget, setDeleteCouponTarget] = useState<any | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState(false);

  // Banner Add/Edit & Delete Modal State
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormState>(DEFAULT_BANNER_FORM);
  const [bannerFormError, setBannerFormError] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [deleteBannerTarget, setDeleteBannerTarget] = useState<any | null>(null);
  const [deletingBanner, setDeletingBanner] = useState(false);

  // Users, Activity Logs, Allowlist & Inquiries State
  const [activityUserTarget, setActivityUserTarget] = useState<any | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminEmailRole, setAdminEmailRole] = useState<UserRole>('admin');
  const [adminEmailNotes, setAdminEmailNotes] = useState('');
  const [savingAdminEmail, setSavingAdminEmail] = useState(false);
  const [contactViewTarget, setContactViewTarget] = useState<any | null>(null);

  // Storefront Settings & Service Benefits State
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(DEFAULT_SETTINGS_FORM);
  const [settingsFormError, setSettingsFormError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [benefitModalOpen, setBenefitModalOpen] = useState(false);
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [benefitForm, setBenefitForm] = useState<AdminServiceBenefitInput>(DEFAULT_BENEFIT_FORM);
  const [benefitFormError, setBenefitFormError] = useState<string | null>(null);
  const [savingBenefit, setSavingBenefit] = useState(false);
  const [deleteBenefitTarget, setDeleteBenefitTarget] = useState<any | null>(null);
  const [deletingBenefit, setDeletingBenefit] = useState(false);

  // Load All Live Admin Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        m,
        pRes,
        oRes,
        cList,
        coupList,
        bList,
        ledgerList,
        uList,
        msgList,
        subList,
        revList,
        benefitsList,
        settingsRows,
        allowlistEmails,
      ] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getProducts(1, 250),
        adminService.getAllOrders(),
        adminService.getCategories(),
        adminService.getCoupons(),
        adminService.getBanners(),
        adminService.getInventoryLedger(),
        adminService.getUsersOverview().catch(() => []),
        adminService.getContactMessages().catch(() => []),
        adminService.getNewsletterSubscribers().catch(() => []),
        adminService.getAllReviews().catch(() => []),
        adminService.getAllServiceBenefits().catch(() => []),
        adminService.getSettings().catch(() => []),
        adminService.getAdminEmails().catch(() => []),
      ]);

      setMetrics(m);
      setProducts(pRes.products);
      setOrders(oRes.orders);
      setCategories(cList);
      setCoupons(coupList);
      setBanners(bList);
      setInventoryLedger(ledgerList);
      setUsersList(uList);
      setContactMessages(msgList);
      setSubscribers(subList);
      setReviewsList(revList);
      setServiceBenefits(benefitsList);
      setAdminEmails(allowlistEmails);

      if (Array.isArray(settingsRows) && settingsRows.length > 0) {
        const readVal = (key: string, fallback: any) => {
          const hit = settingsRows.find((r: any) => r.key === key);
          if (!hit || hit.value === null || hit.value === undefined) return fallback;
          return hit.value;
        };
        const rawAnn = readVal('announcement_items', DEFAULT_SITE_SETTINGS.announcementItems);
        const annItems = Array.isArray(rawAnn)
          ? rawAnn.map((x: any) => String(x)).filter(Boolean)
          : DEFAULT_SITE_SETTINGS.announcementItems;

        const rawCod = readVal('cod_enabled', DEFAULT_SITE_SETTINGS.codEnabled);
        const codEnabled =
          rawCod === true || String(rawCod).trim().toLowerCase() === 'true';

        const rawDelhiveryEnabled = readVal(
          'delhivery_enabled',
          DEFAULT_SITE_SETTINGS.delhiveryEnabled
        );
        const delhiveryEnabled =
          rawDelhiveryEnabled === true ||
          String(rawDelhiveryEnabled).trim().toLowerCase() === 'true';

        const rawDelhiveryAuto = readVal(
          'delhivery_auto_manifest',
          DEFAULT_SITE_SETTINGS.delhiveryAutoManifest
        );
        const delhiveryAutoManifest =
          rawDelhiveryAuto === true ||
          String(rawDelhiveryAuto).trim().toLowerCase() === 'true';

        const rawDims = readVal(
          'delhivery_default_dimensions',
          DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions
        );
        const delhiveryDefaultDimensions: DelhiveryPackageDimensions =
          rawDims && typeof rawDims === 'object' && !Array.isArray(rawDims)
            ? {
                length:
                  Math.max(1, Math.round(Number((rawDims as any).length) || 0)) ||
                  DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.length,
                breadth:
                  Math.max(1, Math.round(Number((rawDims as any).breadth) || 0)) ||
                  DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.breadth,
                height:
                  Math.max(1, Math.round(Number((rawDims as any).height) || 0)) ||
                  DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.height,
              }
            : { ...DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions };

        const delhiveryOriginPincode =
          String(
            readVal('delhivery_origin_pincode', DEFAULT_SITE_SETTINGS.delhiveryOriginPincode) ?? ''
          )
            .replace(/\D/g, '')
            .slice(0, 6) || DEFAULT_SITE_SETTINGS.delhiveryOriginPincode;

        const nextExploreCfg = normalizeExploreCategoriesConfig(
          readVal('explore_categories_config', DEFAULT_EXPLORE_CATEGORIES_CONFIG)
        );
        const nextFiltersCfg = normalizeCollectionFiltersConfig(
          readVal('collection_filters_config', DEFAULT_COLLECTION_FILTERS_CONFIG)
        );
        const mergedTypes = normalizeProductTypes(
          readVal('product_types', DEFAULT_PRODUCT_TYPES)
        );
        const knownTypeVals = new Set(mergedTypes.map((t) => t.value));
        for (const p of pRes.products || []) {
          const val = formatProductTypeValue(String(p?.product_type || ''));
          if (val && !knownTypeVals.has(val)) {
            knownTypeVals.add(val);
            mergedTypes.push({ value: val, label: getProductTypeLabel(val, mergedTypes) });
          }
        }
        setProductTypesList(mergedTypes);

        const nextSettings: SiteSettings = {
          storeName: String(readVal('store_name', DEFAULT_SITE_SETTINGS.storeName)),
          supportEmail: String(readVal('support_email', DEFAULT_SITE_SETTINGS.supportEmail)),
          conciergeEmail: String(readVal('concierge_email', DEFAULT_SITE_SETTINGS.conciergeEmail)),
          supportPhone: String(readVal('support_phone', DEFAULT_SITE_SETTINGS.supportPhone) ?? ''),
          storeAddress: String(readVal('store_address', DEFAULT_SITE_SETTINGS.storeAddress)),
          storeCityStatePin: String(readVal('store_city_state_pin', DEFAULT_SITE_SETTINGS.storeCityStatePin)),
          studioHours: String(readVal('studio_hours', DEFAULT_SITE_SETTINGS.studioHours)),
          freeShippingThreshold:
            Number(readVal('free_shipping_threshold', DEFAULT_SITE_SETTINGS.freeShippingThreshold)) ||
            DEFAULT_SITE_SETTINGS.freeShippingThreshold,
          standardShippingFee: Number(
            readVal('standard_shipping_fee', DEFAULT_SITE_SETTINGS.standardShippingFee)
          ) || 0,
          expressShippingFee: Number(
            readVal('express_shipping_fee', DEFAULT_SITE_SETTINGS.expressShippingFee)
          ) || 0,
          announcementItems: annItems,
          instagramUrl: String(readVal('instagram_url', DEFAULT_SITE_SETTINGS.instagramUrl)).replace(
            /^https?:\/\/(www\.)?instagram\.com\/?$/i,
            DEFAULT_SITE_SETTINGS.instagramUrl
          ),
          facebookUrl: String(readVal('facebook_url', DEFAULT_SITE_SETTINGS.facebookUrl)).replace(
            /^https?:\/\/(www\.)?facebook\.com\/?$/i,
            ''
          ),
          youtubeUrl: String(readVal('youtube_url', DEFAULT_SITE_SETTINGS.youtubeUrl)).replace(
            /^https?:\/\/(www\.)?youtube\.com\/?$/i,
            DEFAULT_SITE_SETTINGS.youtubeUrl
          ),
          googleUrl: String(readVal('google_url', DEFAULT_SITE_SETTINGS.googleUrl)),
          footerCopyright: String(readVal('footer_copyright', DEFAULT_SITE_SETTINGS.footerCopyright)),
          codEnabled,
          exploreCategoriesConfig: nextExploreCfg,
          collectionFiltersConfig: nextFiltersCfg,
          productTypes: mergedTypes,
          delhiveryEnabled,
          delhiveryPickupLocation:
            String(
              readVal(
                'delhivery_pickup_location',
                DEFAULT_SITE_SETTINGS.delhiveryPickupLocation
              ) ?? ''
            ).trim() || DEFAULT_SITE_SETTINGS.delhiveryPickupLocation,
          delhiveryOriginPincode,
          delhiveryAutoManifest,
          delhiveryDefaultWeightGrams:
            Math.max(
              50,
              Math.round(
                Number(
                  readVal(
                    'delhivery_default_weight_grams',
                    DEFAULT_SITE_SETTINGS.delhiveryDefaultWeightGrams
                  )
                ) || DEFAULT_SITE_SETTINGS.delhiveryDefaultWeightGrams
              )
            ),
          delhiveryDefaultDimensions,
          delhiverySellerGst: String(
            readVal('delhivery_seller_gst', DEFAULT_SITE_SETTINGS.delhiverySellerGst) ?? ''
          ).trim(),
        };

        setSettingsForm({
          ...nextSettings,
          announcementText: nextSettings.announcementItems.join('\n'),
        });
        setExploreConfigForm(nextExploreCfg);
        setFiltersConfigForm(nextFiltersCfg);
      } else {
        const mergedTypes = [...DEFAULT_PRODUCT_TYPES];
        const knownTypeVals = new Set(mergedTypes.map((t) => t.value));
        for (const p of pRes.products || []) {
          const val = formatProductTypeValue(String(p?.product_type || ''));
          if (val && !knownTypeVals.has(val)) {
            knownTypeVals.add(val);
            mergedTypes.push({ value: val, label: getProductTypeLabel(val, mergedTypes) });
          }
        }
        setProductTypesList(mergedTypes);
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      showToast('Error loading live admin data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Verify database-backed admin authorization before exposing admin console
  useEffect(() => {
    let active = true;

    const verifyAccess = async () => {
      if (authLoading) return;

      if (!user) {
        if (active) {
          setIsAuthorizedAdmin(false);
          setVerifyingAdmin(false);
          setLoading(false);
        }
        return;
      }

      setVerifyingAdmin(true);
      const roleInfo = await authService.getUserRoleInfo(user.id);
      const authorized = Boolean(roleInfo.authenticated && roleInfo.isAdmin);

      if (!active) return;

      setIsAuthorizedAdmin(authorized);
      setVerifyingAdmin(false);

      if (authorized) {
        await loadData();
      } else {
        setLoading(false);
      }
    };

    void verifyAccess();

    return () => {
      active = false;
    };
  }, [authLoading, user, loadData]);

  // Keep aria-invalid synchronized with native :user-invalid post-interaction state
  useEffect(() => {
    const syncAriaState = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || !target.matches('input, textarea, select')) return;
      if (!target.closest('.dorasani-form')) return;

      try {
        if (target.matches(':user-invalid')) {
          target.setAttribute('aria-invalid', 'true');
        } else {
          target.removeAttribute('aria-invalid');
        }
      } catch {
        // Ignore if selector is unsupported in older engines
      }
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || !target.hasAttribute('aria-invalid')) return;
      syncAriaState(event);
    };

    document.addEventListener('blur', syncAriaState, true);
    document.addEventListener('input', handleInput);
    return () => {
      document.removeEventListener('blur', syncAriaState, true);
      document.removeEventListener('input', handleInput);
    };
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  // ==================== IMAGE UPLOAD HELPER ====================
  const handleUploadSingleImage = async (
    file: File | undefined,
    bucket: 'category-images' | 'product-images' | 'homepage-banners' | 'collection-images',
    folder: string,
    targetKey: string,
    onSuccessUrl: (url: string) => void
  ) => {
    if (!file) return;
    setUploadingTarget(targetKey);
    try {
      const publicUrl = await adminService.uploadImage(file, bucket, folder);
      onSuccessUrl(publicUrl);
      showToast('Photo uploaded to Supabase Storage!');
    } catch (err: any) {
      showToast('Image upload failed: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setUploadingTarget(null);
    }
  };

  // ==================== PRODUCT HANDLERS ====================
  const openCreateProductModal = () => {
    setEditingProductId(null);
    setEditingProductSpecs({});
    setProductSlugTouched(false);
    setProductFormError(null);
    setShowInlineCatDrawer(false);
    setInlineCatName('');
    setInlineCatParentId('');
    setShowInlineTypeDrawer(false);
    setInlineTypeLabel('');
    setProductForm({
      ...DEFAULT_PRODUCT_FORM,
      category_id: categories[0]?.id || '',
      product_type: productTypesList[0]?.value || 'saree',
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (p: any) => {
    const sortedUrls = (p.product_media || [])
      .slice()
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((m: any) => m.url)
      .filter(Boolean);

    const existingSpecs =
      p.specifications && typeof p.specifications === 'object' && !Array.isArray(p.specifications)
        ? p.specifications
        : {};
    setEditingProductSpecs(existingSpecs);

    setEditingProductId(p.id);
    setProductSlugTouched(true);
    setProductFormError(null);
    setShowInlineCatDrawer(false);
    setInlineCatName('');
    setInlineCatParentId('');
    setShowInlineTypeDrawer(false);
    setInlineTypeLabel('');
    const qty = Math.max(0, Number(p.stock_quantity ?? 0));
    const resolvedStatus =
      qty <= 0 && p.status === 'active'
        ? 'out_of_stock'
        : qty > 0 && p.status === 'out_of_stock'
          ? 'active'
          : p.status || (qty > 0 ? 'active' : 'out_of_stock');
    setProductForm({
      title: p.title || '',
      slug: p.slug || '',
      sku: p.sku || '',
      subtitle: p.subtitle || '',
      category_id: p.category_id || '',
      product_type: p.product_type || 'saree',
      price_inr: Number(p.price_inr ?? 0),
      mrp_inr: Number(p.mrp_inr ?? p.price_inr ?? 0),
      stock_quantity: qty,
      status: resolvedStatus,
      fabric: p.fabric || '',
      occasion: p.occasion || '',
      weaving_style: p.weaving_style || '',
      saree_length: p.saree_length || '',
      care_instructions: p.care_instructions || 'Dry Clean Only',
      blouse_included: p.blouse_included ?? true,
      is_featured: Boolean(p.is_featured),
      is_new: Boolean(p.is_new),
      is_bestseller: Boolean(p.is_bestseller),
      is_festive: Boolean(p.is_festive),
      specificationsSubCategory:
        typeof existingSpecs.subCategory === 'string' ? existingSpecs.subCategory : '',
      specificationsTagsText: Array.isArray(existingSpecs.tags)
        ? existingSpecs.tags.join(', ')
        : '',
      imagesText:
        sortedUrls.length > 0
          ? sortedUrls.join('\n')
          : '/assets/products/kanjivaram_silk_saree.jpg',
      description: p.description || '',
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError(null);

    const cleanTitle = productForm.title.trim();
    const cleanSlug = productForm.slug.trim() || slugify(cleanTitle);
    const price = Number(productForm.price_inr);
    const mrp = Number(productForm.mrp_inr || price);
    const stock = Math.max(0, Math.round(Number(productForm.stock_quantity || 0)));

    if (!cleanTitle || !cleanSlug) {
      setProductFormError('Product title and URL slug are required.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setProductFormError('Selling price must be greater than ₹0.');
      return;
    }
    if (mrp < price) {
      setProductFormError('MRP cannot be less than the selling price.');
      return;
    }

    const parsedImages = productForm.imagesText
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const nextSpecs: Record<string, any> = {
      ...(editingProductSpecs || {}),
    };
    const cleanSub = productForm.specificationsSubCategory.trim();
    if (cleanSub) nextSpecs.subCategory = cleanSub;
    else delete nextSpecs.subCategory;
    nextSpecs.tags = productForm.specificationsTagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalStatus =
      stock <= 0 && productForm.status === 'active'
        ? 'out_of_stock'
        : stock > 0 && productForm.status === 'out_of_stock'
          ? 'active'
          : productForm.status;

    const payload: AdminProductInput = {
      title: cleanTitle,
      slug: cleanSlug,
      sku: productForm.sku.trim() || undefined,
      subtitle: productForm.subtitle.trim() || undefined,
      category_id: productForm.category_id || null,
      product_type: productForm.product_type || productTypesList[0]?.value || 'saree',
      price_inr: price,
      mrp_inr: mrp,
      stock_quantity: stock,
      status: finalStatus,
      fabric: productForm.fabric.trim() || undefined,
      occasion: productForm.occasion.trim() || undefined,
      weaving_style: productForm.weaving_style.trim() || undefined,
      saree_length: productForm.saree_length.trim() || undefined,
      care_instructions: productForm.care_instructions.trim() || undefined,
      blouse_included: productForm.blouse_included,
      is_featured: productForm.is_featured,
      is_new: productForm.is_new,
      is_bestseller: productForm.is_bestseller,
      is_festive: productForm.is_festive,
      specifications: nextSpecs,
      images: parsedImages,
      description: productForm.description,
    };

    setSavingProduct(true);
    try {
      if (editingProductId) {
        await adminService.updateProduct(editingProductId, payload);
        showToast(`Product "${cleanTitle}" updated successfully!`);
      } else {
        await adminService.createProduct(payload);
        showToast(`Product "${cleanTitle}" created successfully!`);
      }
      setProductModalOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.message || 'Unable to save product.';
      setProductFormError(msg);
      showToast('Failed to save product: ' + msg, 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleQuickProductStatus = async (p: any, nextStatus: string) => {
    const qty = Number(p.stock_quantity ?? 0);
    if (nextStatus === 'active' && qty <= 0) {
      showToast(
        `"${p.title}" has 0 stock and stays Out of Stock until stock is added.`,
        'info'
      );
      return;
    }
    try {
      await adminService.updateProduct(p.id, { status: nextStatus });
      showToast(`Product status updated to ${nextStatus.replace(/_/g, ' ')}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  // ==================== INLINE CATEGORY & PRODUCT TYPE HANDLERS ====================
  const persistProductTypes = async (nextTypes: ProductTypeOption[], toastMsg: string) => {
    setSavingProductTypes(true);
    try {
      await adminService.updateSettingsBatch({ product_types: nextTypes });
      setProductTypesList(nextTypes);
      await refreshSiteSettings();
      showToast(toastMsg);
    } catch (err: any) {
      showToast('Failed to save product types: ' + (err?.message || 'Error'), 'error');
      throw err;
    } finally {
      setSavingProductTypes(false);
    }
  };

  const handleCreateInlineCategory = async () => {
    const cleanName = inlineCatName.trim();
    const cleanSlug = slugify(cleanName);
    if (!cleanName || !cleanSlug) {
      showToast('Enter a valid category name.', 'error');
      return;
    }
    const existing = categories.find((c) => c.slug === cleanSlug);
    if (existing) {
      setProductForm((prev) => ({ ...prev, category_id: existing.id }));
      setShowInlineCatDrawer(false);
      setInlineCatName('');
      setInlineCatParentId('');
      showToast(`Selected existing category "${existing.name}".`, 'info');
      return;
    }
    setSavingInlineCat(true);
    try {
      const siblingCount = categories.filter(
        (c) => (c.parent_id || '') === (inlineCatParentId || '')
      ).length;
      const created = await adminService.createCategory({
        name: cleanName,
        slug: cleanSlug,
        parent_id: inlineCatParentId || null,
        display_order: siblingCount + 1,
        is_active: true,
      });
      await Promise.all([loadData(), refreshStoreCategories()]);
      if (created?.id) {
        setProductForm((prev) => ({ ...prev, category_id: created.id }));
      }
      setShowInlineCatDrawer(false);
      setInlineCatName('');
      setInlineCatParentId('');
      showToast(`Category "${cleanName}" created and live on storefront!`);
    } catch (err: any) {
      showToast('Failed to create category: ' + (err?.message || 'Error'), 'error');
    } finally {
      setSavingInlineCat(false);
    }
  };

  const handleCreateInlineProductType = async () => {
    const cleanLabel = inlineTypeLabel.trim();
    const cleanVal = formatProductTypeValue(cleanLabel);
    if (!cleanLabel || !cleanVal) {
      showToast('Enter a valid Product Type label (e.g. Dupatta / Stole).', 'error');
      return;
    }
    const existing = productTypesList.find(
      (t) => t.value === cleanVal || t.label.toLowerCase() === cleanLabel.toLowerCase()
    );
    if (existing) {
      setProductForm((prev) => ({ ...prev, product_type: existing.value }));
      setShowInlineTypeDrawer(false);
      setInlineTypeLabel('');
      showToast(`Selected existing Product Type "${existing.label}".`, 'info');
      return;
    }
    setSavingInlineType(true);
    try {
      const nextTypes = [...productTypesList, { value: cleanVal, label: cleanLabel }];
      await persistProductTypes(nextTypes, `Product Type "${cleanLabel}" added!`);
      setProductForm((prev) => ({ ...prev, product_type: cleanVal }));
      setShowInlineTypeDrawer(false);
      setInlineTypeLabel('');
    } catch {
      // handled in persistProductTypes
    } finally {
      setSavingInlineType(false);
    }
  };

  const handleAddProductTypeInTab = async () => {
    const cleanLabel = newTypeLabelInput.trim();
    const cleanVal = formatProductTypeValue(cleanLabel);
    if (!cleanLabel || !cleanVal) {
      showToast('Enter a Product Type name first (e.g. Dupatta / Half Saree).', 'error');
      return;
    }
    if (
      productTypesList.some(
        (t) => t.value === cleanVal || t.label.toLowerCase() === cleanLabel.toLowerCase()
      )
    ) {
      showToast('That Product Type already exists.', 'info');
      return;
    }
    try {
      const nextTypes = [...productTypesList, { value: cleanVal, label: cleanLabel }];
      await persistProductTypes(nextTypes, `Added Product Type "${cleanLabel}"!`);
      setNewTypeLabelInput('');
    } catch {
      // handled in persistProductTypes
    }
  };

  const handleSaveRenamedProductType = async (valueKey: string) => {
    const cleanLabel = editingTypeLabel.trim();
    if (!cleanLabel) {
      showToast('Product Type label cannot be empty.', 'error');
      return;
    }
    try {
      const nextTypes = productTypesList.map((t) =>
        t.value === valueKey ? { ...t, label: cleanLabel } : t
      );
      await persistProductTypes(nextTypes, `Renamed Product Type to "${cleanLabel}".`);
      setEditingTypeValue(null);
      setEditingTypeLabel('');
    } catch {
      // handled in persistProductTypes
    }
  };

  const handleDeleteProductType = async (opt: ProductTypeOption) => {
    const usedCount = products.filter((p) => p.product_type === opt.value).length;
    if (usedCount > 0) {
      showToast(
        `Cannot remove "${opt.label}" because ${usedCount} ${usedCount === 1 ? 'product uses' : 'products use'} it.`,
        'info'
      );
      return;
    }
    if (productTypesList.length <= 1) {
      showToast('At least one Product Type must remain.', 'info');
      return;
    }
    try {
      const nextTypes = productTypesList.filter((t) => t.value !== opt.value);
      await persistProductTypes(nextTypes, `Removed Product Type "${opt.label}".`);
    } catch {
      // handled in persistProductTypes
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    setDeletingProduct(true);
    try {
      await adminService.deleteProduct(deleteProductTarget.id);
      showToast(`Product "${deleteProductTarget.title}" deleted.`);
      setDeleteProductTarget(null);
      await loadData();
    } catch (err: any) {
      showToast('Failed to delete product: ' + err.message, 'error');
    } finally {
      setDeletingProduct(false);
    }
  };

  // ==================== INVENTORY HANDLERS ====================
  const handleAdjustStock = async (productId: string, delta: number, reason?: string) => {
    try {
      await adminService.adjustStock(
        productId,
        delta,
        reason || (delta > 0 ? 'restock' : 'manual_adjustment')
      );
      showToast(`Stock updated by ${delta > 0 ? '+' : ''}${delta}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to adjust stock: ' + err.message, 'error');
    }
  };

  const openStockModal = (product: any) => {
    setStockTarget(product);
    setStockMode('exact');
    setStockAmount(Number(product.stock_quantity ?? 0));
    setStockReason('restock');
  };

  const handleSaveStockModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTarget) return;
    const value = Math.round(Number(stockAmount));
    if (!Number.isFinite(value)) {
      showToast('Please enter a valid stock number.', 'error');
      return;
    }

    setSavingStock(true);
    try {
      if (stockMode === 'exact') {
        await adminService.setExactStock(stockTarget.id, Math.max(0, value), stockReason);
        showToast(
          `Stock for "${stockTarget.title}" set to ${Math.max(0, value)} units.`
        );
      } else {
        await adminService.adjustStock(stockTarget.id, value, stockReason);
        showToast(
          `Stock for "${stockTarget.title}" adjusted by ${value > 0 ? '+' : ''}${value} units.`
        );
      }
      setStockTarget(null);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update stock: ' + err.message, 'error');
    } finally {
      setSavingStock(false);
    }
  };

  // ==================== ORDER HANDLERS ====================
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      showToast(`Order status updated to ${status.replace(/_/g, ' ')}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  const openEditOrderModal = (order: any) => {
    setOrderEditTarget(order);
    setOrderEditStatus(order.order_status || 'confirmed');
    setOrderEditCourier(order.courier_name || '');
    setOrderEditTracking(order.tracking_id || '');
    setCancelAwbConfirm(false);
    setCancelAwbReason('');
  };

  const handleSaveOrderFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderEditTarget) return;
    setSavingOrder(true);
    try {
      await adminService.updateOrderStatus(
        orderEditTarget.id,
        orderEditStatus,
        orderEditCourier,
        orderEditTracking
      );
      showToast(`Order #${orderEditTarget.order_number} fulfillment updated!`);
      setOrderEditTarget(null);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update fulfillment: ' + err.message, 'error');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleConfirmDeleteOrder = async () => {
    if (!deleteOrderTarget) return;
    setDeletingOrder(true);
    try {
      await adminService.deleteOrder(deleteOrderTarget.id);
      showToast(`Order #${deleteOrderTarget.order_number} permanently deleted.`);
      setDeleteOrderTarget(null);
      await loadData();
    } catch (err: any) {
      showToast('Failed to delete order: ' + err.message, 'error');
    } finally {
      setDeletingOrder(false);
    }
  };

  // ==================== DELHIVERY ONE SHIPPING HANDLERS ====================
  const openDelhiveryManifestModal = (order: any) => {
    const itemsCount = Array.isArray(order?.order_items)
      ? order.order_items.reduce(
          (sum: number, item: any) => sum + Math.max(1, Number(item?.quantity) || 1),
          0
        )
      : 1;
    const baseWeight =
      Number(settingsForm.delhiveryDefaultWeightGrams) ||
      DEFAULT_SITE_SETTINGS.delhiveryDefaultWeightGrams;

    setDelhiveryManifestTarget(order);
    setDelhiveryManifestRates(null);
    setManifestError(null);
    setDelhiveryManifestForm({
      pickupLocation:
        settingsForm.delhiveryPickupLocation || DEFAULT_SITE_SETTINGS.delhiveryPickupLocation,
      shippingMode: order?.delivery_option === 'standard' ? 'Surface' : 'Express',
      weightGrams: Math.max(250, Math.round(baseWeight * Math.max(1, itemsCount * 0.85))),
      length:
        Number(settingsForm.delhiveryDefaultDimensions?.length) ||
        DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.length,
      breadth:
        Number(settingsForm.delhiveryDefaultDimensions?.breadth) ||
        DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.breadth,
      height:
        Number(settingsForm.delhiveryDefaultDimensions?.height) ||
        DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.height,
    });
  };

  const handleCalculateManifestRates = async () => {
    if (!delhiveryManifestTarget) return;
    const addr =
      typeof delhiveryManifestTarget.shipping_address === 'object' &&
      delhiveryManifestTarget.shipping_address !== null
        ? delhiveryManifestTarget.shipping_address
        : null;
    const destPin = String(addr?.pincode || '').replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(destPin)) {
      setManifestError('Order does not have a valid 6-digit destination PIN code.');
      return;
    }

    setManifestError(null);
    setLoadingManifestRates(true);
    try {
      const isCod =
        String(delhiveryManifestTarget.payment_method || '').toLowerCase() === 'cod';
      const res = await delhiveryService.calculateRates({
        destinationPincode: destPin,
        originPincode: settingsForm.delhiveryOriginPincode,
        weightGrams: Math.max(50, Math.round(Number(delhiveryManifestForm.weightGrams) || 650)),
        paymentMode: isCod ? 'COD' : 'Prepaid',
        codAmount: isCod ? Number(delhiveryManifestTarget.total_inr || 0) : 0,
      });
      setDelhiveryManifestRates({
        destinationPincode: res.destinationPincode,
        originPincode: res.originPincode,
        serviceability: res.serviceability,
        express: res.express,
        surface: res.surface,
      });
    } catch (err: any) {
      setManifestError(err?.message || 'Unable to calculate Delhivery freight estimate.');
    } finally {
      setLoadingManifestRates(false);
    }
  };

  const handleManifestOrderWithDelhivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delhiveryManifestTarget) return;
    const cleanPickup = delhiveryManifestForm.pickupLocation.trim();
    if (!cleanPickup) {
      setManifestError('Pickup warehouse name is required (exact name in Delhivery One).');
      return;
    }

    setManifestError(null);
    setManifestingOrder(true);
    try {
      const targetOrderId = delhiveryManifestTarget.id;
      const res = await delhiveryService.createShipment({
        orderId: targetOrderId,
        pickupLocation: cleanPickup,
        shippingMode: delhiveryManifestForm.shippingMode,
        weightGrams: Math.max(50, Math.round(Number(delhiveryManifestForm.weightGrams) || 650)),
        length: Math.max(1, Math.round(Number(delhiveryManifestForm.length) || 34)),
        breadth: Math.max(1, Math.round(Number(delhiveryManifestForm.breadth) || 26)),
        height: Math.max(1, Math.round(Number(delhiveryManifestForm.height) || 6)),
      });

      showToast(
        res.alreadyManifested
          ? `Order already manifested with Delhivery AWB ${res.waybill}`
          : `Manifested with Delhivery! AWB: ${res.waybill}`
      );
      if (orderDetailsTarget?.id === targetOrderId && res.order) {
        setOrderDetailsTarget(res.order);
      }
      setDelhiveryManifestTarget(null);
      await loadData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to manifest shipment with Delhivery One.';
      setManifestError(msg);
      showToast(msg, 'error');
    } finally {
      setManifestingOrder(false);
    }
  };

  const handleOpenDelhiveryLabel = async (order: any, waybillOverride?: string) => {
    setLoadingLabelOrderId(order.id);
    try {
      const activeShip = getActiveShipmentFromOrder(order);
      const label = await delhiveryService.getLabel({
        orderId: order.id,
        waybill: waybillOverride || activeShip?.tracking_number || order.tracking_id || undefined,
      });
      setDelhiveryLabelTarget({ order, label });
    } catch (err: any) {
      showToast(err?.message || 'Failed to load Delhivery shipping label.', 'error');
    } finally {
      setLoadingLabelOrderId(null);
    }
  };

  const handlePrintDelhiverySlip = () => {
    document.body.classList.add('printing-delhivery-slip');
    const cleanup = () => {
      document.body.classList.remove('printing-delhivery-slip');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    try {
      window.print();
    } finally {
      setTimeout(cleanup, 1200);
    }
  };

  const openSchedulePickupModal = () => {
    const packedDelhiveryOrders = orders.filter((o) => {
      const ship = getActiveShipmentFromOrder(o);
      const hasPickup = Boolean(ship?.pickup_scheduled_date);
      const isDelhivery =
        !ship?.courier_partner || /delhivery/i.test(String(ship.courier_partner));
      return ship && isDelhivery && !hasPickup && o.order_status !== 'delivered';
    });

    setPickupError(null);
    setPickupForm({
      pickupLocation:
        settingsForm.delhiveryPickupLocation || DEFAULT_SITE_SETTINGS.delhiveryPickupLocation,
      pickupDate: getDefaultPickupDateString(),
      pickupTime: '14:00:00',
      expectedPackageCount: Math.max(1, packedDelhiveryOrders.length || 1),
    });
    setPickupModalOpen(true);
  };

  const handleScheduleDelhiveryPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLoc = pickupForm.pickupLocation.trim();
    if (!cleanLoc || !pickupForm.pickupDate) {
      setPickupError('Pickup warehouse name and date are required.');
      return;
    }

    setPickupError(null);
    setSchedulingPickup(true);
    try {
      const targetOrderIds = orders
        .filter((o) => {
          const ship = getActiveShipmentFromOrder(o);
          const isDelhivery =
            !ship?.courier_partner || /delhivery/i.test(String(ship.courier_partner));
          return ship && isDelhivery && !ship?.pickup_scheduled_date;
        })
        .map((o) => o.id);

      const res = await delhiveryService.schedulePickup({
        pickupLocation: cleanLoc,
        pickupDate: pickupForm.pickupDate,
        pickupTime: pickupForm.pickupTime,
        expectedPackageCount: Math.max(1, Math.round(Number(pickupForm.expectedPackageCount) || 1)),
        orderIds: targetOrderIds.length > 0 ? targetOrderIds : undefined,
      });

      showToast(
        `Pickup scheduled for ${res.pickupDate} (${res.pickupTime})${
          res.pickupId ? ` • ID ${res.pickupId}` : ''
        }`
      );
      setPickupModalOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to schedule Delhivery pickup.';
      setPickupError(msg);
      showToast(msg, 'error');
    } finally {
      setSchedulingPickup(false);
    }
  };

  const handleSyncSingleOrderTracking = async (order: any) => {
    const activeShip = getActiveShipmentFromOrder(order);
    const waybill = activeShip?.tracking_number || order.tracking_id;
    if (!waybill) {
      showToast('No Delhivery AWB linked to this order yet.', 'error');
      return;
    }

    setSyncingOrderId(order.id);
    try {
      const res = await delhiveryService.syncTracking({
        orderId: order.id,
        waybill,
      });
      if (res.order) {
        if (orderDetailsTarget?.id === order.id) {
          setOrderDetailsTarget(res.order);
        }
        if (orderEditTarget?.id === order.id) {
          setOrderEditTarget(res.order);
          setOrderEditStatus(res.order.order_status || orderEditStatus);
          setOrderEditCourier(res.order.courier_name || '');
          setOrderEditTracking(res.order.tracking_id || '');
        }
      }
      showToast(
        res.tracking?.currentStatus
          ? `Synced AWB ${waybill}: ${res.tracking.currentStatus}`
          : `Checked Delhivery scans for AWB ${waybill}`
      );
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to sync Delhivery live scans.', 'error');
    } finally {
      setSyncingOrderId(null);
    }
  };

  const handleSyncAllDelhiveryScans = async () => {
    setSyncingAllDelhivery(true);
    try {
      const res = await delhiveryService.syncAllActiveShipments();
      showToast(
        res.checked === 0
          ? 'No active open Delhivery shipments pending scan sync.'
          : `Checked ${res.checked} active Delhivery shipment(s) — updated ${res.synced}.`
      );
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to sync Delhivery shipments.', 'error');
    } finally {
      setSyncingAllDelhivery(false);
    }
  };

  const handleCancelOrderDelhiveryAwb = async (order: any) => {
    const activeShip = getActiveShipmentFromOrder(order);
    const waybill = activeShip?.tracking_number || order.tracking_id;
    if (!waybill) return;

    setCancellingAwb(true);
    try {
      const res = await delhiveryService.cancelShipment({
        orderId: order.id,
        waybill,
        reason: cancelAwbReason.trim() || 'Cancelled by store admin',
      });
      showToast(`Delhivery AWB ${res.waybill} cancelled. Customer order remains open.`);
      setCancelAwbConfirm(false);
      setCancelAwbReason('');
      if (res.order) {
        if (orderEditTarget?.id === order.id) {
          setOrderEditTarget(res.order);
          setOrderEditStatus(res.order.order_status || 'confirmed');
          setOrderEditCourier(res.order.courier_name || '');
          setOrderEditTracking(res.order.tracking_id || '');
        }
        if (orderDetailsTarget?.id === order.id) {
          setOrderDetailsTarget(res.order);
        }
      }
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel Delhivery AWB.', 'error');
    } finally {
      setCancellingAwb(false);
    }
  };

  const handleTestDelhiveryConnection = async () => {
    setTestingDelhiveryConn(true);
    setDelhiveryConnResult(null);
    try {
      const res = await delhiveryService.testConnection(settingsForm.delhiveryOriginPincode);
      const statusText = `Connected to Delhivery One • Warehouse "${res.pickupLocation}" • Origin ${res.originPincode} (${res.hubCity}, ${res.stateCode}${res.sortCode ? ` / ${res.sortCode}` : ''}) — ${res.pinServiceable ? 'Serviceable' : 'Check PIN'}`;
      setDelhiveryConnResult({ ok: true, message: statusText });
      showToast('Delhivery One API connection verified!');
    } catch (err: any) {
      const msg = err?.message || 'Delhivery One connection test failed.';
      setDelhiveryConnResult({ ok: false, message: msg });
      showToast(msg, 'error');
    } finally {
      setTestingDelhiveryConn(false);
    }
  };

  // ==================== CATEGORY HANDLERS ====================
  const openCreateCategoryModal = (defaultParentId: string = '') => {
    setEditingCategoryId(null);
    setCategorySlugTouched(false);
    setCategoryFormError(null);
    const siblingCount = categories.filter((c) => (c.parent_id || '') === defaultParentId).length;
    setCategoryForm({
      ...DEFAULT_CATEGORY_FORM,
      parent_id: defaultParentId,
      display_order: siblingCount + 1,
    });
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (c: any) => {
    setEditingCategoryId(c.id);
    setCategorySlugTouched(true);
    setCategoryFormError(null);
    setCategoryForm({
      name: c.name || '',
      slug: c.slug || '',
      parent_id: c.parent_id || '',
      display_order: Number(c.display_order ?? 10),
      image_url: c.image_url || '',
      filter_keywords: c.filter_keywords || '',
      description: c.description || '',
      is_active: c.is_active ?? true,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError(null);
    const cleanName = categoryForm.name.trim();
    const cleanSlug = categoryForm.slug.trim() || slugify(cleanName);

    if (!cleanName || !cleanSlug) {
      setCategoryFormError('Category name and slug are required.');
      return;
    }

    const payload: AdminCategoryInput = {
      name: cleanName,
      slug: cleanSlug,
      parent_id: categoryForm.parent_id || null,
      display_order: Number(categoryForm.display_order ?? 10),
      image_url: categoryForm.image_url.trim() || null,
      filter_keywords: categoryForm.filter_keywords.trim() || null,
      description: categoryForm.description.trim() || null,
      is_active: categoryForm.is_active,
    };

    setSavingCategory(true);
    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, payload);
        showToast(`Category "${cleanName}" updated and live on storefront.`);
      } else {
        await adminService.createCategory(payload);
        showToast(`Category "${cleanName}" created and live on storefront.`);
      }
      setCategoryModalOpen(false);
      await Promise.all([loadData(), refreshStoreCategories()]);
    } catch (err: any) {
      const msg = err?.message || 'Failed to save category.';
      setCategoryFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleToggleCategoryActive = async (c: any) => {
    try {
      const next = !c.is_active;
      await adminService.updateCategory(c.id, { is_active: next });
      showToast(`"${c.name}" is now ${next ? 'visible' : 'hidden'} on storefront.`);
      await Promise.all([loadData(), refreshStoreCategories()]);
    } catch (err: any) {
      showToast('Failed to update visibility: ' + err.message, 'error');
    }
  };

  const handleMoveCategoryOrder = async (c: any, direction: 'up' | 'down', siblings: any[]) => {
    const idx = siblings.findIndex((s) => s.id === c.id);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const current = siblings[idx];
    const neighbor = siblings[swapIdx];
    const currentOrder = Number(current.display_order ?? idx + 1);
    const neighborOrder = Number(neighbor.display_order ?? swapIdx + 1);

    const newCurrentOrder =
      currentOrder === neighborOrder
        ? direction === 'up'
          ? Math.max(0, neighborOrder - 1)
          : neighborOrder + 1
        : neighborOrder;
    const newNeighborOrder = currentOrder === neighborOrder ? neighborOrder : currentOrder;

    try {
      await Promise.all([
        adminService.updateCategory(current.id, { display_order: newCurrentOrder }),
        adminService.updateCategory(neighbor.id, { display_order: newNeighborOrder }),
      ]);
      showToast(`Updated order for "${current.name}".`);
      await Promise.all([loadData(), refreshStoreCategories()]);
    } catch (err: any) {
      showToast('Failed to reorder category: ' + err.message, 'error');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setDeletingCategory(true);
    try {
      await adminService.deleteCategory(deleteCategoryTarget.id);
      showToast(`Category "${deleteCategoryTarget.name}" deleted.`);
      setDeleteCategoryTarget(null);
      await Promise.all([loadData(), refreshStoreCategories()]);
    } catch (err: any) {
      showToast('Failed to delete category: ' + err.message, 'error');
    } finally {
      setDeletingCategory(false);
    }
  };

  // ==================== EXPLORE BAR & DYNAMIC FILTERS BUILDER HANDLERS ====================
  const detectCatalogValuesForFilterGroup = (group: FilterGroupConfig): string[] => {
    const activeProds = products.filter(
      (p) => p.status === 'active' || p.status === 'out_of_stock'
    );
    switch (group.type) {
      case 'product_type':
        return Array.from(
          new Set(
            activeProds
              .map((p) => getProductTypeLabel(p.product_type, productTypesList))
              .filter(Boolean)
          )
        ).sort();
      case 'fabric':
        return Array.from(
          new Set(activeProds.map((p) => String(p.fabric || '').trim()).filter(Boolean))
        ).sort();
      case 'occasion':
        return Array.from(
          new Set(activeProds.map((p) => String(p.occasion || '').trim()).filter(Boolean))
        ).sort();
      case 'weave':
        return Array.from(
          new Set(activeProds.map((p) => String(p.weaving_style || '').trim()).filter(Boolean))
        ).sort();
      case 'color': {
        const colors = new Set<string>();
        for (const p of activeProds) {
          const specs = p.specifications || {};
          if (Array.isArray(specs.colors)) {
            for (const c of specs.colors) {
              if (c?.name?.trim()) colors.add(c.name.trim());
            }
          }
          if (p.color_description?.trim()) colors.add(p.color_description.trim());
        }
        return Array.from(colors).sort();
      }
      case 'availability':
        return ['In Stock Only', 'New Arrivals', 'Bestsellers', 'Festive Edit'];
      case 'discount':
        return ['10% or more', '20% or more', '30% or more'];
      case 'tag': {
        const tags = new Set<string>();
        for (const p of activeProds) {
          const specs = p.specifications || {};
          if (typeof specs.subCategory === 'string' && specs.subCategory.trim()) {
            tags.add(specs.subCategory.trim());
          }
          if (Array.isArray(specs.tags)) {
            for (const t of specs.tags) {
              if (String(t).trim()) tags.add(String(t).trim());
            }
          }
        }
        return Array.from(tags).sort();
      }
      default:
        return [];
    }
  };

  const updateFilterGroup = (groupId: string, patch: Partial<FilterGroupConfig>) => {
    setFiltersConfigForm((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
    }));
  };

  const moveFilterGroupOrder = (groupId: string, direction: 'up' | 'down') => {
    setFiltersConfigForm((prev) => {
      const sorted = [...prev.groups].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((g) => g.id === groupId);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const temp = sorted[idx];
      sorted[idx] = sorted[swapIdx];
      sorted[swapIdx] = temp;
      return {
        ...prev,
        groups: sorted.map((g, i) => ({ ...g, displayOrder: i + 1 })),
      };
    });
  };

  const handleAddCustomTagFilterGroup = () => {
    const cleanLabel = customTagLabelInput.trim();
    if (!cleanLabel) {
      showToast('Enter a filter group title first (e.g. Zari Style or Sub-Collection).', 'error');
      return;
    }
    const id = `tag-${slugify(cleanLabel) || Date.now()}`;
    if (filtersConfigForm.groups.some((g) => g.id === id)) {
      showToast('A filter group with a matching ID already exists.', 'error');
      return;
    }
    const nextOrder =
      filtersConfigForm.groups.reduce((m, g) => Math.max(m, g.displayOrder), 0) + 1;
    setFiltersConfigForm((prev) => ({
      ...prev,
      groups: [
        ...prev.groups,
        {
          id,
          type: 'tag',
          label: cleanLabel,
          enabled: true,
          displayOrder: nextOrder,
          optionSource: 'auto',
          customOptions: [],
          hiddenOptions: [],
        },
      ],
    }));
    setCustomTagLabelInput('');
  };

  const handleDeleteCustomTagFilterGroup = (groupId: string) => {
    setFiltersConfigForm((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
    }));
  };

  const updateExploreScopeOverride = (
    slug: string,
    patch: Partial<ExploreCategoryOverride>
  ) => {
    setExploreConfigForm((prev) => {
      const nextOv: ExploreCategoryOverride = {
        ...(prev.categoryOverrides[slug] || {}),
        ...patch,
      };
      const nextOverrides = { ...prev.categoryOverrides, [slug]: nextOv };
      if (
        nextOv.enabled === undefined &&
        !nextOv.title &&
        nextOv.showAllPill === undefined &&
        !nextOv.allPillLabel
      ) {
        delete nextOverrides[slug];
      }
      return {
        ...prev,
        categoryOverrides: nextOverrides,
      };
    });
  };

  const updateFilterScopeOverride = (
    slug: string,
    patch: Partial<CategoryFilterOverride>
  ) => {
    setFiltersConfigForm((prev) => ({
      ...prev,
      categoryOverrides: {
        ...prev.categoryOverrides,
        [slug]: {
          ...(prev.categoryOverrides[slug] || {}),
          ...patch,
        },
      },
    }));
  };

  const updateFilterGroupOverride = (
    slug: string,
    groupId: string,
    patch: Partial<CategoryFilterGroupOverride>
  ) => {
    setFiltersConfigForm((prev) => {
      const currentScope = prev.categoryOverrides[slug] || {};
      const currentGroupOverrides = { ...(currentScope.groupOverrides || {}) };
      const mergedGroupOv: CategoryFilterGroupOverride = {
        ...(currentGroupOverrides[groupId] || {}),
        ...patch,
      };
      if (
        mergedGroupOv.enabled === undefined &&
        !mergedGroupOv.label &&
        (!mergedGroupOv.customOptions || mergedGroupOv.customOptions.length === 0) &&
        mergedGroupOv.minPrice === undefined &&
        mergedGroupOv.maxPrice === undefined
      ) {
        delete currentGroupOverrides[groupId];
      } else {
        currentGroupOverrides[groupId] = mergedGroupOv;
      }
      return {
        ...prev,
        categoryOverrides: {
          ...prev.categoryOverrides,
          [slug]: {
            ...currentScope,
            groupOverrides: currentGroupOverrides,
          },
        },
      };
    });
  };

  const handleResetScopeOverrides = (slug: string) => {
    setExploreConfigForm((prev) => {
      const next = { ...prev.categoryOverrides };
      delete next[slug];
      return { ...prev, categoryOverrides: next };
    });
    setFiltersConfigForm((prev) => {
      const next = { ...prev.categoryOverrides };
      delete next[slug];
      return { ...prev, categoryOverrides: next };
    });
    showToast(`Cleared custom overrides for "/${slug}" (reverted to Global Default).`);
  };

  const handleSaveExploreAndFilters = async () => {
    setSavingExploreAndFilters(true);
    try {
      const cleanExplore = normalizeExploreCategoriesConfig(exploreConfigForm);
      const cleanFilters = normalizeCollectionFiltersConfig(filtersConfigForm);
      await adminService.updateSettingsBatch({
        explore_categories_config: cleanExplore,
        collection_filters_config: cleanFilters,
      });
      await Promise.all([refreshSiteSettings(), loadData()]);
      showToast('Explore Categories & Collection Filters saved and live on storefront!');
    } catch (err: any) {
      showToast('Failed to save Explore & Filters config: ' + (err?.message || 'Error'), 'error');
    } finally {
      setSavingExploreAndFilters(false);
    }
  };

  // ==================== COUPON HANDLERS ====================
  const openCreateCouponModal = () => {
    setEditingCouponId(null);
    setCouponFormError(null);
    setCouponForm(DEFAULT_COUPON_FORM);
    setCouponModalOpen(true);
  };

  const openEditCouponModal = (c: any) => {
    setEditingCouponId(c.id);
    setCouponFormError(null);
    setCouponForm({
      code: c.code || '',
      discount_type: c.discount_type === 'fixed' ? 'fixed' : 'percentage',
      discount_value: Number(c.discount_value ?? 10),
      min_order_amount_inr: Number(c.min_order_amount_inr ?? 0),
      max_discount_inr:
        c.max_discount_inr !== null && c.max_discount_inr !== undefined
          ? String(c.max_discount_inr)
          : '',
      usage_limit:
        c.usage_limit !== null && c.usage_limit !== undefined ? String(c.usage_limit) : '',
      end_date: c.end_date ? String(c.end_date).slice(0, 10) : '',
      is_active: Boolean(c.is_active),
    });
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFormError(null);

    const cleanCode = couponForm.code.trim().toUpperCase().replace(/\s+/g, '');
    const value = Number(couponForm.discount_value);
    const minOrder = Math.max(0, Number(couponForm.min_order_amount_inr || 0));
    const maxDisc =
      couponForm.max_discount_inr.trim() !== ''
        ? Math.max(0, Number(couponForm.max_discount_inr))
        : null;
    const limit =
      couponForm.usage_limit.trim() !== ''
        ? Math.max(1, Math.round(Number(couponForm.usage_limit)))
        : null;

    if (!cleanCode || cleanCode.length < 3) {
      setCouponFormError('Coupon code must be at least 3 characters (letters, numbers, - or _).');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setCouponFormError('Discount value must be greater than 0.');
      return;
    }
    if (couponForm.discount_type === 'percentage' && value > 95) {
      setCouponFormError('Percentage discount must be between 1% and 95%.');
      return;
    }

    const payload: AdminCouponInput = {
      code: cleanCode,
      discount_type: couponForm.discount_type,
      discount_value: Math.round(value),
      min_order_amount_inr: Math.round(minOrder),
      max_discount_inr:
        couponForm.discount_type === 'percentage' && maxDisc && maxDisc > 0 ? maxDisc : null,
      usage_limit: limit,
      end_date: couponForm.end_date ? `${couponForm.end_date}T23:59:59.000Z` : null,
      is_active: couponForm.is_active,
    };

    setSavingCoupon(true);
    try {
      if (editingCouponId) {
        await adminService.updateCoupon(editingCouponId, payload);
        showToast(`Coupon "${cleanCode}" updated!`);
      } else {
        await adminService.createCoupon(payload);
        showToast(`Coupon "${cleanCode}" created and live on checkout!`);
      }
      setCouponModalOpen(false);
      await Promise.all([loadData(), refreshCoupons()]);
    } catch (err: any) {
      const msg = err?.message || 'Failed to save coupon.';
      setCouponFormError(msg);
      showToast('Failed to save coupon: ' + msg, 'error');
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (couponId: string, currentActive: boolean) => {
    try {
      await adminService.toggleCoupon(couponId, !currentActive);
      showToast(`Coupon ${!currentActive ? 'activated' : 'disabled'}.`);
      await Promise.all([loadData(), refreshCoupons()]);
    } catch (err: any) {
      showToast('Failed to update coupon: ' + err.message, 'error');
    }
  };

  const handleConfirmDeleteCoupon = async () => {
    if (!deleteCouponTarget) return;
    setDeletingCoupon(true);
    try {
      await adminService.deleteCoupon(deleteCouponTarget.id);
      showToast(`Coupon "${deleteCouponTarget.code}" deleted.`);
      setDeleteCouponTarget(null);
      await Promise.all([loadData(), refreshCoupons()]);
    } catch (err: any) {
      showToast('Failed to delete coupon: ' + err.message, 'error');
    } finally {
      setDeletingCoupon(false);
    }
  };

  // ==================== BANNER HANDLERS ====================
  const openCreateBannerModal = () => {
    setEditingBannerId(null);
    setBannerFormError(null);
    setBannerForm({
      ...DEFAULT_BANNER_FORM,
      display_order: banners.length + 1,
    });
    setBannerModalOpen(true);
  };

  const openEditBannerModal = (b: any) => {
    setEditingBannerId(b.id);
    setBannerFormError(null);
    setBannerForm({
      banner_type: b.banner_type || 'hero',
      tagline: b.tagline || '',
      title_line_1: b.title_line_1 || '',
      title_line_2: b.title_line_2 || '',
      description: b.description || '',
      primary_cta_label: b.primary_cta_label || '',
      primary_cta_link: b.primary_cta_link || '',
      secondary_cta_label: b.secondary_cta_label || '',
      secondary_cta_link: b.secondary_cta_link || '',
      desktop_image_url: b.desktop_image_url || '',
      mobile_image_url: b.mobile_image_url || '',
      display_order: Number(b.display_order ?? 1),
      is_active: b.is_active ?? true,
    });
    setBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerFormError(null);

    if (
      !bannerForm.title_line_1.trim() ||
      !bannerForm.desktop_image_url.trim() ||
      !bannerForm.mobile_image_url.trim()
    ) {
      setBannerFormError('Primary headline, desktop image URL, and mobile image URL are required.');
      return;
    }

    const payload: AdminBannerInput = {
      banner_type: bannerForm.banner_type,
      tagline: bannerForm.tagline.trim() || null,
      title_line_1: bannerForm.title_line_1.trim(),
      title_line_2: bannerForm.title_line_2.trim() || null,
      description: bannerForm.description.trim() || null,
      primary_cta_label: bannerForm.primary_cta_label.trim() || null,
      primary_cta_link: bannerForm.primary_cta_link.trim() || null,
      secondary_cta_label: bannerForm.secondary_cta_label.trim() || null,
      secondary_cta_link: bannerForm.secondary_cta_link.trim() || null,
      desktop_image_url: bannerForm.desktop_image_url.trim(),
      mobile_image_url: bannerForm.mobile_image_url.trim(),
      display_order: Number(bannerForm.display_order ?? 1),
      is_active: bannerForm.is_active,
    };

    setSavingBanner(true);
    try {
      if (editingBannerId) {
        await adminService.updateBanner(editingBannerId, payload);
        showToast(`Banner "${payload.title_line_1}" updated.`);
      } else {
        await adminService.createBanner(payload);
        showToast(`Banner "${payload.title_line_1}" added to homepage CMS!`);
      }
      setBannerModalOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save banner.';
      setBannerFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleBanner = async (b: any) => {
    try {
      await adminService.updateBanner(b.id, { is_active: !b.is_active });
      showToast(`Banner ${!b.is_active ? 'published' : 'hidden'}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to toggle banner: ' + err.message, 'error');
    }
  };

  const handleConfirmDeleteBanner = async () => {
    if (!deleteBannerTarget) return;
    setDeletingBanner(true);
    try {
      await adminService.deleteBanner(deleteBannerTarget.id);
      showToast(`Banner "${deleteBannerTarget.title_line_1}" deleted.`);
      setDeleteBannerTarget(null);
      await loadData();
    } catch (err: any) {
      showToast('Failed to delete banner: ' + err.message, 'error');
    } finally {
      setDeletingBanner(false);
    }
  };

  // ==================== USERS, ROLES, ALLOWLIST & INQUIRIES HANDLERS ====================
  const handleUpdateUserRole = async (targetUser: any, nextRole: UserRole) => {
    if (!targetUser?.id || targetUser.id === user?.id) return;
    try {
      await adminService.updateUserRole(targetUser.id, nextRole, user?.id, targetUser.email);
      showToast(`Updated ${targetUser.full_name || targetUser.email}'s role to ${nextRole.replace(/_/g, ' ')}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update role: ' + err.message, 'error');
    }
  };

  const openActivityLogsModal = async (targetUser: any) => {
    setActivityUserTarget(targetUser);
    setActivityLogs([]);
    setLoadingActivity(true);
    try {
      const logs = await adminService.getCustomerActivityLogs(targetUser.id);
      setActivityLogs(logs);
    } catch (err: any) {
      showToast('Failed to load activity logs: ' + err.message, 'error');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleSaveAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address for the staff allowlist.', 'error');
      return;
    }
    setSavingAdminEmail(true);
    try {
      await adminService.upsertAdminEmail({
        email: cleanEmail,
        role: adminEmailRole,
        is_active: true,
        notes: adminEmailNotes,
      });
      showToast(`Allowlisted ${cleanEmail} as ${adminEmailRole.replace(/_/g, ' ')}.`);
      setAdminEmailInput('');
      setAdminEmailNotes('');
      await loadData();
    } catch (err: any) {
      showToast('Failed to update allowlist: ' + err.message, 'error');
    } finally {
      setSavingAdminEmail(false);
    }
  };

  const handleToggleAdminEmailActive = async (entry: any) => {
    if (entry.email?.toLowerCase() === user?.email?.toLowerCase()) {
      showToast('You cannot deactivate your own active super admin entry.', 'info');
      return;
    }
    try {
      await adminService.upsertAdminEmail({
        email: entry.email,
        role: entry.role,
        is_active: !entry.is_active,
        notes: entry.notes || undefined,
      });
      showToast(`${entry.email} ${!entry.is_active ? 'activated' : 'disabled'}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update allowlist entry: ' + err.message, 'error');
    }
  };

  const handleDeleteAdminEmail = async (email: string) => {
    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      showToast('You cannot remove your own super admin allowlist entry.', 'info');
      return;
    }
    try {
      await adminService.deleteAdminEmail(email);
      showToast(`Removed ${email} from admin allowlist.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to remove email: ' + err.message, 'error');
    }
  };

  const handleUpdateContactStatus = async (
    id: string,
    status: 'new' | 'read' | 'responded'
  ) => {
    try {
      await adminService.updateContactMessageStatus(id, status);
      if (contactViewTarget?.id === id) {
        setContactViewTarget({ ...contactViewTarget, status });
      }
      showToast(`Inquiry marked as ${status}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update inquiry: ' + err.message, 'error');
    }
  };

  const handleDeleteContactMessage = async (id: string) => {
    try {
      await adminService.deleteContactMessage(id);
      if (contactViewTarget?.id === id) {
        setContactViewTarget(null);
      }
      showToast('Contact inquiry deleted.');
      await loadData();
    } catch (err: any) {
      showToast('Failed to delete inquiry: ' + err.message, 'error');
    }
  };

  const handleToggleSubscriber = async (sub: any) => {
    try {
      await adminService.toggleNewsletterSubscriber(sub.id, !(sub.is_active !== false));
      showToast(
        `${sub.email} ${sub.is_active !== false ? 'paused' : 'reactivated'}.`
      );
      await loadData();
    } catch (err: any) {
      showToast('Failed to update subscriber: ' + err.message, 'error');
    }
  };

  const handleUpdateReviewStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    try {
      await adminService.updateReviewStatus(id, status);
      showToast(`Review marked as ${status} and product rating updated.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update review: ' + err.message, 'error');
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await adminService.deleteReview(id);
      showToast('Review deleted and product rating updated.');
      await loadData();
    } catch (err: any) {
      showToast('Failed to delete review: ' + err.message, 'error');
    }
  };

  // ==================== STOREFRONT SETTINGS & SERVICE BENEFITS HANDLERS ====================
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFormError(null);

    const cleanStoreName = settingsForm.storeName.trim();
    const cleanSupportEmail = settingsForm.supportEmail.trim();
    const cleanConciergeEmail = settingsForm.conciergeEmail.trim();
    const cleanPickupLocation = settingsForm.delhiveryPickupLocation.trim();
    const cleanOriginPincode = settingsForm.delhiveryOriginPincode
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!cleanStoreName || !cleanSupportEmail || !cleanConciergeEmail) {
      setSettingsFormError('Store name, support email, and concierge email are required.');
      return;
    }

    if (!cleanPickupLocation) {
      setSettingsFormError(
        'Delhivery Pickup Location / Warehouse Name is required (exact match with Delhivery One).'
      );
      return;
    }

    if (!/^\d{6}$/.test(cleanOriginPincode)) {
      setSettingsFormError('Delhivery Origin Warehouse PIN code must be a valid 6-digit PIN.');
      return;
    }

    const threshold = Math.max(0, Math.round(Number(settingsForm.freeShippingThreshold || 0)));
    const standardFee = Math.max(0, Math.round(Number(settingsForm.standardShippingFee || 0)));
    const expressFee = Math.max(0, Math.round(Number(settingsForm.expressShippingFee || 0)));
    const defaultWeight = Math.max(
      50,
      Math.round(Number(settingsForm.delhiveryDefaultWeightGrams || 650))
    );
    const defaultDimensions: DelhiveryPackageDimensions = {
      length: Math.max(
        1,
        Math.round(
          Number(settingsForm.delhiveryDefaultDimensions?.length) ||
            DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.length
        )
      ),
      breadth: Math.max(
        1,
        Math.round(
          Number(settingsForm.delhiveryDefaultDimensions?.breadth) ||
            DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.breadth
        )
      ),
      height: Math.max(
        1,
        Math.round(
          Number(settingsForm.delhiveryDefaultDimensions?.height) ||
            DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions.height
        )
      ),
    };
    const announcementList = settingsForm.announcementText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    setSavingSettings(true);
    try {
      await adminService.updateSettingsBatch({
        store_name: cleanStoreName,
        support_email: cleanSupportEmail,
        concierge_email: cleanConciergeEmail,
        support_phone: settingsForm.supportPhone.trim(),
        store_address: settingsForm.storeAddress.trim(),
        store_city_state_pin: settingsForm.storeCityStatePin.trim(),
        studio_hours: settingsForm.studioHours.trim(),
        free_shipping_threshold: threshold,
        standard_shipping_fee: standardFee,
        express_shipping_fee: expressFee,
        announcement_items:
          announcementList.length > 0
            ? announcementList
            : DEFAULT_SITE_SETTINGS.announcementItems,
        instagram_url: settingsForm.instagramUrl.trim(),
        facebook_url: settingsForm.facebookUrl.trim(),
        youtube_url: settingsForm.youtubeUrl.trim(),
        google_url: settingsForm.googleUrl.trim(),
        footer_copyright:
          settingsForm.footerCopyright.trim() || DEFAULT_SITE_SETTINGS.footerCopyright,
        cod_enabled: Boolean(settingsForm.codEnabled),
        delhivery_enabled: Boolean(settingsForm.delhiveryEnabled),
        delhivery_pickup_location: cleanPickupLocation,
        delhivery_origin_pincode: cleanOriginPincode,
        delhivery_auto_manifest: Boolean(settingsForm.delhiveryAutoManifest),
        delhivery_default_weight_grams: defaultWeight,
        delhivery_default_dimensions: defaultDimensions,
        delhivery_seller_gst: settingsForm.delhiverySellerGst.trim().toUpperCase(),
      });
      await Promise.all([refreshSiteSettings(), loadData()]);
      showToast('Storefront & Delhivery settings saved and applied live!');
    } catch (err: any) {
      const msg = err?.message || 'Failed to save storefront settings.';
      setSettingsFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const openCreateBenefitModal = () => {
    setEditingBenefitId(null);
    setBenefitFormError(null);
    setBenefitForm({
      ...DEFAULT_BENEFIT_FORM,
      display_order: serviceBenefits.length + 1,
    });
    setBenefitModalOpen(true);
  };

  const openEditBenefitModal = (b: any) => {
    setEditingBenefitId(b.id);
    setBenefitFormError(null);
    setBenefitForm({
      icon_name: b.icon_name || 'Sparkles',
      title: b.title || '',
      description: b.description || '',
      display_order: Number(b.display_order ?? 1),
      is_active: b.is_active ?? true,
    });
    setBenefitModalOpen(true);
  };

  const handleSaveBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBenefitFormError(null);

    if (!benefitForm.title.trim() || !benefitForm.description.trim()) {
      setBenefitFormError('Benefit title and description are required.');
      return;
    }

    setSavingBenefit(true);
    try {
      if (editingBenefitId) {
        await adminService.updateServiceBenefit(editingBenefitId, benefitForm);
        showToast(`Benefit "${benefitForm.title}" updated.`);
      } else {
        await adminService.createServiceBenefit(benefitForm);
        showToast(`Benefit "${benefitForm.title}" added.`);
      }
      setBenefitModalOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save service benefit.';
      setBenefitFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSavingBenefit(false);
    }
  };

  const handleConfirmDeleteBenefit = async () => {
    if (!deleteBenefitTarget) return;
    setDeletingBenefit(true);
    try {
      await adminService.deleteServiceBenefit(deleteBenefitTarget.id);
      showToast(`Service benefit "${deleteBenefitTarget.title}" deleted.`);
      setDeleteBenefitTarget(null);
      await loadData();
    } catch (err: any) {
      showToast('Failed to delete service benefit: ' + err.message, 'error');
    } finally {
      setDeletingBenefit(false);
    }
  };

  // ==================== CSV EXPORT ====================
  const exportToCSV = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) {
      showToast('No records to export.', 'info');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row: any) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell =
                typeof cell === 'object'
                  ? JSON.stringify(cell).replace(/"/g, '""')
                  : String(cell).replace(/"/g, '""');
              return `"${cell}"`;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv successfully!`);
  };

  // Guard UI: Verification in progress
  if (authLoading || verifyingAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <SeoHead
          title="Admin Dashboard | DORASANI"
          description="DORASANI store administration portal."
          canonicalPath="/admin"
          robots="noindex, nofollow"
        />
        <div className="w-10 h-10 border-4 border-[#285A3C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[#1A3B2B]">Verifying administrator privileges...</p>
      </div>
    );
  }

  // Guard UI: Not signed in or not an authorized DB admin
  if (!user || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-4 sm:p-8">
        <SeoHead
          title="Administrator Access | DORASANI"
          description="DORASANI store administration portal."
          canonicalPath="/admin"
          robots="noindex, nofollow"
        />
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#D8C7B5] shadow-lg p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#D0E9C0]/50 border border-[#BCD8AA] text-[#285A3C] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-serif-royal text-2xl font-bold text-[#1A3B2B]">
              {!user ? 'Administrator Sign-In Required' : 'Administrator Access Restricted'}
            </h1>
            <p className="text-xs text-[#4F6355] leading-relaxed">
              {!user
                ? 'Please sign in with an authorized DORASANI administrator account to open the Admin Dashboard.'
                : `Signed in as ${user.email}, which does not have administrator permissions in the database.`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!user ? (
              <Link
                to="/login?redirect=/admin"
                className="flex-1 bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-xs"
              >
                Sign In to Admin
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-xs"
              >
                Switch Account
              </button>
            )}
            <Link
              to="/"
              className="flex-1 border border-[#D8C7B5] hover:bg-[#FAF5EE] text-[#1A3B2B] text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              View User Interface
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !productSearch ||
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.fabric && p.fabric.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCat =
      productCategoryFilter === 'all' || p.category_id === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.trim().toLowerCase();
    const paymentsList: any[] = Array.isArray(o.payments)
      ? o.payments
      : o.payments
      ? [o.payments]
      : [];
    const shipmentsList = getShipmentsFromOrder(o);
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      (o.tracking_id && String(o.tracking_id).toLowerCase().includes(q)) ||
      shipmentsList.some(
        (s) => s?.tracking_number && String(s.tracking_number).toLowerCase().includes(q)
      ) ||
      paymentsList.some(
        (p) =>
          p?.provider_payment_id?.toLowerCase().includes(q) ||
          p?.provider_order_id?.toLowerCase().includes(q)
      );
    const matchesStatus =
      orderStatusFilter === 'all' ||
      (orderStatusFilter === 'in_progress'
        ? ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'].includes(
            o.order_status
          )
        : orderStatusFilter === 'returned_refunded'
        ? ['returned', 'refunded'].includes(o.order_status)
        : o.order_status === orderStatusFilter);
    return matchesSearch && matchesStatus;
  });

  const filteredInventoryProducts = products.filter(
    (p) =>
      !inventorySearch ||
      p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(inventorySearch.toLowerCase()))
  );

  const filteredUsers = usersList.filter((u) => {
    const q = usersSearch.trim().toLowerCase();
    return (
      !q ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && String(u.phone).toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const filteredContactMessages = contactMessages.filter(
    (m) => messageStatusFilter === 'all' || (m.status || 'new') === messageStatusFilter
  );

  const filteredReviews = reviewsList.filter(
    (r) => reviewStatusFilter === 'all' || (r.status || 'pending') === reviewStatusFilter
  );

  const parsedModalImages = productForm.imagesText
    .split(/\r?\n|,/)
    .map((u) => u.trim())
    .filter(Boolean);

  const sortedCategories = [...categories].sort((a, b) => {
    const pDiff = (a.parent_id ? 1 : 0) - (b.parent_id ? 1 : 0);
    if (categoryParentFilter === 'all' && pDiff !== 0) {
      // Keep parent collections grouped ahead or follow display_order naturally
    }
    const orderDiff = Number(a.display_order ?? 999) - Number(b.display_order ?? 999);
    if (orderDiff !== 0) return orderDiff;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  const topLevelCategories = sortedCategories.filter((c) => !c.parent_id);

  // Include both true top-level categories and nested collections that have their own Explore subcategories (e.g. kurtis)
  const parentFilterCategories = sortedCategories.filter(
    (c) => !c.parent_id || sortedCategories.some((child) => child.parent_id === c.id)
  );

  const selectedFilterParent =
    categoryParentFilter !== 'all' && categoryParentFilter !== 'top'
      ? categories.find((c) => c.id === categoryParentFilter) || null
      : null;

  const filteredCategoriesView = sortedCategories.filter((c) => {
    if (categoryParentFilter === 'all') return true;
    if (categoryParentFilter === 'top') return !c.parent_id;
    return c.parent_id === categoryParentFilter;
  });

  const knownSubcategoryNames = Array.from(
    new Set(
      categories
        .filter((c) => Boolean(c.parent_id) || c.slug === 'kurtis' || c.slug === 'festive')
        .map((c) => c.name)
        .filter(Boolean)
    )
  ).sort();

  const scopeOptions: { slug: string; label: string }[] = [
    { slug: '__global__', label: 'Global Default (All Collection Pages)' },
    { slug: 'all', label: 'Shop All (/shop)' },
    { slug: 'new-arrivals', label: 'New Arrivals (/new-arrivals)' },
    { slug: 'bestsellers', label: 'Bestsellers (/bestsellers)' },
    ...parentFilterCategories
      .filter((c) => !['all', 'new-arrivals', 'bestsellers'].includes(c.slug))
      .map((c) => ({
        slug: c.slug,
        label: `${c.name} (/collections/${c.slug})`,
      })),
  ];

  const isGlobalBuilderScope = configScopeSlug === '__global__';
  const activeScopeExploreOv = !isGlobalBuilderScope
    ? exploreConfigForm.categoryOverrides[configScopeSlug] || {}
    : {};
  const activeScopeFilterOv = !isGlobalBuilderScope
    ? filtersConfigForm.categoryOverrides[configScopeSlug] || {}
    : {};
  const hasScopeOverride =
    !isGlobalBuilderScope &&
    (Boolean(exploreConfigForm.categoryOverrides[configScopeSlug]) ||
      Boolean(
        filtersConfigForm.categoryOverrides[configScopeSlug] &&
          (filtersConfigForm.categoryOverrides[configScopeSlug].enabled !== undefined ||
            filtersConfigForm.categoryOverrides[configScopeSlug].sidebarTitle ||
            (filtersConfigForm.categoryOverrides[configScopeSlug].disabledGroupIds?.length ?? 0) > 0 ||
            Object.keys(
              filtersConfigForm.categoryOverrides[configScopeSlug].groupOverrides || {}
            ).length > 0)
      ));

  const sortedFilterGroups = [...filtersConfigForm.groups].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const productModalStockMeta = getStockStatusMeta(
    productForm.stock_quantity,
    productForm.status
  );

  const resultingModalStock = stockTarget
    ? stockMode === 'exact'
      ? Math.max(0, Math.round(stockAmount || 0))
      : Math.max(0, Number(stockTarget.stock_quantity ?? 0) + Math.round(stockAmount || 0))
    : 0;
  const resultingModalStockMeta = getStockStatusMeta(resultingModalStock);

  const renderGroupedCategoryOptions = () => {
    const categoryIdSet = new Set(sortedCategories.map((c) => c.id));
    const parentsWithKids = sortedCategories.filter((parent) =>
      sortedCategories.some((child) => child.parent_id === parent.id)
    );
    const orphans = sortedCategories.filter(
      (c) => Boolean(c.parent_id) && !categoryIdSet.has(c.parent_id)
    );

    return (
      <>
        {topLevelCategories.length > 0 && (
          <optgroup label="Top-Level Collections">
            {topLevelCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
                {cat.is_active === false ? ' (Hidden)' : ''}
              </option>
            ))}
          </optgroup>
        )}
        {parentsWithKids.map((parent) => {
          const children = sortedCategories.filter((c) => c.parent_id === parent.id);
          return (
            <optgroup key={parent.id} label={`${parent.name} Subcategories`}>
              {children.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                  {cat.is_active === false ? ' (Hidden)' : ''}
                </option>
              ))}
            </optgroup>
          );
        })}
        {orphans.length > 0 && (
          <optgroup label="Other Categories">
            {orphans.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
                {cat.is_active === false ? ' (Hidden)' : ''}
              </option>
            ))}
          </optgroup>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#1A3B2B] font-poppins pb-20">
      <SeoHead
        title="Admin Dashboard | DORASANI"
        description="DORASANI live store administration, inventory, catalog, and order management."
        canonicalPath="/admin"
        robots="noindex, nofollow"
      />
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-[#D8C7B5] px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0" title="DORASANI User Interface">
              <OptimizedPicture
                src="/assets/logo.png"
                alt="DORASANI"
                width={921}
                height={427}
                sizes="120px"
                loading="eager"
                pictureClassName="inline-block"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-golden text-lg sm:text-xl font-bold leading-tight">
                  Admin Dashboard
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#18482C] text-white text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{(user.role || 'admin').replace(/_/g, ' ')}</span>
                </span>
              </div>
              <p className="text-xs text-[#647268]">{user.email} • Live Store Management</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#285A3C] bg-[#D0E9C0]/60 text-xs font-bold text-[#113520] hover:bg-[#D0E9C0] transition-colors shadow-xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span>View User Interface</span>
            </Link>
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white text-xs font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Account</span>
            </Link>
            <button
              type="button"
              onClick={() => void loadData()}
              className="px-3.5 py-1.5 rounded-lg bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
            >
              Refresh Data
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Navigation Tabs */}
      <nav
        aria-label="Admin sections"
        className="bg-[#FAF5EE] border-b border-[#D8C7B5] px-4 sm:px-8 overflow-x-auto scrollbar-none"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory', icon: Layers },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            {
              id: 'users',
              label: 'Users & Inquiries',
              icon: Users,
              badge: (metrics.unreadMessages || 0) + (metrics.pendingReviews || 0),
            },
            { id: 'cms', label: 'Banners & CMS', icon: ImageIcon },
            { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${isActive
                  ? 'bg-[#285A3C] text-white shadow-xs'
                  : 'text-[#4F6355] hover:bg-[#D0E9C0]/30 hover:text-[#1A3B2B]'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive
                      ? 'bg-white text-[#285A3C]'
                      : 'bg-amber-100 text-amber-800'
                      }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3. Main Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#285A3C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#4F6355]">Loading live store data from Supabase...</p>
          </div>
        ) : (
          <>
            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">
                        Total Revenue
                      </span>
                      <DollarSign className="w-5 h-5 text-[#C29336]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      ₹{Number(metrics.totalSales || 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-[#285A3C] font-semibold flex items-center gap-1 flex-wrap">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>
                        {metrics.totalOrders} orders came
                        {metrics.cancelledOrders > 0 ? ` • ${metrics.cancelledOrders} cancelled` : ' • 0 cancelled'}
                      </span>
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">
                        Active Products
                      </span>
                      <Package className="w-5 h-5 text-[#285A3C]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      {metrics.activeProducts} / {metrics.totalProducts}
                    </div>
                    <p className="text-[11px] text-[#647268]">
                      {metrics.outOfStockProducts > 0 || metrics.lowStockProducts > 0
                        ? [
                            metrics.outOfStockProducts > 0
                              ? `${metrics.outOfStockProducts} out of stock`
                              : null,
                            metrics.lowStockProducts > 0
                              ? `${metrics.lowStockProducts} low stock (< ${LOW_STOCK_THRESHOLD})`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(' • ')
                        : `All items healthy (${LOW_STOCK_THRESHOLD}+ units)`}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">
                        Pending / In-Transit
                      </span>
                      <Truck className="w-5 h-5 text-[#C29336]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      {metrics.pendingOrders + metrics.processingOrders}
                    </div>
                    <p className="text-[11px] text-[#4F6355]">
                      {metrics.deliveredOrders} delivered •{' '}
                      <span className={metrics.cancelledOrders > 0 ? 'text-rose-700 font-semibold' : ''}>
                        {metrics.cancelledOrders} cancelled
                      </span>
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#D8C7B5] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-[#647268]">
                      <span className="text-xs uppercase tracking-wider font-semibold">
                        Customer Base
                      </span>
                      <Users className="w-5 h-5 text-[#285A3C]" />
                    </div>
                    <div className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
                      {metrics.totalCustomers}
                    </div>
                    <p className="text-[11px] text-[#285A3C] font-semibold">
                      Registered customer accounts
                      {metrics.staffCount > 0 ? ` (+${metrics.staffCount} staff)` : ''}
                    </p>
                  </div>
                </div>

                {/* Operational Engagement Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#FAF5EE] p-4 rounded-xl border border-[#D8C7B5] flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647268] block">
                        Guest Buyers
                      </span>
                      <span className="font-golden text-xl font-bold text-[#1A3B2B] block">
                        {metrics.guestOrderCustomers || 0}
                      </span>
                      <span className="text-[10px] text-[#647268] block truncate">
                        Unique checkout buyers
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('users');
                        setUsersSubTab('users');
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#285A3C] hover:bg-[#D0E9C0]/40"
                    >
                      Directory
                    </button>
                  </div>

                  <div className="bg-[#FAF5EE] p-4 rounded-xl border border-[#D8C7B5] flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647268] block">
                        Unread Inquiries
                      </span>
                      <span className="font-golden text-xl font-bold text-[#1A3B2B] block">
                        {metrics.unreadMessages || 0}
                      </span>
                      <span className="text-[10px] text-[#647268] block truncate">
                        Awaiting support reply
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('users');
                        setUsersSubTab('messages');
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#285A3C] hover:bg-[#D0E9C0]/40"
                    >
                      Inbox
                    </button>
                  </div>

                  <div className="bg-[#FAF5EE] p-4 rounded-xl border border-[#D8C7B5] flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647268] block">
                        Newsletter
                      </span>
                      <span className="font-golden text-xl font-bold text-[#1A3B2B] block">
                        {metrics.newsletterCount || 0}
                      </span>
                      <span className="text-[10px] text-[#647268] block truncate">
                        Active email subscribers
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('users');
                        setUsersSubTab('newsletter');
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#285A3C] hover:bg-[#D0E9C0]/40"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="bg-[#FAF5EE] p-4 rounded-xl border border-[#D8C7B5] flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#647268] block">
                        Customer Reviews
                      </span>
                      <span className="font-golden text-xl font-bold text-[#1A3B2B] block">
                        {metrics.publishedReviews || 0}
                      </span>
                      <span className="text-[10px] text-[#647268] block truncate">
                        {metrics.pendingReviews || 0} pending moderation
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('users');
                        setUsersSubTab('reviews');
                      }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#285A3C] hover:bg-[#D0E9C0]/40"
                    >
                      Moderate
                    </button>
                  </div>
                </div>

                {/* Weekly / Monthly / Yearly Orders Came vs Cancelled Visual Pulse */}
                <OverviewAnalyticsPulse
                  orders={orders}
                  onOpenFullReports={() => setActiveTab('reports')}
                  onJumpToOrders={(status) => {
                    setOrderStatusFilter(status || 'all');
                    setActiveTab('orders');
                  }}
                />

                {/* Recent Orders Overview */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">Recent Orders</h2>
                      <p className="text-xs text-[#647268]">
                        Real-time transactional orders from Supabase
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#285A3C] font-semibold hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-[#647268] py-8 text-center">
                      No orders have been placed yet.
                    </p>
                  ) : (
                    <div
                      tabIndex={0}
                      role="region"
                      aria-labelledby="overview-orders-caption"
                      className="admin-table-wrapper"
                    >
                      <table
                        className="admin-responsive-table w-full text-left text-xs"
                        style={
                          {
                            '--label-2': '"Customer"',
                            '--label-3': '"Amount"',
                            '--label-4': '"Status"',
                            '--label-5': '"Date"',
                          } as React.CSSProperties
                        }
                      >
                        <caption id="overview-orders-caption" className="sr-only">
                          Recent customer orders
                        </caption>
                        <thead>
                          <tr className="text-[#647268]">
                            <th scope="col" className="p-2.5 font-semibold">
                              Order #
                            </th>
                            <th scope="col" className="p-2.5 font-semibold">
                              Customer
                            </th>
                            <th scope="col" className="p-2.5 font-semibold">
                              Amount
                            </th>
                            <th scope="col" className="p-2.5 font-semibold">
                              Status
                            </th>
                            <th scope="col" className="p-2.5 font-semibold">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8DCCF]">
                          {orders.slice(0, 5).map((o: any) => (
                            <tr key={o.id} className="hover:bg-[#FAF5EE]/60">
                              <th scope="row" className="p-2.5 font-semibold text-[#1A3B2B]">
                                {o.order_number}
                              </th>
                              <td className="p-2.5">{o.customer_name}</td>
                              <td className="p-2.5 font-bold text-[#285A3C]">
                                ₹{Number(o.total_inr || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${o.order_status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.order_status === 'cancelled'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                  {o.order_status}
                                </span>
                              </td>
                              <td className="p-2.5 text-[#647268]">
                                {new Date(o.created_at).toLocaleDateString('en-GB')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9B92]" />
                      <input
                        type="search"
                        aria-label="Search products"
                        placeholder="Search by title, SKU, or fabric..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8C7B5] bg-white text-xs focus:outline-none focus:border-[#285A3C]"
                      />
                    </div>

                    <select
                      aria-label="Filter products by category"
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-[#D8C7B5] bg-white text-xs font-medium text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                    >
                      <option value="all">All Categories ({products.length})</option>
                      {renderGroupedCategoryOptions()}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={openCreateProductModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] overflow-hidden shadow-xs">
                  {filteredProducts.length === 0 ? (
                    <div className="p-10 text-center text-xs text-[#647268] space-y-2">
                      <p>No products match the current filter.</p>
                      <button
                        type="button"
                        onClick={openCreateProductModal}
                        className="inline-flex items-center gap-1.5 text-[#285A3C] font-semibold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add a product
                      </button>
                    </div>
                  ) : (
                    <div
                      tabIndex={0}
                      role="region"
                      aria-labelledby="products-table-caption"
                      className="admin-table-wrapper"
                    >
                      <table
                        className="admin-responsive-table w-full text-left text-xs"
                        style={
                          {
                            '--label-2': '"Category"',
                            '--label-3': '"Price / MRP"',
                            '--label-4': '"Stock"',
                            '--label-5': '"Status"',
                            '--label-6': '"Actions"',
                          } as React.CSSProperties
                        }
                      >
                        <caption id="products-table-caption" className="sr-only">
                          Store products catalog management table
                        </caption>
                        <thead className="text-[#647268]">
                          <tr>
                            <th scope="col" className="p-3 font-semibold">
                              Product
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Category
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Price / MRP
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Stock
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Status
                            </th>
                            <th scope="col" className="p-3 font-semibold text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8DCCF]">
                          {filteredProducts.map((p) => {
                            const rowStockMeta = getStockStatusMeta(p.stock_quantity, p.status);
                            return (
                              <tr key={p.id} className="hover:bg-[#FAF5EE]/50">
                                <th scope="row" className="p-3 font-normal text-left">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        p.product_media?.[0]?.url ||
                                        '/assets/products/kanjivaram_silk_saree.jpg'
                                      }
                                      alt={p.title}
                                      className="w-10 h-12 object-cover rounded-md border border-[#D8C7B5] shrink-0"
                                    />
                                    <div className="min-w-0">
                                      <p className="font-semibold text-[#1A3B2B]">{p.title}</p>
                                      <p className="text-[10px] text-[#647268] font-mono">
                                        {p.sku || p.slug}
                                      </p>
                                    </div>
                                  </div>
                                </th>
                                <td className="p-3">
                                  {p.categories?.name ||
                                    getProductTypeLabel(p.product_type, productTypesList)}
                                </td>
                                <td className="p-3 font-semibold">
                                  <div>
                                    <span>₹{Number(p.price_inr).toLocaleString('en-IN')}</span>
                                    {Number(p.mrp_inr) > Number(p.price_inr) && (
                                      <span className="text-[10px] text-[#8E9B92] line-through ml-1.5">
                                        ₹{Number(p.mrp_inr).toLocaleString('en-IN')}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  {rowStockMeta.isOutOfStock ? (
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-rose-700 block">
                                        0 units
                                      </span>
                                      <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                                        Out of Stock
                                      </span>
                                    </div>
                                  ) : rowStockMeta.isLowStock ? (
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-amber-800 block">
                                        {rowStockMeta.qty} units
                                      </span>
                                      <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                        {rowStockMeta.shortageCount} less than {LOW_STOCK_THRESHOLD}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-semibold text-[#1A3B2B]">
                                      {rowStockMeta.qty} units
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <select
                                    aria-label={`Status for ${p.title}`}
                                    value={p.status || 'active'}
                                    onChange={(e) =>
                                      void handleQuickProductStatus(p, e.target.value)
                                    }
                                    className={`text-[11px] font-semibold rounded-lg px-2 py-1 border focus:outline-none ${p.status === 'active'
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : p.status === 'out_of_stock'
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                      }`}
                                  >
                                    {PRODUCT_STATUSES.map((st) => (
                                      <option
                                        key={st.value}
                                        value={st.value}
                                        disabled={st.value === 'active' && rowStockMeta.qty <= 0}
                                      >
                                        {st.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                  <Link
                                    to={`/products/${p.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-md hover:bg-[#D0E9C0]/40 text-[#285A3C]"
                                    aria-label={`View ${p.title} on store`}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => void handleAdjustStock(p.id, 5, 'restock')}
                                    className="px-2 py-1 rounded bg-[#D0E9C0] text-[10px] font-semibold text-[#1A3B2B] hover:bg-[#BCD8AA]"
                                    title="Add 5 units of stock"
                                  >
                                    +5 Stock
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEditProductModal(p)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteProductTarget(p)}
                                    className="p-1.5 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                    title="Delete product"
                                    aria-label={`Delete ${p.title}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="relative flex-1 min-w-[260px] max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E9B92]" />
                    <input
                      type="search"
                      aria-label="Search orders"
                      placeholder="Search orders by #, customer, email, AWB, or Razorpay ID..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8C7B5] bg-white text-xs focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={syncingAllDelhivery}
                      onClick={() => void handleSyncAllDelhiveryScans()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#BCD8AA] bg-[#F3F8F1] text-xs font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/60 disabled:opacity-60 shadow-2xs"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 text-[#285A3C] ${
                          syncingAllDelhivery ? 'animate-spin' : ''
                        }`}
                      />
                      <span>
                        {syncingAllDelhivery ? 'Syncing Scans...' : 'Sync Delhivery Scans'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={openSchedulePickupModal}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Pickup</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'all' },
                      { id: 'in_progress', label: 'in progress' },
                      { id: 'pending', label: 'pending' },
                      { id: 'confirmed', label: 'confirmed' },
                      { id: 'processing', label: 'processing' },
                      { id: 'packed', label: 'packed' },
                      { id: 'shipped', label: 'shipped' },
                      { id: 'out_for_delivery', label: 'out for delivery' },
                      { id: 'delivered', label: 'delivered' },
                      { id: 'cancelled', label: 'cancelled' },
                      { id: 'returned_refunded', label: 'returned / refunded' },
                    ].map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        onClick={() => setOrderStatusFilter(status.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${orderStatusFilter === status.id
                          ? 'bg-[#285A3C] text-white'
                          : 'bg-white border border-[#D8C7B5] text-[#4F6355] hover:bg-[#FAF5EE]'
                          }`}
                      >
                        {status.label}
                      </button>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] overflow-hidden shadow-xs">
                  {filteredOrders.length === 0 ? (
                    <p className="p-10 text-center text-xs text-[#647268]">
                      No orders match the current filter.
                    </p>
                  ) : (
                    <div
                      tabIndex={0}
                      role="region"
                      aria-labelledby="orders-table-caption"
                      className="admin-table-wrapper"
                    >
                      <table
                        className="admin-responsive-table w-full text-left text-xs"
                        style={
                          {
                            '--label-2': '"Customer"',
                            '--label-3': '"Items"',
                            '--label-4': '"Total Amount"',
                            '--label-5': '"Payment"',
                            '--label-6': '"Order Status"',
                            '--label-7': '"Update / Dispatch"',
                          } as React.CSSProperties
                        }
                      >
                        <caption id="orders-table-caption" className="sr-only">
                          Customer orders management table
                        </caption>
                        <thead className="text-[#647268]">
                          <tr>
                            <th scope="col" className="p-3 font-semibold">
                              Order Number
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Customer
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Items
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Total Amount
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Payment
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Order Status
                            </th>
                            <th scope="col" className="p-3 font-semibold text-right">
                              Update / Dispatch
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8DCCF]">
                          {filteredOrders.map((o) => {
                            const paymentsList: any[] = Array.isArray(o.payments)
                              ? o.payments
                              : o.payments
                              ? [o.payments]
                              : [];
                            const primaryPayment =
                              paymentsList.find(
                                (p) => p?.status === 'paid' || p?.status === 'refunded'
                              ) ||
                              paymentsList[0] ||
                              null;
                            const activeShip = getActiveShipmentFromOrder(o);
                            const activeWaybill = activeShip?.tracking_number || o.tracking_id;
                            const activeCourier = activeShip?.courier_partner || o.courier_name;
                            const isDelhiveryOrder =
                              Boolean(activeShip) &&
                              (!activeShip.courier_partner ||
                                /delhivery/i.test(String(activeShip.courier_partner)))
                                ? true
                                : Boolean(
                                    activeWaybill &&
                                      /delhivery/i.test(String(activeCourier || ''))
                                  );
                            const canShipDelhivery =
                              !activeWaybill &&
                              !['cancelled', 'refunded', 'returned', 'delivered'].includes(
                                String(o.order_status || '').toLowerCase()
                              );

                            return (
                              <tr key={o.id} className="hover:bg-[#FAF5EE]/50">
                                <th scope="row" className="p-3 font-bold text-[#1A3B2B]">
                                  <div className="space-y-0.5">
                                    <span>{o.order_number}</span>
                                    {activeWaybill && (
                                      <span className="block text-[10px] font-mono font-normal text-[#4F6355]">
                                        {activeCourier || 'Delhivery'}: {activeWaybill}
                                      </span>
                                    )}
                                    {activeShip?.current_status && (
                                      <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F3F8F1] border border-[#C6DEC9] text-[#285A3C]">
                                        {activeShip.current_status}
                                        {activeShip.current_location
                                          ? ` • ${activeShip.current_location}`
                                          : ''}
                                      </span>
                                    )}
                                  </div>
                                </th>
                                <td className="p-3">
                                  <div>
                                    <p className="font-semibold text-[#1A3B2B]">{o.customer_name}</p>
                                    <p className="text-[10px] text-[#647268]">{o.customer_phone}</p>
                                  </div>
                                </td>
                                <td className="p-3">{o.order_items?.length || 1} item(s)</td>
                                <td className="p-3 font-bold text-[#285A3C]">
                                  ₹{Number(o.total_inr || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-semibold uppercase text-[11px] text-[#1A3B2B]">
                                        {o.payment_method}
                                      </span>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                          o.payment_status === 'paid'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : o.payment_status === 'failed'
                                            ? 'bg-rose-100 text-rose-800'
                                            : o.payment_status === 'refunded' ||
                                              o.payment_status === 'partially_refunded'
                                            ? 'bg-stone-100 text-stone-700'
                                            : o.payment_status === 'authorized'
                                            ? 'bg-sky-100 text-sky-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {String(o.payment_status || 'pending').replace(/_/g, ' ')}
                                      </span>
                                    </div>
                                    {primaryPayment?.provider_payment_id && (
                                      <span
                                        className="block text-[10px] font-mono text-[#647268] truncate max-w-[165px]"
                                        title={`Razorpay Payment ID: ${primaryPayment.provider_payment_id}`}
                                      >
                                        {primaryPayment.provider_payment_id}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${o.order_status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : o.order_status === 'cancelled'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                    }`}
                                >
                                  {o.order_status.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                  <select
                                    aria-label={`Order status for ${o.order_number}`}
                                    value={o.order_status}
                                    onChange={(e) =>
                                      void handleUpdateOrderStatus(o.id, e.target.value)
                                    }
                                    className="text-[11px] font-semibold border border-[#BCD8AA] bg-[#D0E9C0]/40 rounded-lg px-2 py-1 text-[#1A3B2B] focus:outline-none"
                                  >
                                    {ORDER_STATUSES.map((st) => (
                                      <option key={st.value} value={st.value}>
                                        {st.label}
                                      </option>
                                    ))}
                                  </select>
                                    {canShipDelhivery && (
                                      <button
                                        type="button"
                                        onClick={() => openDelhiveryManifestModal(o)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#285A3C] text-white text-[11px] font-semibold hover:bg-[#1E432D]"
                                        title="Create AWB and manifest order with Delhivery One"
                                      >
                                        <Box className="w-3 h-3" />
                                        <span>Ship Delhivery</span>
                                      </button>
                                    )}
                                    {isDelhiveryOrder && activeWaybill && (
                                      <>
                                        <button
                                          type="button"
                                          disabled={loadingLabelOrderId === o.id}
                                          onClick={() => void handleOpenDelhiveryLabel(o)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#BCD8AA] bg-[#F3F8F1] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/60 disabled:opacity-60"
                                          title="View & print Delhivery shipping label / packing slip"
                                        >
                                          {loadingLabelOrderId === o.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin text-[#285A3C]" />
                                          ) : (
                                            <Printer className="w-3 h-3 text-[#285A3C]" />
                                          )}
                                          <span>Label</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={syncingOrderId === o.id}
                                          onClick={() => void handleSyncSingleOrderTracking(o)}
                                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] disabled:opacity-60"
                                          title={`Sync live Delhivery scans for AWB ${activeWaybill}`}
                                        >
                                          <RefreshCw
                                            className={`w-3 h-3 text-[#285A3C] ${
                                              syncingOrderId === o.id ? 'animate-spin' : ''
                                            }`}
                                          />
                                          <span>Sync</span>
                                        </button>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setOrderDetailsTarget(o)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                                      title="View full order items, address, and Razorpay IDs"
                                    >
                                      <Eye className="w-3 h-3 text-[#285A3C]" />
                                      <span>Details</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditOrderModal(o)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                                      title="Edit courier & tracking details"
                                    >
                                      <Truck className="w-3 h-3 text-[#285A3C]" />
                                      <span>Dispatch</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteOrderTarget(o)}
                                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                      title="Delete order"
                                      aria-label={`Delete order ${o.order_number}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                        Live Stock Ledger
                      </h2>
                      <p className="text-xs text-[#647268]">
                        Real-time inventory levels with exact stock overrides and movement logging
                      </p>
                    </div>
                    <div className="relative min-w-[240px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9B92]" />
                      <input
                        type="search"
                        aria-label="Filter inventory products"
                        placeholder="Search stock by product or SKU..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] text-xs focus:outline-none focus:border-[#285A3C]"
                      />
                    </div>
                  </div>

                  <div
                    tabIndex={0}
                    role="region"
                    aria-labelledby="inventory-stock-caption"
                    className="admin-table-wrapper"
                  >
                    <table
                      className="admin-responsive-table w-full text-left text-xs"
                      style={
                        {
                          '--label-2': '"SKU"',
                          '--label-3': '"Category"',
                          '--label-4': '"Current Stock"',
                          '--label-5': '"Health"',
                          '--label-6': '"Adjust Stock"',
                        } as React.CSSProperties
                      }
                    >
                      <caption id="inventory-stock-caption" className="sr-only">
                        Live stock levels per product
                      </caption>
                      <thead className="text-[#647268]">
                        <tr>
                          <th scope="col" className="p-3 font-semibold">
                            Product Title
                          </th>
                          <th scope="col" className="p-3 font-semibold">
                            SKU
                          </th>
                          <th scope="col" className="p-3 font-semibold">
                            Category
                          </th>
                          <th scope="col" className="p-3 font-semibold">
                            Current Stock
                          </th>
                          <th scope="col" className="p-3 font-semibold">
                            Health
                          </th>
                          <th scope="col" className="p-3 font-semibold text-right">
                            Adjust Stock
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8DCCF]">
                        {filteredInventoryProducts.map((p) => {
                          const invStockMeta = getStockStatusMeta(p.stock_quantity, p.status);
                          return (
                            <tr key={p.id} className="hover:bg-[#FAF5EE]/50">
                              <th scope="row" className="p-3 font-semibold text-[#1A3B2B]">
                                {p.title}
                              </th>
                              <td className="p-3 text-[#647268] font-mono">{p.sku || p.slug}</td>
                              <td className="p-3">
                                {p.categories?.name ||
                                  getProductTypeLabel(p.product_type, productTypesList)}
                              </td>
                              <td className="p-3 font-bold text-base text-[#1A3B2B]">
                                {invStockMeta.qty}
                              </td>
                              <td className="p-3">
                                {invStockMeta.isOutOfStock ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                                    Out of Stock
                                  </span>
                                ) : invStockMeta.isLowStock ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                    Low Stock ({invStockMeta.shortageCount} less than {LOW_STOCK_THRESHOLD})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                    Healthy
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                  <button
                                    type="button"
                                    disabled={invStockMeta.qty <= 0}
                                    onClick={() =>
                                      void handleAdjustStock(p.id, -1, 'manual_adjustment')
                                    }
                                    className="w-7 h-7 rounded border border-[#D8C7B5] bg-white font-bold text-xs hover:bg-[#FAF5EE] disabled:opacity-40"
                                    title="Decrease stock by 1"
                                  >
                                    -1
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleAdjustStock(p.id, 5, 'restock')}
                                    className="px-2.5 py-1 rounded bg-[#D0E9C0] text-xs font-semibold text-[#1A3B2B] hover:bg-[#BCD8AA]"
                                  >
                                    +5 Units
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleAdjustStock(p.id, 20, 'restock')}
                                    className="px-2.5 py-1 rounded bg-[#285A3C] text-xs font-semibold text-white hover:bg-[#1E432D]"
                                  >
                                    +20 Units
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openStockModal(p)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#D8C7B5] bg-white text-xs font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                                    title="Set exact stock count or logged adjustment"
                                  >
                                    <SlidersHorizontal className="w-3 h-3 text-[#285A3C]" />
                                    <span>Edit Stock</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inventory Movement Audit History */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-[#285A3C]" />
                      <div>
                        <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">
                          Inventory Movement History
                        </h3>
                        <p className="text-xs text-[#647268]">
                          Latest 100 audited stock changes across orders and admin updates
                        </p>
                      </div>
                    </div>
                  </div>

                  {inventoryLedger.length === 0 ? (
                    <p className="py-8 text-center text-xs text-[#647268]">
                      No stock movement events recorded yet. Adjust stock above to create an audit entry.
                    </p>
                  ) : (
                    <div
                      tabIndex={0}
                      role="region"
                      aria-labelledby="inventory-ledger-caption"
                      className="admin-table-wrapper"
                    >
                      <table
                        className="admin-responsive-table w-full text-left text-xs"
                        style={
                          {
                            '--label-2': '"SKU"',
                            '--label-3': '"Change"',
                            '--label-4': '"Prev → New"',
                            '--label-5': '"Reason"',
                            '--label-6': '"Date"',
                          } as React.CSSProperties
                        }
                      >
                        <caption id="inventory-ledger-caption" className="sr-only">
                          Inventory stock movement audit history
                        </caption>
                        <thead className="text-[#647268]">
                          <tr>
                            <th scope="col" className="p-3 font-semibold">
                              Product
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              SKU
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Change
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Prev → New
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Reason
                            </th>
                            <th scope="col" className="p-3 font-semibold">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8DCCF]">
                          {inventoryLedger.map((entry: any) => {
                            const delta = Number(entry.quantity_changed ?? 0);
                            return (
                              <tr key={entry.id} className="hover:bg-[#FAF5EE]/50">
                                <th scope="row" className="p-3 font-semibold text-[#1A3B2B]">
                                  {entry.products?.title || 'Product'}
                                </th>
                                <td className="p-3 font-mono text-[#647268]">
                                  {entry.products?.sku || '—'}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${delta > 0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : delta < 0
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-stone-100 text-stone-700'
                                      }`}
                                  >
                                    {delta > 0 ? `+${delta}` : delta}
                                  </span>
                                </td>
                                <td className="p-3 font-mono">
                                  {entry.previous_quantity} → {entry.new_quantity}
                                </td>
                                <td className="p-3 capitalize">
                                  {String(entry.reason || '').replace(/_/g, ' ')}
                                </td>
                                <td className="p-3 text-[#647268]">
                                  {new Date(entry.created_at).toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CATEGORIES, EXPLORE STRIP & DYNAMIC FILTERS */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                {/* Sub-navigation bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#D8C7B5] shadow-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoriesSubTab('items')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        categoriesSubTab === 'items'
                          ? 'bg-[#285A3C] text-white'
                          : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Categories & Explore Items ({categories.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategoriesSubTab('builder')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        categoriesSubTab === 'builder'
                          ? 'bg-[#285A3C] text-white'
                          : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Explore Bar & Filters Builder</span>
                    </button>
                  </div>

                  {categoriesSubTab === 'items' ? (
                    <button
                      type="button"
                      onClick={() =>
                        openCreateCategoryModal(
                          selectedFilterParent ? selectedFilterParent.id : ''
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {selectedFilterParent
                          ? `Add Explore Item to ${selectedFilterParent.name}`
                          : 'Add Category'}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={savingExploreAndFilters}
                      onClick={() => void handleSaveExploreAndFilters()}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] disabled:opacity-60 transition-colors shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {savingExploreAndFilters ? 'Saving Config...' : 'Save Explore & Filters Config'}
                      </span>
                    </button>
                  )}
                </div>

                {/* SUB-TAB 1: CATEGORIES & EXPLORE ITEMS */}
                {categoriesSubTab === 'items' && (
                  <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                          Categories & Explore Strip Items
                        </h2>
                        <p className="text-xs text-[#647268]">
                          Rename collections, upload circular Explore photos, set keyword rules, toggle visibility, and reorder pills live across navbar & collection pages
                        </p>
                      </div>
                    </div>

                    {/* Parent Collection Filter Strip */}
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E8DCCF]">
                      <button
                        type="button"
                        onClick={() => setCategoryParentFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          categoryParentFilter === 'all'
                            ? 'bg-[#285A3C] text-white'
                            : 'bg-[#FAF5EE] border border-[#D8C7B5] text-[#4F6355] hover:border-[#285A3C]'
                        }`}
                      >
                        All Categories ({categories.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategoryParentFilter('top')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          categoryParentFilter === 'top'
                            ? 'bg-[#285A3C] text-white'
                            : 'bg-[#FAF5EE] border border-[#D8C7B5] text-[#4F6355] hover:border-[#285A3C]'
                        }`}
                      >
                        Top-Level Collections ({topLevelCategories.length})
                      </button>

                      {parentFilterCategories.map((p) => {
                        const childCount = categories.filter((x) => x.parent_id === p.id).length;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setCategoryParentFilter(p.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              categoryParentFilter === p.id
                                ? 'bg-[#285A3C] text-white'
                                : 'bg-[#FAF5EE] border border-[#D8C7B5] text-[#4F6355] hover:border-[#285A3C]'
                            }`}
                          >
                            {p.name} Explore ({childCount})
                          </button>
                        );
                      })}
                    </div>

                    {filteredCategoriesView.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-[#D8C7B5] rounded-2xl space-y-3">
                        <Layers className="w-8 h-8 text-[#8E9B92] mx-auto" />
                        <p className="text-xs text-[#647268]">
                          {selectedFilterParent
                            ? `No Explore subcategory items created inside "${selectedFilterParent.name}" yet.`
                            : 'No categories found for this filter.'}
                        </p>
                        {selectedFilterParent && (
                          <button
                            type="button"
                            onClick={() => openCreateCategoryModal(selectedFilterParent.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Explore Item to {selectedFilterParent.name}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCategoriesView.map((c) => {
                          const parentCat = c.parent_id
                            ? categories.find((p) => p.id === c.parent_id)
                            : null;
                          const sameParentSiblings = categories
                            .filter((x) => (x.parent_id || '') === (c.parent_id || ''))
                            .sort(
                              (a, b) =>
                                Number(a.display_order ?? 999) - Number(b.display_order ?? 999) ||
                                String(a.name || '').localeCompare(String(b.name || ''))
                            );
                          const siblingIndex = sameParentSiblings.findIndex((s) => s.id === c.id);
                          const keywordList = String(c.filter_keywords || '')
                            .split(',')
                            .map((k) => k.trim())
                            .filter(Boolean);

                          return (
                            <div
                              key={c.id}
                              className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] flex flex-col justify-between gap-3"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                      {c.image_url ? (
                                        <img
                                          src={c.image_url}
                                          alt={c.name}
                                          className="w-12 h-12 rounded-full object-cover border-2 border-[#D8C7B5] bg-white"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#D8C7B5] bg-white flex items-center justify-center text-[10px] font-bold text-[#8E9B92]">
                                          No Pic
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="font-golden font-bold text-sm text-[#1A3B2B] truncate">
                                        {c.name}
                                      </h3>
                                      <span
                                        className={`inline-block text-[10px] font-semibold ${
                                          parentCat ? 'text-[#285A3C]' : 'text-[#736455]'
                                        }`}
                                      >
                                        {parentCat
                                          ? `Explore item in ${parentCat.name}`
                                          : 'Top-Level Collection'}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => void handleToggleCategoryActive(c)}
                                    title="Click to toggle storefront visibility"
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                                      c.is_active
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                    }`}
                                  >
                                    {c.is_active ? (
                                      <>
                                        <Eye className="w-2.5 h-2.5" />
                                        <span>Active</span>
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-2.5 h-2.5" />
                                        <span>Hidden</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <p className="text-[11px] text-[#647268] line-clamp-2">
                                  {c.description || 'Curated collection category'}
                                </p>

                                {keywordList.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {keywordList.slice(0, 4).map((kw, idx) => (
                                      <span
                                        key={`${c.id}-kw-${idx}`}
                                        className="px-1.5 py-0.5 rounded bg-white border border-[#E8DCCF] text-[10px] text-[#4F6355]"
                                      >
                                        {kw}
                                      </span>
                                    ))}
                                    {keywordList.length > 4 && (
                                      <span className="text-[10px] text-[#8E9B92]">
                                        +{keywordList.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-[10px] text-[#8E9B92]">
                                  <span className="font-mono truncate">/{c.slug}</span>
                                  <span className="shrink-0">Order: #{c.display_order}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8DCCF]">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={siblingIndex <= 0}
                                    onClick={() =>
                                      void handleMoveCategoryOrder(c, 'up', sameParentSiblings)
                                    }
                                    aria-label={`Move ${c.name} earlier`}
                                    title="Move earlier"
                                    className="p-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[#1A3B2B] hover:bg-[#D0E9C0]/30 disabled:opacity-35"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      siblingIndex === -1 ||
                                      siblingIndex >= sameParentSiblings.length - 1
                                    }
                                    onClick={() =>
                                      void handleMoveCategoryOrder(c, 'down', sameParentSiblings)
                                    }
                                    aria-label={`Move ${c.name} later`}
                                    title="Move later"
                                    className="p-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[#1A3B2B] hover:bg-[#D0E9C0]/30 disabled:opacity-35"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditCategoryModal(c)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/30"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteCategoryTarget(c)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Product Types Manager (Live Sync with Add/Edit Product & Storefront Filters) */}
                    <div className="pt-6 border-t border-[#E8DCCF] space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-golden text-base font-bold text-[#1A3B2B]">
                            Product Types ({productTypesList.length})
                          </h3>
                          <p className="text-xs text-[#647268]">
                            Create or rename product types (e.g. Dupatta, Half Saree, Blouse). Updates the Product form dropdown and storefront Product Type filter immediately.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            aria-label="New Product Type Name"
                            value={newTypeLabelInput}
                            onChange={(e) => setNewTypeLabelInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void handleAddProductTypeInTab();
                              }
                            }}
                            placeholder="e.g. Dupatta / Half Saree"
                            className="px-3 py-2 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] text-xs text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                          />
                          <button
                            type="button"
                            disabled={savingProductTypes}
                            onClick={() => void handleAddProductTypeInTab()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Type</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {productTypesList.map((pt) => {
                          const prodCount = products.filter((p) => p.product_type === pt.value).length;
                          const isEditing = editingTypeValue === pt.value;
                          return (
                            <div
                              key={pt.value}
                              className="p-3 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0 flex-1 space-y-0.5">
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={editingTypeLabel}
                                      onChange={(e) => setEditingTypeLabel(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          void handleSaveRenamedProductType(pt.value);
                                        } else if (e.key === 'Escape') {
                                          setEditingTypeValue(null);
                                        }
                                      }}
                                      aria-label={`Rename ${pt.label}`}
                                      className="flex-1 min-w-0 px-2 py-1 rounded border border-[#285A3C] bg-white text-xs focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      disabled={savingProductTypes}
                                      onClick={() => void handleSaveRenamedProductType(pt.value)}
                                      className="px-2 py-1 rounded bg-[#285A3C] text-white text-[10px] font-semibold"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTypeValue(null)}
                                      className="px-2 py-1 rounded border border-[#D8C7B5] bg-white text-[10px] font-semibold"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="font-bold text-[#1A3B2B] truncate">{pt.label}</p>
                                    <p className="text-[10px] text-[#647268] font-mono truncate">
                                      key: {pt.value} • {prodCount}{' '}
                                      {prodCount === 1 ? 'product' : 'products'}
                                    </p>
                                  </>
                                )}
                              </div>

                              {!isEditing && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTypeValue(pt.value);
                                      setEditingTypeLabel(pt.label);
                                    }}
                                    aria-label={`Rename ${pt.label}`}
                                    className="p-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[#1A3B2B] hover:bg-[#D0E9C0]/30"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={savingProductTypes || prodCount > 0}
                                    onClick={() => void handleDeleteProductType(pt)}
                                    title={
                                      prodCount > 0
                                        ? `Used by ${prodCount} products`
                                        : 'Delete Product Type'
                                    }
                                    aria-label={`Delete ${pt.label}`}
                                    className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: EXPLORE BAR & DYNAMIC FILTERS BUILDER */}
                {categoriesSubTab === 'builder' && (
                  <div className="space-y-6">
                    {/* Scope Selector Card */}
                    <div className="bg-white rounded-2xl border border-[#D8C7B5] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                          Explore Categories & Filters Configuration Scope
                        </h2>
                        <p className="text-xs text-[#647268]">
                          Customize the global defaults for every collection page, or pick a specific collection (like Sarees or Lehengas) to override its Explore bar and Filters sidebar independently
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          aria-label="Select configuration scope"
                          value={configScopeSlug}
                          onChange={(e) => setConfigScopeSlug(e.target.value)}
                          className="p-2.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] text-xs font-semibold text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                        >
                          {scopeOptions.map((opt) => (
                            <option key={opt.slug} value={opt.slug}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {hasScopeOverride && (
                          <button
                            type="button"
                            onClick={() => handleResetScopeOverrides(configScopeSlug)}
                            className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Reset Override
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Panel A: Explore Categories Strip Config */}
                    <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCCF] pb-3">
                        <div>
                          <h3 className="font-golden text-base font-bold text-[#1A3B2B]">
                            1. &quot;Explore Categories&quot; Bar Settings
                          </h3>
                          <p className="text-xs text-[#647268]">
                            {isGlobalBuilderScope
                              ? 'Controls the circular Explore strip title, visibility, and "All" reset pill across collection pages'
                              : `Override how the Explore strip appears specifically on "/${configScopeSlug}"`}
                          </p>
                        </div>

                        {!isGlobalBuilderScope && (
                          <span className="px-2.5 py-1 rounded-full bg-[#D0E9C0]/60 text-[#1A3B2B] text-[10px] font-bold uppercase tracking-wider">
                            Collection Override: /{configScopeSlug}
                          </span>
                        )}
                      </div>

                      {isGlobalBuilderScope ? (
                        <div className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label
                                htmlFor="exp-global-title"
                                className="font-semibold text-[#1A3B2B] block"
                              >
                                Section Title Heading
                              </label>
                              <input
                                id="exp-global-title"
                                type="text"
                                value={exploreConfigForm.title}
                                onChange={(e) =>
                                  setExploreConfigForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder="Explore Categories"
                                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label
                                htmlFor="exp-all-label"
                                className="font-semibold text-[#1A3B2B] block"
                              >
                                &quot;All&quot; Reset Pill Label
                              </label>
                              <input
                                id="exp-all-label"
                                type="text"
                                value={exploreConfigForm.allPillLabel}
                                onChange={(e) =>
                                  setExploreConfigForm((prev) => ({
                                    ...prev,
                                    allPillLabel: e.target.value,
                                  }))
                                }
                                placeholder="All"
                                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>

                            <div className="flex items-end pb-1">
                              <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#D8C7B5] bg-[#FAF5EE] w-full cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={exploreConfigForm.showAllPill}
                                  onChange={(e) =>
                                    setExploreConfigForm((prev) => ({
                                      ...prev,
                                      showAllPill: e.target.checked,
                                    }))
                                  }
                                  className="accent-[#285A3C]"
                                />
                                <span className="font-semibold text-[#1A3B2B]">
                                  Show &quot;All&quot; Reset Pill
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {[
                              { key: 'enabled', label: 'Master Enable Explore Strip' },
                              { key: 'showOnShopAll', label: 'Show on Shop All' },
                              { key: 'showOnCollections', label: 'Show on Collections' },
                              { key: 'showOnNewArrivals', label: 'Show on New Arrivals' },
                              { key: 'showOnBestsellers', label: 'Show on Bestsellers' },
                            ].map((toggle) => (
                              <label
                                key={toggle.key}
                                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={Boolean((exploreConfigForm as any)[toggle.key])}
                                  onChange={(e) =>
                                    setExploreConfigForm((prev) => ({
                                      ...prev,
                                      [toggle.key]: e.target.checked,
                                    }))
                                  }
                                  className="accent-[#285A3C]"
                                />
                                <span className="font-medium text-[#1A3B2B]">{toggle.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          <div className="space-y-1">
                            <label className="font-semibold text-[#1A3B2B] block">
                              Explore Bar Visibility
                            </label>
                            <select
                              value={
                                activeScopeExploreOv.enabled === undefined
                                  ? 'inherit'
                                  : activeScopeExploreOv.enabled
                                    ? 'show'
                                    : 'hide'
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                updateExploreScopeOverride(configScopeSlug, {
                                  enabled:
                                    val === 'inherit' ? undefined : val === 'show',
                                });
                              }}
                              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                            >
                              <option value="inherit">Inherit Global Setting</option>
                              <option value="show">Force Show</option>
                              <option value="hide">Force Hide</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-[#1A3B2B] block">
                              Section Heading Override
                            </label>
                            <input
                              type="text"
                              value={activeScopeExploreOv.title || ''}
                              onChange={(e) =>
                                updateExploreScopeOverride(configScopeSlug, {
                                  title: e.target.value,
                                })
                              }
                              placeholder={`Inherit: ${exploreConfigForm.title}`}
                              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-[#1A3B2B] block">
                              &quot;All&quot; Reset Pill Visibility
                            </label>
                            <select
                              value={
                                activeScopeExploreOv.showAllPill === undefined
                                  ? 'inherit'
                                  : activeScopeExploreOv.showAllPill
                                    ? 'show'
                                    : 'hide'
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                updateExploreScopeOverride(configScopeSlug, {
                                  showAllPill:
                                    val === 'inherit' ? undefined : val === 'show',
                                });
                              }}
                              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                            >
                              <option value="inherit">Inherit Global Setting</option>
                              <option value="show">Show &quot;All&quot; Pill</option>
                              <option value="hide">Hide &quot;All&quot; Pill</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="font-semibold text-[#1A3B2B] block">
                              &quot;All&quot; Pill Label Override
                            </label>
                            <input
                              type="text"
                              value={activeScopeExploreOv.allPillLabel || ''}
                              onChange={(e) =>
                                updateExploreScopeOverride(configScopeSlug, {
                                  allPillLabel: e.target.value,
                                })
                              }
                              placeholder={`Inherit: ${exploreConfigForm.allPillLabel}`}
                              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Panel B: Dynamic Filters Sidebar Builder */}
                    <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DCCF] pb-3">
                        <div>
                          <h3 className="font-golden text-base font-bold text-[#1A3B2B]">
                            2. Collection &quot;Filters&quot; Sidebar Builder
                          </h3>
                          <p className="text-xs text-[#647268]">
                            {isGlobalBuilderScope
                              ? 'Rename sidebar & filter headings, reorder groups, curate custom options or auto-detect from products, and create custom tag filter groups'
                              : `Override sidebar visibility, headings, and per-group options specifically on "/${configScopeSlug}"`}
                          </p>
                        </div>
                      </div>

                      {isGlobalBuilderScope ? (
                        <div className="space-y-5 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label
                                htmlFor="flt-sidebar-title"
                                className="font-semibold text-[#1A3B2B] block"
                              >
                                Sidebar Heading Title
                              </label>
                              <input
                                id="flt-sidebar-title"
                                type="text"
                                value={filtersConfigForm.sidebarTitle}
                                onChange={(e) =>
                                  setFiltersConfigForm((prev) => ({
                                    ...prev,
                                    sidebarTitle: e.target.value,
                                  }))
                                }
                                placeholder="Filters"
                                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>

                            <div className="flex items-end">
                              <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] w-full cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filtersConfigForm.enabled}
                                  onChange={(e) =>
                                    setFiltersConfigForm((prev) => ({
                                      ...prev,
                                      enabled: e.target.checked,
                                    }))
                                  }
                                  className="accent-[#285A3C]"
                                />
                                <span className="font-semibold text-[#1A3B2B]">
                                  Enable Filters Sidebar
                                </span>
                              </label>
                            </div>

                            <div className="flex items-end">
                              <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] w-full cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filtersConfigForm.showClearAll}
                                  onChange={(e) =>
                                    setFiltersConfigForm((prev) => ({
                                      ...prev,
                                      showClearAll: e.target.checked,
                                    }))
                                  }
                                  className="accent-[#285A3C]"
                                />
                                <span className="font-semibold text-[#1A3B2B]">
                                  Show &quot;Clear All&quot; Link
                                </span>
                              </label>
                            </div>

                            <div className="flex items-end">
                              <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] w-full cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filtersConfigForm.showSortDropdown}
                                  onChange={(e) =>
                                    setFiltersConfigForm((prev) => ({
                                      ...prev,
                                      showSortDropdown: e.target.checked,
                                    }))
                                  }
                                  className="accent-[#285A3C]"
                                />
                                <span className="font-semibold text-[#1A3B2B]">
                                  Show &quot;Sort By&quot; Dropdown
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Ordered Global Filter Groups */}
                          <div className="space-y-3">
                            {sortedFilterGroups.map((group, idx) => {
                              const detectedValues = detectCatalogValuesForFilterGroup(group);
                              return (
                                <div
                                  key={group.id}
                                  className={`p-4 rounded-xl border space-y-3 transition-colors ${
                                    group.enabled
                                      ? 'border-[#BCD8AA] bg-[#FAF5EE]'
                                      : 'border-[#E8DCCF] bg-[#FAF5EE]/50 opacity-85'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => moveFilterGroupOrder(group.id, 'up')}
                                          aria-label={`Move ${group.label} filter up`}
                                          className="p-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[#1A3B2B] hover:bg-[#D0E9C0]/30 disabled:opacity-35"
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === sortedFilterGroups.length - 1}
                                          onClick={() => moveFilterGroupOrder(group.id, 'down')}
                                          aria-label={`Move ${group.label} filter down`}
                                          className="p-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[#1A3B2B] hover:bg-[#D0E9C0]/30 disabled:opacity-35"
                                        >
                                          <ArrowDown className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <label className="inline-flex items-center gap-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={group.enabled}
                                          onChange={(e) =>
                                            updateFilterGroup(group.id, {
                                              enabled: e.target.checked,
                                            })
                                          }
                                          className="accent-[#285A3C]"
                                        />
                                        <span className="font-bold text-[#1A3B2B]">
                                          {group.enabled ? 'Visible' : 'Hidden'}
                                        </span>
                                      </label>

                                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#D8C7B5] text-[10px] font-mono uppercase text-[#647268]">
                                        {group.type}
                                      </span>
                                    </div>

                                    {group.type === 'tag' && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCustomTagFilterGroup(group.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Delete Group</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                      <label className="font-semibold text-[#1A3B2B] block">
                                        Filter Group Label
                                      </label>
                                      <input
                                        type="text"
                                        value={group.label}
                                        onChange={(e) =>
                                          updateFilterGroup(group.id, { label: e.target.value })
                                        }
                                        className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                      />
                                    </div>

                                    {group.type === 'price_range' ? (
                                      <>
                                        <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                                          <div className="space-y-1">
                                            <label className="font-semibold text-[#1A3B2B] block">
                                              Min Price (₹)
                                            </label>
                                            <input
                                              type="number"
                                              min={0}
                                              value={group.minPrice ?? 500}
                                              onChange={(e) =>
                                                updateFilterGroup(group.id, {
                                                  minPrice: Math.max(0, Number(e.target.value)),
                                                })
                                              }
                                              className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="font-semibold text-[#1A3B2B] block">
                                              Max Cap (₹, 0 = Auto)
                                            </label>
                                            <input
                                              type="number"
                                              min={0}
                                              value={group.maxPrice ?? 0}
                                              onChange={(e) =>
                                                updateFilterGroup(group.id, {
                                                  maxPrice: Math.max(0, Number(e.target.value)),
                                                })
                                              }
                                              className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="font-semibold text-[#1A3B2B] block">
                                              Slider Step (₹)
                                            </label>
                                            <input
                                              type="number"
                                              min={50}
                                              step={50}
                                              value={group.step ?? 500}
                                              onChange={(e) =>
                                                updateFilterGroup(group.id, {
                                                  step: Math.max(50, Number(e.target.value)),
                                                })
                                              }
                                              className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                            />
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="space-y-1">
                                          <label className="font-semibold text-[#1A3B2B] block">
                                            Options Source Mode
                                          </label>
                                          <select
                                            value={group.optionSource}
                                            onChange={(e) =>
                                              updateFilterGroup(group.id, {
                                                optionSource: e.target.value as 'auto' | 'custom',
                                              })
                                            }
                                            className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                          >
                                            <option value="auto">Auto-detect from products</option>
                                            <option value="custom">Curated Custom List</option>
                                          </select>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="font-semibold text-[#1A3B2B] block">
                                            Hidden / Excluded Options (CSV)
                                          </label>
                                          <CommaListInput
                                            values={group.hiddenOptions}
                                            onChange={(nextHidden) =>
                                              updateFilterGroup(group.id, {
                                                hiddenOptions: nextHidden,
                                              })
                                            }
                                            placeholder="e.g. Sample Option"
                                            className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {group.type !== 'price_range' && group.optionSource === 'custom' && (
                                    <div className="space-y-1.5 pt-1">
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <label className="font-semibold text-[#1A3B2B]">
                                          Curated Filter Checkboxes (comma-separated)
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const merged = Array.from(
                                              new Set([...group.customOptions, ...detectedValues])
                                            );
                                            updateFilterGroup(group.id, { customOptions: merged });
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-white border border-[#BCD8AA] text-[11px] font-semibold text-[#285A3C] hover:bg-[#D0E9C0]/40"
                                        >
                                          + Import Values from Catalog ({detectedValues.length})
                                        </button>
                                      </div>
                                      <CommaListInput
                                        values={group.customOptions}
                                        onChange={(nextOpts) =>
                                          updateFilterGroup(group.id, { customOptions: nextOpts })
                                        }
                                        placeholder="Pure Mulberry Silk, Organza, Chanderi..."
                                        className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                      />
                                    </div>
                                  )}

                                  {group.type !== 'price_range' && detectedValues.length > 0 && (
                                    <p className="text-[11px] text-[#647268]">
                                      Live catalog values:{' '}
                                      <span className="text-[#1A3B2B] font-medium">
                                        {detectedValues.slice(0, 8).join(', ')}
                                        {detectedValues.length > 8
                                          ? ` (+${detectedValues.length - 8} more)`
                                          : ''}
                                      </span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Custom Tag Filter Group */}
                          <div className="p-4 rounded-xl border border-dashed border-[#BCD8AA] bg-[#D0E9C0]/20 flex flex-wrap items-end gap-3">
                            <div className="flex-1 min-w-[220px] space-y-1">
                              <label
                                htmlFor="new-custom-filter-label"
                                className="font-semibold text-[#1A3B2B] block"
                              >
                                Create New Custom Tag / Attribute Filter Group
                              </label>
                              <input
                                id="new-custom-filter-label"
                                type="text"
                                value={customTagLabelInput}
                                onChange={(e) => setCustomTagLabelInput(e.target.value)}
                                placeholder="e.g. Zari Finish, Collection Tag, Border Style"
                                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddCustomTagFilterGroup}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Custom Filter Group</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-semibold text-[#1A3B2B] block">
                                Sidebar Visibility on /{configScopeSlug}
                              </label>
                              <select
                                value={
                                  activeScopeFilterOv.enabled === undefined
                                    ? 'inherit'
                                    : activeScopeFilterOv.enabled
                                      ? 'show'
                                      : 'hide'
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateFilterScopeOverride(configScopeSlug, {
                                    enabled: val === 'inherit' ? undefined : val === 'show',
                                  });
                                }}
                                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              >
                                <option value="inherit">Inherit Global Setting</option>
                                <option value="show">Force Show Sidebar</option>
                                <option value="hide">Hide Filters Sidebar</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-semibold text-[#1A3B2B] block">
                                Sidebar Heading Override
                              </label>
                              <input
                                type="text"
                                value={activeScopeFilterOv.sidebarTitle || ''}
                                onChange={(e) =>
                                  updateFilterScopeOverride(configScopeSlug, {
                                    sidebarTitle: e.target.value,
                                  })
                                }
                                placeholder={`Inherit: ${filtersConfigForm.sidebarTitle}`}
                                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            {sortedFilterGroups.map((group) => {
                              const gOv = activeScopeFilterOv.groupOverrides?.[group.id] || {};
                              return (
                                <div
                                  key={`${configScopeSlug}-${group.id}`}
                                  className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <strong className="text-[#1A3B2B]">{group.label}</strong>
                                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#D8C7B5] text-[10px] font-mono uppercase text-[#647268]">
                                        {group.type}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-[#647268]">
                                      Global default: {group.enabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                      <label className="font-semibold text-[#1A3B2B] block">
                                        Group Visibility
                                      </label>
                                      <select
                                        value={
                                          gOv.enabled === undefined
                                            ? 'inherit'
                                            : gOv.enabled
                                              ? 'show'
                                              : 'hide'
                                        }
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateFilterGroupOverride(configScopeSlug, group.id, {
                                            enabled:
                                              val === 'inherit' ? undefined : val === 'show',
                                          });
                                        }}
                                        className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                      >
                                        <option value="inherit">
                                          Inherit Global ({group.enabled ? 'On' : 'Off'})
                                        </option>
                                        <option value="show">Force Show</option>
                                        <option value="hide">Force Hide</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="font-semibold text-[#1A3B2B] block">
                                        Heading Override
                                      </label>
                                      <input
                                        type="text"
                                        value={gOv.label || ''}
                                        onChange={(e) =>
                                          updateFilterGroupOverride(configScopeSlug, group.id, {
                                            label: e.target.value,
                                          })
                                        }
                                        placeholder={`Inherit: ${group.label}`}
                                        className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                      />
                                    </div>

                                    {group.type === 'price_range' ? (
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                          <label className="font-semibold text-[#1A3B2B] block">
                                            Min ₹ Override
                                          </label>
                                          <input
                                            type="number"
                                            min={0}
                                            value={gOv.minPrice ?? ''}
                                            placeholder={String(group.minPrice ?? 500)}
                                            onChange={(e) =>
                                              updateFilterGroupOverride(configScopeSlug, group.id, {
                                                minPrice:
                                                  e.target.value === ''
                                                    ? undefined
                                                    : Math.max(0, Number(e.target.value)),
                                              })
                                            }
                                            className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="font-semibold text-[#1A3B2B] block">
                                            Max ₹ Override
                                          </label>
                                          <input
                                            type="number"
                                            min={0}
                                            value={gOv.maxPrice ?? ''}
                                            placeholder="Auto"
                                            onChange={(e) =>
                                              updateFilterGroupOverride(configScopeSlug, group.id, {
                                                maxPrice:
                                                  e.target.value === ''
                                                    ? undefined
                                                    : Math.max(0, Number(e.target.value)),
                                              })
                                            }
                                            className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <label className="font-semibold text-[#1A3B2B] block">
                                          Custom Options Override (CSV)
                                        </label>
                                        <CommaListInput
                                          values={gOv.customOptions || []}
                                          onChange={(opts) =>
                                            updateFilterGroupOverride(configScopeSlug, group.id, {
                                              customOptions: opts,
                                            })
                                          }
                                          placeholder="Leave blank to inherit global"
                                          className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-3 border-t border-[#E8DCCF]">
                        <button
                          type="button"
                          disabled={savingExploreAndFilters}
                          onClick={() => void handleSaveExploreAndFilters()}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {savingExploreAndFilters
                              ? 'Saving Explore & Filters...'
                              : 'Save Explore & Filters Config'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COUPONS */}
            {activeTab === 'coupons' && (
              <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                      Promotion Coupons
                    </h2>
                    <p className="text-xs text-[#647268]">
                      Create, edit, or toggle discount codes validated live at checkout
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateCouponModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Coupon</span>
                  </button>
                </div>

                {coupons.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-[#D8C7B5] rounded-2xl space-y-3">
                    <Tag className="w-8 h-8 text-[#8E9B92] mx-auto" />
                    <p className="text-xs text-[#647268]">No promotion coupons configured yet.</p>
                    <button
                      type="button"
                      onClick={openCreateCouponModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create First Coupon
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {coupons.map((c) => (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl border border-[#BCD8AA] bg-[#D0E9C0]/25 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-base text-[#1A3B2B]">
                              {c.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleToggleCoupon(c.id, Boolean(c.is_active))}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${c.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                }`}
                              title="Click to toggle status"
                            >
                              {c.is_active ? 'Active' : 'Disabled'}
                            </button>
                          </div>

                          <div className="space-y-1 text-xs text-[#3A443D]">
                            <p className="font-semibold">
                              Discount:{' '}
                              {c.discount_type === 'percentage'
                                ? `${c.discount_value}%${c.max_discount_inr
                                  ? ` (max ₹${Number(c.max_discount_inr).toLocaleString('en-IN')})`
                                  : ''
                                }`
                                : `₹${Number(c.discount_value).toLocaleString('en-IN')}`}
                            </p>
                            <p className="text-[11px] text-[#647268]">
                              Min order: ₹{Number(c.min_order_amount_inr || 0).toLocaleString('en-IN')}
                            </p>
                            <p className="text-[11px] text-[#647268]">
                              Redemptions: {c.used_count || 0}
                              {c.usage_limit ? ` / ${c.usage_limit}` : ' (unlimited)'}
                            </p>
                            {c.end_date && (
                              <p className="text-[11px] text-[#647268]">
                                Expires: {new Date(c.end_date).toLocaleDateString('en-GB')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#BCD8AA]">
                          <button
                            type="button"
                            onClick={() => openEditCouponModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#BCD8AA] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCouponTarget(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: USERS & INQUIRIES */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Sub-navigation bar */}
                <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-[#D8C7B5] shadow-xs">
                  <button
                    type="button"
                    onClick={() => setUsersSubTab('users')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${usersSubTab === 'users'
                      ? 'bg-[#285A3C] text-white'
                      : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                      }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Registered Users & Roles ({usersList.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUsersSubTab('messages')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${usersSubTab === 'messages'
                      ? 'bg-[#285A3C] text-white'
                      : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                      }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Contact Inquiries ({contactMessages.length})</span>
                    {metrics.unreadMessages > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {metrics.unreadMessages} new
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setUsersSubTab('newsletter')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${usersSubTab === 'newsletter'
                      ? 'bg-[#285A3C] text-white'
                      : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                      }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Newsletter ({subscribers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUsersSubTab('reviews')}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${usersSubTab === 'reviews'
                      ? 'bg-[#285A3C] text-white'
                      : 'text-[#4F6355] hover:bg-[#FAF5EE]'
                      }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Product Reviews ({reviewsList.length})</span>
                    {metrics.pendingReviews > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {metrics.pendingReviews} pending
                      </span>
                    )}
                  </button>
                </div>

                {/* Sub-tab 1: Users, Roles & Admin Allowlist */}
                {usersSubTab === 'users' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                            Registered Users & Roles
                          </h2>
                          <p className="text-xs text-[#647268]">
                            Inspect customer profiles, activity telemetry, and assigned database roles
                            {user?.role !== 'super_admin'
                              ? ' (role changes restricted to Super Admin)'
                              : ''}
                          </p>
                        </div>
                        <div className="relative min-w-[240px]">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9B92]" />
                          <input
                            type="search"
                            aria-label="Search registered users"
                            placeholder="Search by name, email, or phone..."
                            value={usersSearch}
                            onChange={(e) => setUsersSearch(e.target.value)}
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] text-xs focus:outline-none focus:border-[#285A3C]"
                          />
                        </div>
                      </div>

                      {filteredUsers.length === 0 ? (
                        <p className="py-8 text-center text-xs text-[#647268]">
                          No registered profiles match your filter. Note: guest checkout buyers appear in Orders until they create an account.
                        </p>
                      ) : (
                        <div
                          tabIndex={0}
                          role="region"
                          aria-labelledby="users-table-caption"
                          className="admin-table-wrapper"
                        >
                          <table
                            className="admin-responsive-table w-full text-left text-xs"
                            style={
                              {
                                '--label-2': '"Phone"',
                                '--label-3': '"Role"',
                                '--label-4': '"Joined"',
                                '--label-5': '"Activity"',
                              } as React.CSSProperties
                            }
                          >
                            <caption id="users-table-caption" className="sr-only">
                              Registered users and database role directory
                            </caption>
                            <thead className="text-[#647268]">
                              <tr>
                                <th scope="col" className="p-3 font-semibold">User</th>
                                <th scope="col" className="p-3 font-semibold">Phone</th>
                                <th scope="col" className="p-3 font-semibold">Role</th>
                                <th scope="col" className="p-3 font-semibold">Joined</th>
                                <th scope="col" className="p-3 font-semibold text-right">Activity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8DCCF]">
                              {filteredUsers.map((u) => {
                                const isSelf = u.id === user?.id;
                                return (
                                  <tr key={u.id} className="hover:bg-[#FAF5EE]/50">
                                    <th scope="row" className="p-3 text-left font-normal">
                                      <p className="font-semibold text-[#1A3B2B]">
                                        {u.full_name || 'DORASANI Member'}
                                        {isSelf ? ' (You)' : ''}
                                      </p>
                                      <p className="text-[11px] font-mono text-[#647268]">{u.email || '—'}</p>
                                    </th>
                                    <td className="p-3 text-[#4F6355]">{u.phone || '—'}</td>
                                    <td className="p-3">
                                      {user?.role === 'super_admin' ? (
                                        <select
                                          aria-label={`Role for ${u.email || u.full_name}`}
                                          disabled={isSelf}
                                          value={u.role || 'customer'}
                                          onChange={(e) =>
                                            void handleUpdateUserRole(u, e.target.value as UserRole)
                                          }
                                          title={
                                            isSelf
                                              ? 'Cannot change your own super admin role'
                                              : 'Assign role'
                                          }
                                          className="text-[11px] font-semibold border border-[#BCD8AA] bg-[#FAF5EE] rounded-lg px-2 py-1 text-[#1A3B2B] disabled:opacity-60"
                                        >
                                          {USER_ROLES.map((r) => (
                                            <option key={r.value} value={r.value}>
                                              {r.label}
                                            </option>
                                          ))}
                                        </select>
                                      ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#D0E9C0]/60 text-[#1A3B2B]">
                                          {String(u.role || 'customer').replace(/_/g, ' ')}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-[#647268]">
                                      {u.created_at
                                        ? new Date(u.created_at).toLocaleDateString('en-GB')
                                        : '—'}
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => void openActivityLogsModal(u)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                                      >
                                        <Activity className="w-3 h-3 text-[#285A3C]" />
                                        <span>View Logs</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Super Admin Allowlist Management */}
                    {user?.role === 'super_admin' && (
                      <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                        <div className="flex items-start gap-3">
                          <Shield className="w-5 h-5 text-[#285A3C] shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">
                              Authorized Admin Emails Allowlist (`admin_emails`)
                            </h3>
                            <p className="text-xs text-[#647268]">
                              Emails listed here automatically receive their designated staff role upon sign-in or signup verification
                            </p>
                          </div>
                        </div>

                        <form
                          onSubmit={handleSaveAdminEmail}
                          className="dorasani-form grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-[#FAF5EE] p-4 rounded-xl border border-[#E8DCCF] text-xs"
                        >
                          <div className="md:col-span-4 space-y-1">
                            <label htmlFor="allowlist-email" className="font-semibold text-[#1A3B2B] block">
                              Staff Email Address *
                            </label>
                            <input
                              id="allowlist-email"
                              name="email"
                              type="email"
                              required
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck={false}
                              value={adminEmailInput}
                              onChange={(e) => setAdminEmailInput(e.target.value)}
                              placeholder="staff@example.com"
                              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                            />
                          </div>

                          <div className="md:col-span-3 space-y-1">
                            <label htmlFor="allowlist-role" className="font-semibold text-[#1A3B2B] block">
                              Granted Role
                            </label>
                            <select
                              id="allowlist-role"
                              name="role"
                              value={adminEmailRole}
                              onChange={(e) => setAdminEmailRole(e.target.value as UserRole)}
                              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                            >
                              {USER_ROLES.filter((r) => r.value !== 'customer').map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-3 space-y-1">
                            <label htmlFor="allowlist-notes" className="font-semibold text-[#1A3B2B] block">
                              Notes (Optional)
                            </label>
                            <input
                              id="allowlist-notes"
                              name="notes"
                              type="text"
                              value={adminEmailNotes}
                              onChange={(e) => setAdminEmailNotes(e.target.value)}
                              placeholder="e.g. Fulfillment lead"
                              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <button
                              type="submit"
                              disabled={savingAdminEmail}
                              className="w-full py-2.5 px-3 rounded-lg bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60"
                            >
                              {savingAdminEmail ? 'Saving...' : 'Allow Email'}
                            </button>
                          </div>
                        </form>

                        {adminEmails.length > 0 && (
                          <div
                            tabIndex={0}
                            role="region"
                            aria-labelledby="allowlist-table-caption"
                            className="admin-table-wrapper"
                          >
                            <table
                              className="admin-responsive-table w-full text-left text-xs"
                              style={
                                {
                                  '--label-2': '"Role"',
                                  '--label-3': '"Notes"',
                                  '--label-4': '"Status"',
                                  '--label-5': '"Actions"',
                                } as React.CSSProperties
                              }
                            >
                              <caption id="allowlist-table-caption" className="sr-only">
                                Authorized administrator email allowlist
                              </caption>
                              <thead className="text-[#647268]">
                                <tr>
                                  <th scope="col" className="p-3 font-semibold">Email</th>
                                  <th scope="col" className="p-3 font-semibold">Role</th>
                                  <th scope="col" className="p-3 font-semibold">Notes</th>
                                  <th scope="col" className="p-3 font-semibold">Status</th>
                                  <th scope="col" className="p-3 font-semibold text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E8DCCF]">
                                {adminEmails.map((entry) => {
                                  const isSelfEmail =
                                    entry.email?.toLowerCase() === user?.email?.toLowerCase();
                                  return (
                                    <tr key={entry.email} className="hover:bg-[#FAF5EE]/50">
                                      <th scope="row" className="p-3 font-mono font-semibold text-[#1A3B2B]">
                                        {entry.email}
                                      </th>
                                      <td className="p-3 capitalize">
                                        {String(entry.role || 'admin').replace(/_/g, ' ')}
                                      </td>
                                      <td className="p-3 text-[#647268]">{entry.notes || '—'}</td>
                                      <td className="p-3">
                                        <button
                                          type="button"
                                          disabled={isSelfEmail}
                                          onClick={() => void handleToggleAdminEmailActive(entry)}
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase disabled:opacity-60 ${entry.is_active
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-rose-100 text-rose-800'
                                            }`}
                                        >
                                          {entry.is_active ? 'Active' : 'Disabled'}
                                        </button>
                                      </td>
                                      <td className="p-3 text-right">
                                        <button
                                          type="button"
                                          disabled={isSelfEmail}
                                          onClick={() => void handleDeleteAdminEmail(entry.email)}
                                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                                          aria-label={`Remove ${entry.email}`}
                                          title={
                                            isSelfEmail
                                              ? 'Cannot remove your own active email'
                                              : 'Remove from allowlist'
                                          }
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab 2: Contact Messages */}
                {usersSubTab === 'messages' && (
                  <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                          Customer Contact Inquiries
                        </h2>
                        <p className="text-xs text-[#647268]">
                          Messages submitted from the storefront Contact & Stylist Assistance page
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(['all', 'new', 'read', 'responded'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setMessageStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${messageStatusFilter === st
                              ? 'bg-[#285A3C] text-white'
                              : 'bg-[#FAF5EE] border border-[#D8C7B5] text-[#4F6355]'
                              }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredContactMessages.length === 0 ? (
                      <p className="py-10 text-center text-xs text-[#647268]">
                        No customer inquiries match this filter.
                      </p>
                    ) : (
                      <div
                        tabIndex={0}
                        role="region"
                        aria-labelledby="messages-table-caption"
                        className="admin-table-wrapper"
                      >
                        <table
                          className="admin-responsive-table w-full text-left text-xs"
                          style={
                            {
                              '--label-2': '"Subject"',
                              '--label-3': '"Preview"',
                              '--label-4': '"Status"',
                              '--label-5': '"Date"',
                              '--label-6': '"Actions"',
                            } as React.CSSProperties
                          }
                        >
                          <caption id="messages-table-caption" className="sr-only">
                            Customer contact inquiries inbox
                          </caption>
                          <thead className="text-[#647268]">
                            <tr>
                              <th scope="col" className="p-3 font-semibold">Sender</th>
                              <th scope="col" className="p-3 font-semibold">Subject</th>
                              <th scope="col" className="p-3 font-semibold">Preview</th>
                              <th scope="col" className="p-3 font-semibold">Status</th>
                              <th scope="col" className="p-3 font-semibold">Date</th>
                              <th scope="col" className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8DCCF]">
                            {filteredContactMessages.map((msg) => {
                              const senderName = msg.full_name || msg.name || 'Customer';
                              return (
                                <tr key={msg.id} className="hover:bg-[#FAF5EE]/50">
                                  <th scope="row" className="p-3 text-left font-normal">
                                    <p className="font-semibold text-[#1A3B2B]">{senderName}</p>
                                    <p className="text-[11px] font-mono text-[#647268]">{msg.email}</p>
                                    {msg.phone && (
                                      <p className="text-[10px] text-[#8E9B92]">{msg.phone}</p>
                                    )}
                                  </th>
                                  <td className="p-3 font-medium text-[#1A3B2B]">
                                    {msg.subject || 'General Inquiry'}
                                  </td>
                                  <td className="p-3 text-[#647268] max-w-[240px] truncate">
                                    {msg.message}
                                  </td>
                                  <td className="p-3">
                                    <select
                                      aria-label={`Status for message from ${senderName}`}
                                      value={msg.status || 'new'}
                                      onChange={(e) =>
                                        void handleUpdateContactStatus(
                                          msg.id,
                                          e.target.value as 'new' | 'read' | 'responded'
                                        )
                                      }
                                      className="text-[11px] font-semibold border border-[#BCD8AA] bg-[#FAF5EE] rounded-lg px-2 py-1 text-[#1A3B2B]"
                                    >
                                      {MESSAGE_STATUSES.map((st) => (
                                        <option key={st.value} value={st.value}>
                                          {st.label}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-3 text-[#647268]">
                                    {new Date(msg.created_at).toLocaleDateString('en-GB')}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="inline-flex items-center gap-1.5 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => setContactViewTarget(msg)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                                      >
                                        <Eye className="w-3 h-3 text-[#285A3C]" />
                                        <span>View</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleDeleteContactMessage(msg.id)}
                                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                        aria-label={`Delete message from ${senderName}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab 3: Newsletter Subscribers */}
                {usersSubTab === 'newsletter' && (
                  <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                          Newsletter Subscribers
                        </h2>
                        <p className="text-xs text-[#647268]">
                          Patrons subscribed via the DORASANI Family footer signup
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => exportToCSV('dorasani_newsletter_subscribers', subscribers)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                      >
                        <FileDown className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    {subscribers.length === 0 ? (
                      <p className="py-10 text-center text-xs text-[#647268]">
                        No newsletter subscribers recorded yet.
                      </p>
                    ) : (
                      <div
                        tabIndex={0}
                        role="region"
                        aria-labelledby="newsletter-table-caption"
                        className="admin-table-wrapper"
                      >
                        <table
                          className="admin-responsive-table w-full text-left text-xs"
                          style={
                            {
                              '--label-2': '"Status"',
                              '--label-3': '"Subscribed On"',
                              '--label-4': '"Actions"',
                            } as React.CSSProperties
                          }
                        >
                          <caption id="newsletter-table-caption" className="sr-only">
                            Newsletter subscriber list
                          </caption>
                          <thead className="text-[#647268]">
                            <tr>
                              <th scope="col" className="p-3 font-semibold">Email</th>
                              <th scope="col" className="p-3 font-semibold">Status</th>
                              <th scope="col" className="p-3 font-semibold">Subscribed On</th>
                              <th scope="col" className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8DCCF]">
                            {subscribers.map((sub) => {
                              const active = sub.is_active !== false;
                              return (
                                <tr key={sub.id} className="hover:bg-[#FAF5EE]/50">
                                  <th scope="row" className="p-3 font-mono font-semibold text-[#1A3B2B]">
                                    {sub.email}
                                  </th>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${active
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-stone-200 text-stone-700'
                                        }`}
                                    >
                                      {active ? 'Active' : 'Unsubscribed'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-[#647268]">
                                    {sub.created_at
                                      ? new Date(sub.created_at).toLocaleDateString('en-GB')
                                      : '—'}
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => void handleToggleSubscriber(sub)}
                                      className="px-3 py-1 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                                    >
                                      {active ? 'Pause' : 'Reactivate'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab 4: Product Reviews Moderation */}
                {usersSubTab === 'reviews' && (
                  <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                          Product Reviews Moderation
                        </h2>
                        <p className="text-xs text-[#647268]">
                          Approving, rejecting, or deleting reviews automatically recalculates product star ratings and counts
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setReviewStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${reviewStatusFilter === st
                              ? 'bg-[#285A3C] text-white'
                              : 'bg-[#FAF5EE] border border-[#D8C7B5] text-[#4F6355]'
                              }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredReviews.length === 0 ? (
                      <p className="py-10 text-center text-xs text-[#647268]">
                        No product reviews match this filter.
                      </p>
                    ) : (
                      <div
                        tabIndex={0}
                        role="region"
                        aria-labelledby="reviews-table-caption"
                        className="admin-table-wrapper"
                      >
                        <table
                          className="admin-responsive-table w-full text-left text-xs"
                          style={
                            {
                              '--label-2': '"Reviewer"',
                              '--label-3': '"Rating"',
                              '--label-4': '"Review"',
                              '--label-5': '"Status"',
                              '--label-6': '"Date"',
                              '--label-7': '"Actions"',
                            } as React.CSSProperties
                          }
                        >
                          <caption id="reviews-table-caption" className="sr-only">
                            Customer product reviews moderation table
                          </caption>
                          <thead className="text-[#647268]">
                            <tr>
                              <th scope="col" className="p-3 font-semibold">Product</th>
                              <th scope="col" className="p-3 font-semibold">Reviewer</th>
                              <th scope="col" className="p-3 font-semibold">Rating</th>
                              <th scope="col" className="p-3 font-semibold">Review</th>
                              <th scope="col" className="p-3 font-semibold">Status</th>
                              <th scope="col" className="p-3 font-semibold">Date</th>
                              <th scope="col" className="p-3 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8DCCF]">
                            {filteredReviews.map((rev) => (
                              <tr key={rev.id} className="hover:bg-[#FAF5EE]/50">
                                <th scope="row" className="p-3 text-left font-semibold text-[#1A3B2B]">
                                  {rev.products?.slug ? (
                                    <Link
                                      to={`/products/${rev.products.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-[#285A3C] hover:underline"
                                    >
                                      {rev.products?.title || 'Product'}
                                    </Link>
                                  ) : (
                                    rev.products?.title || 'Product'
                                  )}
                                </th>
                                <td className="p-3">
                                  <p className="font-semibold text-[#1A3B2B]">{rev.reviewer_name}</p>
                                  {rev.verified_purchase && (
                                    <span className="text-[10px] font-bold text-emerald-700">
                                      Verified Buyer
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-bold text-[#C29336]">★ {rev.rating}/5</td>
                                <td className="p-3 max-w-[260px]">
                                  {rev.title && (
                                    <p className="font-semibold text-[#1A3B2B] truncate">{rev.title}</p>
                                  )}
                                  <p className="text-[#647268] line-clamp-2">{rev.content}</p>
                                </td>
                                <td className="p-3">
                                  <select
                                    aria-label={`Moderation status for review by ${rev.reviewer_name}`}
                                    value={rev.status || 'pending'}
                                    onChange={(e) =>
                                      void handleUpdateReviewStatus(
                                        rev.id,
                                        e.target.value as 'pending' | 'approved' | 'rejected'
                                      )
                                    }
                                    className="text-[11px] font-semibold border border-[#BCD8AA] bg-[#FAF5EE] rounded-lg px-2 py-1 text-[#1A3B2B]"
                                  >
                                    {REVIEW_STATUSES.map((st) => (
                                      <option key={st.value} value={st.value}>
                                        {st.label}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-3 text-[#647268]">
                                  {new Date(rev.created_at).toLocaleDateString('en-GB')}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteReview(rev.id)}
                                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                    aria-label={`Delete review by ${rev.reviewer_name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CMS, SETTINGS & BANNERS */}
            {activeTab === 'cms' && (
              <div className="space-y-8">
                {/* 0. Shortcut to Explore Categories & Dynamic Filters Builder */}
                <div className="bg-[#D0E9C0]/35 rounded-2xl border border-[#BCD8AA] p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <SlidersHorizontal className="w-5 h-5 text-[#285A3C] shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-golden text-base font-bold text-[#1A3B2B]">
                        Explore Categories Strip & Collection Filters Builder
                      </h2>
                      <p className="text-xs text-[#4F6355]">
                        Rename &quot;Explore Categories&quot; or &quot;Filters&quot;, upload category photos, add filter groups, or configure per-collection overrides
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('categories');
                        setCategoriesSubTab('items');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-[#285A3C] bg-white text-xs font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] transition-colors"
                    >
                      Edit Explore Names & Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('categories');
                        setCategoriesSubTab('builder');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Open Explore & Filters Builder</span>
                    </button>
                  </div>
                </div>

                {/* 1. Storefront & Shipping Settings */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-[#285A3C] shrink-0 mt-0.5" />
                    <div>
                      <h2
                        id="cfg-storefront-settings-heading"
                        className="font-golden text-lg font-bold text-[#1A3B2B]"
                      >
                        Storefront Contact, Social & Shipping Rules
                      </h2>
                      <p className="text-xs text-[#647268]">
                        Changes saved here update the Announcement Bar, Footer, Contact Page, Cart, Checkout, and server shipping validation immediately
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleSaveSiteSettings}
                    aria-labelledby="cfg-storefront-settings-heading"
                    className="dorasani-form space-y-5 text-xs"
                  >
                    {settingsFormError && (
                      <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                        {settingsFormError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="cfg-store-name" className="font-semibold text-[#1A3B2B] block">
                          Store Display Name *
                        </label>
                        <input
                          id="cfg-store-name"
                          name="storeName"
                          type="text"
                          required
                          value={settingsForm.storeName}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, storeName: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-support-email" className="font-semibold text-[#1A3B2B] block">
                          Support Email *
                        </label>
                        <input
                          id="cfg-support-email"
                          name="supportEmail"
                          type="email"
                          required
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={settingsForm.supportEmail}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, supportEmail: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-concierge-email" className="font-semibold text-[#1A3B2B] block">
                          Concierge / Bridal Email *
                        </label>
                        <input
                          id="cfg-concierge-email"
                          name="conciergeEmail"
                          type="email"
                          required
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={settingsForm.conciergeEmail}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, conciergeEmail: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-support-phone" className="font-semibold text-[#1A3B2B] block">
                          Support Phone (optional)
                        </label>
                        <input
                          id="cfg-support-phone"
                          name="supportPhone"
                          type="tel"
                          autoCorrect="off"
                          value={settingsForm.supportPhone}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, supportPhone: e.target.value })
                          }
                          placeholder="Leave blank to hide public phone line"
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-address" className="font-semibold text-[#1A3B2B] block">
                          Studio Street Address
                        </label>
                        <input
                          id="cfg-address"
                          name="storeAddress"
                          type="text"
                          value={settingsForm.storeAddress}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, storeAddress: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-city-state" className="font-semibold text-[#1A3B2B] block">
                          Studio City / State / PIN
                        </label>
                        <input
                          id="cfg-city-state"
                          name="storeCityStatePin"
                          type="text"
                          value={settingsForm.storeCityStatePin}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, storeCityStatePin: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-hours" className="font-semibold text-[#1A3B2B] block">
                          Studio Hours
                        </label>
                        <input
                          id="cfg-hours"
                          name="studioHours"
                          type="text"
                          value={settingsForm.studioHours}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, studioHours: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-threshold" className="font-semibold text-[#1A3B2B] block">
                          Free Shipping Threshold (₹) *
                        </label>
                        <input
                          id="cfg-threshold"
                          name="freeShippingThreshold"
                          type="number"
                          required
                          min={0}
                          value={settingsForm.freeShippingThreshold}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              freeShippingThreshold: Number(e.target.value),
                            })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-standard-fee" className="font-semibold text-[#1A3B2B] block">
                          Standard Shipping Fee Below Threshold (₹) *
                        </label>
                        <input
                          id="cfg-standard-fee"
                          name="standardShippingFee"
                          type="number"
                          required
                          min={0}
                          value={settingsForm.standardShippingFee}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              standardShippingFee: Number(e.target.value),
                            })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-express-fee" className="font-semibold text-[#1A3B2B] block">
                          Express Shipping Fee (₹) *
                        </label>
                        <input
                          id="cfg-express-fee"
                          name="expressShippingFee"
                          type="number"
                          required
                          min={0}
                          value={settingsForm.expressShippingFee}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              expressShippingFee: Number(e.target.value),
                            })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-ig" className="font-semibold text-[#1A3B2B] block">
                          Instagram URL
                        </label>
                        <input
                          id="cfg-ig"
                          name="instagramUrl"
                          type="url"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={settingsForm.instagramUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-fb" className="font-semibold text-[#1A3B2B] block">
                          Facebook URL
                        </label>
                        <input
                          id="cfg-fb"
                          name="facebookUrl"
                          type="url"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={settingsForm.facebookUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-yt" className="font-semibold text-[#1A3B2B] block">
                          YouTube URL
                        </label>
                        <input
                          id="cfg-yt"
                          name="youtubeUrl"
                          type="url"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={settingsForm.youtubeUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="cfg-google" className="font-semibold text-[#1A3B2B] block">
                          Google Business / Share URL
                        </label>
                        <input
                          id="cfg-google"
                          name="googleUrl"
                          type="url"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          value={settingsForm.googleUrl}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, googleUrl: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="cfg-copyright" className="font-semibold text-[#1A3B2B] block">
                          Footer Copyright Line
                        </label>
                        <input
                          id="cfg-copyright"
                          name="footerCopyright"
                          type="text"
                          value={settingsForm.footerCopyright}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, footerCopyright: e.target.value })
                          }
                          className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                        />
                      </div>

                      <div className="sm:col-span-2 p-3.5 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] min-h-[48px] flex items-start gap-3">
                        <input
                          id="cfg-cod-enabled"
                          name="codEnabled"
                          type="checkbox"
                          checked={Boolean(settingsForm.codEnabled)}
                          aria-describedby="cfg-cod-enabled-hint"
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 accent-[#285A3C] rounded cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285A3C]"
                        />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor="cfg-cod-enabled"
                              className="font-semibold text-[#1A3B2B] cursor-pointer"
                            >
                              Allow Cash on Delivery (COD) at Checkout
                            </label>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                settingsForm.codEnabled
                                  ? 'bg-[#EAF3ED] text-[#1A3B2B] border-[#C6DEC9]'
                                  : 'bg-[#FFF5F5] text-[#8B1A2B] border-[#F0D5D8]'
                              }`}
                            >
                              {settingsForm.codEnabled
                                ? 'Enabled at Checkout'
                                : 'Unavailable (Razorpay Online Only)'}
                            </span>
                          </div>
                          <p id="cfg-cod-enabled-hint" className="text-[11px] text-[#4F6355]">
                            When unchecked, Cash on Delivery is shown as unavailable at checkout and blocked on the server; only Razorpay online payments (UPI, Cards, Net Banking, Wallets) are accepted.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delhivery One Shipping & Tracking Configuration */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-[#BCD8AA] bg-[#F3F8F1]/65 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <Truck className="w-4 h-4 text-[#285A3C] shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-golden text-base font-bold text-[#1A3B2B]">
                              Delhivery One Shipping &amp; Live Tracking
                            </h3>
                            <p className="text-[11px] text-[#4F6355]">
                              Controls live PIN serviceability checks, AWB creation, packing slips, pickup scheduling, and tracking sync. API tokens remain strictly in Supabase Edge Secrets.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={testingDelhiveryConn}
                          onClick={() => void handleTestDelhiveryConnection()}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#BCD8AA] bg-white text-xs font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] disabled:opacity-60"
                        >
                          {testingDelhiveryConn ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#285A3C]" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#285A3C]" />
                          )}
                          <span>
                            {testingDelhiveryConn ? 'Testing...' : 'Test Delhivery Connection'}
                          </span>
                        </button>
                      </div>

                      {delhiveryConnResult && (
                        <div
                          role="status"
                          className={`p-3 rounded-xl border text-[11px] font-medium ${
                            delhiveryConnResult.ok
                              ? 'bg-[#EAF3ED] border-[#BCD8AA] text-[#1A3B2B]'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          {delhiveryConnResult.message}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="p-3 rounded-xl border border-[#D8C7B5] bg-white min-h-[48px] flex items-start gap-3 cursor-pointer">
                          <input
                            id="cfg-delhivery-enabled"
                            name="delhiveryEnabled"
                            type="checkbox"
                            checked={Boolean(settingsForm.delhiveryEnabled)}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                delhiveryEnabled: e.target.checked,
                              })
                            }
                            className="mt-0.5 w-4 h-4 accent-[#285A3C] rounded cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-[#1A3B2B] block">
                              Enable Delhivery One Integration
                            </span>
                            <span className="text-[11px] text-[#4F6355] block">
                              Activates live Delhivery PIN serviceability checks on Product &amp; Checkout pages plus AWB tracking.
                            </span>
                          </div>
                        </label>

                        <label className="p-3 rounded-xl border border-[#D8C7B5] bg-white min-h-[48px] flex items-start gap-3 cursor-pointer">
                          <input
                            id="cfg-delhivery-auto-manifest"
                            name="delhiveryAutoManifest"
                            type="checkbox"
                            checked={Boolean(settingsForm.delhiveryAutoManifest)}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                delhiveryAutoManifest: e.target.checked,
                              })
                            }
                            className="mt-0.5 w-4 h-4 accent-[#285A3C] rounded cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-[#1A3B2B] block">
                              Auto-Manifest Paid / Confirmed Orders
                            </span>
                            <span className="text-[11px] text-[#4F6355] block">
                              Automatically generates a Delhivery AWB immediately after Razorpay capture or COD checkout.
                            </span>
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label
                            htmlFor="cfg-delhivery-pickup-location"
                            className="font-semibold text-[#1A3B2B] block"
                          >
                            Pickup Warehouse Name *
                          </label>
                          <input
                            id="cfg-delhivery-pickup-location"
                            name="delhiveryPickupLocation"
                            type="text"
                            required
                            aria-describedby="cfg-delhivery-pickup-hint"
                            value={settingsForm.delhiveryPickupLocation}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                delhiveryPickupLocation: e.target.value,
                              })
                            }
                            placeholder="DORASANI SAREES B2C"
                            className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                          />
                          <span
                            id="cfg-delhivery-pickup-hint"
                            className="text-[10px] text-[#647268] block"
                          >
                            Must match your registered warehouse name in Delhivery One (case-sensitive).
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="cfg-delhivery-origin-pin"
                            className="font-semibold text-[#1A3B2B] block"
                          >
                            Origin Warehouse PIN *
                          </label>
                          <input
                            id="cfg-delhivery-origin-pin"
                            name="delhiveryOriginPincode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            pattern="\d{6}"
                            maxLength={6}
                            required
                            aria-describedby="cfg-delhivery-origin-hint"
                            value={settingsForm.delhiveryOriginPincode}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                delhiveryOriginPincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                              })
                            }
                            placeholder="500067"
                            className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
                          />
                          <span
                            id="cfg-delhivery-origin-hint"
                            className="text-[10px] text-[#647268] block"
                          >
                            6-digit warehouse dispatch PIN used for TAT &amp; freight calculation.
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="cfg-delhivery-weight"
                            className="font-semibold text-[#1A3B2B] block"
                          >
                            Default Parcel Weight (grams) *
                          </label>
                          <input
                            id="cfg-delhivery-weight"
                            name="delhiveryDefaultWeightGrams"
                            type="number"
                            required
                            min={50}
                            step={50}
                            value={settingsForm.delhiveryDefaultWeightGrams}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                delhiveryDefaultWeightGrams: Number(e.target.value),
                              })
                            }
                            className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                          />
                        </div>

                        <fieldset className="sm:col-span-2 space-y-1.5">
                          <legend className="font-semibold text-[#1A3B2B]">
                            Default Package Dimensions (cm)
                          </legend>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label
                                htmlFor="cfg-delhivery-len"
                                className="text-[10px] text-[#647268] block mb-0.5"
                              >
                                Length (cm)
                              </label>
                              <input
                                id="cfg-delhivery-len"
                                name="delhiveryLengthCm"
                                type="number"
                                min={1}
                                value={settingsForm.delhiveryDefaultDimensions?.length ?? 34}
                                onChange={(e) =>
                                  setSettingsForm({
                                    ...settingsForm,
                                    delhiveryDefaultDimensions: {
                                      ...settingsForm.delhiveryDefaultDimensions,
                                      length: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="cfg-delhivery-wid"
                                className="text-[10px] text-[#647268] block mb-0.5"
                              >
                                Breadth (cm)
                              </label>
                              <input
                                id="cfg-delhivery-wid"
                                name="delhiveryBreadthCm"
                                type="number"
                                min={1}
                                value={settingsForm.delhiveryDefaultDimensions?.breadth ?? 26}
                                onChange={(e) =>
                                  setSettingsForm({
                                    ...settingsForm,
                                    delhiveryDefaultDimensions: {
                                      ...settingsForm.delhiveryDefaultDimensions,
                                      breadth: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="cfg-delhivery-hgt"
                                className="text-[10px] text-[#647268] block mb-0.5"
                              >
                                Height (cm)
                              </label>
                              <input
                                id="cfg-delhivery-hgt"
                                name="delhiveryHeightCm"
                                type="number"
                                min={1}
                                value={settingsForm.delhiveryDefaultDimensions?.height ?? 6}
                                onChange={(e) =>
                                  setSettingsForm({
                                    ...settingsForm,
                                    delhiveryDefaultDimensions: {
                                      ...settingsForm.delhiveryDefaultDimensions,
                                      height: Number(e.target.value),
                                    },
                                  })
                                }
                                className="w-full p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                              />
                            </div>
                          </div>
                        </fieldset>

                        <div className="space-y-1">
                          <label
                            htmlFor="cfg-delhivery-gst"
                            className="font-semibold text-[#1A3B2B] block"
                          >
                            Seller GSTIN (optional)
                          </label>
                          <input
                            id="cfg-delhivery-gst"
                            name="delhiverySellerGst"
                            type="text"
                            autoCorrect="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            value={settingsForm.delhiverySellerGst}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                delhiverySellerGst: e.target.value.toUpperCase(),
                              })
                            }
                            placeholder="e.g. 36ABCDE1234F1Z5"
                            className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono uppercase focus:outline-none focus:border-[#285A3C]"
                          />
                        </div>
                      </div>

                      {(() => {
                        const webhookEndpoint = `${(
                          import.meta.env.VITE_SUPABASE_URL ||
                          'https://your-project-ref.supabase.co'
                        ).replace(/\/$/, '')}/functions/v1/delhivery-webhook`;
                        return (
                          <div className="p-3 rounded-xl border border-[#D8C7B5] bg-white flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                                Delhivery Push Scan Webhook URL
                              </span>
                              <code className="block font-mono text-[11px] text-[#1A3B2B] truncate">
                                {webhookEndpoint}
                              </code>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                void navigator.clipboard
                                  .writeText(webhookEndpoint)
                                  .then(() => {
                                    setWebhookUrlCopied(true);
                                    setTimeout(() => setWebhookUrlCopied(false), 2500);
                                  })
                                  .catch(() => showToast('Copy failed — copy URL manually', 'error'));
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-[#FAF5EE] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/40 shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#285A3C]" />
                              <span>{webhookUrlCopied ? 'Copied!' : 'Copy Webhook URL'}</span>
                            </button>
                            <span role="status" className="sr-only">
                              {webhookUrlCopied ? 'Delhivery webhook URL copied to clipboard' : ''}
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="cfg-announcements" className="font-semibold text-[#1A3B2B] block">
                        Top Announcement Ticker Items (one per line)
                      </label>
                      <span id="cfg-announcements-hint" className="text-[11px] text-[#647268] block mb-1">
                        Use <code className="font-mono bg-[#FAF5EE] px-1 rounded">{'{threshold}'}</code> to automatically insert your free-shipping amount.
                      </span>
                      <textarea
                        id="cfg-announcements"
                        name="announcementText"
                        aria-describedby="cfg-announcements-hint"
                        rows={4}
                        value={settingsForm.announcementText}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, announcementText: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingSettings}
                        className="px-5 py-2.5 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
                      >
                        {savingSettings ? 'Saving Settings...' : 'Save Storefront Settings'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Service Benefits Manager */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                        Homepage Service Benefits (`service_benefits`)
                      </h2>
                      <p className="text-xs text-[#647268]">
                        Trust and value strip displayed on the storefront homepage
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateBenefitModal}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Benefit</span>
                    </button>
                  </div>

                  {serviceBenefits.length === 0 ? (
                    <p className="py-8 text-center text-xs text-[#647268]">
                      No service benefits configured yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {serviceBenefits.map((sb) => (
                        <div
                          key={sb.id}
                          className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="w-9 h-9 rounded-full bg-[#D0E9C0] flex items-center justify-center">
                                {renderBenefitIcon(sb.icon_name)}
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sb.is_active
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                                  }`}
                              >
                                {sb.is_active ? 'Active' : 'Hidden'}
                              </span>
                            </div>
                            <h3 className="font-bold text-xs text-[#1A3B2B]">{sb.title}</h3>
                            <p className="text-[11px] text-[#647268]">{sb.description}</p>
                            <span className="text-[10px] text-[#8E9B92] block">
                              Order: #{sb.display_order}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DCCF]">
                            <button
                              type="button"
                              onClick={() => openEditBenefitModal(sb)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/30"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteBenefitTarget(sb)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Dynamic Storefront Banners */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                        Dynamic Storefront Banners (Hero & Promotional)
                      </h2>
                      <p className="text-xs text-[#647268]">
                        Manage hero slides, homepage promotional banners, mobile images, titles, and CTA links without code edits
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openCreateBannerModal}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Banner</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-2xl border border-[#D8C7B5] overflow-hidden bg-[#FAF5EE] flex flex-col justify-between p-4 gap-3"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/10">
                            <OptimizedPicture
                              src={b.desktop_image_url}
                              alt={b.title_line_1}
                              sizes="(max-width: 768px) 92vw, 46vw"
                              loading="lazy"
                              pictureClassName="w-full h-full block"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold uppercase text-[#1A3B2B]">
                                {b.banner_type}
                              </span>
                              <button
                                type="button"
                                onClick={() => void handleToggleBanner(b)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${b.is_active
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                                  }`}
                              >
                                {b.is_active ? 'Published' : 'Hidden'}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <span className="text-[10px] font-bold text-[#C29336] uppercase tracking-wider">
                              {b.tagline || 'Featured'}
                            </span>
                            <h3 className="font-golden text-base font-bold text-[#1A3B2B]">
                              {b.title_line_1} {b.title_line_2}
                            </h3>
                            <p className="text-[11px] text-[#647268]">{b.description}</p>
                            <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-[#285A3C]">
                              <span>
                                CTA: {b.primary_cta_label || 'None'} ({b.primary_cta_link || '—'})
                              </span>
                              <span>Order: #{b.display_order}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DCCF]">
                          <button
                            type="button"
                            onClick={() => openEditBannerModal(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-xs font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/30"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit Banner</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteBannerTarget(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REPORTS & EXPORT */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <AdminAnalyticsPanel
                  orders={orders}
                  products={products}
                  onExportCSV={exportToCSV}
                  onJumpToOrders={(status) => {
                    setOrderStatusFilter(status || 'all');
                    setActiveTab('orders');
                  }}
                  onJumpToInventory={() => setActiveTab('inventory')}
                />

                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                      Export Production Reports
                    </h2>
                    <p className="text-xs text-[#647268]">
                      Download official CSV exports of database records for accounting and inventory audits
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3 text-center">
                    <ShoppingBag className="w-8 h-8 text-[#285A3C] mx-auto" />
                    <h3 className="font-bold text-sm text-[#1A3B2B]">Orders Report</h3>
                    <p className="text-xs text-[#647268]">
                      Export all order records, payments, addresses, and tracking details.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          'dorasani_orders',
                          orders.map((o) => {
                            const paymentsList: any[] = Array.isArray(o.payments)
                              ? o.payments
                              : o.payments
                              ? [o.payments]
                              : [];
                            const primaryPayment =
                              paymentsList.find(
                                (p) => p?.status === 'paid' || p?.status === 'refunded'
                              ) ||
                              paymentsList[0] ||
                              null;
                            return {
                              order_number: o.order_number,
                              created_at: o.created_at,
                              customer_name: o.customer_name,
                              customer_email: o.customer_email,
                              customer_phone: o.customer_phone,
                              order_status: o.order_status,
                              payment_method: o.payment_method,
                              payment_status: o.payment_status,
                              payment_provider:
                                primaryPayment?.provider || (o.payment_method === 'cod' ? 'cod' : ''),
                              razorpay_order_id: primaryPayment?.provider_order_id || '',
                              razorpay_payment_id: primaryPayment?.provider_payment_id || '',
                              subtotal_inr: o.subtotal_inr,
                              discount_inr: o.discount_inr,
                              shipping_fee_inr: o.shipping_fee_inr,
                              total_inr: o.total_inr,
                              coupon_code: o.coupon_code || '',
                              delivery_option: o.delivery_option,
                              courier_name: o.courier_name || '',
                              tracking_id: o.tracking_id || '',
                              items_count: Array.isArray(o.order_items) ? o.order_items.length : 0,
                              shipping_address: o.shipping_address,
                            };
                          })
                        )
                      }
                      className="w-full py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                    >
                      Export Orders (CSV)
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3 text-center">
                    <Package className="w-8 h-8 text-[#285A3C] mx-auto" />
                    <h3 className="font-bold text-sm text-[#1A3B2B]">Product Catalogue</h3>
                    <p className="text-xs text-[#647268]">
                      Export complete product database including SKUs, prices, and fabrics.
                    </p>
                    <button
                      type="button"
                      onClick={() => exportToCSV('dorasani_products', products)}
                      className="w-full py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                    >
                      Export Products (CSV)
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3 text-center">
                    <Layers className="w-8 h-8 text-[#285A3C] mx-auto" />
                    <h3 className="font-bold text-sm text-[#1A3B2B]">Inventory Snapshot</h3>
                    <p className="text-xs text-[#647268]">
                      Export current live stock counts and availability per SKU.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          'dorasani_inventory',
                          products.map((p) => ({
                            title: p.title,
                            sku: p.sku,
                            stock: p.stock_quantity,
                            status: p.status,
                            in_stock: p.in_stock,
                          }))
                        )
                      }
                      className="w-full py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                    >
                      Export Inventory (CSV)
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl border border-[#D8C7B5] bg-[#FAF5EE] space-y-3 text-center">
                    <History className="w-8 h-8 text-[#285A3C] mx-auto" />
                    <h3 className="font-bold text-sm text-[#1A3B2B]">Stock Movements</h3>
                    <p className="text-xs text-[#647268]">
                      Export recent stock adjustments, restocks, and order deductions.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        exportToCSV(
                          'dorasani_stock_movements',
                          inventoryLedger.map((m) => ({
                            date: m.created_at,
                            product: m.products?.title || '',
                            sku: m.products?.sku || '',
                            previous_qty: m.previous_quantity,
                            delta: m.quantity_changed,
                            new_qty: m.new_quantity,
                            reason: m.reason,
                          }))
                        )
                      }
                      className="w-full py-2.5 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] shadow-xs"
                    >
                      Export Ledger (CSV)
                    </button>
                  </div>
                </div>
              </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ==================== MODAL: ADD / EDIT PRODUCT ==================== */}
      <ModalDialog
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        labelledBy="product-modal-title"
        maxWidthClass="max-w-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
          <h2 id="product-modal-title" className="font-golden text-xl font-bold text-[#1A3B2B]">
            {editingProductId ? 'Edit Product' : 'Add New Product to Database'}
          </h2>
          <button
            type="button"
            onClick={() => setProductModalOpen(false)}
            aria-label="Close product dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form onSubmit={handleSaveProduct} className="dorasani-form space-y-4 text-xs">
          {productFormError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium"
            >
              {productFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="prod-title" className="font-semibold text-[#1A3B2B] block">
                Product Title *
              </label>
              <input
                id="prod-title"
                name="title"
                type="text"
                required
                data-autofocus="true"
                autoFocus
                value={productForm.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setProductForm((prev) => ({
                    ...prev,
                    title: nextTitle,
                    slug:
                      !editingProductId && !productSlugTouched ? slugify(nextTitle) : prev.slug,
                  }));
                }}
                placeholder="e.g. Royal Kanchipuram Gold Zari Silk Saree"
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-slug" className="font-semibold text-[#1A3B2B] block">
                Product Slug *
              </label>
              <input
                id="prod-slug"
                name="slug"
                type="text"
                required
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={productForm.slug}
                onChange={(e) => {
                  setProductSlugTouched(true);
                  setProductForm({ ...productForm, slug: e.target.value });
                }}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="prod-sku" className="font-semibold text-[#1A3B2B] block">
                SKU Code
              </label>
              <input
                id="prod-sku"
                name="sku"
                type="text"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="DOR-SAR-001"
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="prod-category" className="font-semibold text-[#1A3B2B]">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineCatDrawer((v) => !v);
                    setShowInlineTypeDrawer(false);
                  }}
                  className="text-[11px] font-bold text-[#285A3C] hover:underline"
                >
                  {showInlineCatDrawer ? 'Close' : '+ Add Category'}
                </button>
              </div>
              <select
                id="prod-category"
                name="category_id"
                value={productForm.category_id}
                onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              >
                <option value="">Uncategorized</option>
                {renderGroupedCategoryOptions()}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="prod-type" className="font-semibold text-[#1A3B2B]">
                  Product Type
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowInlineTypeDrawer((v) => !v);
                    setShowInlineCatDrawer(false);
                  }}
                  className="text-[11px] font-bold text-[#285A3C] hover:underline"
                >
                  {showInlineTypeDrawer ? 'Close' : '+ Add Type'}
                </button>
              </div>
              <select
                id="prod-type"
                name="product_type"
                value={productForm.product_type}
                onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              >
                {productTypesList.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showInlineCatDrawer && (
            <div className="p-3.5 rounded-xl border border-[#BCD8AA] bg-[#D0E9C0]/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A3B2B]">
                  Quick Add Category (Syncs Live to Storefront)
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlineCatDrawer(false)}
                  className="text-[#4F6355] hover:text-[#1A3B2B]"
                  aria-label="Close quick add category"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Category Name (e.g. Gadwal Silk Sarees)"
                  value={inlineCatName}
                  onChange={(e) => setInlineCatName(e.target.value)}
                  className="p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                />
                <select
                  aria-label="Parent Collection"
                  value={inlineCatParentId}
                  onChange={(e) => setInlineCatParentId(e.target.value)}
                  className="p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                >
                  <option value="">Top-Level Collection</option>
                  {parentFilterCategories.map((p) => (
                    <option key={p.id} value={p.id}>
                      Subcategory under {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={savingInlineCat || !inlineCatName.trim()}
                  onClick={() => void handleCreateInlineCategory()}
                  className="px-3 py-2 rounded-lg bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-50"
                >
                  {savingInlineCat ? 'Creating...' : 'Create & Select'}
                </button>
              </div>
            </div>
          )}

          {showInlineTypeDrawer && (
            <div className="p-3.5 rounded-xl border border-[#BCD8AA] bg-[#D0E9C0]/25 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A3B2B]">
                  Quick Add Product Type (Syncs to Storefront Filters)
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlineTypeDrawer(false)}
                  className="text-[#4F6355] hover:text-[#1A3B2B]"
                  aria-label="Close quick add product type"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Product Type (e.g. Dupatta / Half Saree)"
                  value={inlineTypeLabel}
                  onChange={(e) => setInlineTypeLabel(e.target.value)}
                  className="sm:col-span-2 p-2 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                />
                <button
                  type="button"
                  disabled={savingInlineType || !inlineTypeLabel.trim()}
                  onClick={() => void handleCreateInlineProductType()}
                  className="px-3 py-2 rounded-lg bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-50"
                >
                  {savingInlineType ? 'Saving...' : 'Add & Select'}
                </button>
              </div>
              {inlineTypeLabel.trim() && (
                <p className="text-[10px] text-[#4F6355] font-mono">
                  Saved key: {formatProductTypeValue(inlineTypeLabel) || '—'}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="prod-price" className="font-semibold text-[#1A3B2B] block">
                Selling Price (₹) *
              </label>
              <input
                id="prod-price"
                name="price_inr"
                type="number"
                min={1}
                required
                value={productForm.price_inr}
                onChange={(e) =>
                  setProductForm({ ...productForm, price_inr: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-mrp" className="font-semibold text-[#1A3B2B] block">
                MRP (₹) *
              </label>
              <input
                id="prod-mrp"
                name="mrp_inr"
                type="number"
                min={1}
                required
                value={productForm.mrp_inr}
                onChange={(e) =>
                  setProductForm({ ...productForm, mrp_inr: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-stock" className="font-semibold text-[#1A3B2B] block">
                Stock Quantity *
              </label>
              <input
                id="prod-stock"
                name="stock_quantity"
                type="number"
                min={0}
                required
                value={productForm.stock_quantity}
                onChange={(e) => {
                  const raw = e.target.value;
                  const nextQty = raw === '' ? 0 : Math.max(0, Math.round(Number(raw)));
                  setProductForm((prev) => ({
                    ...prev,
                    stock_quantity: nextQty,
                    status:
                      nextQty <= 0
                        ? prev.status === 'active'
                          ? 'out_of_stock'
                          : prev.status
                        : prev.status === 'out_of_stock'
                          ? 'active'
                          : prev.status,
                  }));
                }}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          {productModalStockMeta.isOutOfStock && (
            <div
              role="status"
              className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 font-medium"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>
                Stock Quantity is 0 — Status automatically set to <strong>Out of Stock</strong> (shoppers see &quot;OUT OF STOCK&quot; with purchase disabled).
              </span>
            </div>
          )}

          {!productModalStockMeta.isOutOfStock && productModalStockMeta.isLowStock && (
            <div
              role="status"
              className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2 font-medium"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
              <span>
                Low Stock Alert: <strong>{productModalStockMeta.shortageCount}</strong>{' '}
                quantity less than minimum threshold ({LOW_STOCK_THRESHOLD}). Add{' '}
                {productModalStockMeta.shortageCount} more{' '}
                {productModalStockMeta.shortageCount === 1 ? 'unit' : 'units'} to reach healthy stock.
              </span>
            </div>
          )}

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Visibility Status</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRODUCT_STATUSES.map((st) => {
                const blockedActive = st.value === 'active' && productModalStockMeta.isOutOfStock;
                return (
                  <label
                    key={st.value}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${blockedActive
                      ? 'opacity-45 cursor-not-allowed border-[#E8DCCF] bg-[#FAF5EE]/60'
                      : productForm.status === st.value
                        ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold cursor-pointer'
                        : 'border-[#D8C7B5] bg-white hover:bg-[#FAF5EE] cursor-pointer'
                      }`}
                  >
                    <input
                      type="radio"
                      name="product_status"
                      value={st.value}
                      disabled={blockedActive}
                      checked={productForm.status === st.value}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="accent-[#285A3C]"
                    />
                    <span>{st.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="prod-fabric" className="font-semibold text-[#1A3B2B] block">
                Fabric
              </label>
              <input
                id="prod-fabric"
                name="fabric"
                type="text"
                value={productForm.fabric}
                onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-occasion" className="font-semibold text-[#1A3B2B] block">
                Occasion
              </label>
              <input
                id="prod-occasion"
                name="occasion"
                type="text"
                value={productForm.occasion}
                onChange={(e) => setProductForm({ ...productForm, occasion: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-weave" className="font-semibold text-[#1A3B2B] block">
                Weaving Style
              </label>
              <input
                id="prod-weave"
                name="weaving_style"
                type="text"
                value={productForm.weaving_style}
                onChange={(e) =>
                  setProductForm({ ...productForm, weaving_style: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-length" className="font-semibold text-[#1A3B2B] block">
                Saree / Outfit Length
              </label>
              <input
                id="prod-length"
                name="saree_length"
                type="text"
                value={productForm.saree_length}
                onChange={(e) => setProductForm({ ...productForm, saree_length: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="prod-subtitle" className="font-semibold text-[#1A3B2B] block">
                Subtitle / Short Hook
              </label>
              <input
                id="prod-subtitle"
                name="subtitle"
                type="text"
                value={productForm.subtitle}
                onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                placeholder="Handwoven pure mulberry silk with korvai border"
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-care" className="font-semibold text-[#1A3B2B] block">
                Care Instructions
              </label>
              <input
                id="prod-care"
                name="care_instructions"
                type="text"
                value={productForm.care_instructions}
                onChange={(e) =>
                  setProductForm({ ...productForm, care_instructions: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="prod-subcategory" className="font-semibold text-[#1A3B2B] block">
                Explore Subcategory Label
              </label>
              <input
                id="prod-subcategory"
                name="specificationsSubCategory"
                type="text"
                list="subcategory-suggestions"
                value={productForm.specificationsSubCategory}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    specificationsSubCategory: e.target.value,
                  })
                }
                placeholder="e.g. Kanjivaram Silk, Bridal Lehengas, Kurtis"
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
              <datalist id="subcategory-suggestions">
                {knownSubcategoryNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-tags" className="font-semibold text-[#1A3B2B] block">
                Custom Filter Tags (comma-separated)
              </label>
              <input
                id="prod-tags"
                name="specificationsTagsText"
                type="text"
                value={productForm.specificationsTagsText}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    specificationsTagsText: e.target.value,
                  })
                }
                placeholder="e.g. Zari Border, Handloom, Muhurtham, Pastel"
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Storefront Merchandising Badges</legend>
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { key: 'blouse_included', label: 'Includes Blouse Piece' },
                { key: 'is_new', label: 'New Arrival' },
                { key: 'is_bestseller', label: 'Bestseller' },
                { key: 'is_festive', label: 'Festive Edit' },
                { key: 'is_featured', label: 'Featured' },
              ].map((flag) => (
                <label
                  key={flag.key}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-[#FAF5EE] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean((productForm as any)[flag.key])}
                    onChange={(e) =>
                      setProductForm({ ...productForm, [flag.key]: e.target.checked })
                    }
                    className="accent-[#285A3C]"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="prod-images" className="font-semibold text-[#1A3B2B] block">
                Product Image URLs (one URL per line — first URL is primary image)
              </label>
              <label
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#285A3C] bg-[#D0E9C0]/40 text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0] cursor-pointer transition-colors ${
                  uploadingTarget === 'product-image' ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingTarget === 'product-image' ? 'Uploading...' : 'Upload Photo'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="sr-only"
                  disabled={uploadingTarget === 'product-image'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    void handleUploadSingleImage(
                      file,
                      'product-images',
                      'catalog',
                      'product-image',
                      (url) =>
                        setProductForm((prev) => {
                          const existing = prev.imagesText
                            .split(/\r?\n|,/)
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const isOnlyDefault =
                            !editingProductId &&
                            existing.length === 1 &&
                            existing[0] === DEFAULT_PRODUCT_FORM.imagesText;
                          const nextLines = isOnlyDefault ? [url] : [...existing, url];
                          return { ...prev, imagesText: nextLines.join('\n') };
                        })
                    );
                  }}
                />
              </label>
            </div>
            <textarea
              id="prod-images"
              name="imagesText"
              rows={3}
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={productForm.imagesText}
              onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
              placeholder="/assets/products/kanjivaram_silk_saree.jpg"
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono text-[11px] focus:outline-none focus:border-[#285A3C]"
            />
            {parsedModalImages.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {parsedModalImages.slice(0, 5).map((url, idx) => (
                  <img
                    key={`${url}-${idx}`}
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-12 h-14 object-cover rounded border border-[#D8C7B5] bg-[#FAF5EE]"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="prod-description" className="font-semibold text-[#1A3B2B] block">
              Full Description
            </label>
            <textarea
              id="prod-description"
              name="description"
              rows={4}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="Detailed traditional description, motifs, pallu details, weave origin..."
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setProductModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingProduct}
              className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
            >
              {savingProduct
                ? 'Saving...'
                : editingProductId
                  ? 'Update Product'
                  : 'Save Product to Supabase'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ==================== MODAL: DELETE PRODUCT ==================== */}
      <ModalDialog
        open={Boolean(deleteProductTarget)}
        onClose={() => setDeleteProductTarget(null)}
        labelledBy="delete-product-title"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-product-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                Delete Product?
              </h2>
              <p className="text-xs text-[#647268] mt-1">
                Are you sure you want to permanently remove{' '}
                <strong className="text-[#1A3B2B]">{deleteProductTarget?.title}</strong> from
                Supabase? Historical order snapshots remain intact.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E8DCCF] text-xs">
            <button
              type="button"
              data-autofocus="true"
              autoFocus
              onClick={() => setDeleteProductTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingProduct}
              onClick={() => void handleConfirmDeleteProduct()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              {deletingProduct ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ==================== MODAL: EDIT STOCK ==================== */}
      <ModalDialog
        open={Boolean(stockTarget)}
        onClose={() => setStockTarget(null)}
        labelledBy="stock-modal-title"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
          <div>
            <h2 id="stock-modal-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
              Adjust Inventory Stock
            </h2>
            <p className="text-xs text-[#647268]">{stockTarget?.title}</p>
          </div>
          <button
            type="button"
            onClick={() => setStockTarget(null)}
            aria-label="Close stock dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form onSubmit={handleSaveStockModal} className="dorasani-form space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] flex items-center justify-between">
            <span className="text-[#647268]">Current Stock in Database:</span>
            <strong className="text-sm text-[#1A3B2B]">
              {stockTarget?.stock_quantity ?? 0} units
            </strong>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Update Mode</legend>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${stockMode === 'exact'
                  ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                  : 'border-[#D8C7B5] bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="stockMode"
                  value="exact"
                  checked={stockMode === 'exact'}
                  onChange={() => {
                    setStockMode('exact');
                    setStockAmount(Number(stockTarget?.stock_quantity ?? 0));
                  }}
                  className="accent-[#285A3C]"
                />
                <span>Set Exact Count</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${stockMode === 'delta'
                  ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                  : 'border-[#D8C7B5] bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="stockMode"
                  value="delta"
                  checked={stockMode === 'delta'}
                  onChange={() => {
                    setStockMode('delta');
                    setStockAmount(5);
                  }}
                  className="accent-[#285A3C]"
                />
                <span>Add / Deduct (+/-)</span>
              </label>
            </div>
          </fieldset>

          <div className="space-y-1">
            <label htmlFor="stock-amount-input" className="font-semibold text-[#1A3B2B] block">
              {stockMode === 'exact'
                ? 'New Exact Stock Quantity *'
                : 'Change Amount (+ to add, - to deduct) *'}
            </label>
            <input
              id="stock-amount-input"
              name="stockAmount"
              type="number"
              required
              data-autofocus="true"
              autoFocus
              min={stockMode === 'exact' ? 0 : undefined}
              value={stockAmount}
              onChange={(e) => setStockAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
            <p className="text-[11px] text-[#647268]">
              Resulting stock:{' '}
              <strong
                className={
                  resultingModalStockMeta.isOutOfStock
                    ? 'text-rose-700'
                    : resultingModalStockMeta.isLowStock
                      ? 'text-amber-700'
                      : 'text-[#285A3C]'
                }
              >
                {resultingModalStock} units
              </strong>
            </p>
            {resultingModalStockMeta.isOutOfStock && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-700" />
                <span>
                  Stock will be 0 — Product will automatically be marked <strong>Out of Stock</strong>.
                </span>
              </div>
            )}
            {!resultingModalStockMeta.isOutOfStock && resultingModalStockMeta.isLowStock && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span>
                  Low Stock Warning: <strong>{resultingModalStockMeta.shortageCount}</strong>{' '}
                  quantity less than minimum {LOW_STOCK_THRESHOLD} (need{' '}
                  {resultingModalStockMeta.shortageCount} more to reach {LOW_STOCK_THRESHOLD}).
                </span>
              </div>
            )}
          </div>

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Audit Reason</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STOCK_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${stockReason === r.value
                    ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                    : 'border-[#D8C7B5] bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name="stockReason"
                    value={r.value}
                    checked={stockReason === r.value}
                    onChange={(e) => setStockReason(e.target.value)}
                    className="accent-[#285A3C]"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setStockTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingStock}
              className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
            >
              {savingStock ? 'Updating...' : 'Save Stock Adjustment'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ==================== MODAL: ORDER FULFILLMENT ==================== */}
      <ModalDialog
        open={Boolean(orderEditTarget)}
        onClose={() => setOrderEditTarget(null)}
        labelledBy="order-fulfillment-title"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
          <div>
            <h2
              id="order-fulfillment-title"
              className="font-golden text-lg font-bold text-[#1A3B2B]"
            >
              Edit Order Fulfillment
            </h2>
            <p className="text-xs text-[#647268]">
              Order #{orderEditTarget?.order_number} • {orderEditTarget?.customer_name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOrderEditTarget(null)}
            aria-label="Close fulfillment dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form
          onSubmit={handleSaveOrderFulfillment}
          aria-labelledby="order-fulfillment-title"
          className="dorasani-form space-y-4 text-xs"
        >
          {orderEditTarget && (() => {
            const activeShip = getActiveShipmentFromOrder(orderEditTarget);
            const activeWaybill = activeShip?.tracking_number || orderEditTarget.tracking_id;
            const activeCourier = activeShip?.courier_partner || orderEditTarget.courier_name;
            const isDelhiveryActive =
              Boolean(activeShip) &&
              (!activeShip.courier_partner ||
                /delhivery/i.test(String(activeShip.courier_partner)))
                ? true
                : Boolean(activeWaybill && /delhivery/i.test(String(activeCourier || '')));

            if (isDelhiveryActive && activeWaybill) {
              return (
                <div className="p-3.5 rounded-xl bg-[#F3F8F1] border border-[#BCD8AA] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#285A3C] block">
                        Delhivery One Shipment
                      </span>
                      <p className="font-mono font-bold text-[#1A3B2B] text-xs">
                        AWB: {activeWaybill}
                      </p>
                    </div>
                    {activeShip?.current_status && (
                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#BCD8AA] text-[10px] font-semibold text-[#1A3B2B]">
                        {activeShip.current_status}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={syncingOrderId === orderEditTarget.id}
                      onClick={() => void handleSyncSingleOrderTracking(orderEditTarget)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`w-3 h-3 text-[#285A3C] ${
                          syncingOrderId === orderEditTarget.id ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Sync Live Scans</span>
                    </button>
                    <button
                      type="button"
                      disabled={loadingLabelOrderId === orderEditTarget.id}
                      onClick={() => void handleOpenDelhiveryLabel(orderEditTarget, activeWaybill)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] disabled:opacity-60"
                    >
                      <Printer className="w-3 h-3 text-[#285A3C]" />
                      <span>Packing Slip / Label</span>
                    </button>
                    {!cancelAwbConfirm && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelAwbConfirm(true);
                          requestAnimationFrame(() => keepAwbButtonRef.current?.focus());
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel Delhivery AWB</span>
                      </button>
                    )}
                  </div>

                  {cancelAwbConfirm && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2.5">
                      <p className="text-[11px] text-rose-900 leading-relaxed">
                        Cancel Delhivery AWB <strong className="font-mono">{activeWaybill}</strong>? The customer order remains open so you can re-manifest or assign a different courier.
                      </p>
                      <div className="space-y-1">
                        <label
                          htmlFor="cancel-awb-reason"
                          className="text-[11px] font-semibold text-rose-900 block"
                        >
                          Cancellation Reason (optional)
                        </label>
                        <input
                          id="cancel-awb-reason"
                          name="cancelAwbReason"
                          type="text"
                          value={cancelAwbReason}
                          onChange={(e) => setCancelAwbReason(e.target.value)}
                          placeholder="e.g. Wrong package weight or customer updated address"
                          className="w-full p-2 rounded-lg border border-rose-200 bg-white text-[11px] focus:outline-none focus:border-rose-400"
                        />
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={cancellingAwb}
                          onClick={() => void handleCancelOrderDelhiveryAwb(orderEditTarget)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 disabled:opacity-60"
                        >
                          {cancellingAwb ? 'Cancelling AWB...' : 'Confirm Cancel AWB'}
                        </button>
                        <button
                          ref={keepAwbButtonRef}
                          type="button"
                          onClick={() => {
                            setCancelAwbConfirm(false);
                            setCancelAwbReason('');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                        >
                          Keep AWB
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (
              !activeWaybill &&
              !['cancelled', 'refunded', 'returned', 'delivered'].includes(
                String(orderEditTarget.order_status || '').toLowerCase()
              )
            ) {
              return (
                <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#D8C7B5] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[#4F6355]">
                    No Delhivery AWB assigned yet.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const target = orderEditTarget;
                      setOrderEditTarget(null);
                      openDelhiveryManifestModal(target);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#285A3C] text-white text-[11px] font-semibold hover:bg-[#1E432D]"
                  >
                    <Box className="w-3 h-3" />
                    <span>Manifest via Delhivery One</span>
                  </button>
                </div>
              );
            }

            return null;
          })()}

          <div className="space-y-1">
            <label htmlFor="order-status-select" className="font-semibold text-[#1A3B2B] block">
              Order Status
            </label>
            <select
              id="order-status-select"
              name="order_status"
              data-autofocus="true"
              autoFocus
              value={orderEditStatus}
              onChange={(e) => setOrderEditStatus(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="order-courier" className="font-semibold text-[#1A3B2B] block">
              Courier Partner
            </label>
            <input
              id="order-courier"
              name="courier_name"
              type="text"
              value={orderEditCourier}
              onChange={(e) => setOrderEditCourier(e.target.value)}
              placeholder="e.g. Delhivery, BlueDart, DTDC"
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="order-tracking" className="font-semibold text-[#1A3B2B] block">
              AWB / Tracking ID
            </label>
            <input
              id="order-tracking"
              name="tracking_id"
              type="text"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={orderEditTracking}
              onChange={(e) => setOrderEditTracking(e.target.value)}
              placeholder="e.g. DLV99482710IN"
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setOrderEditTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingOrder}
              className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
            >
              {savingOrder ? 'Saving...' : 'Save Fulfillment'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ==================== MODAL: ADD / EDIT CATEGORY ==================== */}
      <ModalDialog
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        labelledBy="category-modal-title"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
          <h2 id="category-modal-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
            {editingCategoryId ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            type="button"
            onClick={() => setCategoryModalOpen(false)}
            aria-label="Close category dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form onSubmit={handleSaveCategory} className="dorasani-form space-y-4 text-xs">
          {categoryFormError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              {categoryFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="cat-name" className="font-semibold text-[#1A3B2B] block">
                Category Name *
              </label>
              <input
                id="cat-name"
                name="name"
                type="text"
                required
                data-autofocus="true"
                autoFocus
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCategoryForm((prev) => ({
                    ...prev,
                    name,
                    slug:
                      !editingCategoryId && !categorySlugTouched ? slugify(name) : prev.slug,
                  }));
                }}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cat-slug" className="font-semibold text-[#1A3B2B] block">
                Slug *
              </label>
              <input
                id="cat-slug"
                name="slug"
                type="text"
                required
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={categoryForm.slug}
                onChange={(e) => {
                  setCategorySlugTouched(true);
                  setCategoryForm({ ...categoryForm, slug: e.target.value });
                }}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="cat-parent" className="font-semibold text-[#1A3B2B] block">
                Parent Category (optional)
              </label>
              <select
                id="cat-parent"
                name="parent_id"
                value={categoryForm.parent_id}
                onChange={(e) => setCategoryForm({ ...categoryForm, parent_id: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              >
                <option value="">Top-Level Category</option>
                {categories
                  .filter(
                    (c) =>
                      c.id !== editingCategoryId &&
                      (!c.parent_id ||
                        ['kurtis', 'festive'].includes(c.slug) ||
                        categories.some((child) => child.parent_id === c.id))
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="cat-order" className="font-semibold text-[#1A3B2B] block">
                Display Order
              </label>
              <input
                id="cat-order"
                name="display_order"
                type="number"
                value={categoryForm.display_order}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, display_order: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="cat-image" className="font-semibold text-[#1A3B2B] block">
                Category / Explore Pill Image URL
              </label>
              <label
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#285A3C] bg-[#D0E9C0]/40 text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0] cursor-pointer transition-colors ${
                  uploadingTarget === 'category-image' ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingTarget === 'category-image' ? 'Uploading...' : 'Upload Photo'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploadingTarget === 'category-image'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    void handleUploadSingleImage(
                      file,
                      'category-images',
                      'categories',
                      'category-image',
                      (url) => setCategoryForm((prev) => ({ ...prev, image_url: url }))
                    );
                  }}
                />
              </label>
            </div>

            <input
              id="cat-image"
              name="image_url"
              type="text"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={categoryForm.image_url}
              onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
              placeholder="/assets/categories/sarees.jpg"
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
            />

            {/* Live Explore Pill & Homepage Arch Preview */}
            <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] flex flex-wrap items-center gap-5">
              <div className="flex flex-col items-center gap-1.5 w-[104px] text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#647268]">
                  Explore Pill
                </span>
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#285A3C] p-0.5 bg-white">
                  {categoryForm.image_url ? (
                    <img
                      src={categoryForm.image_url}
                      alt={categoryForm.name || 'Explore preview'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#E8DCCF]/50 flex items-center justify-center text-[10px] text-[#8E9B92]">
                      No Img
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold leading-tight text-[#1A3B2B] line-clamp-2">
                  {categoryForm.name || 'Category Name'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#647268]">
                  Homepage Arch
                </span>
                <div className="w-16 h-20 rounded-t-full overflow-hidden border border-[#D8C7B5] bg-white">
                  {categoryForm.image_url ? (
                    <img
                      src={categoryForm.image_url}
                      alt={categoryForm.name || 'Arch preview'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#E8DCCF]/50 flex items-center justify-center text-[10px] text-[#8E9B92]">
                      No Img
                    </div>
                  )}
                </div>
              </div>

              <p className="flex-1 min-w-[160px] text-[11px] text-[#647268] leading-relaxed">
                This live preview mirrors how the category appears inside the &quot;Explore Categories&quot; bar and Homepage Category strip.
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="cat-keywords" className="font-semibold text-[#1A3B2B] block">
              Filter Matching Keywords (comma-separated, optional)
            </label>
            <input
              id="cat-keywords"
              name="filter_keywords"
              type="text"
              value={categoryForm.filter_keywords}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, filter_keywords: e.target.value })
              }
              placeholder="e.g. kanchipuram, kanjivaram, mulberry silk"
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
            <p className="text-[10px] text-[#647268]">
              Controls which products appear when a shopper clicks this Explore pill (matches title, fabric, occasion, weave, or subcategory).
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="cat-desc" className="font-semibold text-[#1A3B2B] block">
              Description
            </label>
            <textarea
              id="cat-desc"
              name="description"
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={categoryForm.is_active}
              onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
              className="accent-[#285A3C]"
            />
            <span className="font-semibold text-[#1A3B2B]">Visible on Storefront</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCategory}
              className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60"
            >
              {savingCategory
                ? 'Saving...'
                : editingCategoryId
                  ? 'Update Category'
                  : 'Create Category'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ==================== MODAL: DELETE CATEGORY ==================== */}
      <ModalDialog
        open={Boolean(deleteCategoryTarget)}
        onClose={() => setDeleteCategoryTarget(null)}
        labelledBy="delete-category-title"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-category-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                Delete Category?
              </h2>
              <p className="text-xs text-[#647268] mt-1">
                Delete <strong className="text-[#1A3B2B]">{deleteCategoryTarget?.name}</strong>?
                Products linked to it will become uncategorized rather than deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E8DCCF] text-xs">
            <button
              type="button"
              data-autofocus="true"
              autoFocus
              onClick={() => setDeleteCategoryTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingCategory}
              onClick={() => void handleConfirmDeleteCategory()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              {deletingCategory ? 'Deleting...' : 'Delete Category'}
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ==================== MODAL: ADD / EDIT COUPON ==================== */}
      <ModalDialog
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        labelledBy="coupon-modal-title"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
          <h2 id="coupon-modal-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
            {editingCouponId ? 'Edit Promotion Coupon' : 'Add Promotion Coupon'}
          </h2>
          <button
            type="button"
            onClick={() => setCouponModalOpen(false)}
            aria-label="Close coupon dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form onSubmit={handleSaveCoupon} className="dorasani-form space-y-4 text-xs">
          {couponFormError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              {couponFormError}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="coupon-code" className="font-semibold text-[#1A3B2B] block">
              Coupon Code *
            </label>
            <input
              id="coupon-code"
              name="code"
              type="text"
              required
              data-autofocus="true"
              autoFocus
              pattern="[A-Za-z0-9_-]{3,32}"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={couponForm.code}
              onChange={(e) =>
                setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g. FESTIVE15"
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono uppercase focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Discount Type</legend>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${couponForm.discount_type === 'percentage'
                  ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                  : 'border-[#D8C7B5] bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="discount_type"
                  value="percentage"
                  checked={couponForm.discount_type === 'percentage'}
                  onChange={() =>
                    setCouponForm({ ...couponForm, discount_type: 'percentage' })
                  }
                  className="accent-[#285A3C]"
                />
                <span>Percentage (%)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${couponForm.discount_type === 'fixed'
                  ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                  : 'border-[#D8C7B5] bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="discount_type"
                  value="fixed"
                  checked={couponForm.discount_type === 'fixed'}
                  onChange={() => setCouponForm({ ...couponForm, discount_type: 'fixed' })}
                  className="accent-[#285A3C]"
                />
                <span>Fixed Amount (₹)</span>
              </label>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="coupon-value" className="font-semibold text-[#1A3B2B] block">
                {couponForm.discount_type === 'percentage'
                  ? 'Discount Percentage (%) *'
                  : 'Flat Discount Amount (₹) *'}
              </label>
              <input
                id="coupon-value"
                name="discount_value"
                type="number"
                required
                min={1}
                max={couponForm.discount_type === 'percentage' ? 95 : undefined}
                value={couponForm.discount_value}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="coupon-min" className="font-semibold text-[#1A3B2B] block">
                Minimum Order Value (₹)
              </label>
              <input
                id="coupon-min"
                name="min_order_amount_inr"
                type="number"
                min={0}
                value={couponForm.min_order_amount_inr}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    min_order_amount_inr: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {couponForm.discount_type === 'percentage' && (
              <div className="space-y-1">
                <label htmlFor="coupon-max-disc" className="font-semibold text-[#1A3B2B] block">
                  Max Discount Cap (₹)
                </label>
                <input
                  id="coupon-max-disc"
                  name="max_discount_inr"
                  type="number"
                  min={0}
                  value={couponForm.max_discount_inr}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, max_discount_inr: e.target.value })
                  }
                  placeholder="Optional"
                  className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="coupon-limit" className="font-semibold text-[#1A3B2B] block">
                Usage Limit
              </label>
              <input
                id="coupon-limit"
                name="usage_limit"
                type="number"
                min={1}
                value={couponForm.usage_limit}
                onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
                placeholder="Unlimited"
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="coupon-end" className="font-semibold text-[#1A3B2B] block">
                Expiry Date
              </label>
              <input
                id="coupon-end"
                name="end_date"
                type="date"
                value={couponForm.end_date}
                onChange={(e) => setCouponForm({ ...couponForm, end_date: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={couponForm.is_active}
              onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
              className="accent-[#285A3C]"
            />
            <span className="font-semibold text-[#1A3B2B]">
              Activate immediately for customers at checkout
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setCouponModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCoupon}
              className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60"
            >
              {savingCoupon
                ? 'Saving...'
                : editingCouponId
                  ? 'Update Coupon'
                  : 'Create Coupon'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ==================== MODAL: DELETE COUPON ==================== */}
      <ModalDialog
        open={Boolean(deleteCouponTarget)}
        onClose={() => setDeleteCouponTarget(null)}
        labelledBy="delete-coupon-title"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-coupon-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                Delete Coupon?
              </h2>
              <p className="text-xs text-[#647268] mt-1">
                Permanently remove coupon{' '}
                <strong className="font-mono text-[#1A3B2B]">{deleteCouponTarget?.code}</strong>?
                Customers will no longer be able to apply it.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E8DCCF] text-xs">
            <button
              type="button"
              data-autofocus="true"
              autoFocus
              onClick={() => setDeleteCouponTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingCoupon}
              onClick={() => void handleConfirmDeleteCoupon()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              {deletingCoupon ? 'Deleting...' : 'Delete Coupon'}
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ==================== MODAL: ADD / EDIT BANNER ==================== */}
      <ModalDialog
        open={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        labelledBy="banner-modal-title"
        maxWidthClass="max-w-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
          <h2 id="banner-modal-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
            {editingBannerId ? 'Edit Banner' : 'Add Storefront Banner'}
          </h2>
          <button
            type="button"
            onClick={() => setBannerModalOpen(false)}
            aria-label="Close banner dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form onSubmit={handleSaveBanner} className="dorasani-form space-y-4 text-xs">
          {bannerFormError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              {bannerFormError}
            </div>
          )}

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Banner Placement</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANNER_TYPES.map((bt) => (
                <label
                  key={bt.value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${bannerForm.banner_type === bt.value
                    ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                    : 'border-[#D8C7B5] bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name="banner_type"
                    value={bt.value}
                    checked={bannerForm.banner_type === bt.value}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, banner_type: e.target.value })
                    }
                    className="accent-[#285A3C]"
                  />
                  <span>{bt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="banner-tagline" className="font-semibold text-[#1A3B2B] block">
                Tagline
              </label>
              <input
                id="banner-tagline"
                name="tagline"
                type="text"
                data-autofocus="true"
                autoFocus
                value={bannerForm.tagline}
                onChange={(e) => setBannerForm({ ...bannerForm, tagline: e.target.value })}
                placeholder="BRIDAL KANJIVARAM SILKS"
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="banner-order" className="font-semibold text-[#1A3B2B] block">
                Display Order
              </label>
              <input
                id="banner-order"
                name="display_order"
                type="number"
                value={bannerForm.display_order}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, display_order: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="banner-title1" className="font-semibold text-[#1A3B2B] block">
                Title Line 1 *
              </label>
              <input
                id="banner-title1"
                name="title_line_1"
                type="text"
                required
                value={bannerForm.title_line_1}
                onChange={(e) => setBannerForm({ ...bannerForm, title_line_1: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="banner-title2" className="font-semibold text-[#1A3B2B] block">
                Title Line 2
              </label>
              <input
                id="banner-title2"
                name="title_line_2"
                type="text"
                value={bannerForm.title_line_2}
                onChange={(e) => setBannerForm({ ...bannerForm, title_line_2: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="banner-desc" className="font-semibold text-[#1A3B2B] block">
              Description
            </label>
            <textarea
              id="banner-desc"
              name="description"
              rows={2}
              value={bannerForm.description}
              onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="banner-cta1-label" className="font-semibold text-[#1A3B2B] block">
                Primary CTA Label
              </label>
              <input
                id="banner-cta1-label"
                name="primary_cta_label"
                type="text"
                value={bannerForm.primary_cta_label}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, primary_cta_label: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="banner-cta1-link" className="font-semibold text-[#1A3B2B] block">
                Primary CTA Link
              </label>
              <input
                id="banner-cta1-link"
                name="primary_cta_link"
                type="text"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={bannerForm.primary_cta_link}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, primary_cta_link: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="banner-cta2-label" className="font-semibold text-[#1A3B2B] block">
                Secondary CTA Label
              </label>
              <input
                id="banner-cta2-label"
                name="secondary_cta_label"
                type="text"
                value={bannerForm.secondary_cta_label}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, secondary_cta_label: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="banner-cta2-link" className="font-semibold text-[#1A3B2B] block">
                Secondary CTA Link
              </label>
              <input
                id="banner-cta2-link"
                name="secondary_cta_link"
                type="text"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={bannerForm.secondary_cta_link}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, secondary_cta_link: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="banner-img-desktop" className="font-semibold text-[#1A3B2B] block">
                  Desktop Image URL *
                </label>
                <label
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#285A3C] bg-[#D0E9C0]/40 text-[10px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0] cursor-pointer transition-colors ${
                    uploadingTarget === 'banner-desktop' ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>
                    {uploadingTarget === 'banner-desktop' ? 'Uploading...' : 'Upload Desktop'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploadingTarget === 'banner-desktop'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleUploadSingleImage(
                        file,
                        'homepage-banners',
                        'desktop',
                        'banner-desktop',
                        (url) =>
                          setBannerForm((prev) => ({
                            ...prev,
                            desktop_image_url: url,
                            mobile_image_url: prev.mobile_image_url || url,
                          }))
                      );
                    }}
                  />
                </label>
              </div>
              <input
                id="banner-img-desktop"
                name="desktop_image_url"
                type="text"
                required
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={bannerForm.desktop_image_url}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, desktop_image_url: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="banner-img-mobile" className="font-semibold text-[#1A3B2B] block">
                  Mobile Image URL *
                </label>
                <label
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#285A3C] bg-[#D0E9C0]/40 text-[10px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0] cursor-pointer transition-colors ${
                    uploadingTarget === 'banner-mobile' ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>
                    {uploadingTarget === 'banner-mobile' ? 'Uploading...' : 'Upload Mobile'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploadingTarget === 'banner-mobile'}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleUploadSingleImage(
                        file,
                        'homepage-banners',
                        'mobile',
                        'banner-mobile',
                        (url) =>
                          setBannerForm((prev) => ({
                            ...prev,
                            mobile_image_url: url,
                          }))
                      );
                    }}
                  />
                </label>
              </div>
              <input
                id="banner-img-mobile"
                name="mobile_image_url"
                type="text"
                required
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={bannerForm.mobile_image_url}
                onChange={(e) =>
                  setBannerForm({ ...bannerForm, mobile_image_url: e.target.value })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white font-mono focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bannerForm.is_active}
              onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
              className="accent-[#285A3C]"
            />
            <span className="font-semibold text-[#1A3B2B]">Publish Banner on Storefront</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setBannerModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingBanner}
              className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60"
            >
              {savingBanner
                ? 'Saving...'
                : editingBannerId
                  ? 'Update Banner'
                  : 'Create Banner'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ==================== MODAL: DELETE BANNER ==================== */}
      <ModalDialog
        open={Boolean(deleteBannerTarget)}
        onClose={() => setDeleteBannerTarget(null)}
        labelledBy="delete-banner-title"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-banner-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                Delete Banner?
              </h2>
              <p className="text-xs text-[#647268] mt-1">
                Delete banner{' '}
                <strong className="text-[#1A3B2B]">{deleteBannerTarget?.title_line_1}</strong>?
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E8DCCF] text-xs">
            <button
              type="button"
              data-autofocus="true"
              autoFocus
              onClick={() => setDeleteBannerTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingBanner}
              onClick={() => void handleConfirmDeleteBanner()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              {deletingBanner ? 'Deleting...' : 'Delete Banner'}
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ==================== MODAL: ORDER DETAILS ==================== */}
      <ModalDialog
        open={Boolean(orderDetailsTarget)}
        onClose={() => setOrderDetailsTarget(null)}
        labelledBy="order-details-title"
        maxWidthClass="max-w-2xl"
      >
        {orderDetailsTarget && (() => {
          const ord = orderDetailsTarget;
          const addr =
            typeof ord.shipping_address === 'object' && ord.shipping_address !== null
              ? ord.shipping_address
              : null;
          const itemsList: any[] = Array.isArray(ord.order_items) ? ord.order_items : [];
          const paymentsList: any[] = Array.isArray(ord.payments)
            ? ord.payments
            : ord.payments
            ? [ord.payments]
            : [];

          return (
            <div className="space-y-5 text-xs">
              <div className="flex items-start justify-between gap-3 border-b border-[#D8C7B5] pb-3">
                <div>
                  <h2 id="order-details-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                    Order #{ord.order_number}
                  </h2>
                  <p className="text-[11px] text-[#647268] mt-0.5">
                    Placed on{' '}
                    {ord.created_at
                      ? new Date(ord.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>
                <button
                  type="button"
                  data-autofocus="true"
                  autoFocus
                  onClick={() => setOrderDetailsTarget(null)}
                  aria-label="Close order details dialog"
                  className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
                >
                  <X className="w-5 h-5 text-[#647268]" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                    Customer & Shipping Address
                  </span>
                  <p className="font-bold text-[#1A3B2B]">{ord.customer_name}</p>
                  <p className="font-mono text-[11px] text-[#4F6355]">{ord.customer_email}</p>
                  <p className="text-[#4F6355]">{ord.customer_phone}</p>
                  {addr ? (
                    <div className="pt-1 text-[11px] text-[#4F6355] leading-relaxed border-t border-[#E8DCCF]/80">
                      {addr.fullName || addr.full_name ? (
                        <p className="font-semibold text-[#1A3B2B]">
                          {addr.fullName || addr.full_name}
                        </p>
                      ) : null}
                      <p>
                        {[
                          addr.streetAddress || addr.street_address,
                          addr.apartment,
                          addr.landmark ? `Near ${addr.landmark}` : '',
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p>
                        {[addr.city, addr.state, addr.pincode].filter(Boolean).join(' - ')}
                      </p>
                    </div>
                  ) : ord.shipping_address ? (
                    <p className="pt-1 text-[11px] text-[#4F6355] border-t border-[#E8DCCF]/80">
                      {String(ord.shipping_address)}
                    </p>
                  ) : null}
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                    Fulfillment & Payment Summary
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[#647268]">Order Status:</span>
                    <span className="font-bold uppercase text-[#1A3B2B]">
                      {String(ord.order_status || 'confirmed').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#647268]">Delivery Tier:</span>
                    <span className="font-semibold capitalize text-[#1A3B2B]">
                      {ord.delivery_option || 'standard'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#647268]">Payment:</span>
                    <span className="font-semibold uppercase text-[#1A3B2B]">
                      {ord.payment_method} ({String(ord.payment_status || 'pending').replace(/_/g, ' ')})
                    </span>
                  </div>
                  {(ord.courier_name || ord.tracking_id) && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#647268]">Dispatch:</span>
                      <span className="font-mono text-[11px] text-[#1A3B2B]">
                        {[ord.courier_name, ord.tracking_id].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                  )}
                  {ord.customer_notes && (
                    <div className="pt-1 border-t border-[#E8DCCF]/80 text-[11px] text-[#4F6355]">
                      <span className="font-semibold text-[#1A3B2B]">Customer Note: </span>
                      {ord.customer_notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                  Ordered Items ({itemsList.length})
                </span>
                {itemsList.length === 0 ? (
                  <p className="text-[11px] text-[#647268] italic">
                    No line item records linked to this order.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E8DCCF] border border-[#E8DCCF] rounded-xl overflow-hidden bg-white">
                    {itemsList.map((item, idx) => {
                      const variantObj =
                        typeof item.variant_details === 'object' && item.variant_details !== null
                          ? item.variant_details
                          : null;
                      const variantLabel = variantObj
                        ? [
                            variantObj.color_name || variantObj.color,
                            variantObj.size,
                            variantObj.variant_name,
                          ]
                            .filter(Boolean)
                            .join(' • ')
                        : item.variant_color || '';

                      return (
                        <div key={item.id || idx} className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.product_title}
                                className="w-10 h-12 object-cover rounded border border-[#D8C7B5] shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-[#1A3B2B] truncate">
                                {item.product_title}
                              </p>
                              <p className="text-[11px] text-[#647268]">
                                Qty: {item.quantity} × ₹
                                {Number(item.unit_price_inr || 0).toLocaleString('en-IN')}
                                {variantLabel ? ` • ${variantLabel}` : ''}
                                {item.product_sku ? ` • ${item.product_sku}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-[#1A3B2B] shrink-0">
                            ₹{Number(item.total_price_inr || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] space-y-1.5">
                <div className="flex justify-between text-[#4F6355]">
                  <span>Items Subtotal</span>
                  <span>₹{Number(ord.subtotal_inr || 0).toLocaleString('en-IN')}</span>
                </div>
                {Number(ord.discount_inr || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>
                      Coupon Discount{ord.coupon_code ? ` (${ord.coupon_code})` : ''}
                    </span>
                    <span>-₹{Number(ord.discount_inr).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#4F6355]">
                  <span>Shipping Fee</span>
                  <span>
                    {Number(ord.shipping_fee_inr || 0) === 0
                      ? 'FREE'
                      : `₹${Number(ord.shipping_fee_inr).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#D8C7B5] font-bold text-sm text-[#1A3B2B]">
                  <span>Total Charged</span>
                  <span className="text-[#285A3C]">
                    ₹{Number(ord.total_inr || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {(() => {
                const activeShip = getActiveShipmentFromOrder(ord);
                const latestShip = activeShip || getShipmentsFromOrder(ord)[0] || null;
                const waybill = activeShip?.tracking_number || ord.tracking_id || '';
                const scans: any[] = Array.isArray(latestShip?.history) ? latestShip.history : [];
                const canShip =
                  !waybill &&
                  !['cancelled', 'refunded', 'returned', 'delivered'].includes(
                    String(ord.order_status || '').toLowerCase()
                  );

                return (
                  <div className="p-3.5 rounded-xl bg-[#F3F8F1]/80 border border-[#BCD8AA] space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#285A3C] block">
                          Delhivery One Shipment &amp; Live Scans
                        </span>
                        {waybill ? (
                          <p className="font-mono font-bold text-[#1A3B2B] text-xs mt-0.5">
                            AWB: {waybill}
                            {latestShip?.shipping_mode ? ` • ${latestShip.shipping_mode}` : ''}
                            {latestShip?.cancelled_at ? ' (Cancelled)' : ''}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#4F6355] mt-0.5">
                            {latestShip?.cancelled_at
                              ? `Previous AWB ${latestShip.tracking_number} cancelled${
                                  latestShip.cancellation_reason
                                    ? ` (${latestShip.cancellation_reason})`
                                    : ''
                                }. Ready to re-manifest.`
                              : 'Not manifested with Delhivery One yet.'}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {waybill && (
                          <>
                            <button
                              type="button"
                              disabled={syncingOrderId === ord.id}
                              onClick={() => void handleSyncSingleOrderTracking(ord)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] disabled:opacity-60"
                            >
                              <RefreshCw
                                className={`w-3 h-3 text-[#285A3C] ${
                                  syncingOrderId === ord.id ? 'animate-spin' : ''
                                }`}
                              />
                              <span>Sync Scans</span>
                            </button>
                            <button
                              type="button"
                              disabled={loadingLabelOrderId === ord.id}
                              onClick={() => void handleOpenDelhiveryLabel(ord, waybill)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE] disabled:opacity-60"
                            >
                              <Printer className="w-3 h-3 text-[#285A3C]" />
                              <span>View Label</span>
                            </button>
                            <Link
                              to={`/track-order?awb=${encodeURIComponent(waybill)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#D8C7B5] text-[11px] font-semibold text-[#285A3C] hover:bg-[#FAF5EE]"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Track</span>
                            </Link>
                          </>
                        )}
                        {canShip && (
                          <button
                            type="button"
                            onClick={() => {
                              const target = ord;
                              setOrderDetailsTarget(null);
                              openDelhiveryManifestModal(target);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#285A3C] text-white text-[11px] font-semibold hover:bg-[#1E432D]"
                          >
                            <Box className="w-3 h-3" />
                            <span>Ship via Delhivery One</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {latestShip && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#4F6355] pt-1 border-t border-[#BCD8AA]/60">
                        <div>
                          <span className="font-semibold text-[#1A3B2B]">Current Scan: </span>
                          {latestShip.current_status || 'Manifested'}
                          {latestShip.current_location ? ` (${latestShip.current_location})` : ''}
                        </div>
                        <div>
                          <span className="font-semibold text-[#1A3B2B]">Pickup Warehouse: </span>
                          {latestShip.pickup_location || settingsForm.delhiveryPickupLocation}
                        </div>
                        {latestShip.pickup_scheduled_date && (
                          <div>
                            <span className="font-semibold text-[#1A3B2B]">Pickup Scheduled: </span>
                            {latestShip.pickup_scheduled_date}
                            {latestShip.pickup_scheduled_time
                              ? ` @ ${latestShip.pickup_scheduled_time}`
                              : ''}
                          </div>
                        )}
                        {latestShip.estimated_delivery && (
                          <div>
                            <span className="font-semibold text-[#1A3B2B]">Est. Delivery: </span>
                            {new Date(latestShip.estimated_delivery).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {scans.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-[#BCD8AA]/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                          Latest Delhivery Scan Events ({Math.min(5, scans.length)} of {scans.length})
                        </span>
                        <div className="space-y-1">
                          {scans.slice(0, 5).map((sc: any, idx: number) => {
                            const scanLabel = sc?.scan || sc?.Scan || sc?.status || 'Update';
                            const scanLocation = sc?.location || sc?.ScannedLocation || '';
                            const scanInstructions = sc?.instructions || sc?.Instructions || '';
                            const rawTime = sc?.dateTime || sc?.ScanDateTime || sc?.timestamp || '';
                            const parsedTime = rawTime ? new Date(rawTime) : null;
                            const displayTime =
                              sc?.formattedTime ||
                              (parsedTime && !Number.isNaN(parsedTime.getTime())
                                ? parsedTime.toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : rawTime || '—');

                            return (
                              <div
                                key={`${rawTime}-${scanLabel}-${idx}`}
                                className="p-2 rounded-lg bg-white border border-[#E8DCCF] flex flex-wrap items-center justify-between gap-2 text-[11px]"
                              >
                                <div className="min-w-0">
                                  <span className="font-semibold text-[#1A3B2B]">
                                    {scanLabel}
                                  </span>
                                  {scanLocation && (
                                    <span className="text-[#4F6355]"> • {scanLocation}</span>
                                  )}
                                  {scanInstructions && (
                                    <p className="text-[10px] text-[#647268]">{scanInstructions}</p>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-[#647268] shrink-0">
                                  {displayTime}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {paymentsList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                    Payment Transactions ({paymentsList.length})
                  </span>
                  <div className="space-y-2">
                    {paymentsList.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="p-2.5 rounded-lg border border-[#E8DCCF] bg-white flex flex-wrap items-center justify-between gap-2 text-[11px]"
                      >
                        <div>
                          <span className="font-bold uppercase text-[#1A3B2B]">{p.provider}</span>
                          <span className="mx-1.5 text-[#8E9B92]">•</span>
                          <span className="uppercase font-semibold text-[#285A3C]">{p.status}</span>
                          {p.provider_payment_id && (
                            <p className="font-mono text-[10px] text-[#647268]">
                              Payment ID: {p.provider_payment_id}
                            </p>
                          )}
                          {p.provider_order_id && (
                            <p className="font-mono text-[10px] text-[#647268]">
                              Provider Order: {p.provider_order_id}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-[#1A3B2B]">
                          ₹{Number(p.amount_inr || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-[#D8C7B5]">
                <button
                  type="button"
                  onClick={() => setOrderDetailsTarget(null)}
                  className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = ord;
                    setOrderDetailsTarget(null);
                    openEditOrderModal(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D]"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Edit Fulfillment</span>
                </button>
              </div>
            </div>
          );
        })()}
      </ModalDialog>

      {/* ==================== MODAL: DELETE ORDER ==================== */}
      <ModalDialog
        open={Boolean(deleteOrderTarget)}
        onClose={() => setDeleteOrderTarget(null)}
        labelledBy="delete-order-title"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-order-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                Delete Order Permanently?
              </h2>
              <p className="text-xs text-[#647268] mt-1 leading-relaxed">
                This will permanently remove order{' '}
                <strong className="font-mono text-[#1A3B2B]">
                  #{deleteOrderTarget?.order_number}
                </strong>{' '}
                for <strong className="text-[#1A3B2B]">{deleteOrderTarget?.customer_name}</strong>{' '}
                (₹{Number(deleteOrderTarget?.total_inr || 0).toLocaleString('en-IN')}) along with its
                linked line items, payment rows, and coupon redemption record. Product stock is not
                automatically restocked.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E8DCCF] text-xs">
            <button
              type="button"
              data-autofocus="true"
              autoFocus
              onClick={() => setDeleteOrderTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingOrder}
              onClick={() => void handleConfirmDeleteOrder()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              {deletingOrder ? 'Deleting...' : 'Delete Order'}
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ==================== MODAL: CUSTOMER ACTIVITY LOGS ==================== */}
      <ModalDialog
        open={Boolean(activityUserTarget)}
        onClose={() => setActivityUserTarget(null)}
        labelledBy="activity-logs-title"
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start justify-between gap-3 border-b border-[#D8C7B5] pb-3">
            <div>
              <h2 id="activity-logs-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                Customer Activity Logs
              </h2>
              <p className="text-[11px] text-[#647268] mt-0.5">
                {activityUserTarget?.full_name || 'DORASANI Member'} •{' '}
                <span className="font-mono">{activityUserTarget?.email || '—'}</span>
              </p>
            </div>
            <button
              type="button"
              data-autofocus="true"
              autoFocus
              onClick={() => setActivityUserTarget(null)}
              aria-label="Close activity logs dialog"
              className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
            >
              <X className="w-5 h-5 text-[#647268]" />
            </button>
          </div>

          {loadingActivity ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-7 h-7 border-[3px] border-[#285A3C] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[#647268]">Loading recorded customer events...</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <p className="py-10 text-center text-[#647268]">
              No activity events recorded for this account yet.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {activityLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-[#E8DCCF] bg-[#FAF5EE] space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#D0E9C0] text-[#1A3B2B] text-[10px] font-bold uppercase tracking-wider">
                      {String(log.activity_type || log.action_type || 'event').replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-[#647268]">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>
                  {log.metadata &&
                    typeof log.metadata === 'object' &&
                    Object.keys(log.metadata).length > 0 && (
                      <pre className="text-[10px] font-mono bg-white p-2 rounded border border-[#E8DCCF] overflow-x-auto text-[#4F6355]">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setActivityUserTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Close
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ==================== MODAL: VIEW CONTACT INQUIRY ==================== */}
      <ModalDialog
        open={Boolean(contactViewTarget)}
        onClose={() => setContactViewTarget(null)}
        labelledBy="contact-view-title"
        maxWidthClass="max-w-lg"
      >
        {contactViewTarget && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between gap-3 border-b border-[#D8C7B5] pb-3">
              <div>
                <h2 id="contact-view-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                  {contactViewTarget.subject || 'Customer Contact Inquiry'}
                </h2>
                <p className="text-[11px] text-[#647268] mt-0.5">
                  Received{' '}
                  {contactViewTarget.created_at
                    ? new Date(contactViewTarget.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </p>
              </div>
              <button
                type="button"
                data-autofocus="true"
                autoFocus
                onClick={() => setContactViewTarget(null)}
                aria-label="Close inquiry dialog"
                className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
              >
                <X className="w-5 h-5 text-[#647268]" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] space-y-1">
              <p className="font-bold text-[#1A3B2B]">
                {contactViewTarget.full_name || contactViewTarget.name || 'Customer'}
              </p>
              <a
                href={`mailto:${contactViewTarget.email}`}
                className="font-mono text-[11px] text-[#285A3C] hover:underline block"
              >
                {contactViewTarget.email}
              </a>
              {contactViewTarget.phone && (
                <p className="text-[11px] text-[#4F6355]">{contactViewTarget.phone}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-[#1A3B2B] block">Message</span>
              <div className="p-3.5 rounded-xl border border-[#D8C7B5] bg-white text-[#3A443D] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {contactViewTarget.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D8C7B5]">
              <div className="flex items-center gap-2">
                <label htmlFor="contact-view-status" className="font-semibold text-[#1A3B2B]">
                  Status:
                </label>
                <select
                  id="contact-view-status"
                  value={contactViewTarget.status || 'new'}
                  onChange={(e) =>
                    void handleUpdateContactStatus(
                      contactViewTarget.id,
                      e.target.value as 'new' | 'read' | 'responded'
                    )
                  }
                  className="text-xs font-semibold border border-[#BCD8AA] bg-[#FAF5EE] rounded-lg px-2.5 py-1.5 text-[#1A3B2B]"
                >
                  {MESSAGE_STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleDeleteContactMessage(contactViewTarget.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContactViewTarget(null)}
                  className="px-4 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalDialog>

      {/* ==================== MODAL: ADD / EDIT SERVICE BENEFIT ==================== */}
      <ModalDialog
        open={benefitModalOpen}
        onClose={() => setBenefitModalOpen(false)}
        labelledBy="benefit-modal-title"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
          <h2 id="benefit-modal-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
            {editingBenefitId ? 'Edit Service Benefit' : 'Add Service Benefit'}
          </h2>
          <button
            type="button"
            onClick={() => setBenefitModalOpen(false)}
            aria-label="Close service benefit dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form method="POST" onSubmit={handleSaveBenefit} className="dorasani-form space-y-4 text-xs">
          {benefitFormError && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800"
            >
              {benefitFormError}
            </div>
          )}

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Display Icon</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BENEFIT_ICONS.map((ic) => (
                <label
                  key={ic.value}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${
                    benefitForm.icon_name === ic.value
                      ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                      : 'border-[#D8C7B5] bg-white hover:bg-[#FAF5EE]'
                  }`}
                >
                  <input
                    type="radio"
                    name="benefit_icon"
                    value={ic.value}
                    checked={benefitForm.icon_name === ic.value}
                    onChange={(e) => setBenefitForm({ ...benefitForm, icon_name: e.target.value })}
                    className="accent-[#285A3C]"
                  />
                  <span className="shrink-0">{renderBenefitIcon(ic.value)}</span>
                  <span>{ic.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1">
            <label htmlFor="benefit-title" className="font-semibold text-[#1A3B2B] block">
              Title *
            </label>
            <input
              id="benefit-title"
              name="title"
              type="text"
              required
              data-autofocus="true"
              autoFocus
              value={benefitForm.title}
              onChange={(e) => setBenefitForm({ ...benefitForm, title: e.target.value })}
              placeholder="e.g. Authentic Silk Mark Certified"
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="benefit-desc" className="font-semibold text-[#1A3B2B] block">
              Description *
            </label>
            <textarea
              id="benefit-desc"
              name="description"
              rows={3}
              required
              value={benefitForm.description}
              onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })}
              placeholder="Short trust promise shown on the storefront..."
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label htmlFor="benefit-order" className="font-semibold text-[#1A3B2B] block">
                Display Order
              </label>
              <input
                id="benefit-order"
                name="display_order"
                type="number"
                min={0}
                value={benefitForm.display_order ?? 1}
                onChange={(e) =>
                  setBenefitForm({ ...benefitForm, display_order: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer pt-3 sm:pt-5">
              <input
                type="checkbox"
                name="is_active"
                checked={benefitForm.is_active ?? true}
                onChange={(e) => setBenefitForm({ ...benefitForm, is_active: e.target.checked })}
                className="accent-[#285A3C]"
              />
              <span className="font-semibold text-[#1A3B2B]">Show on Storefront</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setBenefitModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingBenefit}
              className="px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60"
            >
              {savingBenefit
                ? 'Saving...'
                : editingBenefitId
                  ? 'Update Benefit'
                  : 'Create Benefit'}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ==================== MODAL: DELETE SERVICE BENEFIT ==================== */}
      <ModalDialog
        open={Boolean(deleteBenefitTarget)}
        onClose={() => setDeleteBenefitTarget(null)}
        labelledBy="delete-benefit-title"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="delete-benefit-title" className="font-golden text-lg font-bold text-[#1A3B2B]">
                Delete Service Benefit?
              </h2>
              <p className="text-xs text-[#647268] mt-1">
                Delete service benefit{' '}
                <strong className="text-[#1A3B2B]">{deleteBenefitTarget?.title}</strong> from the
                storefront?
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E8DCCF] text-xs">
            <button
              type="button"
              data-autofocus="true"
              autoFocus
              onClick={() => setDeleteBenefitTarget(null)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deletingBenefit}
              onClick={() => void handleConfirmDeleteBenefit()}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              {deletingBenefit ? 'Deleting...' : 'Delete Benefit'}
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ==================== MODAL: SHIP VIA DELHIVERY ONE ==================== */}
      <ModalDialog
        open={Boolean(delhiveryManifestTarget)}
        onClose={() => setDelhiveryManifestTarget(null)}
        labelledBy="delhivery-manifest-title"
        maxWidthClass="max-w-xl"
      >
        {delhiveryManifestTarget && (() => {
          const addr =
            typeof delhiveryManifestTarget.shipping_address === 'object' &&
            delhiveryManifestTarget.shipping_address !== null
              ? delhiveryManifestTarget.shipping_address
              : null;
          const destPin = String(addr?.pincode || '').trim();
          const isCod =
            String(delhiveryManifestTarget.payment_method || '').toLowerCase() === 'cod';

          return (
            <>
              <div className="flex items-center justify-between border-b border-[#D8C7B5] pb-3">
                <div>
                  <h2
                    id="delhivery-manifest-title"
                    className="font-golden text-lg font-bold text-[#1A3B2B]"
                  >
                    Ship via Delhivery One
                  </h2>
                  <p className="text-xs text-[#647268]">
                    Order #{delhiveryManifestTarget.order_number} •{' '}
                    {delhiveryManifestTarget.customer_name}
                    {destPin ? ` • PIN ${destPin}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDelhiveryManifestTarget(null)}
                  aria-label="Close Delhivery manifest dialog"
                  className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
                >
                  <X className="w-5 h-5 text-[#647268]" />
                </button>
              </div>

              <form
                onSubmit={handleManifestOrderWithDelhivery}
                aria-labelledby="delhivery-manifest-title"
                className="dorasani-form space-y-4 text-xs"
              >
                {manifestError && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800"
                  >
                    {manifestError}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div>
                    <span className="font-semibold text-[#1A3B2B]">Destination: </span>
                    <span className="text-[#4F6355]">
                      {[addr?.city, addr?.state, destPin].filter(Boolean).join(', ') || 'See order'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                        isCod ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isCod
                        ? `COD ₹${Number(delhiveryManifestTarget.total_inr || 0).toLocaleString('en-IN')}`
                        : 'Prepaid'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="dlv-manifest-warehouse"
                    className="font-semibold text-[#1A3B2B] block"
                  >
                    Pickup Warehouse Name *
                  </label>
                  <input
                    id="dlv-manifest-warehouse"
                    name="pickupLocation"
                    type="text"
                    required
                    data-autofocus="true"
                    autoFocus
                    aria-describedby="dlv-manifest-warehouse-hint"
                    value={delhiveryManifestForm.pickupLocation}
                    onChange={(e) =>
                      setDelhiveryManifestForm({
                        ...delhiveryManifestForm,
                        pickupLocation: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                  />
                  <span
                    id="dlv-manifest-warehouse-hint"
                    className="text-[10px] text-[#647268] block"
                  >
                    Exact registered Delhivery One client warehouse (e.g.{' '}
                    {DEFAULT_SITE_SETTINGS.delhiveryPickupLocation}).
                  </span>
                </div>

                <fieldset className="space-y-1.5">
                  <legend className="font-semibold text-[#1A3B2B]">Shipping Mode *</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        value: 'Express' as const,
                        label: 'Express Air',
                        desc: 'Faster air/priority delivery (recommended for silk orders)',
                      },
                      {
                        value: 'Surface' as const,
                        label: 'Surface Standard',
                        desc: 'Economical surface transport for multi-piece parcels',
                      },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer ${
                          delhiveryManifestForm.shippingMode === opt.value
                            ? 'border-[#285A3C] bg-[#F3F8F1]'
                            : 'border-[#D8C7B5] bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMode"
                          value={opt.value}
                          checked={delhiveryManifestForm.shippingMode === opt.value}
                          onChange={() =>
                            setDelhiveryManifestForm({
                              ...delhiveryManifestForm,
                              shippingMode: opt.value,
                            })
                          }
                          className="mt-0.5 accent-[#285A3C]"
                        />
                        <div>
                          <span className="font-semibold text-[#1A3B2B] block">{opt.label}</span>
                          <span className="text-[10px] text-[#647268] block">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="dlv-manifest-weight"
                      className="font-semibold text-[#1A3B2B] block"
                    >
                      Weight (g) *
                    </label>
                    <input
                      id="dlv-manifest-weight"
                      name="weightGrams"
                      type="number"
                      required
                      min={50}
                      step={50}
                      value={delhiveryManifestForm.weightGrams}
                      onChange={(e) =>
                        setDelhiveryManifestForm({
                          ...delhiveryManifestForm,
                          weightGrams: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="dlv-manifest-len"
                      className="font-semibold text-[#1A3B2B] block"
                    >
                      Length (cm)
                    </label>
                    <input
                      id="dlv-manifest-len"
                      name="length"
                      type="number"
                      min={1}
                      value={delhiveryManifestForm.length}
                      onChange={(e) =>
                        setDelhiveryManifestForm({
                          ...delhiveryManifestForm,
                          length: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="dlv-manifest-wid"
                      className="font-semibold text-[#1A3B2B] block"
                    >
                      Breadth (cm)
                    </label>
                    <input
                      id="dlv-manifest-wid"
                      name="breadth"
                      type="number"
                      min={1}
                      value={delhiveryManifestForm.breadth}
                      onChange={(e) =>
                        setDelhiveryManifestForm({
                          ...delhiveryManifestForm,
                          breadth: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="dlv-manifest-hgt"
                      className="font-semibold text-[#1A3B2B] block"
                    >
                      Height (cm)
                    </label>
                    <input
                      id="dlv-manifest-hgt"
                      name="height"
                      type="number"
                      min={1}
                      value={delhiveryManifestForm.height}
                      onChange={(e) =>
                        setDelhiveryManifestForm({
                          ...delhiveryManifestForm,
                          height: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={loadingManifestRates}
                    onClick={() => void handleCalculateManifestRates()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#BCD8AA] bg-[#F3F8F1] text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#D0E9C0]/60 disabled:opacity-60"
                  >
                    {loadingManifestRates ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#285A3C]" />
                    ) : (
                      <DollarSign className="w-3.5 h-3.5 text-[#285A3C]" />
                    )}
                    <span>
                      {loadingManifestRates ? 'Calculating...' : 'Calculate Estimated Freight'}
                    </span>
                  </button>
                  <span className="text-[10px] text-[#647268]">
                    Live quote from {settingsForm.delhiveryOriginPincode} to{' '}
                    {destPin || 'destination'}
                  </span>
                </div>

                {delhiveryManifestRates && (
                  <div
                    role="status"
                    className="p-3 rounded-xl bg-[#FAF5EE] border border-[#D8C7B5] space-y-2 text-[11px]"
                  >
                    {delhiveryManifestRates.serviceability && (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[#1A3B2B]">
                          PIN {delhiveryManifestRates.destinationPincode}:{' '}
                          {delhiveryManifestRates.serviceability.serviceable
                            ? 'Serviceable'
                            : 'Not Serviceable'}
                          {delhiveryManifestRates.serviceability.city
                            ? ` (${delhiveryManifestRates.serviceability.city})`
                            : ''}
                        </span>
                        <span className="text-[#4F6355]">
                          {delhiveryManifestRates.serviceability.cod ? 'COD OK' : 'Prepaid Only'}
                          {delhiveryManifestRates.serviceability.expressEstimatedWindow
                            ? ` • Express ${delhiveryManifestRates.serviceability.expressEstimatedWindow}`
                            : delhiveryManifestRates.serviceability.expressTatDays
                              ? ` • Express ${delhiveryManifestRates.serviceability.expressTatDays}d`
                              : ''}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-white border border-[#E8DCCF]">
                        <span className="font-semibold text-[#1A3B2B] block">Express Estimate</span>
                        {delhiveryManifestRates.express?.error ? (
                          <span className="text-rose-700">
                            {delhiveryManifestRates.express.error}
                          </span>
                        ) : (
                          <span className="font-bold text-[#285A3C]">
                            ₹
                            {Number(
                              delhiveryManifestRates.express?.totalAmountInr || 0
                            ).toLocaleString('en-IN')}{' '}
                            {delhiveryManifestRates.express?.zone
                              ? `(Zone ${delhiveryManifestRates.express.zone})`
                              : ''}
                          </span>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-[#E8DCCF]">
                        <span className="font-semibold text-[#1A3B2B] block">Surface Estimate</span>
                        {delhiveryManifestRates.surface?.error ? (
                          <span className="text-rose-700">
                            {delhiveryManifestRates.surface.error}
                          </span>
                        ) : (
                          <span className="font-bold text-[#285A3C]">
                            ₹
                            {Number(
                              delhiveryManifestRates.surface?.totalAmountInr || 0
                            ).toLocaleString('en-IN')}{' '}
                            {delhiveryManifestRates.surface?.zone
                              ? `(Zone ${delhiveryManifestRates.surface.zone})`
                              : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
                  <button
                    type="button"
                    onClick={() => setDelhiveryManifestTarget(null)}
                    className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={manifestingOrder}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
                  >
                    {manifestingOrder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {manifestingOrder ? 'Generating AWB...' : 'Manifest & Generate AWB'}
                    </span>
                  </button>
                </div>
              </form>
            </>
          );
        })()}
      </ModalDialog>

      {/* ==================== MODAL: DELHIVERY SHIPPING LABEL / PACKING SLIP ==================== */}
      <ModalDialog
        open={Boolean(delhiveryLabelTarget)}
        onClose={() => setDelhiveryLabelTarget(null)}
        labelledBy="delhivery-label-title"
        maxWidthClass="max-w-2xl"
        dialogClassName="delhivery-label-dialog"
      >
        {delhiveryLabelTarget && (() => {
          const { order: ord, label } = delhiveryLabelTarget;
          const pkg = label.packageData || {};
          const addr =
            typeof ord.shipping_address === 'object' && ord.shipping_address !== null
              ? ord.shipping_address
              : null;
          const itemsList: any[] = Array.isArray(ord.order_items) ? ord.order_items : [];
          const isCod =
            String(pkg.pt || ord.payment_method || '').toLowerCase() === 'cod';
          const codAmount = pkg.cod ?? (isCod ? Number(ord.total_inr || 0) : 0);

          return (
            <div className="space-y-4 text-xs">
              <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-[#D8C7B5] pb-3">
                <div>
                  <h2
                    id="delhivery-label-title"
                    className="font-golden text-lg font-bold text-[#1A3B2B]"
                  >
                    Delhivery Shipping Label &amp; Packing Slip
                  </h2>
                  <p className="text-[11px] text-[#647268]">
                    Order #{ord.order_number} • AWB {label.waybill}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {label.pdfUrl && (
                    <a
                      href={label.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D8C7B5] bg-white text-[11px] font-semibold text-[#1A3B2B] hover:bg-[#FAF5EE]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#285A3C]" />
                      <span>Official PDF</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handlePrintDelhiverySlip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#285A3C] text-white text-[11px] font-semibold hover:bg-[#1E432D]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Slip</span>
                  </button>
                  <button
                    type="button"
                    data-autofocus="true"
                    autoFocus
                    onClick={() => setDelhiveryLabelTarget(null)}
                    aria-label="Close shipping label dialog"
                    className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
                  >
                    <X className="w-5 h-5 text-[#647268]" />
                  </button>
                </div>
              </div>

              <div className="delhivery-printable-slip p-5 rounded-xl border-2 border-[#1A3B2B] bg-white space-y-4 text-[#111827]">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D8C7B5] pb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#285A3C]">
                      DORASANI HANDLOOMS • COURIER PARTNER
                    </p>
                    <p className="font-golden text-xl font-bold tracking-wide text-[#1A3B2B]">
                      DELHIVERY ONE
                    </p>
                    {label.warehouse && (
                      <p className="text-[11px] text-[#4F6355] mt-1">
                        Origin: {label.warehouse.name} ({label.warehouse.cityStatePin})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded border border-[#1A3B2B] font-mono text-sm font-bold tracking-wider">
                      AWB: {label.waybill}
                    </span>
                    {label.sortCode && (
                      <p className="mt-1 font-mono text-xs font-bold text-[#285A3C]">
                        SORT CODE: {label.sortCode}
                      </p>
                    )}
                  </div>
                </div>

                {label.barcode && (
                  <div className="flex justify-center py-2 border-b border-[#E8DCCF]">
                    <img
                      src={label.barcode}
                      alt={`AWB Barcode ${label.waybill}`}
                      className="max-h-16 object-contain"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#FAF5EE] border border-[#E8DCCF] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                      Deliver To
                    </span>
                    <p className="font-bold text-sm text-[#111827]">
                      {pkg.name || addr?.fullName || ord.customer_name}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      {pkg.address ||
                        [
                          addr?.streetAddress || addr?.street_address,
                          addr?.apartment,
                          addr?.landmark,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                    </p>
                    <p className="font-semibold text-[11px]">
                      {pkg.destination ||
                        [addr?.city, addr?.state, pkg.pin || addr?.pincode]
                          .filter(Boolean)
                          .join(' - ')}
                    </p>
                    <p className="font-mono text-[11px]">
                      Phone: {pkg.ph || ord.customer_phone}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FAF5EE] border border-[#E8DCCF] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                      Shipment &amp; Payment Details
                    </span>
                    <div className="flex justify-between">
                      <span>Order Ref:</span>
                      <strong className="font-mono">{pkg.oid || ord.order_number}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Mode:</span>
                      <strong className="uppercase">{isCod ? 'COD' : 'Prepaid'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Collectible Amount:</span>
                      <strong>
                        {isCod
                          ? `₹${Number(codAmount || 0).toLocaleString('en-IN')}`
                          : '₹0 (Prepaid)'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Invoice Value:</span>
                      <strong>
                        ₹{Number(pkg.rs || ord.total_inr || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    {label.sellerGst && (
                      <div className="flex justify-between">
                        <span>Seller GSTIN:</span>
                        <span className="font-mono">{label.sellerGst}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#647268] block">
                    Package Contents ({itemsList.length})
                  </span>
                  <div className="border border-[#D8C7B5] rounded-lg overflow-hidden">
                    {itemsList.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="px-3 py-2 flex items-center justify-between gap-2 border-b last:border-b-0 border-[#E8DCCF] text-[11px]"
                      >
                        <span className="font-medium truncate">
                          {item.product_title}
                          {item.product_sku ? ` (${item.product_sku})` : ''} × {item.quantity}
            >
              Schedule Delhivery Courier Pickup
            </h2>
            <p className="text-xs text-[#647268]">
              Request a pickup executive for manifested parcels at your studio
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickupModalOpen(false)}
            aria-label="Close pickup scheduler dialog"
            className="p-1.5 rounded-full hover:bg-[#FAF5EE]"
          >
            <X className="w-5 h-5 text-[#647268]" />
          </button>
        </div>

        <form
          onSubmit={handleScheduleDelhiveryPickup}
          aria-labelledby="delhivery-pickup-title"
          className="dorasani-form space-y-4 text-xs"
        >
          {pickupError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800"
            >
              {pickupError}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="dlv-pickup-loc" className="font-semibold text-[#1A3B2B] block">
              Pickup Warehouse Name *
            </label>
            <input
              id="dlv-pickup-loc"
              name="pickupLocation"
              type="text"
              required
              data-autofocus="true"
              autoFocus
              value={pickupForm.pickupLocation}
              onChange={(e) => setPickupForm({ ...pickupForm, pickupLocation: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="dlv-pickup-date" className="font-semibold text-[#1A3B2B] block">
                Pickup Date (Mon–Sat) *
              </label>
              <input
                id="dlv-pickup-date"
                name="pickupDate"
                type="date"
                required
                value={pickupForm.pickupDate}
                onChange={(e) => setPickupForm({ ...pickupForm, pickupDate: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="dlv-pickup-count" className="font-semibold text-[#1A3B2B] block">
                Expected Package Count *
              </label>
              <input
                id="dlv-pickup-count"
                name="expectedPackageCount"
                type="number"
                required
                min={1}
                value={pickupForm.expectedPackageCount}
                onChange={(e) =>
                  setPickupForm({
                    ...pickupForm,
                    expectedPackageCount: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Pickup Time Window *</legend>
            <div className="space-y-2">
              {[
                { value: '10:00:00', label: 'Morning Slot (10:00 AM – 1:00 PM)' },
                { value: '14:00:00', label: 'Afternoon Slot (2:00 PM – 6:00 PM) — Recommended' },
                { value: '16:00:00', label: 'Evening Slot (4:00 PM – 7:00 PM)' },
              ].map((slot) => (
                <label
                  key={slot.value}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer ${
                    pickupForm.pickupTime === slot.value
                      ? 'border-[#285A3C] bg-[#F3F8F1] font-semibold'
                      : 'border-[#D8C7B5] bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="pickupTime"
                    value={slot.value}
                    checked={pickupForm.pickupTime === slot.value}
                    onChange={(e) => setPickupForm({ ...pickupForm, pickupTime: e.target.value })}
                    className="accent-[#285A3C]"
                  />
                  <span>{slot.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#D8C7B5]">
            <button
              type="button"
              onClick={() => setPickupModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#D8C7B5] font-semibold hover:bg-[#FAF5EE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={schedulingPickup}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#285A3C] text-white font-semibold hover:bg-[#1E432D] disabled:opacity-60 shadow-xs"
            >
              {schedulingPickup && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{schedulingPickup ? 'Scheduling...' : 'Confirm Pickup Request'}</span>
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
};
