-- Fix security issue: Add SET search_path to SECURITY DEFINER functions
-- This prevents privilege escalation via schema manipulation attacks

-- Fix notify_violation trigger function
ALTER FUNCTION public.notify_violation() SET search_path = public;

-- Fix update_created_at trigger function
ALTER FUNCTION public.update_created_at() SET search_path = public;

-- Add documentation comments
COMMENT ON FUNCTION public.notify_violation() IS 'Notification trigger for violations. SECURITY DEFINER with SET search_path for security.';
COMMENT ON FUNCTION public.update_created_at() IS 'Auto-update created_at timestamp. SECURITY DEFINER with SET search_path for security.';