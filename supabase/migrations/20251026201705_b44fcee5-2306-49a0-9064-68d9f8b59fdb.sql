-- Alterar o status padrão dos convênios para 'em_analise'
ALTER TABLE public.convenios 
ALTER COLUMN status SET DEFAULT 'em_analise';

-- Garantir que a tabela convenios está na publicação realtime
ALTER TABLE public.convenios REPLICA IDENTITY FULL;
