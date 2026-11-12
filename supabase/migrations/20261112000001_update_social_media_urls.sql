-- ==============================================================================
-- DORASANI: Update Official Social Media & Google Business Profile Links
-- Version: 20261112000001
-- Synchronizes live public.site_settings with official Instagram, Google & YouTube URLs.
-- ==============================================================================

INSERT INTO public.site_settings (key, value, description)
VALUES
  (
    'instagram_url',
    to_jsonb('https://www.instagram.com/dorasani.a_symbol_of_tradition/?hl=en'::TEXT),
    'Official Instagram profile URL'
  ),
  (
    'google_url',
    to_jsonb('https://share.google/M3XD0k82h9QQnXiMX'::TEXT),
    'Official Google Business Profile link'
  ),
  (
    'youtube_url',
    to_jsonb('https://youtube.com/@ala-dorasanitho?si=HuECZg4ePcoRlyHb'::TEXT),
    'Official YouTube channel URL'
  ),
  (
    'facebook_url',
    to_jsonb(''::TEXT),
    'Official Facebook page URL'
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = TIMEZONE('utc', NOW());

NOTIFY pgrst, 'reload schema';

