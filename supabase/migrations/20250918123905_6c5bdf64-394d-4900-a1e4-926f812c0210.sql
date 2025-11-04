-- Adicionar coluna para categoria do documento
ALTER TABLE public.documentos 
ADD COLUMN categoria_documento text;

-- Adicionar índice para melhor performance
CREATE INDEX idx_documentos_categoria ON public.documentos(categoria_documento);

-- Função para categorizar automaticamente o documento
CREATE OR REPLACE FUNCTION public.categorizar_documento(nome_arquivo text, tipo_arquivo text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    -- Converter nome para minúsculo para comparação
    nome_arquivo := lower(nome_arquivo);
    
    -- Categorizar baseado no nome do arquivo
    IF nome_arquivo LIKE '%contrato%' OR nome_arquivo LIKE '%contract%' THEN
        RETURN 'Contrato Social';
    ELSIF nome_arquivo LIKE '%cnpj%' OR nome_arquivo LIKE '%receita%' THEN
        RETURN 'Cartão CNPJ';
    ELSIF nome_arquivo LIKE '%rg%' OR nome_arquivo LIKE '%identidade%' THEN
        RETURN 'RG - Documento de Identidade';
    ELSIF nome_arquivo LIKE '%cpf%' THEN
        RETURN 'CPF - Cadastro de Pessoa Física';
    ELSIF nome_arquivo LIKE '%comprovante%' AND nome_arquivo LIKE '%endereco%' THEN
        RETURN 'Comprovante de Endereço';
    ELSIF nome_arquivo LIKE '%alvara%' OR nome_arquivo LIKE '%licenca%' THEN
        RETURN 'Alvará de Funcionamento';
    ELSIF nome_arquivo LIKE '%estatuto%' THEN
        RETURN 'Estatuto Social';
    ELSIF nome_arquivo LIKE '%ata%' THEN
        RETURN 'Ata de Reunião';
    ELSIF nome_arquivo LIKE '%procuracao%' THEN
        RETURN 'Procuração';
    ELSIF nome_arquivo LIKE '%certidao%' THEN
        RETURN 'Certidão';
    ELSIF tipo_arquivo LIKE '%pdf%' THEN
        RETURN 'Documento PDF';
    ELSIF tipo_arquivo LIKE '%image%' THEN
        RETURN 'Documento Digitalizado';
    ELSE
        RETURN 'Documento Não Categorizado';
    END IF;
END;
$$;

-- Trigger para categorizar automaticamente quando um documento é inserido
CREATE OR REPLACE FUNCTION public.trigger_categorizar_documento()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.categoria_documento := public.categorizar_documento(NEW.nome_arquivo, NEW.tipo_arquivo);
    RETURN NEW;
END;
$$;

-- Criar o trigger
DROP TRIGGER IF EXISTS categorizar_documento_trigger ON public.documentos;
CREATE TRIGGER categorizar_documento_trigger
    BEFORE INSERT OR UPDATE ON public.documentos
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_categorizar_documento();

-- Atualizar documentos existentes com suas categorias
UPDATE public.documentos 
SET categoria_documento = public.categorizar_documento(nome_arquivo, tipo_arquivo)
WHERE categoria_documento IS NULL;