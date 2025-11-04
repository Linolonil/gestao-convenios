-- Adicionar nova coluna com o tipo enum
ALTER TABLE public.documentos 
ADD COLUMN status_novo status_documento;

-- Copiar os dados convertendo para enum
UPDATE public.documentos 
SET status_novo = status::status_documento;

-- Tornar a nova coluna NOT NULL
ALTER TABLE public.documentos 
ALTER COLUMN status_novo SET NOT NULL;

-- Definir o default
ALTER TABLE public.documentos 
ALTER COLUMN status_novo SET DEFAULT 'pendente'::status_documento;

-- Remover a coluna antiga
ALTER TABLE public.documentos 
DROP COLUMN status;

-- Renomear a nova coluna
ALTER TABLE public.documentos 
RENAME COLUMN status_novo TO status;