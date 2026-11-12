/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseClient } from '../_shared/supabaseClient.ts';
import {
  buildDelhiveryTrackingUrl,
  formatIstDateTime,
  getDelhiveryRuntimeConfig,
  normalizeDelhiveryTrackingUrl,
  syncOrderAndShipmentFromDelhivery,
  trackDelhiveryWaybill,
  type DelhiveryTrackingResult,
} from '../_shared/delhivery.ts';
import { jsonResponse } from '../_shared/razorpay.ts';

const ALLOWED_ADMIN_ROLES = [
  'super_admin',
  'admin',
  'catalog_manager',
  'inventory_manager',
  'order_manager',
];

function sanitizeShipmentsForPublic(shipments: unknown): any[] {
  if (!Array.isArray(shipments)) return [];
  return shipments.map((s: any) => ({
    id: s.id,
    order_id: s.order_id,
    courier_partner: s.courier_partner,
    tracking_number: s.tracking_number,
    tracking_url: s.tracking_url,
    current_status: s.current_status,
    estimated_delivery: s.estimated_delivery,
    actual_delivery: s.actual_delivery,
    history: Array.isArray(s.history) ? s.history : [],
    shipping_mode: s.shipping_mode,
    payment_mode: s.payment_mode,
    status_code: s.status_code,
    status_type: s.status_type,
    current_location: s.current_location,
    origin_city: s.origin_city,
    destination_pincode: s.destination_pincode,
    pickup_scheduled_date: s.pickup_scheduled_date,
    pickup_scheduled_time: s.pickup_scheduled_time,
    last_synced_at: s.last_synced_at,
    cancelled_at: s.cancelled_at,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

function redactOrderForPublic(order: any) {
  const addr =
    order.shipping_address && typeof order.shipping_address === 'object'
      ? order.shipping_address
      : {};

  return {
    id: order.id,
    order_number: order.order_number,
    order_status: order.order_status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    delivery_option: order.delivery_option,
    total_inr: order.total_inr,
    subtotal_inr: order.subtotal_inr,
    shipping_fee_inr: order.shipping_fee_inr,
    discount_inr: order.discount_inr,
    courier_name: order.courier_name,
    tracking_id: order.tracking_id,
    created_at: order.created_at,
    updated_at: order.updated_at,
    shipping_address: {
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
    },
    order_items: Array.isArray(order.order_items)
      ? order.order_items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_title: item.product_title,
          variant_name: item.variant_name,
          quantity: item.quantity,
          unit_price_inr: item.unit_price_inr,
          total_price_inr: item.total_price_inr,
          product_snapshot: item.product_snapshot,
        }))
      : [],
    shipments: sanitizeShipmentsForPublic(order.shipments),
    payments: [],
  };
}

function buildPublicTrackingSummary(
  tracking: DelhiveryTrackingResult | null,
  activeShipment: any,
  order: any,
  liveFetched: boolean
) {
  const scans = tracking?.scans?.length
    ? tracking.scans
    : Array.isArray(activeShipment?.history)
      ? activeShipment.history
      : [];
  const awb = String(
    (tracking?.found ? tracking.awb : '') ||
      activeShipment?.tracking_number ||
      order?.tracking_id ||
      ''
  ).trim();
  const trackingUrl = normalizeDelhiveryTrackingUrl(
    (tracking?.found ? tracking.trackingUrl : '') || activeShipment?.tracking_url,
    awb
  );

  return {
    found: Boolean(tracking?.found || activeShipment || order?.tracking_id),
    liveFetched,
    awb,
    courierPartner: activeShipment?.courier_partner || order?.courier_name || 'Delhivery One',
    currentStatus:
      (tracking?.found ? tracking.currentStatus : '') ||
      activeShipment?.current_status ||
      (order?.order_status ? String(order.order_status) : 'Confirmed'),
    statusType: (tracking?.found ? tracking.statusType : '') || activeShipment?.status_type || '',
    statusCode: (tracking?.found ? tracking.statusCode : '') || activeShipment?.status_code || '',
    currentLocation:
      (tracking?.found ? tracking.currentLocation : '') ||
      activeShipment?.current_location ||
      '',
    origin: (tracking?.found ? tracking.origin : '') || activeShipment?.origin_city || 'Hyderabad',
    destination:
      (tracking?.found ? tracking.destination : '') ||
      activeShipment?.destination_pincode ||
      '',
    estimatedDelivery:
      (tracking?.found ? tracking.estimatedDelivery : null) ||
      activeShipment?.estimated_delivery ||
      null,
    pickedUpDate: tracking?.found ? tracking.pickedUpDate || null : null,
    deliveryDate:
      (tracking?.found ? tracking.deliveryDate : null) ||
      activeShipment?.actual_delivery ||
      null,
    trackingUrl,
    lastSyncedAt: activeShipment?.last_synced_at || null,
    scans: scans.map((s: any) => ({
      scan: String(s.scan || ''),
      scanType: String(s.scanType || ''),
      statusCode: String(s.statusCode || ''),
      location: String(s.location || ''),
      instructions: String(s.instructions || ''),
      dateTime: String(s.dateTime || ''),
      formattedTime: (s.dateTime ? formatIstDateTime(s.dateTime) : '') || s.formattedTime || '',
    })),
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabase = getSupabaseClient(req);
    const admin = getSupabaseAdmin();

    let orderNumberInput = '';
    let waybillInput = '';
    let refresh = true;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      orderNumberInput = (url.searchParams.get('orderNumber') || '').trim();
      waybillInput = (
        url.searchParams.get('waybill') ||
        url.searchParams.get('trackingId') ||
        ''
      ).trim();
      refresh = url.searchParams.get('refresh') !== 'false';
    } else {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== 'object') {
        return jsonResponse({ error: 'Invalid tracking request payload.' }, 400);
      }
      orderNumberInput = String(body.orderNumber || '').trim();
      waybillInput = String(body.waybill || body.trackingId || '').trim();
      refresh = body.refresh !== false;
    }

    if (!orderNumberInput && !waybillInput) {
      return jsonResponse(
        { error: 'Please enter an Order Number (e.g. DOR-...) or Tracking ID / AWB.' },
        400
      );
    }

    // Resolve optional authenticated caller for privacy scoping
    let callerUserId: string | null = null;
    let isAdmin = false;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        callerUserId = user.id;
        const { data: roleRows } = await admin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ALLOWED_ADMIN_ROLES)
          .limit(1);

        isAdmin = Boolean(roleRows && roleRows.length > 0);
        if (!isAdmin && user.email) {
          const { data: adminEmail } = await admin
            .from('admin_emails')
            .select('role')
            .eq('email', user.email.trim().toLowerCase())
            .eq('is_active', true)
            .maybeSingle();
          if (adminEmail && ALLOWED_ADMIN_ROLES.includes(adminEmail.role)) {
            isAdmin = true;
          }
        }
      }
    } catch {
      callerUserId = null;
      isAdmin = false;
    }

    // Look up matching order by order_number or tracking_id / shipments.tracking_number
    let orderRow: any = null;

    if (orderNumberInput) {
      const { data } = await admin
        .from('orders')
        .select('*, order_items (*), payments (*), shipments (*)')
        .ilike('order_number', orderNumberInput)
        .maybeSingle();
      orderRow = data;
    }

    const searchCode = waybillInput || orderNumberInput;
    if (!orderRow && searchCode) {
      const { data: byTracking } = await admin
        .from('orders')
        .select('*, order_items (*), payments (*), shipments (*)')
        .eq('tracking_id', searchCode)
        .maybeSingle();
      orderRow = byTracking;
    }

    if (!orderRow && searchCode) {
      const { data: byShipment } = await admin
        .from('shipments')
        .select('order_id')
        .eq('tracking_number', searchCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (byShipment?.order_id) {
        const { data } = await admin
          .from('orders')
          .select('*, order_items (*), payments (*), shipments (*)')
          .eq('id', byShipment.order_id)
          .maybeSingle();
        orderRow = data;
      }
    }

    const config = await getDelhiveryRuntimeConfig(admin);

    // If no order exists in DB: only admins may probe arbitrary raw Delhivery waybills
    if (!orderRow) {
      if (isAdmin && waybillInput && config.token) {
        const rawTracking = await trackDelhiveryWaybill(config, { waybill: waybillInput });
        if (rawTracking.found) {
          return jsonResponse({
            found: true,
            redacted: false,
            order: null,
            tracking: buildPublicTrackingSummary(rawTracking, null, null, true),
          });
        }
      }

      return jsonResponse(
        {
          error:
            'We could not find an order matching that Order Number or Tracking AWB. Please double-check and try again.',
        },
        404
      );
    }

    const shipmentsList: any[] = Array.isArray(orderRow.shipments) ? orderRow.shipments : [];
    const sortedShipments = [...shipmentsList].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    const activeShipment = sortedShipments.find((s) => !s.cancelled_at) || sortedShipments[0] || null;

    const cleanSafeWaybillInput =
      waybillInput &&
      waybillInput.toLowerCase() !== String(orderRow.order_number || '').trim().toLowerCase() &&
      !/^dor-\d+/i.test(waybillInput)
        ? waybillInput
        : '';

    const waybillToTrack = String(
      activeShipment?.tracking_number || orderRow.tracking_id || cleanSafeWaybillInput || ''
    ).trim();

    const shouldCheckDelhivery =
      refresh &&
      Boolean(waybillToTrack) &&
      Boolean(config.token) &&
      Boolean(
        activeShipment ||
          !orderRow.courier_name ||
          /delhivery/i.test(String(orderRow.courier_name))
      );

    let liveTracking: DelhiveryTrackingResult | null = null;
    let liveFetched = false;
    let liveSyncWarning: string | null = null;

    if (shouldCheckDelhivery) {
      try {
        liveTracking = await trackDelhiveryWaybill(config, {
          waybill: waybillToTrack,
          refIds: orderRow.order_number,
        });

        if (liveTracking.found) {
          liveFetched = true;
          await syncOrderAndShipmentFromDelhivery(admin, {
            orderId: orderRow.id,
            waybill: liveTracking.awb || waybillToTrack,
            trackingResult: liveTracking,
          });

          const { data: refreshedOrder } = await admin
            .from('orders')
            .select('*, order_items (*), payments (*), shipments (*)')
            .eq('id', orderRow.id)
            .single();

          if (refreshedOrder) {
            orderRow = refreshedOrder;
          }
        }
      } catch (err: any) {
        liveSyncWarning = err?.message || 'Unable to reach Delhivery live tracking right now.';
      }
    }

    const latestShipments: any[] = Array.isArray(orderRow.shipments) ? orderRow.shipments : [];
    const latestSorted = [...latestShipments].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    const latestActiveShipment = latestSorted.find((s) => !s.cancelled_at) || latestSorted[0] || null;

    const isOwner = Boolean(callerUserId && orderRow.user_id && orderRow.user_id === callerUserId);
    const isPrivileged = isAdmin || isOwner;

    return jsonResponse({
      found: true,
      redacted: !isPrivileged,
      order: isPrivileged ? orderRow : redactOrderForPublic(orderRow),
      tracking: buildPublicTrackingSummary(
        liveTracking,
        latestActiveShipment,
        orderRow,
        liveFetched
      ),
      ...(liveSyncWarning ? { liveSyncWarning } : {}),
    });
  } catch (err: any) {
    console.error('[delhivery-track] Error:', err);
    return jsonResponse({ error: err?.message || 'Tracking lookup failed.' }, 500);
  }
});

