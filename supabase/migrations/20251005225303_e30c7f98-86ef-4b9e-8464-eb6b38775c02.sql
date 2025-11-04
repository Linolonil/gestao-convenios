-- Remove colunas individuais de endereço e mantém apenas endereco_completo (jsonb)
ALTER TABLE public.parceiros 
  DROP COLUMN IF EXISTS endereco,
  DROP COLUMN IF EXISTS cidade,
  DROP COLUMN IF EXISTS estado,
  DROP COLUMN IF EXISTS cep;

-- Adiciona comentário para documentação
COMMENT ON COLUMN public.parceiros.endereco_completo IS 'Estrutura JSON contendo: logradouro, numero, complemento, bairro, cidade, estado, cep';