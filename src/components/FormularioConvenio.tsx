import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FormularioDadosParceiroValidado } from './convenio/FormularioDadosParceiroValidado';
import { FormularioServicos } from './convenio/FormularioServicos';
import { FormularioDocumentos } from './convenio/FormularioDocumentos';
import { parceiroDadosSchema } from '@/lib/validations/parceiro';
import { servicosArraySchema } from '@/lib/validations/servico';

interface ConvenioFormProps {
  convenioId?: number;
}

const FormularioConvenio = ({ convenioId }: ConvenioFormProps) => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<'fisica' | 'juridica'>('juridica');
  const [segmento, setSegmento] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [servicos, setServicos] = useState<Array<{nome: string; desconto: number}>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    loadCategorias();
    if (convenioId) {
      loadConvenioData();
    }
  }, [convenioId]);

  const loadCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('categoria')
        .not('categoria', 'is', null);

      if (error) throw error;

      // Extrair categorias únicas e ordenar
      const categoriasUnicas = [...new Set(data.map(s => s.categoria))]
        .filter(Boolean)
        .sort();
      
      setCategorias(categoriasUnicas as string[]);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro ao carregar categorias",
        variant: "destructive"
      });
    }
  };

  const loadConvenioData = async () => {
    setLoading(true);
    try {
      const { data: convenio, error } = await supabase
        .from('contratos')
        .select(`
          *,
          parceiros(*)
        `)
        .eq('id_contrato', convenioId)
        .single();

      if (error) throw error;

      if (convenio) {
        const parceiro = convenio.parceiros;
        
        setTipoPessoa(parceiro.tipo_pessoa === 'juridica' ? 'juridica' : 'fisica');
        
        setSegmento(parceiro.tipo_pessoa || 'Outros Serviços');

        setFormData({
          cnpj: parceiro.cnpj || '',
          cpf: parceiro.cpf || '',
          razaoSocial: parceiro.razao_social || '',
          nomeFantasia: parceiro.nome_fantasia || parceiro.nome || '',
          responsavel: parceiro.responsavel || '',
          emailContato: parceiro.email || '',
          telefoneContato: parceiro.telefone || '',
          enderecoComercial: parceiro.endereco || '',
          dataNascimento: parceiro.data_nascimento || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar convênio:', error);
      toast({
        title: "Erro ao carregar convênio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (tipoDocumentoId: number, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [tipoDocumentoId]: file }));
    toast({ title: `${file.name} selecionado` });
  };

  const adicionarServico = (nome: string, desconto: number = 0) => {
    if (!servicos.find(s => s.nome === nome)) {
      setServicos(prev => [...prev, { nome, desconto }]);
    }
  };

  const removerServico = (index: number) => {
    setServicos(prev => prev.filter((_, i) => i !== index));
  };

  const atualizarDescontoServico = (index: number, desconto: number) => {
    setServicos(prev => prev.map((s, i) => i === index ? { ...s, desconto } : s));
  };

  const validarEtapa1 = () => {
    if (!segmento) {
      toast({ title: "Selecione o segmento", variant: "destructive" });
      return false;
    }

    // Validar com Zod
    const dadosParceiro = {
      tipoPessoa,
      ...(tipoPessoa === 'juridica' ? {
        cnpj: formData.cnpj || '',
        razaoSocial: formData.razaoSocial,
        nomeFantasia: formData.nomeFantasia || '',
        responsavel: formData.responsavel,
      } : {
        cpf: formData.cpf || '',
        nomeFantasia: formData.nomeFantasia || '',
        dataNascimento: formData.dataNascimento,
      }),
      emailContato: formData.emailContato || '',
      telefoneContato: formData.telefoneContato || '',
      enderecoComercial: formData.enderecoComercial || '',
    };

    const result = parceiroDadosSchema.safeParse(dadosParceiro);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({ 
        title: "Erro de validação", 
        description: firstError.message,
        variant: "destructive" 
      });
      return false;
    }

    return true;
  };

  const validarEtapa2 = () => {
    const result = servicosArraySchema.safeParse(servicos);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({ 
        title: "Erro de validação", 
        description: firstError.message,
        variant: "destructive" 
      });
      return false;
    }
    return true;
  };

  const avancarEtapa = () => {
    if (currentStep === 1 && !validarEtapa1()) return;
    if (currentStep === 2 && !validarEtapa2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const voltarEtapa = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    
    try {
      const cnpjCpf = tipoPessoa === 'juridica' ? formData.cnpj : formData.cpf;
      
      // Buscar ou criar parceiro
      let parceiro;
      const campoDocumento = tipoPessoa === 'juridica' ? 'cnpj' : 'cpf';
      const { data: parceiroExistente } = await supabase
        .from('parceiros')
        .select('*')
        .eq(campoDocumento, cnpjCpf)
        .maybeSingle();

      if (parceiroExistente) {
        parceiro = parceiroExistente;
      } else {
        // Inserir parceiro diretamente
        const parceiroInsert: any = {
          nome: formData.nomeFantasia,
          tipo_pessoa: (tipoPessoa || '').toUpperCase(),
          email: formData.emailContato,
          telefone: formData.telefoneContato,
          endereco: formData.enderecoComercial || null,
        };

        if (tipoPessoa === 'juridica') {
          parceiroInsert.cnpj = formData.cnpj;
          parceiroInsert.razao_social = formData.razaoSocial || null;
          parceiroInsert.nome_fantasia = formData.nomeFantasia || null;
          parceiroInsert.responsavel = formData.responsavel || null;
        } else {
          parceiroInsert.cpf = formData.cpf;
          parceiroInsert.data_nascimento = formData.dataNascimento || null;
        }

        const { data: novoParceiro, error: parceiroError } = await supabase
          .from('parceiros')
          .insert(parceiroInsert)
          .select()
          .single();

        if (parceiroError) {
          if (parceiroError.code === '23505') {
            const { data: existente } = await supabase
              .from('parceiros')
              .select('*')
              .eq(campoDocumento, cnpjCpf)
              .maybeSingle();
            if (existente) {
              parceiro = existente;
            } else {
              throw parceiroError;
            }
          } else {
            throw parceiroError;
          }
        } else {
          parceiro = novoParceiro;
          toast({ title: "Parceiro cadastrado" });
        }
      }
      
      // Criar contrato
      const contratoData: any = {
        id_parceiro: parceiro.id_parceiro,
        id_usuario: usuario?.id || 1,
        status: 'EM_ANALISE' as const,
        numero: formData.numeroContrato || null
      };

      const { data: contrato, error: contratoError } = await supabase
        .from('contratos')
        .insert([contratoData])
        .select()
        .single();

      if (contratoError) throw contratoError;

      // Salvar serviços oferecidos no contrato (em paralelo)
      await Promise.all(servicos.map(async (servico) => {
        // Buscar ou criar serviço genérico
        let { data: servicoExistente } = await supabase
          .from('servicos')
          .select('id_servico')
          .eq('nome', servico.nome)
          .maybeSingle();

        let idServico: number;

        if (!servicoExistente) {
          // Criar novo serviço genérico
          const { data: novoServico, error: servicoError } = await supabase
            .from('servicos')
            .insert({
              nome: servico.nome,
              descricao: servico.nome,
              categoria: segmento
            })
            .select('id_servico')
            .single();

          if (servicoError) throw servicoError;
          idServico = novoServico.id_servico;
        } else {
          idServico = servicoExistente.id_servico;
        }

        // Criar relacionamento na tabela servicos_oferecidos com desconto específico
        const { error: servicoOferecidoError } = await supabase
          .from('servicos_oferecidos')
          .insert({
            id_contrato: contrato.id_contrato,
            id_servico: idServico,
            desconto_concedido: servico.desconto || 0
          });

        if (servicoOferecidoError) throw servicoOferecidoError;
      }));

      // Upload e salvamento de documentos (em paralelo)
      await Promise.all(
        Object.entries(uploadedFiles).map(async ([tipoDocumentoId, file]) => {
          try {
            const sanitizedFileName = file.name
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-zA-Z0-9._-]/g, '_');
            
            const fileName = `${contrato.id_contrato}/${tipoDocumentoId}_${Date.now()}_${sanitizedFileName}`;
            
            const { error: uploadError } = await supabase.storage
              .from('convenio-documents')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Erro ao fazer upload:', uploadError);
              return;
            }

            // Salvar documento
            const { error: docError } = await supabase
              .from('documentos')
              .insert({
                id_contrato: contrato.id_contrato,
                id_tipo_documento: parseInt(tipoDocumentoId),
                nome: file.name,
                caminho_arquivo: fileName,
                status: 'pendente'
              });

            if (docError) {
              console.error('Erro ao salvar documento:', docError);
            }
          } catch (err) {
            console.error('Erro no processamento do documento:', err);
          }
        })
      );

      toast({ title: "Convênio cadastrado com sucesso!" });
      navigate('/convenios');

    } catch (error: any) {
      console.error('Erro ao cadastrar convênio:', error);
      const msg = error?.message || error?.details || error?.hint || 'Erro desconhecido';
      toast({
        title: "Erro ao cadastrar",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && convenioId) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>
            {convenioId ? 'Editar Convênio' : 'Novo Convênio'}
          </CardTitle>
          
          {/* Indicador de Etapas */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className={`text-sm ${currentStep >= 1 ? 'font-medium' : 'text-muted-foreground'}`}>
                Dados do Parceiro
              </span>
            </div>
            
            <div className={`h-px w-12 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <span className={`text-sm ${currentStep >= 2 ? 'font-medium' : 'text-muted-foreground'}`}>
                Serviços
              </span>
            </div>
            
            <div className={`h-px w-12 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <span className={`text-sm ${currentStep >= 3 ? 'font-medium' : 'text-muted-foreground'}`}>
                Documentos
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Etapa 1: Dados do Parceiro */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Segmento *</Label>
                    <Select value={segmento} onValueChange={setSegmento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <FormularioDadosParceiroValidado
                  tipoPessoa={tipoPessoa}
                  formData={formData}
                  onChange={handleInputChange}
                  onTipoPessoaChange={setTipoPessoa}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/convenios')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={avancarEtapa}
                  >
                    Próximo: Serviços
                  </Button>
                </div>
              </div>
            )}

            {/* Etapa 2: Serviços */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <FormularioServicos
                  servicos={servicos}
                  onAdd={adicionarServico}
                  onRemove={removerServico}
                  onUpdateDesconto={atualizarDescontoServico}
                  categoria={segmento}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={voltarEtapa}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={avancarEtapa}
                  >
                    Próximo: Documentos
                  </Button>
                </div>
              </div>
            )}

            {/* Etapa 3: Documentos */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <FormularioDocumentos
                  uploadedFiles={uploadedFiles}
                  onFileUpload={handleFileUpload}
                />

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={voltarEtapa}
                  >
                    Voltar
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/convenios')}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : convenioId ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormularioConvenio;