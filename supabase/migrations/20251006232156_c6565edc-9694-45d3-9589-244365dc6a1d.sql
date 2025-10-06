-- Create trigger function to automatically assign role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign Super Administrator role to n8ter8@gmail.com
  IF NEW.email = 'n8ter8@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'Super Administrator');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to fire after user creation
DROP TRIGGER IF EXISTS on_auth_user_role_created ON auth.users;
CREATE TRIGGER on_auth_user_role_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();