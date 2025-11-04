-- Permitir que estagiários possam criar serviços oferecidos
CREATE POLICY "Estagiarios podem criar servicos oferecidos" 
ON public.servicos_oferecidos 
FOR INSERT 
WITH CHECK (
  get_user_perfil(auth.email()) = 'ESTAGIARIO'
);