-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own data
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy for users to insert their own data
CREATE POLICY "Users can insert their own data"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Enable RLS on the artists table
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Policy for artists to view their own data
CREATE POLICY "Artists can view their own data"
    ON artists FOR SELECT
    USING (auth.uid() = id);

-- Policy for artists to update their own data
CREATE POLICY "Artists can update their own data"
    ON artists FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy for artists to insert their own data
CREATE POLICY "Artists can insert their own data"
    ON artists FOR INSERT
    WITH CHECK (auth.uid() = id);
