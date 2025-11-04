-- Criar política para permitir que estagiários possam ativar convênios
-- (atualizar status para ATIVO e definir número do contrato)
CREATE POLICY "Estagiarios podem ativar convenios"
ON public.contratos
FOR UPDATE
USING (
  get_user_perfil(auth.email()) = 'ESTAGIARIO'
  AND status = 'EM_NEGOCIACAO'
)
WITH CHECK (
  get_user_perfil(auth.email()) = 'ESTAGIARIO'
  AND status = 'ATIVO'
);