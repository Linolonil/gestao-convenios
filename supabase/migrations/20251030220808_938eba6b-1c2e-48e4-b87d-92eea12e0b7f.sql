-- Remover a foreign key entre servicos e parceiros
ALTER TABLE public.servicos 
DROP CONSTRAINT IF EXISTS servicos_id_parceiro_fkey;

-- Remover a coluna id_parceiro da tabela servicos
ALTER TABLE public.servicos 
DROP COLUMN id_parceiro;

-- Comentário explicando a mudança
COMMENT ON TABLE public.servicos IS 'Catálogo de serviços. A relação com parceiros é feita através da tabela servicos_oferecidos que relaciona serviços aos contratos';