-- ==============================================================================
-- DORASANI: Update Studio Address, Customer Care Phone, Timings & Support Email
-- Version: 20261109000005
-- Synchronizes live public.site_settings with official storefront details.
-- ==============================================================================

INSERT INTO public.site_settings (key, value, description)
VALUES
  (
    'store_name',
    to_jsonb('Dorasani Sarees'::TEXT),
    'Primary boutique or studio name'
  ),
  (
    'store_address',
    to_jsonb(
      'Plot No 7-13/1/A, Bhagyalaxmi Colony, Shapur Road, Quthbullapur (M), Medchal Dist (Landmark: Opposite Maxx Cycle Shop and beside new KFC)'::TEXT
    ),
    'Studio street address and landmark'
  ),
  (
    'store_city_state_pin',
    to_jsonb('Hyderabad, Telangana - 500067'::TEXT),
    'Studio city, state and PIN code'
  ),
  (
    'support_phone',
    to_jsonb('+91 7780673360'::TEXT),
    'Customer care phone number'
  ),
  (
    'support_email',
    to_jsonb('dorasanisarees@gmail.com'::TEXT),
    'Primary customer support email address'
  ),
  (
    'concierge_email',
    to_jsonb('dorasanisarees@gmail.com'::TEXT),
    'Bridal and styling concierge email address'
  ),
  (
    'studio_hours',
    to_jsonb('Monday – Sunday: 10:30 AM – 9:00 PM IST'::TEXT),
    'Studio and customer care operating hours'
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = TIMEZONE('utc', NOW());

NOTIFY pgrst, 'reload schema';

