-- ==============================================================================
-- DORASANI LUXURY SOUTH INDIAN FASHION E-COMMERCE PRODUCTION DATABASE SCHEMA
-- Version: 20261105000001
-- PostgreSQL / Supabase Production Architecture with Complete RLS & Functions
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS & DOMAIN TYPES
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM (
    'super_admin',
    'admin',
    'catalog_manager',
    'inventory_manager',
    'order_manager',
    'support_agent',
    'customer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status_type AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'packed',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM (
    'pending',
    'authorized',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- SECTION A: CUSTOMER, AUTHENTICATION & ACCESS CONTROL
-- ==============================================================================

-- Customer Profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  preferred_language TEXT DEFAULT 'en',
  whatsapp_opt_in BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- User Roles (Protected Role Assignment)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'customer',
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, role)
);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_type TEXT DEFAULT 'Home', -- 'Home', 'Work', 'Other'
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  apartment TEXT,
  landmark TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Customer Preferences
CREATE TABLE IF NOT EXISTS public.customer_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_fabrics TEXT[] DEFAULT '{}',
  preferred_occasions TEXT[] DEFAULT '{}',
  newsletter_subscribed BOOLEAN DEFAULT true,
  sms_updates_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Customer Activity Logs
CREATE TABLE IF NOT EXISTS public.customer_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  activity_type TEXT NOT NULL, -- 'login', 'view_product', 'add_to_cart', 'checkout_start', 'order_placed'
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION B: CATEGORIES & TAXONOMY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION C: PRODUCTS & VARIANTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL, -- Generous TEXT up to 1,000 chars, no truncation
  slug TEXT NOT NULL UNIQUE,
  sku VARCHAR(120),
  subtitle TEXT,
  short_description TEXT,
  description TEXT, -- Generous TEXT up to 50,000 chars
  product_type TEXT DEFAULT 'saree', -- 'saree', 'lehenga', 'kurti', 'dress', 'kids_wear', 'fabric'
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT DEFAULT 'DORASANI',
  fabric TEXT,
  weaving_style TEXT,
  pattern TEXT,
  color_description TEXT,
  occasion TEXT,
  saree_length TEXT,
  blouse_included BOOLEAN DEFAULT true,
  blouse_description TEXT,
  embroidery_details TEXT,
  zari_details TEXT,
  country_of_origin TEXT DEFAULT 'India',
  artisan_info TEXT,
  care_instructions TEXT DEFAULT 'Dry Clean Only',
  specifications JSONB DEFAULT '{}'::jsonb,
  price_inr INT NOT NULL, -- Stored in whole Rupees (e.g. 3499)
  mrp_inr INT NOT NULL,
  discount_percent INT DEFAULT 0,
  cost_price_inr INT, -- Admin-only protected
  status TEXT DEFAULT 'active', -- 'draft', 'active', 'out_of_stock', 'archived'
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_festive BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INT DEFAULT 15,
  rating NUMERIC(2,1) DEFAULT 4.8,
  reviews_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Product Variants (Size, Color, Fabric variations)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT,
  color_name TEXT,
  color_hex TEXT,
  size TEXT DEFAULT 'Free Size',
  sku VARCHAR(120) UNIQUE,
  price_adjustment_inr INT DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 10,
  weight_grams INT,
  dimensions_cm JSONB,
  attributes JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Product Media (Multiple images, views, gallery)
CREATE TABLE IF NOT EXISTS public.product_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  storage_path TEXT,
  url TEXT NOT NULL,
  alt_text TEXT,
  title TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  media_type TEXT DEFAULT 'image', -- 'image', 'video', 'close_up', 'model'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION D: COLLECTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_image TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.collection_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(collection_id, product_id)
);

-- ==============================================================================
-- SECTION E: INVENTORY LEDGER & RESERVATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  previous_quantity INT NOT NULL,
  quantity_changed INT NOT NULL,
  new_quantity INT NOT NULL,
  reason TEXT NOT NULL, -- 'initial_stock', 'sale', 'restock', 'return', 'damaged', 'audit_correction', 'reservation'
  reference_id TEXT, -- e.g. order_id or manual adjustment ID
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  session_or_cart_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION F: CART & WISHLIST
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_token TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_token TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(wishlist_id, product_id)
);

-- ==============================================================================
-- SECTION G: COUPONS & OFFERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
  discount_value INT NOT NULL, -- percentage (e.g. 15) or amount in INR (e.g. 500)
  min_order_amount_inr INT DEFAULT 0,
  max_discount_inr INT,
  usage_limit INT,
  used_count INT DEFAULT 0,
  per_customer_limit INT DEFAULT 1,
  start_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID,
  discount_applied_inr INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION H: ORDERS & PAYMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  delivery_option TEXT DEFAULT 'standard', -- 'standard', 'express'
  subtotal_inr INT NOT NULL,
  discount_inr INT DEFAULT 0,
  coupon_code TEXT,
  shipping_fee_inr INT DEFAULT 0,
  tax_amount_inr INT DEFAULT 0,
  total_inr INT NOT NULL,
  payment_method TEXT NOT NULL, -- 'upi', 'card', 'netbanking', 'wallet', 'cod'
  payment_status payment_status_type DEFAULT 'pending',
  order_status order_status_type DEFAULT 'confirmed',
  customer_notes TEXT,
  admin_notes TEXT,
  tracking_id TEXT,
  courier_name TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_sku TEXT,
  variant_details JSONB,
  unit_price_inr INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price_inr INT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status order_status_type,
  new_status order_status_type NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'razorpay', 'phonepe', 'cashfree', 'cod', 'manual'
  provider_order_id TEXT,
  provider_payment_id TEXT,
  provider_signature TEXT,
  amount_inr INT NOT NULL,
  currency TEXT DEFAULT 'INR',
  status payment_status_type NOT NULL DEFAULT 'pending',
  payment_method_details JSONB,
  error_code TEXT,
  error_description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION I: SHIPPING, RETURNS & REFUNDS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_name TEXT NOT NULL,
  states TEXT[] NOT NULL,
  standard_rate_inr INT DEFAULT 0,
  express_rate_inr INT DEFAULT 199,
  free_shipping_threshold_inr INT DEFAULT 2000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_partner TEXT DEFAULT 'Delhivery', -- 'Delhivery', 'BlueDart', 'DTDC', etc.
  tracking_number TEXT NOT NULL,
  tracking_url TEXT,
  current_status TEXT DEFAULT 'Order Placed',
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  customer_comments TEXT,
  supporting_images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'item_received', 'refunded'
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  return_request_id UUID REFERENCES public.return_requests(id) ON DELETE SET NULL,
  amount_inr INT NOT NULL,
  refund_reference TEXT,
  status TEXT DEFAULT 'initiated', -- 'initiated', 'processed', 'failed'
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION J: PRODUCT REVIEWS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  photos TEXT[] DEFAULT '{}',
  verified_purchase BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION K: CMS & WEBSITE CONTENT MANAGEMENT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  content JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  banner_type TEXT NOT NULL, -- 'hero', 'promotional', 'subpage', 'announcement'
  tagline TEXT,
  title_line_1 TEXT NOT NULL,
  title_line_2 TEXT,
  description TEXT,
  primary_cta_label TEXT,
  primary_cta_link TEXT,
  secondary_cta_label TEXT,
  secondary_cta_link TEXT,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.service_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.content_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION L: CUSTOMER COMMUNICATION & AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'responded'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_values JSONB,
  after_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- SECTION M: INDEXES FOR PRODUCTION QUERY PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price_inr);
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON public.products USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_product ON public.product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON public.wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- ==============================================================================
-- SECTION N: SECURITY DEFINER FUNCTIONS & AUTHORIZATION
-- ==============================================================================

-- Check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin', 'catalog_manager', 'inventory_manager', 'order_manager')
  );
$$;

-- Check if user has a specific elevated role
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role_type)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND (role = required_role OR role = 'super_admin')
  );
$$;

-- Trigger to create profile and default customer role on auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic Checkout Function to prevent negative stock and race conditions
CREATE OR REPLACE FUNCTION public.process_checkout_atomic(
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_billing_address JSONB,
  p_shipping_address JSONB,
  p_cart_items JSONB, -- Array of { product_id, variant_id, quantity }
  p_coupon_code TEXT,
  p_payment_method TEXT,
  p_delivery_option TEXT,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal INT := 0;
  v_discount INT := 0;
  v_shipping_fee INT := 0;
  v_tax_amount INT := 0;
  v_total INT := 0;
  v_item RECORD;
  v_prod RECORD;
  v_var RECORD;
  v_unit_price INT;
  v_item_total INT;
  v_coupon RECORD;
BEGIN
  -- Idempotency check: if order with this key already created, return it
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id, order_number INTO v_order_id, v_order_number
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key;
    
    IF v_order_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'is_duplicate', true
      );
    END IF;
  END IF;

  -- Generate order number: DORASANI-YEAR-RANDOM
  v_order_number := 'DOR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');

  -- Process and lock each product
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(product_id UUID, variant_id UUID, quantity INT)
  LOOP
    -- Lock product row FOR UPDATE
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
    IF NOT FOUND OR v_prod.status != 'active' THEN
      RAISE EXCEPTION 'Product % is not available.', v_item.product_id;
    END IF;

    -- Check stock
    IF v_item.variant_id IS NOT NULL THEN
      SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
      IF NOT FOUND OR v_var.stock_quantity < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for % variant.', v_prod.title;
      END IF;
      v_unit_price := v_prod.price_inr + v_var.price_adjustment_inr;
    ELSE
      IF v_prod.stock_quantity < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for %.', v_prod.title;
      END IF;
      v_unit_price := v_prod.price_inr;
    END IF;

    v_item_total := v_unit_price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- Validate coupon if supplied
  IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
    SELECT * INTO v_coupon FROM public.coupons 
    WHERE code = UPPER(p_coupon_code) AND is_active = true 
      AND (end_date IS NULL OR end_date > NOW())
    FOR UPDATE;

    IF FOUND AND v_subtotal >= v_coupon.min_order_amount_inr THEN
      IF v_coupon.discount_type = 'percentage' THEN
        v_discount := (v_subtotal * v_coupon.discount_value) / 100;
        IF v_coupon.max_discount_inr IS NOT NULL AND v_discount > v_coupon.max_discount_inr THEN
          v_discount := v_coupon.max_discount_inr;
        END IF;
      ELSE
        v_discount := v_coupon.discount_value;
      END IF;
      
      -- Increment coupon usage
      UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon.id;
    END IF;
  END IF;

  -- Calculate shipping
  IF p_delivery_option = 'express' THEN
    v_shipping_fee := 199;
  ELSE
    IF v_subtotal < 1999 THEN
      v_shipping_fee := 99;
    ELSE
      v_shipping_fee := 0; -- Free shipping above 1999
    END IF;
  END IF;

  v_total := (v_subtotal - v_discount) + v_shipping_fee;

  -- Insert Order
  INSERT INTO public.orders (
    order_number, user_id, customer_email, customer_phone, customer_name,
    billing_address, shipping_address, delivery_option, subtotal_inr,
    discount_inr, coupon_code, shipping_fee_inr, tax_amount_inr, total_inr,
    payment_method, payment_status, order_status, idempotency_key
  ) VALUES (
    v_order_number, p_user_id, p_customer_email, p_customer_phone, p_customer_name,
    p_billing_address, p_shipping_address, p_delivery_option, v_subtotal,
    v_discount, p_coupon_code, v_shipping_fee, v_tax_amount, v_total,
    p_payment_method, 
    CASE WHEN p_payment_method = 'cod' THEN 'pending'::payment_status_type ELSE 'pending'::payment_status_type END,
    'confirmed'::order_status_type,
    p_idempotency_key
  ) RETURNING id INTO v_order_id;

  -- Insert Order Items & Deduct Stock with Ledger tracking
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_cart_items) AS x(product_id UUID, variant_id UUID, quantity INT)
  LOOP
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id;
    
    IF v_item.variant_id IS NOT NULL THEN
      SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id;
      v_unit_price := v_prod.price_inr + v_var.price_adjustment_inr;
      
      -- Deduct variant stock
      UPDATE public.product_variants 
      SET stock_quantity = stock_quantity - v_item.quantity 
      WHERE id = v_item.variant_id;

      -- Inventory movement ledger
      INSERT INTO public.inventory_movements (
        product_id, variant_id, previous_quantity, quantity_changed, new_quantity, reason, reference_id
      ) VALUES (
        v_item.product_id, v_item.variant_id, v_var.stock_quantity, -v_item.quantity, v_var.stock_quantity - v_item.quantity, 'sale', v_order_id::TEXT
      );
    ELSE
      v_unit_price := v_prod.price_inr;
    END IF;

    -- Deduct overall product stock
    UPDATE public.products 
    SET stock_quantity = stock_quantity - v_item.quantity,
        sold_count = sold_count + v_item.quantity,
        in_stock = (stock_quantity - v_item.quantity > 0)
    WHERE id = v_item.product_id;

    -- Inventory movement ledger for product
    INSERT INTO public.inventory_movements (
      product_id, variant_id, previous_quantity, quantity_changed, new_quantity, reason, reference_id
    ) VALUES (
      v_item.product_id, v_item.variant_id, v_prod.stock_quantity, -v_item.quantity, v_prod.stock_quantity - v_item.quantity, 'sale', v_order_id::TEXT
    );

    -- Insert order item snapshot
    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_title, product_sku,
      unit_price_inr, quantity, total_price_inr
    ) VALUES (
      v_order_id, v_item.product_id, v_item.variant_id, v_prod.title, v_prod.sku,
      v_unit_price, v_item.quantity, v_unit_price * v_item.quantity
    );
  END LOOP;

  -- Record order status history
  INSERT INTO public.order_status_history (order_id, new_status, note)
  VALUES (v_order_id, 'confirmed', 'Order created successfully via checkout');

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_inr', v_total
  );
END;
$$;

-- ==============================================================================
-- SECTION O: COMPLETE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every single table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Public profiles are visible to self and admins"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. USER ROLES (Strictly Read-only to user, manageable only by super_admin)
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only super_admins can assign roles"
  ON public.user_roles FOR ALL
  USING (public.has_role('super_admin'));

-- 3. CUSTOMER ADDRESSES
CREATE POLICY "Users can manage their own addresses"
  ON public.customer_addresses FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- 4. PUBLIC CATALOGUE (Categories, Products, Variants, Media, Collections)
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view active product variants"
  ON public.product_variants FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage product variants"
  ON public.product_variants FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view product media"
  ON public.product_media FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product media"
  ON public.product_media FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view active collections"
  ON public.collections FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view collection products"
  ON public.collection_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage collection products"
  ON public.collection_products FOR ALL
  USING (public.is_admin());

-- 5. CARTS & ITEMS
CREATE POLICY "Users manage own carts"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id OR guest_token IS NOT NULL OR public.is_admin());

CREATE POLICY "Users manage own cart items"
  ON public.cart_items FOR ALL
  USING (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid() OR guest_token IS NOT NULL)
    OR public.is_admin()
  );

-- 6. WISHLISTS & ITEMS
CREATE POLICY "Users manage own wishlists"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id OR guest_token IS NOT NULL OR public.is_admin());

CREATE POLICY "Users manage own wishlist items"
  ON public.wishlist_items FOR ALL
  USING (
    wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid() OR guest_token IS NOT NULL)
    OR public.is_admin()
  );

-- 7. COUPONS
CREATE POLICY "Anyone can check active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  USING (public.is_admin());

-- 8. ORDERS & ORDER ITEMS
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Admins manage orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins view status history"
  ON public.order_status_history FOR SELECT
  USING (public.is_admin());

-- 9. REVIEWS
CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users submit reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage reviews"
  ON public.product_reviews FOR ALL
  USING (public.is_admin());

-- 10. CMS & DYNAMIC HOMEPAGE
CREATE POLICY "Anyone can view homepage sections"
  ON public.homepage_sections FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage homepage sections"
  ON public.homepage_sections FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage banners"
  ON public.banners FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view navigation"
  ON public.navigation_items FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage navigation"
  ON public.navigation_items FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view service benefits"
  ON public.service_benefits FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage service benefits"
  ON public.service_benefits FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view content pages"
  ON public.content_pages FOR SELECT
  USING (true);

CREATE POLICY "Admins manage content pages"
  ON public.content_pages FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins view site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

-- 11. CONTACT & NEWSLETTER
CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view contact messages"
  ON public.contact_messages FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins manage newsletter"
  ON public.newsletter_subscribers FOR ALL
  USING (public.is_admin());

-- 12. INVENTORY & AUDIT (Admin only)
CREATE POLICY "Admins manage inventory movements"
  ON public.inventory_movements FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins view audit logs"
  ON public.admin_audit_logs FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins manage shipments"
  ON public.shipments FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins manage returns and refunds"
  ON public.return_requests FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins manage refunds"
  ON public.refunds FOR ALL
  USING (public.is_admin());

