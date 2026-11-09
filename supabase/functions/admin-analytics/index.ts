/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseClient } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient(req);
    const admin = getSupabaseAdmin();

    // Verify user authorization
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Sign in required.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role (supports users with multiple role rows and admin_emails allowlist)
    const allowedRoles = ['super_admin', 'admin', 'catalog_manager', 'inventory_manager', 'order_manager'];
    const { data: roleRows, error: roleError } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', allowedRoles)
      .limit(1);

    let hasAdminAccess = !roleError && Boolean(roleRows && roleRows.length > 0);

    if (!hasAdminAccess && user.email) {
      const { data: adminEmailEntry } = await admin
        .from('admin_emails')
        .select('role')
        .eq('email', user.email.trim().toLowerCase())
        .eq('is_active', true)
        .maybeSingle();

      if (adminEmailEntry && allowedRoles.includes(adminEmailEntry.role)) {
        await admin.from('user_roles').upsert(
          { user_id: user.id, role: adminEmailEntry.role },
          { onConflict: 'user_id,role' }
        );
        hasAdminAccess = true;
      }
    }

    if (!hasAdminAccess) {
      return new Response(
        JSON.stringify({ error: 'Forbidden. Admin privileges required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch analytical aggregates
    const [ordersRes, lowStockRes, topSellersRes, couponsRes] = await Promise.all([
      admin.from('orders').select('id, total_inr, order_status, payment_status, created_at').order('created_at', { ascending: false }).limit(200),
      admin.from('products').select('id, title, stock_quantity, sku, mrp_inr, price_inr').filter('stock_quantity', 'lte', 5).limit(20),
      admin.from('products').select('id, title, sold_count, price_inr').order('sold_count', { ascending: false }).limit(10),
      admin.from('coupons').select('code, times_used, discount_value, is_active')
    ]);

    const orders = ordersRes.data || [];
    const validOrders = orders.filter((o: any) => o.order_status !== 'cancelled');

    const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + (o.total_inr || 0), 0);
    const averageOrderValue = validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0;

    return new Response(
      JSON.stringify({
        summary: {
          totalRevenue,
          averageOrderValue,
          totalOrdersCount: orders.length,
          deliveredOrders: orders.filter((o: any) => o.order_status === 'delivered').length,
          pendingOrders: orders.filter((o: any) => o.order_status === 'pending' || o.order_status === 'confirmed').length
        },
        lowStockAlerts: lowStockRes.data || [],
        topSellingProducts: topSellersRes.data || [],
        couponPerformance: couponsRes.data || [],
        recentOrders: orders.slice(0, 10),
        generatedAt: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Analytics calculation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

