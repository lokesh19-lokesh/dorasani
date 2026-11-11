/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseClient } from '../_shared/supabaseClient.ts';
import {
  calculateDelhiveryRates,
  cancelDelhiveryShipment,
  checkPinServiceabilityAndTat,
  cleanPincode,
  delhiveryRequest,
  fetchDelhiveryPackingSlip,
  getDelhiveryRuntimeConfig,
  manifestDelhiveryShipmentForOrder,
  scheduleDelhiveryPickup,
  syncOrderAndShipmentFromDelhivery,
  trackDelhiveryWaybill,
} from '../_shared/delhivery.ts';
import { fetchFullOrderWithRelations, jsonResponse } from '../_shared/razorpay.ts';

const ALLOWED_ROLES = [
  'super_admin',
  'admin',
  'catalog_manager',
  'inventory_manager',
  'order_manager',
];

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

    // Verify user authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized. Admin sign-in required.' }, 401);
    }

    // Verify admin role (supports user_roles and admin_emails allowlist)
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
      return jsonResponse({ error: 'Invalid request body.' }, 400);
    }

    const action = String(body.action || '').trim().toLowerCase();
    const config = await getDelhiveryRuntimeConfig(admin);

    if (action === 'test_connection') {
      if (!config.token) {
        return jsonResponse(
          {
            ok: false,
            error: 'DELHIVERY_API_TOKEN is not configured in Supabase Edge Function Secrets.',
          },
          400
        );
      }

      const testPin = cleanPincode(body.originPincode) || config.originPincode || '500067';
      const pinData = await delhiveryRequest(
        config,
        `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(testPin)}`
      );
      const postal = Array.isArray(pinData?.delivery_codes)
        ? pinData.delivery_codes[0]?.postal_code
        : null;

      return jsonResponse({
        ok: true,
        enabled: config.enabled,
        autoManifest: config.autoManifest,
        pickupLocation: config.pickupLocation,
        originPincode: testPin,
        pinServiceable: Boolean(postal && (postal.pre_paid === 'Y' || postal.cod === 'Y')),
        hubCity: postal?.district || postal?.city || 'Hyderabad',
        stateCode: postal?.state_code || 'TS',
        sortCode: postal?.sort_code || '',
      });
    }

    if (action === 'calculate_rates') {
      const destinationPincode = cleanPincode(body.destinationPincode || body.pincode);
      if (!destinationPincode) {
        return jsonResponse({ error: 'Valid 6-digit destination PIN code is required.' }, 400);
      }
      const originPincode = cleanPincode(body.originPincode) || config.originPincode || '500067';
      const weightGrams = Math.max(
        50,
        Math.round(Number(body.weightGrams) || config.defaultWeightGrams || 650)
      );
      const paymentMode =
        String(body.paymentMode || '').toUpperCase() === 'COD' ? 'COD' : 'Prepaid';
      const codAmount = Number(body.codAmount || 0);

      const [serviceability, expressRes, surfaceRes] = await Promise.allSettled([
        checkPinServiceabilityAndTat(config, destinationPincode, originPincode),
        calculateDelhiveryRates(config, {
          destinationPincode,
          originPincode,
          weightGrams,
          mode: 'Express',
          paymentMode,
          codAmount,
        }),
        calculateDelhiveryRates(config, {
          destinationPincode,
          originPincode,
          weightGrams,
          mode: 'Surface',
          paymentMode,
          codAmount,
        }),
      ]);

      return jsonResponse({
        success: true,
        destinationPincode,
        originPincode,
        weightGrams,
        paymentMode,
        serviceability: serviceability.status === 'fulfilled' ? serviceability.value : null,
        express:
          expressRes.status === 'fulfilled'
            ? expressRes.value
            : { error: expressRes.reason?.message || 'Unavailable' },
        surface:
          surfaceRes.status === 'fulfilled'
            ? surfaceRes.value
            : { error: surfaceRes.reason?.message || 'Unavailable' },
      });
    }

    if (action === 'create_shipment') {
      const orderId = String(body.orderId || '').trim();
      if (!orderId) {
        return jsonResponse({ error: 'orderId is required.' }, 400);
      }

      const result = await manifestDelhiveryShipmentForOrder(admin, orderId, {
        pickupLocation: body.pickupLocation ? String(body.pickupLocation).trim() : undefined,
        shippingMode:
          body.shippingMode === 'Surface'
            ? 'Surface'
            : body.shippingMode === 'Express'
              ? 'Express'
              : undefined,
        weightGrams: body.weightGrams ? Number(body.weightGrams) : undefined,
        length: body.length ? Number(body.length) : undefined,
        breadth: body.breadth ? Number(body.breadth) : undefined,
        height: body.height ? Number(body.height) : undefined,
        forceRecreate: Boolean(body.forceRecreate),
      });

      const order = await fetchFullOrderWithRelations(admin, orderId);

      return jsonResponse({
        success: true,
        ...result,
        order,
      });
    }

    if (action === 'get_label') {
      const orderId = body.orderId ? String(body.orderId).trim() : '';
      let waybill = body.waybill ? String(body.waybill).trim() : '';

      if (!waybill && orderId) {
        const { data: ship } = await admin
          .from('shipments')
          .select('tracking_number')
          .eq('order_id', orderId)
          .is('cancelled_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        waybill = String(ship?.tracking_number || '').trim();
        if (!waybill) {
          const { data: ord } = await admin
            .from('orders')
            .select('tracking_id')
            .eq('id', orderId)
            .maybeSingle();
          waybill = String(ord?.tracking_id || '').trim();
        }
      }

      if (!waybill) {
        return jsonResponse(
          { error: 'No active Delhivery AWB found for this order.' },
          404
        );
      }

      const slip = await fetchDelhiveryPackingSlip(config, waybill);
      const nowIso = new Date().toISOString();

      await admin
        .from('shipments')
        .update({
          label_url: slip.pdfUrl,
          label_data: slip.packageData,
          updated_at: nowIso,
        })
        .eq('tracking_number', waybill);

      return jsonResponse({
        success: true,
        ...slip,
        sellerGst: config.sellerGst,
        warehouse: {
          name: config.pickupLocation,
          address: config.storeAddress,
          cityStatePin: config.storeCityStatePin,
          phone: config.supportPhone,
        },
      });
    }

    if (action === 'schedule_pickup') {
      const pickupDate = String(body.pickupDate || '').trim();
      const pickupTime = String(body.pickupTime || '14:00:00').trim();
      const expectedPackageCount = Math.max(
        1,
        Math.round(Number(body.expectedPackageCount) || 1)
      );
      const pickupLocation = body.pickupLocation
        ? String(body.pickupLocation).trim()
        : config.pickupLocation;

      const pickupRes = await scheduleDelhiveryPickup(config, {
        pickupLocation,
        pickupDate,
        pickupTime,
        expectedPackageCount,
      });

      const nowIso = new Date().toISOString();
      const targetOrderIds = Array.isArray(body.orderIds)
        ? body.orderIds.map((id: any) => String(id).trim()).filter(Boolean)
        : [];

      const updateFields = {
        pickup_request_id: pickupRes.pickupId,
        pickup_scheduled_date: pickupRes.pickupDate,
        pickup_scheduled_time: pickupRes.pickupTime,
        updated_at: nowIso,
      };

      if (targetOrderIds.length > 0) {
        await admin
          .from('shipments')
          .update(updateFields)
          .in('order_id', targetOrderIds)
          .is('cancelled_at', null);
      } else {
        await admin
          .from('shipments')
          .update(updateFields)
          .is('cancelled_at', null)
          .is('pickup_scheduled_date', null);
      }

      return jsonResponse({
        success: true,
        ...pickupRes,
      });
    }

    if (action === 'cancel_shipment') {
      const orderId = body.orderId ? String(body.orderId).trim() : '';
      let waybill = body.waybill ? String(body.waybill).trim() : '';
      const reason = String(body.reason || 'Cancelled by store admin').trim();

      let shipmentRow: any = null;
      if (waybill) {
        const { data } = await admin
          .from('shipments')
          .select('*')
          .eq('tracking_number', waybill)
          .maybeSingle();
        shipmentRow = data;
      } else if (orderId) {
        const { data } = await admin
          .from('shipments')
          .select('*')
          .eq('order_id', orderId)
          .is('cancelled_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        shipmentRow = data;
        waybill = String(shipmentRow?.tracking_number || '').trim();
      }

      if (!waybill && orderId) {
        const { data: ord } = await admin
          .from('orders')
          .select('tracking_id')
          .eq('id', orderId)
          .maybeSingle();
        waybill = String(ord?.tracking_id || '').trim();
      }

      if (!waybill) {
        return jsonResponse({ error: 'Waybill is required to cancel Delhivery AWB.' }, 400);
      }

      const cancelResp = await cancelDelhiveryShipment(config, waybill);
      const nowIso = new Date().toISOString();

      await admin
        .from('shipments')
        .update({
          cancelled_at: nowIso,
          cancellation_reason: reason,
          current_status: 'Cancelled',
          status_type: 'CN',
          updated_at: nowIso,
        })
        .eq('tracking_number', waybill);

      const resolvedOrderId = orderId || shipmentRow?.order_id || null;
      if (resolvedOrderId) {
        const { data: ordRow } = await admin
          .from('orders')
          .select('id, order_status')
          .eq('id', resolvedOrderId)
          .maybeSingle();

        if (ordRow?.id) {
          const nextOrderStatus =
            ordRow.order_status === 'packed' ? 'confirmed' : ordRow.order_status;

          await admin
            .from('orders')
            .update({
              courier_name: null,
              tracking_id: null,
              ...(nextOrderStatus !== ordRow.order_status
                ? { order_status: nextOrderStatus }
                : {}),
              updated_at: nowIso,
            })
            .eq('id', resolvedOrderId);

          await admin.from('order_status_history').insert({
            order_id: resolvedOrderId,
            previous_status: ordRow.order_status,
            new_status: nextOrderStatus,
            note: `Delhivery AWB ${waybill} cancelled by admin (${reason}).`,
          });
        }
      }

      const updatedOrder = resolvedOrderId
        ? await fetchFullOrderWithRelations(admin, resolvedOrderId)
        : null;

      return jsonResponse({
        success: true,
        waybill,
        cancelResponse: cancelResp,
        order: updatedOrder,
      });
    }

    if (action === 'sync_tracking') {
      const orderId = body.orderId ? String(body.orderId).trim() : '';
      let waybill = body.waybill ? String(body.waybill).trim() : '';

      if (orderId || waybill) {
        let orderNumber = '';
        if (!waybill && orderId) {
          const { data: ship } = await admin
            .from('shipments')
            .select('tracking_number')
            .eq('order_id', orderId)
            .is('cancelled_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: ord } = await admin
            .from('orders')
            .select('tracking_id, order_number')
            .eq('id', orderId)
            .maybeSingle();

          waybill = String(ship?.tracking_number || ord?.tracking_id || '').trim();
          orderNumber = String(ord?.order_number || '').trim();
        }

        if (!waybill) {
          return jsonResponse({ error: 'No active Delhivery AWB found to sync.' }, 400);
        }

        const trackingResult = await trackDelhiveryWaybill(config, {
          waybill,
          refIds: orderNumber || undefined,
        });

        let syncRes: any = null;
        if (trackingResult.found) {
          syncRes = await syncOrderAndShipmentFromDelhivery(admin, {
            orderId: orderId || null,
            waybill: trackingResult.awb || waybill,
            trackingResult,
          });
        }

        const resolvedId = orderId || syncRes?.orderId || null;
        const order = resolvedId ? await fetchFullOrderWithRelations(admin, resolvedId) : null;

        return jsonResponse({
          success: true,
          checked: 1,
          synced: trackingResult.found ? 1 : 0,
          tracking: trackingResult,
          syncResult: syncRes,
          order,
        });
      }

      // Bulk sync up to 25 active Delhivery shipments whose orders are not terminal
      const { data: openShipments, error: openErr } = await admin
        .from('shipments')
        .select('id, order_id, tracking_number, courier_partner')
        .is('cancelled_at', null)
        .not('tracking_number', 'is', null)
        .order('updated_at', { ascending: true })
        .limit(40);

      if (openErr) {
        throw new Error(openErr.message || 'Unable to query active shipments.');
      }

      const orderIds = Array.from(
        new Set((openShipments || []).map((s: any) => s.order_id).filter(Boolean))
      );

      let activeTargets: any[] = [];
      if (orderIds.length > 0) {
        const { data: openOrders } = await admin
          .from('orders')
          .select('id, order_number, order_status')
          .in('id', orderIds);

        const orderMap = new Map<string, any>((openOrders || []).map((o: any) => [o.id, o]));
        const terminal = new Set(['delivered', 'cancelled', 'refunded']);

        activeTargets = (openShipments || [])
          .filter((s: any) => {
            const ord = orderMap.get(s.order_id);
            const courierOk = !s.courier_partner || /delhivery/i.test(String(s.courier_partner));
            return ord && !terminal.has(String(ord.order_status).toLowerCase()) && courierOk;
          })
          .slice(0, 25)
          .map((s: any) => ({
            ...s,
            orderNumber: orderMap.get(s.order_id)?.order_number,
          }));
      }

      let synced = 0;
      const updatedOrders: string[] = [];
      const errors: Array<{ waybill: string; error: string }> = [];

      for (let i = 0; i < activeTargets.length; i += 5) {
        const batch = activeTargets.slice(i, i + 5);
        const results = await Promise.allSettled(
          batch.map(async (item) => {
            const trackRes = await trackDelhiveryWaybill(config, {
              waybill: item.tracking_number,
              refIds: item.orderNumber,
            });
            if (trackRes.found) {
              const s = await syncOrderAndShipmentFromDelhivery(admin, {
                orderId: item.order_id,
                waybill: trackRes.awb || item.tracking_number,
                trackingResult: trackRes,
              });
              return s;
            }
            return { synced: false, orderNumber: item.orderNumber, nextOrderStatus: null };
          })
        );

        results.forEach((res, idx) => {
          const item = batch[idx];
          if (res.status === 'fulfilled') {
            if (res.value?.synced) {
              synced += 1;
              if (item.orderNumber) updatedOrders.push(item.orderNumber);
            }
          } else {
            errors.push({
              waybill: item.tracking_number,
              error: res.reason?.message || 'Sync error',
            });
          }
        });
      }

      return jsonResponse({
        success: true,
        checked: activeTargets.length,
        synced,
        updatedOrders,
        errors,
      });
    }

    return jsonResponse({ error: `Unsupported action "${action}".` }, 400);
  } catch (err: any) {
    console.error('[delhivery-shipping] Error:', err);
    return jsonResponse({ error: err?.message || 'Delhivery shipping request failed.' }, 500);
  }
});

