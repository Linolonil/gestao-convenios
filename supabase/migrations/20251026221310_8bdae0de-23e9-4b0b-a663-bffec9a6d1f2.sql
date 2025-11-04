-- =============================================
-- PARTE 1: LIMPAR BANCO DE DADOS
-- =============================================

-- Drop funções existentes primeiro
DROP FUNCTION IF EXISTS public.calcular_dias_restantes(integer) CASCADE;
DROP FUNCTION IF EXISTS public.validar_documento(integer) CASCADE;
DROP FUNCTION IF EXISTS public.registrar_mudanca_status_convenio() CASCADE;
DROP FUNCTION IF EXISTS public.registrar_mudanca_status_convenio_v2() CASCADE;
DROP FUNCTION IF EXISTS public.registrar_mudanca_status_documento() CASCADE;
DROP FUNCTION IF EXISTS public.inativar_parceiro_ao_deletar_convenio() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop todas as tabelas existentes (CASCADE para remover dependências)
DROP TABLE IF EXISTS public.versoes_documento CASCADE;
DROP TABLE IF EXISTS public.comentarios_documento CASCADE;
DROP TABLE IF EXISTS public.historico_status CASCADE;
DROP TABLE IF EXISTS public.convenio_servicos CASCADE;
DROP TABLE IF EXISTS public.documento CASCADE;
DROP TABLE IF EXISTS public.convenios CASCADE;
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.partes_conveniadas CASCADE;
DROP TABLE IF EXISTS public.tipos_documento CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- Drop enums existentes
DROP TYPE IF EXISTS public.perfil_usuario CASCADE;
DROP TYPE IF EXISTS public.status_contrato CASCADE;

-- =============================================
-- PARTE 2: CRIAR ENUMS
-- =============================================

-- Enum para perfis de usuário
CREATE TYPE public.perfil_usuario AS ENUM ('ADMIN', 'ANALISTA', 'ESTAGIARIO');

-- Enum para status do contrato
CREATE TYPE public.status_contrato AS ENUM (
  'EM_ANALISE',
  'EM_NEGOCIACAO', 
  'ATIVO',
  'RENOVACAO',
  'ENCERRADO'
);

-- =============================================
-- PARTE 3: CRIAR TABELAS
-- =============================================

-- Tabela: usuarios
CREATE TABLE public.usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  perfil perfil_usuario NOT NULL DEFAULT 'ESTAGIARIO',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: parceiros (com Single Table Inheritance para PessoaFisica e PessoaJuridica)
CREATE TABLE public.parceiros (
  id_parceiro SERIAL PRIMARY KEY,
  tipo_pessoa TEXT NOT NULL CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
  email TEXT NOT NULL,
  telefone TEXT,
  endereco TEXT,
  validacao_add BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  
  -- Campos específicos de Pessoa Física
  cpf TEXT,
  nome TEXT,
  data_nascimento DATE,
  
  -- Campos específicos de Pessoa Jurídica
  cnpj TEXT,
  razao_social TEXT,
  nome_fantasia TEXT,
  responsavel TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints para garantir que os campos corretos sejam preenchidos
  CONSTRAINT check_pessoa_fisica CHECK (
    tipo_pessoa != 'FISICA' OR (cpf IS NOT NULL AND nome IS NOT NULL)
  ),
  CONSTRAINT check_pessoa_juridica CHECK (
    tipo_pessoa != 'JURIDICA' OR (cnpj IS NOT NULL AND razao_social IS NOT NULL)
  ),
  CONSTRAINT unique_cpf_cnpj UNIQUE (cpf, cnpj)
);

-- Tabela: servicos
CREATE TABLE public.servicos (
  id_servico SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  id_parceiro INTEGER NOT NULL REFERENCES public.parceiros(id_parceiro) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: contratos (anteriormente convenios)
CREATE TABLE public.contratos (
  id_contrato SERIAL PRIMARY KEY,
  numero TEXT,
  desconto_concedido DOUBLE PRECISION DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  status status_contrato NOT NULL DEFAULT 'EM_ANALISE',
  observacoes TEXT,
  renovado BOOLEAN NOT NULL DEFAULT false,
  cancelado BOOLEAN NOT NULL DEFAULT false,
  id_usuario INTEGER NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE RESTRICT,
  id_parceiro INTEGER NOT NULL REFERENCES public.parceiros(id_parceiro) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: contrato_servicos (relacionamento muitos-para-muitos)
CREATE TABLE public.contrato_servicos (
  id SERIAL PRIMARY KEY,
  id_contrato INTEGER NOT NULL REFERENCES public.contratos(id_contrato) ON DELETE CASCADE,
  id_servico INTEGER NOT NULL REFERENCES public.servicos(id_servico) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(id_contrato, id_servico)
);

-- Tabela: tipos_documento
CREATE TABLE public.tipos_documento (
  id_tipo_documento SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  prazo_validade_dias INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: documentos
CREATE TABLE public.documentos (
  id_documento SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  versao INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'em_analise')),
  id_contrato INTEGER NOT NULL REFERENCES public.contratos(id_contrato) ON DELETE CASCADE,
  id_tipo_documento INTEGER REFERENCES public.tipos_documento(id_tipo_documento) ON DELETE RESTRICT,
  aprovado_por INTEGER REFERENCES public.usuarios(id_usuario),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  rejeitado_por INTEGER REFERENCES public.usuarios(id_usuario),
  rejeitado_em TIMESTAMP WITH TIME ZONE,
  motivo_rejeicao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: versoes_documento (histórico de versões)
CREATE TABLE public.versoes_documento (
  id SERIAL PRIMARY KEY,
  id_documento INTEGER NOT NULL REFERENCES public.documentos(id_documento) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enviado_por INTEGER REFERENCES public.usuarios(id_usuario),
  motivo_reenvio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: historico_status (histórico de mudanças de status)
CREATE TABLE public.historico_status (
  id SERIAL PRIMARY KEY,
  entidade_tipo TEXT NOT NULL CHECK (entidade_tipo IN ('contrato', 'documento')),
  entidade_id INTEGER NOT NULL,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  data_mudanca TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  id_usuario INTEGER REFERENCES public.usuarios(id_usuario),
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: comentarios_documento
CREATE TABLE public.comentarios_documento (
  id SERIAL PRIMARY KEY,
  id_documento INTEGER NOT NULL REFERENCES public.documentos(id_documento) ON DELETE CASCADE,
  id_usuario INTEGER NOT NULL REFERENCES public.usuarios(id_usuario),
  comentario TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'observacao' CHECK (tipo IN ('observacao', 'correcao', 'rejeicao')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- PARTE 4: CRIAR ÍNDICES
-- =============================================

CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_parceiros_cpf ON public.parceiros(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_parceiros_cnpj ON public.parceiros(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_parceiros_tipo_pessoa ON public.parceiros(tipo_pessoa);
CREATE INDEX idx_servicos_parceiro ON public.servicos(id_parceiro);
CREATE INDEX idx_contratos_usuario ON public.contratos(id_usuario);
CREATE INDEX idx_contratos_parceiro ON public.contratos(id_parceiro);
CREATE INDEX idx_contratos_status ON public.contratos(status);
CREATE INDEX idx_documentos_contrato ON public.documentos(id_contrato);
CREATE INDEX idx_documentos_status ON public.documentos(status);
CREATE INDEX idx_historico_status_entidade ON public.historico_status(entidade_tipo, entidade_id);

-- =============================================
-- PARTE 5: CRIAR TRIGGERS E FUNÇÕES
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parceiros_updated_at BEFORE UPDATE ON public.parceiros
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_documento_updated_at BEFORE UPDATE ON public.tipos_documento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar mudanças de status de contrato
CREATE OR REPLACE FUNCTION registrar_mudanca_status_contrato()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.historico_status (
      entidade_tipo,
      entidade_id,
      status_anterior,
      status_novo,
      motivo
    ) VALUES (
      'contrato',
      NEW.id_contrato,
      OLD.status::text,
      NEW.status::text,
      NEW.observacoes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_registrar_mudanca_status_contrato
  AFTER UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_mudanca_status_contrato();

-- Função para registrar mudanças de status de documento
CREATE OR REPLACE FUNCTION registrar_mudanca_status_documento()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.historico_status (
      entidade_tipo,
      entidade_id,
      status_anterior,
      status_novo,
      motivo
    ) VALUES (
      'documento',
      NEW.id_documento,
      OLD.status,
      NEW.status,
      NEW.motivo_rejeicao
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_registrar_mudanca_status_documento
  AFTER UPDATE ON public.documentos
  FOR EACH ROW
  EXECUTE FUNCTION registrar_mudanca_status_documento();

-- =============================================
-- PARTE 6: FUNÇÕES AUXILIARES
-- =============================================

-- Função para calcular dias restantes de um contrato
CREATE OR REPLACE FUNCTION calcular_dias_restantes(p_id_contrato INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_data_fim DATE;
  v_dias_restantes INTEGER;
BEGIN
  SELECT data_fim INTO v_data_fim
  FROM public.contratos
  WHERE id_contrato = p_id_contrato;
  
  IF v_data_fim IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_dias_restantes := v_data_fim - CURRENT_DATE;
  RETURN v_dias_restantes;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Função para validar documento com base no tipo e prazo de validade
CREATE OR REPLACE FUNCTION validar_documento(p_id_documento INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_id_tipo_documento INTEGER;
  v_prazo_validade INTEGER;
  v_data_upload TIMESTAMP WITH TIME ZONE;
  v_valido BOOLEAN;
BEGIN
  SELECT id_tipo_documento, data_upload
  INTO v_id_tipo_documento, v_data_upload
  FROM public.documentos
  WHERE id_documento = p_id_documento;
  
  IF v_id_tipo_documento IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT prazo_validade_dias INTO v_prazo_validade
  FROM public.tipos_documento
  WHERE id_tipo_documento = v_id_tipo_documento;
  
  IF v_prazo_validade IS NULL THEN
    RETURN true;
  END IF;
  
  v_valido := (CURRENT_DATE - v_data_upload::DATE) <= v_prazo_validade;
  RETURN v_valido;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- =============================================
-- PARTE 7: HABILITAR RLS E CRIAR POLICIES
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versoes_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_documento ENABLE ROW LEVEL SECURITY;

-- Policies temporárias permissivas (para desenvolvimento)
CREATE POLICY "Permitir todas operações" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.parceiros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.servicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.contratos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.contrato_servicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.tipos_documento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.versoes_documento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.historico_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todas operações" ON public.comentarios_documento FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- PARTE 8: INSERIR TIPOS DE DOCUMENTO PADRÃO
-- =============================================

INSERT INTO public.tipos_documento (nome, descricao, obrigatorio, prazo_validade_dias) VALUES
('Carta Proposta', 'Documento inicial de proposta de convênio', true, NULL),
('Alvará de funcionamento', 'Alvará de funcionamento da empresa', true, 365),
('CNPJ', 'Comprovante de inscrição no CNPJ', true, NULL),
('Certidão negativa de débitos trabalhistas', 'CNDT - Certidão negativa de débitos trabalhistas', true, 180),
('Certidão negativa de débitos federais', 'CND Federal', true, 180),
('Certidão negativa de débitos estaduais', 'CND Estadual', true, 180),
('Certidão negativa de débitos municipais', 'CND Municipal', true, 180),
('Contrato social', 'Contrato social da empresa ou estatuto', true, NULL),
('CPF', 'Comprovante de CPF do responsável', true, NULL),
('RG', 'Documento de identidade do responsável', true, NULL),
('Comprovante de endereço', 'Comprovante de endereço da empresa', true, 90),
('Procuração', 'Procuração com poderes específicos (se aplicável)', false, NULL),
('Termo de adesão', 'Termo de adesão ao convênio', true, NULL),
('Documento adicional 1', 'Outros documentos conforme necessidade', false, NULL),
('Documento adicional 2', 'Outros documentos conforme necessidade', false, NULL),
('Documento adicional 3', 'Outros documentos conforme necessidade', false, NULL);