-- Check current constraint on convenios status
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.convenios'::regclass 
AND contype = 'c';

-- Drop existing check constraint if it exists
ALTER TABLE public.convenios DROP CONSTRAINT IF EXISTS convenios_status_check;

-- Add new check constraint with 'rejeitado' status
ALTER TABLE public.convenios 
ADD CONSTRAINT convenios_status_check 
CHECK (status IN ('pendente', 'analise', 'ativo', 'rejeitado', 'inativo'));