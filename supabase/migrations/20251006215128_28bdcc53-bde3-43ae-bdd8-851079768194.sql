-- Update job_photos table to add missing columns
ALTER TABLE public.job_photos 
ADD COLUMN IF NOT EXISTS file_path text,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS photo_type text DEFAULT 'progress',
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS taken_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_job_photos_job_id ON public.job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_employee_id ON public.job_photos(employee_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_taken_at ON public.job_photos(taken_at);
CREATE INDEX IF NOT EXISTS idx_job_photos_type ON public.job_photos(photo_type);