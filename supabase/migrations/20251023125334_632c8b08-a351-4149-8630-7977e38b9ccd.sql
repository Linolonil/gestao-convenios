-- Fase 1.1: Adicionar campos de rastreabilidade na tabela documentos
ALTER TABLE documentos 
  ADD COLUMN IF NOT EXISTS aprovado_por INTEGER REFERENCES usuarios(id),
  ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejeitado_por INTEGER REFERENCES usuarios(id),
  ADD COLUMN IF NOT EXISTS requer_correcao BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS solicitacao_correcao TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_aprovado_por ON documentos(aprovado_por);
CREATE INDEX IF NOT EXISTS idx_documentos_rejeitado_por ON documentos(rejeitado_por);
CREATE INDEX IF NOT EXISTS idx_documentos_requer_correcao ON documentos(requer_correcao) WHERE requer_correcao = true;

-- Fase 1.2: Criar tabela de comentários em documentos
CREATE TABLE IF NOT EXISTS comentarios_documento (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  comentario TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'observacao',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para comentarios_documento
CREATE INDEX IF NOT EXISTS idx_comentarios_documento_id ON comentarios_documento(documento_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_id ON comentarios_documento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON comentarios_documento(created_at DESC);

-- RLS Policy para comentarios_documento
ALTER TABLE comentarios_documento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on comentarios_documento" ON comentarios_documento;
CREATE POLICY "Allow all operations on comentarios_documento"
ON comentarios_documento
FOR ALL
USING (true)
WITH CHECK (true);

-- Fase 1.3: Criar tabela de versões de documentos
CREATE TABLE IF NOT EXISTS versoes_documento (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
  versao INTEGER NOT NULL,
  url_arquivo TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  enviado_por INTEGER REFERENCES usuarios(id),
  motivo_reenvio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para versoes_documento
CREATE INDEX IF NOT EXISTS idx_versoes_documento_id ON versoes_documento(documento_id);
CREATE INDEX IF NOT EXISTS idx_versoes_versao ON versoes_documento(versao DESC);

-- RLS Policy para versoes_documento
ALTER TABLE versoes_documento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on versoes_documento" ON versoes_documento;
CREATE POLICY "Allow all operations on versoes_documento"
ON versoes_documento
FOR ALL
USING (true)
WITH CHECK (true);

-- Fase 1.4: Atualizar enum de status de convênios
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'AGUARDANDO_DOCUMENTOS' AND enumtypid = 'status_convenio'::regtype) THEN
        ALTER TYPE status_convenio ADD VALUE 'AGUARDANDO_DOCUMENTOS';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'EM_ANALISE' AND enumtypid = 'status_convenio'::regtype) THEN
        ALTER TYPE status_convenio ADD VALUE 'EM_ANALISE';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'AGUARDANDO_CORRECOES' AND enumtypid = 'status_convenio'::regtype) THEN
        ALTER TYPE status_convenio ADD VALUE 'AGUARDANDO_CORRECOES';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'APROVADO' AND enumtypid = 'status_convenio'::regtype) THEN
        ALTER TYPE status_convenio ADD VALUE 'APROVADO';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'REJEITADO' AND enumtypid = 'status_convenio'::regtype) THEN
        ALTER TYPE status_convenio ADD VALUE 'REJEITADO';
    END IF;
END $$;