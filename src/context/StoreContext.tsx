import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_SITE_SETTINGS,
  type Product,
  type CartItem,
  type WishlistItem,
  type Address,
  type Order,
  type UserProfile,
  type Coupon,
  type UserRole,
  type SiteSettings,
  type Category,
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  checkoutService,
  calculateCouponDiscount,
  saveRecentOrderToSession,
  getCachedRecentOrder,
  clearCachedRecentOrders,
} from '../services/checkoutService';
import { openRazorpayCheckout } from '../services/razorpayService';
import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { userSyncService } from '../services/userSyncService';

export type CheckoutStage =
  | 'idle'
  | 'creating_order'
  | 'awaiting_payment'
  | 'verifying_payment';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: UserProfile;
  isAdmin?: boolean;
  role?: UserRole;
  emailUnconfirmed?: boolean;
  requiresConfirmation?: boolean;
  alreadyExists?: boolean;
}

interface StoreContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, colorName?: string, quantity?: number) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  toggleItemSelection: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedCoupon: Coupon | null;
  availableCoupons: Coupon[];
  refreshCoupons: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  moveAllToBag: () => void;
  wishlistCount: number;

  // User & Auth
  user: UserProfile | null;
  authLoading: boolean;
  isAdmin: boolean;
  passwordRecoveryPending: boolean;
  clearPasswordRecovery: () => void;
  login: (email: string, password?: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<AuthActionResult>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;

  // Addresses
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  selectedAddress: Address;
  setSelectedAddress: (address: Address) => void;

  // Dynamic Storefront Settings & Categories
  siteSettings: SiteSettings;
  storeCategories: Category[];
  refreshSiteSettings: () => Promise<void>;
  refreshStoreCategories: () => Promise<void>;

  // Orders
  orders: Order[];
  placeOrder: (
    orderData: Partial<Order> & { customerEmail?: string },
    onStageChange?: (stage: CheckoutStage) => void
  ) => Promise<{ success: boolean; cancelled?: boolean; order?: Order; error?: string }>;
  getOrder: (orderNumber: string) => Order | undefined;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const EMPTY_ADDRESS: Address = {
  id: 'addr-default',
  addressType: 'Home',
  fullName: '',
  phone: '',
  streetAddress: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: true,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dorasani_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(i => i.id === 'cart-item-1')) {
          localStorage.removeItem('dorasani_cart');
          return [];
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('dorasani_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(i => i.id === 'wish-0')) {
          localStorage.removeItem('dorasani_wishlist');
          return [];
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (isSupabaseConfigured) {
      // Remove legacy unauthenticated fallback entries so Supabase Auth session is the sole source of truth
      localStorage.removeItem('dorasani_user');
      localStorage.removeItem('dorasani_admin_override');
      return null;
    }
    try {
      const saved = localStorage.getItem('dorasani_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [passwordRecoveryPending, setPasswordRecoveryPending] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const combined = `${window.location.search}&${window.location.hash}`.toLowerCase();
    return combined.includes('type=recovery') || combined.includes('type=invite');
  });
  const clearPasswordRecovery = useCallback(() => setPasswordRecoveryPending(false), []);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address>(EMPTY_ADDRESS);

  const [orders, setOrders] = useState<Order[]>(() => {
    if (isSupabaseConfigured) {
      return [];
    }
    try {
      const saved = localStorage.getItem('dorasani_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [storeCategories, setStoreCategories] = useState<Category[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const hydrationSeqRef = useRef(0);
  const activeSyncedUserIdRef = useRef<string | null>(null);
  const skipNextCartSyncRef = useRef(false);
  const cartRef = useRef<CartItem[]>(cart);
  const wishlistRef = useRef<WishlistItem[]>(wishlist);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  const refreshCoupons = useCallback(async () => {
    const liveCoupons = await checkoutService.getActiveCoupons();
    setAvailableCoupons(liveCoupons);
  }, []);

  const refreshSiteSettings = useCallback(async () => {
    const liveSettings = await productService.getSiteSettings();
    setSiteSettings(liveSettings);
  }, []);

  const refreshStoreCategories = useCallback(async () => {
    const liveCats = await productService.getCategories();
    setStoreCategories(liveCats);
  }, []);

  useEffect(() => {
    void refreshCoupons();
    void refreshSiteSettings();
    void refreshStoreCategories();
  }, [refreshCoupons, refreshSiteSettings, refreshStoreCategories]);

  useEffect(() => {
    localStorage.setItem('dorasani_cart', JSON.stringify(cart));
    if (isSupabaseConfigured && activeSyncedUserIdRef.current && user?.id === activeSyncedUserIdRef.current) {
      if (skipNextCartSyncRef.current) {
        skipNextCartSyncRef.current = false;
        return;
      }
      void userSyncService.syncUserCart(user.id, cart);
    }
  }, [cart, user?.id]);

  useEffect(() => {
    localStorage.setItem('dorasani_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('dorasani_orders', JSON.stringify(orders));
      if (user) {
        localStorage.setItem('dorasani_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('dorasani_user');
      }
    }
  }, [orders, user]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const hydrateAuthenticatedUser = useCallback(async (authUser: any): Promise<UserProfile | null> => {
    if (!authUser?.id) {
      activeSyncedUserIdRef.current = null;
      setUser(null);
      setOrders([]);
      setAddresses([]);
      setAuthLoading(false);
      return null;
    }

    const seq = ++hydrationSeqRef.current;

    try {
      const [profile, roleInfo, liveOrders, addressRes, dbCart, dbWishlist] = await Promise.all([
        authService.getProfile(authUser.id),
        authService.getUserRoleInfo(authUser.id),
        checkoutService.getCustomerOrders(authUser.id),
        supabase
          .from('customer_addresses')
          .select('*')
          .eq('user_id', authUser.id)
          .order('is_default', { ascending: false }),
        userSyncService.fetchUserCart(authUser.id),
        userSyncService.fetchUserWishlist(authUser.id),
      ]);

      // Ignore stale responses if a newer auth change occurred
      if (seq !== hydrationSeqRef.current) return null;

      const hydratedUser: UserProfile = {
        id: authUser.id,
        fullName:
          profile?.fullName ||
          authUser.user_metadata?.full_name ||
          (roleInfo.isAdmin ? 'DORASANI Admin' : authUser.email?.split('@')[0] || 'DORASANI Member'),
        email: profile?.email || authUser.email || '',
        phone: profile?.phone || authUser.user_metadata?.phone || '',
        avatarUrl: profile?.avatarUrl || authUser.user_metadata?.avatar_url,
        whatsappOptIn: profile?.whatsappOptIn ?? true,
        role: roleInfo.role,
        isAdmin: roleInfo.isAdmin,
      };

      // Idempotently merge any guest cart items with the user's Supabase cart
      const localCart = cartRef.current || [];
      const mergedCartMap = new Map<string, CartItem>();
      for (const dbItem of dbCart) {
        const key = `${dbItem.product.id}::${(dbItem.selectedColor || '').toLowerCase()}`;
        mergedCartMap.set(key, dbItem);
      }
      let cartNeedsDbSync = false;
      for (const guestItem of localCart) {
        const key = `${guestItem.product.id}::${(guestItem.selectedColor || '').toLowerCase()}`;
        const existing = mergedCartMap.get(key);
        if (existing) {
          const maxQty = Math.max(existing.quantity, guestItem.quantity);
          if (maxQty !== existing.quantity || guestItem.selected !== existing.selected) {
            mergedCartMap.set(key, {
              ...existing,
              quantity: maxQty,
              selected: existing.selected || guestItem.selected,
            });
            cartNeedsDbSync = true;
          }
        } else {
          mergedCartMap.set(key, guestItem);
          cartNeedsDbSync = true;
        }
      }
      const mergedCart = Array.from(mergedCartMap.values());

      // Merge any guest wishlist items with the user's Supabase wishlist
      const localWishlist = wishlistRef.current || [];
      const wishlistProductIds = new Set(dbWishlist.map((w) => w.product.id));
      const mergedWishlist: WishlistItem[] = [...dbWishlist];
      const newWishlistProductIds: string[] = [];
      for (const guestWish of localWishlist) {
        if (!wishlistProductIds.has(guestWish.product.id)) {
          wishlistProductIds.add(guestWish.product.id);
          mergedWishlist.push(guestWish);
          newWishlistProductIds.push(guestWish.product.id);
        }
      }

      activeSyncedUserIdRef.current = authUser.id;
      skipNextCartSyncRef.current = !cartNeedsDbSync;

      setUser(hydratedUser);
      setCart(mergedCart);
      setWishlist(mergedWishlist);

      if (cartNeedsDbSync) {
        void userSyncService.syncUserCart(authUser.id, mergedCart);
      }
      for (const pid of newWishlistProductIds) {
        void userSyncService.syncUserWishlistItem(authUser.id, pid, 'add');
      }

      if (liveOrders) {
        setOrders(liveOrders);
      }

      if (addressRes?.data && addressRes.data.length > 0) {
        const mappedAddresses: Address[] = addressRes.data.map((a: any) => ({
          id: a.id,
          addressType: (a.address_type as 'Home' | 'Work' | 'Other') || 'Home',
          fullName: a.full_name,
          phone: a.phone,
          streetAddress: a.street_address,
          landmark: a.landmark || '',
          city: a.city,
          state: a.state,
          pincode: a.pincode,
          isDefault: Boolean(a.is_default),
        }));
        setAddresses(mappedAddresses);
        setSelectedAddress(mappedAddresses[0]);
      }

      return hydratedUser;
    } catch (err) {
      console.warn('[DORASANI Auth] Failed to hydrate user session:', err);
      if (seq === hydrationSeqRef.current) {
        activeSyncedUserIdRef.current = authUser.id;
        const fallbackUser: UserProfile = {
          id: authUser.id,
          fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'DORASANI Member',
          email: authUser.email || '',
          phone: authUser.user_metadata?.phone || '',
          whatsappOptIn: true,
          role: 'customer',
          isAdmin: false,
        };
        setUser(fallbackUser);
        return fallbackUser;
      }
      return null;
    } finally {
      if (seq === hydrationSeqRef.current) {
        setAuthLoading(false);
      }
    }
  }, []);

  // Sync verified session, DB role & live orders from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!isMounted) return;
        if (data.session?.user) {
          await hydrateAuthenticatedUser(data.session.user);
        } else {
          setUser(null);
          setOrders([]);
          setAddresses([]);
          setAuthLoading(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setAuthLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        hydrationSeqRef.current += 1;
        activeSyncedUserIdRef.current = null;
        if (event === 'SIGNED_OUT') {
          clearCachedRecentOrders();
          localStorage.removeItem('dorasani_cart');
          localStorage.removeItem('dorasani_wishlist');
          setCart([]);
          setWishlist([]);
        }
        setUser(null);
        setOrders([]);
        setAddresses([]);
        setSelectedAddress(EMPTY_ADDRESS);
        setPasswordRecoveryPending(false);
        setAuthLoading(false);
        return;
      }

      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecoveryPending(true);
        showToast('Verification successful. Please set your new password.', 'info');
      }

      // Defer Supabase DB queries outside the auth callback lock context
      setTimeout(() => {
        if (isMounted) {
          void hydrateAuthenticatedUser(session.user);
        }
      }, 0);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [hydrateAuthenticatedUser, showToast]);

  const addToCart = (product: Product, colorName?: string, quantity: number = 1) => {
    if (!product.inStock || (product.stock !== undefined && product.stock <= 0)) {
      showToast(`"${product.title}" is currently out of stock.`, 'info');
      return;
    }
    const color = colorName || product.colors[0]?.name || 'Standard';
    const maxStock = product.stock && product.stock > 0 ? product.stock : 999;
    const existingItem = cart.find(
      (item) => item.product.id === product.id && item.selectedColor === color
    );
    if (existingItem && existingItem.quantity >= maxStock) {
      showToast(
        `Only ${maxStock} ${maxStock === 1 ? 'unit' : 'units'} of "${product.title}" available in stock.`,
        'info'
      );
      return;
    }
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedColor === color
      );
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: Math.min(maxStock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          product,
          selectedColor: color,
          quantity: Math.min(maxStock, quantity),
          selected: true,
        },
      ];
    });
    showToast(`Added "${product.title}" to your Bag`);
    if (user?.id) {
      void userSyncService.logCustomerActivity(user.id, 'add_to_cart', {
        productId: product.id,
        title: product.title,
        quantity,
        color,
      });
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const target = cart.find((item) => item.id === itemId);
    if (!target) return;

    if (delta > 0) {
      if (!target.product.inStock || (target.product.stock !== undefined && target.product.stock <= 0)) {
        showToast(`"${target.product.title}" is currently out of stock.`, 'info');
        return;
      }
      const maxStock =
        target.product.stock && target.product.stock > 0 ? target.product.stock : 999;
      if (target.quantity >= maxStock) {
        showToast(
          `Only ${maxStock} ${maxStock === 1 ? 'unit' : 'units'} of "${target.product.title}" available in stock.`,
          'info'
        );
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.min(maxStock, item.quantity + delta) }
            : item
        )
      );
      return;
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const toggleItemSelection = (itemId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart cleared', 'info');
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((w) => w.product.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((w) => w.product.id !== product.id));
      if (user?.id) {
        void userSyncService.syncUserWishlistItem(user.id, product.id, 'remove');
      }
      showToast(`Removed from Wishlist`, 'info');
    } else {
      setWishlist((prev) => [
        ...prev,
        { id: `wish-${Date.now()}`, product, addedAt: new Date().toISOString() },
      ]);
      if (user?.id) {
        void userSyncService.syncUserWishlistItem(user.id, product.id, 'add');
      }
      showToast(`Saved to Wishlist ❤️`);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((w) => w.product.id === productId);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((w) => w.product.id !== productId));
    if (user?.id) {
      void userSyncService.syncUserWishlistItem(user.id, productId, 'remove');
    }
    showToast(`Removed from Wishlist`, 'info');
  };

  const moveAllToBag = () => {
    const available = wishlist.filter(
      (w) => w.product.inStock && (w.product.stock === undefined || w.product.stock > 0)
    );
    if (available.length === 0) {
      showToast('None of your wishlisted items are currently in stock.', 'info');
      return;
    }
    available.forEach((w) => {
      addToCart(w.product);
      if (user?.id) {
        void userSyncService.syncUserWishlistItem(user.id, w.product.id, 'remove');
      }
    });
    const movedIds = new Set(available.map((w) => w.product.id));
    setWishlist((prev) => prev.filter((w) => !movedIds.has(w.product.id)));
    showToast('Available wishlist items moved to Bag!');
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const res = await checkoutService.validateCoupon(code, subtotal);
    if (!res.valid || !res.coupon) {
      showToast(res.message, 'error');
      return { success: false, message: res.message };
    }
    setAppliedCoupon(res.coupon);
    showToast(`Coupon "${res.coupon.code}" applied successfully!`);
    return { success: true, message: res.message };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Calculations for active/selected items
  const selectedCartItems = cart.filter((i) => i.selected);
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Auto-clear coupon if selected subtotal drops below minimum order requirement
  useEffect(() => {
    if (!appliedCoupon) return;
    if (subtotal === 0) {
      setAppliedCoupon(null);
      return;
    }
    if (subtotal < (appliedCoupon.minOrderValue || 0)) {
      const removedCode = appliedCoupon.code;
      setAppliedCoupon(null);
      showToast(
        `Coupon "${removedCode}" removed because order dropped below ₹${appliedCoupon.minOrderValue.toLocaleString('en-IN')}.`,
        'info'
      );
    }
  }, [appliedCoupon, subtotal, showToast]);

  const discount = appliedCoupon ? calculateCouponDiscount(appliedCoupon, subtotal) : 0;
  const shippingFee =
    subtotal === 0 || subtotal >= siteSettings.freeShippingThreshold
      ? 0
      : siteSettings.standardShippingFee;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Auth: verified database sign-in
  const login = async (email: string, password: string = ''): Promise<AuthActionResult> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      const msg = 'Please enter both your email address and password.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    if (isSupabaseConfigured) {
      const { user: authUser, session, error, emailUnconfirmed } = await authService.signIn(
        cleanEmail,
        password
      );

      if (error || !authUser || !session) {
        const msg = error || 'Invalid email or password.';
        showToast(msg, 'error');
        return { success: false, error: msg, emailUnconfirmed };
      }

      const hydrated = await hydrateAuthenticatedUser(authUser);
      if (hydrated?.id) {
        void userSyncService.logCustomerActivity(hydrated.id, 'login', {
          method: 'password',
          isAdmin: Boolean(hydrated.isAdmin),
        });
      }
      if (hydrated?.isAdmin) {
        showToast(`Signed in as Admin (${hydrated.email})`);
      } else {
        showToast(`Welcome back, ${hydrated?.fullName || 'Valued Patron'}!`);
      }

      return {
        success: true,
        user: hydrated || undefined,
        isAdmin: Boolean(hydrated?.isAdmin),
        role: hydrated?.role || 'customer',
      };
    }

    // Offline fallback only when Supabase env vars are not configured
    const localUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: cleanEmail.split('@')[0] || 'DORASANI Customer',
      email: cleanEmail,
      phone: '',
      whatsappOptIn: true,
      role: 'customer',
      isAdmin: false,
    };
    setUser(localUser);
    showToast(`Welcome back, ${localUser.fullName}!`);
    return { success: true, user: localUser, isAdmin: false, role: 'customer' };
  };

  // Auth: verified registration
  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string = ''
  ): Promise<AuthActionResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      const msg = 'Please enter your full name.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
    if (!cleanEmail) {
      const msg = 'Please enter a valid email address.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
    if (!password || password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    if (isSupabaseConfigured) {
      const {
        user: authUser,
        session,
        confirmationRequired,
        alreadyExists,
        error,
      } = await authService.signUp(cleanEmail, password, cleanName, cleanPhone);

      if (error || !authUser) {
        const msg = error || 'Unable to create account.';
        showToast(msg, 'error');
        return { success: false, error: msg, alreadyExists };
      }

      if (confirmationRequired || !session) {
        showToast('Verification link sent to your email. Please confirm to sign in.', 'info');
        return {
          success: true,
          requiresConfirmation: true,
        };
      }

      const hydrated = await hydrateAuthenticatedUser(authUser);
      if (hydrated?.id) {
        void userSyncService.logCustomerActivity(hydrated.id, 'login', {
          method: 'signup',
          isAdmin: Boolean(hydrated.isAdmin),
        });
      }
      if (hydrated?.isAdmin) {
        showToast(`Admin account ready! Welcome, ${hydrated.fullName}.`);
      } else {
        showToast('Account created successfully! Welcome to DORASANI.');
      }

      return {
        success: true,
        user: hydrated || undefined,
        isAdmin: Boolean(hydrated?.isAdmin),
        role: hydrated?.role || 'customer',
      };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      whatsappOptIn: true,
      role: 'customer',
      isAdmin: false,
    };
    setUser(newUser);
    showToast('Account created successfully! Welcome to DORASANI.');
    return { success: true, user: newUser, isAdmin: false, role: 'customer' };
  };

  const logout = async () => {
    hydrationSeqRef.current += 1;
    activeSyncedUserIdRef.current = null;
    if (isSupabaseConfigured) {
      await authService.signOut().catch(() => {});
    }
    localStorage.removeItem('dorasani_user');
    localStorage.removeItem('dorasani_orders');
    localStorage.removeItem('dorasani_admin_override');
    localStorage.removeItem('dorasani_cart');
    localStorage.removeItem('dorasani_wishlist');
    clearCachedRecentOrders();
    setCart([]);
    setWishlist([]);
    setAppliedCoupon(null);
    setUser(null);
    setOrders([]);
    setAddresses([]);
    setSelectedAddress(EMPTY_ADDRESS);
    setPasswordRecoveryPending(false);
    showToast('Signed out successfully', 'info');
  };

  const updateProfile = async (updated: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    // Strip role/isAdmin so client-side updates can never alter privileges
    const { role: _ignoredRole, isAdmin: _ignoredIsAdmin, ...safeUpdates } = updated;

    if (isSupabaseConfigured) {
      const ok = await authService.updateProfile(user.id, safeUpdates);
      if (!ok) {
        showToast('Failed to update profile. Please try again.', 'error');
        return false;
      }
    }

    setUser({ ...user, ...safeUpdates });
    showToast('Profile updated successfully');
    return true;
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const tempId = `addr-${Date.now()}`;
    const newAddr: Address = {
      ...addr,
      id: tempId,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddress(newAddr);

    if (isSupabaseConfigured && user?.id) {
      supabase
        .from('customer_addresses')
        .insert({
          user_id: user.id,
          address_type: addr.addressType,
          full_name: addr.fullName,
          phone: addr.phone,
          street_address: addr.streetAddress,
          landmark: addr.landmark || null,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          is_default: Boolean(addr.isDefault),
        })
        .select()
        .single()
        .then(({ data }) => {
          if (data) {
            setAddresses((prev) =>
              prev.map((a) => (a.id === tempId ? { ...a, id: data.id } : a))
            );
          }
        });
    }

    showToast('Address saved successfully');
  };

  const placeOrder = async (
    orderData: Partial<Order> & { customerEmail?: string },
    onStageChange?: (stage: CheckoutStage) => void
  ): Promise<{ success: boolean; cancelled?: boolean; order?: Order; error?: string }> => {
    if (selectedCartItems.length === 0) {
      const msg = 'No items selected for checkout.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    if (!isSupabaseConfigured) {
      const msg = 'Live payment and order service is not configured.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }

    const chosenAddress = orderData.shippingAddress || selectedAddress;
    const chosenDelivery = orderData.deliveryOption || 'standard';
    const requestedPayment = orderData.paymentMethod || 'razorpay';
    if (requestedPayment === 'cod' && !siteSettings.codEnabled) {
      const msg =
        'Cash on Delivery (COD) is not available at present. Please pay online via Razorpay.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
    const chosenPayment = requestedPayment;
    const effectiveShipping =
      chosenDelivery === 'express' ? siteSettings.expressShippingFee : shippingFee;
    const computedTotal = Math.max(0, subtotal - discount + effectiveShipping);
    const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const customerName = chosenAddress.fullName || user?.fullName || '';
    const customerEmail = (orderData.customerEmail || user?.email || '').trim();
    const customerPhone = (chosenAddress.phone || user?.phone || '').trim();

    const buildFallbackOrder = (params: {
      orderId: string;
      orderNumber: string;
      total?: number;
      paymentStatus: 'pending' | 'paid';
      gatewayOrderId?: string;
      paymentId?: string;
    }): Order => {
      const nowLabel = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        id: params.orderId,
        orderNumber: params.orderNumber,
        date: nowLabel,
        items: selectedCartItems.map((item) => ({
          productId: item.product.id,
          productTitle: item.product.title,
          variantColor: item.selectedColor,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.primaryImage,
        })),
        shippingAddress: chosenAddress,
        deliveryOption: chosenDelivery,
        subtotal,
        discount,
        shippingFee: effectiveShipping,
        total: params.total ?? computedTotal,
        paymentMethod: chosenPayment,
        paymentStatus: params.paymentStatus,
        status: 'confirmed',
        courierPartner: '',
        trackingId: '',
        orderNotes: orderData.orderNotes,
        paymentDetails:
          params.gatewayOrderId || params.paymentId
            ? {
                provider: 'razorpay',
                gatewayOrderId: params.gatewayOrderId,
                paymentId: params.paymentId,
              }
            : undefined,
        timeline: [
          {
            title: 'Order Placed',
            description:
              params.paymentStatus === 'paid'
                ? 'Payment verified via Razorpay and order confirmed.'
                : 'Your order has been confirmed and is being processed.',
            timestamp: nowLabel,
            completed: true,
            current: true,
          },
          {
            title: 'Processing & Packing',
            description: 'Preparing your handloom order.',
            timestamp: 'Upcoming',
            completed: false,
          },
          {
            title: 'Shipped',
            description: 'Handed over to delivery partner.',
            timestamp: 'Upcoming',
            completed: false,
          },
          {
            title: 'Out for Delivery',
            description: 'Your package is on the way to your doorstep.',
            timestamp: 'Upcoming',
            completed: false,
          },
          {
            title: 'Delivered',
            description: 'Estimated within 3-5 business days.',
            timestamp: 'Upcoming',
            completed: false,
          },
        ],
      };
    };

    const finalizeLocalOrderState = (finalOrder: Order) => {
      saveRecentOrderToSession(finalOrder);
      setOrders((prev) => [
        finalOrder,
        ...prev.filter((o) => o.orderNumber !== finalOrder.orderNumber),
      ]);
      setCart((prev) => prev.filter((item) => !item.selected));
      setAppliedCoupon(null);
      void refreshCoupons();

      if (user?.id) {
        void userSyncService.logCustomerActivity(user.id, 'order_placed', {
          orderNumber: finalOrder.orderNumber,
          total: finalOrder.total,
          paymentMethod: finalOrder.paymentMethod,
          paymentStatus: finalOrder.paymentStatus,
        });
        checkoutService
          .getCustomerOrders(user.id)
          .then((liveOrders) => {
            if (liveOrders && liveOrders.length > 0) {
              setOrders(liveOrders);
            }
          })
          .catch(() => {});
      }

      onStageChange?.('idle');
      showToast(`Order #${finalOrder.orderNumber} placed successfully!`);
    };

    onStageChange?.('creating_order');
    if (user?.id) {
      void userSyncService.logCustomerActivity(user.id, 'checkout_start', {
        subtotal,
        discount,
        shippingFee: effectiveShipping,
        total: computedTotal,
        deliveryOption: chosenDelivery,
        paymentMethod: chosenPayment,
        itemsCount: selectedCartItems.length,
      });
    }

    const initRes = await checkoutService.initiateCheckoutSession({
      userId: user?.id,
      customerName,
      customerEmail,
      customerPhone,
      billingAddress: chosenAddress,
      shippingAddress: chosenAddress,
      deliveryOption: chosenDelivery,
      paymentMethod: chosenPayment,
      cartItems: selectedCartItems,
      couponCode: appliedCoupon?.code,
      orderNotes: orderData.orderNotes,
      idempotencyKey,
    });

    if (!initRes.success) {
      onStageChange?.('idle');
      const errMsg =
        ('error' in initRes && initRes.error) ||
        'Unable to initiate checkout. Please try again.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }

    if (initRes.flow === 'cod') {
      const finalOrder =
        initRes.order ||
        buildFallbackOrder({
          orderId: initRes.orderId || `ord-${Date.now()}`,
          orderNumber: initRes.orderNumber,
          total: initRes.total,
          paymentStatus: 'pending',
        });
      finalizeLocalOrderState(finalOrder);
      return { success: true, order: finalOrder };
    }

    if (initRes.alreadyPaid && initRes.order) {
      finalizeLocalOrderState(initRes.order);
      return { success: true, order: initRes.order };
    }

    onStageChange?.('awaiting_payment');

    const preferredMethod =
      chosenPayment === 'upi' ||
      chosenPayment === 'card' ||
      chosenPayment === 'netbanking' ||
      chosenPayment === 'wallet'
        ? chosenPayment
        : undefined;

    try {
      const modalOutcome = await openRazorpayCheckout({
        keyId: initRes.keyId,
        razorpayOrderId: initRes.razorpayOrderId,
        amountInPaise: initRes.amountInPaise,
        currency: initRes.currency,
        customerName,
        customerEmail,
        customerPhone,
        preferredMethod,
        checkoutSessionId: initRes.checkoutSessionId,
        description: `DORASANI Handloom Order (${selectedCartItems.length} item${selectedCartItems.length === 1 ? '' : 's'})`,
      });

      if (modalOutcome.status === 'dismissed') {
        const report = await checkoutService.reportRazorpayAttemptStatus({
          action: 'mark_cancelled',
          checkoutSessionId: initRes.checkoutSessionId,
          razorpayOrderId: initRes.razorpayOrderId,
        });

        if (report.alreadyPaid && report.order) {
          finalizeLocalOrderState(report.order);
          return { success: true, order: report.order };
        }

        onStageChange?.('idle');
        const cancelMsg = siteSettings.codEnabled
          ? 'Payment was cancelled before completion. Your shopping bag and coupon are still saved — you can retry or choose Cash on Delivery.'
          : 'Payment was cancelled before completion. Your shopping bag and coupon are still saved — please retry payment via Razorpay.';
        showToast('Payment cancelled. Your bag is saved.', 'info');
        return { success: false, cancelled: true, error: cancelMsg };
      }

      if (modalOutcome.status === 'failed') {
        const report = await checkoutService.reportRazorpayAttemptStatus({
          action: 'mark_failed',
          checkoutSessionId: initRes.checkoutSessionId,
          razorpayOrderId: initRes.razorpayOrderId,
          razorpayPaymentId: modalOutcome.error?.metadata?.payment_id,
          errorCode: modalOutcome.error?.code,
          errorDescription: modalOutcome.error?.description,
        });

        if (report.alreadyPaid && report.order) {
          finalizeLocalOrderState(report.order);
          return { success: true, order: report.order };
        }

        onStageChange?.('idle');
        const reasonText =
          modalOutcome.error?.description ||
          modalOutcome.error?.reason ||
          'The payment was declined by the bank or UPI app.';
        const failMsg = `Payment failed: ${reasonText} Your bag and coupon are still saved — please try again or choose another payment method.`;
        showToast(reasonText, 'error');
        return { success: false, error: failMsg };
      }

      onStageChange?.('verifying_payment');

      const verifyRes = await checkoutService.verifyRazorpayPayment({
        checkoutSessionId: initRes.checkoutSessionId,
        razorpayOrderId: modalOutcome.response.razorpay_order_id,
        razorpayPaymentId: modalOutcome.response.razorpay_payment_id,
        razorpaySignature: modalOutcome.response.razorpay_signature,
      });

      if (!verifyRes.success || !verifyRes.orderNumber) {
        onStageChange?.('idle');
        const paymentRef = modalOutcome.response.razorpay_payment_id;
        const baseErr =
          verifyRes.error || 'Could not verify Razorpay payment on the server.';
        const errMsg = `${baseErr} If your account was debited, quote Razorpay Payment ID: ${paymentRef}.`;
        showToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }

      const finalOrder =
        verifyRes.order ||
        buildFallbackOrder({
          orderId: verifyRes.orderId || `ord-${Date.now()}`,
          orderNumber: verifyRes.orderNumber,
          total: verifyRes.total ?? initRes.total,
          paymentStatus: 'paid',
          gatewayOrderId: modalOutcome.response.razorpay_order_id,
          paymentId: modalOutcome.response.razorpay_payment_id,
        });

      finalizeLocalOrderState(finalOrder);
      return { success: true, order: finalOrder };
    } catch (err: any) {
      onStageChange?.('idle');
      const errMsg =
        err?.message ||
        'Unable to launch Razorpay Checkout. Please check your connection and try again.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const getOrder = (orderNumber: string) => {
    const clean = orderNumber.trim().toLowerCase();
    const fromState = orders.find(
      (o) => o.orderNumber.toLowerCase() === clean || o.id.toLowerCase() === clean
    );
    if (fromState) return fromState;
    return getCachedRecentOrder(orderNumber) || undefined;
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleItemSelection,
        clearCart,
        cartCount,
        subtotal,
        discount,
        shippingFee,
        total,
        appliedCoupon,
        availableCoupons,
        refreshCoupons,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveAllToBag,
        wishlistCount,
        user,
        authLoading,
        isAdmin: Boolean(user?.isAdmin),
        passwordRecoveryPending,
        clearPasswordRecovery,
        login,
        logout,
        register,
        updateProfile,
        addresses,
        addAddress,
        selectedAddress,
        setSelectedAddress,
        siteSettings,
        storeCategories,
        refreshSiteSettings,
        refreshStoreCategories,
        orders,
        placeOrder,
        getOrder,
        toasts,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
