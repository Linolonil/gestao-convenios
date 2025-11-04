-- Ajustar constraint de tipo_pessoa para aceitar os valores usados pelo app
ALTER TABLE public.partes_conveniadas 
DROP CONSTRAINT IF EXISTS partes_conveniadas_tipo_pessoa_check;

ALTER TABLE public.partes_conveniadas 
ADD CONSTRAINT partes_conveniadas_tipo_pessoa_check 
CHECK (
  tipo_pessoa IS NULL OR lower(tipo_pessoa) IN ('fisica','juridica','pf','pj','f','j')
);
