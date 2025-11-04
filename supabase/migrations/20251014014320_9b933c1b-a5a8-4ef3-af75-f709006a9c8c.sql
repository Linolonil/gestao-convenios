-- Migração de UUID para INTEGER (SERIAL)
-- IMPORTANTE: Esta migração vai recriar as tabelas, todos os dados serão perdidos
-- Se houver dados importantes, faça backup antes

-- 1. Dropar tabelas dependentes primeiro (ordem reversa de dependências)
DROP TABLE IF EXISTS public.historico_status CASCADE;
DROP TABLE IF EXISTS public.documentos CASCADE;
DROP TABLE IF EXISTS public.convenios CASCADE;
DROP TABLE IF EXISTS public.parceiros CASCADE;

-- 2. Recriar tabela parceiros com INTEGER
CREATE TABLE public.parceiros (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL UNIQUE,
  area_atuacao TEXT,
  email TEXT,
  telefone TEXT,
  observacoes TEXT,
  endereco_completo JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Recriar tabela convenios com INTEGER
CREATE TABLE public.convenios (
  id SERIAL PRIMARY KEY,
  parceiro_id INTEGER NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  tipo_convenio TEXT NOT NULL,
  descricao TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  validade DATE,
  motivo_rejeicao TEXT,
  rejeitado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Recriar tabela documentos com INTEGER
CREATE TABLE public.documentos (
  id SERIAL PRIMARY KEY,
  convenio_id INTEGER NOT NULL REFERENCES public.convenios(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  url_arquivo TEXT NOT NULL,
  categoria_documento TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  motivo_rejeicao TEXT,
  rejeitado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Recriar tabela historico_status com INTEGER
CREATE TABLE public.historico_status (
  id SERIAL PRIMARY KEY,
  entidade_id INTEGER NOT NULL,
  tipo_entidade TEXT NOT NULL,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  motivo TEXT,
  data_mudanca TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Recriar índices
CREATE INDEX idx_convenios_parceiro_id ON public.convenios(parceiro_id);
CREATE INDEX idx_documentos_convenio_id ON public.documentos(convenio_id);
CREATE INDEX idx_historico_entidade ON public.historico_status(entidade_id, tipo_entidade);

-- 7. Habilitar RLS em todas as tabelas
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_status ENABLE ROW LEVEL SECURITY;

-- 8. Recriar políticas RLS (permitir tudo por enquanto)
CREATE POLICY "Allow all operations on parceiros" ON public.parceiros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on convenios" ON public.convenios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on documentos" ON public.documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on historico_status" ON public.historico_status FOR ALL USING (true) WITH CHECK (true);

-- 9. Recriar triggers para updated_at
CREATE TRIGGER update_parceiros_updated_at
  BEFORE UPDATE ON public.parceiros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_convenios_updated_at
  BEFORE UPDATE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Recriar triggers para categorização de documentos
CREATE TRIGGER trigger_categorizar_documento
  BEFORE INSERT OR UPDATE ON public.documentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_categorizar_documento();

-- 11. Recriar triggers para histórico de status
CREATE TRIGGER trigger_historico_status_convenio
  AFTER UPDATE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_mudanca_status_convenio();

CREATE TRIGGER trigger_historico_status_documento
  AFTER UPDATE ON public.documentos
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_mudanca_status_documento();