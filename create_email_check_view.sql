-- Create a view to check if email exists in any table
CREATE OR REPLACE VIEW auth_email_check_view AS
SELECT 
  au.email,
  COALESCE(u.id IS NOT NULL, false) as is_user,
  COALESCE(a.id IS NOT NULL, false) as is_artist,
  COALESCE(au.raw_user_meta_data->>'is_artist', 'false')::boolean as is_artist_from_metadata
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
LEFT JOIN public.artists a ON au.id = a.id;

-- Grant permissions
GRANT SELECT ON auth_email_check_view TO public; 