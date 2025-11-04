-- Drop the conflicting policy first
DROP POLICY IF EXISTS "Estagiários podem reenviar documentos em correção" ON public.documentos;

-- Create policy to allow interns to update documents when a correction was requested
CREATE POLICY "estagiarios_podem_reenviar_documentos_correcao"
ON public.documentos
FOR UPDATE
TO authenticated
USING (
  public.get_user_perfil(auth.email()) = 'ESTAGIARIO'::text
  AND status = 'pendente'::status_documento
)
WITH CHECK (
  public.get_user_perfil(auth.email()) = 'ESTAGIARIO'::text
  AND status = 'pendente'::status_documento
);