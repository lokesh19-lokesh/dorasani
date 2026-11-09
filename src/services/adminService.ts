import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { TablesUpdate } from '../types/supabase';

export interface AdminProductInput {
  title: string;
  slug: string;
  sku?: string;
  subtitle?: string;
  short_description?: string;
  description: string;
  category_id?: string | null;
  product_type?: string;
  price_inr: number;
  mrp_inr: number;
  discount_percent?: number;
  fabric?: string;
  occasion?: string;
  weaving_style?: string;
  saree_length?: string;
  care_instructions?: string;
  blouse_included?: boolean;
  blouse_description?: string;
  status?: string;
  stock_quantity?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_festive?: boolean;
  specifications?: any;
  images?: string[];
}

export interface AdminCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface AdminCouponInput {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount_inr?: number;
  max_discount_inr?: number | null;
  usage_limit?: number | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface AdminBannerInput {
  banner_type?: string;
  tagline?: string | null;
  title_line_1: string;
  title_line_2?: string | null;
  description?: string | null;
  primary_cta_label?: string | null;
  primary_cta_link?: string | null;
  secondary_cta_label?: string | null;
  secondary_cta_link?: string | null;
  desktop_image_url: string;
  mobile_image_url: string;
  display_order?: number;
  is_active?: boolean;
}

function emptyMetrics() {
  return {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    recentOrders: [] as any[],
  };
}

export const adminService = {
  // 1. Dashboard Statistics
  async getDashboardMetrics() {
    if (!isSupabaseConfigured) {
      return emptyMetrics();
    }

    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total_inr, order_status, created_at, customer_name, order_number')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id, status, in_stock, stock_quantity'),
        supabase.from('profiles').select('id', { count: 'exact' }),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (customersRes.error) throw customersRes.error;

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      const totalSales = orders
        .filter((o) => o.order_status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total_inr || 0), 0);

      const pendingOrders = orders.filter(
        (o) => o.order_status === 'pending' || o.order_status === 'confirmed'
      ).length;
      const processingOrders = orders.filter(
        (o) =>
          o.order_status === 'processing' ||
          o.order_status === 'packed' ||
          o.order_status === 'shipped' ||
          o.order_status === 'out_for_delivery'
      ).length;
      const deliveredOrders = orders.filter((o) => o.order_status === 'delivered').length;
      const cancelledOrders = orders.filter((o) => o.order_status === 'cancelled').length;

      const activeProducts = products.filter((p) => p.status === 'active').length;
      const outOfStockProducts = products.filter(
        (p) => !p.in_stock || (p.stock_quantity ?? 0) <= 0
      ).length;

      return {
        totalSales,
        totalOrders: orders.length,
        totalCustomers: customersRes.count ?? 0,
        totalProducts: products.length,
        activeProducts,
        outOfStockProducts,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrders: orders.slice(0, 10),
      };
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
      return emptyMetrics();
    }
  },

  // 2. Product Management
  async getProducts(page = 1, limit = 100) {
    if (!isSupabaseConfigured) return { products: [], total: 0 };
    const from = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('products')
      .select(
        `
        *,
        categories (id, name, slug),
        product_media (id, url, alt_text, display_order, is_primary)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) throw error;
    return { products: data || [], total: count || 0 };
  },

  async createProduct(input: AdminProductInput) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const stockQty = Math.max(0, Number(input.stock_quantity ?? 15));
    const mrp = Number(input.mrp_inr || input.price_inr);
    const price = Number(input.price_inr);
    const discountPercent =
      input.discount_percent !== undefined
        ? Number(input.discount_percent)
        : mrp > price && mrp > 0
        ? Math.round(((mrp - price) / mrp) * 100)
        : 0;

    const status =
      input.status || (stockQty > 0 ? 'active' : 'out_of_stock');

    const { data: prod, error } = await supabase
      .from('products')
      .insert({
        title: input.title.trim(),
        slug: input.slug.trim(),
        sku: (input.sku && input.sku.trim()) || `DOR-${input.slug.trim().toUpperCase()}`,
        subtitle: input.subtitle?.trim() || null,
        short_description:
          input.short_description?.trim() || (input.description || '').substring(0, 200),
        description: input.description || '',
        category_id: input.category_id || null,
        product_type: input.product_type || 'saree',
        price_inr: price,
        mrp_inr: mrp,
        discount_percent: discountPercent,
        fabric: input.fabric?.trim() || null,
        occasion: input.occasion?.trim() || null,
        weaving_style: input.weaving_style?.trim() || null,
        saree_length: input.saree_length?.trim() || null,
        care_instructions: input.care_instructions?.trim() || null,
        blouse_included: input.blouse_included ?? true,
        blouse_description: input.blouse_description?.trim() || null,
        status,
        stock_quantity: stockQty,
        in_stock: stockQty > 0,
        is_featured: Boolean(input.is_featured),
        is_new: Boolean(input.is_new),
        is_bestseller: Boolean(input.is_bestseller),
        is_festive: Boolean(input.is_festive),
        specifications: input.specifications ?? {},
      })
      .select()
      .single();

    if (error) throw error;

    const cleanImages = (input.images || []).map((u) => u.trim()).filter(Boolean);
    if (cleanImages.length > 0) {
      const mediaRows = cleanImages.map((url, idx) => ({
        product_id: prod.id,
        url,
        alt_text: `${prod.title} View ${idx + 1}`,
        display_order: idx,
        is_primary: idx === 0,
      }));
      const { error: mediaErr } = await supabase.from('product_media').insert(mediaRows);
      if (mediaErr) throw mediaErr;
    }

    const { error: ledgerErr } = await supabase.from('inventory_movements').insert({
      product_id: prod.id,
      previous_quantity: 0,
      quantity_changed: stockQty,
      new_quantity: stockQty,
      reason: 'initial_stock',
    });
    if (ledgerErr) throw ledgerErr;

    return prod;
  },

  async updateProduct(id: string, updates: Partial<AdminProductInput>) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data: existing, error: fetchErr } = await supabase
      .from('products')
      .select('price_inr, mrp_inr, stock_quantity, title, status')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) throw fetchErr || new Error('Product not found');

    const { images, ...rawFields } = updates;
    const payload: TablesUpdate<'products'> = {};

    const assignIfDefined = <K extends keyof TablesUpdate<'products'>>(
      key: K,
      value: TablesUpdate<'products'>[K] | undefined
    ) => {
      if (value !== undefined) {
        payload[key] = value;
      }
    };

    assignIfDefined('title', rawFields.title);
    assignIfDefined('slug', rawFields.slug);
    assignIfDefined('sku', rawFields.sku);
    assignIfDefined('subtitle', rawFields.subtitle);
    assignIfDefined('short_description', rawFields.short_description);
    assignIfDefined('description', rawFields.description);
    assignIfDefined('category_id', rawFields.category_id);
    assignIfDefined('product_type', rawFields.product_type);
    assignIfDefined('price_inr', rawFields.price_inr);
    assignIfDefined('mrp_inr', rawFields.mrp_inr);
    assignIfDefined('fabric', rawFields.fabric);
    assignIfDefined('occasion', rawFields.occasion);
    assignIfDefined('weaving_style', rawFields.weaving_style);
    assignIfDefined('saree_length', rawFields.saree_length);
    assignIfDefined('care_instructions', rawFields.care_instructions);
    assignIfDefined('blouse_included', rawFields.blouse_included);
    assignIfDefined('blouse_description', rawFields.blouse_description);
    assignIfDefined('status', rawFields.status);
    assignIfDefined('is_featured', rawFields.is_featured);
    assignIfDefined('is_new', rawFields.is_new);
    assignIfDefined('is_bestseller', rawFields.is_bestseller);
    assignIfDefined('is_festive', rawFields.is_festive);
    assignIfDefined('specifications', rawFields.specifications);

    if (payload.category_id === '') payload.category_id = null;
    if (payload.description !== undefined && payload.short_description === undefined) {
      payload.short_description = String(payload.description).substring(0, 200);
    }

    const finalPrice =
      payload.price_inr !== undefined ? Number(payload.price_inr) : existing.price_inr;
    const finalMrp =
      payload.mrp_inr !== undefined ? Number(payload.mrp_inr) : existing.mrp_inr;

    if (rawFields.discount_percent !== undefined) {
      payload.discount_percent = Number(rawFields.discount_percent);
    } else if (payload.price_inr !== undefined || payload.mrp_inr !== undefined) {
      payload.discount_percent =
        finalMrp > finalPrice && finalMrp > 0
          ? Math.round(((finalMrp - finalPrice) / finalMrp) * 100)
          : 0;
    }

    let stockDelta = 0;
    let prevStock = existing.stock_quantity ?? 0;
    let nextStock = prevStock;

    if (rawFields.stock_quantity !== undefined) {
      nextStock = Math.max(0, Number(rawFields.stock_quantity));
      stockDelta = nextStock - prevStock;
      payload.stock_quantity = nextStock;
      payload.in_stock = nextStock > 0;
      if (payload.status === undefined) {
        if (nextStock <= 0 && existing.status === 'active') payload.status = 'out_of_stock';
        else if (nextStock > 0 && existing.status === 'out_of_stock') payload.status = 'active';
      }
    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (images !== undefined) {
      const cleanImages = images.map((u) => u.trim()).filter(Boolean);
      const { error: delMediaErr } = await supabase
        .from('product_media')
        .delete()
        .eq('product_id', id);
      if (delMediaErr) throw delMediaErr;

      if (cleanImages.length > 0) {
        const mediaRows = cleanImages.map((url, idx) => ({
          product_id: id,
          url,
          alt_text: `${payload.title || existing.title} View ${idx + 1}`,
          display_order: idx,
          is_primary: idx === 0,
        }));
        const { error: insMediaErr } = await supabase.from('product_media').insert(mediaRows);
        if (insMediaErr) throw insMediaErr;
      }
    }

    if (rawFields.stock_quantity !== undefined && stockDelta !== 0) {
      const { error: ledgerErr } = await supabase.from('inventory_movements').insert({
        product_id: id,
        previous_quantity: prevStock,
        quantity_changed: stockDelta,
        new_quantity: nextStock,
        reason: 'product_edit',
      });
      if (ledgerErr) throw ledgerErr;
    }

    return data;
  },

  async deleteProduct(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 3. Category Management
  async getCategories() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCategory(cat: AdminCategoryInput) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: cat.name.trim(),
        slug: cat.slug.trim(),
        description: cat.description ?? null,
        image_url: cat.image_url ?? null,
        parent_id: cat.parent_id || null,
        display_order: cat.display_order ?? 10,
        is_active: cat.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, updates: Partial<AdminCategoryInput>) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const payload: TablesUpdate<'categories'> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (payload.parent_id === '') payload.parent_id = null;

    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 4. Order Management
  async getOrders(page = 1, limit = 100, statusFilter?: string) {
    if (!isSupabaseConfigured) return { orders: [], total: 0 };
    const from = (page - 1) * limit;
    let query = supabase
      .from('orders')
      .select(
        `
        *,
        order_items (*),
        payments (*)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('order_status', statusFilter as any);
    }

    const { data, count, error } = await query.range(from, from + limit - 1);
    if (error) throw error;
    return { orders: data || [], total: count || 0 };
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    courierName?: string,
    trackingId?: string
  ) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data: existingOrder } = await supabase
      .from('orders')
      .select('order_status')
      .eq('id', orderId)
      .single();

    const updateData: any = {
      order_status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (courierName !== undefined) updateData.courier_name = courierName.trim() || null;
    if (trackingId !== undefined) updateData.tracking_id = trackingId.trim() || null;

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    const { error: historyErr } = await supabase.from('order_status_history').insert({
      order_id: orderId,
      previous_status: (existingOrder?.order_status as any) || null,
      new_status: newStatus as any,
      note: trackingId
        ? `Status updated to ${newStatus} by admin (${courierName || 'Courier'}: ${trackingId}).`
        : `Status updated to ${newStatus} by admin.`,
    });
    if (historyErr) throw historyErr;

    return data;
  },

  // 5. Inventory Management
  async getInventoryLedger() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('inventory_movements')
      .select(
        `
        *,
        products (title, sku)
      `
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  async adjustStock(productId: string, quantityDelta: number, reason: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const { data: prod, error: fetchErr } = await supabase
      .from('products')
      .select('stock_quantity, status')
      .eq('id', productId)
      .single();

    if (fetchErr || !prod) throw fetchErr || new Error('Product not found');

    const previous_quantity = prod.stock_quantity ?? 0;
    const new_quantity = Math.max(0, previous_quantity + quantityDelta);
    const actualDelta = new_quantity - previous_quantity;

    const nextStatus =
      new_quantity <= 0 && prod.status === 'active'
        ? 'out_of_stock'
        : new_quantity > 0 && prod.status === 'out_of_stock'
        ? 'active'
        : prod.status;

    const { error: updateErr } = await supabase
      .from('products')
      .update({
        stock_quantity: new_quantity,
        in_stock: new_quantity > 0,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateErr) throw updateErr;

    const { error: ledgerErr } = await supabase.from('inventory_movements').insert({
      product_id: productId,
      previous_quantity,
      quantity_changed: actualDelta,
      new_quantity,
      reason,
    });

    if (ledgerErr) throw ledgerErr;

    return { previous_quantity, new_quantity };
  },

  async setExactStock(productId: string, targetQuantity: number, reason: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');

    const safeTarget = Math.max(0, Math.round(targetQuantity));
    const { data: prod, error: fetchErr } = await supabase
      .from('products')
      .select('stock_quantity, status')
      .eq('id', productId)
      .single();

    if (fetchErr || !prod) throw fetchErr || new Error('Product not found');

    const previous_quantity = prod.stock_quantity ?? 0;
    const delta = safeTarget - previous_quantity;

    const nextStatus =
      safeTarget <= 0 && prod.status === 'active'
        ? 'out_of_stock'
        : safeTarget > 0 && prod.status === 'out_of_stock'
        ? 'active'
        : prod.status;

    const { error: updateErr } = await supabase
      .from('products')
      .update({
        stock_quantity: safeTarget,
        in_stock: safeTarget > 0,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateErr) throw updateErr;

    const { error: ledgerErr } = await supabase.from('inventory_movements').insert({
      product_id: productId,
      previous_quantity,
      quantity_changed: delta,
      new_quantity: safeTarget,
      reason: reason || 'audit_correction',
    });

    if (ledgerErr) throw ledgerErr;

    return { previous_quantity, new_quantity: safeTarget };
  },

  // 6. Coupons Management
  async getCoupons() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createCoupon(c: AdminCouponInput) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: c.code.trim().toUpperCase(),
        discount_type: c.discount_type,
        discount_value: Number(c.discount_value),
        min_order_amount_inr: Number(c.min_order_amount_inr ?? 0),
        max_discount_inr:
          c.max_discount_inr !== null && c.max_discount_inr !== undefined && c.max_discount_inr > 0
            ? Number(c.max_discount_inr)
            : null,
        usage_limit:
          c.usage_limit !== null && c.usage_limit !== undefined && c.usage_limit > 0
            ? Number(c.usage_limit)
            : null,
        end_date: c.end_date || null,
        is_active: c.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCoupon(id: string, updates: Partial<AdminCouponInput>) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const payload: TablesUpdate<'coupons'> = {};
    if (updates.code !== undefined) payload.code = updates.code.trim().toUpperCase();
    if (updates.discount_type !== undefined) payload.discount_type = updates.discount_type;
    if (updates.discount_value !== undefined) payload.discount_value = Number(updates.discount_value);
    if (updates.min_order_amount_inr !== undefined) {
      payload.min_order_amount_inr = Number(updates.min_order_amount_inr);
    }
    if (updates.max_discount_inr !== undefined) {
      payload.max_discount_inr =
        updates.max_discount_inr && updates.max_discount_inr > 0
          ? Number(updates.max_discount_inr)
          : null;
    }
    if (updates.usage_limit !== undefined) {
      payload.usage_limit =
        updates.usage_limit && updates.usage_limit > 0 ? Number(updates.usage_limit) : null;
    }
    if (updates.end_date !== undefined) payload.end_date = updates.end_date || null;
    if (updates.is_active !== undefined) payload.is_active = Boolean(updates.is_active);

    const { data, error } = await supabase
      .from('coupons')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleCoupon(id: string, is_active: boolean) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
    if (error) throw error;
    return true;
  },

  async deleteCoupon(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 7. CMS & Banners
  async getBanners() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createBanner(banner: AdminBannerInput) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('banners')
      .insert({
        banner_type: banner.banner_type || 'hero',
        tagline: banner.tagline ?? null,
        title_line_1: banner.title_line_1.trim(),
        title_line_2: banner.title_line_2 ?? null,
        description: banner.description ?? null,
        primary_cta_label: banner.primary_cta_label ?? null,
        primary_cta_link: banner.primary_cta_link ?? null,
        secondary_cta_label: banner.secondary_cta_label ?? null,
        secondary_cta_link: banner.secondary_cta_link ?? null,
        desktop_image_url: banner.desktop_image_url.trim(),
        mobile_image_url: banner.mobile_image_url.trim(),
        display_order: banner.display_order ?? 1,
        is_active: banner.is_active ?? true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBanner(id: string, updates: Partial<AdminBannerInput>) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBanner(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // 8. Site Settings
  async getSettings() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    return data || [];
  },

  async updateSetting(key: string, value: any) {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { error } = await supabase.from('site_settings').upsert({ key, value });
    if (error) throw error;
    return true;
  },
};
