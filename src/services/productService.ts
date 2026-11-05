import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product, Category } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/products';

export interface ProductFilters {
  categorySlug?: string;
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

// Convert Supabase database product row + media + variants to Frontend Product model
function mapDatabaseToProduct(row: any, media: any[] = [], variants: any[] = []): Product {
  const images = media.length > 0
    ? media.sort((a, b) => a.display_order - b.display_order).map(m => m.url)
    : ['/assets/products/product_main_large.jpg'];

  const colors = variants.length > 0 && variants.some(v => v.color_name)
    ? variants.map(v => ({ name: v.color_name || 'Standard', hex: v.color_hex || '#D2A138' }))
    : [{ name: row.color_description || 'Standard', hex: '#D2A138' }];

  const specs = row.specifications || {};

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || row.short_description || '',
    price: row.price_inr,
    mrp: row.mrp_inr,
    discountPercent: row.discount_percent,
    category: row.categories ? row.categories.name : (row.product_type === 'saree' ? 'Sarees' : 'Ethnic Wear'),
    categorySlug: row.categories ? row.categories.slug : (row.product_type === 'saree' ? 'sarees' : 'ethnic-wear'),
    subCategory: specs.subCategory || 'Silk Sarees',
    fabric: row.fabric || 'Pure Silk',
    occasion: row.occasion || 'Wedding',
    weave: row.weaving_style || 'Traditional Zari Weaving',
    careInstructions: row.care_instructions || 'Dry Clean Only',
    blouseIncluded: row.blouse_included,
    length: row.saree_length || '6.3 meters',
    rating: Number(row.rating) || 4.8,
    reviewsCount: row.reviews_count || 50,
    soldCount: row.sold_count || 120,
    tags: specs.tags || ['Handloom', 'Silk Mark'],
    primaryImage: images[0],
    images,
    colors,
    sizes: specs.sizes || ['Free Size'],
    stock: row.stock_quantity,
    inStock: row.in_stock,
    isNew: row.is_new,
    isFeatured: row.is_featured,
    isBestseller: row.is_bestseller,
    sku: row.sku || `DOR-${row.slug}`
  };
}

export const productService = {
  // Fetch list of products with filtering, search, sorting and pagination
  async getProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
    if (!isSupabaseConfigured) {
      // Return filtered from local products
      let list = [...PRODUCTS];
      if (filters.categorySlug && filters.categorySlug !== 'all') {
        list = list.filter(p => p.categorySlug === filters.categorySlug);
      }
      if (filters.isNew) list = list.filter(p => p.isNew);
      if (filters.isBestseller) list = list.filter(p => p.isBestseller);
      if (filters.isFestive) list = list.filter(p => p.categorySlug === 'festive' || p.occasion === 'Festive');
      return { products: list, total: list.length };
    }

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name, slug),
          product_media (url, alt_text, display_order, is_primary),
          product_variants (id, variant_name, color_name, color_hex, size, sku, stock_quantity)
        `, { count: 'exact' })
        .eq('status', 'active');

      if (filters.categorySlug && filters.categorySlug !== 'all') {
        // Find category and its subcategories
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.categorySlug)
          .maybeSingle();

        if (catData) {
          const { data: childCats } = await supabase
            .from('categories')
            .select('id')
            .eq('parent_id', catData.id);

          const catIds = [catData.id, ...(childCats || []).map(c => c.id)];
          query = query.in('category_id', catIds);
        }
      }

      if (filters.isNew) query = query.eq('is_new', true);
      if (filters.isBestseller) query = query.eq('is_bestseller', true);
      if (filters.isFestive) query = query.or('is_festive.eq.true,occasion.ilike.%Festive%,occasion.ilike.%Wedding%');
      if (filters.isFeatured) query = query.eq('is_featured', true);

      if (filters.minPrice) query = query.gte('price_inr', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price_inr', filters.maxPrice);

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
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

      const products = (data || []).map(row => 
        mapDatabaseToProduct(row, row.product_media || [], row.product_variants || [])
      );

      return { products, total: count || products.length };
    } catch (err) {
      console.warn('Failed to fetch products from Supabase, falling back to local data:', err);
      return { products: PRODUCTS, total: PRODUCTS.length };
    }
  },

  // Fetch single product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured) {
      return PRODUCTS.find(p => p.slug === slug) || null;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name, slug),
          product_media (url, alt_text, display_order, is_primary),
          product_variants (id, variant_name, color_name, color_hex, size, sku, stock_quantity)
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return PRODUCTS.find(p => p.slug === slug) || null;
      }

      return mapDatabaseToProduct(data, data.product_media || [], data.product_variants || []);
    } catch (err) {
      console.warn(`Failed to fetch product ${slug} from Supabase:`, err);
      return PRODUCTS.find(p => p.slug === slug) || null;
    }
  },

  // Fetch all categories
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) {
      return CATEGORIES;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) return CATEGORIES;

      // Fetch subcategories
      const { data: subData } = await supabase
        .from('categories')
        .select('*')
        .not('parent_id', 'is', null)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      return data.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.image_url || '/assets/categories/cat_sarees_arch.jpg',
        productCount: 50,
        subcategories: (subData || [])
          .filter(s => s.parent_id === cat.id)
          .map(s => ({
            name: s.name,
            slug: s.slug,
            imageUrl: s.image_url || undefined
          }))
      }));
    } catch (err) {
      console.warn('Failed to fetch categories from Supabase:', err);
      return CATEGORIES;
    }
  },

  // Fetch banners
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
      console.warn('Failed to fetch banners:', err);
      return [];
    }
  }
};

