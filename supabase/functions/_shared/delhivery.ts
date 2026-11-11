/// <reference path="../deno.d.ts" />

export interface DelhiveryRuntimeConfig {
  token: string;
  baseUrl: string;
  enabled: boolean;
  pickupLocation: string;
  originPincode: string;
  autoManifest: boolean;
  defaultWeightGrams: number;
  defaultDimensions: { length: number; breadth: number; height: number };
  sellerGst: string;
  storeName: string;
  storeAddress: string;
  storeCityStatePin: string;
  supportPhone: string;
}

export interface NormalizedDelhiveryScan {
  scan: string;
  scanType: string;
  statusCode: string;
  location: string;
  instructions: string;
  dateTime: string;
  formattedTime: string;
}

export interface DelhiveryTrackingResult {
  found: boolean;
  awb: string;
  referenceNo?: string;
  currentStatus: string;
  statusType: string;
  statusCode?: string;
  currentLocation: string;
  instructions?: string;
  statusDateTime?: string;
  origin?: string;
  destination?: string;
  estimatedDelivery?: string | null;
  pickedUpDate?: string | null;
  deliveryDate?: string | null;
  mappedOrderStatus?: string;
  trackingUrl: string;
  scans: NormalizedDelhiveryScan[];
  raw?: unknown;
  message?: string;
}

export function getDelhiveryEnv() {
  const token = (Deno.env.get('DELHIVERY_API_TOKEN') || '').trim();
  const baseUrl = (Deno.env.get('DELHIVERY_BASE_URL') || 'https://track.delhivery.com')
    .trim()
    .replace(/\/+$/, '');
  const pickupLocation = (
    Deno.env.get('DELHIVERY_PICKUP_LOCATION') || 'DORASANI SAREES B2C'
  ).trim();
  return { token, baseUrl, pickupLocation };
}

export function cleanIndianPhone(raw: unknown, fallback = '7780673360'): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return fallback;
}

export function cleanPincode(raw: unknown): string {
  const digits = String(raw || '').replace(/\D/g, '');
  return /^\d{6}$/.test(digits) ? digits : '';
}

export function formatIstDateTime(isoOrDateStr?: string | null): string {
  if (!isoOrDateStr) return '';
  const dt = new Date(isoOrDateStr);
  if (Number.isNaN(dt.getTime())) return String(isoOrDateStr);
  try {
    return dt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dt.toISOString();
  }
}

export async function getDelhiveryRuntimeConfig(admin: any): Promise<DelhiveryRuntimeConfig> {
  const env = getDelhiveryEnv();
  const defaults: DelhiveryRuntimeConfig = {
    token: env.token,
    baseUrl: env.baseUrl,
    enabled: true,
    pickupLocation: env.pickupLocation || 'DORASANI SAREES B2C',
    originPincode: '500067',
    autoManifest: false,
    defaultWeightGrams: 650,
    defaultDimensions: { length: 34, breadth: 26, height: 6 },
    sellerGst: '',
    storeName: 'Dorasani Sarees',
    storeAddress:
      'Plot No 7-13/1/A, Bhagyalaxmi Colony, Shapur Road, Quthbullapur (M), Medchal Dist, Hyderabad-500067',
    storeCityStatePin: 'Hyderabad, Telangana - 500067',
    supportPhone: '7780673360',
  };

  try {
    const { data } = await admin
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'delhivery_enabled',
        'delhivery_pickup_location',
        'delhivery_origin_pincode',
        'delhivery_auto_manifest',
        'delhivery_default_weight_grams',
        'delhivery_default_dimensions',
        'delhivery_seller_gst',
        'store_name',
        'store_address',
        'store_city_state_pin',
        'support_phone',
      ]);

    const map = new Map<string, unknown>((data || []).map((r: any) => [r.key, r.value]));

    const boolVal = (k: string, fb: boolean): boolean => {
      if (!map.has(k)) return fb;
      const v = map.get(k);
      if (typeof v === 'boolean') return v;
      const norm = String(v ?? '').trim().toLowerCase();
      if (norm === 'true') return true;
      if (norm === 'false') return false;
      return fb;
    };

    const strVal = (k: string, fb: string): string => {
      if (!map.has(k)) return fb;
      const v = String(map.get(k) ?? '').trim();
      return v || fb;
    };

    const numVal = (k: string, fb: number): number => {
      if (!map.has(k)) return fb;
      const n = Number(map.get(k));
      return Number.isFinite(n) && n > 0 ? Math.round(n) : fb;
    };

    const rawDim = map.get('delhivery_default_dimensions') as any;
    const defaultDimensions =
      rawDim && typeof rawDim === 'object'
        ? {
            length: Math.max(1, Math.round(Number(rawDim.length) || 34)),
            breadth: Math.max(1, Math.round(Number(rawDim.breadth) || 26)),
            height: Math.max(1, Math.round(Number(rawDim.height) || 6)),
          }
        : defaults.defaultDimensions;

    const pinCandidate = cleanPincode(map.get('delhivery_origin_pincode')) || defaults.originPincode;

    return {
      ...defaults,
      enabled: boolVal('delhivery_enabled', defaults.enabled),
      pickupLocation: strVal('delhivery_pickup_location', defaults.pickupLocation),
      originPincode: pinCandidate,
      autoManifest: boolVal('delhivery_auto_manifest', defaults.autoManifest),
      defaultWeightGrams: numVal('delhivery_default_weight_grams', defaults.defaultWeightGrams),
      defaultDimensions,
      sellerGst: map.has('delhivery_seller_gst')
        ? String(map.get('delhivery_seller_gst') ?? '').trim()
        : defaults.sellerGst,
      storeName: strVal('store_name', defaults.storeName),
      storeAddress: strVal('store_address', defaults.storeAddress),
      storeCityStatePin: strVal('store_city_state_pin', defaults.storeCityStatePin),
      supportPhone: cleanIndianPhone(map.get('support_phone'), defaults.supportPhone),
    };
  } catch {
    return defaults;
  }
}

export async function delhiveryRequest(
  config: Pick<DelhiveryRuntimeConfig, 'token' | 'baseUrl'>,
  path: string,
  init: RequestInit = {}
): Promise<any> {
  if (!config.token) {
    throw new Error(
      'DELHIVERY_API_TOKEN is not configured in Supabase Edge Function Secrets.'
    );
  }

  const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Token ${config.token}`);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { rawText: text };
  }

  if (!res.ok) {
    const errMsg =
      parsed?.rmk ||
      parsed?.error ||
      parsed?.message ||
      parsed?.detail ||
      `Delhivery API returned HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  return parsed;
}

export async function checkPinServiceabilityAndTat(
  config: Pick<DelhiveryRuntimeConfig, 'token' | 'baseUrl' | 'originPincode'>,
  destinationPincode: string,
  originPincode?: string
) {
  const cleanDest = cleanPincode(destinationPincode);
  const cleanOrigin = cleanPincode(originPincode) || config.originPincode || '500067';
  if (!cleanDest) {
    throw new Error('Please provide a valid 6-digit Indian PIN code.');
  }

  const [pinRes, expressTatRes, surfaceTatRes] = await Promise.allSettled([
    delhiveryRequest(
      config,
      `/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(cleanDest)}`
    ),
    delhiveryRequest(
      config,
      `/api/dc/expected_tat?origin_pin=${encodeURIComponent(cleanOrigin)}&destination_pin=${encodeURIComponent(cleanDest)}&mot=E`
    ),
    delhiveryRequest(
      config,
      `/api/dc/expected_tat?origin_pin=${encodeURIComponent(cleanOrigin)}&destination_pin=${encodeURIComponent(cleanDest)}&mot=S`
    ),
  ]);

  if (pinRes.status === 'rejected') {
    throw pinRes.reason instanceof Error
      ? pinRes.reason
      : new Error('Unable to check PIN code serviceability with Delhivery.');
  }

  const deliveryCodes = Array.isArray(pinRes.value?.delivery_codes)
    ? pinRes.value.delivery_codes
    : [];
  const postal = deliveryCodes[0]?.postal_code || null;

  const remarks = String(postal?.remarks || '').trim();
  const remarksBlocked = /\b(nsz|embargo|not serviceable)\b/i.test(remarks);
  const prepaid = postal?.pre_paid === 'Y';
  const cod = postal?.cod === 'Y';
  const pickup = postal?.pickup === 'Y';
  const isOda = postal?.is_oda === 'Y';
  const serviceable = Boolean(postal) && (prepaid || cod) && !remarksBlocked;

  const extractTatDays = (settled: PromiseSettledResult<any>, fallback: number): number => {
    if (settled.status !== 'fulfilled') return fallback;
    const rawTat = Number(settled.value?.data?.tat);
    return Number.isFinite(rawTat) && rawTat > 0 ? Math.round(rawTat) : fallback;
  };

  const expressTransitDays = extractTatDays(expressTatRes, 2);
  const surfaceTransitDays = extractTatDays(surfaceTatRes, Math.max(expressTransitDays + 1, 4));

  const formatEstimatedWindow = (transitDays: number, handlingDays = 1) => {
    const start = new Date();
    start.setDate(start.getDate() + transitDays);
    const end = new Date();
    end.setDate(end.getDate() + transitDays + handlingDays);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
      });
    return handlingDays > 0 ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
  };

  return {
    pincode: cleanDest,
    originPincode: cleanOrigin,
    serviceable,
    prepaid,
    cod,
    pickup,
    isOda,
    city: String(postal?.district || postal?.city || '').trim(),
    stateCode: String(postal?.state_code || '').trim(),
    sortCode: String(postal?.sort_code || '').trim(),
    remarks,
    expressTatDays: expressTransitDays,
    standardTatDays: surfaceTransitDays,
    expressEstimatedWindow: serviceable ? formatEstimatedWindow(expressTransitDays, 1) : null,
    standardEstimatedWindow: serviceable ? formatEstimatedWindow(surfaceTransitDays, 1) : null,
  };
}

export async function calculateDelhiveryRates(
  config: Pick<DelhiveryRuntimeConfig, 'token' | 'baseUrl' | 'originPincode'>,
  params: {
    destinationPincode: string;
    originPincode?: string;
    weightGrams?: number;
    mode?: 'Express' | 'Surface';
    paymentMode?: 'Prepaid' | 'COD';
    codAmount?: number;
  }
) {
  const dPin = cleanPincode(params.destinationPincode);
  const oPin = cleanPincode(params.originPincode) || config.originPincode || '500067';
  if (!dPin) throw new Error('Invalid destination PIN code.');

  const md = params.mode === 'Surface' ? 'S' : 'E';
  const pt = params.paymentMode === 'COD' ? 'COD' : 'Pre-paid';
  const cgm = Math.max(50, Math.round(Number(params.weightGrams) || 650));

  const qs = new URLSearchParams({
    md,
    ss: 'DTO',
    d_pin: dPin,
    o_pin: oPin,
    cgm: String(cgm),
    pt,
  });
  if (pt === 'COD' && params.codAmount && params.codAmount > 0) {
    qs.set('cod', String(Math.round(params.codAmount)));
  }

  const data = await delhiveryRequest(config, `/api/kinko/v1/invoice/charges/.json?${qs.toString()}`);
  const row = Array.isArray(data) ? data[0] : data;

  return {
    zone: row?.zone || null,
    chargedWeightGrams: Number(row?.charged_weight ?? cgm),
    grossAmountInr: Number(row?.gross_amount ?? 0),
    totalAmountInr: Number(row?.total_amount ?? 0),
    codChargeInr: Number(row?.charge_COD ?? 0),
    fuelSurchargeInr: Number(row?.charge_FSC ?? 0),
    raw: row,
  };
}

export function mapDelhiveryScanToOrderStatus(
  statusText?: string | null,
  statusType?: string | null,
  nslCode?: string | null,
  currentOrderStatus?: string | null
): string {
  const txt = String(statusText || '').trim().toLowerCase();
  const sType = String(statusType || '').trim().toUpperCase();
  const nsl = String(nslCode || '').trim().toUpperCase();
  const cur = String(currentOrderStatus || 'confirmed').trim().toLowerCase();

  let candidate: string | null = null;

  if (
    sType === 'CN' ||
    txt === 'canceled' ||
    txt === 'cancelled' ||
    nsl === 'EOD-108'
  ) {
    candidate = 'cancelled';
  } else if (
    sType === 'RT' ||
    txt.includes('rto') ||
    txt.includes('returned') ||
    txt.includes('dto')
  ) {
    candidate = 'returned';
  } else if ((sType === 'DL' && !txt.includes('rto')) || txt === 'delivered') {
    candidate = 'delivered';
  } else if (
    txt.includes('out for delivery') ||
    txt.includes('oofd') ||
    ['X-DDD3FD', 'X-PD3FD'].includes(nsl)
  ) {
    candidate = 'out_for_delivery';
  } else if (
    txt.includes('in transit') ||
    txt.includes('picked up') ||
    txt === 'picked' ||
    txt.includes('dispatched') ||
    txt.includes('reached') ||
    txt.includes('collected') ||
    txt.includes('manifested') ||
    txt.includes('not picked') ||
    sType === 'UD' ||
    sType === 'IT'
  ) {
    if (
      (txt.includes('manifested') || txt.includes('not picked')) &&
      !txt.includes('picked up') &&
      !txt.includes('in transit') &&
      !txt.includes('dispatched')
    ) {
      candidate = 'packed';
    } else if (txt === 'pending' && ['pending', 'confirmed', 'processing', 'packed'].includes(cur)) {
      candidate = 'shipped';
    } else {
      candidate = 'shipped';
    }
  }

  if (!candidate) return cur;

  const rank: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    packed: 3,
    shipped: 4,
    out_for_delivery: 5,
    delivered: 6,
    returned: 7,
    refunded: 8,
    cancelled: 7,
  };

  const curRank = rank[cur] ?? 1;
  const candRank = rank[candidate] ?? 1;

  // Never regress terminal statuses backward; only advance forward or allow return/cancel transitions
  if (cur === 'delivered' && candidate !== 'returned' && candidate !== 'refunded') {
    return cur;
  }
  if (cur === 'cancelled' || cur === 'refunded') {
    return cur;
  }
  if (candRank >= curRank) {
    return candidate;
  }
  return cur;
}

export async function trackDelhiveryWaybill(
  config: Pick<DelhiveryRuntimeConfig, 'token' | 'baseUrl'>,
  params: { waybill?: string; refIds?: string }
): Promise<DelhiveryTrackingResult> {
  const awbInput = String(params.waybill || '').trim();
  const refInput = String(params.refIds || '').trim();
  if (!awbInput && !refInput) {
    throw new Error('Waybill or Reference ID is required for Delhivery tracking.');
  }

  const qs = new URLSearchParams();
  if (awbInput) qs.set('waybill', awbInput);
  if (refInput) qs.set('ref_ids', refInput);

  const data = await delhiveryRequest(config, `/api/v1/packages/json/?${qs.toString()}`);

  const shipmentList = Array.isArray(data?.ShipmentData) ? data.ShipmentData : [];
  const shipment = shipmentList[0]?.Shipment || null;

  if (!shipment) {
    return {
      found: false,
      awb: awbInput,
      referenceNo: refInput || undefined,
      currentStatus: 'Awaiting Scan',
      statusType: '',
      currentLocation: '',
      trackingUrl: awbInput ? `https://www.delhivery.com/track/package/${encodeURIComponent(awbInput)}` : 'https://www.delhivery.com/tracking',
      scans: [],
      raw: data,
      message: data?.Error || data?.rmk || 'No tracking data yet for this waybill.',
    };
  }

  const statusObj = shipment.Status || {};
  const awb = String(shipment.AWB || awbInput).trim();
  const currentStatus = String(statusObj.Status || 'Manifested').trim();
  const statusType = String(statusObj.StatusType || '').trim();
  const statusCode = String(shipment.NSLCode || '').trim();
  const currentLocation = String(statusObj.StatusLocation || '').trim();
  const statusDateTime = statusObj.StatusDateTime || null;
  const instructions = String(statusObj.Instructions || '').trim();

  const rawScans = Array.isArray(shipment.Scans) ? shipment.Scans : [];
  const scans: NormalizedDelhiveryScan[] = rawScans
    .map((entry: any) => {
      const detail = entry?.ScanDetail || entry || {};
      const dt = String(detail.ScanDateTime || '').trim();
      return {
        scan: String(detail.Scan || currentStatus).trim(),
        scanType: String(detail.ScanType || '').trim(),
        statusCode: String(detail.StatusCode || '').trim(),
        location: String(detail.ScannedLocation || '').trim(),
        instructions: String(detail.Instructions || '').trim(),
        dateTime: dt,
        formattedTime: formatIstDateTime(dt),
      };
    })
    .filter((s: NormalizedDelhiveryScan) => Boolean(s.scan || s.location || s.dateTime))
    .sort((a: NormalizedDelhiveryScan, b: NormalizedDelhiveryScan) => {
      const ta = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const tb = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return tb - ta;
    });

  const mappedOrderStatus = mapDelhiveryScanToOrderStatus(currentStatus, statusType, statusCode);

  return {
    found: true,
    awb,
    referenceNo: shipment.ReferenceNo ? String(shipment.ReferenceNo) : refInput || undefined,
    currentStatus,
    statusType,
    statusCode,
    currentLocation,
    instructions,
    statusDateTime: statusDateTime || undefined,
    origin: shipment.Origin ? String(shipment.Origin) : undefined,
    destination: shipment.Destination ? String(shipment.Destination) : undefined,
    estimatedDelivery: shipment.ExpectedDeliveryDate || null,
    pickedUpDate: shipment.PickedUpDate || null,
    deliveryDate: shipment.DeliveryDate || null,
    mappedOrderStatus,
    trackingUrl: `https://www.delhivery.com/track/package/${encodeURIComponent(awb)}`,
    scans,
    raw: shipment,
  };
}

export async function syncOrderAndShipmentFromDelhivery(
  admin: any,
  params: {
    orderId?: string | null;
    waybill: string;
    trackingResult: DelhiveryTrackingResult;
  }
) {
  const { waybill, trackingResult } = params;
  const nowIso = new Date().toISOString();

  let orderRow: any = null;
  if (params.orderId) {
    const { data } = await admin
      .from('orders')
      .select('id, order_number, order_status, courier_name, tracking_id')
      .eq('id', params.orderId)
      .maybeSingle();
    orderRow = data;
  }
  if (!orderRow && waybill) {
    const { data } = await admin
      .from('orders')
      .select('id, order_number, order_status, courier_name, tracking_id')
      .eq('tracking_id', waybill)
      .maybeSingle();
    orderRow = data;
  }
  if (!orderRow && waybill) {
    const { data: shipRow } = await admin
      .from('shipments')
      .select('order_id')
      .eq('tracking_number', waybill)
      .maybeSingle();
    if (shipRow?.order_id) {
      const { data } = await admin
        .from('orders')
        .select('id, order_number, order_status, courier_name, tracking_id')
        .eq('id', shipRow.order_id)
        .maybeSingle();
      orderRow = data;
    }
  }

  if (!orderRow) {
    return { synced: false, orderId: null, nextOrderStatus: null };
  }

  const nextOrderStatus = mapDelhiveryScanToOrderStatus(
    trackingResult.currentStatus,
    trackingResult.statusType,
    trackingResult.statusCode,
    orderRow.order_status
  );

  const trackingUrl =
    trackingResult.trackingUrl || `https://www.delhivery.com/track/package/${encodeURIComponent(waybill)}`;

  const shipmentPatch: Record<string, unknown> = {
    order_id: orderRow.id,
    courier_partner: 'Delhivery One',
    tracking_number: waybill,
    tracking_url: trackingUrl,
    current_status: trackingResult.currentStatus || 'In Transit',
    status_code: trackingResult.statusCode || null,
    status_type: trackingResult.statusType || null,
    current_location: trackingResult.currentLocation || null,
    history: trackingResult.scans || [],
    last_synced_at: nowIso,
    updated_at: nowIso,
  };

  if (trackingResult.estimatedDelivery) {
    const parsedEst = new Date(trackingResult.estimatedDelivery);
    if (!Number.isNaN(parsedEst.getTime())) {
      shipmentPatch.estimated_delivery = parsedEst.toISOString();
    }
  }
  if (trackingResult.deliveryDate && nextOrderStatus === 'delivered') {
    const parsedDel = new Date(trackingResult.deliveryDate);
    if (!Number.isNaN(parsedDel.getTime())) {
      shipmentPatch.actual_delivery = parsedDel.toISOString();
    }
  } else if (nextOrderStatus === 'delivered' && !shipmentPatch.actual_delivery) {
    const parsedStatusDt = trackingResult.statusDateTime
      ? new Date(trackingResult.statusDateTime)
      : null;
    shipmentPatch.actual_delivery =
      parsedStatusDt && !Number.isNaN(parsedStatusDt.getTime())
        ? parsedStatusDt.toISOString()
        : nowIso;
  }

  const { data: existingShipment } = await admin
    .from('shipments')
    .select('id')
    .eq('tracking_number', waybill)
    .maybeSingle();

  if (existingShipment?.id) {
    await admin.from('shipments').update(shipmentPatch).eq('id', existingShipment.id);
  } else {
    await admin.from('shipments').insert(shipmentPatch);
  }

  const orderUpdate: Record<string, unknown> = {
    updated_at: nowIso,
  };
  if (!orderRow.courier_name) {
    orderUpdate.courier_name = 'Delhivery One';
  }
  if (!orderRow.tracking_id) {
    orderUpdate.tracking_id = waybill;
  }
  if (nextOrderStatus && nextOrderStatus !== orderRow.order_status) {
    orderUpdate.order_status = nextOrderStatus;
  }

  await admin.from('orders').update(orderUpdate).eq('id', orderRow.id);

  if (nextOrderStatus && nextOrderStatus !== orderRow.order_status) {
    const locSuffix = trackingResult.currentLocation ? ` at ${trackingResult.currentLocation}` : '';
    await admin.from('order_status_history').insert({
      order_id: orderRow.id,
      previous_status: orderRow.order_status,
      new_status: nextOrderStatus,
      note: `Delhivery scan: ${trackingResult.currentStatus}${locSuffix} (AWB: ${waybill}).`,
    });
  }

  return {
    synced: true,
    orderId: orderRow.id,
    orderNumber: orderRow.order_number,
    previousOrderStatus: orderRow.order_status,
    nextOrderStatus,
  };
}

export async function manifestDelhiveryShipmentForOrder(
  admin: any,
  orderId: string,
  options: {
    pickupLocation?: string;
    shippingMode?: 'Express' | 'Surface';
    weightGrams?: number;
    length?: number;
    breadth?: number;
    height?: number;
    forceRecreate?: boolean;
  } = {}
) {
  const config = await getDelhiveryRuntimeConfig(admin);
  if (!config.token) {
    throw new Error('DELHIVERY_API_TOKEN is not configured in Supabase Edge Function Secrets.');
  }

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('*, order_items (*)')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    throw new Error('Order not found.');
  }

  const { data: existingShipments } = await admin
    .from('shipments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  const activeExisting = (existingShipments || []).find((s: any) => !s.cancelled_at);
  if (activeExisting && !options.forceRecreate) {
    return {
      alreadyManifested: true,
      waybill: activeExisting.tracking_number,
      shipment: activeExisting,
      trackingUrl:
        activeExisting.tracking_url ||
        `https://www.delhivery.com/track/package/${activeExisting.tracking_number}`,
    };
  }

  const shippingAddr =
    typeof order.shipping_address === 'object' && order.shipping_address !== null
      ? order.shipping_address
      : {};
  const destPin = cleanPincode(shippingAddr.pincode);
  if (!destPin) {
    throw new Error(`Order #${order.order_number} is missing a valid 6-digit delivery PIN code.`);
  }

  const itemsList: any[] = Array.isArray(order.order_items) ? order.order_items : [];
  const totalQty = itemsList.reduce((sum, it) => sum + Math.max(1, Number(it.quantity) || 1), 0) || 1;

  const weightGrams = Math.max(
    100,
    Math.round(Number(options.weightGrams) || config.defaultWeightGrams * totalQty)
  );
  const length = Math.max(1, Math.round(Number(options.length) || config.defaultDimensions.length));
  const breadth = Math.max(1, Math.round(Number(options.breadth) || config.defaultDimensions.breadth));
  const height = Math.max(1, Math.round(Number(options.height) || config.defaultDimensions.height));

  const pickupLocation = (options.pickupLocation || config.pickupLocation).trim();
  if (!pickupLocation) {
    throw new Error('Delhivery pickup location name is required.');
  }

  const shippingMode: 'Express' | 'Surface' =
    options.shippingMode === 'Surface'
      ? 'Surface'
      : options.shippingMode === 'Express'
      ? 'Express'
      : order.delivery_option === 'express'
      ? 'Express'
      : 'Express';

  const isCodOrder =
    String(order.payment_method || '').toLowerCase() === 'cod' &&
    String(order.payment_status || '').toLowerCase() !== 'paid';
  const paymentMode: 'Prepaid' | 'COD' = isCodOrder ? 'COD' : 'Prepaid';
  const totalAmount = Math.max(1, Math.round(Number(order.total_inr || 0)));

  const recipientName = String(
    shippingAddr.fullName || shippingAddr.full_name || order.customer_name || 'Customer'
  ).trim();
  const recipientPhone = cleanIndianPhone(shippingAddr.phone || order.customer_phone);
  const streetLine = [
    shippingAddr.streetAddress || shippingAddr.street_address || '',
    shippingAddr.apartment || '',
    shippingAddr.landmark ? `Near ${shippingAddr.landmark}` : '',
  ]
    .filter(Boolean)
    .join(', ')
    .slice(0, 240);

  if (!streetLine) {
    throw new Error(`Order #${order.order_number} is missing a shipping street address.`);
  }

  const firstTitle = itemsList[0]?.product_title || 'DORASANI Handloom Apparel';
  const productDesc =
    itemsList.length > 1
      ? `${firstTitle} + ${itemsList.length - 1} more`.slice(0, 180)
      : String(firstTitle).slice(0, 180);

  const attemptSuffix =
    existingShipments && existingShipments.length > 0 ? `-R${existingShipments.length + 1}` : '';
  const clientOrderRef = `${order.order_number}${attemptSuffix}`;

  const manifestPayload = {
    shipments: [
      {
        name: recipientName,
        add: streetLine,
        pin: destPin,
        city: String(shippingAddr.city || '').trim() || 'Hyderabad',
        state: String(shippingAddr.state || '').trim() || 'Telangana',
        country: 'India',
        phone: recipientPhone,
        order: clientOrderRef,
        client_order_id: order.order_number,
        payment_mode: paymentMode,
        return_pin: config.originPincode,
        return_city: 'Hyderabad',
        return_phone: config.supportPhone,
        return_add: config.storeAddress,
        return_state: 'Telangana',
        return_country: 'India',
        products_desc: productDesc,
        hsn_code: '5007',
        cod_amount: paymentMode === 'COD' ? String(totalAmount) : '0',
        order_date: order.created_at || new Date().toISOString(),
        total_amount: String(totalAmount),
        seller_add: config.storeAddress,
        seller_name: config.storeName,
        seller_inv: order.order_number,
        ...(config.sellerGst ? { seller_cst: config.sellerGst } : {}),
        quantity: String(totalQty),
        shipment_length: String(length),
        shipment_width: String(breadth),
        shipment_height: String(height),
        length: String(length),
        breadth: String(breadth),
        height: String(height),
        weight: String(weightGrams),
        shipping_mode: shippingMode,
        address_type: String(shippingAddr.addressType || 'home').toLowerCase(),
        fragile_shipment: false,
      },
    ],
    pickup_location: {
      name: pickupLocation,
      add: config.storeAddress,
      city: 'Hyderabad',
      pin_code: config.originPincode,
      country: 'India',
      phone: config.supportPhone,
    },
  };

  const formBody = `format=json&data=${encodeURIComponent(JSON.stringify(manifestPayload))}`;
  const resp = await delhiveryRequest(config, '/api/cmu/create.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody,
  });

  const pkg = Array.isArray(resp?.packages) ? resp.packages[0] : null;
  const waybill = String(pkg?.waybill || '').trim();
  const isPkgOk =
    Boolean(waybill) &&
    (resp?.success === true || String(pkg?.status || '').toLowerCase() === 'success');

  if (!isPkgOk) {
    const errDetail =
      (Array.isArray(pkg?.remarks) ? pkg.remarks.join(', ') : pkg?.remarks) ||
      resp?.rmk ||
      resp?.error ||
      'Delhivery rejected shipment manifestation.';
    throw new Error(errDetail);
  }

  const nowIso = new Date().toISOString();
  const trackingUrl = `https://www.delhivery.com/track/package/${encodeURIComponent(waybill)}`;

  const initialHistory: NormalizedDelhiveryScan[] = [
    {
      scan: 'Manifested',
      scanType: 'UD',
      statusCode: 'X-UCI',
      location: `${pickupLocation} (${config.originPincode})`,
      instructions: 'Shipment manifested via Delhivery One API',
      dateTime: nowIso,
      formattedTime: formatIstDateTime(nowIso),
    },
  ];

  const { data: insertedShipment, error: shipErr } = await admin
    .from('shipments')
    .insert({
      order_id: orderId,
      courier_partner: 'Delhivery One',
      tracking_number: waybill,
      tracking_url: trackingUrl,
      current_status: 'Manifested',
      status_type: 'UD',
      status_code: 'X-UCI',
      current_location: `${pickupLocation} (${config.originPincode})`,
      pickup_location: pickupLocation,
      shipping_mode: shippingMode,
      payment_mode: paymentMode,
      origin_city: 'Hyderabad',
      destination_pincode: destPin,
      package_weight_grams: weightGrams,
      package_dimensions: { length, breadth, height },
      history: initialHistory,
      manifest_response: resp,
      last_synced_at: nowIso,
      updated_at: nowIso,
    })
    .select()
    .single();

  if (shipErr) {
    console.error('[delhivery] Failed saving shipment row after AWB creation:', shipErr);
  }

  const currentOrdStatus = String(order.order_status || 'confirmed').toLowerCase();
  const shouldAdvanceToPacked = ['pending', 'confirmed', 'processing'].includes(currentOrdStatus);
  const nextStatus = shouldAdvanceToPacked ? 'packed' : order.order_status;

  await admin
    .from('orders')
    .update({
      courier_name: 'Delhivery One',
      tracking_id: waybill,
      ...(shouldAdvanceToPacked ? { order_status: 'packed' } : {}),
      updated_at: nowIso,
    })
    .eq('id', orderId);

  await admin.from('order_status_history').insert({
    order_id: orderId,
    previous_status: order.order_status,
    new_status: nextStatus,
    note: `Delhivery One AWB manifested: ${waybill} (Warehouse: ${pickupLocation}, Mode: ${shippingMode}).`,
  });

  return {
    alreadyManifested: false,
    waybill,
    trackingUrl,
    shipment: insertedShipment || null,
    nextOrderStatus: nextStatus,
    manifestResponse: resp,
  };
}

export async function fetchDelhiveryPackingSlip(
  config: Pick<DelhiveryRuntimeConfig, 'token' | 'baseUrl'>,
  waybill: string
) {
  const cleanWbn = String(waybill || '').trim();
  if (!cleanWbn) throw new Error('Waybill is required to fetch Delhivery packing slip.');

  const [pdfResp, jsonResp] = await Promise.allSettled([
    delhiveryRequest(
      config,
      `/api/p/packing_slip?wbns=${encodeURIComponent(cleanWbn)}&pdf=true`
    ),
    delhiveryRequest(
      config,
      `/api/p/packing_slip?wbns=${encodeURIComponent(cleanWbn)}`
    ),
  ]);

  const pdfPkg =
    pdfResp.status === 'fulfilled' && Array.isArray(pdfResp.value?.packages)
      ? pdfResp.value.packages[0]
      : null;
  const jsonPkg =
    jsonResp.status === 'fulfilled' && Array.isArray(jsonResp.value?.packages)
      ? jsonResp.value.packages[0]
      : null;

  const pkg = jsonPkg || pdfPkg;
  if (!pkg) {
    const errMsg =
      (jsonResp.status === 'rejected' && jsonResp.reason?.message) ||
      (pdfResp.status === 'rejected' && pdfResp.reason?.message) ||
      'Unable to fetch Delhivery packing slip for this AWB.';
    throw new Error(errMsg);
  }

  return {
    waybill: cleanWbn,
    pdfUrl: pdfPkg?.pdf_download_link || jsonPkg?.pdf_download_link || null,
    sortCode: pkg.sort_code || null,
    barcode: pkg.barcode || null,
    orderBarcode: pkg.oid_barcode || null,
    packageData: pkg,
  };
}

export async function scheduleDelhiveryPickup(
  config: Pick<DelhiveryRuntimeConfig, 'token' | 'baseUrl' | 'pickupLocation'>,
  params: {
    pickupLocation?: string;
    pickupDate: string;
    pickupTime: string;
    expectedPackageCount: number;
  }
) {
  const pickupLocation = (params.pickupLocation || config.pickupLocation).trim();
  if (!pickupLocation) throw new Error('Pickup warehouse name is required.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.pickupDate)) {
    throw new Error('Pickup date must be in YYYY-MM-DD format.');
  }
  const normalizedTime = /^\d{2}:\d{2}(:\d{2})?$/.test(params.pickupTime)
    ? params.pickupTime.length === 5
      ? `${params.pickupTime}:00`
      : params.pickupTime
    : '15:00:00';

  const count = Math.max(1, Math.round(Number(params.expectedPackageCount) || 1));

  const res = await delhiveryRequest(config, '/fm/request/new/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pickup_location: pickupLocation,
      pickup_date: params.pickupDate,
      pickup_time: normalizedTime,
      expected_package_count: count,
    }),
  });

  if (res?.data?.message && res?.pr_exist === false && !res?.pickup_id) {
    throw new Error(res.data.message);
  }

  return {
    pickupId: res?.pickup_id ? String(res.pickup_id) : res?.incoming_center_name ? `PU-${params.pickupDate}` : null,
    pickupLocation,
    pickupDate: params.pickupDate,
    pickupTime: normalizedTime,
    expectedPackageCount: count,
    raw: res,
  };
}

export async function cancelDelhiveryShipment(
  config: Pick<DelhiveryRuntimeConfig, 'token' | 'baseUrl'>,
  waybill: string
) {
  const cleanWbn = String(waybill || '').trim();
  if (!cleanWbn) throw new Error('Waybill is required to cancel a Delhivery shipment.');

  const res = await delhiveryRequest(config, '/api/p/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      waybill: cleanWbn,
      cancellation: 'true',
    }),
  });

  if (res?.status === false || res?.Error) {
    throw new Error(res?.Error || res?.rmk || 'Delhivery refused shipment cancellation.');
  }

  return res;
}
