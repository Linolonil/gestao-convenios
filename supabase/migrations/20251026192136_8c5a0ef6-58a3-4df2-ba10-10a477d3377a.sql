-- Criando tabela de comentários de documentos (está sendo usada no código mas não existe)
CREATE TABLE IF NOT EXISTS public.comentarios_documento (
  id SERIAL PRIMARY KEY,
  documento_id INTEGER NOT NULL REFERENCES public.documento(id) ON DELETE CASCADE,
  usuario_id INTEGER NOT NULL REFERENCES public.usuarios(id),
  comentario TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'observacao', -- 'observacao', 'solicitacao_correcao', 'resposta'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.comentarios_documento ENABLE ROW LEVEL SECURITY;

-- Política de acesso
CREATE POLICY "Allow all operations on comentarios_documento"
  ON public.comentarios_documento
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Índices para melhor performance
CREATE INDEX idx_comentarios_documento_id ON public.comentarios_documento(documento_id);
CREATE INDEX idx_comentarios_usuario_id ON public.comentarios_documento(usuario_id);

-- Remover campo redundante 'validade' da tabela convenios (usar apenas data_fim)
ALTER TABLE public.convenios DROP COLUMN IF EXISTS validade;

-- Remover campo redundante 'categoria_documento' (usar apenas tipo_documento_id)
ALTER TABLE public.documento DROP COLUMN IF EXISTS categoria_documento;

-- Adicionar campo area_atuacao na tabela partes_conveniadas se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'partes_conveniadas' 
    AND column_name = 'area_atuacao'
  ) THEN
    ALTER TABLE public.partes_conveniadas ADD COLUMN area_atuacao TEXT;
  END IF;
END $$;