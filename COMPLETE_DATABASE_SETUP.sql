-- 1. Create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'fleet_manager',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Ensure confirmed_by_user column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='confirmed_by_user') THEN
        ALTER TABLE public.user_roles ADD COLUMN confirmed_by_user BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
CREATE POLICY "Users can update their own roles" 
ON public.user_roles FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Create the handle_new_user function
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

-- 5. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant permissions
GRANT ALL ON public.user_roles TO postgres;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO anon;
