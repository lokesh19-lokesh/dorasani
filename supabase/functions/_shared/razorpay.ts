/// <reference path="../deno.d.ts" />
import { corsHeaders } from './cors.ts';

export const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const getRazorpayConfig = () => {
  const keyId = (Deno.env.get('RAZORPAY_KEY_ID') || '').trim();
  const keySecret = (Deno.env.get('RAZORPAY_KEY_SECRET') || '').trim();
  return { keyId, keySecret };
};

export const getRazorpayWebhookSecret = () => {
  return (
    Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ||
    Deno.env.get('PAYMENT_WEBHOOK_SECRET') ||
    ''
  ).trim();
};

export const buildRazorpayBasicAuth = (keyId: string, keySecret: string): string => {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
};

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  const normA = a.trim().toLowerCase();
  const normB = b.trim().toLowerCase();
  if (!normA || !normB || normA.length !== normB.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < normA.length; i++) {
    diff |= normA.charCodeAt(i) ^ normB.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): Promise<boolean> {
  const payload = `${params.orderId}|${params.paymentId}`;
  const expected = await hmacSha256Hex(params.keySecret, payload);
  return timingSafeEqualHex(expected, params.signature);
}

export async function verifyRazorpayWebhookSignature(params: {
  rawBody: string;
  signature: string;
  webhookSecret: string;
}): Promise<boolean> {
  const expected = await hmacSha256Hex(params.webhookSecret, params.rawBody);
  return timingSafeEqualHex(expected, params.signature);
}

export async function createRazorpayOrder(params: {
  keyId: string;
  keySecret: string;
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: buildRazorpayBasicAuth(params.keyId, params.keySecret),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt.slice(0, 40),
      notes: params.notes || {},
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const desc =
      data?.error?.description ||
      data?.error?.reason ||
      `Razorpay order creation failed (${res.status})`;
    throw new Error(desc);
  }

  return data;
}

export async function fetchRazorpayPayment(params: {
  keyId: string;
  keySecret: string;
  paymentId: string;
}) {
  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(params.paymentId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: buildRazorpayBasicAuth(params.keyId, params.keySecret),
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const desc =
      data?.error?.description ||
      data?.error?.reason ||
      `Unable to fetch Razorpay payment (${res.status})`;
    throw new Error(desc);
  }

  return data;
}

export async function captureRazorpayPayment(params: {
  keyId: string;
  keySecret: string;
  paymentId: string;
  amountInPaise: number;
  currency?: string;
}) {
  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(params.paymentId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: buildRazorpayBasicAuth(params.keyId, params.keySecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amountInPaise,
        currency: params.currency || 'INR',
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const desc =
      data?.error?.description ||
      data?.error?.reason ||
      `Unable to capture Razorpay payment (${res.status})`;
    throw new Error(desc);
  }

  return data;
}

export function normalizePaymentMethod(rawMethod: unknown, fallback = 'upi'): string {
  const val = String(rawMethod || '').trim().toLowerCase();
  if (val === 'upi' || val === 'card' || val === 'netbanking' || val === 'wallet' || val === 'cod') {
    return val;
  }
  const fb = String(fallback || 'upi').trim().toLowerCase();
  if (fb === 'upi' || fb === 'card' || fb === 'netbanking' || fb === 'wallet' || fb === 'cod') {
    return fb;
  }
  return 'upi';
}

export function extractPaymentMethodDetails(rzpPayment: any): Record<string, unknown> {
  if (!rzpPayment || typeof rzpPayment !== 'object') return {};

  const details: Record<string, unknown> = {
    method: rzpPayment.method || null,
    status: rzpPayment.status || null,
    captured: Boolean(rzpPayment.captured),
    amount_paise: rzpPayment.amount ?? null,
    currency: rzpPayment.currency || 'INR',
    international: Boolean(rzpPayment.international),
    vpa: rzpPayment.vpa || null,
    bank: rzpPayment.bank || null,
    wallet: rzpPayment.wallet || null,
    email: rzpPayment.email || null,
    contact: rzpPayment.contact || null,
    fee_paise: rzpPayment.fee ?? null,
    tax_paise: rzpPayment.tax ?? null,
    created_at_unix: rzpPayment.created_at ?? null,
  };

  if (rzpPayment.card && typeof rzpPayment.card === 'object') {
    details.card = {
      network: rzpPayment.card.network || null,
      last4: rzpPayment.card.last4 || null,
      type: rzpPayment.card.type || null,
      issuer: rzpPayment.card.issuer || null,
    };
  }

  if (rzpPayment.acquirer_data && typeof rzpPayment.acquirer_data === 'object') {
    details.acquirer_data = rzpPayment.acquirer_data;
  }

  return details;
}

export interface NormalizedCartItem {
  product_id: string;
  variant_id: string | null;
  quantity: number;
}

export interface ServerCheckoutSummary {
  subtotalInr: number;
  discountInr: number;
  shippingFeeInr: number;
  totalInr: number;
  expectedAmountPaise: number;
  appliedCouponCode: string | null;
}

export async function computeServerCheckoutSummary(
  admin: any,
  items: NormalizedCartItem[],
  couponCode: string | null | undefined,
  deliveryOption: string
): Promise<ServerCheckoutSummary> {
  const productIds = Array.from(new Set(items.map((i) => i.product_id)));
  const variantIds = Array.from(
    new Set(items.map((i) => i.variant_id).filter((v): v is string => Boolean(v)))
  );

  const { data: products, error: prodErr } = await admin
    .from('products')
    .select('id, title, price_inr, status, stock_quantity')
    .in('id', productIds);

  if (prodErr || !products) {
    throw new Error('Failed to verify cart product pricing.');
  }

  const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));
  const variantMap = new Map<string, any>();

  if (variantIds.length > 0) {
    const { data: variants, error: varErr } = await admin
      .from('product_variants')
      .select('id, product_id, price_adjustment_inr, stock_quantity, is_active')
      .in('id', variantIds);

    if (varErr || !variants) {
      throw new Error('Failed to verify selected product variants.');
    }

    for (const v of variants) {
      variantMap.set(v.id, v);
    }
  }

  let subtotalInr = 0;

  for (const item of items) {
    const prod = productMap.get(item.product_id);
    if (!prod || prod.status !== 'active') {
      throw new Error('One or more items in your cart are currently unavailable.');
    }

    let unitPrice = Number(prod.price_inr ?? 0);

    if (item.variant_id) {
      const variant = variantMap.get(item.variant_id);
      if (!variant || variant.product_id !== item.product_id || variant.is_active === false) {
        throw new Error(`Selected variant for ${prod.title} is unavailable.`);
      }
      if (Number(variant.stock_quantity ?? 0) < item.quantity) {
        throw new Error(`Insufficient stock for ${prod.title}.`);
      }
      unitPrice += Number(variant.price_adjustment_inr ?? 0);
    } else if (Number(prod.stock_quantity ?? 0) < item.quantity) {
      throw new Error(`Insufficient stock for ${prod.title}.`);
    }

    subtotalInr += unitPrice * item.quantity;
  }

  if (subtotalInr <= 0) {
    throw new Error('Invalid order subtotal.');
  }

  let discountInr = 0;
  let appliedCouponCode: string | null = null;
  const cleanCoupon = (couponCode || '').trim().toUpperCase();

  if (cleanCoupon) {
    const { data: coupon, error: couponErr } = await admin
      .from('coupons')
      .select('*')
      .eq('code', cleanCoupon)
      .eq('is_active', true)
      .maybeSingle();

    if (couponErr || !coupon) {
      throw new Error(`Coupon "${cleanCoupon}" is invalid or inactive.`);
    }

    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      throw new Error(`Coupon "${cleanCoupon}" is not active yet.`);
    }
    if (coupon.end_date && new Date(coupon.end_date) <= now) {
      throw new Error(`Coupon "${cleanCoupon}" has expired.`);
    }
    if (
      coupon.usage_limit !== null &&
      coupon.usage_limit !== undefined &&
      Number(coupon.used_count ?? 0) >= Number(coupon.usage_limit)
    ) {
      throw new Error(`Coupon "${cleanCoupon}" has reached its usage limit.`);
    }
    const minOrder = Number(coupon.min_order_amount_inr ?? 0);
    if (subtotalInr < minOrder) {
      throw new Error(
        `Minimum order of ₹${minOrder.toLocaleString('en-IN')} is required for coupon "${cleanCoupon}".`
      );
    }

    const val = Number(coupon.discount_value ?? 0);
    if (coupon.discount_type === 'fixed') {
      discountInr = val;
    } else {
      discountInr = Math.round((subtotalInr * val) / 100);
      if (coupon.max_discount_inr !== null && coupon.max_discount_inr !== undefined) {
        discountInr = Math.min(discountInr, Number(coupon.max_discount_inr));
      }
    }

    discountInr = Math.min(subtotalInr, Math.max(0, discountInr));
    appliedCouponCode = coupon.code;
  }

  const { data: shippingSettings } = await admin
    .from('site_settings')
    .select('key, value')
    .in('key', ['free_shipping_threshold', 'standard_shipping_fee', 'express_shipping_fee']);

  const settingsMap = new Map<string, unknown>(
    (shippingSettings || []).map((row: { key: string; value: unknown }) => [row.key, row.value])
  );

  const parseSettingInt = (key: string, fallback: number): number => {
    const raw = settingsMap.get(key);
    const num = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(num) && num >= 0 ? Math.round(num) : fallback;
  };

  const freeShippingThreshold = parseSettingInt('free_shipping_threshold', 1999);
  const standardShippingFee = parseSettingInt('standard_shipping_fee', 99);
  const expressShippingFee = parseSettingInt('express_shipping_fee', 199);

  const shippingFeeInr =
    deliveryOption === 'express'
      ? expressShippingFee
      : subtotalInr === 0 || subtotalInr >= freeShippingThreshold
        ? 0
        : standardShippingFee;

  const totalInr = Math.max(0, subtotalInr - discountInr + shippingFeeInr);

  return {
    subtotalInr,
    discountInr,
    shippingFeeInr,
    totalInr,
    expectedAmountPaise: Math.round(totalInr * 100),
    appliedCouponCode,
  };
}

export async function upsertPaymentRecord(
  admin: any,
  input: {
    orderId: string;
    provider: string;
    providerOrderId?: string | null;
    providerPaymentId?: string | null;
    providerSignature?: string | null;
    amountInr: number;
    currency?: string;
    status: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    paymentMethodDetails?: Record<string, unknown> | null;
    errorCode?: string | null;
    errorDescription?: string | null;
  }
): Promise<{ paymentId: string | null }> {
  const nowIso = new Date().toISOString();

  let existingId: string | null = null;

  if (input.providerOrderId) {
    const { data } = await admin
      .from('payments')
      .select('id')
      .eq('provider', input.provider)
      .eq('provider_order_id', input.providerOrderId)
      .maybeSingle();
    if (data?.id) existingId = data.id;
  }

  if (!existingId && input.providerPaymentId) {
    const { data } = await admin
      .from('payments')
      .select('id')
      .eq('provider', input.provider)
      .eq('provider_payment_id', input.providerPaymentId)
      .maybeSingle();
    if (data?.id) existingId = data.id;
  }

  if (!existingId) {
    const { data } = await admin
      .from('payments')
      .select('id')
      .eq('order_id', input.orderId)
      .eq('provider', input.provider)
      .maybeSingle();
    if (data?.id) existingId = data.id;
  }

  if (existingId) {
    const updatePayload: Record<string, unknown> = {
      status: input.status,
      updated_at: nowIso,
    };
    if (input.providerOrderId !== undefined) updatePayload.provider_order_id = input.providerOrderId;
    if (input.providerPaymentId !== undefined) {
      updatePayload.provider_payment_id = input.providerPaymentId;
    }
    if (input.providerSignature !== undefined) {
      updatePayload.provider_signature = input.providerSignature;
    }
    if (input.paymentMethodDetails !== undefined) {
      updatePayload.payment_method_details = input.paymentMethodDetails;
    }
    if (input.errorCode !== undefined) updatePayload.error_code = input.errorCode;
    if (input.errorDescription !== undefined) {
      updatePayload.error_description = input.errorDescription;
    }

    await admin.from('payments').update(updatePayload).eq('id', existingId);
    return { paymentId: existingId };
  }

  const { data: inserted, error: insErr } = await admin
    .from('payments')
    .insert({
      order_id: input.orderId,
      provider: input.provider,
      provider_order_id: input.providerOrderId ?? null,
      provider_payment_id: input.providerPaymentId ?? null,
      provider_signature: input.providerSignature ?? null,
      amount_inr: input.amountInr,
      currency: input.currency || 'INR',
      status: input.status,
      payment_method_details: input.paymentMethodDetails ?? null,
      error_code: input.errorCode ?? null,
      error_description: input.errorDescription ?? null,
      updated_at: nowIso,
    })
    .select('id')
    .single();

  if (insErr && input.providerOrderId) {
    const { data: retryRow } = await admin
      .from('payments')
      .select('id')
      .eq('provider', input.provider)
      .eq('provider_order_id', input.providerOrderId)
      .maybeSingle();

    if (retryRow?.id) {
      await admin
        .from('payments')
        .update({
          provider_payment_id: input.providerPaymentId ?? null,
          provider_signature: input.providerSignature ?? null,
          status: input.status,
          payment_method_details: input.paymentMethodDetails ?? null,
          error_code: input.errorCode ?? null,
          error_description: input.errorDescription ?? null,
          updated_at: nowIso,
        })
        .eq('id', retryRow.id);
      return { paymentId: retryRow.id };
    }
  }

  return { paymentId: inserted?.id ?? null };
}

export async function fetchFullOrderWithRelations(admin: any, orderId: string) {
  const { data, error } = await admin
    .from('orders')
    .select('*, order_items (*), payments (*)')
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data;
}

export async function finalizePaidOrderFromSession(params: {
  admin: any;
  session: any;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string | null;
  rzpPayment?: any;
  sourceEvent: string;
  rawEventPayload: Record<string, unknown>;
}) {
  const {
    admin,
    session,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature = null,
    rzpPayment,
    sourceEvent,
    rawEventPayload,
  } = params;

  const nowIso = new Date().toISOString();
  const effectiveMethod = normalizePaymentMethod(rzpPayment?.method, session.payment_method);

  let orderId: string | null = session.order_id || null;
  let orderNumber: string | null = null;
  let existingOrderPaymentStatus: string | null = null;
  let existingOrderStatus: string | null = null;

  if (!orderId) {
    const { data: byKey } = await admin
      .from('orders')
      .select('id, order_number, payment_status, order_status')
      .eq('idempotency_key', razorpayOrderId)
      .maybeSingle();

    if (byKey?.id) {
      orderId = byKey.id;
      orderNumber = byKey.order_number;
      existingOrderPaymentStatus = byKey.payment_status;
      existingOrderStatus = byKey.order_status;
    }
  } else {
    const { data: existingOrder } = await admin
      .from('orders')
      .select('id, order_number, payment_status, order_status')
      .eq('id', orderId)
      .maybeSingle();

    if (existingOrder?.id) {
      orderNumber = existingOrder.order_number;
      existingOrderPaymentStatus = existingOrder.payment_status;
      existingOrderStatus = existingOrder.order_status;
    } else {
      orderId = null;
    }
  }

  if (!orderId) {
    const { data: checkoutResult, error: checkoutError } = await admin.rpc(
      'process_checkout_atomic',
      {
        p_user_id: session.user_id || null,
        p_customer_name: session.customer_name,
        p_customer_email: session.customer_email,
        p_customer_phone: session.customer_phone,
        p_billing_address: session.billing_address,
        p_shipping_address: session.shipping_address,
        p_cart_items: session.cart_items,
        p_coupon_code: session.coupon_code || '',
        p_payment_method: effectiveMethod,
        p_delivery_option: session.delivery_option || 'standard',
        p_idempotency_key: razorpayOrderId,
        p_customer_notes: session.customer_notes || null,
      }
    );

    if (checkoutError || !checkoutResult?.success || !checkoutResult?.order_id) {
      const errMsg =
        checkoutError?.message || checkoutResult?.error || 'Failed to finalize paid order.';

      await admin
        .from('checkout_sessions')
        .update({
          status: 'failed',
          razorpay_payment_id: razorpayPaymentId,
          error_code: 'FINALIZE_ORDER_FAILED',
          error_description: errMsg,
          updated_at: nowIso,
        })
        .eq('id', session.id);

      throw new Error(errMsg);
    }

    orderId = checkoutResult.order_id;
    orderNumber = checkoutResult.order_number;

    if (checkoutResult.is_duplicate && orderId) {
      const { data: latestOrd } = await admin
        .from('orders')
        .select('payment_status, order_status')
        .eq('id', orderId)
        .maybeSingle();
      if (latestOrd) {
        existingOrderPaymentStatus = latestOrd.payment_status;
        existingOrderStatus = latestOrd.order_status;
      }
    }
  }

  if (!orderId) {
    throw new Error('Could not resolve finalized order ID.');
  }

  const orderUpdate: Record<string, unknown> = {
    payment_status: 'paid',
    payment_method: effectiveMethod,
    updated_at: nowIso,
  };
  if (!existingOrderStatus || existingOrderStatus === 'pending') {
    orderUpdate.order_status = 'confirmed';
  }

  const { data: transitionedOrder } = await admin
    .from('orders')
    .update(orderUpdate)
    .eq('id', orderId)
    .neq('payment_status', 'paid')
    .select('id')
    .maybeSingle();

  if (transitionedOrder?.id) {
    await admin.from('order_status_history').insert({
      order_id: orderId,
      previous_status: (existingOrderStatus as any) || 'confirmed',
      new_status: (orderUpdate.order_status as any) || (existingOrderStatus as any) || 'confirmed',
      note: `Razorpay payment verified (${razorpayPaymentId}) via ${sourceEvent}.`,
    });
  }

  const paymentMethodDetails = extractPaymentMethodDetails(rzpPayment);

  const { paymentId } = await upsertPaymentRecord(admin, {
    orderId,
    provider: 'razorpay',
    providerOrderId: razorpayOrderId,
    providerPaymentId: razorpayPaymentId,
    providerSignature: razorpaySignature,
    amountInr: Number(session.total_inr ?? 0),
    currency: session.currency || 'INR',
    status: 'paid',
    paymentMethodDetails,
    errorCode: null,
    errorDescription: null,
  });

  if (paymentId) {
    await admin.from('payment_events').insert({
      payment_id: paymentId,
      event_type: sourceEvent,
      payload: rawEventPayload,
    });
  }

  const { data: transitionedSession } = await admin
    .from('checkout_sessions')
    .update({
      status: 'paid',
      razorpay_payment_id: razorpayPaymentId,
      order_id: orderId,
      error_code: null,
      error_description: null,
      updated_at: nowIso,
    })
    .eq('id', session.id)
    .neq('status', 'paid')
    .select('id')
    .maybeSingle();

  if (session.user_id && transitionedSession?.id) {
    await admin.from('customer_activity_logs').insert({
      user_id: session.user_id,
      activity_type: 'payment_completed',
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount_inr: session.total_inr,
        method: effectiveMethod,
        source: sourceEvent,
      },
    });
  }

  const fullOrder = await fetchFullOrderWithRelations(admin, orderId);

  return {
    orderId,
    orderNumber: orderNumber || fullOrder?.order_number,
    order: fullOrder,
    paymentId,
  };
}
