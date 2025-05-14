// Row Level Security Setup Instructions

# Row Level Security (RLS) Setup for Supabase

## Issue
The error `new row violates row-level security policy for table "users"` indicates that your application doesn't have permission to insert records into the `users` table due to Row Level Security (RLS) policies in Supabase.

## Solution

### Option 1: Modify RLS Policies in Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Select your project
3. Go to the "Table Editor" in the left sidebar
4. Select the `users` table (and later do the same for `artists` table)
5. Click on "Authentication" tab and then "Policies"
6. Create these policies:

#### For Users Table

**Enable insertion for authenticated users:**
- Policy name: `Enable insert for authenticated users`
- Operation: `INSERT`
- Target roles: `authenticated`
- Using expression: `auth.uid() = id`
- With check expression: `auth.uid() = id`

**Enable users to update their own data:**
- Policy name: `Enable update for users based on user_id`
- Operation: `UPDATE`
- Target roles: `authenticated`
- Using expression: `auth.uid() = id`

**Enable users to read their own data:**
- Policy name: `Enable read access for users based on user_id`
- Operation: `SELECT`
- Target roles: `authenticated`
- Using expression: `auth.uid() = id`

#### For Artists Table

Apply the same policies for the `artists` table.

### Option 2: Execute SQL to Set Up Policies

Alternatively, you can execute the following SQL in the Supabase SQL Editor:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for inserting users 
CREATE POLICY insert_user_policy ON users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Policy for users to read their own data
CREATE POLICY select_user_policy ON users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY update_user_policy ON users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Do the same for artists table
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_artist_policy ON artists 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY select_artist_policy ON artists 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY update_artist_policy ON artists 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);
```

### Option 3: Temporary Bypass (Not recommended for production)

If you're still in development and want to temporarily disable RLS for testing:

```sql
-- Disable RLS on users table (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;
```

## Additional Notes

1. Make sure the `id` field in your users/artists tables matches the UUID from Supabase Auth.
2. You might also need to grant proper permissions to the anon/authenticated roles.
3. After setting these policies, try registering a user again.
