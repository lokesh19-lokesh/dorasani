import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapDbOrderToOrder } from './checkoutService';
import type {
  DelhiveryRateQuote,
  DelhiveryServiceabilityResult,
  Order,
  ShipmentScan,
} from '../types';

export interface LiveTrackResponse {
  found: boolean;
  redacted: boolean;
  order: Order | null;
  tracking: {
    found: boolean;
    liveFetched: boolean;
    awb: string;
    courierPartner: string;
    currentStatus: string;
    statusType: string;
    statusCode: string;
    currentLocation: string;
    origin: string;
    destination: string;
    estimatedDelivery: string | null;
    pickedUpDate: string | null;
    deliveryDate: string | null;
    trackingUrl: string;
    lastSyncedAt: string | null;
    scans: ShipmentScan[];
  };
  liveSyncWarning?: string;
}

export interface DelhiveryLabelResponse {
  waybill: string;
  pdfUrl: string | null;
  sortCode: string | null;
  barcode: string | null;
  orderBarcode: string | null;
  sellerGst?: string;
  warehouse?: {
    name: string;
    address: string;
    cityStatePin: string;
    phone: string;
  };
  packageData: Record<string, any>;
}

async function extractDelhiveryFunctionError(
  error: any,
  data: any,
  fallback: string
): Promise<string> {
  if (data && typeof data === 'object' && typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }

  const ctx = error?.context;
  if (ctx && typeof ctx.clone === 'function') {
    try {
      const parsed = await ctx.clone().json();
      if (parsed && typeof parsed.error === 'string' && parsed.error.trim()) {
        return parsed.error;
      }
    } catch {
      try {
        const txt = await ctx.clone().text();
        if (txt && txt.trim()) return txt.trim();
      } catch {
        // ignore parse failure
      }
    }
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export const delhiveryService = {
  async checkServiceability(
    pincode: string,
    originPincode?: string
  ): Promise<DelhiveryServiceabilityResult> {
    if (!isSupabaseConfigured) {
      throw new Error('Live shipping check is not configured.');
    }

    const cleanPin = pincode.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(cleanPin)) {
      throw new Error('Please enter a valid 6-digit Indian PIN code.');
    }

    const { data, error } = await supabase.functions.invoke('delhivery-serviceability', {
      body: { pincode: cleanPin, originPincode },
    });

    if (error || !data || data.error) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Unable to verify PIN code serviceability with Delhivery right now.'
      );
      throw new Error(msg);
    }

    return data as DelhiveryServiceabilityResult;
  },

  async trackOrderLive(params: {
    orderNumber?: string;
    waybill?: string;
    trackingId?: string;
    refresh?: boolean;
  }): Promise<LiveTrackResponse> {
    if (!isSupabaseConfigured) {
      throw new Error('Live tracking service is not configured.');
    }

    const { data, error } = await supabase.functions.invoke('delhivery-track', {
      body: {
        orderNumber: params.orderNumber?.trim() || undefined,
        waybill: params.waybill?.trim() || undefined,
        trackingId: params.trackingId?.trim() || undefined,
        refresh: params.refresh !== false,
      },
    });

    if (error || !data || !data.found) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Order or tracking AWB not found.'
      );
      throw new Error(msg);
    }

    return {
      found: Boolean(data.found),
      redacted: Boolean(data.redacted),
      order: data.order ? mapDbOrderToOrder(data.order) : null,
      tracking: data.tracking,
      liveSyncWarning: data.liveSyncWarning,
    };
  },

  async testConnection(originPincode?: string): Promise<{
    ok: boolean;
    enabled: boolean;
    autoManifest: boolean;
    pickupLocation: string;
    originPincode: string;
    pinServiceable: boolean;
    hubCity: string;
    stateCode: string;
    sortCode: string;
  }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'test_connection',
        originPincode,
      },
    });

    if (error || !data?.ok) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Delhivery connection test failed.'
      );
      throw new Error(msg);
    }

    return data;
  },

  async calculateRates(params: {
    destinationPincode: string;
    originPincode?: string;
    weightGrams: number;
    paymentMode: 'Prepaid' | 'COD';
    codAmount?: number;
  }): Promise<{
    destinationPincode: string;
    originPincode: string;
    weightGrams: number;
    paymentMode: string;
    serviceability: DelhiveryServiceabilityResult | null;
    express: DelhiveryRateQuote;
    surface: DelhiveryRateQuote;
  }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'calculate_rates',
        ...params,
      },
    });

    if (error || !data?.success) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Failed to calculate Delhivery freight estimate.'
      );
      throw new Error(msg);
    }

    return data;
  },

  async createShipment(params: {
    orderId: string;
    pickupLocation?: string;
    shippingMode?: 'Express' | 'Surface';
    weightGrams?: number;
    length?: number;
    breadth?: number;
    height?: number;
    forceRecreate?: boolean;
  }): Promise<{
    alreadyManifested: boolean;
    waybill: string;
    trackingUrl: string;
    order: any;
  }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'create_shipment',
        ...params,
      },
    });

    if (error || !data?.success) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Failed to manifest shipment with Delhivery One.'
      );
      throw new Error(msg);
    }

    return data;
  },

  async getLabel(params: {
    orderId?: string;
    waybill?: string;
  }): Promise<DelhiveryLabelResponse> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'get_label',
        ...params,
      },
    });

    if (error || !data?.success) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Failed to load Delhivery packing slip / shipping label.'
      );
      throw new Error(msg);
    }

    return data as DelhiveryLabelResponse;
  },

  async schedulePickup(params: {
    pickupLocation?: string;
    pickupDate: string;
    pickupTime: string;
    expectedPackageCount: number;
    orderIds?: string[];
  }): Promise<{
    pickupId: string | null;
    pickupLocation: string;
    pickupDate: string;
    pickupTime: string;
    expectedPackageCount: number;
  }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'schedule_pickup',
        ...params,
      },
    });

    if (error || !data?.success) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Failed to schedule Delhivery courier pickup.'
      );
      throw new Error(msg);
    }

    return data;
  },

  async cancelShipment(params: {
    orderId?: string;
    waybill?: string;
    reason?: string;
  }): Promise<{
    waybill: string;
    order: any;
  }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'cancel_shipment',
        ...params,
      },
    });

    if (error || !data?.success) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Failed to cancel Delhivery AWB.'
      );
      throw new Error(msg);
    }

    return data;
  },

  async syncTracking(params: {
    orderId?: string;
    waybill?: string;
  }): Promise<{
    checked: number;
    synced: number;
    order?: any;
    tracking?: any;
  }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'sync_tracking',
        ...params,
      },
    });

    if (error || !data?.success) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Failed to sync Delhivery live tracking scans.'
      );
      throw new Error(msg);
    }

    return data;
  },

  async syncAllActiveShipments(): Promise<{
    checked: number;
    synced: number;
    updatedOrders: string[];
    errors: Array<{ waybill: string; error: string }>;
  }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.functions.invoke('delhivery-shipping', {
      body: {
        action: 'sync_tracking',
      },
    });

    if (error || !data?.success) {
      const msg = await extractDelhiveryFunctionError(
        error,
        data,
        'Bulk Delhivery tracking sync failed.'
      );
      throw new Error(msg);
    }

    return data;
  },
};

