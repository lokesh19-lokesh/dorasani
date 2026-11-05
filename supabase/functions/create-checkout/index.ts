/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseClient } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const admin = getSupabaseAdmin();

    const body = await req.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      billingAddress,
      shippingAddress,
      items,
      couponCode,
      paymentMethod = 'upi',
      deliveryOption = 'standard',
      idempotencyKey = req.headers.get('idempotency-key') || `idem-${Date.now()}`
    } = body;

    if (!items || !items.length) {
      return new Response(
        JSON.stringify({ error: 'Cart cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format items for atomic checkout RPC
    const cartItems = items.map((item: any) => ({
      product_id: item.productId || item.product?.id,
      variant_id: item.variantId || null,
      quantity: Number(item.quantity) || 1
    }));

    // Invoke atomic checkout PostgreSQL function
    const { data: checkoutResult, error: checkoutError } = await admin.rpc('process_checkout_atomic', {
      p_user_id: userId || null,
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone,
      p_billing_address: billingAddress,
      p_shipping_address: shippingAddress,
      p_cart_items: cartItems,
      p_coupon_code: couponCode || null,
      p_payment_method: paymentMethod,
      p_delivery_option: deliveryOption,
      p_idempotency_key: idempotencyKey
    });

    if (checkoutError || !checkoutResult?.success) {
      return new Response(
        JSON.stringify({
          error: checkoutError?.message || checkoutResult?.error || 'Failed to process checkout'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const order = checkoutResult.order;

    // Simulate / Initialize Razorpay or PG Order
    const paymentGatewayDetails = {
      provider: paymentMethod === 'cod' ? 'cash_on_delivery' : 'razorpay',
      gatewayOrderId: `rzp_order_${order.order_number}`,
      amountInPaise: Math.round(order.total_inr * 100),
      currency: 'INR',
      keyId: Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_dorasani_mock_key'
    };

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total_inr,
        paymentGateway: paymentGatewayDetails
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

