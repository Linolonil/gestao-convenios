-- 1. Criar enums para padronizar valores (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_convenio') THEN
    CREATE TYPE status_convenio AS ENUM ('pendente', 'ativo', 'inativo', 'rejeitado');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_documento') THEN
    CREATE TYPE status_documento AS ENUM ('pendente', 'aprovado', 'rejeitado');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_convenio_enum') THEN
    CREATE TYPE tipo_convenio_enum AS ENUM ('Patrocínio', 'Parceria', 'Doação', 'Evento');
  END IF;
END $$;

-- 2. Adicionar coluna de endereço normalizado em parceiros (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parceiros' AND column_name = 'endereco_completo'
  ) THEN
    ALTER TABLE parceiros ADD COLUMN endereco_completo jsonb;
    
    -- Migrar dados existentes
    UPDATE parceiros 
    SET endereco_completo = jsonb_build_object(
      'logradouro', endereco,
      'cidade', cidade,
      'estado', estado,
      'cep', cep
    )
    WHERE endereco IS NOT NULL OR cidade IS NOT NULL OR estado IS NOT NULL OR cep IS NOT NULL;
  END IF;
END $$;

-- 3. Adicionar unique constraint em CPF/CNPJ (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uk_parceiros_cpf_cnpj'
  ) THEN
    ALTER TABLE parceiros ADD CONSTRAINT uk_parceiros_cpf_cnpj UNIQUE (cpf_cnpj);
  END IF;
END $$;

-- 4. Criar tabela de histórico de status (se não existir)
CREATE TABLE IF NOT EXISTS historico_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_id uuid NOT NULL,
  tipo_entidade text NOT NULL CHECK (tipo_entidade IN ('convenio', 'documento')),
  status_anterior text,
  status_novo text NOT NULL,
  motivo text,
  data_mudanca timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Remover a referência circular problemática (se existir)
ALTER TABLE convenios DROP COLUMN IF EXISTS documento_rejeitado_id;

-- 6. Adicionar Foreign Key para documentos (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_documentos_convenio'
  ) THEN
    ALTER TABLE documentos 
    ADD CONSTRAINT fk_documentos_convenio 
    FOREIGN KEY (convenio_id) 
    REFERENCES convenios(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 7. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_convenios_parceiro_id ON convenios(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_convenios_status ON convenios(status);
CREATE INDEX IF NOT EXISTS idx_convenios_tipo ON convenios(tipo_convenio);
CREATE INDEX IF NOT EXISTS idx_documentos_convenio_id ON documentos(convenio_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos(status);
CREATE INDEX IF NOT EXISTS idx_historico_entidade ON historico_status(entidade_id, tipo_entidade);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_status(data_mudanca DESC);

-- 8. Criar função para registrar mudanças de status em convenios
CREATE OR REPLACE FUNCTION registrar_mudanca_status_convenio()
RETURNS TRIGGER AS $$
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
      NEW.motivo_rejeicao
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger (drop se existir)
DROP TRIGGER IF EXISTS trigger_historico_status_convenio ON convenios;
CREATE TRIGGER trigger_historico_status_convenio
AFTER UPDATE ON convenios
FOR EACH ROW
EXECUTE FUNCTION registrar_mudanca_status_convenio();

-- 9. Criar função para registrar mudanças de status em documentos
CREATE OR REPLACE FUNCTION registrar_mudanca_status_documento()
RETURNS TRIGGER AS $$
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
      'documento',
      OLD.status,
      NEW.status,
      NEW.motivo_rejeicao
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger (drop se existir)
DROP TRIGGER IF EXISTS trigger_historico_status_documento ON documentos;
CREATE TRIGGER trigger_historico_status_documento
AFTER UPDATE ON documentos
FOR EACH ROW
EXECUTE FUNCTION registrar_mudanca_status_documento();

-- 10. Habilitar RLS na nova tabela
ALTER TABLE historico_status ENABLE ROW LEVEL SECURITY;

-- Criar policy (drop se existir)
DROP POLICY IF EXISTS "Allow all operations on historico_status" ON historico_status;
CREATE POLICY "Allow all operations on historico_status"
ON historico_status
FOR ALL
USING (true)
WITH CHECK (true);