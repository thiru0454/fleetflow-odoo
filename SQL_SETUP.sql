-- Run this SQL in Supabase to set up the role confirmation system
-- This will ensure role selection only happens ONCE on first login

-- 1. Add the confirmed_by_user column if it doesn't exist
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS confirmed_by_user BOOLEAN DEFAULT false;

-- 2. Update existing records to mark them as confirmed (so they don't get the modal)
UPDATE user_roles 
SET confirmed_by_user = true 
WHERE confirmed_by_user = false OR confirmed_by_user IS NULL;

-- 3. View the updated table structure to verify
SELECT * FROM user_roles LIMIT 5;

-- 4. Optional: Add a trigger to automatically set confirmed_by_user = true for new OAuth users on first role creation
-- This ensures any auto-created roles are NOT marked as confirmed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, confirmed_by_user)
  VALUES (NEW.id, 'fleet_manager', false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
