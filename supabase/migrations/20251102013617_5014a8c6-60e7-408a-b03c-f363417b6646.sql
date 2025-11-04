-- Permitir que estagiários possam criar parceiros
CREATE POLICY "Estagiarios podem criar parceiros" 
ON public.parceiros 
FOR INSERT 
WITH CHECK (
  get_user_perfil(auth.email()) = 'ESTAGIARIO'
);