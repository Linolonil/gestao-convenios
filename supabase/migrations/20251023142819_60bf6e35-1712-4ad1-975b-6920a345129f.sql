-- Adicionar campo ativo na tabela partes_conveniadas se não existir
ALTER TABLE public.partes_conveniadas 
ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Criar função para inativar parceiro quando convênio for deletado
CREATE OR REPLACE FUNCTION public.inativar_parceiro_ao_deletar_convenio()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inativa o parceiro relacionado ao convênio deletado
  UPDATE public.partes_conveniadas
  SET ativo = false
  WHERE id = OLD.parte_conveniada_id;
  
  RETURN OLD;
END;
$function$;

-- Criar trigger que executa a função quando um convênio for deletado
DROP TRIGGER IF EXISTS trigger_inativar_parceiro ON public.convenios;
CREATE TRIGGER trigger_inativar_parceiro
  BEFORE DELETE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION public.inativar_parceiro_ao_deletar_convenio();