-- 00017_event_attendees_and_functions.sql
-- Tabela de participantes de eventos e função utilitária de limite de doações para usuários Free.

------------------------------------------------------------
-- 1. event_attendees (relaciona usuários e eventos)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS attendee_select ON event_attendees FOR SELECT USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS attendee_insert ON event_attendees FOR INSERT WITH CHECK (user_id = auth.uid());

------------------------------------------------------------
-- 2. Função assert_free_user_donation_limit
------------------------------------------------------------
CREATE OR REPLACE FUNCTION assert_free_user_donation_limit(p_user_id UUID, p_artist_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
DECLARE
  total_month NUMERIC := 0;
  first_month TIMESTAMPTZ := date_trunc('month', now());
BEGIN
  SELECT COALESCE(SUM(amount),0) INTO total_month
  FROM donations
  WHERE user_id = p_user_id
    AND artist_id = p_artist_id
    AND created_at >= first_month;

  IF total_month + p_amount > 50 THEN
    RAISE EXCEPTION 'Limite mensal de 50 MT para usuários Free excedido';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
