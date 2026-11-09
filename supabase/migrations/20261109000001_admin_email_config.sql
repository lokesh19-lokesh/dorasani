-- ==============================================================================
-- DORASANI ADMIN EMAIL ALLOWLIST & AUTOMATIC ROLE ASSIGNMENT
-- Version: 20261109000001
-- Non-destructive migration configuring DB-backed administrator emails
-- ==============================================================================

-- 1. Administrator Email Registry Table (Protected by RLS)
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email TEXT PRIMARY KEY CHECK (email = LOWER(TRIM(email)) AND POSITION('@' IN email) > 1),
  role user_role_type NOT NULL DEFAULT 'super_admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Strict RLS: Only super_admins can read or modify the admin email allowlist
DROP POLICY IF EXISTS "Only super_admins can manage admin_emails" ON public.admin_emails;
CREATE POLICY "Only super_admins can manage admin_emails"
  ON public.admin_emails
  FOR ALL
  TO authenticated
  USING (public.has_role('super_admin'))
  WITH CHECK (public.has_role('super_admin'));

-- 2. Seed primary administrator email in database
INSERT INTO public.admin_emails (email, role, is_active, notes)
VALUES (
  'dorasanisarees@gmail.com',
  'super_admin',
  true,
  'Primary store owner / super administrator'
)
ON CONFLICT (email) DO UPDATE
  SET role = EXCLUDED.role,
      is_active = EXCLUDED.is_active,
      notes = COALESCE(public.admin_emails.notes, EXCLUDED.notes),
      updated_at = TIMEZONE('utc', NOW());

-- 3. Update handle_new_user() trigger function so signing up with an email
--    registered in public.admin_emails automatically assigns that admin role.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_email TEXT;
  v_admin_role user_role_type;
BEGIN
  v_normalized_email := LOWER(TRIM(COALESCE(NEW.email, '')));

  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(v_normalized_email, '@', 1), ''),
      'DORASANI Member'
    ),
    v_normalized_email,
    COALESCE(NULLIF(NEW.phone, ''), NULLIF(NEW.raw_user_meta_data->>'phone', '')),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
        updated_at = TIMEZONE('utc', NOW());

  -- Check if this verified email is configured as an active administrator
  SELECT ae.role INTO v_admin_role
  FROM public.admin_emails ae
  WHERE ae.email = v_normalized_email
    AND ae.is_active = true
  LIMIT 1;

  IF v_admin_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_admin_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Also keep roles synced if an existing user's email changes in auth.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_email_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_email TEXT;
  v_admin_role user_role_type;
BEGIN
  v_normalized_email := LOWER(TRIM(COALESCE(NEW.email, '')));

  UPDATE public.profiles
  SET email = v_normalized_email,
      updated_at = TIMEZONE('utc', NOW())
  WHERE id = NEW.id;

  SELECT ae.role INTO v_admin_role
  FROM public.admin_emails ae
  WHERE ae.email = v_normalized_email
    AND ae.is_active = true
  LIMIT 1;

  IF v_admin_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_admin_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_auth_user_email_update();

-- 5. Backfill any existing auth.users rows matching public.admin_emails
INSERT INTO public.profiles (id, full_name, email, phone)
SELECT
  u.id,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
    NULLIF(split_part(LOWER(TRIM(u.email)), '@', 1), ''),
    'DORASANI Admin'
  ),
  LOWER(TRIM(u.email)),
  COALESCE(NULLIF(u.phone, ''), NULLIF(u.raw_user_meta_data->>'phone', ''))
FROM auth.users u
JOIN public.admin_emails ae
  ON ae.email = LOWER(TRIM(u.email))
WHERE ae.is_active = true
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, ae.role
FROM auth.users u
JOIN public.admin_emails ae
  ON ae.email = LOWER(TRIM(u.email))
WHERE ae.is_active = true
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. SECURITY DEFINER RPC called on login & session restore.
--    Syncs role from admin_emails -> user_roles if applicable and returns verified role info.
CREATE OR REPLACE FUNCTION public.get_my_role_info()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_auth_email TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_configured_admin_role user_role_type;
  v_effective_role user_role_type;
  v_is_admin BOOLEAN := false;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', NULL,
      'email', NULL,
      'role', NULL,
      'is_admin', false
    );
  END IF;

  SELECT
    LOWER(TRIM(u.email)),
    COALESCE(
      NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(LOWER(TRIM(u.email)), '@', 1), ''),
      'DORASANI Member'
    ),
    COALESCE(NULLIF(u.phone, ''), NULLIF(u.raw_user_meta_data->>'phone', ''))
  INTO v_auth_email, v_full_name, v_phone
  FROM auth.users u
  WHERE u.id = v_uid;

  IF v_auth_email IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'user_id', NULL,
      'email', NULL,
      'role', NULL,
      'is_admin', false
    );
  END IF;

  -- Ensure profile row exists
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (v_uid, v_full_name, v_auth_email, v_phone)
  ON CONFLICT (id) DO NOTHING;

  -- Check DB admin allowlist and auto-promote if matched
  SELECT ae.role INTO v_configured_admin_role
  FROM public.admin_emails ae
  WHERE ae.email = v_auth_email
    AND ae.is_active = true
  LIMIT 1;

  IF v_configured_admin_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, v_configured_admin_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Resolve highest priority role assigned to this user
  SELECT ur.role INTO v_effective_role
  FROM public.user_roles ur
  WHERE ur.user_id = v_uid
  ORDER BY CASE ur.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'catalog_manager' THEN 3
    WHEN 'inventory_manager' THEN 4
    WHEN 'order_manager' THEN 5
    WHEN 'support_agent' THEN 6
    ELSE 7
  END
  LIMIT 1;

  IF v_effective_role IS NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'customer')
    ON CONFLICT (user_id, role) DO NOTHING;
    v_effective_role := 'customer';
  END IF;

  v_is_admin := v_effective_role IN (
    'super_admin',
    'admin',
    'catalog_manager',
    'inventory_manager',
    'order_manager'
  );

  RETURN jsonb_build_object(
    'authenticated', true,
    'user_id', v_uid,
    'email', v_auth_email,
    'role', v_effective_role::TEXT,
    'is_admin', v_is_admin
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_role_info() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role_info() TO authenticated, anon;
