-- Role-scoped staff permissions:
-- Allows support_agent to manage contact_messages, newsletter_subscribers, and product_reviews,
-- while restricting user_roles & admin_emails management strictly to super_admin.

CREATE OR REPLACE FUNCTION public.has_any_role(p_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::TEXT = ANY(p_roles)
  );
$$;

REVOKE ALL ON FUNCTION public.has_any_role(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_role(TEXT[]) TO authenticated;

-- Support agents can view & manage inquiries, newsletter, and reviews
DROP POLICY IF EXISTS "Support agents manage contact messages" ON public.contact_messages;
CREATE POLICY "Support agents manage contact messages"
  ON public.contact_messages
  FOR ALL
  TO authenticated
  USING (public.has_any_role(ARRAY['super_admin', 'admin', 'support_agent']))
  WITH CHECK (public.has_any_role(ARRAY['super_admin', 'admin', 'support_agent']));

DROP POLICY IF EXISTS "Support agents manage newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Support agents manage newsletter"
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (public.has_any_role(ARRAY['super_admin', 'admin', 'support_agent']))
  WITH CHECK (public.has_any_role(ARRAY['super_admin', 'admin', 'support_agent']));

DROP POLICY IF EXISTS "Support agents moderate product reviews" ON public.product_reviews;
CREATE POLICY "Support agents moderate product reviews"
  ON public.product_reviews
  FOR ALL
  TO authenticated
  USING (public.has_any_role(ARRAY['super_admin', 'admin', 'support_agent']))
  WITH CHECK (public.has_any_role(ARRAY['super_admin', 'admin', 'support_agent']));

-- Update get_my_role_info() so support_agent is recognized as a staff dashboard role too
CREATE OR REPLACE FUNCTION public.get_my_role_info()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_auth_email TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_configured_admin_role public.user_role_type;
  v_effective_role public.user_role_type;
  v_is_admin BOOLEAN := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'role', 'customer',
      'is_admin', false
    );
  END IF;

  SELECT
    LOWER(TRIM(u.email)),
    COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''), split_part(u.email, '@', 1)),
    NULLIF(TRIM(u.raw_user_meta_data->>'phone'), '')
  INTO v_auth_email, v_full_name, v_phone
  FROM auth.users u
  WHERE u.id = v_uid;

  IF v_auth_email IS NULL THEN
    RETURN jsonb_build_object(
      'authenticated', false,
      'role', 'customer',
      'is_admin', false
    );
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (v_uid, v_full_name, v_auth_email, v_phone)
  ON CONFLICT (id) DO NOTHING;

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
    'order_manager',
    'support_agent'
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
