-- ==============================================================================
-- DORASANI DYNAMIC EXPLORE CATEGORIES, COLLECTION FILTERS & MEDIA CLEANUP
-- Version: 20261111000001
-- ==============================================================================

-- 1. Add optional comma-separated matching keywords on categories so admins can
--    freely rename Explore Category labels while keeping accurate product matching.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS filter_keywords TEXT NULL;

-- 2. Replace tiny cropped / duplicated category image URLs with crisp high-res images
UPDATE public.categories
SET image_url = '/assets/products/banarasi_silk_saree.jpg', updated_at = now()
WHERE slug = 'banarasi' AND image_url = '/assets/products/prod_banarasi_gold_photo.jpg';

UPDATE public.categories
SET image_url = '/assets/products/chanderi_cotton_saree.jpg', updated_at = now()
WHERE slug = 'chanderi' AND image_url = '/assets/products/prod_chanderi_cotton_photo.jpg';

UPDATE public.categories
SET image_url = '/assets/products/organza_floral_saree.jpg', updated_at = now()
WHERE slug = 'organza' AND image_url = '/assets/products/prod_organza_floral_photo.jpg';

UPDATE public.categories
SET image_url = '/assets/products/festive_lehenga.jpg', updated_at = now()
WHERE slug = 'diwali' AND image_url = '/assets/products/prod_banarasi_gold_photo.jpg';

UPDATE public.categories
SET image_url = '/assets/products/designer_lehenga.jpg', updated_at = now()
WHERE slug = 'wedding-guest' AND image_url = '/assets/products/prod_chanderi_cotton_photo.jpg';

UPDATE public.categories
SET image_url = '/assets/products/organza_floral_saree.jpg', updated_at = now()
WHERE slug = 'festive-sarees' AND image_url = '/assets/products/prod_organza_floral_photo.jpg';

-- Deduplicate Kurthis subcategory thumbnails so each Explore pill shows a distinct style
UPDATE public.categories
SET image_url = '/assets/products/embroidered_anarkali.jpg', updated_at = now()
WHERE slug = 'anarkali-kurtis' AND image_url = '/assets/categories/cat_kurtis_arch.jpg';

UPDATE public.categories
SET image_url = '/assets/products/chanderi_kurti_set.jpg', updated_at = now()
WHERE slug = 'straight-kurtis' AND image_url = '/assets/categories/cat_kurtis_arch.jpg';

UPDATE public.categories
SET image_url = '/assets/products/organza_sharara_set.jpg', updated_at = now()
WHERE slug = 'festive-kurtis' AND image_url = '/assets/categories/cat_kurtis_arch.jpg';

-- Deduplicate Kids Wear subcategory thumbnails
UPDATE public.categories
SET image_url = '/assets/products/festive_lehenga.jpg', updated_at = now()
WHERE slug = 'girls-lehengas' AND image_url = '/assets/categories/cat_kids_wear_arch.jpg';

UPDATE public.categories
SET image_url = '/assets/hero/heritage/Classical_Arts.png', updated_at = now()
WHERE slug = 'boys-kurta' AND image_url = '/assets/categories/cat_kids_wear_arch.jpg';

UPDATE public.categories
SET image_url = '/assets/hero/heritage/Temple_Architecture.png', updated_at = now()
WHERE slug = 'dhoti-sets' AND image_url = '/assets/categories/cat_kids_wear_arch.jpg';

-- Fix duplicate display_order (4) between 'kurtis' and 'salwar' under ethnic-wear
UPDATE public.categories SET display_order = 5, updated_at = now() WHERE slug = 'salwar' AND display_order = 4;
UPDATE public.categories SET display_order = 6, updated_at = now() WHERE slug = 'gowns' AND display_order = 5;
UPDATE public.categories SET display_order = 7, updated_at = now() WHERE slug = 'coords' AND display_order = 6;

-- 3. Populate default filter_keywords for Explore Categories & Subcategories (when blank)
UPDATE public.categories SET filter_keywords = 'silk saree,kanjivaram,kanchipuram,banarasi,tussar'
WHERE slug = 'silk-sarees' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'kanjivaram,kanchipuram,korvai,bridal'
WHERE slug = 'kanjivaram' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'banarasi,kadwa,brocade'
WHERE slug = 'banarasi' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'organza'
WHERE slug = 'organza' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'chanderi'
WHERE slug = 'chanderi' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'cotton,linen,chanderi'
WHERE slug = 'cotton' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'wedding,bridal,kanchipuram,kanjivaram,banarasi'
WHERE slug = 'wedding-sarees' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'tissue,organza'
WHERE slug = 'tissue' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'anarkali'
WHERE slug = 'anarkali' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'sharara'
WHERE slug = 'sharara' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'kurti,kurthi,tunic,chanderi kurti'
WHERE slug = 'kurtis' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'salwar,suit,salwar suits'
WHERE slug = 'salwar' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'gown,anarkali'
WHERE slug = 'gowns' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'co-ord,coord,sharara,kurti set'
WHERE slug = 'coords' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'silk,pure silk,royal silk'
WHERE slug = 'silk-kurtis' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'anarkali,flared'
WHERE slug = 'anarkali-kurtis' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'straight,chanderi'
WHERE slug = 'straight-kurtis' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'festive,embroidered'
WHERE slug = 'festive-kurtis' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'bridal,velvet,zardozi,royal'
WHERE slug = 'bridal' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'wedding,bridal,marriage'
WHERE slug = 'wedding' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'reception,pastel,designer,party'
WHERE slug = 'reception' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'designer'
WHERE slug = 'designer' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'pastel,organza'
WHERE slug = 'pastel' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'festive,festival,celebration'
WHERE slug = 'festive' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'pattu,pavadai,kids'
WHERE slug = 'pattu-pavadai' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'lehenga,pavadai,girls'
WHERE slug = 'girls-lehengas' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'kurta,boys'
WHERE slug = 'boys-kurta' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'dhoti,festive'
WHERE slug = 'dhoti-sets' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'navratri,festive,anarkali,sharara'
WHERE slug = 'navratri' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'diwali,festive,banarasi,gold'
WHERE slug = 'diwali' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'pongal,kanjivaram,pattu,traditional'
WHERE slug = 'pongal' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'wedding,reception,party,designer'
WHERE slug = 'wedding-guest' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'engagement,bridal,lehenga,organza'
WHERE slug = 'engagement' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '');

UPDATE public.categories SET filter_keywords = 'saree,sarees'
WHERE slug = 'festive-sarees' AND (filter_keywords IS NULL OR btrim(filter_keywords) = '' OR filter_keywords = 'saree,organza,banarasi,kanjivaram,festive');

-- 4. Clean up low-resolution / cropped legacy product_media rows
DELETE FROM public.product_media
WHERE url IN (
  '/assets/products/prod_chanderi_cotton_photo.jpg',
  '/assets/products/thumb_1.jpg',
  '/assets/products/thumb_2.jpg',
  '/assets/products/thumb_3.jpg',
  '/assets/products/blouse_piece.jpg',
  '/assets/products/product_main_large.jpg'
);

UPDATE public.product_media
SET display_order = 0,
    is_primary = true
WHERE url = '/assets/products/chanderi_cotton_saree.jpg'
  AND product_id = (SELECT id FROM public.products WHERE slug = 'chanderi-cotton-saree' LIMIT 1);

-- 5. Seed dynamic Explore Categories & Collection Filters settings in site_settings
INSERT INTO public.site_settings (key, value, description)
VALUES
  (
    'explore_categories_config',
    '{
      "enabled": true,
      "title": "Explore Categories",
      "showOnShopAll": true,
      "showOnCollections": true,
      "showOnNewArrivals": true,
      "showOnBestsellers": true,
      "showAllPill": true,
      "allPillLabel": "All",
      "categoryOverrides": {}
    }'::jsonb,
    'Admin-configurable Explore Categories strip heading, visibility, All pill, and per-collection overrides'
  ),
  (
    'collection_filters_config',
    '{
      "enabled": true,
      "sidebarTitle": "Filters",
      "showClearAll": true,
      "showSortDropdown": true,
      "groups": [
        {
          "id": "price",
          "type": "price_range",
          "label": "Price Range",
          "enabled": true,
          "displayOrder": 1,
          "optionSource": "auto",
          "customOptions": [],
          "hiddenOptions": [],
          "minPrice": 500,
          "maxPrice": 0,
          "step": 500
        },
        {
          "id": "fabric",
          "type": "fabric",
          "label": "Fabric",
          "enabled": true,
          "displayOrder": 2,
          "optionSource": "auto",
          "customOptions": [],
          "hiddenOptions": []
        },
        {
          "id": "occasion",
          "type": "occasion",
          "label": "Occasion",
          "enabled": true,
          "displayOrder": 3,
          "optionSource": "auto",
          "customOptions": [],
          "hiddenOptions": []
        },
        {
          "id": "weave",
          "type": "weave",
          "label": "Weaving Style",
          "enabled": false,
          "displayOrder": 4,
          "optionSource": "auto",
          "customOptions": [],
          "hiddenOptions": []
        },
        {
          "id": "color",
          "type": "color",
          "label": "Color",
          "enabled": false,
          "displayOrder": 5,
          "optionSource": "auto",
          "customOptions": [],
          "hiddenOptions": []
        },
        {
          "id": "availability",
          "type": "availability",
          "label": "Availability",
          "enabled": false,
          "displayOrder": 6,
          "optionSource": "custom",
          "customOptions": ["In Stock Only", "New Arrivals", "Bestsellers", "Festive Edit"],
          "hiddenOptions": []
        },
        {
          "id": "discount",
          "type": "discount",
          "label": "Discount",
          "enabled": false,
          "displayOrder": 7,
          "optionSource": "custom",
          "customOptions": ["10% or more", "20% or more", "30% or more"],
          "hiddenOptions": []
        }
      ],
      "categoryOverrides": {}
    }'::jsonb,
    'Admin-configurable collection Filters sidebar title, groups, option sources, pricing bounds, and per-collection overrides'
  )
ON CONFLICT (key) DO NOTHING;

