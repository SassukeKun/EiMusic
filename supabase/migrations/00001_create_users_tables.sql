-- Criação das tabelas baseadas no diagrama ER
-- Executar como migration no Supabase

-- Tabela de Planos de Monetização
CREATE TABLE IF NOT EXISTS monetization_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  monetization_type VARCHAR(50) NOT NULL,
  platform_fee NUMERIC(5, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  payment_method VARCHAR(100),
  has_active_subscription BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Artistas
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  phone VARCHAR(50),
  monetization_plan_id UUID REFERENCES monetization_plans(id),
  profile_image_url TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Conteúdo
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  publication_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration INTEGER,
  file_url TEXT NOT NULL,
  artist_id UUID NOT NULL REFERENCES artists(id),
  monetization_plan_id UUID REFERENCES monetization_plans(id),
  tags TEXT[],
  piracy_protection BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Doações
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(10, 2) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  artist_id UUID NOT NULL REFERENCES artists(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  monetization_plan_id UUID NOT NULL REFERENCES monetization_plans(id),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Visualizações (histórico de visualizações de conteúdo)
CREATE TABLE IF NOT EXISTS views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  content_id UUID NOT NULL REFERENCES content(id),
  view_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  duration_watched INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  content_id UUID NOT NULL REFERENCES content(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  artist_id UUID NOT NULL REFERENCES artists(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Comunidades
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de relacionamento entre Artistas e Comunidades
CREATE TABLE IF NOT EXISTS artist_communities (
  artist_id UUID NOT NULL REFERENCES artists(id),
  community_id UUID NOT NULL REFERENCES communities(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (artist_id, community_id)
);

-- Função de gatilho para garantir que emails sejam únicos entre usuários e artistas
CREATE OR REPLACE FUNCTION check_unique_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    -- Verifica se o email já existe na outra tabela
    IF TG_TABLE_NAME = 'users' AND EXISTS (SELECT 1 FROM artists WHERE email = NEW.email AND id != NEW.id) THEN
      RAISE EXCEPTION 'Email já está sendo usado por um artista';
    ELSIF TG_TABLE_NAME = 'artists' AND EXISTS (SELECT 1 FROM users WHERE email = NEW.email AND id != NEW.id) THEN
      RAISE EXCEPTION 'Email já está sendo usado por um usuário';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gatilhos para verificação de email único
CREATE TRIGGER check_users_email
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION check_unique_email();

CREATE TRIGGER check_artists_email
BEFORE INSERT OR UPDATE ON artists
FOR EACH ROW EXECUTE FUNCTION check_unique_email();

-- Configurações de RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários (podem ver/editar apenas seus próprios dados)
CREATE POLICY users_select ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update ON users
  FOR UPDATE USING (auth.uid() = id);

-- Adiciona política de INSERT para users
CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para artistas (podem ver/editar apenas seus próprios dados)
CREATE POLICY artists_select ON artists
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY artists_update ON artists
  FOR UPDATE USING (auth.uid() = id);

-- Adiciona política de INSERT para artists
CREATE POLICY artists_insert ON artists
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para conteúdo
CREATE POLICY content_select ON content
  FOR SELECT USING (true); -- Todos podem ver o conteúdo

CREATE POLICY content_insert ON content
  FOR INSERT WITH CHECK (auth.uid() = artist_id); -- Apenas o artista pode inserir

CREATE POLICY content_update ON content
  FOR UPDATE USING (auth.uid() = artist_id); -- Apenas o artista pode atualizar

CREATE POLICY content_delete ON content
  FOR DELETE USING (auth.uid() = artist_id); -- Apenas o artista pode excluir 