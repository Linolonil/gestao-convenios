-- Add status and rejection fields to documentos table
ALTER TABLE public.documentos 
ADD COLUMN status text DEFAULT 'pendente' NOT NULL,
ADD COLUMN motivo_rejeicao text,
ADD COLUMN rejeitado_em timestamp with time zone;

-- Add rejection fields to convenios table  
ALTER TABLE public.convenios
ADD COLUMN documento_rejeitado_id uuid REFERENCES public.documentos(id),
ADD COLUMN motivo_rejeicao text,
ADD COLUMN rejeitado_em timestamp with time zone;

-- Create index for better performance
CREATE INDEX idx_documentos_status ON public.documentos(status);
CREATE INDEX idx_convenios_documento_rejeitado ON public.convenios(documento_rejeitado_id);