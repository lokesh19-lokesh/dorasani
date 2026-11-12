import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DEFAULT_SITE_SETTINGS,
  normalizeExploreCategoriesConfig,
  normalizeCollectionFiltersConfig,
  normalizeProductTypes,
  type Product,
  type Category,
  type ServiceBenefit,
  type ProductReview,
  type SiteSettings,
} from '../types';

export interface ProductFilters {
  categorySlug?: string;
  subCategorySlug?: string;
  productTypes?: string[];
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
  description?: string | null;
  parent_id: string | null;
  image_url: string | null;
  filter_keywords?: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

const STOREFRONT_CACHE_TTL_MS = 60_000;
const REVIEWS_CACHE_TTL_MS = 15_000;

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export function invalidateStorefrontCache(prefix?: string): void {
  if (!prefix) {
    responseCache.clear();
    inFlightRequests.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }
  for (const key of inFlightRequests.keys()) {
    if (key.startsWith(prefix)) {
      inFlightRequests.delete(key);
    }
  }
}

async function withCache<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<{ value: T; cacheable: boolean }>
): Promise<T> {
  const cached = responseCache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const request = (async () => {
    try {
      const { value, cacheable } = await fetcher();
      if (cacheable && ttlMs > 0) {
        responseCache.set(key, { value, expiresAt: Date.now() + ttlMs });
      }
      return value;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, request);
  return request;
}

async function fetchActiveCategoriesRaw(): Promise<RawCategoryRow[]> {
  if (!isSupabaseConfigured) return [];
  return withCache('categories:raw', STOREFRONT_CACHE_TTL_MS, async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error || !data) {
        return { value: [], cacheable: false };
      }
      return { value: data as RawCategoryRow[], cacheable: true };
    } catch (err) {
      console.error('Failed to fetch active categories from Supabase:', err);
      return { value: [], cacheable: false };
    }
  });
}

function buildProductsCacheKey(filters: ProductFilters): string {
  const sortedArr = (arr?: string[]) =>
    arr && arr.length > 0 ? [...arr].sort().join(',') : '';
  return JSON.stringify({
    c: filters.categorySlug || '',
    sc: filters.subCategorySlug || '',
    pt: sortedArr(filters.productTypes),
    f: sortedArr(filters.fabric),
    o: sortedArr(filters.occasion),
    min: filters.minPrice ?? '',
    max: filters.maxPrice ?? '',
    n: filters.isNew ? 1 : 0,
    b: filters.isBestseller ? 1 : 0,
    fe: filters.isFestive ? 1 : 0,
    ft: filters.isFeatured ? 1 : 0,
    q: filters.search?.trim().toLowerCase() || '',
    s: filters.sortBy || 'featured',
    l: filters.limit ?? '',
    off: filters.offset ?? 0,
  });
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

function buildSubcategoryOrParts(subCat: RawCategoryRow, allCats: RawCategoryRow[]): string[] {
  const subIds = collectDescendantIds(subCat.id, allCats);
  const parts = new Set<string>([`category_id.in.(${subIds.join(',')})`]);

  const cleanName = sanitizeFilterTerm(subCat.name);
  if (cleanName) {
    parts.add(`specifications->>subCategory.ilike.%${cleanName}%`);
    parts.add(`title.ilike.%${cleanName}%`);
  }

  const keywordTokens = new Set<string>();
  const explicitKeywords = (subCat.filter_keywords || '')
    .split(',')
    .map((k) => sanitizeFilterTerm(k))
    .filter((k) => k.length >= 3);

  if (explicitKeywords.length > 0) {
    // When admin defines filter_keywords, use them exclusively alongside exact name/subIds
    // so broad adjectives like "Festive" or "Silk" don't override specific targets (e.g. Festive Sarees).
    for (const tok of explicitKeywords) {
      keywordTokens.add(tok);
    }
  } else {
    const cleanRootWord = sanitizeFilterTerm(
      subCat.name.replace(/\b(sarees?|kurthis?|kurtis?|sets?|styles?|collection|wear)\b/gi, '')
    );
    if (cleanRootWord.length >= 3) keywordTokens.add(cleanRootWord);

    const cleanSlugRoot = sanitizeFilterTerm(
      subCat.slug
        .replace(/-/g, ' ')
        .replace(/\b(sarees?|kurthis?|kurtis?|sets?|styles?|collection|wear)\b/gi, '')
    );
    if (cleanSlugRoot.length >= 3) keywordTokens.add(cleanSlugRoot);
  }

  for (const tok of keywordTokens) {
    parts.add(`title.ilike.%${tok}%`);
    parts.add(`fabric.ilike.%${tok}%`);
    parts.add(`occasion.ilike.%${tok}%`);
    parts.add(`weaving_style.ilike.%${tok}%`);
    parts.add(`specifications->>subCategory.ilike.%${tok}%`);
    parts.add(`specifications->>tags.ilike.%${tok}%`);
  }

  if (subCat.slug === 'festive') {
    parts.add('is_festive.eq.true');
  }

  return Array.from(parts);
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

  const stock = Math.max(0, Number(row.stock_quantity ?? 0));
  const rowStatus = String(row.status || 'active');

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
    productType: row.product_type || 'saree',
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
    inStock: rowStatus !== 'out_of_stock' && Boolean(row.in_stock) && stock > 0,
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

    const cacheKey = `products:${buildProductsCacheKey(filters)}`;
    return withCache(cacheKey, STOREFRONT_CACHE_TTL_MS, async () => {
      try {
        const needsCategoryLookup = Boolean(
          (filters.categorySlug && filters.categorySlug !== 'all') ||
            filters.subCategorySlug ||
            filters.isFestive
        );

        const allCats: RawCategoryRow[] = needsCategoryLookup
          ? await fetchActiveCategoriesRaw()
          : [];

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
          .in('status', ['active', 'out_of_stock']);

        // Always scope to the active collection (categorySlug) first when provided
        // so selecting a subcategory (e.g. "Organza Sarees") inside Sarees never leaks
        // Organza Lehengas or Shararas into Sarees.
        if (filters.categorySlug && filters.categorySlug !== 'all' && filters.categorySlug !== 'festive') {
          const cat = allCats.find((c) => c.slug === filters.categorySlug);
          if (cat) {
            const excludeSlugs = cat.slug === 'lehengas' ? new Set(['festive']) : new Set<string>();
            const catIds = collectDescendantIds(cat.id, allCats, excludeSlugs);

            if (cat.slug === 'kurtis') {
              query = query.or(
                [
                  `category_id.in.(${catIds.join(',')})`,
                  'specifications->>subCategory.ilike.%kurti%',
                  'specifications->>subCategory.ilike.%kurthi%',
                ].join(',')
              );
            } else if (cat.slug === 'silk-sarees') {
              query = query.or(
                [
                  `category_id.in.(${catIds.join(',')})`,
                  'specifications->>subCategory.ilike.%Silk Saree%',
                  'and(fabric.ilike.%Silk%,title.ilike.%Saree%)',
                ].join(',')
              );
            } else if (cat.parent_id !== null) {
              const orParts = buildSubcategoryOrParts(cat, allCats);
              query = query.or(orParts.join(','));
            } else {
              query = query.in('category_id', catIds);
            }
          } else {
            return { value: { products: [], total: 0 }, cacheable: false };
          }
        }

        if (filters.subCategorySlug) {
          const subCat = allCats.find((c) => c.slug === filters.subCategorySlug);
          if (subCat) {
            const orParts = buildSubcategoryOrParts(subCat, allCats);
            query = query.or(orParts.join(','));
          } else {
            return { value: { products: [], total: 0 }, cacheable: false };
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

        if (filters.productTypes && filters.productTypes.length > 0) {
          query = query.in('product_type', filters.productTypes);
        }
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
              `title.ilike.%${cleanSearch}%,subtitle.ilike.%${cleanSearch}%,product_type.ilike.%${cleanSearch}%,fabric.ilike.%${cleanSearch}%,occasion.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`
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

        return {
          value: { products, total: count ?? products.length },
          cacheable: true,
        };
      } catch (err) {
        console.error('Failed to fetch products from Supabase:', err);
        return { value: { products: [], total: 0 }, cacheable: false };
      }
    });
  },

  // Fetch single product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured || !slug) return null;

    return withCache(`product:${slug}`, STOREFRONT_CACHE_TTL_MS, async () => {
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
          return { value: null, cacheable: false };
        }

        return {
          value: mapDatabaseToProduct(data, data.product_media || [], data.product_variants || []),
          cacheable: true,
        };
      } catch (err) {
        console.error(`Failed to fetch product ${slug} from Supabase:`, err);
        return { value: null, cacheable: false };
      }
    });
  },

  // Fetch related active products from the database
  async getRelatedProducts(categorySlug: string, excludeProductId: string, limit: number = 4): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];

    return withCache(
      `related:${categorySlug || 'all'}:${excludeProductId}:${limit}`,
      STOREFRONT_CACHE_TTL_MS,
      async () => {
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

          return { value: picked.slice(0, limit), cacheable: true };
        } catch (err) {
          console.error('Failed to fetch related products:', err);
          return { value: [], cacheable: false };
        }
      }
    );
  },

  // Fetch showcase storefront categories with their child subcategories
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) return [];

    return withCache('categories:showcase', STOREFRONT_CACHE_TTL_MS, async () => {
      try {
        const rows = await fetchActiveCategoriesRaw();
        if (rows.length === 0) {
          return { value: [], cacheable: false };
        }

        const showcaseRows = rows
          .filter(
            (cat) =>
              cat.parent_id === null ||
              cat.slug === 'kurtis' ||
              cat.slug === 'festive'
          )
          .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99));

        const mapped = showcaseRows.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || undefined,
          parentId: cat.parent_id,
          displayOrder: cat.display_order ?? 99,
          imageUrl: cat.image_url || '',
          filterKeywords: cat.filter_keywords || undefined,
          subcategories: rows
            .filter((s) => s.parent_id === cat.id)
            .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
            .map((s) => ({
              id: s.id,
              name: s.name,
              slug: s.slug,
              imageUrl: s.image_url || undefined,
              filterKeywords: s.filter_keywords || undefined,
            })),
        }));
        return { value: mapped, cacheable: true };
      } catch (err) {
        console.error('Failed to fetch categories from Supabase:', err);
        return { value: [], cacheable: false };
      }
    });
  },

  // Fetch single category and its active subcategories by slug
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (!isSupabaseConfigured || !slug) return null;

    return withCache(`category:${slug}`, STOREFRONT_CACHE_TTL_MS, async () => {
      try {
        const rows = await fetchActiveCategoriesRaw();
        if (rows.length === 0) return { value: null, cacheable: false };
        const target = rows.find((c) => c.slug === slug);
        if (!target) return { value: null, cacheable: false };

        return {
          value: {
            id: target.id,
            name: target.name,
            slug: target.slug,
            description: target.description || undefined,
            parentId: target.parent_id,
            displayOrder: target.display_order ?? 99,
            imageUrl: target.image_url || '',
            filterKeywords: target.filter_keywords || undefined,
            subcategories: rows
              .filter((s) => s.parent_id === target.id)
              .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
              .map((s) => ({
                id: s.id,
                name: s.name,
                slug: s.slug,
                imageUrl: s.image_url || undefined,
                filterKeywords: s.filter_keywords || undefined,
              })),
          },
          cacheable: true,
        };
      } catch (err) {
        console.error(`Failed to fetch category ${slug}:`, err);
        return { value: null, cacheable: false };
      }
    });
  },

  // Fetch active banners dynamically
  async getBanners(type: string = 'hero'): Promise<any[]> {
    if (!isSupabaseConfigured) return [];
    return withCache(`banners:${type}`, STOREFRONT_CACHE_TTL_MS, async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('banner_type', type)
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (error) throw error;
        return { value: data || [], cacheable: true };
      } catch (err) {
        console.error('Failed to fetch banners:', err);
        return { value: [], cacheable: false };
      }
    });
  },

  // Fetch homepage/storefront trust & service benefits dynamically
  async getServiceBenefits(): Promise<ServiceBenefit[]> {
    if (!isSupabaseConfigured) return [];
    return withCache('service_benefits', STOREFRONT_CACHE_TTL_MS, async () => {
      try {
        const { data, error } = await supabase
          .from('service_benefits')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error || !data) return { value: [], cacheable: false };
        return {
          value: data.map((row) => ({
            id: row.id,
            iconName: row.icon_name,
            title: row.title,
            description: row.description,
            displayOrder: row.display_order ?? 0,
          })),
          cacheable: true,
        };
      } catch (err) {
        console.error('Failed to fetch service benefits:', err);
        return { value: [], cacheable: false };
      }
    });
  },

  // Fetch reviews visible to current viewer via RLS (approved + author's own pending reviews)
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    if (!isSupabaseConfigured || !productId) return [];
    return withCache(`product_reviews:${productId}`, REVIEWS_CACHE_TTL_MS, async () => {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (error || !data) return { value: [], cacheable: false };
        return {
          value: data.map((r) => ({
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
          })),
          cacheable: true,
        };
      } catch (err) {
        console.error('Failed to fetch product reviews:', err);
        return { value: [], cacheable: false };
      }
    });
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

    invalidateStorefrontCache(`product_reviews:${input.productId}`);
    invalidateStorefrontCache('featured_reviews:');

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
    return withCache('site_settings', STOREFRONT_CACHE_TTL_MS, async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value');

        if (error || !data || data.length === 0) {
          return { value: DEFAULT_SITE_SETTINGS, cacheable: false };
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

        const rawDim = map.get('delhivery_default_dimensions') as any;
        const delhiveryDefaultDimensions =
          rawDim && typeof rawDim === 'object' && !Array.isArray(rawDim)
            ? {
                length: Math.max(1, Math.round(Number(rawDim.length) || 34)),
                breadth: Math.max(1, Math.round(Number(rawDim.breadth) || 26)),
                height: Math.max(1, Math.round(Number(rawDim.height) || 6)),
              }
            : DEFAULT_SITE_SETTINGS.delhiveryDefaultDimensions;

        const rawOriginPin = str('delhivery_origin_pincode', DEFAULT_SITE_SETTINGS.delhiveryOriginPincode);
        const delhiveryOriginPincode = /^\d{6}$/.test(rawOriginPin)
          ? rawOriginPin
          : DEFAULT_SITE_SETTINGS.delhiveryOriginPincode;

        const GENERIC_SOCIAL_PLACEHOLDERS = new Set([
          'https://instagram.com',
          'https://www.instagram.com',
          'https://facebook.com',
          'https://www.facebook.com',
          'https://youtube.com',
          'https://www.youtube.com',
        ]);

        const socialUrl = (key: string, fallback: string): string => {
          const raw = str(key, fallback, true);
          if (!raw) return fallback;
          if (GENERIC_SOCIAL_PLACEHOLDERS.has(raw.replace(/\/+$/, '').toLowerCase())) {
            return fallback;
          }
          return raw;
        };

        return {
          value: {
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
            instagramUrl: socialUrl('instagram_url', DEFAULT_SITE_SETTINGS.instagramUrl),
            facebookUrl: socialUrl('facebook_url', DEFAULT_SITE_SETTINGS.facebookUrl),
            youtubeUrl: socialUrl('youtube_url', DEFAULT_SITE_SETTINGS.youtubeUrl),
            googleUrl: socialUrl('google_url', DEFAULT_SITE_SETTINGS.googleUrl),
            footerCopyright: str('footer_copyright', DEFAULT_SITE_SETTINGS.footerCopyright),
            productTypes: normalizeProductTypes(map.get('product_types')),
            exploreCategoriesConfig: normalizeExploreCategoriesConfig(map.get('explore_categories_config')),
            collectionFiltersConfig: normalizeCollectionFiltersConfig(map.get('collection_filters_config')),
            delhiveryEnabled: bool('delhivery_enabled', DEFAULT_SITE_SETTINGS.delhiveryEnabled),
            delhiveryPickupLocation: str(
              'delhivery_pickup_location',
              DEFAULT_SITE_SETTINGS.delhiveryPickupLocation
            ),
            delhiveryOriginPincode,
            delhiveryAutoManifest: bool(
              'delhivery_auto_manifest',
              DEFAULT_SITE_SETTINGS.delhiveryAutoManifest
            ),
            delhiveryDefaultWeightGrams: Math.max(
              50,
              num('delhivery_default_weight_grams', DEFAULT_SITE_SETTINGS.delhiveryDefaultWeightGrams)
            ),
            delhiveryDefaultDimensions,
            delhiverySellerGst: str('delhivery_seller_gst', DEFAULT_SITE_SETTINGS.delhiverySellerGst, true),
          },
          cacheable: true,
        };
      } catch (err) {
        console.error('Failed to fetch site settings:', err);
        return { value: DEFAULT_SITE_SETTINGS, cacheable: false };
      }
    });
  },

  // Fetch top approved customer reviews for homepage testimonials
  async getFeaturedReviews(limit: number = 3): Promise<ProductReview[]> {
    if (!isSupabaseConfigured) return [];
    return withCache(`featured_reviews:${limit}`, STOREFRONT_CACHE_TTL_MS, async () => {
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('status', 'approved')
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error || !data) return { value: [], cacheable: false };
        return {
          value: data.map((r) => ({
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
          })),
          cacheable: true,
        };
      } catch (err) {
        console.error('Failed to fetch featured reviews:', err);
        return { value: [], cacheable: false };
      }
    });
  },
};
