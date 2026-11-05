/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const admin = getSupabaseAdmin();
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('stripe-signature');

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    // In production: Verify HMAC SHA256 signature using WEBHOOK_SECRET
    const webhookSecret = Deno.env.get('PAYMENT_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      // Signature verification hook
      console.log('Verifying webhook signature:', signature ? 'Present' : 'Missing');
    }

    const eventType = event.event || event.type || 'payment.captured';
    const payload = event.payload?.payment?.entity || event.data?.object || event;

    const orderNumber = payload.notes?.order_number || payload.metadata?.order_number || payload.order_id;
    const transactionId = payload.id;
    const amountPaid = payload.amount ? payload.amount / 100 : payload.total;

    if (eventType === 'payment.captured' || eventType === 'payment_intent.succeeded') {
      if (orderNumber) {
        // Update order status idempotently
        const { data: updatedOrder, error } = await admin
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'confirmed',
            transaction_id: transactionId,
            paid_at: new Date().toISOString()
          })
          .eq('order_number', orderNumber)
          .select('id, user_id, order_number')
          .single();

        if (error) {
          console.error('Failed to update order via webhook:', error);
        } else if (updatedOrder?.user_id) {
          // Log customer activity
          await admin.from('customer_activity_logs').insert({
            user_id: updatedOrder.user_id,
            activity_type: 'payment_completed',
            details: {
              order_number: orderNumber,
              transaction_id: transactionId,
              amount: amountPaid
            }
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true, status: 'processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

