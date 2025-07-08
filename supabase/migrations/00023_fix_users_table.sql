-- Fix duplicate columns in users table
ALTER TABLE users 
DROP COLUMN IF EXISTS created_at_2;

-- Drop the duplicate email column
ALTER TABLE users 
DROP COLUMN IF EXISTS email_2;

-- Ensure email is unique
ALTER TABLE users 
ADD CONSTRAINT unique_email UNIQUE (email);

-- Add proper RLS policies for users table
DROP POLICY IF EXISTS users_insert ON public.users;
DROP POLICY IF EXISTS users_select ON public.users;

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Add default values for required columns
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN verified SET DEFAULT false,
ALTER COLUMN subscribers SET DEFAULT 0;
