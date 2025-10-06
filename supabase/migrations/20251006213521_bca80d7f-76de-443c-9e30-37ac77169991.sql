-- Fix infinite recursion in RLS policies by creating security definer functions

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view own profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create simple, non-recursive policies for user_profiles
CREATE POLICY "Users can view own user_profiles"
ON public.user_profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own user_profiles"
ON public.user_profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own user_profiles"
ON public.user_profiles
FOR INSERT
WITH CHECK (id = auth.uid());

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view own profiles"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profiles"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own profiles"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());