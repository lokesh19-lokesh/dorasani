-- Single free delivery option across all orders (shipping is always ₹0)
INSERT INTO public.site_settings (key, value, description)
VALUES
  ('free_shipping_threshold', '0'::jsonb, 'Free shipping on all orders (₹0 threshold)'),
  ('standard_shipping_fee', '0'::jsonb, 'Standard shipping is free across all orders'),
  ('express_shipping_fee', '0'::jsonb, 'Single free shipping tier active')
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = TIMEZONE('utc', NOW());
