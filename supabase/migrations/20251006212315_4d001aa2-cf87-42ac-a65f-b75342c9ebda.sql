-- Add missing columns to jobs table for map display
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_jobs_coordinates ON public.jobs(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Fix RLS policies to avoid recursion on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (id = auth.uid());

-- Fix RLS policies to avoid recursion on profiles (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    
    CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (id = auth.uid());
    
    CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid());
  END IF;
END $$;