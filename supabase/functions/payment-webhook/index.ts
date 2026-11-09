/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseClient.ts';
import {
  extractPaymentMethodDetails,
  finalizePaidOrderFromSession,
  getRazorpayWebhookSecret,
  jsonResponse,
  normalizePaymentMethod,
  upsertPaymentRecord,
  verifyRazorpayWebhookSignature,
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
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = getRazorpayWebhookSecret();

    if (!webhookSecret) {
      return jsonResponse(
        { error: 'RAZORPAY_WEBHOOK_SECRET is not configured on the server.' },
        503
      );
    }

    if (!signature) {
      return jsonResponse({ error: 'Missing x-razorpay-signature header.' }, 401);
    }

    const validSignature = await verifyRazorpayWebhookSignature({
      rawBody,
      signature,
      webhookSecret,
    });

    if (!validSignature) {
      return jsonResponse({ error: 'Invalid webhook signature.' }, 401);
    }

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: 'Invalid webhook JSON payload.' }, 400);
    }

    const eventType = String(event?.event || '');
    const paymentEntity = event?.payload?.payment?.entity || null;
    const orderEntity = event?.payload?.order?.entity || null;
    const refundEntity = event?.payload?.refund?.entity || null;
    const nowIso = new Date().toISOString();

    // 1. Captured / Order Paid events — idempotently fulfill checkout session or mark order paid
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null;
      const razorpayPaymentId = paymentEntity?.id || null;

      if (razorpayOrderId) {
        const { data: session } = await admin
          .from('checkout_sessions')
          .select('*')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle();

        if (session) {
          if (
            paymentEntity?.amount &&
            Number(paymentEntity.amount) < Number(session.expected_amount_paise)
          ) {
            return jsonResponse(
              {
                error: 'Captured webhook amount is lower than expected checkout total.',
              },
              400
            );
          }

          if (
            paymentEntity?.currency &&
            String(paymentEntity.currency).toUpperCase() !==
              String(session.currency || 'INR').toUpperCase()
          ) {
            return jsonResponse(
              { error: 'Captured webhook currency does not match checkout session currency.' },
              400
            );
          }

          await finalizePaidOrderFromSession({
            admin,
            session,
            razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || `rzp_paid_${razorpayOrderId}`,
            razorpaySignature: null,
            rzpPayment: paymentEntity,
            sourceEvent: `webhook.${eventType}`,
            rawEventPayload: event,
          });

          return jsonResponse({ received: true, event: eventType, status: 'fulfilled' });
        }
      }

      // Direct fallback if order already exists without checkout_sessions
      const fallbackOrderNumber =
        paymentEntity?.notes?.order_number || orderEntity?.notes?.order_number || null;

      let existingPayment: any = null;
      if (razorpayOrderId) {
        const { data } = await admin
          .from('payments')
          .select('id, order_id')
          .eq('provider', 'razorpay')
          .eq('provider_order_id', razorpayOrderId)
          .maybeSingle();
        existingPayment = data;
      }

      let orderId: string | null = existingPayment?.order_id || null;
      let amountInr = paymentEntity?.amount ? Math.round(Number(paymentEntity.amount) / 100) : 0;

      if (!orderId && fallbackOrderNumber) {
        const { data: ord } = await admin
          .from('orders')
          .select('id, total_inr')
          .eq('order_number', fallbackOrderNumber)
          .maybeSingle();
        if (ord?.id) {
          orderId = ord.id;
          amountInr = Number(ord.total_inr ?? amountInr);
        }
      }

      if (orderId) {
        const { data: currentOrder } = await admin
          .from('orders')
          .select('order_status, payment_method, total_inr')
          .eq('id', orderId)
          .single();

        const updateFields: Record<string, unknown> = {
          payment_status: 'paid',
          payment_method: normalizePaymentMethod(
            paymentEntity?.method,
            currentOrder?.payment_method || 'razorpay'
          ),
          updated_at: nowIso,
        };
        if (!currentOrder?.order_status || currentOrder.order_status === 'pending') {
          updateFields.order_status = 'confirmed';
        }

        await admin.from('orders').update(updateFields).eq('id', orderId);

        const { paymentId } = await upsertPaymentRecord(admin, {
          orderId,
          provider: 'razorpay',
          providerOrderId: razorpayOrderId,
          providerPaymentId: razorpayPaymentId,
          amountInr: Number(currentOrder?.total_inr ?? amountInr),
          currency: paymentEntity?.currency || 'INR',
          status: 'paid',
          paymentMethodDetails: extractPaymentMethodDetails(paymentEntity),
        });

        if (paymentId) {
          await admin.from('payment_events').insert({
            payment_id: paymentId,
            event_type: `webhook.${eventType}`,
            payload: event,
          });
        }
      }

      return jsonResponse({ received: true, event: eventType, status: 'processed' });
    }

    // 2. Payment Authorized (before capture if manual capture is enabled)
    if (eventType === 'payment.authorized') {
      const razorpayOrderId = paymentEntity?.order_id || null;
      const razorpayPaymentId = paymentEntity?.id || null;

      if (razorpayOrderId) {
        const { data: session } = await admin
          .from('checkout_sessions')
          .select('id, order_id, total_inr, status')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle();

        if (session?.order_id && session.status !== 'paid') {
          await admin
            .from('orders')
            .update({ payment_status: 'authorized', updated_at: nowIso })
            .eq('id', session.order_id);

          const { paymentId } = await upsertPaymentRecord(admin, {
            orderId: session.order_id,
            provider: 'razorpay',
            providerOrderId: razorpayOrderId,
            providerPaymentId: razorpayPaymentId,
            amountInr: Number(session.total_inr ?? 0),
            currency: paymentEntity?.currency || 'INR',
            status: 'authorized',
            paymentMethodDetails: extractPaymentMethodDetails(paymentEntity),
          });

          if (paymentId) {
            await admin.from('payment_events').insert({
              payment_id: paymentId,
              event_type: 'webhook.payment.authorized',
              payload: event,
            });
          }
        }
      }

      return jsonResponse({ received: true, event: eventType, status: 'acknowledged' });
    }

    // 3. Payment Failed
    if (eventType === 'payment.failed') {
      const razorpayOrderId = paymentEntity?.order_id || null;
      const razorpayPaymentId = paymentEntity?.id || null;
      const errCode = paymentEntity?.error_code || null;
      const errDesc =
        paymentEntity?.error_description ||
        paymentEntity?.error_reason ||
        'Payment failed at Razorpay gateway.';

      if (razorpayOrderId) {
        const { data: session } = await admin
          .from('checkout_sessions')
          .select('id, status, order_id, total_inr')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle();

        if (session && session.status !== 'paid') {
          await admin
            .from('checkout_sessions')
            .update({
              status: 'failed',
              razorpay_payment_id: razorpayPaymentId,
              error_code: errCode,
              error_description: errDesc,
              updated_at: nowIso,
            })
            .eq('id', session.id);

          if (session.order_id) {
            await admin
              .from('orders')
              .update({ payment_status: 'failed', updated_at: nowIso })
              .eq('id', session.order_id);

            const { paymentId } = await upsertPaymentRecord(admin, {
              orderId: session.order_id,
              provider: 'razorpay',
              providerOrderId: razorpayOrderId,
              providerPaymentId: razorpayPaymentId,
              amountInr: Number(session.total_inr ?? 0),
              currency: paymentEntity?.currency || 'INR',
              status: 'failed',
              paymentMethodDetails: extractPaymentMethodDetails(paymentEntity),
              errorCode: errCode,
              errorDescription: errDesc,
            });

            if (paymentId) {
              await admin.from('payment_events').insert({
                payment_id: paymentId,
                event_type: 'webhook.payment.failed',
                payload: event,
              });
            }
          }
        }
      }

      return jsonResponse({ received: true, event: eventType, status: 'recorded_failure' });
    }

    // 4. Refunds (created / processed)
    if (
      eventType === 'refund.created' ||
      eventType === 'refund.processed' ||
      eventType === 'payment.refunded'
    ) {
      const targetPaymentId = refundEntity?.payment_id || paymentEntity?.id || null;
      if (targetPaymentId) {
        const { data: paymentRow } = await admin
          .from('payments')
          .select('id, order_id, amount_inr')
          .eq('provider', 'razorpay')
          .eq('provider_payment_id', targetPaymentId)
          .maybeSingle();

        if (paymentRow?.id && paymentRow?.order_id) {
          const totalPaidPaise = Math.round(Number(paymentRow.amount_inr ?? 0) * 100);
          const refundedPaise = Number(
            paymentEntity?.amount_refunded ?? refundEntity?.amount ?? totalPaidPaise
          );
          const isFullRefund = totalPaidPaise > 0 ? refundedPaise >= totalPaidPaise : true;
          const nextPaymentStatus = isFullRefund ? 'refunded' : 'partially_refunded';

          await admin
            .from('payments')
            .update({ status: nextPaymentStatus, updated_at: nowIso })
            .eq('id', paymentRow.id);

          const orderPatch: Record<string, unknown> = {
            payment_status: nextPaymentStatus,
            updated_at: nowIso,
          };
          if (isFullRefund && eventType === 'refund.processed') {
            orderPatch.order_status = 'refunded';
          }

          await admin.from('orders').update(orderPatch).eq('id', paymentRow.order_id);

          await admin.from('payment_events').insert({
            payment_id: paymentRow.id,
            event_type: `webhook.${eventType}`,
            payload: event,
          });
        }
      }

      return jsonResponse({ received: true, event: eventType, status: 'refund_synced' });
    }

    return jsonResponse({ received: true, event: eventType, status: 'ignored' });
  } catch (err: any) {
    console.error('[payment-webhook] Error:', err);
    return jsonResponse({ error: err?.message || 'Webhook processing failed' }, 500);
  }
});
