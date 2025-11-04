-- Create convenios table
CREATE TABLE public.convenios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_empresa TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  tipo_convenio TEXT NOT NULL,
  descricao TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'analise', 'ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documentos table for file uploads
CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  convenio_id UUID NOT NULL REFERENCES public.convenios(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  url_arquivo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Create policies for convenios
CREATE POLICY "Allow all operations on convenios" 
ON public.convenios 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create policies for documentos
CREATE POLICY "Allow all operations on documentos" 
ON public.documentos 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_convenios_updated_at
BEFORE UPDATE ON public.convenios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('convenio-documents', 'convenio-documents', false);

-- Create storage policies
CREATE POLICY "Allow all operations on convenio documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'convenio-documents');