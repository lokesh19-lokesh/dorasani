-- ==============================================================================
-- DORASANI RAZORPAY PAYMENT GATEWAY & ATOMIC CHECKOUT UPGRADE
-- Version: 20261109000002
-- Non-destructive migration adding checkout_sessions, payments RLS/indexes,
-- and aligning process_checkout_atomic with storefront pricing/shipping rules.
-- ==============================================================================

-- 1. Pre-payment Checkout Sessions Table (prevents stock deduction before Razorpay capture
--    and enables idempotent recovery via both browser verification & Razorpay webhooks)
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  cart_items JSONB NOT NULL,
  coupon_code TEXT,
  payment_method TEXT NOT NULL,
  delivery_option TEXT NOT NULL DEFAULT 'standard',
  customer_notes TEXT,
  subtotal_inr INT NOT NULL,
  discount_inr INT NOT NULL DEFAULT 0,
  shipping_fee_inr INT NOT NULL DEFAULT 0,
  total_inr INT NOT NULL,
  expected_amount_paise INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'cancelled', 'expired')),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  error_code TEXT,
  error_description TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (TIMEZONE('utc', NOW()) + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user ON public.checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_rzp_order ON public.checkout_sessions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON public.checkout_sessions(status);

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own checkout sessions" ON public.checkout_sessions;
CREATE POLICY "Users view own checkout sessions"
  ON public.checkout_sessions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage checkout sessions" ON public.checkout_sessions;
CREATE POLICY "Admins manage checkout sessions"
  ON public.checkout_sessions FOR ALL
  USING (public.is_admin());

-- 2. Payments & Payment Events Indexes + Row Level Security Policies
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_order
  ON public.payments(provider, provider_order_id)
  WHERE provider_order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_provider_payment
  ON public.payments(provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON public.payment_events(payment_id);

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments"
  ON public.payments FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage payment events" ON public.payment_events;
CREATE POLICY "Admins manage payment events"
  ON public.payment_events FOR ALL
  USING (public.is_admin());

-- 3. Upgrade process_checkout_atomic to align shipping/coupon math, record redemptions,
--    copy primary product_media image_url into order_items, and persist customer_notes.
DROP FUNCTION IF EXISTS public.process_checkout_atomic(uuid,text,text,text,jsonb,jsonb,jsonb,text,text,text,text);
DROP FUNCTION IF EXISTS public.process_checkout_atomic(uuid,text,text,text,jsonb,jsonb,jsonb,text,text,text,text,text);

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

  -- Shipping aligned with StoreContext & ShippingPolicyPage (free standard shipping > ₹999)
  IF p_delivery_option = 'express' THEN
    v_shipping_fee := 99;
  ELSE
    IF v_subtotal > 999 OR v_subtotal = 0 THEN
      v_shipping_fee := 0;
    ELSE
      v_shipping_fee := 99;
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
