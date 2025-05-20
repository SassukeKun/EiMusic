-- Policies for artists table
DROP POLICY IF EXISTS "insert_artist_policy" ON "public"."artists";
DROP POLICY IF EXISTS "update_artist_policy" ON "public"."artists";
DROP POLICY IF EXISTS "select_artist_policy" ON "public"."artists";

-- Only allow inserts for users with is_artist flag
CREATE POLICY "insert_artist_policy" ON "public"."artists"
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id 
  AND 
  (auth.jwt() -> 'user_metadata' ->> 'is_artist')::boolean IS TRUE
);

-- Allow artists to update only their own records
CREATE POLICY "update_artist_policy" ON "public"."artists"
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND
  (auth.jwt() -> 'user_metadata' ->> 'is_artist')::boolean IS TRUE
);

-- Allow artists to read only their own records
CREATE POLICY "select_artist_policy" ON "public"."artists"
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR
  (auth.jwt() -> 'user_metadata' ->> 'is_artist')::boolean IS TRUE
);

-- Policies for users table
DROP POLICY IF EXISTS "users_insert" ON "public"."users";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."users";
DROP POLICY IF EXISTS "update_user_policy" ON "public"."users";
DROP POLICY IF EXISTS "select_user_policy" ON "public"."users";

-- Only allow inserts for users without is_artist flag
CREATE POLICY "users_insert" ON "public"."users"
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id 
  AND 
  ((auth.jwt() -> 'user_metadata' ->> 'is_artist')::boolean IS NOT TRUE OR
   (auth.jwt() -> 'user_metadata' ->> 'is_artist') IS NULL)
);

-- Allow users to update only their own records
CREATE POLICY "update_user_policy" ON "public"."users"
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND
  ((auth.jwt() -> 'user_metadata' ->> 'is_artist')::boolean IS NOT TRUE OR
   (auth.jwt() -> 'user_metadata' ->> 'is_artist') IS NULL)
);

-- Allow users to read only their own records
CREATE POLICY "select_user_policy" ON "public"."users"
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR
  ((auth.jwt() -> 'user_metadata' ->> 'is_artist')::boolean IS NOT TRUE OR
   (auth.jwt() -> 'user_metadata' ->> 'is_artist') IS NULL)
); 