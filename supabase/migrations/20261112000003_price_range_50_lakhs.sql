-- Update default collection filter price cap to 50 Lakhs (₹50,00,000) when still set to legacy 0/auto or unset

UPDATE public.site_settings
SET
  value = jsonb_set(
    value,
    '{groups}',
    (
      SELECT jsonb_agg(
        CASE
          WHEN elem->>'type' = 'price_range'
            AND COALESCE((elem->>'maxPrice')::numeric, 0) IN (0, 30000)
          THEN jsonb_set(elem, '{maxPrice}', to_jsonb(5000000::numeric), true)
          ELSE elem
        END
      )
      FROM jsonb_array_elements(COALESCE(value->'groups', '[]'::jsonb)) AS elem
    ),
    true
  ),
  updated_at = NOW()
WHERE key = 'collection_filters_config'
  AND jsonb_typeof(value) = 'object'
  AND jsonb_typeof(value->'groups') = 'array';

