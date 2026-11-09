import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapDatabaseToProduct } from './productService';
import type { CartItem, WishlistItem } from '../types';
import type { Json } from '../types/supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string | null | undefined): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

const cartSyncChains = new Map<string, Promise<void>>();

async function getOrCreateUserCartId(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured || !isUuid(userId)) return null;

  const { data: existing, error: fetchErr } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!fetchErr && existing?.id) {
    return existing.id;
  }

  const { data: created, error: insertErr } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (!insertErr && created?.id) {
    return created.id;
  }

  // Handle race if concurrent tab inserted simultaneously
  const { data: retry } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  return retry?.id || null;
}

async function getOrCreateUserWishlistId(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured || !isUuid(userId)) return null;

  const { data: existing, error: fetchErr } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!fetchErr && existing?.id) {
    return existing.id;
  }

  const { data: created, error: insertErr } = await supabase
    .from('wishlists')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (!insertErr && created?.id) {
    return created.id;
  }

  const { data: retry } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  return retry?.id || null;
}

export const userSyncService = {
  async fetchUserCart(userId: string): Promise<CartItem[]> {
    if (!isSupabaseConfigured || !isUuid(userId)) return [];

    try {
      const { data: cartRow } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!cartRow?.id) return [];

      const { data: itemRows, error } = await supabase
        .from('cart_items')
        .select(
          `
          id,
          product_id,
          variant_id,
          quantity,
          selected,
          products (
            *,
            categories:category_id (id, name, slug),
            product_media (url, alt_text, display_order, is_primary),
            product_variants (id, variant_name, color_name, color_hex, size, sku, stock_quantity)
          )
        `
        )
        .eq('cart_id', cartRow.id)
        .order('created_at', { ascending: true });

      if (error || !itemRows) return [];

      const mapped: CartItem[] = [];
      for (const row of itemRows as any[]) {
        if (!row.products) continue;
        const variants = row.products.product_variants || [];
        const product = mapDatabaseToProduct(
          row.products,
          row.products.product_media || [],
          variants
        );
        const matchedVariant = row.variant_id
          ? variants.find((v: any) => v.id === row.variant_id)
          : null;
        const selectedColor =
          matchedVariant?.color_name ||
          matchedVariant?.variant_name ||
          product.colors[0]?.name ||
          'Classic';

        mapped.push({
          id: `${product.id}-${selectedColor}`,
          product,
          selectedColor,
          quantity: Math.max(1, Number(row.quantity || 1)),
          selected: row.selected !== false,
        });
      }

      return mapped;
    } catch (err) {
      console.error('Failed to fetch user cart from Supabase:', err);
      return [];
    }
  },

  syncUserCart(userId: string, items: CartItem[]): Promise<void> {
    if (!isSupabaseConfigured || !isUuid(userId)) return Promise.resolve();

    const prev = cartSyncChains.get(userId) || Promise.resolve();
    const next = prev
      .catch(() => undefined)
      .then(async () => {
        try {
          const cartId = await getOrCreateUserCartId(userId);
          if (!cartId) return;

          const validItems = items.filter((item) => isUuid(item.product.id));
          const productIds = Array.from(new Set(validItems.map((i) => i.product.id)));

          const variantLookup = new Map<string, { id: string; color_name: string | null; variant_name: string | null }[]>();
          if (productIds.length > 0) {
            const { data: variantRows } = await supabase
              .from('product_variants')
              .select('id, product_id, color_name, variant_name')
              .in('product_id', productIds);

            for (const v of variantRows || []) {
              const list = variantLookup.get(v.product_id) || [];
              list.push(v);
              variantLookup.set(v.product_id, list);
            }
          }

          // Deduplicate desired entries on (product_id, variant_id || null)
          const desiredMap = new Map<
            string,
            { product_id: string; variant_id: string | null; quantity: number; selected: boolean }
          >();

          for (const item of validItems) {
            const variants = variantLookup.get(item.product.id) || [];
            const targetColor = (item.selectedColor || '').trim().toLowerCase();
            const matchedVar = variants.find(
              (v) =>
                (v.color_name && v.color_name.trim().toLowerCase() === targetColor) ||
                (v.variant_name && v.variant_name.trim().toLowerCase() === targetColor)
            );
            const variantId = matchedVar?.id || null;
            const compositeKey = `${item.product.id}::${variantId || ''}`;
            const qty = Math.max(1, Math.round(item.quantity || 1));

            const existing = desiredMap.get(compositeKey);
            if (existing) {
              existing.quantity += qty;
              existing.selected = existing.selected || item.selected;
            } else {
              desiredMap.set(compositeKey, {
                product_id: item.product.id,
                variant_id: variantId,
                quantity: qty,
                selected: item.selected !== false,
              });
            }
          }

          const { data: existingRows, error: fetchErr } = await supabase
            .from('cart_items')
            .select('id, product_id, variant_id, quantity, selected')
            .eq('cart_id', cartId);

          if (fetchErr) return;

          const existingByKey = new Map<
            string,
            { id: string; quantity: number; selected: boolean | null }
          >();
          const idsToDelete: string[] = [];

          for (const row of existingRows || []) {
            const key = `${row.product_id}::${row.variant_id || ''}`;
            if (existingByKey.has(key) || !desiredMap.has(key)) {
              idsToDelete.push(row.id);
            } else {
              existingByKey.set(key, {
                id: row.id,
                quantity: row.quantity,
                selected: row.selected,
              });
            }
          }

          if (idsToDelete.length > 0) {
            await supabase.from('cart_items').delete().in('id', idsToDelete);
          }

          const rowsToInsert: {
            cart_id: string;
            product_id: string;
            variant_id: string | null;
            quantity: number;
            selected: boolean;
          }[] = [];

          for (const [key, desired] of desiredMap.entries()) {
            const current = existingByKey.get(key);
            if (current) {
              if (current.quantity !== desired.quantity || Boolean(current.selected) !== desired.selected) {
                await supabase
                  .from('cart_items')
                  .update({
                    quantity: desired.quantity,
                    selected: desired.selected,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', current.id);
              }
            } else {
              rowsToInsert.push({
                cart_id: cartId,
                product_id: desired.product_id,
                variant_id: desired.variant_id,
                quantity: desired.quantity,
                selected: desired.selected,
              });
            }
          }

          if (rowsToInsert.length > 0) {
            await supabase.from('cart_items').insert(rowsToInsert);
          }

          await supabase
            .from('carts')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', cartId);
        } catch (err) {
          console.error('Failed to sync user cart to Supabase:', err);
        }
      });

    cartSyncChains.set(userId, next);
    return next;
  },

  async fetchUserWishlist(userId: string): Promise<WishlistItem[]> {
    if (!isSupabaseConfigured || !isUuid(userId)) return [];

    try {
      const { data: wishlistRow } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!wishlistRow?.id) return [];

      const { data: rows, error } = await supabase
        .from('wishlist_items')
        .select(
          `
          id,
          product_id,
          created_at,
          products (
            *,
            categories:category_id (id, name, slug),
            product_media (url, alt_text, display_order, is_primary),
            product_variants (id, variant_name, color_name, color_hex, size, sku, stock_quantity)
          )
        `
        )
        .eq('wishlist_id', wishlistRow.id)
        .order('created_at', { ascending: false });

      if (error || !rows) return [];

      const mapped: WishlistItem[] = [];
      for (const row of rows as any[]) {
        if (!row.products) continue;
        const product = mapDatabaseToProduct(
          row.products,
          row.products.product_media || [],
          row.products.product_variants || []
        );
        mapped.push({
          id: product.id,
          product,
          addedAt: row.created_at || new Date().toISOString(),
        });
      }

      return mapped;
    } catch (err) {
      console.error('Failed to fetch user wishlist from Supabase:', err);
      return [];
    }
  },

  async syncUserWishlistItem(
    userId: string,
    productId: string,
    action: 'add' | 'remove'
  ): Promise<void> {
    if (!isSupabaseConfigured || !isUuid(userId) || !isUuid(productId)) return;

    try {
      const wishlistId = await getOrCreateUserWishlistId(userId);
      if (!wishlistId) return;

      if (action === 'add') {
        await supabase
          .from('wishlist_items')
          .upsert(
            { wishlist_id: wishlistId, product_id: productId },
            { onConflict: 'wishlist_id,product_id' }
          );
      } else {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('wishlist_id', wishlistId)
          .eq('product_id', productId);
      }
    } catch (err) {
      console.error(`Failed to ${action} wishlist item in Supabase:`, err);
    }
  },

  async logCustomerActivity(
    userId: string | null | undefined,
    activityType: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    if (!isSupabaseConfigured || !isUuid(userId) || !activityType.trim()) return;

    try {
      await supabase.from('customer_activity_logs').insert({
        user_id: userId,
        activity_type: activityType.trim(),
        metadata: (metadata || {}) as Json,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });
    } catch {
      // Never block user interactions on analytics telemetry
    }
  },
};
