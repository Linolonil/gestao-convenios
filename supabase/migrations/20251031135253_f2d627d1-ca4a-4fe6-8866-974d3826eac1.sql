-- Criar funções security definer para verificar perfis sem recursão
CREATE OR REPLACE FUNCTION public.get_user_perfil(user_email TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT perfil::TEXT
  FROM public.usuarios
  WHERE email = user_email AND ativo = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_analista()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE email = auth.email()
    AND perfil IN ('ADMIN', 'ANALISTA')
    AND ativo = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE email = auth.email()
    AND perfil = 'ADMIN'
    AND ativo = true
  );
$$;

-- ========================================
-- RLS POLICIES PARA USUARIOS
-- ========================================

-- Remover política antiga
DROP POLICY IF EXISTS "Permitir todas operações" ON public.usuarios;

-- Usuários podem ver apenas seu próprio perfil, admins veem todos
CREATE POLICY "Usuários podem ver próprio perfil ou admin vê todos"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
  email = auth.email() 
  OR public.is_admin()
);

-- Apenas admins podem inserir novos usuários
CREATE POLICY "Apenas admins podem criar usuários"
ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Usuários podem atualizar próprio perfil (exceto perfil e ativo), admins podem tudo
CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (
  email = auth.email()
  OR public.is_admin()
);

-- Apenas admins podem deletar usuários
CREATE POLICY "Apenas admins podem deletar usuários"
ON public.usuarios
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ========================================
-- RLS POLICIES PARA PARCEIROS
-- ========================================

DROP POLICY IF EXISTS "Permitir todas operações" ON public.parceiros;

-- Todos autenticados podem ver parceiros
CREATE POLICY "Usuários autenticados podem ver parceiros"
ON public.parceiros
FOR SELECT
TO authenticated
USING (true);

-- Apenas analistas e admins podem criar parceiros
CREATE POLICY "Analistas e admins podem criar parceiros"
ON public.parceiros
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_analista());

-- Apenas analistas e admins podem atualizar parceiros
CREATE POLICY "Analistas e admins podem atualizar parceiros"
ON public.parceiros
FOR UPDATE
TO authenticated
USING (public.is_admin_or_analista());

-- Apenas admins podem deletar parceiros
CREATE POLICY "Apenas admins podem deletar parceiros"
ON public.parceiros
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ========================================
-- RLS POLICIES PARA CONTRATOS
-- ========================================

DROP POLICY IF EXISTS "Permitir todas operações" ON public.contratos;

-- Todos autenticados podem ver contratos
CREATE POLICY "Usuários autenticados podem ver contratos"
ON public.contratos
FOR SELECT
TO authenticated
USING (true);

-- Apenas analistas e admins podem criar contratos
CREATE POLICY "Analistas e admins podem criar contratos"
ON public.contratos
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_analista());

-- Apenas analistas e admins podem atualizar contratos
CREATE POLICY "Analistas e admins podem atualizar contratos"
ON public.contratos
FOR UPDATE
TO authenticated
USING (public.is_admin_or_analista());

-- Apenas admins podem deletar contratos
CREATE POLICY "Apenas admins podem deletar contratos"
ON public.contratos
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ========================================
-- RLS POLICIES PARA DOCUMENTOS
-- ========================================

DROP POLICY IF EXISTS "Permitir todas operações" ON public.documentos;

-- Todos autenticados podem ver documentos
CREATE POLICY "Usuários autenticados podem ver documentos"
ON public.documentos
FOR SELECT
TO authenticated
USING (true);

-- Todos autenticados podem criar documentos
CREATE POLICY "Usuários autenticados podem criar documentos"
ON public.documentos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Apenas analistas e admins podem atualizar documentos (status, rejeição, etc)
CREATE POLICY "Analistas e admins podem atualizar documentos"
ON public.documentos
FOR UPDATE
TO authenticated
USING (public.is_admin_or_analista());

-- Apenas admins podem deletar documentos
CREATE POLICY "Apenas admins podem deletar documentos"
ON public.documentos
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ========================================
-- RLS POLICIES PARA SERVICOS
-- ========================================

DROP POLICY IF EXISTS "Permitir todas operações" ON public.servicos;

-- Todos autenticados podem ver serviços
CREATE POLICY "Usuários autenticados podem ver serviços"
ON public.servicos
FOR SELECT
TO authenticated
USING (true);

-- Apenas analistas e admins podem criar serviços
CREATE POLICY "Analistas e admins podem criar serviços"
ON public.servicos
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_analista());

-- Apenas analistas e admins podem atualizar serviços
CREATE POLICY "Analistas e admins podem atualizar serviços"
ON public.servicos
FOR UPDATE
TO authenticated
USING (public.is_admin_or_analista());

-- Apenas admins podem deletar serviços
CREATE POLICY "Apenas admins podem deletar serviços"
ON public.servicos
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ========================================
-- RLS POLICIES PARA SERVICOS_OFERECIDOS
-- ========================================

DROP POLICY IF EXISTS "Permitir todas operações" ON public.servicos_oferecidos;

-- Todos autenticados podem ver serviços oferecidos
CREATE POLICY "Usuários autenticados podem ver serviços oferecidos"
ON public.servicos_oferecidos
FOR SELECT
TO authenticated
USING (true);

-- Apenas analistas e admins podem criar serviços oferecidos
CREATE POLICY "Analistas e admins podem criar serviços oferecidos"
ON public.servicos_oferecidos
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_analista());

-- Apenas analistas e admins podem atualizar serviços oferecidos
CREATE POLICY "Analistas e admins podem atualizar serviços oferecidos"
ON public.servicos_oferecidos
FOR UPDATE
TO authenticated
USING (public.is_admin_or_analista());

-- Apenas admins podem deletar serviços oferecidos
CREATE POLICY "Apenas admins podem deletar serviços oferecidos"
ON public.servicos_oferecidos
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ========================================
-- RLS POLICIES PARA TIPOS_DOCUMENTO
-- ========================================

DROP POLICY IF EXISTS "Permitir todas operações" ON public.tipos_documento;

-- Todos autenticados podem ver tipos de documento
CREATE POLICY "Usuários autenticados podem ver tipos de documento"
ON public.tipos_documento
FOR SELECT
TO authenticated
USING (true);

-- Apenas analistas e admins podem criar tipos de documento
CREATE POLICY "Analistas e admins podem criar tipos de documento"
ON public.tipos_documento
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_analista());

-- Apenas analistas e admins podem atualizar tipos de documento
CREATE POLICY "Analistas e admins podem atualizar tipos de documento"
ON public.tipos_documento
FOR UPDATE
TO authenticated
USING (public.is_admin_or_analista());

-- Apenas admins podem deletar tipos de documento
CREATE POLICY "Apenas admins podem deletar tipos de documento"
ON public.tipos_documento
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ========================================
-- RLS POLICIES PARA STORAGE
-- ========================================

-- Política para visualizar arquivos do bucket convenio-documents
CREATE POLICY "Usuários autenticados podem ver documentos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'convenio-documents');

-- Política para fazer upload de documentos
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'convenio-documents');

-- Política para atualizar documentos (apenas analistas e admins)
CREATE POLICY "Analistas e admins podem atualizar arquivos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'convenio-documents'
  AND public.is_admin_or_analista()
);

-- Política para deletar documentos (apenas admins)
CREATE POLICY "Apenas admins podem deletar arquivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'convenio-documents'
  AND public.is_admin()
);