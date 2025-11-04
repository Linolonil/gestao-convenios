-- Adicionar constraint única no nome (ignorar erro se já existir)
DO $$ 
BEGIN
  ALTER TABLE tipos_documento ADD CONSTRAINT tipos_documento_nome_key UNIQUE (nome);
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN duplicate_object THEN NULL;
END $$;

-- Inserir tipos de documentos fixos básicos (ignorar se já existir)
INSERT INTO tipos_documento (nome, descricao, obrigatorio)
SELECT * FROM (VALUES
  ('Carta Proposta', 'Carta de proposta de convênio', true),
  ('Alvará de funcionamento', 'Alvará de funcionamento do estabelecimento', true),
  ('Comprovante de Endereço', 'Comprovante de endereço atualizado', true),
  ('Documento de Identificação do profissional', 'RG ou CNH do profissional responsável', true),
  ('Currículo profissional', 'Currículo do profissional', false),
  ('Logomarca', 'Logomarca do estabelecimento', false),
  ('Licença sanitária', 'Licença sanitária vigente', true),
  ('Carteira do Conselho e Registro no RQE', 'Carteira do conselho profissional e RQE', true),
  ('Diploma de Especialidade Profissional', 'Diploma de especialização', false),
  ('CNPJ', 'Comprovante de CNPJ', true),
  ('Contrato Social', 'Contrato social da empresa', true),
  ('Documento de Identificação do representante legal', 'RG ou CNH do representante legal', true),
  ('Liberação Corpo de Bombeiro', 'Certificado de liberação do corpo de bombeiros', true),
  ('Autorização do CME', 'Autorização do Conselho Municipal de Educação', false),
  ('Nada consta de conduta ética profissional - CRM', 'Certidão de nada consta ético do CRM', true),
  ('Carteira CRM-AM e registro de especialidade', 'Carteira CRM-AM com registro de especialidade', true)
) AS v(nome, descricao, obrigatorio)
WHERE NOT EXISTS (
  SELECT 1 FROM tipos_documento WHERE tipos_documento.nome = v.nome
);