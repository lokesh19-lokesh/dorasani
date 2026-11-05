import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, WishlistItem, Address, Order, UserProfile, Coupon } from '../types';
import { PRODUCTS, COUPONS } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { checkoutService } from '../services/checkoutService';
import { authService } from '../services/authService';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
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
  applyCoupon: (code: string) => { success: boolean; message: string };
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
  login: (email: string, passwordOrName?: string) => Promise<boolean | void> | void;
  logout: () => Promise<void> | void;
  register: (name: string, email: string, phone: string, password?: string) => Promise<boolean | void> | void;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Addresses
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  selectedAddress: Address;
  setSelectedAddress: (address: Address) => void;

  // Orders
  orders: Order[];
  placeOrder: (orderData: Partial<Order>) => Order;
  getOrder: (orderNumber: string) => Order | undefined;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_ADDRESS: Address = {
  id: 'addr-default',
  addressType: 'Home',
  fullName: 'Maddiboina Lokesh',
  phone: '+91 99xxxxxxxx',
  streetAddress: 'Flat No. 101, Sri Sai Residency, KPHB Colony',
  landmark: 'Near KPHB Metro Station',
  city: 'Hyderabad',
  state: 'Telangana',
  pincode: '500072',
  isDefault: true,
};

const INITIAL_USER: UserProfile = {
  id: 'user-default',
  fullName: 'Maddiboina Lokesh',
  email: 'lokesh@example.com',
  phone: '+91 99xxxxxxxx',
  whatsappOptIn: true,
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'DOR20261021',
    date: '21 Oct 2026, 09:41 AM',
    items: [
      {
        productId: 'prod-kanjivaram-silk',
        productTitle: 'Kanjivaram Silk Saree',
        variantColor: 'Rani Pink',
        price: 3499,
        quantity: 1,
        imageUrl: '/assets/products/kanjivaram_silk_saree.jpg',
      },
      {
        productId: 'prod-organza-floral',
        productTitle: 'Organza Floral Saree',
        variantColor: 'Mehendi Green',
        price: 1799,
        quantity: 1,
        imageUrl: '/assets/products/organza_floral_saree.jpg',
      },
      {
        productId: 'prod-banarasi-silk',
        productTitle: 'Banarasi Silk Saree',
        variantColor: 'Lavender',
        price: 2999,
        quantity: 1,
        imageUrl: '/assets/products/banarasi_silk_saree.jpg',
      },
      {
        productId: 'prod-chanderi-cotton',
        productTitle: 'Chanderi Cotton Saree',
        variantColor: 'Peach',
        price: 1499,
        quantity: 1,
        imageUrl: '/assets/products/chanderi_cotton_saree.jpg',
      },
    ],
    shippingAddress: INITIAL_ADDRESS,
    deliveryOption: 'standard',
    subtotal: 9796,
    discount: 2100,
    shippingFee: 0,
    total: 7696,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'out_for_delivery',
    courierPartner: 'Delhivery',
    trackingId: '149087654321',
    timeline: [
      {
        title: 'Order Placed',
        description: 'Your order has been confirmed.',
        timestamp: '21 Oct 2026, 09:41 AM',
        completed: true,
      },
      {
        title: 'Processing',
        description: 'Your order is being prepared.',
        timestamp: '21 Oct 2026, 11:30 AM',
        completed: true,
      },
      {
        title: 'Shipped',
        description: 'Your package has been shipped from our warehouse.',
        timestamp: '22 Oct 2026, 10:15 AM',
        completed: true,
      },
      {
        title: 'In Transit',
        description: 'Your package has reached Hyderabad Sortation Center.',
        timestamp: '22 Oct 2026, 09:45 PM',
        completed: true,
      },
      {
        title: 'Out for Delivery',
        description: 'Your package is out for delivery and will arrive today.',
        timestamp: '23 Oct 2026, 08:20 AM',
        completed: true,
        current: true,
      },
      {
        title: 'Delivered',
        description: 'Expected by 23 Oct, 06:00 PM',
        timestamp: 'Estimated: 23 Oct 2026, 06:00 PM',
        completed: false,
      },
    ],
  },
  {
    id: 'order-2',
    orderNumber: 'DOR20260915',
    date: '15 Sep 2026, 11:20 AM',
    items: [
      {
        productId: 'prod-organza-floral',
        productTitle: 'Organza Floral Saree',
        variantColor: 'Mehendi Green',
        price: 1799,
        quantity: 1,
        imageUrl: '/assets/products/organza_floral_saree.jpg',
      },
    ],
    shippingAddress: INITIAL_ADDRESS,
    deliveryOption: 'standard',
    subtotal: 1799,
    discount: 0,
    shippingFee: 0,
    total: 1799,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    status: 'delivered',
    timeline: [
      {
        title: 'Delivered',
        description: 'Delivered to your doorstep.',
        timestamp: '18 Sep 2026',
        completed: true,
      },
    ],
  },
  {
    id: 'order-3',
    orderNumber: 'DOR20260802',
    date: '02 Aug 2026, 04:30 PM',
    items: [
      {
        productId: 'prod-banarasi-silk',
        productTitle: 'Banarasi Silk Saree',
        variantColor: 'Lavender',
        price: 2999,
        quantity: 1,
        imageUrl: '/assets/products/banarasi_silk_saree.jpg',
      },
    ],
    shippingAddress: INITIAL_ADDRESS,
    deliveryOption: 'standard',
    subtotal: 2999,
    discount: 0,
    shippingFee: 0,
    total: 2999,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'delivered',
    timeline: [
      {
        title: 'Delivered',
        description: 'Delivered to your doorstep.',
        timestamp: '05 Aug 2026',
        completed: true,
      },
    ],
  },
];

// Initial cart matching the design screens exactly (4 items)
const INITIAL_CART: CartItem[] = [
  {
    id: 'cart-item-1',
    product: PRODUCTS[0], // Kanjivaram Silk Saree
    selectedColor: 'Rani Pink',
    quantity: 1,
    selected: true,
  },
  {
    id: 'cart-item-2',
    product: PRODUCTS[1], // Organza Floral Saree
    selectedColor: 'Mehendi Green',
    quantity: 1,
    selected: true,
  },
  {
    id: 'cart-item-3',
    product: PRODUCTS[2], // Banarasi Silk Saree
    selectedColor: 'Lavender',
    quantity: 1,
    selected: true,
  },
  {
    id: 'cart-item-4',
    product: PRODUCTS[3], // Chanderi Cotton Saree
    selectedColor: 'Peach',
    quantity: 1,
    selected: true,
  },
];

// Initial wishlist matching design (8 items)
const INITIAL_WISHLIST: WishlistItem[] = PRODUCTS.slice(0, 8).map((p, i) => ({
  id: `wish-${i}`,
  product: p,
  addedAt: new Date().toISOString(),
}));

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dorasani_cart');
    return saved ? JSON.parse(saved) : INITIAL_CART;
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('dorasani_wishlist');
    return saved ? JSON.parse(saved) : INITIAL_WISHLIST;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dorasani_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [addresses, setAddresses] = useState<Address[]>([
    INITIAL_ADDRESS,
    {
      id: 'addr-work',
      addressType: 'Work',
      fullName: 'Maddiboina Lokesh',
      phone: '+91 99xxxxxxxx',
      streetAddress: 'Plot 42, Hitech City Main Road, Madhapur',
      landmark: 'Cyber Towers',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      isDefault: false,
    },
  ]);

  const [selectedAddress, setSelectedAddress] = useState<Address>(INITIAL_ADDRESS);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dorasani_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(COUPONS[0]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem('dorasani_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dorasani_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('dorasani_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('dorasani_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dorasani_user');
    }
  }, [user]);

  // Sync session & live orders from Supabase when connected
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = data.session.user;
        setUser({
          id: u.id,
          fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Dorasani Customer',
          email: u.email || '',
          phone: u.user_metadata?.phone || '',
          whatsappOptIn: true,
        });

        checkoutService.getCustomerOrders(u.id).then((liveOrders) => {
          if (liveOrders && liveOrders.length > 0) {
            setOrders(liveOrders);
          }
        });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Dorasani Customer',
          email: u.email || '',
          phone: u.user_metadata?.phone || '',
          whatsappOptIn: true,
        });
        checkoutService.getCustomerOrders(u.id).then((liveOrders) => {
          if (liveOrders && liveOrders.length > 0) {
            setOrders(liveOrders);
          }
        });
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const addToCart = (product: Product, colorName?: string, quantity: number = 1) => {
    const color = colorName || product.colors[0]?.name || 'Standard';
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedColor === color
      );
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random()}`,
          product,
          selectedColor: color,
          quantity,
          selected: true,
        },
      ];
    });
    showToast(`Added "${product.title}" to your Bag`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
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
      showToast(`Removed from Wishlist`, 'info');
    } else {
      setWishlist((prev) => [
        ...prev,
        { id: `wish-${Date.now()}`, product, addedAt: new Date().toISOString() },
      ]);
      showToast(`Saved to Wishlist ❤️`);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((w) => w.product.id === productId);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((w) => w.product.id !== productId));
    showToast(`Removed from Wishlist`, 'info');
  };

  const moveAllToBag = () => {
    wishlist.forEach((w) => {
      addToCart(w.product);
    });
    setWishlist([]);
    showToast('All wishlist items moved to Bag!');
  };

  const applyCoupon = (code: string) => {
    const match = COUPONS.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!match) {
      return { success: false, message: 'Invalid coupon code.' };
    }
    if (subtotal < match.minOrderValue) {
      return {
        success: false,
        message: `Min order value for ${match.code} is ₹${match.minOrderValue.toLocaleString('en-IN')}`,
      };
    }
    setAppliedCoupon(match);
    showToast(`Coupon "${match.code}" applied successfully!`);
    return { success: true, message: `Coupon applied: ${match.description}` };
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

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.flatDiscount) {
      discount = appliedCoupon.flatDiscount;
    }
  } else if (subtotal > 3000) {
    // Default festive discount if eligible
    discount = 2100;
  }

  const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Auth
  const login = async (email: string, passwordOrName: string = 'Maddiboina Lokesh') => {
    if (isSupabaseConfigured && passwordOrName && !passwordOrName.includes('•') && passwordOrName.length >= 6) {
      try {
        const { user: authUser, error } = await authService.signIn(email, passwordOrName);
        if (!error && authUser) {
          const profile = await authService.getProfile(authUser.id);
          const fullUser: UserProfile = {
            id: authUser.id,
            fullName: profile?.fullName || authUser.user_metadata?.full_name || 'Valued Patron',
            email: authUser.email || email,
            phone: profile?.phone || '',
            whatsappOptIn: profile?.whatsappOptIn ?? true
          };
          setUser(fullUser);
          showToast(`Welcome back, ${fullUser.fullName}!`);
          return true;
        }
      } catch (e) {
        console.warn('Supabase sign in failed, fallback to local user:', e);
      }
    }

    const name = passwordOrName && !passwordOrName.includes('•') ? passwordOrName : 'Maddiboina Lokesh';
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: name,
      email,
      phone: '+91 99xxxxxxxx',
      whatsappOptIn: true,
    };
    setUser(newUser);
    showToast(`Welcome back, ${name}!`);
    return true;
  };

  const register = async (name: string, email: string, phone: string, password?: string) => {
    if (isSupabaseConfigured && password && password.length >= 6) {
      try {
        const { user: authUser, error } = await authService.signUp(email, password, name, phone);
        if (!error && authUser) {
          const newUser: UserProfile = {
            id: authUser.id,
            fullName: name,
            email,
            phone,
            whatsappOptIn: true
          };
          setUser(newUser);
          showToast(`Account created successfully! Welcome to DORASANI.`);
          return true;
        }
      } catch (e) {
        console.warn('Supabase registration fallback:', e);
      }
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: name,
      email,
      phone,
      whatsappOptIn: true,
    };
    setUser(newUser);
    showToast(`Account created successfully! Welcome to DORASANI.`);
    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await authService.signOut().catch(() => {});
    }
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updated });
      showToast('Profile updated successfully');
    }
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddress(newAddr);
    showToast('Address saved successfully');
  };

  const placeOrder = (orderData: Partial<Order>): Order => {
    const orderNumber = `DOR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: selectedCartItems.map((item) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        variantColor: item.selectedColor,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.primaryImage,
      })),
      shippingAddress: selectedAddress,
      deliveryOption: orderData.deliveryOption || 'standard',
      subtotal,
      discount,
      shippingFee,
      total,
      paymentMethod: orderData.paymentMethod || 'upi',
      paymentStatus: 'paid',
      status: 'confirmed',
      courierPartner: 'Delhivery',
      trackingId: `1490${Math.floor(10000000 + Math.random() * 90000000)}`,
      timeline: [
        {
          title: 'Order Placed',
          description: 'Your order has been confirmed and is being processed.',
          timestamp: 'Just now',
          completed: true,
          current: true,
        },
        {
          title: 'Processing',
          description: 'We are preparing your order.',
          timestamp: 'Upcoming',
          completed: false,
        },
        {
          title: 'Shipped',
          description: 'Track your delivery soon.',
          timestamp: 'Upcoming',
          completed: false,
        },
        {
          title: 'Out for Delivery',
          description: 'Arriving at your doorstep.',
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
      ...orderData,
    };

    setOrders((prev) => [newOrder, ...prev]);
    // Remove ordered items from cart
    setCart((prev) => prev.filter((item) => !item.selected));

    // Asynchronously persist order into Supabase PostgreSQL
    if (isSupabaseConfigured) {
      checkoutService.processOrder({
        userId: user?.id,
        customerName: newOrder.shippingAddress?.fullName || user?.fullName || 'Dorasani Customer',
        customerEmail: user?.email || 'customer@dorasanisarees.com',
        customerPhone: newOrder.shippingAddress?.phone || user?.phone || '+91 9999999999',
        billingAddress: newOrder.shippingAddress || selectedAddress,
        shippingAddress: newOrder.shippingAddress || selectedAddress,
        deliveryOption: newOrder.deliveryOption || 'standard',
        paymentMethod: newOrder.paymentMethod || 'upi',
        cartItems: selectedCartItems,
        couponCode: appliedCoupon?.code,
        idempotencyKey: `idem-${newOrder.id}`
      }).then((res) => {
        if (res.success && res.orderNumber) {
          console.log('[DORASANI Supabase] Order persisted to PostgreSQL:', res.orderNumber);
        }
      }).catch((err) => {
        console.warn('[DORASANI Supabase] Failed to persist order:', err);
      });
    }

    return newOrder;
  };

  const getOrder = (orderNumber: string) => {
    return orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === orderNumber.toLowerCase() ||
        o.id === orderNumber
    );
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
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveAllToBag,
        wishlistCount,
        user,
        login,
        logout,
        register,
        updateProfile,
        addresses,
        addAddress,
        selectedAddress,
        setSelectedAddress,
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
