-- Adicionar colunas de status, motivo_rejeicao e rejeitado_em na tabela documentos
ALTER TABLE public.documentos 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS motivo_rejeicao text,
ADD COLUMN IF NOT EXISTS rejeitado_em timestamp with time zone;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.documentos.status IS 'Status do documento: pendente, aprovado, rejeitado';
COMMENT ON COLUMN public.documentos.motivo_rejeicao IS 'Motivo da rejeição do documento, se aplicável';
COMMENT ON COLUMN public.documentos.rejeitado_em IS 'Data e hora da rejeição do documento';

-- Criar índice para melhorar performance de queries por status
CREATE INDEX IF NOT EXISTS idx_documentos_status ON public.documentos(status);