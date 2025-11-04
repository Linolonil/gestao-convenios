-- Remover a constraint antiga de status
ALTER TABLE public.convenios 
DROP CONSTRAINT IF EXISTS convenios_status_check;

-- Adicionar nova constraint com os status corretos
ALTER TABLE public.convenios 
ADD CONSTRAINT convenios_status_check 
CHECK (status IN ('ativo', 'em_analise', 'em_negociacao', 'renovacao', 'encerrado'));

-- Atualizar convênios existentes com status antigo para os novos valores
UPDATE public.convenios 
SET status = 'em_analise' 
WHERE status = 'pendente';

UPDATE public.convenios 
SET status = 'ativo' 
WHERE status = 'aprovado';

UPDATE public.convenios 
SET status = 'encerrado' 
WHERE status = 'rejeitado';
