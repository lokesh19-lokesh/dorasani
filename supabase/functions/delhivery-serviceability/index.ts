/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabaseClient.ts';
import {
  checkPinServiceabilityAndTat,
  cleanPincode,
  getDelhiveryRuntimeConfig,
} from '../_shared/delhivery.ts';
import { jsonResponse } from '../_shared/razorpay.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const admin = getSupabaseAdmin();

    let rawPincode = '';
    let rawOrigin = '';

    if (req.method === 'GET') {
      const url = new URL(req.url);
      rawPincode = url.searchParams.get('pincode') || url.searchParams.get('pin') || '';
      rawOrigin = url.searchParams.get('originPincode') || url.searchParams.get('origin') || '';
    } else {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== 'object') {
        return jsonResponse({ error: 'Invalid request body.' }, 400);
      }
      rawPincode = String(body.pincode || body.pin || '');
      rawOrigin = String(body.originPincode || body.origin || '');
    }

    const pincode = cleanPincode(rawPincode);
    if (!pincode) {
      return jsonResponse({ error: 'Please provide a valid 6-digit Indian PIN code.' }, 400);
    }

    const [config, codSettingRes] = await Promise.all([
      getDelhiveryRuntimeConfig(admin),
      admin.from('site_settings').select('value').eq('key', 'cod_enabled').maybeSingle(),
    ]);

    const rawCodVal = codSettingRes.data?.value;
    const storeCodEnabled =
      rawCodVal === true || String(rawCodVal ?? '').trim().toLowerCase() === 'true';

    const originPincode = cleanPincode(rawOrigin) || config.originPincode || '500067';

    if (!config.enabled || !config.token) {
      return jsonResponse({
        configured: Boolean(config.token),
        delhiveryEnabled: config.enabled,
        fallback: true,
        pincode,
        originPincode,
        serviceable: true,
        prepaid: true,
        cod: storeCodEnabled,
        delhiveryCod: true,
        storeCodEnabled,
        pickup: true,
        isOda: false,
        city: '',
        stateCode: '',
        sortCode: '',
        remarks: config.enabled
          ? 'Estimated delivery based on standard dispatch schedule.'
          : 'Live Delhivery serviceability check is currently disabled.',
        expressTatDays: 3,
        standardTatDays: 5,
        expressEstimatedWindow: '2 – 4 business days',
        standardEstimatedWindow: '4 – 6 business days',
      });
    }

    const result = await checkPinServiceabilityAndTat(config, pincode, originPincode);

    return jsonResponse({
      configured: true,
      delhiveryEnabled: true,
      fallback: false,
      storeCodEnabled,
      delhiveryCod: result.cod,
      ...result,
      cod: Boolean(result.cod && storeCodEnabled),
    });
  } catch (err: any) {
    console.error('[delhivery-serviceability] Error:', err);
    return jsonResponse(
      { error: err?.message || 'Unable to verify PIN code serviceability right now.' },
      502
    );
  }
});

