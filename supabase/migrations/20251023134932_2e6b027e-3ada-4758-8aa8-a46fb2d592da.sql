-- Habilitar RLS nas tabelas de serviços
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE convenio_servicos ENABLE ROW LEVEL SECURITY;

-- Políticas para servicos - permitir leitura e escrita para todos autenticados
DROP POLICY IF EXISTS "Allow all operations on servicos" ON servicos;
CREATE POLICY "Allow all operations on servicos"
ON servicos
FOR ALL
USING (true)
WITH CHECK (true);

-- Políticas para convenio_servicos - permitir leitura e escrita para todos autenticados
DROP POLICY IF EXISTS "Allow all operations on convenio_servicos" ON convenio_servicos;
CREATE POLICY "Allow all operations on convenio_servicos"
ON convenio_servicos
FOR ALL
USING (true)
WITH CHECK (true);