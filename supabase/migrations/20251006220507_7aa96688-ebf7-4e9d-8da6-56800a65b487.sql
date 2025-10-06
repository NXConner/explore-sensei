-- Create daily_field_reports table
CREATE TABLE IF NOT EXISTS public.daily_field_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  weather_conditions TEXT,
  temperature NUMERIC(5,2),
  work_performed TEXT NOT NULL,
  equipment_used TEXT[],
  materials_used JSONB,
  crew_members TEXT[],
  hours_worked NUMERIC(5,2),
  issues_encountered TEXT,
  safety_notes TEXT,
  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create safety_incidents table
CREATE TABLE IF NOT EXISTS public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('near_miss', 'first_aid', 'medical_treatment', 'lost_time', 'property_damage')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  location TEXT,
  witnesses TEXT[],
  immediate_action TEXT,
  corrective_action TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create safety_inspections table
CREATE TABLE IF NOT EXISTS public.safety_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  inspection_type TEXT NOT NULL,
  checklist_items JSONB NOT NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  passed BOOLEAN DEFAULT false,
  notes TEXT,
  corrective_actions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_field_reports_date ON public.daily_field_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_field_reports_job ON public.daily_field_reports(job_id);
CREATE INDEX IF NOT EXISTS idx_field_reports_employee ON public.daily_field_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_date ON public.safety_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_status ON public.safety_incidents(status);
CREATE INDEX IF NOT EXISTS idx_safety_inspections_date ON public.safety_inspections(inspection_date);

-- Enable RLS
ALTER TABLE public.daily_field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_inspections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_field_reports
CREATE POLICY "Users can view all field reports"
  ON public.daily_field_reports FOR SELECT
  USING (true);

CREATE POLICY "Users can insert field reports"
  ON public.daily_field_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update field reports"
  ON public.daily_field_reports FOR UPDATE
  USING (true);

-- RLS Policies for safety_incidents
CREATE POLICY "Users can view all safety incidents"
  ON public.safety_incidents FOR SELECT
  USING (true);

CREATE POLICY "Users can insert safety incidents"
  ON public.safety_incidents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update safety incidents"
  ON public.safety_incidents FOR UPDATE
  USING (true);

-- RLS Policies for safety_inspections
CREATE POLICY "Users can view all safety inspections"
  ON public.safety_inspections FOR SELECT
  USING (true);

CREATE POLICY "Users can insert safety inspections"
  ON public.safety_inspections FOR INSERT
  WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER set_field_reports_updated_at
  BEFORE UPDATE ON public.daily_field_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_safety_incidents_updated_at
  BEFORE UPDATE ON public.safety_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();