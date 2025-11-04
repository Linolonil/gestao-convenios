-- Ajuste de segurança: definir search_path nas funções criadas
CREATE OR REPLACE FUNCTION public.categorizar_documento(nome_arquivo text, tipo_arquivo text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    nome_arquivo := lower(nome_arquivo);
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

CREATE OR REPLACE FUNCTION public.trigger_categorizar_documento()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.categoria_documento := public.categorizar_documento(NEW.nome_arquivo, NEW.tipo_arquivo);
    RETURN NEW;
END;
$$;