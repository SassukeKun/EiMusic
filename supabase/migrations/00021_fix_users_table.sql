-- Drop duplicate created_at column
ALTER TABLE users 
DROP COLUMN IF EXISTS created_at_2;

-- Rename the existing created_at column to created_at_2
ALTER TABLE users 
RENAME COLUMN created_at TO created_at_2;

-- Add proper created_at column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;

-- Update the created_at column with data from created_at_2
UPDATE users 
SET created_at = created_at_2 
WHERE created_at_2 IS NOT NULL;

-- Drop the temporary column
ALTER TABLE users 
DROP COLUMN created_at_2;

-- Ensure the column is not nullable
ALTER TABLE users 
ALTER COLUMN created_at SET NOT NULL;

-- Add default value for new rows
ALTER TABLE users 
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
