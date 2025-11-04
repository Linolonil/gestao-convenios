-- Atualizar categorias dos serviços

-- Categoria: Saúde
UPDATE servicos SET categoria = 'Saúde' WHERE nome IN (
  'Acupuntura', 'Alergologia', 'Anestesiologia', 'Angiologia e Cirurgia Vascular',
  'Cardiologia', 'Cardiologia e Cirurgia Cardiovascular', 'Cardiologista', 'Arritmologia',
  'Cirurgia de Cabeça e Pescoço', 'Cirurgia do Aparelho Digestivo', 'Cirurgia Geral',
  'Cirurgia Oncológica', 'Cirurgia Pediátrica', 'Cirurgia Plástica', 'Cirurgia Torácica',
  'Citopatologia', 'Clínica Médica', 'Clínico Geral', 'Dermatologia',
  'Diagnóstico por Imagem', 'Endocrinologia', 'Metabologia', 'Endoscopia',
  'Equipamentos de Reabilitação', 'Fisioterapia', 'Fonoaudiologia', 'Gastroenterologia',
  'Genética Médica', 'Geriatria', 'Ginecologia', 'Obstetrícia', 'Hematologia',
  'Homeopatia', 'Hiperbárica Preventiva', 'Homecare', 'Infectologia',
  'Laboratórios de Análises Clínicas', 'Massoterapia', 'Mastologia', 'Médico Nuclear',
  'Nefrologia', 'Neurologia', 'Neurocirurgia', 'Neuropediatria', 'Neuropsicologia',
  'Nutrição', 'Odontologia', 'Oftalmologia', 'Oncologia', 'Ortopedia e Traumatologia',
  'Otorrinolaringologia', 'Pediatria', 'Pneumologia', 'Proctologia', 'Psicologia',
  'Psicomotricidade', 'Psicoterapia', 'Psiquiatria', 'Quiropraxia', 'Radiologia',
  'Radioterapia', 'Reumatologia', 'Alergia e Imunologia', 'Terapia', 'Terapia Ocupacional',
  'Urologia', 'Veterinária e Pets', 'Aromaterapia', 'Assistente Terapêutico'
);

-- Categoria: Educação e Desenvolvimento
UPDATE servicos SET categoria = 'Educação e Desenvolvimento' WHERE nome IN (
  'Educação', 'Idiomas', 'Neuropsicopedagogia', 'Psicopedagogia'
);

-- Categoria: Beleza e Bem-Estar
UPDATE servicos SET categoria = 'Beleza e Bem-Estar' WHERE nome IN (
  'Academias', 'Estética', 'Estética e Beleza', 'Pilates'
);

-- Categoria: Serviços Profissionais e Empresariais
UPDATE servicos SET categoria = 'Serviços Profissionais e Empresariais' WHERE nome IN (
  'Arquitetura', 'Assessorias', 'Certificadora Digital', 'Consultorias',
  'Corretora de Imóveis', 'Corretora de Seguros', 'Design Gráfico', 'Web Design',
  'Escritórios Compartilhados', 'Escritórios Virtuais', 'Perito',
  'Serviços Contábeis', 'Serviços de Segurança', 'Serviços Funerários',
  'Software Jurídico', 'Segurança'
);

-- Categoria: Comércio e Varejo
UPDATE servicos SET categoria = 'Comércio e Varejo' WHERE nome IN (
  'Calçados', 'Farmácias e Drogarias', 'Floricultura', 'Jóias e Semijoias',
  'Livrarias', 'Móveis Planejados', 'Ótica', 'Vestuário'
);

-- Categoria: Serviços Gerais e Consumo
UPDATE servicos SET categoria = 'Serviços Gerais e Consumo' WHERE nome IN (
  'Auto Escola', 'Cultura e Lazer', 'Eventos', 'Hotelaria', 'Lava-Jato',
  'Lavanderia', 'Locadora', 'Manutenção e Acessórios de Comunicação',
  'Produção Cinematográfica', 'Restaurantes e Docerias', 'Serviços Alimentícios',
  'Serviços Automotivos', 'Serviços de Limpeza', 'Serviços de Manutenção',
  'Turismo e Viagem'
);

-- Categoria: Tecnologia
UPDATE servicos SET categoria = 'Tecnologia' WHERE nome IN (
  'Informática'
);