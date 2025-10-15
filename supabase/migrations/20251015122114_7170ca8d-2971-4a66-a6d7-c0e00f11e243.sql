-- =========================================
-- CRITICAL SECURITY FIX #1: Employee Status RLS
-- =========================================

ALTER TABLE public.employee_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all employee status"
ON public.employee_status FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND role IN ('Super Administrator', 'Administrator')
  )
);

CREATE POLICY "Users can view own status"
ON public.employee_status FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update own status"
ON public.employee_status FOR UPDATE
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own status"
ON public.employee_status FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

-- =========================================
-- CRITICAL SECURITY FIX #2: Profiles Table RLS  
-- =========================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND role IN ('Super Administrator', 'Administrator')
  )
);

-- =========================================
-- HIGH PRIORITY FIX #3: Employees Table RLS
-- =========================================

DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Users can view employees" ON public.employees;

CREATE POLICY "Admins manage all employees"
ON public.employees FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND role IN ('Super Administrator', 'Administrator', 'Field Crew Lead')
  )
);

CREATE POLICY "Employees view own record"
ON public.employees FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Employees update own record"
ON public.employees FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());