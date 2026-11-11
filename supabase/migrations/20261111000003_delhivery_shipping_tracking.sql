-- ==============================================================================
-- DORASANI: Delhivery One Shipping, Tracking & Fulfillment Upgrade
-- Version: 20261111000003
-- Non-destructive migration extending public.shipments with Delhivery One B2C
-- tracking/manifest/label/pickup columns, customer SELECT RLS policy, and
-- non-secret Delhivery warehouse/shipping defaults in public.site_settings.
-- NOTE: DELHIVERY_API_TOKEN is stored strictly in Supabase Edge Function Secrets.
-- ==============================================================================

ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS shipping_mode TEXT DEFAULT 'Express',
  ADD COLUMN IF NOT EXISTS payment_mode TEXT,
  ADD COLUMN IF NOT EXISTS status_code TEXT,
  ADD COLUMN IF NOT EXISTS status_type TEXT,
  ADD COLUMN IF NOT EXISTS current_location TEXT,
  ADD COLUMN IF NOT EXISTS origin_city TEXT DEFAULT 'Hyderabad',
  ADD COLUMN IF NOT EXISTS destination_pincode TEXT,
  ADD COLUMN IF NOT EXISTS package_weight_grams INT DEFAULT 650,
  ADD COLUMN IF NOT EXISTS package_dimensions JSONB DEFAULT '{"length":34,"breadth":26,"height":6}'::jsonb,
  ADD COLUMN IF NOT EXISTS pickup_request_id TEXT,
  ADD COLUMN IF NOT EXISTS pickup_scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS pickup_scheduled_time TEXT,
  ADD COLUMN IF NOT EXISTS label_url TEXT,
  ADD COLUMN IF NOT EXISTS label_data JSONB,
  ADD COLUMN IF NOT EXISTS manifest_response JSONB,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_current_status ON public.shipments(current_status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_shipments_tracking_number
  ON public.shipments(tracking_number)
  WHERE tracking_number IS NOT NULL AND tracking_number <> '';

DROP POLICY IF EXISTS "Users can view their own shipments" ON public.shipments;
CREATE POLICY "Users can view their own shipments"
  ON public.shipments FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins manage shipments" ON public.shipments;
CREATE POLICY "Admins manage shipments"
  ON public.shipments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.site_settings (key, value, description)
VALUES
  (
    'delhivery_enabled',
    to_jsonb(true),
    'Enable live Delhivery One pincode serviceability, shipment creation, and tracking'
  ),
  (
    'delhivery_pickup_location',
    to_jsonb('DORASANI SAREES B2C'::TEXT),
    'Registered Delhivery One warehouse / pickup facility name (case-sensitive)'
  ),
  (
    'delhivery_origin_pincode',
    to_jsonb('500067'::TEXT),
    'Origin warehouse 6-digit PIN code for Delhivery TAT & freight checks'
  ),
  (
    'delhivery_auto_manifest',
    to_jsonb(false),
    'Automatically create a Delhivery shipment & AWB when an order is confirmed/paid'
  ),
  (
    'delhivery_default_weight_grams',
    to_jsonb(650),
    'Default parcel weight in grams per item box for Delhivery manifesting'
  ),
  (
    'delhivery_default_dimensions',
    '{"length":34,"breadth":26,"height":6}'::jsonb,
    'Default parcel dimensions (cm) for Delhivery shipments'
  ),
  (
    'delhivery_seller_gst',
    to_jsonb(''::TEXT),
    'Optional seller GSTIN for Delhivery invoices / e-waybills'
  )
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
