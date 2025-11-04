-- Remove o campo desconto_concedido da tabela contratos
-- O desconto deve ser específico de cada serviço oferecido, não do contrato como um todo
ALTER TABLE public.contratos 
DROP COLUMN IF EXISTS desconto_concedido;