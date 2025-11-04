-- Adicionar coluna parceiro_id na tabela convenios
ALTER TABLE public.convenios
ADD COLUMN parceiro_id UUID;

-- Migrar dados existentes: criar parceiros para convênios existentes que tenham CNPJ/CPF
DO $$
DECLARE
  convenio_record RECORD;
  novo_parceiro_id UUID;
BEGIN
  FOR convenio_record IN 
    SELECT id, nome_empresa, cnpj, razao_social, endereco, cidade, estado, cep, telefone, email
    FROM public.convenios
    WHERE cnpj IS NOT NULL AND cnpj != ''
  LOOP
    -- Verificar se já existe um parceiro com este CNPJ
    SELECT id INTO novo_parceiro_id
    FROM public.parceiros
    WHERE cpf_cnpj = convenio_record.cnpj
    LIMIT 1;
    
    -- Se não existir, criar novo parceiro
    IF novo_parceiro_id IS NULL THEN
      INSERT INTO public.parceiros (
        nome,
        cpf_cnpj,
        endereco,
        cidade,
        estado,
        cep,
        telefone,
        email
      ) VALUES (
        COALESCE(convenio_record.razao_social, convenio_record.nome_empresa),
        convenio_record.cnpj,
        convenio_record.endereco,
        convenio_record.cidade,
        convenio_record.estado,
        convenio_record.cep,
        convenio_record.telefone,
        convenio_record.email
      )
      RETURNING id INTO novo_parceiro_id;
    END IF;
    
    -- Atualizar o convênio com o parceiro_id
    UPDATE public.convenios
    SET parceiro_id = novo_parceiro_id
    WHERE id = convenio_record.id;
  END LOOP;
END $$;

-- Tornar parceiro_id obrigatório
ALTER TABLE public.convenios
ALTER COLUMN parceiro_id SET NOT NULL;

-- Criar chave estrangeira
ALTER TABLE public.convenios
ADD CONSTRAINT fk_convenios_parceiro
FOREIGN KEY (parceiro_id)
REFERENCES public.parceiros(id)
ON DELETE RESTRICT;

-- Criar índice para melhorar performance das consultas
CREATE INDEX idx_convenios_parceiro_id ON public.convenios(parceiro_id);

-- Remover colunas duplicadas da tabela convenios
ALTER TABLE public.convenios
DROP COLUMN nome_empresa,
DROP COLUMN cnpj,
DROP COLUMN razao_social,
DROP COLUMN endereco,
DROP COLUMN cidade,
DROP COLUMN estado,
DROP COLUMN cep,
DROP COLUMN telefone,
DROP COLUMN email;