-- Core domain entities and supporting types. Idempotent creation.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM (
      'Super Administrator',
      'Administrator',
      'Manager',
      'Operator',
      'Viewer'
    );
  END IF;
END$$;

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers table (alias for invoicing, could be same as clients)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  billing_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employees
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in progress','completed','cancelled')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC(12,2),
  location TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_coordinates ON public.jobs(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Time entries
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_duration INTEGER DEFAULT 0,
  notes TEXT,
  date DATE GENERATED ALWAYS AS (clock_in::date) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON public.time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON public.time_entries(employee_id, date);

-- Inventory
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(12,2),
  reorder_level NUMERIC(12,2) NOT NULL DEFAULT 0,
  location TEXT,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in','out','adjustment','return')),
  quantity NUMERIC(12,2) NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Photos
CREATE TABLE IF NOT EXISTS public.job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment assignments
CREATE TABLE IF NOT EXISTS public.asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL,
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  condition_out TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cost catalog
CREATE TABLE IF NOT EXISTS public.cost_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID REFERENCES public.cost_catalog(id) ON DELETE CASCADE,
  item_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Measurements
CREATE TABLE IF NOT EXISTS public."Mapmeasurements" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('distance','area')),
  value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL,
  geojson JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles (for fleet tracking)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plate TEXT,
  status TEXT,
  last_location JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safety training and compliance
CREATE TABLE IF NOT EXISTS public.safety_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  completed_on DATE,
  expires_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  violation TEXT NOT NULL,
  occurred_on DATE NOT NULL,
  severity TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  action_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employee_compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  calculated_on DATE NOT NULL DEFAULT CURRENT_DATE,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User personalization
CREATE TABLE IF NOT EXISTS public.user_shortcuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shortcut TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS enablement (broad allow for now where applicable)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Mapmeasurements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_shortcuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Simple permissive policies (can be tightened later)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'clients','customers','employees','jobs','time_entries','inventory_items','inventory_transactions',
        'job_photos','asset_assignments','activity_logs','notifications','cost_catalog','cost_items','Mapmeasurements',
        'vehicles','safety_training','employee_violations','disciplinary_actions','employee_compliance_scores',
        'user_shortcuts','user_onboarding'
      )
  ) LOOP
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR SELECT USING (true);',
                   'allow_select_' || r.table_name, r.table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR INSERT WITH CHECK (true);',
                   'allow_insert_' || r.table_name, r.table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR UPDATE USING (true);',
                   'allow_update_' || r.table_name, r.table_name);
    EXECUTE format('CREATE POLICY IF NOT EXISTS %I ON public.%I FOR DELETE USING (true);',
                   'allow_delete_' || r.table_name, r.table_name);
  END LOOP;
END$$;

-- Roles table & helpers
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- Ensure compatibility view exists for code paths selecting textual role
CREATE OR REPLACE VIEW public.user_roles_v_legacy AS
SELECT ur.id,
       ur.user_id,
       (ur.role)::text AS role,
       ur.created_at
FROM public.user_roles ur;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('Super Administrator', 'Administrator')
  );
$$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
