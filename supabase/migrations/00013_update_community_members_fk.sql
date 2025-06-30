-- Migration 00013: Update community_members table to reference artists instead of users

-- 1. Drop existing foreign key constraint
ALTER TABLE community_members
DROP CONSTRAINT IF EXISTS community_members_user_id_fkey;

-- 2. Add new foreign key constraint to reference artists
ALTER TABLE community_members
ADD CONSTRAINT community_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES artists(id) ON DELETE CASCADE;

-- 3. Update the trigger function to use artist_id instead of user_id
CREATE OR REPLACE FUNCTION add_artist_as_admin_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the artist as a member with admin role
    INSERT INTO community_members (community_id, user_id, joined_at, "role")
    VALUES (NEW.id, NEW.artist_id, NOW(), 'admin')
    ON CONFLICT (community_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Update existing records to use artist_id instead of user_id
UPDATE community_members cm
SET user_id = a.id
FROM artists a
WHERE cm.user_id = a.id;

-- 5. Verify the update
SELECT COUNT(*) 
FROM community_members cm
LEFT JOIN artists a ON cm.user_id = a.id
WHERE a.id IS NULL;
