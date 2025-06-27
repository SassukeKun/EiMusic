-- Migration 00012: Update role check constraint to allow valid roles

-- First drop the existing constraint if it exists
ALTER TABLE community_members
DROP CONSTRAINT IF EXISTS community_members_role_check;

-- Add the new constraint that allows valid roles
ALTER TABLE community_members
ADD CONSTRAINT community_members_role_check
CHECK ("role" IN ('admin', 'member'));

-- Ensure all existing rows comply with the constraint
UPDATE community_members
SET "role" = 'member'
WHERE role NOT IN ('admin', 'member');

-- Verify constraint
SELECT "role", COUNT(*)
FROM community_members
GROUP BY "role";
