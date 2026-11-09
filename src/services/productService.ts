import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DEFAULT_SITE_SETTINGS,
  type Product,
  type Category,
  type ServiceBenefit,
  type ProductReview,
  type SiteSettings,
} from '../types';

export interface ProductFilters {
  categorySlug?: string;
  subCategorySlug?: string;
  fabric?: string[];
  occasion?: string[];
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFestive?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  limit?: number;
  offset?: number;
}

interface RawCategoryRow {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

function sanitizeFilterTerm(value: string): string {
  return value.trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').trim();
}

function collectDescendantIds(
  rootId: string,
  allCats: RawCategoryRow[],
  excludeSlugs: Set<string> = new Set()
): string[] {
  const ids = [rootId];
  const children = allCats.filter(
    (c) => c.parent_id === rootId && !excludeSlugs.has(c.slug)
  );
  for (const child of children) {
    ids.push(...collectDescendantIds(child.id, allCats, excludeSlugs));
  }
  return ids;
}

// Convert Supabase database product row + media + variants to Frontend Product model
export function mapDatabaseToProduct(row: any, media: any[] = [], variants: any[] = []): Product {
  const images =
    media.length > 0
      ? [...media]
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((m) => m.url)
          .filter(Boolean)
      : ['/assets/products/kanjivaram_silk_saree.jpg'];

  const safeImages = images.length > 0 ? images : ['/assets/products/kanjivaram_silk_saree.jpg'];

  const specs =
    row.specifications && typeof row.specifications === 'object' && !Array.isArray(row.specifications)
      ? row.specifications
      : {};

  const specColors = Array.isArray(specs.colors)
    ? specs.colors.filter((c: any) => c && typeof c.name === 'string' && c.name.trim())
    : [];

  const colors =
    variants.length > 0 && variants.some((v) => v.color_name)
      ? variants.map((v) => ({
          name: v.color_name || 'Standard',
          hex: v.color_hex || '#D2A138',
        }))
      : specColors.length > 0
      ? specColors.map((c: any) => ({ name: c.name, hex: c.hex || '#D2A138' }))
      : [{ name: row.color_description || 'Classic', hex: '#D2A138' }];

  const mrp = Number(row.mrp_inr ?? row.price_inr ?? 0);
  const price = Number(row.price_inr ?? 0);
  const discountPercent =
    row.discount_percent !== null && row.discount_percent !== undefined
      ? Number(row.discount_percent)
      : mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const stock = Number(row.stock_quantity ?? 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || row.short_description || '',
    price,
    mrp,
    discountPercent,
    category: row.categories?.name || (row.product_type === 'lehenga' ? 'Lehengas' : 'Collections'),
    categorySlug: row.categories?.slug || 'all',
    subCategory: typeof specs.subCategory === 'string' ? specs.subCategory : undefined,
    fabric: row.fabric || '',
    occasion: row.occasion || '',
    weave: row.weaving_style || '',
    careInstructions: row.care_instructions || '',
    blouseIncluded: Boolean(row.blouse_included),
    length: row.saree_length || '',
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    soldCount: Number(row.sold_count ?? 0),
    tags: Array.isArray(specs.tags) ? specs.tags : [],
    primaryImage: safeImages[0],
    images: safeImages,
    colors,
    sizes: Array.isArray(specs.sizes) && specs.sizes.length > 0 ? specs.sizes : ['Free Size'],
    stock,
    inStock: Boolean(row.in_stock) && stock > 0,
    isNew: Boolean(row.is_new),
    isFeatured: Boolean(row.is_featured),
    isBestseller: Boolean(row.is_bestseller),
    isFestive: Boolean(row.is_festive),
    sku: row.sku || `DOR-${row.slug}`,
  };
}

export const productService = {
  // Fetch list of products dynamically from Supabase
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    if (!isSupabaseConfigured) {
      return { products: [], total: 0 };
    }

    try {
      let query = supabase
        .from('products')
        .select(
          `
          *,
          categories:category_id (id, name, slug, parent_id),
          product_media (url, alt_text, display_order, is_primary),
          product_variants (id, variant_name, color_name, color_hex, size, sku, stock_quantity)
        `,
          { count: 'exact' }
        )
        .eq('status', 'active');

      const needsCategoryLookup = Boolean(
        (filters.categorySlug && filters.categorySlug !== 'all') ||
          filters.subCategorySlug ||
          filters.isFestive
      );

      let allCats: RawCategoryRow[] = [];
      if (needsCategoryLookup) {
        const { data: catRows, error: catErr } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id, image_url, display_order, is_active')
          .eq('is_active', true);

        if (!catErr && catRows) {
          allCats = catRows as RawCategoryRow[];
        }
      }

      if (filters.subCategorySlug) {
        const subCat = allCats.find((c) => c.slug === filters.subCategorySlug);
        if (subCat) {
          const subIds = collectDescendantIds(subCat.id, allCats);
          const cleanName = sanitizeFilterTerm(subCat.name);
          const cleanRootWord = sanitizeFilterTerm(subCat.name.replace(/sarees?|kurthis?|kurtis?|sets?|styles?|collection|wear/gi, ''));
          const orParts = [`category_id.in.(${subIds.join(',')})`];
          if (cleanName) {
            orParts.push(`specifications->>subCategory.ilike.%${cleanName}%`);
            orParts.push(`title.ilike.%${cleanName}%`);
          }
          if (cleanRootWord && cleanRootWord.length >= 3) {
            orParts.push(`title.ilike.%${cleanRootWord}%`);
            orParts.push(`fabric.ilike.%${cleanRootWord}%`);
            orParts.push(`occasion.ilike.%${cleanRootWord}%`);
          }
          query = query.or(orParts.join(','));
        } else {
          return { products: [], total: 0 };
        }
      } else if (filters.categorySlug && filters.categorySlug !== 'all' && filters.categorySlug !== 'festive') {
        const cat = allCats.find((c) => c.slug === filters.categorySlug);
        if (cat) {
          // Keep 'festive' collection items distinct from pure Lehengas unless directly filtering festive
          const excludeSlugs = cat.slug === 'lehengas' ? new Set(['festive']) : new Set<string>();
          const catIds = collectDescendantIds(cat.id, allCats, excludeSlugs);
          query = query.in('category_id', catIds);
        } else {
          return { products: [], total: 0 };
        }
      }

      if (filters.isFestive || filters.categorySlug === 'festive') {
        const festiveCat = allCats.find((c) => c.slug === 'festive');
        const festiveIds = festiveCat ? collectDescendantIds(festiveCat.id, allCats) : [];
        const festiveParts = ['is_festive.eq.true', 'occasion.ilike.%Festive%'];
        if (festiveIds.length > 0) {
          festiveParts.push(`category_id.in.(${festiveIds.join(',')})`);
        }
        query = query.or(festiveParts.join(','));
      }

      if (filters.isNew) query = query.eq('is_new', true);
      if (filters.isBestseller) query = query.eq('is_bestseller', true);
      if (filters.isFeatured) query = query.eq('is_featured', true);

      if (filters.fabric && filters.fabric.length > 0) {
        query = query.in('fabric', filters.fabric);
      }
      if (filters.occasion && filters.occasion.length > 0) {
        query = query.in('occasion', filters.occasion);
      }

      if (filters.minPrice !== undefined) query = query.gte('price_inr', filters.minPrice);
      if (filters.maxPrice !== undefined) query = query.lte('price_inr', filters.maxPrice);

      if (filters.search) {
        const cleanSearch = sanitizeFilterTerm(filters.search);
        if (cleanSearch) {
          query = query.or(
            `title.ilike.%${cleanSearch}%,fabric.ilike.%${cleanSearch}%,occasion.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`
          );
        }
      }

      if (filters.sortBy === 'price-asc') query = query.order('price_inr', { ascending: true });
      else if (filters.sortBy === 'price-desc') query = query.order('price_inr', { ascending: false });
      else if (filters.sortBy === 'rating') query = query.order('rating', { ascending: false });
      else if (filters.sortBy === 'newest') query = query.order('created_at', { ascending: false });
      else query = query.order('sold_count', { ascending: false });

      if (filters.limit) {
        const from = filters.offset || 0;
        query = query.range(from, from + filters.limit - 1);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      const products = (data || []).map((row) =>
        mapDatabaseToProduct(row, row.product_media || [], row.product_variants || [])
      );

      return { products, total: count ?? products.length };
    } catch (err) {
      console.error('Failed to fetch products from Supabase:', err);
      return { products: [], total: 0 };
    }
  },

  // Fetch single product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured || !slug) return null;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          categories:category_id (id, name, slug),
          product_media (url, alt_text, display_order, is_primary),
          product_variants (id, variant_name, color_name, color_hex, size, sku, stock_quantity)
        `
        )
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return mapDatabaseToProduct(data, data.product_media || [], data.product_variants || []);
    } catch (err) {
      console.error(`Failed to fetch product ${slug} from Supabase:`, err);
      return null;
    }
  },

  // Fetch related active products from the database
  async getRelatedProducts(categorySlug: string, excludeProductId: string, limit: number = 4): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const sameCategory =
        categorySlug && categorySlug !== 'all'
          ? await this.getProducts({ categorySlug, limit: limit + 2 })
          : { products: [], total: 0 };

      const picked: Product[] = sameCategory.products
        .filter((p) => p.id !== excludeProductId)
        .slice(0, limit);

      if (picked.length < limit) {
        const fallbackRes = await this.getProducts({ limit: limit + 6 });
        const pickedIds = new Set([excludeProductId, ...picked.map((p) => p.id)]);
        for (const candidate of fallbackRes.products) {
          if (!pickedIds.has(candidate.id)) {
            picked.push(candidate);
            pickedIds.add(candidate.id);
          }
          if (picked.length >= limit) break;
        }
      }

      return picked.slice(0, limit);
    } catch (err) {
      console.error('Failed to fetch related products:', err);
      return [];
    }
  },

  // Fetch showcase storefront categories with their child subcategories
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data) return [];

      const rows = data as RawCategoryRow[];
      const showcaseRows = rows
        .filter(
          (cat) =>
            cat.parent_id === null ||
            cat.slug === 'kurtis' ||
            cat.slug === 'festive'
        )
        .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99));

      return showcaseRows.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.image_url || '/assets/categories/cat_sarees_arch.jpg',
        subcategories: rows
          .filter((s) => s.parent_id === cat.id)
          .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
          .map((s) => ({
            name: s.name,
            slug: s.slug,
            imageUrl: s.image_url || undefined,
          })),
      }));
    } catch (err) {
      console.error('Failed to fetch categories from Supabase:', err);
      return [];
    }
  },

  // Fetch single category and its active subcategories by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (!isSupabaseConfigured || !slug) return null;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data) return null;
      const rows = data as RawCategoryRow[];
      const target = rows.find((c) => c.slug === slug);
      if (!target) return null;

      return {
        id: target.id,
        name: target.name,
        slug: target.slug,
        imageUrl: target.image_url || '/assets/categories/cat_sarees_arch.jpg',
        subcategories: rows
          .filter((s) => s.parent_id === target.id)
          .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
          .map((s) => ({
            name: s.name,
            slug: s.slug,
            imageUrl: s.image_url || undefined,
          })),
      };
    } catch (err) {
      console.error(`Failed to fetch category ${slug}:`, err);
      return null;
    }
  },

  // Fetch active banners dynamically
  async getBanners(type: string = 'hero'): Promise<any[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('banner_type', type)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch banners:', err);
      return [];
    }
  },

  // Fetch homepage/storefront trust & service benefits dynamically
  async getServiceBenefits(): Promise<ServiceBenefit[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('service_benefits')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data) return [];
      return data.map((row) => ({
        id: row.id,
        iconName: row.icon_name,
        title: row.title,
        description: row.description,
        displayOrder: row.display_order ?? 0,
      }));
    } catch (err) {
      console.error('Failed to fetch service benefits:', err);
      return [];
    }
  },

  // Fetch reviews visible to current viewer via RLS (approved + author's own pending reviews)
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured || !productId) return [];
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((r) => ({
        id: r.id,
        productId: r.product_id,
        reviewerName: r.reviewer_name,
        rating: Number(r.rating),
        title: r.title || undefined,
        content: r.content || undefined,
        photos: r.photos || undefined,
        verifiedPurchase: Boolean(r.verified_purchase),
        status: r.status || 'approved',
        createdAt: r.created_at || '',
      }));
    } catch (err) {
      console.error('Failed to fetch product reviews:', err);
      return [];
    }
  },

  // Submit a customer review (saved as 'pending' for admin moderation; verified if bought)
  async submitProductReview(input: {
    productId: string;
    userId: string;
    reviewerName: string;
    rating: number;
    title?: string;
    content?: string;
  }): Promise<ProductReview> {
    if (!isSupabaseConfigured) {
      throw new Error('Store database is not configured.');
    }

    let verifiedPurchase = false;
    try {
      const { data: userOrders } = await supabase
        .from('orders')
        .select('id, order_items(product_id)')
        .eq('user_id', input.userId)
        .neq('order_status', 'cancelled')
        .limit(50);

      verifiedPurchase = Boolean(
        (userOrders || []).some((ord: any) =>
          (ord.order_items || []).some((oi: any) => oi.product_id === input.productId)
        )
      );
    } catch {
      verifiedPurchase = false;
    }

    const safeRating = Math.min(5, Math.max(1, Math.round(input.rating || 5)));

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: input.productId,
        user_id: input.userId,
        reviewer_name: input.reviewerName.trim(),
        rating: safeRating,
        title: input.title?.trim() || null,
        content: input.content?.trim() || null,
        verified_purchase: verifiedPurchase,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Unable to submit your review.');
    }

    return {
      id: data.id,
      productId: data.product_id,
      reviewerName: data.reviewer_name,
      rating: Number(data.rating),
      title: data.title || undefined,
      content: data.content || undefined,
      photos: data.photos || undefined,
      verifiedPurchase: Boolean(data.verified_purchase),
      status: data.status || 'pending',
      createdAt: data.created_at || new Date().toISOString(),
    };
  },

  // Fetch public site settings (gracefully falling back to defaults if empty)
  async getSiteSettings(): Promise<SiteSettings> {
    if (!isSupabaseConfigured) return DEFAULT_SITE_SETTINGS;
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error || !data || data.length === 0) {
        return DEFAULT_SITE_SETTINGS;
      }

      const map = new Map<string, unknown>(data.map((row) => [row.key, row.value]));

      const str = (key: string, fallback: string, allowEmpty = false): string => {
        if (!map.has(key)) return fallback;
        const val = map.get(key);
        if (val === null || val === undefined) return fallback;
        const parsed = String(val).trim();
        if (!allowEmpty && parsed.length === 0) return fallback;
        return parsed;
      };

      const num = (key: string, fallback: number): number => {
        if (!map.has(key)) return fallback;
        const raw = map.get(key);
        const parsed = typeof raw === 'number' ? raw : Number(raw);
        return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
      };

      const bool = (key: string, fallback: boolean): boolean => {
        if (!map.has(key)) return fallback;
        const raw = map.get(key);
        if (typeof raw === 'boolean') return raw;
        const normalized = String(raw ?? '').trim().toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
        return fallback;
      };

      let announcementItems = DEFAULT_SITE_SETTINGS.announcementItems;
      const rawAnn = map.get('announcement_items');
      if (Array.isArray(rawAnn)) {
        const cleaned = rawAnn
          .map((item) => String(item).trim())
          .filter(Boolean);
        if (cleaned.length > 0) announcementItems = cleaned;
      }

      return {
        storeName: str('store_name', DEFAULT_SITE_SETTINGS.storeName),
        supportEmail: str('support_email', DEFAULT_SITE_SETTINGS.supportEmail),
        conciergeEmail: str('concierge_email', DEFAULT_SITE_SETTINGS.conciergeEmail),
        supportPhone: str('support_phone', DEFAULT_SITE_SETTINGS.supportPhone, true),
        storeAddress: str('store_address', DEFAULT_SITE_SETTINGS.storeAddress),
        storeCityStatePin: str('store_city_state_pin', DEFAULT_SITE_SETTINGS.storeCityStatePin),
        studioHours: str('studio_hours', DEFAULT_SITE_SETTINGS.studioHours),
        freeShippingThreshold: num('free_shipping_threshold', DEFAULT_SITE_SETTINGS.freeShippingThreshold),
        standardShippingFee: num('standard_shipping_fee', DEFAULT_SITE_SETTINGS.standardShippingFee),
        expressShippingFee: num('express_shipping_fee', DEFAULT_SITE_SETTINGS.expressShippingFee),
        codEnabled: bool('cod_enabled', DEFAULT_SITE_SETTINGS.codEnabled),
        announcementItems,
        instagramUrl: str('instagram_url', DEFAULT_SITE_SETTINGS.instagramUrl, true),
        facebookUrl: str('facebook_url', DEFAULT_SITE_SETTINGS.facebookUrl, true),
        youtubeUrl: str('youtube_url', DEFAULT_SITE_SETTINGS.youtubeUrl, true),
        footerCopyright: str('footer_copyright', DEFAULT_SITE_SETTINGS.footerCopyright),
      };
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
      return DEFAULT_SITE_SETTINGS;
    }
  },

  // Fetch top approved customer reviews for homepage testimonials
  async getFeaturedReviews(limit: number = 3): Promise<ProductReview[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];
      return data.map((r) => ({
        id: r.id,
        productId: r.product_id,
        reviewerName: r.reviewer_name,
        rating: Number(r.rating),
        title: r.title || undefined,
        content: r.content || undefined,
        photos: r.photos || undefined,
        verifiedPurchase: Boolean(r.verified_purchase),
        status: r.status || 'approved',
        createdAt: r.created_at || '',
      }));
    } catch (err) {
      console.error('Failed to fetch featured reviews:', err);
      return [];
    }
  },
};
