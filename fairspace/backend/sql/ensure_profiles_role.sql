-- Ensure `role` column and constraint exist on public.profiles
-- This script is safe to run multiple times (uses IF NOT EXISTS patterns)

-- Add the column if it's missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;

-- Set a sensible default for new rows
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student';

-- Populate existing NULLs (if any)
UPDATE public.profiles SET role = 'student' WHERE role IS NULL;

-- Make column NOT NULL now that rows have a value
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- Add a check constraint if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (''student'',''admin'',''recruiter''))';
  END IF;
END;
$$;
