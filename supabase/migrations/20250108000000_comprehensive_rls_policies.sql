-- Comprehensive Row Level Security (RLS) Policies
-- This migration implements security for all database tables

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_site_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table if it doesn't exist
-- Normalize to roles/role_id model; create compatibility view to support legacy code that selects role text
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Backwards-compatible view exposing (user_id, role) text column for existing queries
CREATE OR REPLACE VIEW public.user_roles_v_legacy AS
SELECT ur.id,
       ur.user_id,
       r.name AS role,
       ur.created_at
FROM public.user_roles ur
JOIN public.roles r ON r.id = ur.role_id;

-- Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.user_roles_v_legacy TO anon, authenticated;

-- Insert default roles
INSERT INTO public.roles (name, description, permissions) VALUES
('Super Administrator', 'Full system access', '{"all": true}'),
('Administrator', 'Administrative access', '{"users": true, "settings": true, "reports": true}'),
('Manager', 'Management access', '{"jobs": true, "employees": true, "reports": true}'),
('Operator', 'Field operator access', '{"jobs": true, "time_tracking": true}'),
('Viewer', 'Read-only access', '{"view": true}')
ON CONFLICT (name) DO NOTHING;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT r.name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = get_user_role.user_id
    ORDER BY 
      CASE r.name
        WHEN 'Super Administrator' THEN 1
        WHEN 'Administrator' THEN 2
        WHEN 'Manager' THEN 3
        WHEN 'Operator' THEN 4
        WHEN 'Viewer' THEN 5
      END
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_permissions JSONB;
BEGIN
  user_role := public.get_user_role(user_id);
  
  IF user_role = 'Super Administrator' THEN
    RETURN TRUE;
  END IF;
  
  role_permissions := (
    SELECT permissions
    FROM public.roles
    WHERE name = user_role
  );
  
  RETURN COALESCE((role_permissions->permission)::boolean, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for clients table
CREATE POLICY "Users can view clients" ON public.clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert clients" ON public.clients
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'clients')
  );

CREATE POLICY "Users can update clients" ON public.clients
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'clients')
  );

CREATE POLICY "Users can delete clients" ON public.clients
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'clients')
  );

-- RLS Policies for jobs table
CREATE POLICY "Users can view jobs" ON public.jobs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert jobs" ON public.jobs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'jobs')
  );

CREATE POLICY "Users can update jobs" ON public.jobs
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'jobs')
  );

CREATE POLICY "Users can delete jobs" ON public.jobs
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'jobs')
  );

-- RLS Policies for employees table
CREATE POLICY "Users can view employees" ON public.employees
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert employees" ON public.employees
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'employees')
  );

CREATE POLICY "Users can update employees" ON public.employees
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'employees')
  );

CREATE POLICY "Users can delete employees" ON public.employees
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'employees')
  );

-- RLS Policies for time_entries table
CREATE POLICY "Users can view time entries" ON public.time_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert time entries" ON public.time_entries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'time_tracking')
  );

CREATE POLICY "Users can update time entries" ON public.time_entries
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'time_tracking')
  );

CREATE POLICY "Users can delete time entries" ON public.time_entries
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'time_tracking')
  );

-- RLS Policies for inventory_items table
CREATE POLICY "Users can view inventory" ON public.inventory_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert inventory" ON public.inventory_items
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'inventory')
  );

CREATE POLICY "Users can update inventory" ON public.inventory_items
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'inventory')
  );

CREATE POLICY "Users can delete inventory" ON public.inventory_items
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'inventory')
  );

-- RLS Policies for invoices table
CREATE POLICY "Users can view invoices" ON public.invoices
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert invoices" ON public.invoices
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'invoicing')
  );

CREATE POLICY "Users can update invoices" ON public.invoices
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'invoicing')
  );

CREATE POLICY "Users can delete invoices" ON public.invoices
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'invoicing')
  );

-- RLS Policies for safety_incidents table
CREATE POLICY "Users can view safety incidents" ON public.safety_incidents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert safety incidents" ON public.safety_incidents
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'safety')
  );

CREATE POLICY "Users can update safety incidents" ON public.safety_incidents
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'safety')
  );

CREATE POLICY "Users can delete safety incidents" ON public.safety_incidents
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    public.user_has_permission(auth.uid(), 'safety')
  );

-- RLS Policies for roles table (Super Admin only)
CREATE POLICY "Only super admins can manage roles" ON public.roles
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    public.get_user_role(auth.uid()) = 'Super Administrator'
  );

-- RLS Policies for user_roles table (Super Admin only)
CREATE POLICY "Only super admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    public.get_user_role(auth.uid()) = 'Super Administrator'
  );

-- Create audit log table for security tracking
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs" ON public.audit_log
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    public.get_user_role(auth.uid()) IN ('Super Administrator', 'Administrator')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id,
    table_name,
    operation,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for critical tables
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_jobs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_employees_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create function to assign default role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (
    NEW.id,
    (SELECT id FROM public.roles WHERE name = 'Viewer' LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
