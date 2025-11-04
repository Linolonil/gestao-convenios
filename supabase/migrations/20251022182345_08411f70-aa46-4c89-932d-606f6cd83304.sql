-- ============================================
-- MIGRAÇÃO: Refatoração completa do banco de dados
-- Baseado no diagrama de classes atualizado
-- ============================================

-- 1. CRIAR TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  perfil TEXT NOT NULL CHECK (perfil IN ('ADMIN', 'ANALISTA', 'ESTAGIARIO')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. CRIAR TABELA DE TIPOS DE DOCUMENTO
CREATE TABLE IF NOT EXISTS public.tipos_documento (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  prazo_validade_dias INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. CRIAR TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS public.servicos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. RENOMEAR E ATUALIZAR TABELA PARCEIROS PARA PARTES_CONVENIADAS
ALTER TABLE public.parceiros RENAME TO partes_conveniadas;

-- Adicionar novos campos à tabela partes_conveniadas
ALTER TABLE public.partes_conveniadas
  ADD COLUMN IF NOT EXISTS responsavel TEXT,
  ADD COLUMN IF NOT EXISTS tipo_pessoa TEXT CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
  ADD COLUMN IF NOT EXISTS data_nascimento DATE,
  ADD COLUMN IF NOT EXISTS razao_social TEXT,
  ADD COLUMN IF NOT EXISTS nome_fantasia TEXT;

-- Atualizar campo cpf_cnpj para refletir o tipo de pessoa
UPDATE public.partes_conveniadas SET tipo_pessoa = 
  CASE 
    WHEN LENGTH(REPLACE(REPLACE(cpf_cnpj, '.', ''), '-', '')) <= 11 THEN 'FISICA'
    ELSE 'JURIDICA'
  END
WHERE tipo_pessoa IS NULL;

-- 5. ATUALIZAR TABELA CONVENIOS
-- Adicionar novos campos
ALTER TABLE public.convenios
  ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES public.usuarios(id),
  ADD COLUMN IF NOT EXISTS numero TEXT,
  ADD COLUMN IF NOT EXISTS desconto_convenio FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_inicio DATE,
  ADD COLUMN IF NOT EXISTS data_fim DATE;

-- Atualizar constraint de status para novos valores
ALTER TABLE public.convenios DROP CONSTRAINT IF EXISTS convenios_status_check;
ALTER TABLE public.convenios 
  ADD CONSTRAINT convenios_status_check 
  CHECK (status IN ('PROVISORIO', 'NEGOCIACAO', 'ATIVA', 'RENOVACAO', 'ENCERRADA'));

-- Migrar dados de validade para data_fim
UPDATE public.convenios SET data_fim = validade WHERE data_fim IS NULL AND validade IS NOT NULL;

-- Renomear foreign key
ALTER TABLE public.convenios RENAME COLUMN parceiro_id TO parte_conveniada_id;

-- 6. CRIAR TABELA DE RELACIONAMENTO CONVENIO_SERVICOS
CREATE TABLE IF NOT EXISTS public.convenio_servicos (
  id SERIAL PRIMARY KEY,
  convenio_id INTEGER NOT NULL REFERENCES public.convenios(id) ON DELETE CASCADE,
  servico_id INTEGER NOT NULL REFERENCES public.servicos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(convenio_id, servico_id)
);

-- 7. ATUALIZAR TABELA DOCUMENTOS
-- Adicionar novos campos
ALTER TABLE public.documentos
  ADD COLUMN IF NOT EXISTS tipo_documento_id INTEGER REFERENCES public.tipos_documento(id),
  ADD COLUMN IF NOT EXISTS versao INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS obrigatorio BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_upload TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Remover campos que não existem mais no novo modelo
ALTER TABLE public.documentos 
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS motivo_rejeicao,
  DROP COLUMN IF EXISTS rejeitado_em;

-- 8. INSERIR TIPOS DE DOCUMENTO PADRÃO
INSERT INTO public.tipos_documento (nome, descricao, obrigatorio, prazo_validade_dias) VALUES
  ('Contrato Social', 'Documento de constituição da empresa', true, 365),
  ('Cartão CNPJ', 'Comprovante de inscrição no CNPJ', true, 365),
  ('RG', 'Registro Geral - Documento de Identidade', true, 1825),
  ('CPF', 'Cadastro de Pessoa Física', true, NULL),
  ('Comprovante de Endereço', 'Comprovante de residência atualizado', true, 90),
  ('Alvará de Funcionamento', 'Autorização para funcionamento', true, 365),
  ('Estatuto Social', 'Estatuto da organização', false, 365),
  ('Ata de Reunião', 'Ata de reunião de aprovação', false, NULL),
  ('Procuração', 'Procuração para representação legal', false, 365),
  ('Certidão', 'Certidões diversas', false, 90)
ON CONFLICT DO NOTHING;

-- 9. ATUALIZAR TRIGGERS
-- Remover triggers antigos de status de documento
DROP TRIGGER IF EXISTS registrar_status_documento ON public.documentos;
DROP TRIGGER IF EXISTS registrar_status_convenio ON public.convenios;

-- Criar trigger para status de convênio
CREATE OR REPLACE FUNCTION public.registrar_mudanca_status_convenio_v2()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO historico_status (
      entidade_id,
      tipo_entidade,
      status_anterior,
      status_novo,
      motivo
    ) VALUES (
      NEW.id,
      'convenio',
      OLD.status,
      NEW.status,
      NEW.observacoes
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER registrar_status_convenio
  BEFORE UPDATE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_mudanca_status_convenio_v2();

-- 10. CRIAR FUNÇÃO PARA CALCULAR DIAS RESTANTES
CREATE OR REPLACE FUNCTION public.calcular_dias_restantes(p_convenio_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_data_fim DATE;
  v_dias_restantes INTEGER;
BEGIN
  SELECT data_fim INTO v_data_fim
  FROM public.convenios
  WHERE id = p_convenio_id;
  
  IF v_data_fim IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_dias_restantes := v_data_fim - CURRENT_DATE;
  RETURN v_dias_restantes;
END;
$$;

-- 11. CRIAR FUNÇÃO PARA VALIDAR DOCUMENTO
CREATE OR REPLACE FUNCTION public.validar_documento(p_documento_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo_documento_id INTEGER;
  v_prazo_validade INTEGER;
  v_data_upload TIMESTAMP WITH TIME ZONE;
  v_valido BOOLEAN;
BEGIN
  SELECT tipo_documento_id, data_upload
  INTO v_tipo_documento_id, v_data_upload
  FROM public.documentos
  WHERE id = p_documento_id;
  
  IF v_tipo_documento_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT prazo_validade_dias INTO v_prazo_validade
  FROM public.tipos_documento
  WHERE id = v_tipo_documento_id;
  
  IF v_prazo_validade IS NULL THEN
    RETURN true;
  END IF;
  
  v_valido := (CURRENT_DATE - v_data_upload::DATE) <= v_prazo_validade;
  RETURN v_valido;
END;
$$;

-- 12. HABILITAR RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenio_servicos ENABLE ROW LEVEL SECURITY;

-- 13. CRIAR POLÍTICAS RLS (permissivas para desenvolvimento)
CREATE POLICY "Allow all operations on usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tipos_documento" ON public.tipos_documento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on servicos" ON public.servicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on convenio_servicos" ON public.convenio_servicos FOR ALL USING (true) WITH CHECK (true);

-- 14. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_convenios_usuario ON public.convenios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_convenios_parte_conveniada ON public.convenios(parte_conveniada_id);
CREATE INDEX IF NOT EXISTS idx_convenios_status ON public.convenios(status);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON public.documentos(tipo_documento_id);
CREATE INDEX IF NOT EXISTS idx_convenio_servicos_convenio ON public.convenio_servicos(convenio_id);
CREATE INDEX IF NOT EXISTS idx_convenio_servicos_servico ON public.convenio_servicos(servico_id);

-- 15. CRIAR TRIGGERS PARA UPDATED_AT
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tipos_documento_updated_at
  BEFORE UPDATE ON public.tipos_documento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partes_conveniadas_updated_at
  BEFORE UPDATE ON public.partes_conveniadas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();