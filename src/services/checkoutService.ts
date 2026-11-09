import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, CartItem, Address, Coupon } from '../types';

export interface CheckoutPayload {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  billingAddress: Address;
  shippingAddress: Address;
  deliveryOption: string;
  paymentMethod: string;
  cartItems: CartItem[];
  couponCode?: string;
  idempotencyKey?: string;
}

export function mapDbCouponToCoupon(row: any): Coupon {
  const discountType: 'percentage' | 'fixed' =
    row.discount_type === 'fixed' ? 'fixed' : 'percentage';
  const discountValue = Number(row.discount_value ?? 0);
  const minOrderValue = Number(row.min_order_amount_inr ?? 0);
  const maxDiscountInr =
    row.max_discount_inr !== null && row.max_discount_inr !== undefined
      ? Number(row.max_discount_inr)
      : null;

  const discountLabel =
    discountType === 'fixed'
      ? `Get ₹${discountValue.toLocaleString('en-IN')} off`
      : `Get ${discountValue}% off${
          maxDiscountInr ? ` (up to ₹${maxDiscountInr.toLocaleString('en-IN')})` : ''
        }`;

  const minLabel =
    minOrderValue > 0 ? ` above ₹${minOrderValue.toLocaleString('en-IN')}` : '';

  return {
    id: row.id,
    code: String(row.code || '').toUpperCase(),
    discountType,
    discountValue,
    maxDiscountInr,
    discountPercent: discountType === 'percentage' ? discountValue : undefined,
    flatDiscount: discountType === 'fixed' ? discountValue : undefined,
    minOrderValue,
    usageLimit: row.usage_limit ?? null,
    usedCount: row.used_count ?? 0,
    endDate: row.end_date ?? null,
    isActive: Boolean(row.is_active),
    description: `${discountLabel}${minLabel}`,
  };
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0;
  if (subtotal < (coupon.minOrderValue || 0)) return 0;

  let discount = 0;
  const type = coupon.discountType || (coupon.flatDiscount ? 'fixed' : 'percentage');
  const val =
    coupon.discountValue ??
    (type === 'fixed' ? coupon.flatDiscount ?? 0 : coupon.discountPercent ?? 0);

  if (type === 'fixed') {
    discount = val;
  } else {
    discount = Math.round((subtotal * val) / 100);
    if (coupon.maxDiscountInr && discount > coupon.maxDiscountInr) {
      discount = coupon.maxDiscountInr;
    }
  }

  return Math.min(subtotal, Math.max(0, discount));
}

function buildOrderTimeline(o: any): Order['timeline'] {
  const status = String(o.order_status || 'confirmed');
  const createdFormatted = new Date(o.created_at || Date.now()).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const updatedFormatted = o.updated_at
    ? new Date(o.updated_at).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  if (status === 'cancelled' || status === 'returned' || status === 'refunded') {
    const labelMap: Record<string, string> = {
      cancelled: 'Order Cancelled',
      returned: 'Order Returned',
      refunded: 'Order Refunded',
    };
    return [
      {
        title: 'Order Placed',
        description: 'Your order was received.',
        timestamp: createdFormatted,
        completed: true,
      },
      {
        title: labelMap[status] || status,
        description: `Current status: ${status.replace(/_/g, ' ')}.`,
        timestamp: updatedFormatted || createdFormatted,
        completed: true,
        current: true,
      },
    ];
  }

  const stageOrder = ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIdx = Math.max(0, stageOrder.indexOf(status));

  const stages: { key: string[]; title: string; desc: string }[] = [
    {
      key: ['pending', 'confirmed'],
      title: 'Order Placed',
      desc: 'Your order has been confirmed.',
    },
    {
      key: ['processing', 'packed'],
      title: 'Processing & Packing',
      desc: status === 'packed' ? 'Quality checked and packed.' : 'Preparing your handloom order.',
    },
    {
      key: ['shipped'],
      title: 'Shipped',
      desc: o.courier_name ? `Dispatched via ${o.courier_name}.` : 'Handed over to delivery partner.',
    },
    {
      key: ['out_for_delivery'],
      title: 'Out for Delivery',
      desc: 'Your package is on the way to your doorstep.',
    },
    {
      key: ['delivered'],
      title: 'Delivered',
      desc: 'Package delivered safely.',
    },
  ];

  return stages.map((stage, sIdx) => {
    const stageThreshold = [0, 1, 3, 4, 5][sIdx];
    const completed = currentIdx >= stageThreshold;
    const isCurrent =
      stage.key.includes(status) || (sIdx === 0 && (status === 'pending' || status === 'confirmed'));

    let timestamp = 'Upcoming';
    if (sIdx === 0) timestamp = createdFormatted;
    else if (isCurrent && updatedFormatted) timestamp = updatedFormatted;
    else if (completed) timestamp = 'Completed';

    return {
      title: stage.title,
      description: stage.desc,
      timestamp,
      completed,
      current: isCurrent,
    };
  });
}

export function mapDbOrderToOrder(o: any): Order {
  return {
    id: o.id,
    orderNumber: o.order_number,
    date: new Date(o.created_at || Date.now()).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    items: (o.order_items || []).map((i: any) => ({
      productId: i.product_id || i.id,
      productTitle: i.product_title,
      variantColor: i.product_sku || 'Standard',
      price: i.unit_price_inr,
      quantity: i.quantity,
      imageUrl: i.image_url || '/assets/products/kanjivaram_silk_saree.jpg',
    })),
    shippingAddress: (o.shipping_address as unknown as Address) || {
      id: 'addr-order',
      addressType: 'Home',
      fullName: o.customer_name || '',
      phone: o.customer_phone || '',
      streetAddress: '',
      city: '',
      state: '',
      pincode: '',
    },
    deliveryOption: (o.delivery_option as 'standard' | 'express') || 'standard',
    subtotal: Number(o.subtotal_inr ?? 0),
    discount: Number(o.discount_inr ?? 0),
    shippingFee: Number(o.shipping_fee_inr ?? 0),
    total: Number(o.total_inr ?? 0),
    paymentMethod: (o.payment_method as any) || 'upi',
    paymentStatus: (o.payment_status as any) || 'pending',
    status: (o.order_status as any) || 'confirmed',
    timeline: buildOrderTimeline(o),
    courierPartner: o.courier_name || '',
    trackingId: o.tracking_id || '',
    orderNotes: o.customer_notes || undefined,
  };
}

export const checkoutService = {
  // Fetch active coupons currently eligible for storefront display
  async getActiveCoupons(): Promise<Coupon[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      const now = new Date();
      return data
        .filter((row) => {
          if (row.start_date && new Date(row.start_date) > now) return false;
          if (row.end_date && new Date(row.end_date) <= now) return false;
          if (row.usage_limit !== null && row.usage_limit !== undefined && (row.used_count ?? 0) >= row.usage_limit) {
            return false;
          }
          return true;
        })
        .map(mapDbCouponToCoupon);
    } catch (err) {
      console.error('Failed to fetch active coupons:', err);
      return [];
    }
  },

  // Validate a coupon against live database
  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{
    valid: boolean;
    discount: number;
    coupon?: Coupon;
    message: string;
  }> {
    if (!code || !code.trim()) {
      return { valid: false, discount: 0, message: 'Please enter a valid coupon code.' };
    }

    if (!isSupabaseConfigured) {
      return { valid: false, discount: 0, message: 'Live coupon service is not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data) {
        return { valid: false, discount: 0, message: 'Invalid or inactive coupon code.' };
      }

      const now = new Date();
      if (data.start_date && new Date(data.start_date) > now) {
        return { valid: false, discount: 0, message: 'This coupon is not active yet.' };
      }
      if (data.end_date && new Date(data.end_date) <= now) {
        return { valid: false, discount: 0, message: 'This coupon has expired.' };
      }
      if (data.usage_limit !== null && data.usage_limit !== undefined && (data.used_count ?? 0) >= data.usage_limit) {
        return { valid: false, discount: 0, message: 'This coupon has reached its maximum usage limit.' };
      }

      const mapped = mapDbCouponToCoupon(data);

      if (mapped.minOrderValue > 0 && subtotal < mapped.minOrderValue) {
        return {
          valid: false,
          discount: 0,
          message: `Minimum order of ₹${mapped.minOrderValue.toLocaleString('en-IN')} required for ${mapped.code}.`,
        };
      }

      const discount = calculateCouponDiscount(mapped, subtotal);

      return {
        valid: true,
        discount,
        coupon: mapped,
        message: `Coupon ${mapped.code} applied! (${mapped.description})`,
      };
    } catch (err: any) {
      console.error('Coupon validation error:', err?.message);
      return { valid: false, discount: 0, message: 'Failed to validate coupon.' };
    }
  },

  // Process atomic transactional checkout
  async processOrder(payload: CheckoutPayload): Promise<{
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    total?: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Live database connection is not configured.',
      };
    }

    try {
      const formattedItems = payload.cartItems.map((item) => ({
        product_id: item.product.id,
        variant_id: null,
        quantity: item.quantity,
      }));

      const idempotencyKey =
        payload.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Execute PostgreSQL atomic function
      const { data, error } = await supabase.rpc('process_checkout_atomic', {
        p_user_id: (payload.userId || null) as any,
        p_customer_name: payload.customerName,
        p_customer_email: payload.customerEmail,
        p_customer_phone: payload.customerPhone,
        p_billing_address: payload.billingAddress as any,
        p_shipping_address: payload.shippingAddress as any,
        p_cart_items: formattedItems as any,
        p_coupon_code: payload.couponCode || '',
        p_payment_method: payload.paymentMethod,
        p_delivery_option: payload.deliveryOption,
        p_idempotency_key: idempotencyKey,
      });

      if (error) {
        throw error;
      }

      const res = data as any;
      return {
        success: true,
        orderId: res.order_id,
        orderNumber: res.order_number,
        total: res.total_inr,
      };
    } catch (err: any) {
      console.error('Checkout failed:', err);
      return {
        success: false,
        error: err.message || 'Unable to place order. Please try again.',
      };
    }
  },

  // Fetch orders for signed-in customer
  async getCustomerOrders(userId: string): Promise<Order[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (*)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(mapDbOrderToOrder);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
      return [];
    }
  },

  // Look up an order accessible under current RLS session by order_number or tracking_id
  async lookupOrderByNumber(queryTerm: string): Promise<Order | null> {
    if (!isSupabaseConfigured || !queryTerm.trim()) return null;

    const clean = queryTerm.trim().replace(/^#/, '').replace(/[,%()]/g, '');
    if (!clean) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (*)
        `
        )
        .or(`order_number.ilike.${clean},tracking_id.ilike.${clean}`)
        .maybeSingle();

      if (error || !data) return null;
      return mapDbOrderToOrder(data);
    } catch (err) {
      console.error('Failed to look up order:', err);
      return null;
    }
  },
};
