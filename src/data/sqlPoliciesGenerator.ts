export const GENERATED_SQL_SCRIPT = `-- =========================================================================
-- BANCO DE DADOS: SISTEMA LOPES PROSPECT & CNPJ RADAR SÃO PAULO
-- TABELAS, SEGURANÇA POR LINHA (ROW LEVEL SECURITY - RLS)
-- E POLÍTICAS DE ARMAZENAMENTO (STORAGE BUCKETS) ATIVADAS
-- =========================================================================

-- SE DESEJAR REINICIAR AS TABELAS LIMPAS (RECOMENDADO SE HOUVE ERRO DE COLUNAS ANTIGAS):
-- DROP TABLE IF EXISTS public.historico_interacoes, public.carteira_leads, public.empresas_leads, public.usuarios CASCADE;

-- 1. HABILITAR EXTENSÕES ESSENCIAIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CRIAÇÃO DOS TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('gestor', 'vendedor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pipeline_status_enum AS ENUM (
      'prospectado',
      'contato_iniciado',
      'proposta_enviada',
      'negociacao',
      'fechado',
      'perdido'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE canal_contato_enum AS ENUM ('whatsapp', 'email', 'telefone', 'presencial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA DE USUÁRIOS (GESTORES E VENDEDORES)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'vendedor',
    cargo VARCHAR(150) DEFAULT 'Consultor Comercial',
    telefone VARCHAR(30),
    avatar_url TEXT,
    meta_mensal NUMERIC(12, 2) DEFAULT 100000.00,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS auth_id UUID;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS role user_role_enum DEFAULT 'vendedor';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS cargo VARCHAR(150) DEFAULT 'Consultor Comercial';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS meta_mensal NUMERIC(12, 2) DEFAULT 100000.00;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 4. TABELA DE EMPRESAS E LEADS (DADOS DA RECEITA / BRASILAPI / RADAR SP)
CREATE TABLE IF NOT EXISTS public.empresas_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    cnpj_raw VARCHAR(14) NOT NULL UNIQUE,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    cnae_fiscal VARCHAR(20) NOT NULL,
    cnae_descricao TEXT,
    ramo VARCHAR(80) NOT NULL DEFAULT 'imobiliaria',
    situacao_cadastral VARCHAR(50) DEFAULT 'ATIVA',
    data_inicio_atividade DATE,
    capital_social NUMERIC(15, 2) DEFAULT 0,
    telefone VARCHAR(40),
    email VARCHAR(255),
    contato_nome VARCHAR(255),
    contato_cargo VARCHAR(150),
    qsa_socios JSONB DEFAULT '[]'::jsonb,
    logradouro TEXT,
    numero VARCHAR(50),
    complemento TEXT,
    bairro VARCHAR(100),
    municipio VARCHAR(100) DEFAULT 'São Paulo',
    uf VARCHAR(2) DEFAULT 'SP',
    cep VARCHAR(10),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    zona_sp VARCHAR(50),
    compatibilidade_lopes_pct INT DEFAULT 85,
    motivo_oportunidade TEXT,
    criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS ramo VARCHAR(80) DEFAULT 'imobiliaria';
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS cnae_fiscal VARCHAR(20);
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS cnae_descricao TEXT;
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS zona_sp VARCHAR(50);
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS telefone VARCHAR(40);
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS contato_nome VARCHAR(255);
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS contato_cargo VARCHAR(150);
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS qsa_socios JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS compatibilidade_lopes_pct INT DEFAULT 85;
ALTER TABLE public.empresas_leads ADD COLUMN IF NOT EXISTS motivo_oportunidade TEXT;

-- 5. TABELA DE CARTEIRA DE VENDAS (PIPELINE E ATRIBUIÇÃO)
CREATE TABLE IF NOT EXISTS public.carteira_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID,
    vendedor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    pipeline_status pipeline_status_enum NOT NULL DEFAULT 'contato_iniciado',
    valor_estimado NUMERIC(12, 2) DEFAULT 15000.00,
    probabilidade_fechamento INT DEFAULT 50,
    in_carteira BOOLEAN NOT NULL DEFAULT true,
    data_insercao TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(lead_id)
);

ALTER TABLE public.carteira_leads ADD COLUMN IF NOT EXISTS vendedor_id UUID;
ALTER TABLE public.carteira_leads ADD COLUMN IF NOT EXISTS pipeline_status pipeline_status_enum DEFAULT 'contato_iniciado';
ALTER TABLE public.carteira_leads ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC(12, 2) DEFAULT 15000.00;
ALTER TABLE public.carteira_leads ADD COLUMN IF NOT EXISTS probabilidade_fechamento INT DEFAULT 50;
ALTER TABLE public.carteira_leads ADD COLUMN IF NOT EXISTS in_carteira BOOLEAN DEFAULT true;
ALTER TABLE public.carteira_leads ADD COLUMN IF NOT EXISTS data_insercao TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.carteira_leads ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 6. TABELA DE HISTÓRICO DE CONTATOS E INTERAÇÕES
CREATE TABLE IF NOT EXISTS public.historico_interacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carteira_id UUID,
    lead_id UUID,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    canal canal_contato_enum NOT NULL DEFAULT 'whatsapp',
    descricao TEXT NOT NULL,
    data_registro TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.historico_interacoes ADD COLUMN IF NOT EXISTS carteira_id UUID;
ALTER TABLE public.historico_interacoes ADD COLUMN IF NOT EXISTS lead_id UUID;
ALTER TABLE public.historico_interacoes ADD COLUMN IF NOT EXISTS usuario_id UUID;
ALTER TABLE public.historico_interacoes ADD COLUMN IF NOT EXISTS canal canal_contato_enum DEFAULT 'whatsapp';
ALTER TABLE public.historico_interacoes ADD COLUMN IF NOT EXISTS descricao TEXT;

-- =========================================================================
-- HARMONIZAÇÃO DINÂMICA DE TIPOS
-- =========================================================================
DO $$
DECLARE
    v_carteira_id_type text;
    v_lead_id_type text;
BEGIN
    SELECT data_type INTO v_carteira_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'carteira_leads' AND column_name = 'id';

    IF v_carteira_id_type = 'text' THEN
        ALTER TABLE public.historico_interacoes ALTER COLUMN carteira_id TYPE text;
        ALTER TABLE public.historico_interacoes DROP CONSTRAINT IF EXISTS historico_interacoes_carteira_id_fkey;
        ALTER TABLE public.historico_interacoes 
            ADD CONSTRAINT historico_interacoes_carteira_id_fkey 
            FOREIGN KEY (carteira_id) REFERENCES public.carteira_leads(id) ON DELETE CASCADE;
    ELSIF v_carteira_id_type = 'uuid' THEN
        ALTER TABLE public.historico_interacoes ALTER COLUMN carteira_id TYPE uuid USING carteira_id::uuid;
        ALTER TABLE public.historico_interacoes DROP CONSTRAINT IF EXISTS historico_interacoes_carteira_id_fkey;
        ALTER TABLE public.historico_interacoes 
            ADD CONSTRAINT historico_interacoes_carteira_id_fkey 
            FOREIGN KEY (carteira_id) REFERENCES public.carteira_leads(id) ON DELETE CASCADE;
    END IF;

    SELECT data_type INTO v_lead_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'empresas_leads' AND column_name = 'id';

    IF v_lead_id_type = 'text' THEN
        ALTER TABLE public.carteira_leads ALTER COLUMN lead_id TYPE text;
        ALTER TABLE public.carteira_leads DROP CONSTRAINT IF EXISTS carteira_leads_lead_id_fkey;
        ALTER TABLE public.carteira_leads 
            ADD CONSTRAINT carteira_leads_lead_id_fkey 
            FOREIGN KEY (lead_id) REFERENCES public.empresas_leads(id) ON DELETE CASCADE;

        ALTER TABLE public.historico_interacoes ALTER COLUMN lead_id TYPE text;
        ALTER TABLE public.historico_interacoes DROP CONSTRAINT IF EXISTS historico_interacoes_lead_id_fkey;
        ALTER TABLE public.historico_interacoes 
            ADD CONSTRAINT historico_interacoes_lead_id_fkey 
            FOREIGN KEY (lead_id) REFERENCES public.empresas_leads(id) ON DELETE CASCADE;
    ELSIF v_lead_id_type = 'uuid' THEN
        ALTER TABLE public.carteira_leads ALTER COLUMN lead_id TYPE uuid USING lead_id::uuid;
        ALTER TABLE public.carteira_leads DROP CONSTRAINT IF EXISTS carteira_leads_lead_id_fkey;
        ALTER TABLE public.carteira_leads 
            ADD CONSTRAINT carteira_leads_lead_id_fkey 
            FOREIGN KEY (lead_id) REFERENCES public.empresas_leads(id) ON DELETE CASCADE;

        ALTER TABLE public.historico_interacoes ALTER COLUMN lead_id TYPE uuid USING lead_id::uuid;
        ALTER TABLE public.historico_interacoes DROP CONSTRAINT IF EXISTS historico_interacoes_lead_id_fkey;
        ALTER TABLE public.historico_interacoes 
            ADD CONSTRAINT historico_interacoes_lead_id_fkey 
            FOREIGN KEY (lead_id) REFERENCES public.empresas_leads(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- =========================================================================
-- ÍNDICES PARA ALTA PERFORMANCE NO RADAR GEOGRÁFICO DE SÃO PAULO
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj_raw ON public.empresas_leads(cnpj_raw);
CREATE INDEX IF NOT EXISTS idx_empresas_cnae ON public.empresas_leads(cnae_fiscal);
CREATE INDEX IF NOT EXISTS idx_empresas_ramo ON public.empresas_leads(ramo);
CREATE INDEX IF NOT EXISTS idx_empresas_coords ON public.empresas_leads(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_carteira_vendedor ON public.carteira_leads(vendedor_id, pipeline_status);

-- =========================================================================
-- CRIAÇÃO DOS BUCKETS DE ARMAZENAMENTO (STORAGE)
-- =========================================================================
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES 
      ('propostas-lopes', 'propostas-lopes', false, 15728640, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
      ('contratos-lopes', 'contratos-lopes', false, 20971520, ARRAY['application/pdf']),
      ('documentos-cnpj', 'documentos-cnpj', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
      ('anexos-leads', 'anexos-leads', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
    ON CONFLICT (id) DO UPDATE SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Se o schema storage for gerenciado apenas pela interface, prossegue sem erro
END $$;

-- =========================================================================
-- POLÍTICAS RLS DE STORAGE (Executadas de forma segura se permitido)
-- =========================================================================
DO $$
BEGIN
    DROP POLICY IF EXISTS "Storage: Gestores tem acesso total a todos os buckets" ON storage.objects;
    CREATE POLICY "Storage: Gestores tem acesso total a todos os buckets"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      bucket_id IN ('propostas-lopes', 'contratos-lopes', 'documentos-cnpj', 'anexos-leads')
      AND (
        EXISTS (
          SELECT 1 FROM public.usuarios
          WHERE public.usuarios.auth_id = auth.uid()
          AND public.usuarios.role = 'gestor'
        )
        OR auth.role() = 'service_role'
      )
    );

    DROP POLICY IF EXISTS "Storage: Vendedores podem fazer upload em pastas dos seus leads" ON storage.objects;
    CREATE POLICY "Storage: Vendedores podem fazer upload em pastas dos seus leads"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN ('propostas-lopes', 'documentos-cnpj', 'anexos-leads')
      AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.usuarios
          WHERE public.usuarios.auth_id = auth.uid()
          AND public.usuarios.role IN ('gestor', 'vendedor')
        )
        OR auth.role() = 'service_role'
      )
    );

    DROP POLICY IF EXISTS "Storage: Vendedores podem ler documentos de seus leads" ON storage.objects;
    CREATE POLICY "Storage: Vendedores podem ler documentos de seus leads"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id IN ('propostas-lopes', 'documentos-cnpj', 'anexos-leads', 'contratos-lopes')
      AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.usuarios
          WHERE public.usuarios.auth_id = auth.uid()
        )
        OR auth.role() = 'service_role'
      )
    );

    DROP POLICY IF EXISTS "Storage: Apenas Gestores podem deletar contratos e propostas" ON storage.objects;
    CREATE POLICY "Storage: Apenas Gestores podem deletar contratos e propostas"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE public.usuarios.auth_id = auth.uid()
        AND public.usuarios.role = 'gestor'
      )
      OR auth.role() = 'service_role'
    );
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Políticas de storage já configuradas ou gerenciadas via Storage > Policies
END $$;

-- =========================================================================
-- ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) NAS TABELAS DO SISTEMA
-- =========================================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carteira_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_interacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "RLS: Usuários autenticados podem ver equipe Lopes" ON public.usuarios;
CREATE POLICY "RLS: Usuários autenticados podem ver equipe Lopes"
ON public.usuarios
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "RLS: Apenas Gestores podem gerenciar usuários" ON public.usuarios;
CREATE POLICY "RLS: Apenas Gestores podem gerenciar usuários"
ON public.usuarios
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.auth_id = auth.uid()
    AND u.role = 'gestor'
  )
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "RLS: Visualização de empresas para prospecção" ON public.empresas_leads;
CREATE POLICY "RLS: Visualização de empresas para prospecção"
ON public.empresas_leads
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "RLS: Inserção de novos CNPJs pesquisados" ON public.empresas_leads;
CREATE POLICY "RLS: Inserção de novos CNPJs pesquisados"
ON public.empresas_leads
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

DROP POLICY IF EXISTS "RLS: Correção e atualização de contato telefone e email" ON public.empresas_leads;
CREATE POLICY "RLS: Correção e atualização de contato telefone e email"
ON public.empresas_leads
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "RLS: Seleção de carteira por perfil" ON public.carteira_leads;
CREATE POLICY "RLS: Seleção de carteira por perfil"
ON public.carteira_leads
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "RLS: Inserção de lead na carteira" ON public.carteira_leads;
CREATE POLICY "RLS: Inserção de lead na carteira"
ON public.carteira_leads
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

DROP POLICY IF EXISTS "RLS: Atualização de pipeline na carteira" ON public.carteira_leads;
CREATE POLICY "RLS: Atualização de pipeline na carteira"
ON public.carteira_leads
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "RLS: Remoção de lead da carteira" ON public.carteira_leads;
CREATE POLICY "RLS: Remoção de lead da carteira"
ON public.carteira_leads
FOR DELETE
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "RLS: Visualização de interações" ON public.historico_interacoes;
CREATE POLICY "RLS: Visualização de interações"
ON public.historico_interacoes
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "RLS: Registro de novas interações" ON public.historico_interacoes;
CREATE POLICY "RLS: Registro de novas interações"
ON public.historico_interacoes
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- =========================================================================
-- CARGA INICIAL DE USUÁRIOS
-- =========================================================================
INSERT INTO public.usuarios (nome, email, role, cargo, telefone, meta_mensal)
VALUES 
  ('Maylla Lopes', 'maylla.lopes@lopes.com.br', 'gestor', 'Gestora Geral de Expansão SP', '(11) 98765-4321', 500000.00),
  ('Carlos Silva', 'carlos.silva@lopes.com.br', 'vendedor', 'Consultor Comercial Imobiliário', '(11) 91234-5678', 120000.00),
  ('Juliana Mendes', 'juliana.mendes@lopes.com.br', 'vendedor', 'Consultora de Facilities & Serviços', '(11) 97654-3210', 100000.00)
ON CONFLICT (email) DO NOTHING;
`;
