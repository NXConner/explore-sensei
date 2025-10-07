-- Create employee_locations table for tracking
CREATE TABLE IF NOT EXISTS public.employee_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  accuracy NUMERIC,
  speed NUMERIC,
  heading NUMERIC,
  activity_type TEXT, -- driving, walking, stationary, etc.
  battery_level INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_locations ENABLE ROW LEVEL SECURITY;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_employee_locations_employee_timestamp 
ON public.employee_locations(employee_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_employee_locations_timestamp 
ON public.employee_locations(timestamp DESC);

-- RLS Policies
CREATE POLICY "Admins can view all locations"
ON public.employee_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('Super Administrator', 'Administrator')
  )
);

CREATE POLICY "Employees can insert own locations"
ON public.employee_locations
FOR INSERT
WITH CHECK (
  employee_id IN (
    SELECT id FROM public.employees
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Employees can view own locations"
ON public.employee_locations
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees
    WHERE user_id = auth.uid()
  )
);

-- Create daily_activity_summary table
CREATE TABLE IF NOT EXISTS public.daily_activity_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_distance_km NUMERIC,
  total_time_minutes INTEGER,
  first_location_time TIMESTAMPTZ,
  last_location_time TIMESTAMPTZ,
  locations_count INTEGER,
  jobs_visited INTEGER,
  path_geojson JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_activity_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_activity_summary
CREATE POLICY "Admins can manage activity summaries"
ON public.daily_activity_summary
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('Super Administrator', 'Administrator')
  )
);

CREATE POLICY "Employees can view own summaries"
ON public.daily_activity_summary
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM public.employees
    WHERE user_id = auth.uid()
  )
);

-- Create function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 NUMERIC, lon1 NUMERIC,
  lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  R CONSTANT NUMERIC := 6371; -- Earth's radius in km
  dLat NUMERIC;
  dLon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate daily summary
CREATE OR REPLACE FUNCTION generate_daily_summary(
  p_employee_id UUID,
  p_date DATE
) RETURNS void AS $$
DECLARE
  v_total_distance NUMERIC := 0;
  v_prev_lat NUMERIC;
  v_prev_lon NUMERIC;
  v_prev_time TIMESTAMPTZ;
  v_locations_count INTEGER;
  v_first_time TIMESTAMPTZ;
  v_last_time TIMESTAMPTZ;
  v_total_minutes INTEGER;
  loc RECORD;
BEGIN
  -- Get all locations for the day
  FOR loc IN 
    SELECT latitude, longitude, timestamp
    FROM public.employee_locations
    WHERE employee_id = p_employee_id
      AND DATE(timestamp) = p_date
    ORDER BY timestamp ASC
  LOOP
    IF v_prev_lat IS NOT NULL THEN
      v_total_distance := v_total_distance + 
        calculate_distance(v_prev_lat, v_prev_lon, loc.latitude, loc.longitude);
    ELSE
      v_first_time := loc.timestamp;
    END IF;
    
    v_prev_lat := loc.latitude;
    v_prev_lon := loc.longitude;
    v_prev_time := loc.timestamp;
    v_last_time := loc.timestamp;
  END LOOP;
  
  -- Get location count
  SELECT COUNT(*) INTO v_locations_count
  FROM public.employee_locations
  WHERE employee_id = p_employee_id
    AND DATE(timestamp) = p_date;
  
  -- Calculate total time
  v_total_minutes := EXTRACT(EPOCH FROM (v_last_time - v_first_time)) / 60;
  
  -- Insert or update summary
  INSERT INTO public.daily_activity_summary (
    employee_id, date, total_distance_km, total_time_minutes,
    first_location_time, last_location_time, locations_count
  ) VALUES (
    p_employee_id, p_date, v_total_distance, v_total_minutes,
    v_first_time, v_last_time, v_locations_count
  )
  ON CONFLICT (employee_id, date) 
  DO UPDATE SET
    total_distance_km = EXCLUDED.total_distance_km,
    total_time_minutes = EXCLUDED.total_time_minutes,
    first_location_time = EXCLUDED.first_location_time,
    last_location_time = EXCLUDED.last_location_time,
    locations_count = EXCLUDED.locations_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';