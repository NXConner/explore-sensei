-- Create estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  job_site_address TEXT,
  catalog_id UUID REFERENCES public.cost_catalog(id) ON DELETE SET NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  notes TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create estimate_line_items table
CREATE TABLE IF NOT EXISTS public.estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES public.estimates(id) ON DELETE CASCADE NOT NULL,
  cost_item_id UUID REFERENCES public.cost_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_code TEXT,
  description TEXT,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create route_optimizations table
CREATE TABLE IF NOT EXISTS public.route_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_location JSONB NOT NULL,
  stops JSONB NOT NULL DEFAULT '[]'::jsonb,
  optimized_route JSONB,
  total_distance NUMERIC(10,2),
  total_duration INTEGER,
  optimization_method TEXT DEFAULT 'tsp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for estimates
CREATE POLICY "Users can view their own estimates"
  ON public.estimates FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create their own estimates"
  ON public.estimates FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own estimates"
  ON public.estimates FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own estimates"
  ON public.estimates FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for estimate_line_items
CREATE POLICY "Users can view line items of their estimates"
  ON public.estimate_line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.estimates
    WHERE estimates.id = estimate_line_items.estimate_id
    AND estimates.created_by = auth.uid()
  ));

CREATE POLICY "Users can create line items for their estimates"
  ON public.estimate_line_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.estimates
    WHERE estimates.id = estimate_line_items.estimate_id
    AND estimates.created_by = auth.uid()
  ));

CREATE POLICY "Users can update line items of their estimates"
  ON public.estimate_line_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.estimates
    WHERE estimates.id = estimate_line_items.estimate_id
    AND estimates.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete line items of their estimates"
  ON public.estimate_line_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.estimates
    WHERE estimates.id = estimate_line_items.estimate_id
    AND estimates.created_by = auth.uid()
  ));

-- RLS Policies for route_optimizations
CREATE POLICY "Users can view their own route optimizations"
  ON public.route_optimizations FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create their own route optimizations"
  ON public.route_optimizations FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own route optimizations"
  ON public.route_optimizations FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own route optimizations"
  ON public.route_optimizations FOR DELETE
  USING (created_by = auth.uid());

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_estimates_updated_at
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_route_optimizations_updated_at
  BEFORE UPDATE ON public.route_optimizations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();