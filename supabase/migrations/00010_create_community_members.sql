-- Migration 00010: Create community_members table with RLS

-- Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (community_id, user_id)
);

-- Add comment on role column
COMMENT ON COLUMN community_members.role IS 'User role in the community: admin, moderator, or member';

-- 1) Back-fill any existing NULL roles as "member"
UPDATE community_members
SET role = 'member'
WHERE role IS NULL;

-- 2) Change the DEFAULT so future inserts without a specified role become "member"
ALTER TABLE community_members
ALTER COLUMN role SET DEFAULT 'member';

-- Enable Row Level Security
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read community members
CREATE POLICY "community_members_select" ON community_members
  FOR SELECT USING (true);

-- Policy: Users can join public communities
CREATE POLICY "community_members_join_public" ON community_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM communities 
      WHERE id = community_members.community_id 
      AND access_type = 'public'
    )
    AND user_id = auth.uid()
  );

-- Policy: Community admins can add members
CREATE POLICY "community_members_add_by_admin" ON community_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_members.community_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Users can leave communities
CREATE POLICY "community_members_leave" ON community_members
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Policy: Community admins can remove members
CREATE POLICY "community_members_remove_by_admin" ON community_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_members.community_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Policy: Community admins can update member roles
CREATE POLICY "community_members_update_by_admin" ON community_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_members.community_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );
