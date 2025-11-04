-- Remove triggers de histórico primeiro
DROP TRIGGER IF EXISTS trigger_registrar_mudanca_status_contrato ON contratos CASCADE;
DROP TRIGGER IF EXISTS trigger_registrar_mudanca_status_documento ON documentos CASCADE;

-- Agora remove as funções com CASCADE
DROP FUNCTION IF EXISTS registrar_mudanca_status_contrato() CASCADE;
DROP FUNCTION IF EXISTS registrar_mudanca_status_documento() CASCADE;

-- Remove tabelas de controle de versão e histórico
DROP TABLE IF EXISTS versoes_documento CASCADE;
DROP TABLE IF EXISTS historico_status CASCADE;

-- Simplifica tabela de documentos (remove colunas de versão)
ALTER TABLE documentos DROP COLUMN IF EXISTS versao CASCADE;

-- Remove colunas redundantes de aprovação/rejeição
ALTER TABLE documentos DROP COLUMN IF EXISTS aprovado_em CASCADE;
ALTER TABLE documentos DROP COLUMN IF EXISTS aprovado_por CASCADE;
ALTER TABLE documentos DROP COLUMN IF EXISTS rejeitado_em CASCADE;
ALTER TABLE documentos DROP COLUMN IF EXISTS rejeitado_por CASCADE;

-- Adiciona coluna para data de alteração de status
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS data_status TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Remove tipo de status não utilizado
DROP TYPE IF EXISTS status_convenio CASCADE;

-- Remove coluna tipo redundante de comentários
ALTER TABLE comentarios_documento DROP COLUMN IF EXISTS tipo CASCADE;

-- Cria índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_documentos_contrato ON documentos(id_contrato);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_parceiro ON contratos(id_parceiro);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_servicos_parceiro ON servicos(id_parceiro);
CREATE INDEX IF NOT EXISTS idx_comentarios_documento ON comentarios_documento(id_documento);
CREATE INDEX IF NOT EXISTS idx_contrato_servicos_contrato ON contrato_servicos(id_contrato);
CREATE INDEX IF NOT EXISTS idx_contrato_servicos_servico ON contrato_servicos(id_servico);