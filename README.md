# Music Streaming Platform

Plataforma de streaming de música com autenticação via Supabase e OAuth, seguindo arquitetura MVC.

## Configuração do Projeto

### Pré-requisitos
- Node.js 14.x ou superior
- Conta no Supabase (https://supabase.com)
- Projeto criado no Google Cloud Console para autenticação OAuth

### Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd em
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
NEXTAUTH_SECRET=uma-string-secreta-para-o-nextauth
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=seu-client-id-do-google
GOOGLE_CLIENT_SECRET=seu-client-secret-do-google
```

### Configuração do Supabase

1. **Tabelas do Banco de Dados:**
   - Execute as migrações SQL localizadas em `/supabase/migrations`:
     - `00001_create_users_tables.sql` - Cria as tabelas principais
     - `00002_seed_monetization_plans.sql` - Popula os planos de monetização iniciais

2. **Configuração de Autenticação:**
   - No painel do Supabase, vá para **Authentication** > **Providers**
   - Habilite **Email** para autenticação com email/senha
   - Habilite **Google** e configure com as credenciais do Google Cloud Console

3. **Configuração do OAuth com Google:**
   - No Google Cloud Console:
     - Crie um projeto (ou use um existente)
     - Configure a tela de consentimento OAuth
     - Crie credenciais OAuth 2.0
     - Adicione seu domínio aos domínios autorizados
     - Adicione a URL de redirecionamento do Supabase (https://[seu-projeto].supabase.co/auth/v1/callback)

## Estrutura do Projeto

```
/
├── app/                    # Páginas e componentes da aplicação
│   ├── api/                # Rotas de API
│   ├── login/              # Página de login
│   └── ...
├── components/             # Componentes React reutilizáveis
├── hooks/                  # Custom hooks (useAuth, etc.)
├── models/                 # Modelos de dados e esquemas de validação
├── services/               # Serviços para lógica de negócios
├── utils/                  # Utilitários e helpers
└── supabase/               # Migrações e configurações do Supabase
    └── migrations/         # Arquivos SQL de migração
```

## Modelos de Dados

O projeto implementa os seguintes modelos principais:

- **User**: Usuário regular do sistema
- **Artist**: Artista que publica conteúdo
- **MonetizationPlan**: Planos de monetização disponíveis
- **Content**: Conteúdo publicado por artistas

## Autenticação

O sistema suporta:

1. **Autenticação por Email/Senha** para usuários e artistas
2. **Autenticação OAuth com Google**
3. **Verificação de tipo de usuário** (artista ou usuário regular)

## Executando o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`
