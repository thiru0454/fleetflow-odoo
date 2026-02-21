## SQL Setup Instructions for Role Selection

### Issue:
The role selection modal appears every time you login because the database table doesn't have the `confirmed_by_user` column to track whether the user has already selected their role.

### Solution:

1. **Go to Supabase Dashboard**
   - Navigate to your FleetFlow project
   - Click on "SQL Editor" (left sidebar)

2. **Copy and paste the entire SQL from SQL_SETUP.sql file**
   - All 4 queries should be executed in order

3. **Run Each Query:**
   
   **Query 1:** Add the confirmed_by_user column
   ```sql
   ALTER TABLE user_roles 
   ADD COLUMN IF NOT EXISTS confirmed_by_user BOOLEAN DEFAULT false;
   ```

   **Query 2:** Mark all existing users as already confirmed (they won't see modal)
   ```sql
   UPDATE user_roles 
   SET confirmed_by_user = true 
   WHERE confirmed_by_user = false OR confirmed_by_user IS NULL;
   ```

   **Query 3:** Verify the table structure
   ```sql
   SELECT * FROM user_roles LIMIT 5;
   ```

   **Query 4:** Create trigger for new OAuth users (optional but recommended)
   ```sql
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

   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

### How It Works After Setup:

✅ **First Time Google OAuth Login:**
- User sees role selection modal
- Selects role → `confirmed_by_user = true` saved
- Next login → **NO modal**, goes straight to dashboard

✅ **First Time Email/Password Registration:**
- User selects role during registration
- Role saved with `confirmed_by_user = true`
- **Never sees modal again**

✅ **Existing Users:**
- All marked as `confirmed_by_user = true`
- Won't see modal anymore

### Test It:
1. Run the SQL setup in Supabase
2. Log out of the app
3. Log in again
4. **Should NOT see role selection modal** (goes straight to dashboard)
5. Log out and do it again - consistent behavior
