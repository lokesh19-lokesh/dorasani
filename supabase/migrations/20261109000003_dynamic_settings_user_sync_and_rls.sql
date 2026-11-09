-- ==============================================================================
-- DORASANI DYNAMIC SETTINGS, USER SYNC INDEXES & RLS COMPLETION
-- Version: 20261109000003
-- ==============================================================================

-- 1. Public readability & admin write policies for site_settings
DROP POLICY IF EXISTS "Admins view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anyone can view public site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins manage site settings" ON public.site_settings;

CREATE POLICY "Anyone can view public site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2. Complete missing RLS policies on customer_activity_logs, customer_preferences,
--    order_status_history, coupon_redemptions, and user_roles (WITH CHECK).
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.customer_activity_logs;
CREATE POLICY "Users can view own activity logs"
  ON public.customer_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can insert own activity logs" ON public.customer_activity_logs;
CREATE POLICY "Authenticated users can insert own activity logs"
  ON public.customer_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage activity logs" ON public.customer_activity_logs;
CREATE POLICY "Admins manage activity logs"
  ON public.customer_activity_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users manage own preferences" ON public.customer_preferences;
CREATE POLICY "Users manage own preferences"
  ON public.customer_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users view own order status history" ON public.order_status_history;
CREATE POLICY "Users view own order status history"
  ON public.order_status_history
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users view own coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users view own coupon redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Admins manage coupon redemptions"
  ON public.coupon_redemptions
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only super_admins can assign roles" ON public.user_roles;
CREATE POLICY "Only super_admins can assign roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- 3. Safely deduplicate user carts & wishlists (if any duplicates exist) before
--    enforcing one persistent cart / wishlist per authenticated user.
DELETE FROM public.carts c
USING (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id
    ) AS rn
  FROM public.carts
  WHERE user_id IS NOT NULL
) dup
WHERE c.id = dup.id
  AND dup.rn > 1;

DELETE FROM public.wishlists w
USING (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC NULLS LAST, id
    ) AS rn
  FROM public.wishlists
  WHERE user_id IS NOT NULL
) dup
WHERE w.id = dup.id
  AND dup.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_carts_user_id
  ON public.carts (user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wishlists_user_id
  ON public.wishlists (user_id)
  WHERE user_id IS NOT NULL;

-- 4. Seed default dynamic storefront settings cleanly (never overwrite admin edits)
INSERT INTO public.site_settings (key, value, description)
VALUES
  ('store_name', to_jsonb('DORASANI Flagship Studio'::TEXT), 'Primary boutique or studio name'),
  ('support_email', to_jsonb('dorasanisarees@gmail.com'::TEXT), 'Primary customer support email address'),
  ('concierge_email', to_jsonb('dorasanisarees@gmail.com'::TEXT), 'Bridal and styling concierge email address'),
  ('support_phone', to_jsonb(''::TEXT), 'Customer support phone number (hidden on storefront when empty)'),
  ('store_address', to_jsonb('Flagship Handloom Studio, Banjara Hills'::TEXT), 'Studio street or neighbourhood address'),
  ('store_city_state_pin', to_jsonb('Hyderabad, Telangana'::TEXT), 'Studio city, state and PIN code'),
  ('studio_hours', to_jsonb('Monday – Sunday: 10:30 AM – 8:30 PM IST'::TEXT), 'Studio and support operating hours'),
  ('free_shipping_threshold', to_jsonb(1999), 'Minimum order value in INR for free standard shipping'),
  ('standard_shipping_fee', to_jsonb(99), 'Standard delivery shipping fee in INR below free shipping threshold'),
  ('express_shipping_fee', to_jsonb(199), 'Express priority air dispatch fee in INR'),
  ('announcement_items', '["Free Shipping Above ₹{threshold}", "Easy Returns", "Authentic Handloom", "Customer Support"]'::jsonb, 'Top announcement bar items ({threshold} expands dynamically)'),
  ('instagram_url', to_jsonb('https://instagram.com'::TEXT), 'Official Instagram profile URL'),
  ('facebook_url', to_jsonb('https://facebook.com'::TEXT), 'Official Facebook page URL'),
  ('youtube_url', to_jsonb('https://youtube.com'::TEXT), 'Official YouTube channel URL'),
  ('footer_copyright', to_jsonb('© 2026 DORASANI. All rights reserved.'::TEXT), 'Footer copyright notice')
ON CONFLICT (key) DO NOTHING;

-- 5. Seed homepage promotional banners when none exist yet
INSERT INTO public.banners (
  banner_type,
  tagline,
  title_line_1,
  title_line_2,
  description,
  primary_cta_label,
  primary_cta_link,
  desktop_image_url,
  mobile_image_url,
  display_order,
  is_active
)
SELECT
  'promotional',
  'FESTIVE HERITAGE',
  'A Celebration',
  'of Our Heritage',
  'Elegant styles for festivals, weddings and meaningful occasions.',
  'Explore Festive Styles',
  '/collections/festive',
  '/assets/hero/ShopbyCategoryhomepage.png',
  '/assets/hero/ShopbyCategoryhomepage.png',
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.banners WHERE banner_type = 'promotional'
);

INSERT INTO public.banners (
  banner_type,
  tagline,
  title_line_1,
  title_line_2,
  description,
  primary_cta_label,
  primary_cta_link,
  desktop_image_url,
  mobile_image_url,
  display_order,
  is_active
)
SELECT
  'promotional',
  'OUR STORY',
  'A Legacy of Beauty.',
  'A Spirit of Tradition.',
  'DORASANI celebrates the rich artistic traditions of South India, bringing timeless textiles and elegant designs to your most cherished moments.',
  'Our Story',
  '/about',
  '/assets/hero/NewArrivalsbrander.png',
  '/assets/hero/NewArrivalsbrander.png',
  2,
  true
WHERE (
  SELECT COUNT(*) FROM public.banners WHERE banner_type = 'promotional'
) < 2;

-- 6. Recreate process_checkout_atomic to read shipping threshold & fees dynamically
--    from public.site_settings (falling back safely to 1999 / 99 / 199).
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
  p_idempotency_key TEXT,
  p_customer_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_existing_total INT;
  v_subtotal INT := 0;
  v_discount INT := 0;
  v_shipping_fee INT := 0;
  v_free_shipping_threshold INT := 1999;
  v_standard_shipping_fee INT := 99;
  v_express_shipping_fee INT := 199;
  v_tax_amount INT := 0;
  v_total INT := 0;
  v_item RECORD;
  v_prod RECORD;
  v_var RECORD;
  v_unit_price INT;
  v_item_total INT;
  v_coupon RECORD;
  v_clean_coupon TEXT;
  v_primary_image_url TEXT;
BEGIN
  -- Serialize concurrent calls sharing the same idempotency_key to prevent 23505 races
  IF NULLIF(TRIM(p_idempotency_key), '') IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext(TRIM(p_idempotency_key))::bigint);

    SELECT id, order_number, total_inr INTO v_order_id, v_order_number, v_existing_total
    FROM public.orders
    WHERE idempotency_key = TRIM(p_idempotency_key);

    IF v_order_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total_inr', v_existing_total,
        'is_duplicate', true
      );
    END IF;
  END IF;

  IF p_cart_items IS NULL OR jsonb_typeof(p_cart_items) != 'array' OR jsonb_array_length(p_cart_items) = 0 THEN
    RAISE EXCEPTION 'Cart cannot be empty.';
  END IF;

  -- Load live shipping settings safely from site_settings (with defaults 1999 / 99 / 199)
  SELECT CASE
    WHEN TRIM(BOTH '"' FROM value::TEXT) ~ '^\d+(\.\d+)?$'
    THEN TRIM(BOTH '"' FROM value::TEXT)::NUMERIC::INT
    ELSE NULL
  END INTO v_free_shipping_threshold
  FROM public.site_settings
  WHERE key = 'free_shipping_threshold'
  LIMIT 1;
  v_free_shipping_threshold := COALESCE(v_free_shipping_threshold, 1999);

  SELECT CASE
    WHEN TRIM(BOTH '"' FROM value::TEXT) ~ '^\d+(\.\d+)?$'
    THEN TRIM(BOTH '"' FROM value::TEXT)::NUMERIC::INT
    ELSE NULL
  END INTO v_standard_shipping_fee
  FROM public.site_settings
  WHERE key = 'standard_shipping_fee'
  LIMIT 1;
  v_standard_shipping_fee := COALESCE(v_standard_shipping_fee, 99);

  SELECT CASE
    WHEN TRIM(BOTH '"' FROM value::TEXT) ~ '^\d+(\.\d+)?$'
    THEN TRIM(BOTH '"' FROM value::TEXT)::NUMERIC::INT
    ELSE NULL
  END INTO v_express_shipping_fee
  FROM public.site_settings
  WHERE key = 'express_shipping_fee'
  LIMIT 1;
  v_express_shipping_fee := COALESCE(v_express_shipping_fee, 199);

  -- Generate order number: DOR-YYYYMMDD-XXXXX
  v_order_number := 'DOR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');

  -- Lock each product row and calculate authoritative subtotal
  FOR v_item IN
    SELECT
      product_id,
      variant_id,
      GREATEST(1, COALESCE(quantity, 1)) AS quantity
    FROM jsonb_to_recordset(p_cart_items) AS x(product_id UUID, variant_id UUID, quantity INT)
  LOOP
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
    IF NOT FOUND OR v_prod.status != 'active' THEN
      RAISE EXCEPTION 'Product % is not available.', v_item.product_id;
    END IF;

    IF v_item.variant_id IS NOT NULL THEN
      SELECT * INTO v_var
      FROM public.product_variants
      WHERE id = v_item.variant_id AND product_id = v_item.product_id
      FOR UPDATE;

      IF NOT FOUND OR COALESCE(v_var.stock_quantity, 0) < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for % variant.', v_prod.title;
      END IF;
      v_unit_price := v_prod.price_inr + COALESCE(v_var.price_adjustment_inr, 0);
    ELSE
      IF COALESCE(v_prod.stock_quantity, 0) < v_item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for %.', v_prod.title;
      END IF;
      v_unit_price := v_prod.price_inr;
    END IF;

    v_item_total := v_unit_price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- Validate and lock coupon if supplied
  v_clean_coupon := UPPER(TRIM(COALESCE(p_coupon_code, '')));
  IF v_clean_coupon <> '' THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = v_clean_coupon
      AND is_active = true
      AND (start_date IS NULL OR start_date <= NOW())
      AND (end_date IS NULL OR end_date > NOW())
      AND (usage_limit IS NULL OR COALESCE(used_count, 0) < usage_limit)
    FOR UPDATE;

    IF FOUND AND v_subtotal >= COALESCE(v_coupon.min_order_amount_inr, 0) THEN
      IF v_coupon.discount_type = 'percentage' THEN
        v_discount := ROUND((v_subtotal::NUMERIC * v_coupon.discount_value) / 100)::INT;
        IF v_coupon.max_discount_inr IS NOT NULL AND v_discount > v_coupon.max_discount_inr THEN
          v_discount := v_coupon.max_discount_inr;
        END IF;
      ELSE
        v_discount := v_coupon.discount_value;
      END IF;

      v_discount := LEAST(v_subtotal, GREATEST(0, v_discount));

      UPDATE public.coupons
      SET used_count = COALESCE(used_count, 0) + 1
      WHERE id = v_coupon.id;
    ELSE
      v_coupon := NULL;
    END IF;
  END IF;

  -- Dynamic shipping calculation aligned with Frontend & Edge Function
  IF COALESCE(NULLIF(TRIM(p_delivery_option), ''), 'standard') = 'express' THEN
    v_shipping_fee := v_express_shipping_fee;
  ELSE
    IF v_subtotal = 0 OR v_subtotal >= v_free_shipping_threshold THEN
      v_shipping_fee := 0;
    ELSE
      v_shipping_fee := v_standard_shipping_fee;
    END IF;
  END IF;

  v_total := GREATEST(0, (v_subtotal - v_discount) + v_shipping_fee);

  -- Insert Order
  INSERT INTO public.orders (
    order_number, user_id, customer_email, customer_phone, customer_name,
    billing_address, shipping_address, delivery_option, subtotal_inr,
    discount_inr, coupon_code, shipping_fee_inr, tax_amount_inr, total_inr,
    payment_method, payment_status, order_status, customer_notes, idempotency_key
  ) VALUES (
    v_order_number,
    p_user_id,
    TRIM(p_customer_email),
    TRIM(p_customer_phone),
    TRIM(p_customer_name),
    p_billing_address,
    p_shipping_address,
    COALESCE(NULLIF(TRIM(p_delivery_option), ''), 'standard'),
    v_subtotal,
    v_discount,
    CASE WHEN v_coupon.id IS NOT NULL THEN v_coupon.code ELSE NULL END,
    v_shipping_fee,
    v_tax_amount,
    v_total,
    COALESCE(NULLIF(TRIM(p_payment_method), ''), 'upi'),
    'pending'::payment_status_type,
    'confirmed'::order_status_type,
    NULLIF(TRIM(COALESCE(p_customer_notes, '')), ''),
    NULLIF(TRIM(COALESCE(p_idempotency_key, '')), '')
  ) RETURNING id INTO v_order_id;

  -- Record coupon redemption if applied
  IF v_coupon.id IS NOT NULL AND v_discount > 0 THEN
    INSERT INTO public.coupon_redemptions (coupon_id, user_id, order_id, discount_applied_inr)
    VALUES (v_coupon.id, p_user_id, v_order_id, v_discount);
  END IF;

  -- Insert Order Items & Deduct Stock with Ledger tracking
  FOR v_item IN
    SELECT
      product_id,
      variant_id,
      GREATEST(1, COALESCE(quantity, 1)) AS quantity
    FROM jsonb_to_recordset(p_cart_items) AS x(product_id UUID, variant_id UUID, quantity INT)
  LOOP
    SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id;

    SELECT pm.url INTO v_primary_image_url
    FROM public.product_media pm
    WHERE pm.product_id = v_item.product_id
    ORDER BY pm.is_primary DESC NULLS LAST, pm.display_order ASC NULLS LAST
    LIMIT 1;

    IF v_item.variant_id IS NOT NULL THEN
      SELECT * INTO v_var FROM public.product_variants WHERE id = v_item.variant_id;
      v_unit_price := v_prod.price_inr + COALESCE(v_var.price_adjustment_inr, 0);

      UPDATE public.product_variants
      SET stock_quantity = COALESCE(stock_quantity, 0) - v_item.quantity
      WHERE id = v_item.variant_id;

      INSERT INTO public.inventory_movements (
        product_id, variant_id, previous_quantity, quantity_changed, new_quantity, reason, reference_id
      ) VALUES (
        v_item.product_id,
        v_item.variant_id,
        COALESCE(v_var.stock_quantity, 0),
        -v_item.quantity,
        COALESCE(v_var.stock_quantity, 0) - v_item.quantity,
        'sale',
        v_order_id::TEXT
      );
    ELSE
      v_unit_price := v_prod.price_inr;
    END IF;

    UPDATE public.products
    SET stock_quantity = COALESCE(stock_quantity, 0) - v_item.quantity,
        sold_count = COALESCE(sold_count, 0) + v_item.quantity,
        in_stock = (COALESCE(stock_quantity, 0) - v_item.quantity > 0)
    WHERE id = v_item.product_id;

    INSERT INTO public.inventory_movements (
      product_id, variant_id, previous_quantity, quantity_changed, new_quantity, reason, reference_id
    ) VALUES (
      v_item.product_id,
      v_item.variant_id,
      COALESCE(v_prod.stock_quantity, 0),
      -v_item.quantity,
      COALESCE(v_prod.stock_quantity, 0) - v_item.quantity,
      'sale',
      v_order_id::TEXT
    );

    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_title, product_sku,
      unit_price_inr, quantity, total_price_inr, image_url
    ) VALUES (
      v_order_id,
      v_item.product_id,
      v_item.variant_id,
      v_prod.title,
      v_prod.sku,
      v_unit_price,
      v_item.quantity,
      v_unit_price * v_item.quantity,
      v_primary_image_url
    );
  END LOOP;

  INSERT INTO public.order_status_history (order_id, new_status, note)
  VALUES (v_order_id, 'confirmed', 'Order created successfully via checkout');

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal_inr', v_subtotal,
    'discount_inr', v_discount,
    'shipping_fee_inr', v_shipping_fee,
    'total_inr', v_total
  );
END;
$$;

REVOKE ALL ON FUNCTION public.process_checkout_atomic(uuid,text,text,text,jsonb,jsonb,jsonb,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_checkout_atomic(uuid,text,text,text,jsonb,jsonb,jsonb,text,text,text,text,text) TO anon, authenticated, service_role;

