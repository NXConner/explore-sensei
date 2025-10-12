-- Harden permissive RLS and add missing protections where applicable

-- Invoices and related items should not be world-readable; scope to creators/admins
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='invoices') THEN
    DROP POLICY IF EXISTS "Users can view all invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can insert invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can update invoices" ON public.invoices;
    DROP POLICY IF EXISTS "Users can delete invoices" ON public.invoices;

    CREATE POLICY IF NOT EXISTS "invoices_select_own_or_admin" ON public.invoices
      FOR SELECT TO authenticated USING (
        created_by = auth.uid() OR public.is_admin(auth.uid())
      );
    CREATE POLICY IF NOT EXISTS "invoices_insert_own_or_admin" ON public.invoices
      FOR INSERT TO authenticated WITH CHECK (
        created_by = auth.uid() OR public.is_admin(auth.uid())
      );
    CREATE POLICY IF NOT EXISTS "invoices_update_own_or_admin" ON public.invoices
      FOR UPDATE TO authenticated USING (
        created_by = auth.uid() OR public.is_admin(auth.uid())
      );
    CREATE POLICY IF NOT EXISTS "invoices_delete_admin_only" ON public.invoices
      FOR DELETE TO authenticated USING (
        public.is_admin(auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='invoice_items') THEN
    DROP POLICY IF EXISTS "Users can view invoice items" ON public.invoice_items;
    DROP POLICY IF EXISTS "Users can insert invoice items" ON public.invoice_items;
    DROP POLICY IF EXISTS "Users can update invoice items" ON public.invoice_items;
    DROP POLICY IF EXISTS "Users can delete invoice items" ON public.invoice_items;

    CREATE POLICY IF NOT EXISTS "invoice_items_scope_to_invoice_creator_or_admin" ON public.invoice_items
      FOR ALL TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.invoices i
          WHERE i.id = invoice_id AND (i.created_by = auth.uid() OR public.is_admin(auth.uid()))
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.invoices i
          WHERE i.id = invoice_id AND (i.created_by = auth.uid() OR public.is_admin(auth.uid()))
        )
      );
  END IF;
END $$;

-- Drop permissive allow_* policies for selected core tables; project will add specific ones as needed
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name IN (
      'clients','customers','jobs','time_entries','job_photos','asset_assignments','activity_logs','notifications'
    )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'allow_select_'||r.table_name, r.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'allow_insert_'||r.table_name, r.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'allow_update_'||r.table_name, r.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'allow_delete_'||r.table_name, r.table_name);
  END LOOP;
END $$;

-- Example hardened policies for job_photos (owns via employee mapped to auth user)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='job_photos') THEN
    CREATE POLICY IF NOT EXISTS "job_photos_select_own_or_admin" ON public.job_photos
      FOR SELECT TO authenticated USING (
        employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid())
      );
    CREATE POLICY IF NOT EXISTS "job_photos_insert_own_or_admin" ON public.job_photos
      FOR INSERT TO authenticated WITH CHECK (
        employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid())
      );
    CREATE POLICY IF NOT EXISTS "job_photos_update_own_or_admin" ON public.job_photos
      FOR UPDATE TO authenticated USING (
        employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.is_admin(auth.uid())
      );
  END IF;
END $$;
