/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseClient } from '../_shared/supabaseClient.ts';
import {
  computeServerCheckoutSummary,
  createRazorpayOrder,
  fetchFullOrderWithRelations,
  getRazorpayConfig,
  jsonResponse,
  normalizePaymentMethod,
  upsertPaymentRecord,
  type NormalizedCartItem,
} from '../_shared/razorpay.ts';

const ALLOWED_METHODS = new Set(['upi', 'card', 'netbanking', 'wallet', 'cod']);
const ALLOWED_DELIVERY = new Set(['standard', 'express']);

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabase = getSupabaseClient(req);
    const admin = getSupabaseAdmin();

    // Resolve authenticated user cleanly from JWT if signed in (ignore spoofed client userId)
    let resolvedUserId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        resolvedUserId = user.id;
      }
    } catch {
      resolvedUserId = null;
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Invalid checkout request payload.' }, 400);
    }

    const customerName = String(body.customerName || '').trim();
    const customerEmail = String(body.customerEmail || '').trim().toLowerCase();
    const customerPhone = String(body.customerPhone || '').trim();
    const billingAddress = body.billingAddress || body.shippingAddress;
    const shippingAddress = body.shippingAddress;
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const couponCode = body.couponCode ? String(body.couponCode).trim() : null;
    const paymentMethod = normalizePaymentMethod(body.paymentMethod, 'upi');
    const deliveryOption = ALLOWED_DELIVERY.has(String(body.deliveryOption || '').toLowerCase())
      ? String(body.deliveryOption).toLowerCase()
      : 'standard';
    const customerNotes = body.orderNotes ? String(body.orderNotes).trim() : null;
    const rawIdem =
      String(body.idempotencyKey || req.headers.get('idempotency-key') || '').trim() ||
      `idem-${crypto.randomUUID()}`;

    if (!rawItems.length) {
      return jsonResponse({ error: 'Cart cannot be empty.' }, 400);
    }
    if (!customerName) {
      return jsonResponse({ error: 'Customer full name is required.' }, 400);
    }
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return jsonResponse({ error: 'A valid email address is required.' }, 400);
    }
    if (customerPhone.replace(/\D/g, '').length < 10) {
      return jsonResponse({ error: 'A valid 10-digit phone number is required.' }, 400);
    }
    if (
      !shippingAddress ||
      !String(shippingAddress.streetAddress || '').trim() ||
      !String(shippingAddress.city || '').trim() ||
      !String(shippingAddress.state || '').trim() ||
      !/^\d{6}$/.test(String(shippingAddress.pincode || '').trim())
    ) {
      return jsonResponse({ error: 'Please provide a complete valid shipping address and 6-digit PIN code.' }, 400);
    }
    if (!ALLOWED_METHODS.has(paymentMethod)) {
      return jsonResponse({ error: 'Unsupported payment method selected.' }, 400);
    }

    const cartItems: NormalizedCartItem[] = rawItems.map((item: any) => ({
      product_id: String(item.productId || item.product?.id || '').trim(),
      variant_id: item.variantId ? String(item.variantId).trim() : null,
      quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
    }));

    if (cartItems.some((item) => !item.product_id)) {
      return jsonResponse({ error: 'One or more cart items are invalid.' }, 400);
    }

    let summary;
    try {
      summary = await computeServerCheckoutSummary(admin, cartItems, couponCode, deliveryOption);
    } catch (validationErr: any) {
      return jsonResponse(
        { error: validationErr?.message || 'Unable to validate cart totals.' },
        400
      );
    }

    // Branch 1: Cash on Delivery — create atomic order immediately
    if (paymentMethod === 'cod') {
      const { data: checkoutResult, error: checkoutError } = await admin.rpc(
        'process_checkout_atomic',
        {
          p_user_id: resolvedUserId,
          p_customer_name: customerName,
          p_customer_email: customerEmail,
          p_customer_phone: customerPhone,
          p_billing_address: billingAddress,
          p_shipping_address: shippingAddress,
          p_cart_items: cartItems,
          p_coupon_code: summary.appliedCouponCode || '',
          p_payment_method: 'cod',
          p_delivery_option: deliveryOption,
          p_idempotency_key: rawIdem,
          p_customer_notes: customerNotes,
        }
      );

      if (checkoutError || !checkoutResult?.success || !checkoutResult?.order_id) {
        return jsonResponse(
          {
            error:
              checkoutError?.message ||
              checkoutResult?.error ||
              'Failed to place Cash on Delivery order.',
          },
          400
        );
      }

      const orderId = checkoutResult.order_id;
      const orderNumber = checkoutResult.order_number;
      const totalInr = Number(checkoutResult.total_inr ?? summary.totalInr);

      await upsertPaymentRecord(admin, {
        orderId,
        provider: 'cod',
        providerOrderId: orderNumber,
        amountInr: totalInr,
        currency: 'INR',
        status: 'pending',
        paymentMethodDetails: {
          method: 'cod',
          delivery_option: deliveryOption,
        },
      });

      const fullOrder = await fetchFullOrderWithRelations(admin, orderId);

      return jsonResponse({
        success: true,
        flow: 'cod',
        orderId,
        orderNumber,
        total: totalInr,
        order: fullOrder,
      });
    }

    // Branch 2: Razorpay Online Payment — verify server config and create a Razorpay Order
    const { keyId, keySecret } = getRazorpayConfig();
    if (!keyId || !keySecret) {
      return jsonResponse(
        {
          error:
            'Razorpay is not configured on the server yet. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase Edge Function Secrets.',
          code: 'RAZORPAY_NOT_CONFIGURED',
        },
        503
      );
    }

    if (summary.expectedAmountPaise < 100) {
      return jsonResponse(
        {
          error:
            'Online payments require a payable amount of at least ₹1. Please choose Cash on Delivery for zero-value orders.',
        },
        400
      );
    }

    // Idempotency check on existing checkout session
    const { data: existingSession } = await admin
      .from('checkout_sessions')
      .select('*')
      .eq('idempotency_key', rawIdem)
      .maybeSingle();

    if (existingSession) {
      if (existingSession.status === 'paid' && existingSession.order_id) {
        const existingOrder = await fetchFullOrderWithRelations(admin, existingSession.order_id);
        return jsonResponse({
          success: true,
          flow: 'razorpay',
          alreadyPaid: true,
          checkoutSessionId: existingSession.id,
          orderId: existingSession.order_id,
          orderNumber: existingOrder?.order_number,
          total: existingSession.total_inr,
          order: existingOrder,
        });
      }

      if (
        existingSession.status === 'created' &&
        existingSession.razorpay_order_id &&
        existingSession.expected_amount_paise === summary.expectedAmountPaise
      ) {
        return jsonResponse({
          success: true,
          flow: 'razorpay',
          checkoutSessionId: existingSession.id,
          keyId,
          razorpayOrderId: existingSession.razorpay_order_id,
          amountInPaise: existingSession.expected_amount_paise,
          currency: existingSession.currency || 'INR',
          subtotal: existingSession.subtotal_inr,
          discount: existingSession.discount_inr,
          shippingFee: existingSession.shipping_fee_inr,
          total: existingSession.total_inr,
          paymentGateway: {
            provider: 'razorpay',
            gatewayOrderId: existingSession.razorpay_order_id,
            amountInPaise: existingSession.expected_amount_paise,
            currency: existingSession.currency || 'INR',
            keyId,
          },
        });
      }
    }

    const sessionId = existingSession?.id || crypto.randomUUID();
    const receipt = `dor_${sessionId.replace(/-/g, '').slice(0, 32)}`;

    const rzpOrder = await createRazorpayOrder({
      keyId,
      keySecret,
      amountInPaise: summary.expectedAmountPaise,
      currency: 'INR',
      receipt,
      notes: {
        checkout_session_id: sessionId,
        customer_name: customerName.slice(0, 120),
        customer_email: customerEmail.slice(0, 120),
        delivery_option: deliveryOption,
      },
    });

    if (!rzpOrder?.id) {
      return jsonResponse({ error: 'Razorpay did not return a valid order ID.' }, 502);
    }

    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const sessionRecord = {
      id: sessionId,
      user_id: resolvedUserId,
      idempotency_key: rawIdem,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      billing_address: billingAddress,
      shipping_address: shippingAddress,
      cart_items: cartItems,
      coupon_code: summary.appliedCouponCode,
      payment_method: paymentMethod,
      delivery_option: deliveryOption,
      customer_notes: customerNotes,
      subtotal_inr: summary.subtotalInr,
      discount_inr: summary.discountInr,
      shipping_fee_inr: summary.shippingFeeInr,
      total_inr: summary.totalInr,
      expected_amount_paise: summary.expectedAmountPaise,
      currency: 'INR',
      razorpay_order_id: rzpOrder.id,
      razorpay_payment_id: null,
      status: 'created',
      error_code: null,
      error_description: null,
      expires_at: expiresIso,
      updated_at: nowIso,
    };

    const { error: sessionErr } = existingSession
      ? await admin.from('checkout_sessions').update(sessionRecord).eq('id', sessionId)
      : await admin.from('checkout_sessions').insert(sessionRecord);

    if (sessionErr) {
      throw new Error(sessionErr.message || 'Failed to store Razorpay checkout session.');
    }

    return jsonResponse({
      success: true,
      flow: 'razorpay',
      checkoutSessionId: sessionId,
      keyId,
      razorpayOrderId: rzpOrder.id,
      amountInPaise: summary.expectedAmountPaise,
      currency: 'INR',
      subtotal: summary.subtotalInr,
      discount: summary.discountInr,
      shippingFee: summary.shippingFeeInr,
      total: summary.totalInr,
      paymentGateway: {
        provider: 'razorpay',
        gatewayOrderId: rzpOrder.id,
        amountInPaise: summary.expectedAmountPaise,
        currency: 'INR',
        keyId,
      },
    });
  } catch (err: any) {
    console.error('[create-checkout] Error:', err);
    return jsonResponse({ error: err?.message || 'Internal Server Error' }, 500);
  }
});
