-- Drop existing policies first
DROP POLICY IF EXISTS insert_artist_policy ON public.artists;
DROP POLICY IF EXISTS users_insert ON public.users;

-- Create new policies for artists table
CREATE POLICY "Artists can insert their own profile"
ON public.artists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create new policies for users table
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add update policies for both tables
CREATE POLICY "Artists can update their own profile"
ON public.artists
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);
