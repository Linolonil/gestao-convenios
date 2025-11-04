-- Inserir usuários de teste para o sistema
INSERT INTO public.usuarios (nome, email, cpf, senha, perfil, ativo) VALUES
  ('Administrador', 'admin@caaam.com', '111.111.111-11', 'senha123', 'ADMIN', true),
  ('Analista Sistema', 'analista@caaam.com', '222.222.222-22', 'senha123', 'ANALISTA', true),
  ('Estagiário Sistema', 'estagiario@caaam.com', '333.333.333-33', 'senha123', 'ESTAGIARIO', true)
ON CONFLICT (email) DO NOTHING;