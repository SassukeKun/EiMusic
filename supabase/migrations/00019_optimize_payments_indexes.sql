-- 00019_optimize_payments_indexes.sql
-- Ajustes pós-integração Mpesa / e2Payments

------------------------------------------------------------
-- 1. Índices adicionais para performance
------------------------------------------------------------
CREATE INDEX IF NOT EXISTS payments_status_idx  ON payments(status);
CREATE INDEX IF NOT EXISTS payments_artist_idx  ON payments(artist_id);

------------------------------------------------------------
-- 2. Unicidade de referências externas
------------------------------------------------------------
-- external_id (e2payments payment id) deve ser único quando não nulo
CREATE UNIQUE INDEX IF NOT EXISTS payments_external_id_uq ON payments(external_id) WHERE external_id IS NOT NULL;

-- mpesa_reference (transactionId Vodacom) também deve ser único quando não nulo
CREATE UNIQUE INDEX IF NOT EXISTS payments_mpesa_ref_uq ON payments(mpesa_reference) WHERE mpesa_reference IS NOT NULL;

------------------------------------------------------------
-- 3. Política RLS para artistas visualizarem pagamentos de seus conteúdos
------------------------------------------------------------
DROP POLICY IF EXISTS payments_select_artist ON payments;
CREATE POLICY payments_select_artist ON payments
  FOR SELECT USING (artist_id = auth.uid());

-- Observação: service_role continua a ter bypass RLS.
