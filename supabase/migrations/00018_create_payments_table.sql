-- 00018_create_payments_table.sql
-- Tabela para registrar pagamentos processados via Mpesa (e2payments)

------------------------------------------------------------
-- 1. Enum de status de pagamento
------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING','COMPLETED','FAILED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

------------------------------------------------------------
-- 2. payments table
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id       UUID REFERENCES artists(id) ON DELETE SET NULL,
  source_type     revenue_source_type NOT NULL,     -- subscription, donation, event, community
  source_id       UUID,                             -- id da subscription / donation / event etc.
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  provider        TEXT NOT NULL DEFAULT 'mpesa',
  mpesa_reference TEXT,                             -- referência/transactionId da Vodacom
  status          payment_status NOT NULL DEFAULT 'PENDING',
  external_id     TEXT,                             -- id gerado pela e2payments
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_source_idx ON payments(source_type, source_id);

------------------------------------------------------------
-- 3. Trigger para updated_at
------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_payments_ts() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_payments_ts ON payments;
CREATE TRIGGER trg_update_payments_ts
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION fn_update_payments_ts();

------------------------------------------------------------
-- 4. RLS policies
------------------------------------------------------------
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY payments_select ON payments
  FOR SELECT USING (user_id = auth.uid());

-- Inserts via backend (service key) somente
CREATE POLICY payments_insert_backend ON payments
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Updates: backend/webhook
CREATE POLICY payments_update_backend ON payments
  FOR UPDATE USING (auth.role() = 'service_role');
