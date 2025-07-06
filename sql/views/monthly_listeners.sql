-- Create the view with security_invoker=on
CREATE OR REPLACE VIEW artist_monthly_metrics WITH (security_invoker=on) AS
WITH artist_metrics AS (
    SELECT 
        a.id as artist_id,
        (
            SELECT COALESCE(SUM(s.streams), 0)
            FROM singles s
            WHERE s.artist_id = a.id
            AND s.created_at >= NOW() - INTERVAL '30 days'
        ) as monthly_singles_streams,
        (
            SELECT COALESCE(SUM(t.streams), 0)
            FROM tracks t
            WHERE t.artist_id = a.id
            AND t.created_at >= NOW() - INTERVAL '30 days'
        ) as monthly_tracks_streams,
        (
            SELECT COALESCE(SUM(v.views), 0)
            FROM videos v
            WHERE v.artist_id = a.id
            AND v.created_at >= NOW() - INTERVAL '30 days'
        ) as monthly_video_views
    FROM artists a
)
SELECT
    artist_id,
    monthly_singles_streams,
    monthly_tracks_streams,
    monthly_video_views,
    (monthly_singles_streams + monthly_tracks_streams + monthly_video_views) as monthly_listeners
FROM artist_metrics;