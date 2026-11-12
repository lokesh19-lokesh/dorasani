/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseClient.ts';
import {
  buildDelhiveryTrackingUrl,
  formatIstDateTime,
  mapDelhiveryScanToOrderStatus,
  parseDelhiveryTimestamp,
  syncOrderAndShipmentFromDelhivery,
  type DelhiveryTrackingResult,
  type NormalizedDelhiveryScan,
} from '../_shared/delhivery.ts';
import { jsonResponse } from '../_shared/razorpay.ts';

function constantTimeEquals(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const webhookSecret = (Deno.env.get('DELHIVERY_WEBHOOK_SECRET') || '').trim();
    if (webhookSecret) {
      const url = new URL(req.url);
      const headerSecret = (req.headers.get('x-delhivery-secret') || '').trim();
      const querySecret = (url.searchParams.get('secret') || '').trim();
      const provided = headerSecret || querySecret;

      if (!constantTimeEquals(webhookSecret, provided)) {
        return jsonResponse({ error: 'Unauthorized Delhivery webhook call.' }, 401);
      }
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Invalid webhook JSON payload.' }, 400);
    }

    const shipment =
      body?.Shipment ||
      (Array.isArray(body?.ShipmentData) ? body.ShipmentData[0]?.Shipment : null) ||
      body;

    const awb = String(shipment?.AWB || shipment?.waybill || body?.waybill || '').trim();
    const referenceNo = String(
      shipment?.ReferenceNo || shipment?.reference_no || body?.reference_no || ''
    ).trim();

    if (!awb) {
      return jsonResponse({ error: 'Webhook payload missing AWB / waybill.' }, 400);
    }

    const admin = getSupabaseAdmin();

    // Verify this AWB belongs to an existing Dorasani order/shipment
    const { data: existingShipment } = await admin
      .from('shipments')
      .select('id, order_id, history')
      .eq('tracking_number', awb)
      .maybeSingle();

    let matchedOrderId: string | null = existingShipment?.order_id || null;

    if (!matchedOrderId) {
      const { data: byTracking } = await admin
        .from('orders')
        .select('id')
        .eq('tracking_id', awb)
        .maybeSingle();
      matchedOrderId = byTracking?.id || null;
    }

    if (!matchedOrderId && referenceNo) {
      const cleanRef = referenceNo.replace(/-R\d+$/i, '');
      const { data: byRef } = await admin
        .from('orders')
        .select('id')
        .eq('order_number', cleanRef)
        .maybeSingle();
      matchedOrderId = byRef?.id || null;
    }

    if (!matchedOrderId) {
      return jsonResponse({
        received: true,
        ignored: true,
        awb,
        reason: 'No matching Dorasani order found for AWB.',
      });
    }

    const statusObj = shipment?.Status || {};
    const nowIso = new Date().toISOString();
    const currentStatus = String(
      statusObj.Status || shipment?.Status || 'In Transit'
    ).trim();
    const statusType = String(statusObj.StatusType || '').trim();
    const statusCode = String(shipment?.NSLCode || statusObj.StatusCode || '').trim();
    const currentLocation = String(statusObj.StatusLocation || '').trim();
    const instructions = String(statusObj.Instructions || '').trim();
    const statusDateTime = String(statusObj.StatusDateTime || nowIso).trim();

    const incomingScansRaw = Array.isArray(shipment?.Scans) ? shipment.Scans : [];
    const incomingScans: NormalizedDelhiveryScan[] = incomingScansRaw
      .map((entry: any) => {
        const d = entry?.ScanDetail || entry || {};
        const dt = String(d.ScanDateTime || '').trim();
        return {
          scan: String(d.Scan || currentStatus).trim(),
          scanType: String(d.ScanType || '').trim(),
          statusCode: String(d.StatusCode || '').trim(),
          location: String(d.ScannedLocation || '').trim(),
          instructions: String(d.Instructions || '').trim(),
          dateTime: dt,
          formattedTime: formatIstDateTime(dt),
        };
      })
      .filter((s: NormalizedDelhiveryScan) => Boolean(s.scan || s.location || s.dateTime));

    if (incomingScans.length === 0) {
      incomingScans.push({
        scan: currentStatus,
        scanType: statusType,
        statusCode,
        location: currentLocation,
        instructions,
        dateTime: statusDateTime,
        formattedTime: formatIstDateTime(statusDateTime),
      });
    }

    // Merge with existing DB scan history without losing earlier checkpoints
    const existingScans: NormalizedDelhiveryScan[] = Array.isArray(existingShipment?.history)
      ? existingShipment.history
      : [];
    const seenKeys = new Set<string>();
    const mergedScans: NormalizedDelhiveryScan[] = [];

    for (const scan of [...incomingScans, ...existingScans]) {
      const key = `${scan.dateTime}|${scan.scan}|${scan.location}`.toLowerCase();
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        mergedScans.push({
          ...scan,
          formattedTime: (scan.dateTime ? formatIstDateTime(scan.dateTime) : '') || scan.formattedTime || '',
        });
      }
    }

    mergedScans.sort((a, b) => {
      const ta = parseDelhiveryTimestamp(a.dateTime)?.getTime() ?? 0;
      const tb = parseDelhiveryTimestamp(b.dateTime)?.getTime() ?? 0;
      return tb - ta;
    });

    const trackingResult: DelhiveryTrackingResult = {
      found: true,
      awb,
      referenceNo: referenceNo || undefined,
      currentStatus,
      statusType,
      statusCode,
      currentLocation,
      instructions,
      statusDateTime,
      origin: shipment?.Origin ? String(shipment.Origin) : undefined,
      destination: shipment?.Destination ? String(shipment.Destination) : undefined,
      estimatedDelivery: shipment?.ExpectedDeliveryDate || null,
      pickedUpDate: shipment?.PickedUpDate || null,
      deliveryDate: shipment?.DeliveryDate || null,
      mappedOrderStatus: mapDelhiveryScanToOrderStatus(currentStatus, statusType, statusCode),
      trackingUrl: buildDelhiveryTrackingUrl(awb),
      scans: mergedScans,
    };

    const syncRes = await syncOrderAndShipmentFromDelhivery(admin, {
      orderId: matchedOrderId,
      waybill: awb,
      trackingResult,
    });

    return jsonResponse({
      received: true,
      awb,
      ...syncRes,
    });
  } catch (err: any) {
    console.error('[delhivery-webhook] Error:', err);
    return jsonResponse({ error: err?.message || 'Delhivery webhook processing failed.' }, 500);
  }
});

