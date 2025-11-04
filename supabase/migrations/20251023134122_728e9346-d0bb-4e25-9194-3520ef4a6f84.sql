-- Remover o check constraint antigo
ALTER TABLE convenios DROP CONSTRAINT IF EXISTS convenios_status_check;

-- Criar novo check constraint com todos os status (antigos + novos)
ALTER TABLE convenios ADD CONSTRAINT convenios_status_check 
CHECK (status = ANY (ARRAY[
  'PROVISORIO'::text,
  'NEGOCIACAO'::text, 
  'ATIVA'::text,
  'RENOVACAO'::text,
  'ENCERRADA'::text,
  'AGUARDANDO_DOCUMENTOS'::text,
  'EM_ANALISE'::text,
  'AGUARDANDO_CORRECOES'::text,
  'APROVADO'::text,
  'REJEITADO'::text
]));