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

    // Query high-speed consolidated payload in parallel
    const [
      bannersRes,
      categoriesRes,
      featuredProductsRes,
      bestsellersRes,
      newArrivalsRes,
      settingsRes
    ] = await Promise.all([
      admin.from('banners').select('*').eq('is_active', true).order('display_order'),
      admin.from('categories').select('*').eq('is_active', true).is('parent_id', null).order('display_order'),
      admin.from('products').select('*, product_media(*)').eq('is_featured', true).eq('status', 'active').limit(8),
      admin.from('products').select('*, product_media(*)').eq('is_bestseller', true).eq('status', 'active').limit(8),
      admin.from('products').select('*, product_media(*)').eq('is_new', true).eq('status', 'active').limit(8),
      admin.from('site_settings').select('*')
    ]);

    const settingsMap = (settingsRes.data || []).reduce((acc: any, s: any) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    const responsePayload = {
      banners: bannersRes.data || [],
      categories: categoriesRes.data || [],
      featuredProducts: featuredProductsRes.data || [],
      bestsellers: bestsellersRes.data || [],
      newArrivals: newArrivalsRes.data || [],
      settings: settingsMap,
      generatedAt: new Date().toISOString()
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to fetch homepage data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

