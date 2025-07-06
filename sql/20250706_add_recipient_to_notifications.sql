-- Adiciona coluna recipient_id à tabela notifications
-- Executar via Supabase SQL editor ou migration tool

-- 1. Adicionar coluna como NULLABLE para não quebrar inserts existentes
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_id uuid;

-- 2. Preencher recipient_id para registros antigos (opcional – aqui copia artist_id quando existir)
-- UPDATE notifications SET recipient_id = artist_id WHERE recipient_id IS NULL AND artist_id IS NOT NULL;

-- 3. Definir restrição NOT NULL e FK (somente após garantir que não há NULL)
ALTER TABLE notifications
  ALTER COLUMN recipient_id SET NOT NULL,
  ADD CONSTRAINT notifications_recipient_fk FOREIGN KEY (recipient_id) REFERENCES artists(id);
