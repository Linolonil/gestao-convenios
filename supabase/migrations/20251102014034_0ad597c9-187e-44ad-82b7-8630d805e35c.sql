-- Permitir que estagiários possam criar contratos
CREATE POLICY "Estagiarios podem criar contratos" 
ON public.contratos 
FOR INSERT 
WITH CHECK (
  get_user_perfil(auth.email()) = 'ESTAGIARIO'
);