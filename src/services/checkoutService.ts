import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Order, CartItem, Address } from '../types';

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

export const checkoutService = {
  // Validate a coupon against live database
  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    discount: number;
    message: string;
  }> {
    if (!code || !code.trim()) {
      return { valid: false, discount: 0, message: 'Please enter a valid coupon code.' };
    }

    if (!isSupabaseConfigured) {
      // Local fallback
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode === 'DORASANI10') {
        const discount = Math.round(subtotal * 0.1);
        return { valid: true, discount, message: '10% discount applied!' };
      }
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { valid: false, discount: 0, message: 'Invalid or inactive coupon code.' };
      }

      if (data.end_date && new Date(data.end_date) < new Date()) {
        return { valid: false, discount: 0, message: 'This coupon has expired.' };
      }

      if (data.min_order_amount_inr != null && subtotal < data.min_order_amount_inr) {
        return {
          valid: false,
          discount: 0,
          message: `Minimum order of ₹${data.min_order_amount_inr.toLocaleString()} required for this coupon.`
        };
      }

      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = Math.round((subtotal * data.discount_value) / 100);
        if (data.max_discount_inr && discount > data.max_discount_inr) {
          discount = data.max_discount_inr;
        }
      } else {
        discount = data.discount_value;
      }

      return { valid: true, discount, message: `Coupon ${data.code} applied successfully!` };
    } catch (err: any) {
      console.warn('Coupon validation error:', err.message);
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
      const orderNumber = `DOR${new Date().getFullYear()}${String(Date.now()).slice(-6)}`;
      return {
        success: true,
        orderId: `ord-${Date.now()}`,
        orderNumber,
        total: payload.cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0)
      };
    }

    try {
      const formattedItems = payload.cartItems.map(item => ({
        product_id: item.product.id,
        variant_id: null,
        quantity: item.quantity
      }));

      const idempotencyKey = payload.idempotencyKey || `idem-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Execute PostgreSQL atomic function
      const { data, error } = await supabase.rpc('process_checkout_atomic', {
        p_user_id: payload.userId || '',
        p_customer_name: payload.customerName,
        p_customer_email: payload.customerEmail,
        p_customer_phone: payload.customerPhone,
        p_billing_address: payload.billingAddress as any,
        p_shipping_address: payload.shippingAddress as any,
        p_cart_items: formattedItems as any,
        p_coupon_code: payload.couponCode || '',
        p_payment_method: payload.paymentMethod,
        p_delivery_option: payload.deliveryOption,
        p_idempotency_key: idempotencyKey
      });

      if (error) {
        throw error;
      }

      const res = data as any;
      return {
        success: true,
        orderId: res.order_id,
        orderNumber: res.order_number,
        total: res.total_inr
      };
    } catch (err: any) {
      console.error('Checkout failed:', err);
      return {
        success: false,
        error: err.message || 'Unable to place order. Please try again.'
      };
    }
  },

  // Fetch orders for customer
  async getCustomerOrders(userId: string): Promise<Order[]> {
    if (!isSupabaseConfigured || !userId) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        date: new Date(o.created_at || Date.now()).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        items: (o.order_items || []).map((i: any) => ({
          productId: i.product_id,
          productTitle: i.product_title,
          variantColor: i.product_sku || 'Standard',
          price: i.unit_price_inr,
          quantity: i.quantity,
          imageUrl: i.image_url || '/assets/products/kanjivaram_silk_saree.jpg'
        })),
        shippingAddress: (o.shipping_address as unknown) as Address,
        deliveryOption: (o.delivery_option as 'standard' | 'express') || 'standard',
        subtotal: o.subtotal_inr ?? 0,
        discount: o.discount_inr ?? 0,
        shippingFee: o.shipping_fee_inr ?? 0,
        total: o.total_inr ?? 0,
        paymentMethod: (o.payment_method as any) || 'upi',
        paymentStatus: (o.payment_status as any) || 'paid',
        status: (o.order_status as any) || 'confirmed',
        timeline: [
          {
            title: 'Order Placed',
            description: 'Your order has been received.',
            timestamp: new Date(o.created_at || Date.now()).toLocaleString(),
            completed: true,
            current: o.order_status === 'confirmed'
          },
          {
            title: 'Processing',
            description: 'Item is being inspected & packed.',
            timestamp: '',
            completed: ['processing', 'packed', 'shipped', 'delivered'].includes(o.order_status || '')
          },
          {
            title: 'Shipped',
            description: 'Handed over to delivery partner.',
            timestamp: '',
            completed: ['shipped', 'delivered'].includes(o.order_status || '')
          },
          {
            title: 'Delivered',
            description: 'Package delivered safely.',
            timestamp: '',
            completed: o.order_status === 'delivered'
          }
        ],
        courierPartner: o.courier_name || 'Delhivery',
        trackingId: o.tracking_id || 'TRK-PENDING'
      }));
    } catch (err) {
      console.warn('Failed to load customer orders:', err);
      return [];
    }
  }
};
