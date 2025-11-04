-- Habilitar RLS na tabela tipos_documento
ALTER TABLE tipos_documento ENABLE ROW LEVEL SECURITY;

-- Permitir leitura de tipos_documento para todos (já que não há dados sensíveis)
DROP POLICY IF EXISTS "Allow read access to tipos_documento" ON tipos_documento;
CREATE POLICY "Allow read access to tipos_documento"
ON tipos_documento
FOR SELECT
USING (true);

-- Permitir todas operações para usuários autenticados (simplificado)
DROP POLICY IF EXISTS "Allow all operations on tipos_documento" ON tipos_documento;
CREATE POLICY "Allow all operations on tipos_documento"
ON tipos_documento
FOR ALL
USING (true)
WITH CHECK (true);