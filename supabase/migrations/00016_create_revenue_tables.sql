-- 00016_create_revenue_tables.sql
-- Tabelas e funções para cálculo e distribuição semanal de receita

------------------------------------------------------------
-- 1. Enum helper para fonte de receita
------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE revenue_source_type AS ENUM ('subscription','donation','event','community');
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

------------------------------------------------------------
-- 2. revenue_transactions – registro bruto de entradas já splitadas por artista
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS revenue_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id     UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  source_type   revenue_source_type NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

------------------------------------------------------------
-- 3. artist_balances – saldo acumulado aguardando payout
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS artist_balances (
  artist_id     UUID PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  balance       NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_payout   TIMESTAMPTZ
);

------------------------------------------------------------
-- 4. Função para atualizar saldo ao inserir transação
------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_artist_balance() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO artist_balances (artist_id, balance)
    VALUES (NEW.artist_id, NEW.amount)
  ON CONFLICT (artist_id) DO UPDATE
    SET balance = artist_balances.balance + NEW.amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_artist_balance ON revenue_transactions;
CREATE TRIGGER trg_update_artist_balance
AFTER INSERT ON revenue_transactions
FOR EACH ROW EXECUTE FUNCTION fn_update_artist_balance();

------------------------------------------------------------
-- 5. Procedimento process_weekly_revenue – transfere se saldo >= 100MT
------------------------------------------------------------
CREATE OR REPLACE FUNCTION process_weekly_revenue()
RETURNS VOID AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT artist_id, balance FROM artist_balances WHERE balance >= 100 LOOP
    -- Aqui inserir lógica real de payout (ex.: chamada API mobile money)
    RAISE NOTICE 'Paying out % MT to artist %', r.balance, r.artist_id;
    UPDATE artist_balances SET balance = 0, last_payout = now() WHERE artist_id = r.artist_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

------------------------------------------------------------
-- 6. RLS para artist_balances e revenue_transactions
------------------------------------------------------------
ALTER TABLE artist_balances       ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_transactions  ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS bal_select ON artist_balances
  FOR SELECT USING (artist_id = auth.uid());

CREATE POLICY IF NOT EXISTS rev_select ON revenue_transactions
  FOR SELECT USING (artist_id = auth.uid());
-- Inserções vêm via aplicativo backend (service key) ou RPC
