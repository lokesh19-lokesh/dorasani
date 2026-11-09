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
} from 'lucide-react';
import {
  adminService,
  type AdminProductInput,
  type AdminCategoryInput,
  type AdminCouponInput,
  type AdminBannerInput,
  type AdminServiceBenefitInput,
} from '../../services/adminService';
import { authService } from '../../services/authService';
import { useStore } from '../../context/StoreContext';
import {
  DEFAULT_SITE_SETTINGS,
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

const PRODUCT_TYPES = [
  { value: 'saree', label: 'Saree' },
  { value: 'lehenga', label: 'Lehenga' },
  { value: 'kurti', label: 'Kurti / Tunic' },
  { value: 'dress', label: 'Ethnic Dress' },
  { value: 'kids_wear', label: 'Kids Wear' },
  { value: 'fabric', label: 'Blouse / Fabric' },
];

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
  children: React.ReactNode;
}

const ModalDialog: React.FC<ModalDialogProps> = ({
  open,
  onClose,
  labelledBy,
  maxWidthClass = 'max-w-2xl',
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
      className={`p-0 bg-white rounded-2xl border border-[#D8C7B5] shadow-2xl w-full ${maxWidthClass} overflow-y-auto text-[#1A3B2B]`}
    >
      {open ? <div className="p-6 space-y-5">{children}</div> : null}
    </dialog>
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
  imagesText: '/assets/products/kanjivaram_silk_saree.jpg',
  description: '',
};

interface CategoryFormState {
  name: string;
  slug: string;
  parent_id: string;
  display_order: number;
  image_url: string;
  description: string;
  is_active: boolean;
}

const DEFAULT_CATEGORY_FORM: CategoryFormState = {
  name: '',
  slug: '',
  parent_id: '',
  display_order: 10,
  image_url: '',
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
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
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

  // Category Add/Edit & Delete Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(DEFAULT_CATEGORY_FORM);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

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
        adminService.getOrders(1, 250),
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
          instagramUrl: String(readVal('instagram_url', DEFAULT_SITE_SETTINGS.instagramUrl)),
          facebookUrl: String(readVal('facebook_url', DEFAULT_SITE_SETTINGS.facebookUrl)),
          youtubeUrl: String(readVal('youtube_url', DEFAULT_SITE_SETTINGS.youtubeUrl)),
          footerCopyright: String(readVal('footer_copyright', DEFAULT_SITE_SETTINGS.footerCopyright)),
        };

        setSettingsForm({
          ...nextSettings,
          announcementText: nextSettings.announcementItems.join('\n'),
        });
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

  // ==================== PRODUCT HANDLERS ====================
  const openCreateProductModal = () => {
    setEditingProductId(null);
    setProductSlugTouched(false);
    setProductFormError(null);
    setProductForm({
      ...DEFAULT_PRODUCT_FORM,
      category_id: categories[0]?.id || '',
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (p: any) => {
    const sortedUrls = (p.product_media || [])
      .slice()
      .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((m: any) => m.url)
      .filter(Boolean);

    setEditingProductId(p.id);
    setProductSlugTouched(true);
    setProductFormError(null);
    setProductForm({
      title: p.title || '',
      slug: p.slug || '',
      sku: p.sku || '',
      subtitle: p.subtitle || '',
      category_id: p.category_id || '',
      product_type: p.product_type || 'saree',
      price_inr: Number(p.price_inr ?? 0),
      mrp_inr: Number(p.mrp_inr ?? p.price_inr ?? 0),
      stock_quantity: Number(p.stock_quantity ?? 0),
      status: p.status || 'active',
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

    const payload: AdminProductInput = {
      title: cleanTitle,
      slug: cleanSlug,
      sku: productForm.sku.trim() || undefined,
      subtitle: productForm.subtitle.trim() || undefined,
      category_id: productForm.category_id || null,
      product_type: productForm.product_type || 'saree',
      price_inr: price,
      mrp_inr: mrp,
      stock_quantity: stock,
      status: productForm.status,
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

  const handleQuickProductStatus = async (productId: string, nextStatus: string) => {
    try {
      await adminService.updateProduct(productId, { status: nextStatus });
      showToast(`Product status updated to ${nextStatus.replace(/_/g, ' ')}.`);
      await loadData();
    } catch (err: any) {
      showToast('Failed to update status: ' + err.message, 'error');
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

  // ==================== CATEGORY HANDLERS ====================
  const openCreateCategoryModal = () => {
    setEditingCategoryId(null);
    setCategorySlugTouched(false);
    setCategoryFormError(null);
    setCategoryForm({
      ...DEFAULT_CATEGORY_FORM,
      display_order: (categories.length + 1) * 10,
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
      description: categoryForm.description.trim() || null,
      is_active: categoryForm.is_active,
    };

    setSavingCategory(true);
    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, payload);
        showToast(`Category "${cleanName}" updated.`);
      } else {
        await adminService.createCategory(payload);
        showToast(`Category "${cleanName}" created.`);
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

    if (!cleanStoreName || !cleanSupportEmail || !cleanConciergeEmail) {
      setSettingsFormError('Store name, support email, and concierge email are required.');
      return;
    }

    const threshold = Math.max(0, Math.round(Number(settingsForm.freeShippingThreshold || 0)));
    const standardFee = Math.max(0, Math.round(Number(settingsForm.standardShippingFee || 0)));
    const expressFee = Math.max(0, Math.round(Number(settingsForm.expressShippingFee || 0)));
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
        instagram_url: settingsForm.instagramUrl.trim() || 'https://instagram.com',
        facebook_url: settingsForm.facebookUrl.trim() || 'https://facebook.com',
        youtube_url: settingsForm.youtubeUrl.trim() || 'https://youtube.com',
        footer_copyright:
          settingsForm.footerCopyright.trim() || DEFAULT_SITE_SETTINGS.footerCopyright,
      });
      await Promise.all([refreshSiteSettings(), loadData()]);
      showToast('Storefront & shipping settings saved and applied live!');
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
        <div className="w-10 h-10 border-4 border-[#285A3C] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[#1A3B2B]">Verifying administrator privileges...</p>
      </div>
    );
  }

  // Guard UI: Not signed in or not an authorized DB admin
  if (!user || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center p-4 sm:p-8">
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
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      paymentsList.some(
        (p) =>
          p?.provider_payment_id?.toLowerCase().includes(q) ||
          p?.provider_order_id?.toLowerCase().includes(q)
      );
    const matchesStatus = orderStatusFilter === 'all' || o.order_status === orderStatusFilter;
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

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#1A3B2B] font-poppins pb-20">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-[#D8C7B5] px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0" title="DORASANI User Interface">
              <img
                src="/assets/logo.png"
                alt="DORASANI"
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
            { id: 'reports', label: 'Reports & Export', icon: FileDown },
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
                    <p className="text-[11px] text-[#285A3C] font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{metrics.totalOrders} total confirmed orders</span>
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
                      {metrics.outOfStockProducts > 0
                        ? `${metrics.outOfStockProducts} out of stock`
                        : 'All items in stock'}
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
                      {metrics.deliveredOrders} delivered successfully
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
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
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
                          {filteredProducts.map((p) => (
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
                              <td className="p-3">{p.categories?.name || p.product_type}</td>
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
                                <span
                                  className={`font-semibold ${p.stock_quantity < 5 ? 'text-rose-600' : 'text-[#1A3B2B]'
                                    }`}
                                >
                                  {p.stock_quantity} units
                                </span>
                              </td>
                              <td className="p-3">
                                <select
                                  aria-label={`Status for ${p.title}`}
                                  value={p.status || 'active'}
                                  onChange={(e) =>
                                    void handleQuickProductStatus(p.id, e.target.value)
                                  }
                                  className={`text-[11px] font-semibold rounded-lg px-2 py-1 border focus:outline-none ${p.status === 'active'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : p.status === 'out_of_stock'
                                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                                      : 'bg-amber-50 border-amber-200 text-amber-800'
                                    }`}
                                >
                                  {PRODUCT_STATUSES.map((st) => (
                                    <option key={st.value} value={st.value}>
                                      {st.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                  <Link
                                    to={`/product/${p.slug}`}
                                    target="_blank"
                                    className="p-1.5 rounded-md hover:bg-[#D0E9C0]/40 text-[#285A3C]"
                                    title="View on store"
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
                          ))}
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
                      placeholder="Search orders by #, customer, email, or Razorpay ID..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D8C7B5] bg-white text-xs focus:outline-none focus:border-[#285A3C]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      'all',
                      'confirmed',
                      'processing',
                      'packed',
                      'shipped',
                      'out_for_delivery',
                      'delivered',
                      'cancelled',
                    ].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${orderStatusFilter === status
                          ? 'bg-[#285A3C] text-white'
                          : 'bg-white border border-[#D8C7B5] text-[#4F6355] hover:bg-[#FAF5EE]'
                          }`}
                      >
                        {status.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
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

                            return (
                              <tr key={o.id} className="hover:bg-[#FAF5EE]/50">
                                <th scope="row" className="p-3 font-bold text-[#1A3B2B]">
                                  <div>
                                    <span>{o.order_number}</span>
                                    {o.tracking_id && (
                                      <span className="block text-[10px] font-normal text-[#647268]">
                                        {o.courier_name || 'Courier'}: {o.tracking_id}
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
                        {filteredInventoryProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FAF5EE]/50">
                            <th scope="row" className="p-3 font-semibold text-[#1A3B2B]">
                              {p.title}
                            </th>
                            <td className="p-3 text-[#647268] font-mono">{p.sku || p.slug}</td>
                            <td className="p-3">{p.categories?.name || p.product_type}</td>
                            <td className="p-3 font-bold text-base text-[#1A3B2B]">
                              {p.stock_quantity}
                            </td>
                            <td className="p-3">
                              {p.stock_quantity <= 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                                  Out of Stock
                                </span>
                              ) : p.stock_quantity < 5 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Low Stock
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
                                  disabled={(p.stock_quantity ?? 0) <= 0}
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
                        ))}
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

            {/* TAB: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                      Database Categories
                    </h2>
                    <p className="text-xs text-[#647268]">
                      Manage taxonomy, display order, images, and navigation hierarchy
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateCategoryModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#285A3C] text-white text-xs font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((c) => {
                    const parentCat = c.parent_id
                      ? categories.find((p) => p.id === c.parent_id)
                      : null;
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl border border-[#D8C7B5] bg-[#FAF5EE] flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {c.image_url && (
                                <img
                                  src={c.image_url}
                                  alt={c.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-[#D8C7B5] shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <h3 className="font-golden font-bold text-sm text-[#1A3B2B] truncate">
                                  {c.name}
                                </h3>
                                {parentCat && (
                                  <span className="text-[10px] text-[#285A3C] font-semibold">
                                    Subcategory of {parentCat.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${c.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                                }`}
                            >
                              {c.is_active ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#647268] line-clamp-2">
                            {c.description || 'Curated collection category'}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-[#8E9B92]">
                            <span className="font-mono">/{c.slug}</span>
                            <span>Order: {c.display_order}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DCCF]">
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
                    );
                  })}
                </div>
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
                                      to={`/product/${rev.products.slug}`}
                                      target="_blank"
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
                {/* 1. Storefront & Shipping Settings */}
                <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 shadow-xs space-y-5">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-[#285A3C] shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-golden text-lg font-bold text-[#1A3B2B]">
                        Storefront Contact, Social & Shipping Rules
                      </h2>
                      <p className="text-xs text-[#647268]">
                        Changes saved here update the Announcement Bar, Footer, Contact Page, Cart, Checkout, and server shipping validation immediately
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSiteSettings} className="dorasani-form space-y-5 text-xs">
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
                            <img
                              src={b.desktop_image_url}
                              alt={b.title_line_1}
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
              <label htmlFor="prod-category" className="font-semibold text-[#1A3B2B] block">
                Category
              </label>
              <select
                id="prod-category"
                name="category_id"
                value={productForm.category_id}
                onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="prod-type" className="font-semibold text-[#1A3B2B] block">
                Product Type
              </label>
              <select
                id="prod-type"
                name="product_type"
                value={productForm.product_type}
                onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                onChange={(e) =>
                  setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-lg border border-[#D8C7B5] bg-white focus:outline-none focus:border-[#285A3C]"
              />
            </div>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="font-semibold text-[#1A3B2B]">Visibility Status</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRODUCT_STATUSES.map((st) => (
                <label
                  key={st.value}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${productForm.status === st.value
                    ? 'border-[#285A3C] bg-[#D0E9C0]/30 font-semibold'
                    : 'border-[#D8C7B5] bg-white hover:bg-[#FAF5EE]'
                    }`}
                >
                  <input
                    type="radio"
                    name="product_status"
                    value={st.value}
                    checked={productForm.status === st.value}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    className="accent-[#285A3C]"
                  />
                  <span>{st.label}</span>
                </label>
              ))}
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
            <label htmlFor="prod-images" className="font-semibold text-[#1A3B2B] block">
              Product Image URLs (one URL per line — first URL is primary image)
            </label>
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
              <strong className="text-[#285A3C]">
                {stockMode === 'exact'
                  ? Math.max(0, Math.round(stockAmount || 0))
                  : Math.max(0, Number(stockTarget?.stock_quantity ?? 0) + Math.round(stockAmount || 0))}{' '}
                units
              </strong>
            </p>
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

        <form onSubmit={handleSaveOrderFulfillment} className="dorasani-form space-y-4 text-xs">
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
                  .filter((c) => c.id !== editingCategoryId && !c.parent_id)
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

          <div className="space-y-1">
            <label htmlFor="cat-image" className="font-semibold text-[#1A3B2B] block">
              Image URL
            </label>
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

            <div className="space-y-1">
              <label htmlFor="banner-img-desktop" className="font-semibold text-[#1A3B2B] block">
                Desktop Image URL *
              </label>
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

            <div className="space-y-1">
              <label htmlFor="banner-img-mobile" className="font-semibold text-[#1A3B2B] block">
                Mobile Image URL *
              </label>
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
    </div>
  );
};
