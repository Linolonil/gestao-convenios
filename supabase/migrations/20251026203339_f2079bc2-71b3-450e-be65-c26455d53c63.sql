-- Remover trigger e função antigas que usam categoria_documento
DROP TRIGGER IF EXISTS trigger_categorizar_documento ON public.documento;
DROP FUNCTION IF EXISTS public.trigger_categorizar_documento();
DROP FUNCTION IF EXISTS public.categorizar_documento(text, text);
