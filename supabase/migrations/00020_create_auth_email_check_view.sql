-- Create a view to check if an email exists in users or artists tables
CREATE OR REPLACE VIEW auth_email_check_view AS
SELECT 
    u.email,
    EXISTS (
        SELECT 1 FROM artist a WHERE a.id = u.id
    ) as is_artist
FROM auth.users u
WHERE u.email IS NOT NULL;

-- Grant SELECT permission on the view to the authenticated role
GRANT SELECT ON auth_email_check_view TO authenticated;
