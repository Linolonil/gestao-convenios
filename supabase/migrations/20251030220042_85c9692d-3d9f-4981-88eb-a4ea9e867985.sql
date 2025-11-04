-- Criar tabela servicos_oferecidos (classe associativa entre Contrato e Servico)
CREATE TABLE public.servicos_oferecidos (
  id_servico_oferecido SERIAL PRIMARY KEY,
  id_contrato INTEGER NOT NULL REFERENCES public.contratos(id_contrato) ON DELETE CASCADE,
  id_servico INTEGER NOT NULL REFERENCES public.servicos(id_servico) ON DELETE CASCADE,
  desconto_concedido DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_servicos_oferecidos_contrato ON public.servicos_oferecidos(id_contrato);
CREATE INDEX idx_servicos_oferecidos_servico ON public.servicos_oferecidos(id_servico);

-- Garantir que um mesmo serviço não seja adicionado duas vezes ao mesmo contrato
CREATE UNIQUE INDEX idx_servicos_oferecidos_unique ON public.servicos_oferecidos(id_contrato, id_servico);

-- Habilitar Row Level Security
ALTER TABLE public.servicos_oferecidos ENABLE ROW LEVEL SECURITY;

-- Criar policy para permitir todas operações (seguindo padrão das outras tabelas)
CREATE POLICY "Permitir todas operações" 
ON public.servicos_oferecidos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_servicos_oferecidos_updated_at
BEFORE UPDATE ON public.servicos_oferecidos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.servicos_oferecidos IS 'Classe associativa entre Contratos e Serviços, armazena os serviços oferecidos em cada contrato';
COMMENT ON COLUMN public.servicos_oferecidos.desconto_concedido IS 'Desconto percentual concedido para este serviço específico no contrato';