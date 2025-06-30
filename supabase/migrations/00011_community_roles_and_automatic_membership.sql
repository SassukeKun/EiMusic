-- This migration ensures:
-- 1. The 'role' column in community_members has a default value of 'member'
-- 2. Any NULL roles are backfilled as 'member'
-- 3. The creator of the community is automatically added as an 'admin' member

-- 1) Back-fill any existing NULL roles as "member"
UPDATE community_members
SET role = 'member'
WHERE role IS NULL;

-- 2) Change the DEFAULT so future inserts without a specified role become "member"
ALTER TABLE community_members
ALTER COLUMN role SET DEFAULT 'member';

-- 3) Create a trigger to automatically add the artist as an admin member when creating a community
CREATE OR REPLACE FUNCTION add_artist_as_admin_member()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the artist as a member with admin role
    INSERT INTO community_members (community_id, user_id, joined_at, role)
    VALUES (NEW.id, NEW.artist_id, NOW(), 'admin')
    ON CONFLICT (community_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS community_artist_member_trigger ON communities;

-- Create the trigger
CREATE TRIGGER community_artist_member_trigger
AFTER INSERT ON communities
FOR EACH ROW
EXECUTE FUNCTION add_artist_as_admin_member();

-- 4) Ensure the community_members table has the necessary columns and constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'community_members' AND column_name = 'role') THEN
        ALTER TABLE community_members ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
    END IF;
END $$;

-- 5) Backfill any existing communities to ensure creators are admins
INSERT INTO community_members (community_id, user_id, joined_at, role)
SELECT c.id, c.artist_id, NOW(), 'admin'
FROM communities c
WHERE c.artist_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM community_members cm 
    WHERE cm.community_id = c.id AND cm.user_id = c.artist_id
  )
ON CONFLICT (community_id, user_id) DO 
  UPDATE SET role = 'admin' WHERE community_members.role != 'admin';

-- First, drop any existing check constraint if it exists
ALTER TABLE community_members 
DROP CONSTRAINT IF EXISTS community_members_role_check;

-- Add the check constraint for allowed roles
ALTER TABLE community_members
ADD CONSTRAINT community_members_role_check
CHECK (role IN ('admin', 'moderator', 'member'));
