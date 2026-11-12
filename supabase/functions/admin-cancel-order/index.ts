/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseClient } from '../_shared/supabaseClient.ts';
import { cancelDelhiveryShipment, getDelhiveryRuntimeConfig } from '../_shared/delhivery.ts';
import {
  createRazorpayRefund,
  fetchFullOrderWithRelations,
  getRazorpayConfig,
  jsonResponse,
} from '../_shared/razorpay.ts';

const ALLOWED_ROLES = [
  'super_admin',
  'admin',
  'catalog_manager',
  'inventory_manager',
  'order_manager',
];

function formatWhatsAppDigits(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildCancellationMessage(params: {
  customerName: string;
  orderNumber: string;
  itemsSummary: string;
  reason: string;
  totalInr: number;
  refundIssued: boolean;
  refundReference?: string | null;
  refundStatus?: string | null;
  supportEmail: string;
  supportPhone: string;
  customMessage?: string;
}): string {
  if (params.customMessage && params.customMessage.trim()) {
    return params.customMessage.trim();
  }

  const refundParagraph = params.refundIssued
    ? `A full refund of ₹${params.totalInr.toLocaleString('en-IN')} has been ${
        params.refundStatus === 'processed' ? 'processed' : 'initiated'
      } to your original payment method${
        params.refundReference ? ` (Refund Reference ID: ${params.refundReference})` : ''
      }. It typically reflects in your account within 5–7 business days.`
    : `No online payment refund is pending for this order.`;

  return [
    `Dear ${params.customerName || 'Valued Patron'},`,
    '',
    `We sincerely apologize for the inconvenience and disappointment caused. Unfortunately, your DORASANI order #${params.orderNumber}${
      params.itemsSummary ? ` (${params.itemsSummary})` : ''
    } had to be cancelled because ${params.reason}.`,
    '',
    refundParagraph,
    '',
    `If you would like help choosing a similar handloom saree or need assistance, please reach out to us at ${params.supportEmail} or ${params.supportPhone}. Thank you for your patience and understanding.`,
    '',
    'Warm regards,',
    'DORASANI — A Symbol of Tradition',
  ].join('\n');
}

async function trySendCancellationEmail(params: {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  subject: string;
  messageText: string;
  reason: string;
  totalInr: number;
  refundIssued: boolean;
  refundReference?: string | null;
  supportEmail: string;
  supportPhone: string;
}): Promise<{ sent: boolean; provider: string; error?: string; id?: string }> {
  const resendApiKey = (Deno.env.get('RESEND_API_KEY') || '').trim();
  if (!resendApiKey) {
    return { sent: false, provider: 'none' };
  }

  const fromEmail = (
    Deno.env.get('RESEND_FROM_EMAIL') || `DORASANI <${params.supportEmail || 'onboarding@resend.dev'}>`
  ).trim();

  const html = `
  <div style="font-family: Georgia, serif; background:#FAF5EE; padding:24px; color:#1A3B2B;">
    <div style="max-width:600px; margin:0 auto; background:#FFFFFF; border:1px solid #D8C7B5; border-radius:16px; overflow:hidden;">
      <div style="background:#285A3C; color:#FFFFFF; padding:20px 24px;">
        <h1 style="margin:0; font-size:20px; letter-spacing:1px;">DORASANI</h1>
        <p style="margin:4px 0 0; font-size:12px; color:#D0E9C0;">Order Update • #${escapeHtml(params.orderNumber)}</p>
      </div>
      <div style="padding:24px; font-family: Arial, sans-serif; font-size:14px; line-height:1.65; color:#3A443D;">
        ${params.messageText
          .split('\n\n')
          .map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
          .join('')}
        ${
          params.refundIssued
            ? `<div style="margin:18px 0; padding:14px 16px; background:#F3F8F1; border:1px solid #BCD8AA; border-radius:10px;">
                <strong style="color:#1A3B2B; display:block; margin-bottom:4px;">Refund Summary</strong>
                <div>Amount: <strong>₹${params.totalInr.toLocaleString('en-IN')}</strong></div>
                ${
                  params.refundReference
                    ? `<div>Refund Reference ID: <code style="font-family:monospace; background:#FFFFFF; padding:2px 6px; border-radius:4px;">${escapeHtml(params.refundReference)}</code></div>`
                    : ''
                }
              </div>`
            : ''
        }
        <hr style="border:0; border-top:1px solid #E8DCCF; margin:20px 0;"/>
        <p style="font-size:12px; color:#647268; margin:0;">
          Need help? Contact us at ${escapeHtml(params.supportEmail)} or ${escapeHtml(params.supportPhone)}.
        </p>
      </div>
    </div>
  </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.toEmail],
        subject: params.subject,
        text: params.messageText,
        html,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        sent: false,
        provider: 'resend',
        error: data?.message || data?.error || `Resend failed (${res.status})`,
      };
    }
    return { sent: true, provider: 'resend', id: data?.id };
  } catch (err: any) {
    return { sent: false, provider: 'resend', error: err?.message || 'Email request failed.' };
  }
}

async function trySendCancellationWhatsApp(params: {
  phoneDigits: string;
  messageText: string;
}): Promise<{ sent: boolean; provider: string; error?: string; id?: string }> {
  if (!params.phoneDigits) {
    return { sent: false, provider: 'none', error: 'Customer phone number is missing.' };
  }

  // Option A: Meta WhatsApp Cloud API
  const waToken = (Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '').trim();
  const waPhoneId = (Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '').trim();
  const waVersion = (Deno.env.get('WHATSAPP_API_VERSION') || 'v20.0').trim();

  if (waToken && waPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/${waVersion}/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.phoneDigits,
          type: 'text',
          text: { body: params.messageText },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          sent: false,
          provider: 'meta_cloud',
          error: data?.error?.message || `WhatsApp API failed (${res.status})`,
        };
      }
      return {
        sent: true,
        provider: 'meta_cloud',
        id: data?.messages?.[0]?.id,
      };
    } catch (err: any) {
      return {
        sent: false,
        provider: 'meta_cloud',
        error: err?.message || 'WhatsApp Cloud request failed.',
      };
    }
  }

  // Option B: Twilio WhatsApp API
  const twilioSid = (Deno.env.get('TWILIO_ACCOUNT_SID') || '').trim();
  const twilioAuth = (Deno.env.get('TWILIO_AUTH_TOKEN') || '').trim();
  const twilioFrom = (Deno.env.get('TWILIO_WHATSAPP_FROM') || '').trim();

  if (twilioSid && twilioAuth && twilioFrom) {
    try {
      const form = new URLSearchParams();
      form.set('To', `whatsapp:+${params.phoneDigits}`);
      form.set('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      form.set('Body', params.messageText);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twilioSid)}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`${twilioSid}:${twilioAuth}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          sent: false,
          provider: 'twilio',
          error: data?.message || `Twilio WhatsApp failed (${res.status})`,
        };
      }
      return { sent: true, provider: 'twilio', id: data?.sid };
    } catch (err: any) {
      return {
        sent: false,
        provider: 'twilio',
        error: err?.message || 'Twilio WhatsApp request failed.',
      };
    }
  }

  return { sent: false, provider: 'none' };
}

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

    // 1. Verify Admin Authentication & Role
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized. Admin sign-in required.' }, 401);
    }

    const { data: roleRows, error: roleError } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ALLOWED_ROLES)
      .limit(1);

    let hasAdminAccess = !roleError && Boolean(roleRows && roleRows.length > 0);
    if (!hasAdminAccess && user.email) {
      const { data: adminEmailEntry } = await admin
        .from('admin_emails')
        .select('role')
        .eq('email', user.email.trim().toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (adminEmailEntry && ALLOWED_ROLES.includes(adminEmailEntry.role)) {
        await admin
          .from('user_roles')
          .upsert({ user_id: user.id, role: adminEmailEntry.role }, { onConflict: 'user_id,role' });
        hasAdminAccess = true;
      }
    }

    if (!hasAdminAccess) {
      return jsonResponse({ error: 'Forbidden. Admin privileges required.' }, 403);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Invalid request payload.' }, 400);
    }

    const orderId = String(body.orderId || '').trim();
    if (!orderId) {
      return jsonResponse({ error: 'orderId is required.' }, 400);
    }

    const reasonInput = String(
      body.reason || 'the ordered handloom piece is currently unavailable'
    ).trim();
    const customMessage = body.customMessage ? String(body.customMessage).trim() : '';
    const initiateRefund = body.initiateRefund !== false;
    const restoreStock = body.restoreStock !== false;
    const cancelDelhiveryAwb = body.cancelDelhiveryAwb !== false;
    const sendEmail = body.sendEmail !== false;
    const sendWhatsApp = body.sendWhatsApp !== false;

    const order = await fetchFullOrderWithRelations(admin, orderId);
    if (!order) {
      return jsonResponse({ error: 'Order not found.' }, 404);
    }

    const nowIso = new Date().toISOString();
    const prevStatus = String(order.order_status || 'confirmed');
    const wasAlreadyCancelled = prevStatus === 'cancelled';

    // Load support contact settings for polite footer info
    let supportEmail = 'dorasanisarees@gmail.com';
    let supportPhone = '+91 7780673360';
    try {
      const { data: settingsRows } = await admin
        .from('site_settings')
        .select('key, value')
        .in('key', ['support_email', 'support_phone']);
      for (const row of settingsRows || []) {
        const rawVal =
          typeof row.value === 'string'
            ? row.value.replace(/^"|"$/g, '')
            : String(row.value || '').trim();
        if (row.key === 'support_email' && rawVal) supportEmail = rawVal;
        if (row.key === 'support_phone' && rawVal) supportPhone = rawVal;
      }
    } catch {
      // keep defaults
    }

    // 2. Cancel active Delhivery AWB if manifested and not already cancelled
    const shipmentsList: any[] = Array.isArray(order.shipments) ? order.shipments : [];
    const activeShip = shipmentsList.find((s) => s && !s.cancelled_at && s.tracking_number);
    const activeWaybill = String(activeShip?.tracking_number || order.tracking_id || '').trim();
    const waybillAlreadyCancelled = Boolean(
      activeWaybill &&
        shipmentsList.some(
          (s) => s && String(s.tracking_number || '').trim() === activeWaybill && s.cancelled_at
        )
    );
    let delhiveryCancelled = waybillAlreadyCancelled;
    let delhiveryWarning: string | null = null;

    if (cancelDelhiveryAwb && activeWaybill && !waybillAlreadyCancelled) {
      try {
        const delhiveryCfg = await getDelhiveryRuntimeConfig(admin);
        if (delhiveryCfg.token) {
          await cancelDelhiveryShipment(delhiveryCfg, activeWaybill);
          delhiveryCancelled = true;
          await admin
            .from('shipments')
            .update({
              cancelled_at: nowIso,
              cancellation_reason: reasonInput,
              current_status: 'Cancelled',
              status_type: 'CN',
              updated_at: nowIso,
            })
            .eq('tracking_number', activeWaybill);
        } else {
          delhiveryWarning = 'DELHIVERY_API_TOKEN is not configured; AWB was not cancelled on Delhivery.';
        }
      } catch (err: any) {
        delhiveryWarning = err?.message || `Could not cancel Delhivery AWB ${activeWaybill} automatically.`;
      }
    }

    // 3. Process Razorpay / Payment Refund (idempotent)
    const paymentsList: any[] = Array.isArray(order.payments) ? order.payments : [];
    const existingRefunds: any[] = Array.isArray(order.refunds) ? order.refunds : [];
    const primaryRazorpayPayment = paymentsList.find(
      (p) => p?.provider === 'razorpay' && p?.provider_payment_id
    );

    const activeExistingRefund = existingRefunds.find(
      (r) => r && (r.status === 'processed' || r.status === 'initiated')
    );

    let refundRecord: any = activeExistingRefund || null;
    let refundIssued = Boolean(activeExistingRefund || order.payment_status === 'refunded');
    let refundError: string | null = null;
    let nextPaymentStatus = refundIssued ? 'refunded' : String(order.payment_status || 'pending');

    if (activeExistingRefund && primaryRazorpayPayment && primaryRazorpayPayment.status !== 'refunded') {
      const { error: syncPayErr } = await admin
        .from('payments')
        .update({ status: 'refunded', updated_at: nowIso })
        .eq('id', primaryRazorpayPayment.id);
      if (syncPayErr) {
        console.warn('[admin-cancel-order] Payment status sync warning:', syncPayErr.message);
      }
    }

    if (initiateRefund && !activeExistingRefund) {
      const isPaidOnline =
        primaryRazorpayPayment?.provider_payment_id &&
        (order.payment_status === 'paid' || primaryRazorpayPayment.status === 'paid');

      if (isPaidOnline) {
        const { keyId, keySecret } = getRazorpayConfig();
        if (!keyId || !keySecret) {
          refundError =
            'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured; please issue refund in Razorpay Dashboard.';
        } else {
          const totalPaise = Math.round(Number(order.total_inr || 0) * 100);
          try {
            const rzpRefund = await createRazorpayRefund({
              keyId,
              keySecret,
              paymentId: primaryRazorpayPayment.provider_payment_id,
              amountInPaise: totalPaise > 0 ? totalPaise : undefined,
              speed: 'normal',
              receipt: order.order_number,
              notes: {
                order_number: String(order.order_number),
                reason: reasonInput.slice(0, 200),
                cancelled_by: user.email || user.id,
              },
            });

            const refundRef = String(rzpRefund?.id || '').trim() || null;
            const rzpStatus = String(rzpRefund?.status || 'initiated').toLowerCase();
            const localRefundStatus = rzpStatus === 'processed' ? 'processed' : 'initiated';

            const { data: insertedRefund, error: insRefundErr } = await admin
              .from('refunds')
              .insert({
                order_id: order.id,
                amount_inr: Number(order.total_inr || 0),
                refund_reference: refundRef,
                status: localRefundStatus,
                notes: `Admin cancelled order: ${reasonInput}`,
                processed_by: user.id,
              })
              .select('*')
              .single();

            if (insRefundErr) {
              console.warn('[admin-cancel-order] Refund insert warning:', insRefundErr.message);
            }

            refundRecord = insertedRefund || {
              amount_inr: Number(order.total_inr || 0),
              refund_reference: refundRef,
              status: localRefundStatus,
            };
            refundIssued = true;
            nextPaymentStatus = 'refunded';

            const { error: payUpdateErr } = await admin
              .from('payments')
              .update({ status: 'refunded', updated_at: nowIso })
              .eq('id', primaryRazorpayPayment.id);
            if (payUpdateErr) {
              console.warn('[admin-cancel-order] Payment update warning:', payUpdateErr.message);
            }

            const { error: evErr } = await admin.from('payment_events').insert({
              payment_id: primaryRazorpayPayment.id,
              event_type: 'admin.refund.created',
              payload: rzpRefund || {},
            });
            if (evErr) {
              console.warn('[admin-cancel-order] Payment event log warning:', evErr.message);
            }
          } catch (err: any) {
            refundError = err?.message || 'Razorpay refund API call failed.';
          }
        }
      } else if (order.payment_status === 'paid') {
        // Non-Razorpay paid order: create internal refund reference record
        const manualRef = `REF-${order.order_number}-${Date.now().toString(36).toUpperCase()}`;
        const { data: insertedRefund, error: manualRefundErr } = await admin
          .from('refunds')
          .insert({
            order_id: order.id,
            amount_inr: Number(order.total_inr || 0),
            refund_reference: manualRef,
            status: 'initiated',
            notes: `Admin cancelled order: ${reasonInput}`,
            processed_by: user.id,
          })
          .select('*')
          .single();

        if (manualRefundErr) {
          console.warn('[admin-cancel-order] Manual refund insert warning:', manualRefundErr.message);
        }

        refundRecord = insertedRefund || {
          amount_inr: Number(order.total_inr || 0),
          refund_reference: manualRef,
          status: 'initiated',
        };
        refundIssued = true;
        nextPaymentStatus = 'refunded';
      }
    }

    // If paid online and Razorpay refund API failed on first attempt, abort order cancellation
    // ONLY if admin asked for mandatory refund? No — let's return 400 when initiateRefund is true & Razorpay refund failed
    // so admin can see exact Razorpay error and retry cleanly rather than silently leaving payment unrefunded!
    if (
      initiateRefund &&
      !refundIssued &&
      refundError &&
      primaryRazorpayPayment?.provider_payment_id &&
      order.payment_status === 'paid' &&
      !wasAlreadyCancelled
    ) {
      return jsonResponse(
        {
          error: `Razorpay refund failed before cancelling order: ${refundError}`,
          code: 'RAZORPAY_REFUND_FAILED',
          delhiveryWarning,
        },
        400
      );
    }

    // 4. Restore product & variant stock if not previously cancelled/returned/refunded
    let stockRestoredUnits = 0;
    const alreadyTerminated = ['cancelled', 'refunded', 'returned'].includes(prevStatus);
    const refundAlreadyRecordedAdminCancel = Boolean(
      activeExistingRefund && /Admin cancelled order:/i.test(String(activeExistingRefund.notes || ''))
    );
    let alreadyRestoredInLedger = false;
    if (restoreStock && !alreadyTerminated && !refundAlreadyRecordedAdminCancel) {
      const { data: existingMovements } = await admin
        .from('inventory_movements')
        .select('id')
        .eq('reference_id', order.id)
        .eq('reason', 'order_cancelled')
        .limit(1);
      alreadyRestoredInLedger = Boolean(existingMovements && existingMovements.length > 0);
    }

    if (
      restoreStock &&
      !alreadyTerminated &&
      !refundAlreadyRecordedAdminCancel &&
      !alreadyRestoredInLedger &&
      Array.isArray(order.order_items)
    ) {
      for (const item of order.order_items) {
        const qty = Math.max(0, Number(item?.quantity || 0));
        if (!qty) continue;

        if (item.variant_id) {
          const { data: variantRow } = await admin
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant_id)
            .maybeSingle();
          if (variantRow) {
            const prevVarQty = Number(variantRow.stock_quantity || 0);
            const nextVarQty = prevVarQty + qty;
            await admin
              .from('product_variants')
              .update({ stock_quantity: nextVarQty })
              .eq('id', item.variant_id);
            const { error: varMovErr } = await admin.from('inventory_movements').insert({
              product_id: item.product_id,
              variant_id: item.variant_id,
              previous_quantity: prevVarQty,
              quantity_changed: qty,
              new_quantity: nextVarQty,
              reason: 'order_cancelled',
              reference_id: order.id,
              created_by: user.id,
            });
            if (varMovErr) {
              console.warn('[admin-cancel-order] Variant movement log warning:', varMovErr.message);
            }
          }
        }

        if (item.product_id) {
          const { data: prodRow } = await admin
            .from('products')
            .select('stock_quantity, sold_count, status')
            .eq('id', item.product_id)
            .maybeSingle();
          if (prodRow) {
            const prevQty = Number(prodRow.stock_quantity || 0);
            const nextQty = prevQty + qty;
            const prevSold = Number(prodRow.sold_count || 0);
            const nextStatus =
              prodRow.status === 'out_of_stock' && nextQty > 0 ? 'active' : prodRow.status;

            await admin
              .from('products')
              .update({
                stock_quantity: nextQty,
                sold_count: Math.max(0, prevSold - qty),
                in_stock: nextQty > 0,
                status: nextStatus,
                updated_at: nowIso,
              })
              .eq('id', item.product_id);

            const { error: prodMovErr } = await admin.from('inventory_movements').insert({
              product_id: item.product_id,
              variant_id: item.variant_id || null,
              previous_quantity: prevQty,
              quantity_changed: qty,
              new_quantity: nextQty,
              reason: 'order_cancelled',
              reference_id: order.id,
              created_by: user.id,
            });
            if (prodMovErr) {
              console.warn('[admin-cancel-order] Product movement log warning:', prodMovErr.message);
            }
            stockRestoredUnits += qty;
          }
        }
      }
    }

    // 5. Update Order & Status History (with core-column fallback if migration 20261112000002 is pending)
    const existingAdminNotes = String(order.admin_notes || '').trim();
    const cancelAdminNoteTag = `[Cancelled by admin at ${nowIso}: ${reasonInput}]`;
    const nextAdminNotes = /\[Cancelled by admin/i.test(existingAdminNotes)
      ? existingAdminNotes
      : existingAdminNotes
      ? `${existingAdminNotes}\n${cancelAdminNoteTag}`
      : cancelAdminNoteTag;

    const coreUpdatePayload: Record<string, unknown> = {
      order_status: 'cancelled',
      payment_status: nextPaymentStatus,
      admin_notes: nextAdminNotes,
      updated_at: nowIso,
    };
    if (delhiveryCancelled || shipmentsList.some((s) => s && s.cancelled_at)) {
      coreUpdatePayload.courier_name = null;
      coreUpdatePayload.tracking_id = null;
    }

    const extendedUpdatePayload: Record<string, unknown> = {
      ...coreUpdatePayload,
      cancellation_reason: reasonInput,
      cancelled_by: order.cancelled_by || user.id,
      cancelled_at: order.cancelled_at || nowIso,
    };

    let orderUpdateErrorMessage: string | null = null;
    const { error: extOrderUpdateErr } = await admin
      .from('orders')
      .update(extendedUpdatePayload)
      .eq('id', order.id);

    if (extOrderUpdateErr) {
      console.warn(
        '[admin-cancel-order] Extended orders update failed, retrying with core columns:',
        extOrderUpdateErr.message
      );
      const { error: coreOrderUpdateErr } = await admin
        .from('orders')
        .update(coreUpdatePayload)
        .eq('id', order.id);
      if (coreOrderUpdateErr) {
        orderUpdateErrorMessage = coreOrderUpdateErr.message;
      }
    }

    if (orderUpdateErrorMessage) {
      return jsonResponse(
        {
          error: `Failed to mark order as cancelled in database: ${orderUpdateErrorMessage}`,
          refundIssued,
          refund: refundRecord
            ? {
                id: refundRecord.id,
                amountInr: refundRecord.amount_inr,
                refundReference: refundRecord.refund_reference,
                status: refundRecord.status,
              }
            : null,
        },
        500
      );
    }

    const existingHistory: any[] = Array.isArray(order.order_status_history)
      ? order.order_status_history
      : [];
    const hasCancelledHistory = existingHistory.some(
      (h) => String(h?.new_status || '').toLowerCase() === 'cancelled'
    );

    if (!wasAlreadyCancelled || !hasCancelledHistory) {
      const historyNoteParts = [`Order cancelled by admin: ${reasonInput}.`];
      if (refundIssued) {
        historyNoteParts.push(
          `Refund of ₹${Number(order.total_inr || 0).toLocaleString('en-IN')} ${
            refundRecord?.status === 'processed' ? 'processed' : 'initiated'
          }${refundRecord?.refund_reference ? ` (Ref: ${refundRecord.refund_reference})` : ''}.`
        );
      }
      if (delhiveryCancelled && activeWaybill) {
        historyNoteParts.push(`Delhivery AWB ${activeWaybill} cancelled.`);
      }

      const { error: histErr } = await admin.from('order_status_history').insert({
        order_id: order.id,
        previous_status: prevStatus,
        new_status: 'cancelled',
        changed_by: user.id,
        note: historyNoteParts.join(' '),
      });
      if (histErr) {
        console.warn('[admin-cancel-order] Status history insert warning:', histErr.message);
      }
    }

    const { error: auditErr } = await admin.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'admin_cancel_order',
      entity_type: 'order',
      entity_id: order.id,
      before_values: {
        order_status: prevStatus,
        payment_status: order.payment_status,
      },
      after_values: {
        order_number: order.order_number,
        order_status: 'cancelled',
        payment_status: nextPaymentStatus,
        reason: reasonInput,
        refund_reference: refundRecord?.refund_reference || null,
        refund_status: refundRecord?.status || null,
        delhivery_awb_cancelled: delhiveryCancelled ? activeWaybill : null,
        stock_restored_units: stockRestoredUnits,
      },
    });
    if (auditErr) {
      console.warn('[admin-cancel-order] Audit log insert warning:', auditErr.message);
    }

    // 6. Compose & Dispatch Email + WhatsApp Apology Messages
    const itemsSummary = Array.isArray(order.order_items)
      ? order.order_items
          .map((it: any) =>
            it?.quantity > 1 ? `${it.product_title} × ${it.quantity}` : it?.product_title
          )
          .filter(Boolean)
          .join(', ')
      : '';

    const messageText = buildCancellationMessage({
      customerName: order.customer_name,
      orderNumber: order.order_number,
      itemsSummary,
      reason: reasonInput,
      totalInr: Number(order.total_inr || 0),
      refundIssued,
      refundReference: refundRecord?.refund_reference || null,
      refundStatus: refundRecord?.status || null,
      supportEmail,
      supportPhone,
      customMessage,
    });

    const emailSubject = `Update on Your DORASANI Order #${order.order_number} (Cancelled & Refund Info)`;
    const waDigits = formatWhatsAppDigits(order.customer_phone);

    const [emailResult, whatsappResult] = await Promise.all([
      sendEmail && order.customer_email
        ? trySendCancellationEmail({
            toEmail: order.customer_email,
            customerName: order.customer_name,
            orderNumber: order.order_number,
            subject: emailSubject,
            messageText,
            reason: reasonInput,
            totalInr: Number(order.total_inr || 0),
            refundIssued,
            refundReference: refundRecord?.refund_reference || null,
            supportEmail,
            supportPhone,
          })
        : Promise.resolve({ sent: false, provider: 'skipped' }),
      sendWhatsApp && waDigits
        ? trySendCancellationWhatsApp({
            phoneDigits: waDigits,
            messageText,
          })
        : Promise.resolve({ sent: false, provider: 'skipped' }),
    ]);

    const updatedOrder = await fetchFullOrderWithRelations(admin, order.id);

    const waMeUrl = waDigits
      ? `https://wa.me/${waDigits}?text=${encodeURIComponent(messageText)}`
      : null;
    const mailtoUrl = order.customer_email
      ? `mailto:${encodeURIComponent(order.customer_email)}?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(messageText)}`
      : null;

    return jsonResponse({
      success: true,
      alreadyCancelled: wasAlreadyCancelled,
      order: updatedOrder,
      refund: refundRecord
        ? {
            id: refundRecord.id,
            amountInr: refundRecord.amount_inr,
            refundReference: refundRecord.refund_reference,
            status: refundRecord.status,
          }
        : null,
      refundIssued,
      delhiveryCancelled,
      delhiveryWarning,
      stockRestoredUnits,
      notifications: {
        messageText,
        emailSubject,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        waMeUrl,
        mailtoUrl,
        emailSent: emailResult.sent,
        emailProvider: emailResult.provider,
        emailError: emailResult.error || null,
        whatsappSent: whatsappResult.sent,
        whatsappProvider: whatsappResult.provider,
        whatsappError: whatsappResult.error || null,
      },
    });
  } catch (err: any) {
    console.error('[admin-cancel-order] Error:', err);
    return jsonResponse({ error: err?.message || 'Failed to cancel order.' }, 500);
  }
});

