-- Adicionar coluna tipo_documento_id na tabela documentos
ALTER TABLE documentos 
  ADD COLUMN IF NOT EXISTS tipo_documento_id INTEGER REFERENCES tipos_documento(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_tipo_documento_id ON documentos(tipo_documento_id);