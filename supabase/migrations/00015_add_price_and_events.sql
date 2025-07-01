-- 00015_add_price_and_events.sql
-- 1. Expande communities, cria events, adiciona flag em users, cria trigger para manter flag, e define RLS

------------------------------------------------------------
-- 1. Expandir enum e coluna em communities
------------------------------------------------------------
DO $$ BEGIN
  -- Adiciona valores 'premium' e 'vip' ao enum se não existirem
  IF NOT EXISTS (SELECT 1 FROM pg_type t
                  JOIN pg_enum e ON t.oid = e.enumtypid
                  WHERE t.typname = 'community_access_type'
                    AND e.enumlabel = 'premium') THEN
    ALTER TYPE community_access_type ADD VALUE 'premium';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t
                  JOIN pg_enum e ON t.oid = e.enumtypid
                  WHERE t.typname = 'community_access_type'
                    AND e.enumlabel = 'vip') THEN
    ALTER TYPE community_access_type ADD VALUE 'vip';
  END IF;
END$$;

-- Adiciona coluna price
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) CHECK (price >= 0) DEFAULT 0;

------------------------------------------------------------
-- 2. Adicionar coluna has_active_subscription em users
------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS has_active_subscription BOOLEAN NOT NULL DEFAULT FALSE;

------------------------------------------------------------
-- 3. Criar tabela events
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id     UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  event_type    VARCHAR(50)  NOT NULL,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  description   TEXT,
  start_time    TIMESTAMPTZ NOT NULL,
  capacity      INTEGER CHECK (capacity >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

------------------------------------------------------------
-- 4. Trigger para manter users.has_active_subscription
------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_user_subscription_flag() RETURNS TRIGGER AS $$
BEGIN
  -- Obtém o user_id afetado
  PERFORM 1;
  IF (TG_OP = 'DELETE') THEN
    -- OLD está definido
    UPDATE users u
      SET has_active_subscription = EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = OLD.user_id AND s.is_active = TRUE
      )
    WHERE u.id = OLD.user_id;
  ELSE
    -- INSERT ou UPDATE
    UPDATE users u
      SET has_active_subscription = EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = NEW.user_id AND s.is_active = TRUE
      )
    WHERE u.id = NEW.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_user_subscription_flag ON subscriptions;
CREATE TRIGGER trg_set_user_subscription_flag
AFTER INSERT OR UPDATE OR DELETE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_user_subscription_flag();

------------------------------------------------------------
-- 5. RLS Policies ------------------------------------------------
------------------------------------------------------------

-- Subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS sub_select ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS sub_insert ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS sub_update ON subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS sub_delete ON subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS don_select ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS don_insert ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS events_select ON events FOR SELECT USING (TRUE);
CREATE POLICY IF NOT EXISTS events_insert ON events FOR INSERT WITH CHECK (artist_id = auth.uid());
CREATE POLICY IF NOT EXISTS events_update ON events FOR UPDATE USING (artist_id = auth.uid());
CREATE POLICY IF NOT EXISTS events_delete ON events FOR DELETE USING (artist_id = auth.uid());

