-- Create or update compatibility view for user roles exposing textual role
-- Works whether user_roles has role_id (normalized) or role (enum/text)
-- Idempotent via dynamic DDL

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role_id'
  ) THEN
    EXECUTE $$
      CREATE OR REPLACE VIEW public.user_roles_v_legacy AS
      SELECT ur.id,
             ur.user_id,
             r.name AS role,
             ur.created_at
      FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
    $$;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role'
  ) THEN
    -- user_roles has a textual/enum 'role' column
    EXECUTE $$
      CREATE OR REPLACE VIEW public.user_roles_v_legacy AS
      SELECT ur.id,
             ur.user_id,
             (ur.role)::text AS role,
             ur.created_at
      FROM public.user_roles ur
    $$;
  ELSE
    -- Fallback to empty compatible shape
    EXECUTE $$
      CREATE OR REPLACE VIEW public.user_roles_v_legacy AS
      SELECT NULL::uuid AS id,
             NULL::uuid AS user_id,
             NULL::text AS role,
             now() AS created_at
      WHERE FALSE
    $$;
  END IF;

  -- Ensure basic privileges
  BEGIN
    GRANT SELECT ON public.user_roles_v_legacy TO anon, authenticated;
  EXCEPTION WHEN undefined_object THEN
    -- roles may not exist in local dev; ignore
    NULL;
  END;
END$$;
