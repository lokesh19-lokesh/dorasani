/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseClient.ts';
import {
  captureRazorpayPayment,
  fetchFullOrderWithRelations,
  fetchRazorpayPayment,
  finalizePaidOrderFromSession,
  getRazorpayConfig,
  jsonResponse,
  verifyRazorpayPaymentSignature,
} from '../_shared/razorpay.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const admin = getSupabaseAdmin();
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Invalid verification request payload.' }, 400);
    }

    const action = String(body.action || 'verify').trim().toLowerCase();
    const checkoutSessionId = body.checkoutSessionId ? String(body.checkoutSessionId).trim() : null;
    const razorpayOrderId = body.razorpayOrderId
      ? String(body.razorpayOrderId).trim()
      : body.razorpay_order_id
      ? String(body.razorpay_order_id).trim()
      : null;
    const razorpayPaymentId = body.razorpayPaymentId
      ? String(body.razorpayPaymentId).trim()
      : body.razorpay_payment_id
      ? String(body.razorpay_payment_id).trim()
      : null;
    const razorpaySignature = body.razorpaySignature
      ? String(body.razorpaySignature).trim()
      : body.razorpay_signature
      ? String(body.razorpay_signature).trim()
      : null;

    // Look up session by razorpay_order_id or checkoutSessionId
    let session: any = null;
    if (razorpayOrderId) {
      const { data } = await admin
        .from('checkout_sessions')
        .select('*')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle();
      session = data;
    }
    if (!session && checkoutSessionId) {
      const { data } = await admin
        .from('checkout_sessions')
        .select('*')
        .eq('id', checkoutSessionId)
        .maybeSingle();
      session = data;
    }

    // Handle cancellation or payment failure telemetry without creating an unpaid confirmed order
    if (action === 'mark_cancelled' || action === 'mark_failed') {
      if (!session) {
        return jsonResponse({ success: true, status: action });
      }

      // If webhook already finalized this payment, return the paid order cleanly
      if (session.status === 'paid' && session.order_id) {
        const paidOrder = await fetchFullOrderWithRelations(admin, session.order_id);
        return jsonResponse({
          success: true,
          alreadyPaid: true,
          orderId: session.order_id,
          orderNumber: paidOrder?.order_number,
          total: session.total_inr,
          order: paidOrder,
        });
      }

      const nextStatus = action === 'mark_cancelled' ? 'cancelled' : 'failed';
      await admin
        .from('checkout_sessions')
        .update({
          status: nextStatus,
          razorpay_payment_id: razorpayPaymentId || session.razorpay_payment_id,
          error_code: body.errorCode ? String(body.errorCode) : null,
          error_description: body.errorDescription
            ? String(body.errorDescription)
            : action === 'mark_cancelled'
            ? 'Customer closed payment window before completing payment.'
            : 'Payment failed in Razorpay checkout.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      return jsonResponse({
        success: true,
        status: nextStatus,
        checkoutSessionId: session.id,
      });
    }

    // Verification flow
    const { keyId, keySecret } = getRazorpayConfig();
    if (!keyId || !keySecret) {
      return jsonResponse(
        {
          error:
            'Razorpay server credentials are missing. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
          code: 'RAZORPAY_NOT_CONFIGURED',
        },
        503
      );
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return jsonResponse(
        { error: 'Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.' },
        400
      );
    }

    if (!session) {
      return jsonResponse({ error: 'Checkout session not found for this Razorpay order.' }, 404);
    }

    if (checkoutSessionId && session.id !== checkoutSessionId) {
      return jsonResponse({ error: 'Checkout session mismatch.' }, 400);
    }

    const signatureValid = await verifyRazorpayPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      keySecret,
    });

    if (!signatureValid) {
      return jsonResponse({ error: 'Razorpay payment signature verification failed.' }, 400);
    }

    // Fast idempotent return if already fulfilled (e.g. webhook landed first)
    if (session.status === 'paid' && session.order_id) {
      const existingOrder = await fetchFullOrderWithRelations(admin, session.order_id);
      return jsonResponse({
        success: true,
        alreadyPaid: true,
        orderId: session.order_id,
        orderNumber: existingOrder?.order_number,
        total: existingOrder?.total_inr ?? session.total_inr,
        order: existingOrder,
      });
    }

    // Fetch authoritative payment state directly from Razorpay REST API
    let rzpPayment = await fetchRazorpayPayment({
      keyId,
      keySecret,
      paymentId: razorpayPaymentId,
    });

    if (rzpPayment.order_id && rzpPayment.order_id !== razorpayOrderId) {
      return jsonResponse({ error: 'Razorpay payment does not match this order.' }, 400);
    }

    if (Number(rzpPayment.amount) !== Number(session.expected_amount_paise)) {
      return jsonResponse(
        {
          error: `Payment amount mismatch (expected ₹${session.total_inr}, got ₹${Number(rzpPayment.amount || 0) / 100}).`,
        },
        400
      );
    }

    if (
      rzpPayment.currency &&
      String(rzpPayment.currency).toUpperCase() !== String(session.currency || 'INR').toUpperCase()
    ) {
      return jsonResponse({ error: 'Payment currency mismatch.' }, 400);
    }

    if (rzpPayment.status === 'authorized') {
      rzpPayment = await captureRazorpayPayment({
        keyId,
        keySecret,
        paymentId: razorpayPaymentId,
        amountInPaise: Number(session.expected_amount_paise),
        currency: session.currency || 'INR',
      });
    }

    if (rzpPayment.status !== 'captured') {
      await admin
        .from('checkout_sessions')
        .update({
          status: 'failed',
          razorpay_payment_id: razorpayPaymentId,
          error_code: rzpPayment.error_code || 'PAYMENT_NOT_CAPTURED',
          error_description:
            rzpPayment.error_description ||
            `Payment status is "${rzpPayment.status}" instead of captured.`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      return jsonResponse(
        {
          error:
            rzpPayment.error_description ||
            `Payment has not been captured (current status: ${rzpPayment.status}).`,
        },
        400
      );
    }

    const result = await finalizePaidOrderFromSession({
      admin,
      session,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      rzpPayment,
      sourceEvent: 'client.verify',
      rawEventPayload: {
        verified_by: 'verify-razorpay-payment',
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        payment: rzpPayment,
      },
    });

    return jsonResponse({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: Number(result.order?.total_inr ?? session.total_inr),
      order: result.order,
    });
  } catch (err: any) {
    console.error('[verify-razorpay-payment] Error:', err);
    return jsonResponse({ error: err?.message || 'Payment verification failed.' }, 500);
  }
});
