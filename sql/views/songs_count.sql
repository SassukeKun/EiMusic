CREATE OR REPLACE VIEW artist_songs_count 
WITH (security_invoker=on) AS
SELECT 
    a.id as artist_id,
    (
        SELECT COUNT(*)
        FROM singles s
        WHERE s.artist_id = a.id
    ) as singles_count,
    (
        SELECT COUNT(*)
        FROM tracks t
        WHERE t.artist_id = a.id
    ) as tracks_count,
    (
        (SELECT COUNT(*) FROM singles s WHERE s.artist_id = a.id) + 
        (SELECT COUNT(*) FROM tracks t WHERE t.artist_id = a.id)
    ) as total_songs_count
FROM artists a;
